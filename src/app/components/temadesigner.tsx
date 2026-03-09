

"use client";
/**
 * TemaDesigner v8
 * - Save, Save As, Load, Attach to Job functionality
 * - Plug tool for marking tubes
 * - Dialogs for managing designs and jobs
 * - Firebase integration for saving and loading designs
 */
import { useState, useRef, useEffect, useCallback, useMemo, memo } from "react";
import {
  generateTEMALayout, recalcRowsCols,
  toCSV, toJSON, toDXF, passColor, rowColor,
  TEMA_TUBE_ODS, PITCH_RATIOS, PITCH_PATTERNS,
  type TEMAConfig, type TEMALayout, type LayoutTube, type PitchPattern, type ShapeType, type ShellShape, type TemaDesign, type Job
} from "@/lib/tema";
import { Maximize, Minimize, Save, FolderOpen, Link2, Eraser } from "lucide-react";
import { useFirebase, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, where, addDoc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:"#f8fafc", panel:"#ffffff", border:"#e2e8f0", border2:"#cbd5e1",
  text:"#0f172a", text2:"#475569", text3:"#94a3b8",
  accent:"#2563eb", accentL:"#eff6ff", accentM:"#bfdbfe",
  success:"#16a34a", danger:"#dc2626", warn:"#d97706", warnL:"#fffbeb",
  canvas:"#f1f5f9", ruler:"#64748b",
};
const F  = "'Noto Sans','Segoe UI',system-ui,sans-serif";
const FM = "'Noto Sans Mono','JetBrains Mono',monospace";
const MARGIN_LEFT = 38;
const MARGIN_TOP  = 38;

// ── Tiny UI helpers ───────────────────────────────────────────────────────────
const Btn = memo(({ children, onClick, variant="default", size="sm", disabled, title }:{
  children:React.ReactNode; onClick?:(e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?:"default"|"primary"|"danger"|"ghost"|"warn"; size?:"xs"|"sm"|"md";
  disabled?:boolean; title?:string;
}) => {
  const szMap:{[k:string]:{fs:number,p:string}}={xs:{fs:10,p:'2px 7px'},sm:{fs:12,p:'4px 10px'},md:{fs:13,p:'6px 14px'}};
  const sz=szMap[size]??szMap.sm;
  const v:Record<string,React.CSSProperties>={
    default:{background:C.panel,border:`1px solid ${C.border2}`,color:C.text2},
    primary:{background:C.accent,border:`1px solid ${C.accent}`,color:"#fff"},
    danger: {background:"#fff",  border:`1px solid ${C.danger}`, color:C.danger},
    ghost:  {background:"transparent",border:"1px solid transparent",color:C.text2},
    warn:   {background:C.warnL, border:`1px solid ${C.warn}`,   color:C.warn},
  };
  return <button onClick={onClick} disabled={disabled} title={title}
    style={{fontFamily:F,fontWeight:600,borderRadius:5,cursor:disabled?"not-allowed":"pointer",
      fontSize:sz.fs,padding:sz.p,opacity:disabled?.45:1,transition:"all 0.1s",
      whiteSpace:"nowrap",...v[variant]}}>{children}</button>;
});
Btn.displayName="Btn";

const Divider=({label}:{label?:string})=>(
  <div style={{display:"flex",alignItems:"center",gap:6,margin:"8px 0"}}>
    <div style={{flex:1,height:1,background:C.border}}/>
    {label&&<span style={{fontFamily:F,fontSize:10,color:C.text3,whiteSpace:"nowrap"}}>{label}</span>}
    <div style={{flex:1,height:1,background:C.border}}/>
  </div>
);
const Chip=({label,active,onClick,color=C.accent}:{label:string;active:boolean;onClick:()=>void;color?:string;[k:string]:any})=>(
  <button onClick={onClick} style={{fontFamily:F,fontSize:11,fontWeight:600,padding:"3px 9px",
    borderRadius:4,cursor:"pointer",transition:"all 0.1s",whiteSpace:"nowrap",
    background:active?color:C.panel,color:active?"#fff":C.text2,
    border:`1px solid ${active?color:C.border2}`}}>{label}</button>
);
function NumIn({value,onChange,min,max,step,unit, fontScale=1}:{value:number;onChange:(n:number)=>void;min?:number;max?:number;step?:number;unit?:string, fontScale?: number}){
  return <div style={{display:"flex",alignItems:"center",gap:4}}>
    <input type="number" value={value} min={min} max={max} step={step??1}
      onChange={e=>{const v=parseFloat(e.target.value);if(!isNaN(v))onChange(v);}}
      style={{fontFamily:FM,fontSize:12 * fontScale,padding:"4px 7px",border:`1px solid ${C.border2}`,
        borderRadius:4,width:70,outline:"none",color:C.text,background:C.panel}}/>
    {unit&&<span style={{fontFamily:F,fontSize:11 * fontScale,color:C.text3}}>{unit}</span>}
  </div>;
}
function Spinner(){return <div style={{width:22,height:22,border:`2px solid ${C.border}`,
  borderTopColor:C.accent,borderRadius:"50%",animation:"td-spin 0.65s linear infinite",flexShrink:0}}/>;}

// ── Default config ────────────────────────────────────────────────────────────
const DEFAULT:TEMAConfig={tubeOdIn:0.75,pitchRatio:1.25,pattern:"triangular",numPasses:1,
  shape:{type:"circle",diameterMm:304.8}};

// ── Undo/redo helpers ─────────────────────────────────────────────────────────
function useHistory<T>(initial: T): {
  state: T;
  set: (v: T) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
} {
  const [history, setHistory] = useState<{ stack: T[]; index: number }>({ stack: [initial], index: 0 });

  const set = useCallback((value: T) => {
    setHistory(prev => {
      const newStack = prev.stack.slice(0, prev.index + 1);
      newStack.push(value);
      return {
        stack: newStack,
        index: newStack.length - 1
      };
    });
  }, []);

  const undo = useCallback(() => {
    setHistory(prev => {
      if (prev.index > 0) {
        return { ...prev, index: prev.index - 1 };
      }
      return prev;
    });
  }, []);

  const redo = useCallback(() => {
    setHistory(prev => {
      if (prev.index < prev.stack.length - 1) {
        return { ...prev, index: prev.index + 1 };
      }
      return prev;
    });
  }, []);
  
  return {
    state: history.stack[history.index],
    set,
    undo,
    redo,
    canUndo: history.index > 0,
    canRedo: history.index < history.stack.length - 1,
  };
}

// ── Main component ────────────────────────────────────────────────────────────
export default function TemaDesigner({ isTrial }: { isTrial?: boolean }) {
  const [cfg,setCfg]=useState<TEMAConfig>(DEFAULT);
  const [layout,setLayout]=useState<TEMALayout|null>(null);
  const [busy,setBusy]=useState(false);

  // Design metadata
  const [designName, setDesignName] = useState("Untitled Design");
  const [designId, setDesignId] = useState<string | null>(null);

  // Firebase
  const { firestore } = useFirebase();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Tubes with undo/redo
  const {state:tubes,set:setTubes,undo,redo,canUndo,canRedo}=useHistory<LayoutTube[]>([]);

  // Canvas
  const designerRef=useRef<HTMLDivElement>(null);
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const [isFullscreen, setIsFullscreen]=useState(false);

  // pan/zoom stored in refs to avoid stale closures
  const zoomRef=useRef(1); const panRef=useRef({x:0,y:0});
  const [zoom,setZoom]=useState(1); const [pan,setPan]=useState({x:0,y:0});
  useEffect(()=>{zoomRef.current=zoom;},[zoom]);
  useEffect(()=>{panRef.current=pan;},[pan]);

  const panDrag=useRef<{mx:number;my:number;px:number;py:number}|null>(null);
  const selStart=useRef<{wx:number;wy:number}|null>(null);

  // Selection & Tools
  const [selIds,setSelIds]=useState<Set<number>>(new Set());
  const [hoverId,setHoverId]=useState<number|null>(null);
  const [selBox,setSelBox]=useState<{x1:number;y1:number;x2:number;y2:number}|null>(null);
  const [tool,setTool]=useState<"select"|"pan"|"plug">("select");
  const [colorMode, setColorMode] = useState<'mono' | 'pass' | 'row'>('mono');

  // Display toggles
  const [showLabels,setShowLabels]=useState(true);
  const [showDims,setShowDims]=useState(true);
  const [showGrid,setShowGrid]=useState(true);
  const [showShell,setShowShell]=useState(true);
  const [needRecalc,setNeedRecalc]=useState(false);
  const [fontScale, setFontScale] = useState(1);

  // Polygon drawing mode for custom shape
  const [polyMode,setPolyMode]=useState(false);
  const [polyWip,setPolyWip]=useState<{x:number;y:number}[]>([]);
  const polyMousePos=useRef<{x:number;y:number}|null>(null);
  
  // Dialogs
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);

  // ── Data Fetching ──────────────────────────────────────────────────────────
  const designsQuery = useMemoFirebase(() => (firestore && user) ? query(collection(firestore, 'designs'), where('userId', '==', user.uid)) : null, [firestore, user]);
  const { data: savedDesigns, isLoading: isLoadingDesigns } = useCollection<TemaDesign>(designsQuery);

  const jobsQuery = useMemoFirebase(() => (firestore && user) ? query(collection(firestore, 'jobs'), where('userId', '==', user.uid)) : null, [firestore, user]);
  const { data: userJobs, isLoading: isLoadingJobs } = useCollection<Job>(jobsQuery);
  
  // ── Generate & Load ────────────────────────────────────────────────────────
  const applyDesignToCanvas = useCallback((design: TemaDesign | null) => {
    if (!design) return;
    setCfg(design.config);
    setLayout(generateTEMALayout(design.config));
    setTubes(design.tubes);
    setDesignName(design.name);
    setDesignId(design.id);
  }, [setTubes]);

  const generate=useCallback(async(resetView = true)=>{
    setBusy(true); setSelIds(new Set()); setNeedRecalc(false); setPolyMode(false); setPolyWip([]);
    await new Promise(r=>setTimeout(r,16));
    try{
      const L=generateTEMALayout(cfg);
      setLayout(L); setTubes(L.tubes);
      setDesignId(null); setDesignName("Untitled Design");
      if(resetView && canvasRef.current){
        const rect=canvasRef.current.getBoundingClientRect();
        const cw=rect.width-MARGIN_LEFT, ch=rect.height-MARGIN_TOP;
        const br=Math.max(L.bundleDia/2+L.tubeOdMm*3,30);
        const fit=Math.min(cw,ch)*0.42/br;
        const z=Math.max(0.1,Math.min(fit,15));
        zoomRef.current=z; panRef.current={x:MARGIN_LEFT+cw/2,y:MARGIN_TOP+ch/2};
        setZoom(z); setPan({x:MARGIN_LEFT+cw/2,y:MARGIN_TOP+ch/2});
      }
    }finally{setBusy(false);}
  },[cfg, setTubes]);
  
  useEffect(() => {
    const designIdFromUrl = searchParams.get('designId');
    if (designIdFromUrl && firestore && user) {
        getDoc(doc(firestore, 'designs', designIdFromUrl)).then(docSnap => {
            if (docSnap.exists()) {
                const designData = docSnap.data() as TemaDesign;
                if (designData.userId === user.uid) {
                    applyDesignToCanvas(designData);
                    toast.success(`Loaded design: ${designData.name}`);
                } else {
                    toast.error("Permission Denied", { description: "You do not have permission to view this design." });
                    generate(true);
                }
            } else {
                 toast.error("Design not found.");
                 generate(true);
            }
        }).catch(() => {
            toast.error("Error loading design.");
            generate(true);
        });
    } else {
        generate(true);
    }
  }, [searchParams, firestore, user, applyDesignToCanvas, generate]);

  // ── Keyboard & Fullscreen ──────────────────────────────────────────────────
  useEffect(()=>{
    const h=(e:KeyboardEvent)=>{
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if((e.ctrlKey||e.metaKey)&&e.key==='z'&&!e.shiftKey){e.preventDefault();undo();}
      if((e.ctrlKey||e.metaKey)&&(e.key==='y'||(e.key==='z'&&e.shiftKey))){e.preventDefault();redo();}
      if(e.key==='Delete'||e.key==='Backspace'){
        if(selIds.size>0){ setTubes(tubes.filter(t=>!selIds.has(t.id))); setSelIds(new Set()); setNeedRecalc(true); }
      }
      if(e.key==='f'){e.preventDefault();toggleFullscreen();}
    };
    const onFsChange=()=>setIsFullscreen(!!document.fullscreenElement);
    window.addEventListener('keydown',h);
    document.addEventListener('fullscreenchange',onFsChange);
    return()=>{ window.removeEventListener('keydown',h); document.removeEventListener('fullscreenchange',onFsChange); };
  },[undo,redo,selIds,tubes,setTubes, toggleFullscreen]);
  
  const toggleFullscreen = useCallback(() => {
    if (!designerRef.current) return;
    if (!document.fullscreenElement) {
        designerRef.current.requestFullscreen().catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        document.exitFullscreen();
    }
  }, []);

  // ── Coordinate helpers ─────────────────────────────────────────────────────
  const evToCSS=useCallback((e:React.MouseEvent<HTMLCanvasElement>)=>{
    const r=canvasRef.current!.getBoundingClientRect();
    return{x:e.clientX-r.left,y:e.clientY-r.top};
  },[]);
  const css2w=useCallback((cx:number,cy:number)=>({ x:(cx-panRef.current.x)/zoomRef.current, y:(cy-panRef.current.y)/zoomRef.current, }),[]);
  const w2css=useCallback((wx:number,wy:number)=>({ x:panRef.current.x+wx*zoomRef.current, y:panRef.current.y+wy*zoomRef.current, }),[]);

  // ── Draw ───────────────────────────────────────────────────────────────────
  const draw=useCallback(()=>{
    const canvas=canvasRef.current;
    if(!canvas) return;
    const ctx=canvas.getContext("2d")!;
    const CW=canvas.width, CH=canvas.height;
    const z=zoomRef.current, p=panRef.current;

    ctx.clearRect(0,0,CW,CH);
    ctx.fillStyle="#ffffff"; ctx.fillRect(0,0,CW,MARGIN_TOP); ctx.fillRect(0,0,MARGIN_LEFT,CH);
    ctx.strokeStyle=C.border; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(0,MARGIN_TOP); ctx.lineTo(CW,MARGIN_TOP); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(MARGIN_LEFT,0); ctx.lineTo(MARGIN_LEFT,CH); ctx.stroke();
    ctx.fillStyle=C.canvas; ctx.fillRect(MARGIN_LEFT,MARGIN_TOP,CW-MARGIN_LEFT,CH-MARGIN_TOP);

    if(showGrid&&z>0.3){
      const gStep=50*z, ox=((p.x%gStep)+gStep)%gStep, oy=((p.y%gStep)+gStep)%gStep;
      ctx.strokeStyle="rgba(148,163,184,0.2)"; ctx.lineWidth=0.5;
      for(let x=MARGIN_LEFT+(ox%gStep);x<CW;x+=gStep){ ctx.beginPath(); ctx.moveTo(x,MARGIN_TOP); ctx.lineTo(x,CH); ctx.stroke(); }
      for(let y=MARGIN_TOP+(oy%gStep);y<CH;y+=gStep){ ctx.beginPath(); ctx.moveTo(MARGIN_LEFT,y); ctx.lineTo(CW,y); ctx.stroke(); }
    }
    if(showShell&&layout) drawShell(ctx,cfg.shape,z,p);

    if(showDims&&layout&&layout.bundleDia>0){
      const bR=layout.bundleDia/2;
      const ay=p.y+(bR+14)*z, ax1=p.x-bR*z, ax2=p.x+bR*z;
      if(ay>MARGIN_TOP&&ay<CH){
        ctx.save();
        ctx.strokeStyle="rgba(37,99,235,0.55)"; ctx.fillStyle="rgba(37,99,235,0.7)"; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(Math.max(ax1,MARGIN_LEFT),ay); ctx.lineTo(Math.min(ax2,CW),ay); ctx.stroke();
        for(const[x,d] of [[ax1,1],[ax2,-1]] as [number,number][]){
          if(x<MARGIN_LEFT||x>CW) continue;
          ctx.beginPath(); ctx.moveTo(x,ay); ctx.lineTo(x+5*d,ay-4); ctx.lineTo(x+5*d,ay+4); ctx.closePath(); ctx.fill();
          ctx.beginPath(); ctx.moveTo(x,ay-6); ctx.lineTo(x,ay+6); ctx.stroke();
        }
        ctx.font=`bold ${9 * fontScale}px ${F}`; ctx.textAlign="center"; ctx.textBaseline="top"; ctx.fillStyle="rgba(37,99,235,0.8)";
        ctx.fillText(`OTL ø${(layout.bundleDia/25.4).toFixed(2)}"`,Math.max(ax1,MARGIN_LEFT+4)+Math.min(ax2,CW-4)>>1,ay+4);
        ctx.textBaseline="alphabetic"; ctx.restore();
      }
    }
    for(const t of tubes){
      const tx=p.x+t.x*z, ty=p.y+t.y*z, tr=Math.max(t.r*z,1.2);
      if(tx+tr<MARGIN_LEFT||tx-tr>CW||ty+tr<MARGIN_TOP||ty-tr>CH) continue;
      const isSel=selIds.has(t.id), isHov=t.id===hoverId;
      let col:string;
      if(colorMode==="pass") col=passColor(t.pass); else if(colorMode==="row") col=rowColor(t.row); else col="#334155";

      if(isSel){ctx.beginPath();ctx.arc(tx,ty,tr+3.5,0,Math.PI*2);ctx.strokeStyle="#f59e0b";ctx.lineWidth=2.5;ctx.stroke();}
      else if(isHov){ctx.beginPath();ctx.arc(tx,ty,tr+2,0,Math.PI*2);ctx.strokeStyle=col+"77";ctx.lineWidth=1.5;ctx.stroke();}
      
      ctx.beginPath();ctx.arc(tx,ty,tr,0,Math.PI*2);
      if (t.status === 'plugged') {
          ctx.fillStyle = '#334155';
          ctx.fill();
      } else {
          ctx.fillStyle=isSel?"#fef9c3":col+"18"; ctx.fill();
          ctx.strokeStyle=isSel?"#f59e0b":col;
          ctx.lineWidth=isSel?2:Math.min(1.5,Math.max(0.5,z*0.35)); ctx.stroke();
      }
      if(tr>6 && t.status !== 'plugged'){ctx.beginPath();ctx.arc(tx,ty,tr*0.5,0,Math.PI*2);ctx.strokeStyle=col+"30";ctx.lineWidth=0.5;ctx.stroke();}
    }
    if(showLabels&&layout){
      const uRows=Array.from(new Set(tubes.map(t=>t.row))).sort((a,b)=>a-b);
      ctx.save(); ctx.font=`bold ${9 * fontScale}px ${FM}`;
      for(const r of uRows){
        const rowTubes=tubes.filter(t=>t.row===r); if(!rowTubes.length) continue;
        const leftmost=rowTubes.reduce((a,b)=>a.x<b.x?a:b);
        const ty=p.y+leftmost.y*z; if(ty<MARGIN_TOP+4||ty>CH-4) continue;
        const tx=p.x+leftmost.x*z, tr=Math.max(leftmost.r*z,1.2);
        const col=rowColor(r);
        ctx.strokeStyle=col+"70"; ctx.lineWidth=0.7; ctx.setLineDash([3,3]);
        ctx.beginPath(); ctx.moveTo(MARGIN_LEFT-2,ty); ctx.lineTo(tx-tr-3,ty); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle=col; ctx.textAlign="right"; ctx.textBaseline="middle"; ctx.fillText(`R${r+1}`,MARGIN_LEFT-5,ty);
      }
      ctx.restore();
    }
    if(showLabels&&layout){
      const uCols=Array.from(new Set(tubes.map(t=>t.col))).sort((a,b)=>a-b); let lastLabelX=-999;
      ctx.save(); ctx.font=`bold ${9 * fontScale}px ${FM}`;
      for(const c of uCols){
        const colTubes=tubes.filter(t=>t.col===c); if(!colTubes.length) continue;
        const topmost=colTubes.reduce((a,b)=>a.y<b.y?a:b);
        const tx=p.x+topmost.x*z; if(tx<MARGIN_LEFT+4||tx>CW-4) continue; if(tx-lastLabelX<18) continue; lastLabelX=tx;
        const ty=p.y+topmost.y*z, tr=Math.max(topmost.r*z,1.2);
        ctx.strokeStyle="rgba(100,116,139,0.35)"; ctx.lineWidth=0.6; ctx.setLineDash([2,3]);
        ctx.beginPath(); ctx.moveTo(tx,MARGIN_TOP); ctx.lineTo(tx,ty-tr-3); ctx.stroke(); ctx.setLineDash([]);
        ctx.save(); ctx.translate(tx, MARGIN_TOP/2); ctx.rotate(-Math.PI/2);
        ctx.fillStyle=C.text3; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText(`C${c+1}`,0,0);
        ctx.restore();
      }
      ctx.restore();
    }
    if(polyMode&&polyWip.length>0){
      ctx.save(); ctx.strokeStyle=C.accent; ctx.lineWidth=1.5; ctx.setLineDash([5,4]);
      ctx.beginPath();
      const p0=w2css(polyWip[0].x,polyWip[0].y); ctx.moveTo(p0.x,p0.y);
      for(let i=1;i<polyWip.length;i++){const pp=w2css(polyWip[i].x,polyWip[i].y);ctx.lineTo(pp.x,pp.y);}
      if(polyMousePos.current){const m=polyMousePos.current;ctx.lineTo(m.x,m.y);}
      ctx.stroke(); ctx.setLineDash([]);
      polyWip.forEach((pt,i)=>{
        const pp=w2css(pt.x,pt.y);
        ctx.beginPath(); ctx.arc(pp.x,pp.y,i===0?6:4,0,Math.PI*2);
        ctx.fillStyle=i===0?"#2563eb":"#fff"; ctx.fill();
        ctx.strokeStyle=C.accent; ctx.lineWidth=1.5; ctx.stroke();
      });
      const txt=polyWip.length<3?"Click to add points — double-click to close":`${polyWip.length} pts — double-click to close`;
      ctx.font=`bold ${10 * fontScale}px ${F}`; const tw=ctx.measureText(txt).width+14;
      ctx.fillStyle="rgba(37,99,235,0.9)"; ctx.fillRect((CW-tw)/2,CH-28,tw,20);
      ctx.fillStyle="#fff"; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText(txt,CW/2,CH-18); ctx.textBaseline="alphabetic";
      ctx.restore();
    }
    if(selBox){
      const{x1,y1,x2,y2}=selBox; ctx.save();
      ctx.strokeStyle=C.accent; ctx.lineWidth=1; ctx.setLineDash([4,3]);
      ctx.strokeRect(Math.min(x1,x2),Math.min(y1,y2),Math.abs(x2-x1),Math.abs(y2-y1));
      ctx.fillStyle="rgba(37,99,235,0.05)"; ctx.fillRect(Math.min(x1,x2),Math.min(y1,y2),Math.abs(x2-x1),Math.abs(y2-y1));
      ctx.setLineDash([]); ctx.restore();
    }
    if(hoverId!==null){
      const ht=tubes.find(t=>t.id===hoverId);
      if(ht){
        const tx=p.x+ht.x*z, ty=p.y+ht.y*z;
        const lines=[`R${ht.row+1}·C${ht.col+1}`,`Pass ${ht.pass}`, `Status: ${ht.status || 'ok'}`];
        const fw=130,lh=14,pad=6,fh=lines.length*lh*fontScale+pad*2;
        let bx=tx+ht.r*z+8, by=ty-fh/2;
        if(bx+fw>CW) bx=tx-ht.r*z-fw-8;
        bx=Math.max(MARGIN_LEFT+4,bx); by=Math.max(MARGIN_TOP+4,Math.min(by,CH-fh-4));
        ctx.fillStyle="rgba(255,255,255,0.97)"; ctx.strokeStyle=C.border2; ctx.lineWidth=1;
        rRect(ctx,bx,by,fw,fh,4); ctx.fill(); ctx.stroke();
        ctx.font=`${12 * fontScale}px ${F}`; ctx.textAlign="left"; ctx.textBaseline="top";
        lines.forEach((l,i)=>{ctx.fillStyle=i===0?C.accent:C.text2;ctx.fillText(l,bx+pad,by+pad+i*lh*fontScale);});
        ctx.textBaseline="alphabetic";
      }
    }
  },[layout,tubes,zoom,pan,colorMode,showLabels,showDims,showGrid,showShell, selIds,hoverId,selBox,cfg.shape,polyMode,polyWip,w2css,fontScale]);

  useEffect(()=>{ const canvas=canvasRef.current; if(!canvas) return;
    const ro=new ResizeObserver(()=>{
      const rect=canvas.getBoundingClientRect();
      if(rect.width>0&&rect.height>0){ canvas.width=Math.round(rect.width); canvas.height=Math.round(rect.height); draw(); }
    });
    ro.observe(canvas); return()=>ro.disconnect();
  },[draw]);

  useEffect(()=>{draw();},[draw]);

  const hitTest=useCallback((cx:number,cy:number):LayoutTube|null=>{
    const w=css2w(cx,cy); let best:LayoutTube|null=null, bestD=Infinity;
    for(const t of tubes){
      const d=Math.hypot(t.x-w.x,t.y-w.y);
      if(d<=t.r*1.6&&d<bestD){bestD=d;best=t;}
    }
    return best;
  },[tubes,css2w]);

  const onMouseDown=useCallback((e:React.MouseEvent<HTMLCanvasElement>)=>{
    const css=evToCSS(e);
    if(polyMode){
      if(e.button===2){e.preventDefault();setPolyWip(p=>p.slice(0,-1));return;}
      const w=css2w(css.x,css.y); setPolyWip(p=>[...p,w]); return;
    }
    if(tool==="pan"||e.button===1){panDrag.current={mx:e.clientX,my:e.clientY,px:pan.x,py:pan.y};return;}
    if(e.button===0){
      const hit=hitTest(css.x,css.y);
      if (tool === 'plug' && hit) {
          setTubes(prev => prev.map(t => t.id === hit.id ? { ...t, status: t.status === 'plugged' ? 'ok' : 'plugged' } : t));
          return;
      }
      if(hit){
        setSelIds(prev=>{
          const next=new Set(prev);
          if(e.shiftKey||e.ctrlKey||e.metaKey){next.has(hit.id)?next.delete(hit.id):next.add(hit.id);}
          else{if(!next.has(hit.id)){next.clear();next.add(hit.id);}}
          return next;
        });
        selStart.current=null;
      } else {
        if(!e.shiftKey) setSelIds(new Set());
        const w=css2w(css.x,css.y); selStart.current={wx:w.x,wy:w.y};
        setSelBox({x1:css.x,y1:css.y,x2:css.x,y2:css.y});
      }
    }
  },[polyMode,tool,pan,evToCSS,css2w,hitTest, setTubes]);

  const onMouseMove=useCallback((e:React.MouseEvent<HTMLCanvasElement>)=>{
    const css=evToCSS(e);
    if(polyMode){ polyMousePos.current=css; draw(); return; }
    if(panDrag.current){
      const nx=panDrag.current.px+(e.clientX-panDrag.current.mx), ny=panDrag.current.py+(e.clientY-panDrag.current.my);
      panRef.current={x:nx,y:ny}; setPan({x:nx,y:ny}); return;
    }
    if(selStart.current){ const s=selStart.current, sc=w2css(s.wx,s.wy); setSelBox({x1:sc.x,y1:sc.y,x2:css.x,y2:css.y}); return; }
    setHoverId(hitTest(css.x,css.y)?.id??null);
  },[polyMode,evToCSS,hitTest,w2css,draw]);

  const onMouseUp=useCallback((e:React.MouseEvent<HTMLCanvasElement>)=>{
    panDrag.current=null;
    if(selStart.current&&selBox){
      const css=evToCSS(e);
      const w1=css2w(Math.min(selBox.x1,css.x),Math.min(selBox.y1,css.y));
      const w2=css2w(Math.max(selBox.x1,css.x),Math.max(selBox.y1,css.y));
      const inBox=tubes.filter(t=>t.x>=w1.x&&t.x<=w2.x&&t.y>=w1.y&&t.y<=w2.y);
      setSelIds(prev=>{const next=new Set(prev);inBox.forEach(t=>next.add(t.id));return next;});
    }
    selStart.current=null; setSelBox(null);
  },[evToCSS,css2w,tubes,selBox]);

  const onDblClick=useCallback((e:React.MouseEvent<HTMLCanvasElement>)=>{
    if(!polyMode||polyWip.length<3) return;
    const poly=polyWip.map(pt=>({x:pt.x,y:pt.y}));
    setCfg(prev=>({...prev,shape:{type:'polygon',polygon:poly}}));
    setPolyMode(false); setPolyWip([]);
  },[polyMode,polyWip]);

  const onWheel=useCallback((e:React.WheelEvent<HTMLCanvasElement>)=>{
    e.preventDefault();
    const css=evToCSS(e); const factor=e.deltaY<0?1.12:0.89;
    setZoom(prev=>{
      const nz=Math.max(0.03,Math.min(30,prev*factor));
      const nx=css.x+(panRef.current.x-css.x)*nz/prev, ny=css.y+(panRef.current.y-css.y)*nz/prev;
      panRef.current={x:nx,y:ny}; setPan({x:nx,y:ny}); return nz;
    });
  },[evToCSS]);

  const fitView=useCallback(()=>{
    if(!canvasRef.current||!tubes.length) return;
    const rect=canvasRef.current.getBoundingClientRect();
    const cw=rect.width-MARGIN_LEFT, ch=rect.height-MARGIN_TOP;
    const xs=tubes.map(t=>t.x), ys=tubes.map(t=>t.y);
    const pad=(tubes[0]?.r??10)*3;
    const span=Math.max(Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys))+pad*2;
    const nz=Math.min(cw,ch)*0.88/span;
    const cx=(Math.min(...xs)+Math.max(...xs))/2, cy=(Math.min(...ys)+Math.max(...ys))/2;
    const z=Math.max(0.03,Math.min(30,nz));
    zoomRef.current=z; panRef.current={x:MARGIN_LEFT+cw/2-cx*z,y:MARGIN_TOP+ch/2-cy*z};
    setZoom(z); setPan({x:MARGIN_LEFT+cw/2-cx*z,y:MARGIN_TOP+ch/2-cy*z});
  },[tubes]);

  // ── Edit operations ───────────────────────────────────────────────────────
  const delSelected=()=>{ if(!selIds.size) return; setTubes(tubes.filter(t=>!selIds.has(t.id))); setSelIds(new Set()); setNeedRecalc(true); };
  const delRow=(r:number)=>{setTubes(tubes.filter(t=>t.row!==r));setNeedRecalc(true);};
  const delCol=(c:number)=>{setTubes(tubes.filter(t=>t.col!==c));setNeedRecalc(true);};
  const delPass=(pp:number)=>{setTubes(tubes.filter(t=>t.pass!==pp));setNeedRecalc(true);};
  const insertRowAfter=useCallback((row:number)=>{
    if(!layout) return;
    const rt=tubes.filter(t=>t.row===row); if(!rt.length) return;
    const nextY=tubes.find(t=>t.row===row+1)?.y;
    const pitchY=layout.pattern==='triangular'||layout.pattern==='rotated-triangular' ?layout.pitchMm*SQ3H : layout.pitchMm;
    const dy=nextY!=null?(nextY-rt[0].y):pitchY;
    const maxId=Math.max(...tubes.map(t=>t.id));
    const newT:LayoutTube[]=rt.map((t,i)=>({...t,id:maxId+1+i,y:t.y+dy/2,row:row+1}));
    const shifted=tubes.map(t=>t.row>row?{...t,row:t.row+1}:t);
    setTubes([...shifted,...newT]); setNeedRecalc(true);
  },[layout,tubes,setTubes]);
  const insertColAfter=useCallback((col:number)=>{
    if(!layout) return;
    const ct=tubes.filter(t=>t.col===col); if(!ct.length) return;
    const nextX=tubes.find(t=>t.col===col+1)?.x;
    const dx=nextX!=null?(nextX-ct[0].x):layout.pitchMm;
    const maxId=Math.max(...tubes.map(t=>t.id));
    const newT:LayoutTube[]=ct.map((t,i)=>({...t,id:maxId+1+i,x:t.x+dx/2,col:col+1}));
    const shifted=tubes.map(t=>t.col>col?{...t,col:t.col+1}:t);
    setTubes([...shifted,...newT]); setNeedRecalc(true);
  },[layout,tubes,setTubes]);
  const recalc=()=>{ if(!layout) return; setTubes(recalcRowsCols(tubes,layout.pitchMm)); setNeedRecalc(false); };

  // ── Selection helpers ────────────────────────────────────────────────────
  const selAll=()=>setSelIds(new Set(tubes.map(t=>t.id)));
  const clearSel=()=>setSelIds(new Set());
  const selRow=(r:number)=>setSelIds(new Set(tubes.filter(t=>t.row===r).map(t=>t.id)));
  const selCol=(c:number)=>setSelIds(new Set(tubes.filter(t=>t.col===c).map(t=>t.id)));
  const selPass=(pp:number)=>setSelIds(new Set(tubes.filter(t=>t.pass===pp).map(t=>t.id)));
  const addSelRow=(r:number)=>setSelIds(prev=>{const n=new Set(prev);tubes.filter(t=>t.row===r).forEach(t=>n.add(t.id));return n;});
  const addSelCol=(c:number)=>setSelIds(prev=>{const n=new Set(prev);tubes.filter(t=>t.col===c).forEach(t=>n.add(t.id));return n;});

  // ── Save/Load/Attach Logic ───────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (isTrial || !firestore || !user || !designId) return;
    toast.info("Saving design...");
    try {
        const designRef = doc(firestore, 'designs', designId);
        await updateDoc(designRef, { name: designName, description: 'Updated design', config: cfg, tubes, modifiedAt: new Date().toISOString() });
        toast.success("Design Saved!", { description: `"${designName}" has been updated.`});
    } catch(e) {
        toast.error("Save Failed", { description: "Could not save design."});
    }
  }, [isTrial, firestore, user, designId, designName, cfg, tubes]);

  const handleSaveAs = async (name: string, description: string) => {
    if (isTrial || !firestore || !user) return;
    setIsSaveModalOpen(false);
    toast.info("Saving new design...");
    try {
        const newDocRef = doc(collection(firestore, 'designs'));
        const newDesign: TemaDesign = {
            id: newDocRef.id,
            userId: user.uid,
            name,
            description: description || '',
            config: cfg,
            tubes,
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
        };
        await setDoc(newDocRef, newDesign);
        setDesignId(newDocRef.id);
        setDesignName(name);
        toast.success("Design Saved!", { description: `"${name}" has been saved.`});
    } catch(e) {
        toast.error("Save Failed", { description: "Could not save new design."});
    }
  };

  const handleLoadDesign = (design: TemaDesign) => {
    setIsLoadModalOpen(false);
    router.push(`/dashboard/temadesigner?designId=${design.id}`);
  };

  const handleAttachToJob = async (jobId: string) => {
      if (!firestore || !designId) return;
      setIsAttachModalOpen(false);
      try {
          const jobRef = doc(firestore, 'jobs', jobId);
          await updateDoc(jobRef, {
              temaDesignIds: [designId] // For now, overwriting. Can be changed to arrayUnion.
          });
          toast.success("Design Attached", { description: `Design "${designName}" has been attached to the job.` });
      } catch (e) {
          toast.error("Failed to attach design.");
      }
  };

  // Export
  const dl=(content:string,name:string,mime:string)=>{ const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([content],{type:mime})); a.download=name; a.click(); };
  const stem=`tubemapper_${cfg.tubeOdIn}in_${cfg.pattern}_${cfg.shape.type}`;
  const expCSV =()=>layout&&dl(toCSV(tubes,layout.pitchMm,layout.tubeOdMm,cfg),stem+".csv","text/csv");
  const expJSON=()=>layout&&dl(toJSON(tubes,layout.pitchMm,layout.tubeOdMm,cfg),stem+".json","application/json");
  const expDXF =()=>layout&&dl(toDXF(tubes,layout.tubeOdMm),stem+".dxf","application/dxf");

  // Derived
  const selTubes=useMemo(()=>tubes.filter(t=>selIds.has(t.id)),[tubes,selIds]);
  const sortedTubes = useMemo(()=>[...tubes].sort((a,b)=>a.row-b.row||a.col-b.col),[tubes]);
  const uRows=useMemo(()=>Array.from(new Set(tubes.map(t=>t.row))).sort((a,b)=>a-b),[tubes]);
  const uCols=useMemo(()=>Array.from(new Set(tubes.map(t=>t.col))).sort((a,b)=>a-b),[tubes]);
  const uPasses=useMemo(()=>Array.from(new Set(tubes.map(t=>t.pass))).sort((a,b)=>a-b),[tubes]);
  const selRows=useMemo(()=>Array.from(new Set<number>(selTubes.map(t=>t.row))).sort((a,b)=>a-b),[selTubes]);
  const selCols=useMemo(()=>Array.from(new Set<number>(selTubes.map(t=>t.col))).sort((a,b)=>a-b),[selTubes]);
  const updateShape=(partial:Partial<ShellShape>)=>setCfg(p=>({...p,shape:{...p.shape,...partial}}));

  // ── Render ────────────────────────────────────────────────────────────────
  return(
    <div ref={designerRef} style={{display:"flex",flex:1,height:"100%",overflow:"hidden",fontFamily:F,background:C.bg}}>

      <div style={{width:260,flexShrink:0,background:C.panel,borderRight:`1px solid ${C.border}`, display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{flex:1,overflowY:"auto",padding:"12px 14px 16px"}}>
          <Label fontScale={fontScale}>Shell Shape</Label>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:6}}>
            {(["circle","rectangle","ellipse","hexagon","polygon"] as ShapeType[]).map(s=>(
              <Chip key={s} label={s==="polygon"?"✏ Polygon":s[0].toUpperCase()+s.slice(1)}
                active={cfg.shape.type===s} onClick={()=>{
                  if(s==="polygon"){setPolyWip([]);setPolyMode(true);}
                  else{setPolyMode(false);}
                  updateShape({type:s});
                }} color={s==="polygon"?"#7c3aed":C.accent}/>
            ))}
          </div>
          {cfg.shape.type==="polygon"&&(<div style={{marginBottom:6}}>
              <div style={{background:polyMode?"#ede9fe":"#f5f3ff",border:`1px solid ${polyMode?"#7c3aed":"#ddd6fe"}`, borderRadius:4,padding:"6px 8px",marginBottom:4}}>
                <div style={{fontSize:11*fontScale,color:"#7c3aed",fontWeight:600,marginBottom:2}}>{polyMode?"Drawing polygon on canvas…":"Custom polygon shape"}</div>
                <div style={{fontSize:10*fontScale,color:"#6d28d9",lineHeight:1.5}}>{polyMode?"Click to add vertices. Double-click to close.":`${(cfg.shape.polygon?.length??0)} vertices defined.`}</div>
              </div>
              <div style={{display:"flex",gap:4}}><Btn size="xs" variant={polyMode?"primary":"default"} onClick={()=>{setPolyMode(true);setPolyWip([]);}}>{polyMode?"Drawing…":"✏ Draw"}</Btn>{polyMode&&<Btn size="xs" onClick={()=>{setPolyMode(false);setPolyWip([]);}}>Cancel</Btn>}{cfg.shape.polygon&&cfg.shape.polygon.length>2&&<Btn size="xs" variant="danger" onClick={()=>updateShape({polygon:[]})}>Clear</Btn>}</div>
            </div>)}

          {cfg.shape.type==="circle"&&(<>
              <Label fontScale={fontScale}>Shell Diameter</Label>
              <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:6}}>
                {[6,8,10,12,15.25,19.25,23.25,25,29,33,37,42,48,60].map(id=>(
                  <button key={id} onClick={()=>updateShape({diameterMm:id*25.4})}
                    style={{fontFamily:FM,fontSize:10*fontScale,padding:"2px 6px",borderRadius:3,cursor:"pointer",
                      background:Math.abs((cfg.shape.diameterMm??0)-id*25.4)<0.5?C.accent:C.panel,
                      color:Math.abs((cfg.shape.diameterMm??0)-id*25.4)<0.5?"#fff":C.text2,
                      border:`1px solid ${Math.abs((cfg.shape.diameterMm??0)-id*25.4)<0.5?C.accent:C.border2}`}}>{id}"</button>
                ))}
              </div>
              <NumIn value={+(cfg.shape.diameterMm??304.8).toFixed(1)} onChange={v=>updateShape({diameterMm:v})} min={30} max={2000} step={25.4} unit="mm" fontScale={fontScale}/>
            </>)}
          {cfg.shape.type==="rectangle"&&(<div style={{display:"flex",gap:8}}><div><Label fontScale={fontScale}>Width</Label><NumIn value={+(cfg.shape.widthMm??500).toFixed(1)} onChange={v=>updateShape({widthMm:v})} min={30} unit="mm" fontScale={fontScale}/></div><div><Label fontScale={fontScale}>Height</Label><NumIn value={+(cfg.shape.heightMm??400).toFixed(1)} onChange={v=>updateShape({heightMm:v})} min={30} unit="mm" fontScale={fontScale}/></div></div>)}
          {cfg.shape.type==="ellipse"&&(<div style={{display:"flex",gap:8}}><div><Label fontScale={fontScale}>Semi-A</Label><NumIn value={+(cfg.shape.axisAMm??500).toFixed(1)} onChange={v=>updateShape({axisAMm:v})} min={30} unit="mm" fontScale={fontScale}/></div><div><Label fontScale={fontScale}>Semi-B</Label><NumIn value={+(cfg.shape.axisBMm??350).toFixed(1)} onChange={v=>updateShape({axisBMm:v})} min={30} unit="mm" fontScale={fontScale}/></div></div>)}
          {cfg.shape.type==="hexagon"&&(<div><Label fontScale={fontScale}>Flat-to-flat</Label><NumIn value={+(cfg.shape.hexSizeMm??300).toFixed(1)} onChange={v=>updateShape({hexSizeMm:v})} min={30} unit="mm" fontScale={fontScale}/></div>)}

          <Divider/><Label fontScale={fontScale}>Tube OD</Label>
          <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:8}}>{TEMA_TUBE_ODS.map(t=>( <Chip key={t.val} label={t.label} active={cfg.tubeOdIn===t.val} onClick={()=>setCfg(p=>({...p,tubeOdIn:t.val}))} color={C.accent}/>))}</div>
          <Divider/><Label fontScale={fontScale}>Pitch Ratio</Label>
          <div style={{display:"flex",flexDirection:"column",gap:3,marginBottom:8}}>{PITCH_RATIOS.map(pr=>(<div key={pr.val} onClick={()=>setCfg(p=>({...p,pitchRatio:pr.val}))} style={{padding:"4px 8px",borderRadius:4,cursor:"pointer", background:cfg.pitchRatio===pr.val?C.accentL:"transparent", border:`1px solid ${cfg.pitchRatio===pr.val?C.accentM:C.border}`,transition:"all 0.1s"}}><span style={{fontSize:12*fontScale,fontWeight:600,color:cfg.pitchRatio===pr.val?C.accent:C.text2}}>{pr.label}</span></div>))}</div>
          <Divider/><Label fontScale={fontScale}>Pitch Pattern</Label>
          <div style={{display:"flex",flexDirection:"column",gap:3,marginBottom:8}}>{PITCH_PATTERNS.map(pp=>(<div key={pp.id} onClick={()=>setCfg(p=>({...p,pattern:pp.id}))} style={{padding:"5px 8px",borderRadius:4,cursor:"pointer", background:cfg.pattern===pp.id?C.accentL:"transparent", border:`1px solid ${cfg.pattern===pp.id?C.accentM:C.border}`,transition:"all 0.1s"}}><div style={{fontSize:12*fontScale,fontWeight:600,color:cfg.pattern===pp.id?C.accent:C.text}}>{pp.label}</div><div style={{fontSize:10*fontScale,color:C.text3,marginTop:1}}>{pp.desc}</div></div>))}</div>
          <Divider/><Label fontScale={fontScale}>Tube Passes</Label>
          <div style={{display:"flex",gap:4,marginBottom:8}}>{[1,2,4,6,8].map(n=>(<Chip key={n} label={`${n}P`} active={cfg.numPasses===n} onClick={()=>setCfg(p=>({...p,numPasses:n}))} color={C.accent}/>))}</div>
          <Divider/>
          <button onClick={() => generate(true)} disabled={busy} style={{width:"100%",padding:"9px 0",borderRadius:5,cursor:busy?"not-allowed":"pointer", fontFamily:F,fontSize:13*fontScale,fontWeight:700, background:busy?C.border2:C.accent,color:busy?"#94a3b8":"#fff", border:"none",boxShadow:busy?"none":"0 2px 10px rgba(37,99,235,0.28)", display:"flex",alignItems:"center",justifyContent:"center",gap:8, transition:"all 0.15s"}}>{busy?<><Spinner/> Generating…</>:"⚡ Generate Layout"}</button>
        </div>

        <div style={{height: "45%", display: 'flex', flexDirection: 'column', borderTop: `1px solid ${C.border}`}}>
          <div style={{padding:"8px 14px"}}>
            <div style={{fontSize:10*fontScale,fontWeight:700,color:C.text3,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:5}}>Display</div>
            <div style={{display:"flex",gap:3,marginBottom:5}}>{(["mono","pass","row"] as const).map(m=>(<Chip key={m} label={m[0].toUpperCase()+m.slice(1)} active={colorMode===m} onClick={()=>setColorMode(m)} color="#475569"/>))}</div>
            <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{[["Labels",showLabels,setShowLabels],["Dims",showDims,setShowDims],["Grid",showGrid,setShowGrid],["Shell",showShell,setShowShell]].map(([l,v,fn])=>( <button key={l as string} onClick={()=>(fn as any)(!(v as boolean))} style={{fontFamily:F,fontSize:10*fontScale,padding:"2px 7px",borderRadius:3,cursor:"pointer", background:(v as boolean)?C.accent:C.panel,color:(v as boolean)?"#fff":C.text2, border:`1px solid ${(v as boolean)?C.accent:C.border2}`,transition:"all 0.1s"}}>{l as string}</button>))}</div>
          </div>
          <div style={{padding:"8px 14px 12px", flex: 1, display: 'flex', flexDirection: 'column', borderTop: `1px solid ${C.border}`, minHeight: 0}}>
            <div style={{fontSize:10*fontScale,fontWeight:700,color:C.text3,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:5}}>Tube List ({tubes.length})</div>
            <div style={{flex: 1, overflowY: 'auto', border: `1px solid ${C.border}`, borderRadius: 4, background: C.bg}}>
              {sortedTubes.map(t => {
                const isSel = selIds.has(t.id);
                return (
                  <button key={t.id} onClick={(e) => {
                    const next = new Set<number>();
                    if (e.shiftKey) { setSelIds(p => new Set(p).add(t.id)); } else { setSelIds(new Set([t.id])); }
                  }} style={{ width: '100%', display: "flex", justifyContent: "space-between", alignItems: "center", padding: '3px 8px', cursor: 'pointer', background: isSel ? C.accentL : 'transparent', border: 'none', borderBottom: `1px solid ${C.border}`, textAlign: 'left' }} >
                    <span style={{ fontFamily: FM, fontSize: 11 * fontScale, color: isSel ? C.accent : C.text }}> R{String(t.row + 1).padStart(2, '0')}-C{String(t.col + 1).padStart(2, '0')} </span>
                    <span style={{ fontFamily: F, fontSize: 10 * fontScale, color: C.text3, background: C.border, padding: '1px 4px', borderRadius: 3 }}> P{t.pass} </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{height:42,flexShrink:0,display:"flex",alignItems:"center",padding:"0 10px", gap:5,background:C.panel,borderBottom:`1px solid ${C.border}`,flexWrap:"nowrap",overflowX:"auto"}}>

          {layout&&(<div style={{display:"flex",gap:10,alignItems:"center",marginRight:4}}>{[{l:"Tubes",v:tubes.length,c:C.accent},{l:"Rows",v:uRows.length,c:C.success},{l:"Cols",v:uCols.length,c:C.ruler},{l:"OD",v:`${cfg.tubeOdIn}"`,c:C.text},{l:"Pitch",v:`${layout.pitchMm.toFixed(1)}mm`,c:C.text}].map(k=>(<div key={k.l} style={{display:"flex",flexDirection:"column",lineHeight:1}}><span style={{fontSize:9*fontScale,color:C.text3,textTransform:"uppercase",letterSpacing:"0.4px"}}>{k.l}</span><span style={{fontSize:13*fontScale,fontWeight:700,color:k.c,fontFamily:FM}}>{k.v}</span></div>))}</div>)}
          <div style={{width:1,height:22,background:C.border}}/>
          {!isTrial && (<>
             <Btn size="xs" onClick={() => handleSave()} disabled={!designId} title="Save current design (Ctrl+S)"><Save size={12}/> Save</Btn>
             <Btn size="xs" onClick={() => setIsSaveModalOpen(true)}>Save As...</Btn>
             <Btn size="xs" onClick={() => setIsLoadModalOpen(true)}><FolderOpen size={12}/> Load</Btn>
             <Btn size="xs" onClick={() => setIsAttachModalOpen(true)} disabled={!designId}><Link2 size={12}/> Attach to Job</Btn>
             <div style={{width:1,height:22,background:C.border}}/>
           </>)}
          <Btn size="xs" variant="ghost" disabled={!canUndo} onClick={undo} title="Undo (Ctrl+Z)">↩ Undo</Btn>
          <Btn size="xs" variant="ghost" disabled={!canRedo} onClick={redo} title="Redo (Ctrl+Y)">↪ Redo</Btn>
          <div style={{width:1,height:22,background:C.border}}/>
          <div style={{display:"flex",gap:3}}>
            <Chip label="⬚ Select" active={tool==="select"} onClick={()=>{setTool("select");}}/>
            <Chip label="✥ Pan" active={tool==="pan"} onClick={()=>{setTool("pan");}}/>
            <Chip label="● Plug" active={tool==="plug"} onClick={()=>{setTool("plug");}} color="#334155"/>
          </div>
          <div style={{width:1,height:22,background:C.border}}/>
          <Btn size="xs" onClick={selAll}>All</Btn>
          <Btn size="xs" onClick={clearSel} disabled={!selIds.size}>Clear</Btn>
          {selIds.size>0&&<Btn size="xs" variant="danger" onClick={delSelected}>✕ Delete {selIds.size}</Btn>}
          <div style={{flex:1}}/>
          {needRecalc&&(<div style={{display:"flex",alignItems:"center",gap:5,background:C.warnL, border:"1px solid #fbbf24",borderRadius:4,padding:"3px 8px"}}><span style={{fontSize:10*fontScale,color:"#92400e",fontWeight:500}}>⚠ Numbering stale</span><Btn size="xs" variant="warn" onClick={recalc}>↺ Recalculate</Btn></div>)}
          <Btn size="xs" variant="ghost" onClick={fitView} title="Fit view">⊙ Fit</Btn>
          <Btn size="xs" variant="ghost" onClick={()=>{const z=Math.min(30,zoom*1.2);zoomRef.current=z;setZoom(z);}}>+</Btn>
          <span style={{fontFamily:FM,fontSize:10*fontScale,color:C.text3,minWidth:36,textAlign:"center"}}>{(zoom*100).toFixed(0)}%</span>
          <Btn size="xs" variant="ghost" onClick={()=>{const z=Math.max(0.03,zoom/1.2);zoomRef.current=z;setZoom(z);}}>–</Btn>
          <div style={{width:1,height:22,background:C.border}}/><Btn size="xs" variant="ghost" onClick={() => setFontScale(s => Math.max(0.5, s - 0.1))}>A-</Btn><span style={{fontFamily:FM,fontSize:10,color:C.text3,minWidth:36,textAlign:"center"}}>{(fontScale*100).toFixed(0)}%</span><Btn size="xs" variant="ghost" onClick={() => setFontScale(s => Math.min(2, s + 0.1))}>A+</Btn>
          <div style={{width:1,height:22,background:C.border}}/><Btn size="xs" variant="ghost" onClick={toggleFullscreen} title="Fullscreen (F)">{isFullscreen ? <Minimize size={14}/> : <Maximize size={14}/>}</Btn>
          {!isTrial && (<><div style={{width:1,height:22,background:C.border}}/><Btn size="xs" onClick={expCSV}>CSV</Btn><Btn size="xs" onClick={expJSON}>JSON</Btn><Btn size="xs" onClick={expDXF}>DXF</Btn></>)}
        </div>
        <div style={{flex:1,position:"relative",overflow:"hidden"}}>
          {busy&&(<div style={{position:"absolute",inset:0,background:"rgba(241,245,249,0.93)", display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:10}}><Spinner/><div style={{fontFamily:F,fontSize:14*fontScale,fontWeight:600,color:C.text,marginTop:14}}>Generating layout…</div><div style={{fontFamily:F,fontSize:12*fontScale,color:C.text2,marginTop:4}}>Placing tubes · checking clearances</div><div style={{marginTop:14,width:160,height:3,background:C.border,borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",background:C.accent,borderRadius:2, animation:"td-progress 1.2s ease-in-out infinite",width:"45%"}}/></div></div>)}
          <canvas ref={canvasRef} style={{display:"block",width:"100%",height:"100%", cursor:polyMode?"crosshair":tool==="pan"||panDrag.current?"grab": tool === 'plug' ? 'crosshair' : "default"}} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onDoubleClick={onDblClick} onMouseLeave={()=>{setHoverId(null);panDrag.current=null;selStart.current=null;setSelBox(null);}} onWheel={onWheel} onContextMenu={e=>e.preventDefault()}/>
        </div>
      </div>

      <div style={{width:220,flexShrink:0,background:C.panel,borderLeft:`1px solid ${C.border}`, display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{flex:1,overflowY:"auto",padding:"12px"}}>
          <div style={{marginBottom:6}}><div style={{fontSize:11*fontScale,fontWeight:700,color:C.text3,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:5}}>Selection</div>
            {!selIds.size&&<div style={{fontSize:11*fontScale,color:C.text3,lineHeight:1.7}}>Click or drag to select.<br/>Shift+click to add.<br/>Del to delete.</div>}
            {selIds.size===1&&(()=>{const t=selTubes[0];return(<div><div style={{fontFamily:FM,fontSize:16*fontScale,fontWeight:700,color:C.accent,marginBottom:5}}>R{t.row+1}-C{t.col+1}</div>{[["Pass",t.pass],["x",`${t.x.toFixed(2)} mm`],["y",`${t.y.toFixed(2)} mm`],["OD",`${(t.r*2/25.4).toFixed(3)}"`]].map(([k,v])=>(<div key={String(k)} style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:11*fontScale,color:C.text3}}>{k}</span><span style={{fontFamily:FM,fontSize:11*fontScale,color:C.text}}>{v}</span></div>))}<Btn variant="danger" size="xs" onClick={delSelected}>Remove tube</Btn></div>);})()}
            {selIds.size>1&&(<div><div style={{fontFamily:FM,fontSize:13*fontScale,fontWeight:700,color:C.accent,marginBottom:4}}>{selIds.size} selected</div><div style={{fontSize:11*fontScale,color:C.text2,marginBottom:5,lineHeight:1.6}}>Rows: {selRows.slice(0,4).map(r=>`R${r+1}`).join(", ")}{selRows.length>4?`+${selRows.length-4}`:""}<br/>Cols: {selCols.length} unique</div><Btn variant="danger" size="xs" onClick={delSelected}>✕ Delete {selIds.size}</Btn></div>)}
          </div>
          <Divider label="Rows"/><div style={{fontSize:10*fontScale,color:C.text2,marginBottom:4}}>Click=select · Shift=add · +↓ insert · ✕ delete</div>
          <div style={{maxHeight:160,overflowY:"auto",border:`1px solid ${C.border}`,borderRadius:4}}>{uRows.map(r=>{ const cnt=tubes.filter(t=>t.row===r).length; const isSel=selRows.includes(r); return(<div key={r} onClick={e=>e.shiftKey?addSelRow(r):selRow(r)} style={{display:"flex",alignItems:"center",gap:4,padding:"3px 6px", borderBottom:`1px solid ${C.border}`,cursor:"pointer",background:isSel?C.accentL:"transparent"}}><div style={{width:8,height:8,borderRadius:"50%",background:rowColor(r),flexShrink:0}}/><span style={{fontFamily:FM,fontSize:10*fontScale,color:isSel?C.accent:C.text,flex:1}}>R{r+1}</span><span style={{fontFamily:FM,fontSize:10*fontScale,color:C.text3}}>{cnt}t</span><button onClick={e=>{e.stopPropagation();insertRowAfter(r);}} title="Insert row below" style={{fontFamily:F,fontSize:9*fontScale,padding:"1px 4px",borderRadius:2,cursor:"pointer", background:"transparent",border:`1px solid ${C.border2}`,color:C.text3}}>+↓</button><button onClick={e=>{e.stopPropagation();delRow(r);}} title="Delete row" style={{fontFamily:F,fontSize:9*fontScale,padding:"1px 4px",borderRadius:2,cursor:"pointer", background:"transparent",border:`1px solid ${C.border2}`,color:C.danger}}>✕</button></div>);})}</div>
          <Divider label="Columns"/><div style={{maxHeight:130,overflowY:"auto",border:`1px solid ${C.border}`,borderRadius:4}}>{uCols.slice(0,60).map(c=>{ const cnt=tubes.filter(t=>t.col===c).length; const isSel=selCols.includes(c); return(<div key={c} onClick={e=>e.shiftKey?addSelCol(c):selCol(c)} style={{display:"flex",alignItems:"center",gap:4,padding:"3px 6px", borderBottom:`1px solid ${C.border}`,cursor:"pointer",background:isSel?C.accentL:"transparent"}}><span style={{fontFamily:FM,fontSize:10*fontScale,color:isSel?C.accent:C.text,flex:1}}>C{c+1}</span><span style={{fontFamily:FM,fontSize:10*fontScale,color:C.text3}}>{cnt}t</span><button onClick={e=>{e.stopPropagation();insertColAfter(c);}} title="Insert col after" style={{fontFamily:F,fontSize:9*fontScale,padding:"1px 4px",borderRadius:2,cursor:"pointer", background:"transparent",border:`1px solid ${C.border2}`,color:C.text3}}>+→</button><button onClick={e=>{e.stopPropagation();delCol(c);}} title="Delete column" style={{fontFamily:F,fontSize:9*fontScale,padding:"1px 4px",borderRadius:2,cursor:"pointer", background:"transparent",border:`1px solid ${C.border2}`,color:C.danger}}>✕</button></div>);})}{uCols.length>60&&<div style={{padding:"3px 6px",fontSize:10*fontScale,color:C.text3}}>…{uCols.length-60} more</div>}</div>
          {cfg.numPasses>1&&(<><Divider label="Passes"/><div style={{border:`1px solid ${C.border}`,borderRadius:4}}>{uPasses.map(pp=>(<div key={pp} onClick={()=>selPass(pp)} style={{display:"flex",alignItems:"center",gap:4,padding:"3px 6px", borderBottom:`1px solid ${C.border}`,cursor:"pointer"}}><div style={{width:8,height:8,borderRadius:"50%",background:passColor(pp),flexShrink:0}}/><span style={{fontFamily:FM,fontSize:10*fontScale,color:C.text,flex:1}}>Pass {pp}</span><span style={{fontFamily:FM,fontSize:10*fontScale,color:C.text3}}>{tubes.filter(t=>t.pass===pp).length}t</span><button onClick={e=>{e.stopPropagation();delPass(pp);}} style={{fontFamily:F,fontSize:9*fontScale,padding:"1px 4px",borderRadius:2,cursor:"pointer", background:"transparent",border:`1px solid ${C.border2}`,color:C.danger}}>✕</button></div>))}</div></>)}
          <Divider label="Recalculate"/><button onClick={recalc} style={{width:"100%",padding:"7px 0",borderRadius:4,cursor:"pointer",fontFamily:F, fontSize:12*fontScale,fontWeight:600, background:needRecalc?C.warn:"transparent", color:needRecalc?"#fff":C.text2, border:`1px solid ${needRecalc?C.warn:C.border2}`,transition:"all 0.15s"}}>↺ Recalculate Rows & Cols</button>
          <div style={{fontSize:10*fontScale,color:C.text3,marginTop:3,lineHeight:1.5}}>Keyboard: Ctrl+Z undo · Ctrl+Y redo · Del to delete</div>
          {layout&&(<><Divider label="Layout Info"/><div style={{background:C.bg,borderRadius:4,padding:"8px",border:`1px solid ${C.border}`}}>{[["OD",`${cfg.tubeOdIn}" / ${layout.tubeOdMm.toFixed(1)}mm`],["Pitch",`${layout.pitchMm.toFixed(2)}mm`],["Ratio",`${cfg.pitchRatio}×OD`],["Pattern",cfg.pattern],["Shape",cfg.shape.type],["Total",`${tubes.length} tubes`],["Rows",uRows.length],["Passes",cfg.numPasses],["OTL",`ø${(layout.bundleDia/25.4).toFixed(2)}"`]].map(([k,v])=>(<div key={String(k)} style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:10*fontScale,color:C.text3}}>{k}</span><span style={{fontFamily:FM,fontSize:10*fontScale,color:C.text,textAlign:"right"}}>{v}</span></div>))}</div></>)}
        </div>
      </div>

      <SaveDialog isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} onSave={handleSaveAs} />
      <LoadDialog isOpen={isLoadModalOpen} onClose={() => setIsLoadModalOpen(false)} designs={savedDesigns || []} onLoad={handleLoadDesign} isLoading={isLoadingDesigns} />
      <AttachDialog isOpen={isAttachModalOpen} onClose={() => setIsAttachModalOpen(false)} jobs={userJobs || []} onAttach={handleAttachToJob} isLoading={isLoadingJobs} />

      <style>{`
        @keyframes td-spin { to { transform: rotate(360deg); } }
        @keyframes td-progress { 0%{transform:translateX(-100%)} 100%{transform:translateX(260%)} }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.3; }
      `}</style>
    </div>
  );
}

function SaveDialog({isOpen, onClose, onSave}: {isOpen:boolean; onClose:()=>void; onSave:(name:string, desc:string)=>void}) {
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    return <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent><DialogHeader><DialogTitle>Save Design As</DialogTitle><DialogDescription>Give your tubesheet layout a name and an optional description.</DialogDescription></DialogHeader>
        <div className="space-y-4 py-2">
            <div><Label htmlFor="design-name">Design Name</Label><Input id="design-name" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g., Main Condenser - Unit 1"/></div>
            <div><Label htmlFor="design-desc">Description (Optional)</Label><Textarea id="design-desc" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="A brief description of this design..."/></div>
        </div>
        <DialogFooter><DialogClose asChild><Btn variant="ghost">Cancel</Btn></DialogClose><Btn onClick={()=>onSave(name,desc)} disabled={!name}>Save</Btn></DialogFooter>
        </DialogContent></Dialog>
}

function LoadDialog({isOpen, onClose, designs, onLoad, isLoading}: {isOpen:boolean; onClose:()=>void; designs:TemaDesign[], onLoad:(design:TemaDesign)=>void, isLoading:boolean}) {
    return <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Load Design</DialogTitle><DialogDescription>Select one of your previously saved designs to load it into the editor.</DialogDescription></DialogHeader>
        <ScrollArea className="h-72 border rounded-md">{isLoading ? <div className="p-4"><Skeleton className="h-20"/></div> : 
            <div className="p-2 space-y-1">{designs.length > 0 ? designs.map(d=><button key={d.id} onClick={()=>onLoad(d)} className="w-full text-left p-2 rounded-md hover:bg-muted">
                <p className="font-semibold">{d.name}</p><p className="text-xs text-muted-foreground">{d.description || `Tubes: ${d.tubes.length}, OD: ${d.config.tubeOdIn}"`}</p></button>)
            : <p className="p-4 text-center text-sm text-muted-foreground">No saved designs found.</p>}</div>
        }</ScrollArea></DialogContent></Dialog>
}

function AttachDialog({isOpen, onClose, jobs, onAttach, isLoading}: {isOpen:boolean; onClose:()=>void; jobs:Job[], onAttach:(jobId:string)=>void, isLoading:boolean}) {
    return <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Attach Design to Job</DialogTitle><DialogDescription>Select a job to associate this tubesheet design with.</DialogDescription></DialogHeader>
        <ScrollArea className="h-72 border rounded-md">{isLoading ? <div className="p-4"><Skeleton className="h-20"/></div> : 
            <div className="p-2 space-y-1">{jobs.length > 0 ? jobs.map(j=><button key={j.id} onClick={()=>onAttach(j.id)} className="w-full text-left p-2 rounded-md hover:bg-muted">
                <p className="font-semibold">{j.title}</p><p className="text-xs text-muted-foreground">{j.id}</p></button>)
            : <p className="p-4 text-center text-sm text-muted-foreground">You have no active jobs to attach this to.</p>}</div>
        }</ScrollArea></DialogContent></Dialog>
}

function drawShell(ctx:CanvasRenderingContext2D,shape:ShellShape,z:number,p:{x:number;y:number}){
  ctx.save(); ctx.strokeStyle="#334155"; ctx.lineWidth=1.5; ctx.setLineDash([8,5]);
  ctx.beginPath();
  switch(shape.type){
    case"circle":{const r=(shape.diameterMm??300)/2;ctx.arc(p.x,p.y,r*z,0,Math.PI*2);break;}
    case"rectangle":{const hw=(shape.widthMm??400)/2,hh=(shape.heightMm??300)/2;ctx.rect(p.x-hw*z,p.y-hh*z,hw*2*z,hh*2*z);break;}
    case"ellipse":{const a=(shape.axisAMm??400)/2,b=(shape.axisBMm??300)/2;ctx.ellipse(p.x,p.y,a*z,b*z,0,0,Math.PI*2);break;}
    case"hexagon":{
      const apothem=(shape.hexSizeMm??300)/2; const R=apothem/(Math.sqrt(3)/2);
      for(let i=0;i<6;i++){ const ang=Math.PI/3*i - Math.PI/6; const x=p.x+R*z*Math.cos(ang), y=p.y+R*z*Math.sin(ang); if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); }
      ctx.closePath();break;
    }
    case"polygon":{
      const pts=shape.polygon??[];
      pts.forEach((pt,i)=>{const x=p.x+pt.x*z,y=p.y+pt.y*z;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);});
      if(pts.length>2)ctx.closePath();break;
    }
  }
  ctx.stroke(); ctx.setLineDash([]); ctx.restore();
}

function rRect(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number){
  ctx.beginPath();
  ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.arcTo(x+w,y,x+w,y+r,r);
  ctx.lineTo(x+w,y+h-r);ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
  ctx.lineTo(x+r,y+h);ctx.arcTo(x,y+h,x,y+h-r,r);
  ctx.lineTo(x,y+r);ctx.arcTo(x,y,x+r,y,r);ctx.closePath();
}



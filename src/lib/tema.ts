// TubeMapper TEMA Standards Engine v4

export const TEMA_TUBE_ODS = [
    { label:'1/4"',  val:0.25  },{ label:'3/8"',  val:0.375 },
    { label:'1/2"',  val:0.5   },{ label:'5/8"',  val:0.625 },
    { label:'3/4"',  val:0.75  },{ label:'7/8"',  val:0.875 },
    { label:'1"',    val:1.0   },{ label:'1-1/4"',val:1.25  },
    { label:'1-1/2"',val:1.5  },{ label:'2"',     val:2.0   },
  ];
  export const PITCH_RATIOS = [
    { label:'1.25× (TEMA min)',val:1.25 },
    { label:'1.33×',           val:1.33 },
    { label:'1.375×',          val:1.375},
    { label:'1.5×',            val:1.5  },
    { label:'2.0×',            val:2.0  },
  ];
  export type PitchPattern = 'triangular'|'rotated-triangular'|'square'|'rotated-square';
  export const PITCH_PATTERNS:{id:PitchPattern;label:string;desc:string}[] = [
    {id:'triangular',        label:'30° Triangular',       desc:'Most common. Maximum tube count.'},
    {id:'rotated-triangular',label:'60° Rot. Triangular',  desc:'Good mechanical cleaning access.'},
    {id:'square',            label:'90° Square',           desc:'Easy lane cleaning. Lower count.'},
    {id:'rotated-square',    label:'45° Rot. Square',      desc:'Better flow, good heat transfer.'},
  ];
  export type ShapeType = 'circle'|'rectangle'|'ellipse'|'hexagon'|'polygon';
  export interface ShellShape {
    type:       ShapeType;
    diameterMm?: number;
    widthMm?:    number;
    heightMm?:   number;
    axisAMm?:    number;
    axisBMm?:    number;
    hexSizeMm?:  number;  // flat-to-flat distance
    polygon?:    {x:number;y:number}[];
  }
  export interface LayoutTube { id:number; x:number; y:number; r:number; row:number; col:number; pass:number; }
  export interface TEMAConfig  { tubeOdIn:number; pitchRatio:number; pattern:PitchPattern; numPasses:number; shape:ShellShape; }
  export interface TEMALayout  { tubes:LayoutTube[]; rows:LayoutTube[][]; tubeOdMm:number; pitchMm:number; pattern:PitchPattern; shape:ShellShape; tubeCount:number; bundleDia:number; pitchRatio:number; }
  
  const IN = 25.4;
  const SQ3H = Math.sqrt(3)/2;  // √3/2 — used for hexagon and triangular pitch
  
  // ── Point-in-shape ────────────────────────────────────────────────────────────
  function inShape(x:number,y:number,s:ShellShape,tubeR:number):boolean {
    switch(s.type){
      case 'circle': {
        const lim=(s.diameterMm??300)/2-tubeR;
        return Math.hypot(x,y)<=lim;
      }
      case 'rectangle': {
        const hw=(s.widthMm??400)/2-tubeR, hh=(s.heightMm??300)/2-tubeR;
        return Math.abs(x)<=hw && Math.abs(y)<=hh;
      }
      case 'ellipse': {
        const a=(s.axisAMm??400)/2-tubeR, b=(s.axisBMm??300)/2-tubeR;
        if(a<=0||b<=0) return false;
        return (x*x)/(a*a)+(y*y)/(b*b)<=1;
      }
      case 'hexagon': {
        // hexSizeMm = flat-to-flat = 2 × apothem (inradius)
        const apothem = (s.hexSizeMm??300)/2 - tubeR;
        if(apothem<=0) return false;
        // Pointy-top hexagon: 3 symmetric axis checks
        // |y|  ≤ apothem
        // |x·√3/2 + y/2| ≤ apothem
        // |x·√3/2 − y/2| ≤ apothem
        return Math.abs(y) <= apothem
            && Math.abs(x*SQ3H + y*0.5) <= apothem
            && Math.abs(x*SQ3H - y*0.5) <= apothem;
      }
      case 'polygon': {
        const poly=s.polygon??[];
        if(poly.length<3) return false;
        let inside=false;
        for(let i=0,j=poly.length-1;i<poly.length;j=i++){
          const {x:xi,y:yi}=poly[i],{x:xj,y:yj}=poly[j];
          if((yi>y)!==(yj>y)&&x<((xj-xi)*(y-yi))/(yj-yi)+xi) inside=!inside;
        }
        return inside;
      }
      default: return false;
    }
  }
  
  function shapeBoundR(s:ShellShape):number {
    switch(s.type){
      case 'circle':    return (s.diameterMm??300)/2;
      case 'rectangle': return Math.hypot((s.widthMm??400)/2,(s.heightMm??300)/2);
      case 'ellipse':   return Math.max((s.axisAMm??400)/2,(s.axisBMm??300)/2);
      case 'hexagon':   return ((s.hexSizeMm??300)/2)/SQ3H; // circumradius = apothem/SQ3H
      case 'polygon': {
        const p=s.polygon??[];
        return p.length?Math.max(...p.map(pt=>Math.hypot(pt.x,pt.y)))+10:150;
      }
    }
  }
  
  function basisVectors(pat:PitchPattern,p:number):[[number,number],[number,number]]{
    switch(pat){
      case 'triangular':         return [[p,0],[p/2,p*SQ3H]];
      case 'rotated-triangular': return [[p*SQ3H,p/2],[0,p]];
      case 'square':             return [[p,0],[0,p]];
      case 'rotated-square':     { const d=p/Math.SQRT2; return [[d,d],[d,-d]]; }
    }
  }
  
  export function generateTEMALayout(cfg:TEMAConfig):TEMALayout {
    const tubeOdMm=cfg.tubeOdIn*IN, pitchMm=tubeOdMm*cfg.pitchRatio, tubeR=tubeOdMm/2;
    const [a1,a2]=basisVectors(cfg.pattern,pitchMm);
    const boundR=shapeBoundR(cfg.shape);
    const rng=Math.ceil(boundR/pitchMm)+2;
  
    const candidates:{x:number;y:number}[]=[];
    outer: for(let i=-rng;i<=rng;i++){
      for(let j=-rng;j<=rng;j++){
        const x=i*a1[0]+j*a2[0], y=i*a1[1]+j*a2[1];
        if(inShape(x,y,cfg.shape,tubeR)){
          candidates.push({x,y});
          if(candidates.length>=18000) break outer;
        }
      }
    }
    const unique:{x:number;y:number}[]=[];
    for(const c of candidates)
      if(!unique.some(u=>Math.hypot(u.x-c.x,u.y-c.y)<pitchMm*0.05)) unique.push(c);
  
    return buildLayout(unique,tubeR,pitchMm,cfg);
  }
  
  function buildLayout(pts:{x:number;y:number}[],tubeR:number,pitchMm:number,cfg:TEMAConfig):TEMALayout{
    const tol=pitchMm*0.42;
    const rowGroups:{x:number;y:number}[][]=[];
    for(const pt of [...pts].sort((a,b)=>a.y-b.y||a.x-b.x)){
      const grp=rowGroups.find(g=>Math.abs(g[0].y-pt.y)<tol);
      if(grp){grp.push(pt);grp.sort((a,b)=>a.x-b.x);}
      else rowGroups.push([pt]);
    }
    rowGroups.sort((a,b)=>a[0].y-b[0].y);
    let id=0;
    const tubes:LayoutTube[]=[],rows:LayoutTube[][]=[];
    rowGroups.forEach((grp,ri)=>{
      const row:LayoutTube[]=[];
      grp.forEach((pt,ci)=>{const t:LayoutTube={id:id++,x:pt.x,y:pt.y,r:tubeR,row:ri,col:ci,pass:1};tubes.push(t);row.push(t);});
      rows.push(row);
    });
    if(cfg.numPasses>1){
      const bs=Math.ceil(rows.length/cfg.numPasses);
      rows.forEach((row,ri)=>{const pp=Math.min(Math.floor(ri/bs)+1,cfg.numPasses);row.forEach(t=>{t.pass=pp;});});
    }
    const bundleDia=tubes.length?2*Math.max(...tubes.map(t=>Math.hypot(t.x,t.y)+tubeR)):0;
    return{tubes,rows,tubeOdMm:tubeR*2,pitchMm,pattern:cfg.pattern,shape:cfg.shape,tubeCount:tubes.length,bundleDia,pitchRatio:cfg.pitchRatio};
  }
  
  export function recalcRowsCols(tubes:LayoutTube[],pitchMm:number):LayoutTube[]{
    if(!tubes.length) return [];
    const tol=pitchMm*0.42;
    const rowGroups:LayoutTube[][]=[];
    for(const t of [...tubes].sort((a,b)=>a.y-b.y||a.x-b.x)){
      const grp=rowGroups.find(g=>Math.abs(g[0].y-t.y)<tol);
      if(grp){grp.push(t);grp.sort((a,b)=>a.x-b.x);}
      else rowGroups.push([t]);
    }
    rowGroups.sort((a,b)=>a[0].y-b[0].y);
    const out:LayoutTube[]=[];
    rowGroups.forEach((grp,ri)=>grp.forEach((t,ci)=>out.push({...t,row:ri,col:ci})));
    return out;
  }
  
  export const PASS_COLORS=['#2563eb','#16a34a','#dc2626','#9333ea','#ea580c','#0891b2','#65a30d','#c2410c'];
  export const ROW_COLORS =['#1d4ed8','#15803d','#b91c1c','#7e22ce','#c2410c','#0e7490','#4d7c0f','#92400e','#1e40af','#166534','#7c2d12','#1e3a5f'];
  export const passColor=(p:number)=>PASS_COLORS[(p-1)%PASS_COLORS.length];
  export const rowColor =(r:number)=>ROW_COLORS[r%ROW_COLORS.length];
  
  export function toCSV(tubes:LayoutTube[],pitchMm:number,tubeOdMm:number,cfg:TEMAConfig):string{
    const inv=1/25.4;
    const hdr=['# TubeMapper TEMA Layout Export',
      `# OD:${cfg.tubeOdIn}" (${tubeOdMm.toFixed(2)}mm) Pitch:${pitchMm.toFixed(2)}mm Pattern:${cfg.pattern} Passes:${cfg.numPasses} Shape:${cfg.shape.type}`,
      `# Tubes:${tubes.length} Generated:${new Date().toISOString()}`,
      'Tube_ID,Row,Col,Pass,X_mm,Y_mm,X_in,Y_in,OD_mm,OD_in,Pitch_mm'];
    const rows=tubes.map(t=>[`R${String(t.row+1).padStart(3,'0')}-C${String(t.col+1).padStart(3,'0')}`,
      t.row+1,t.col+1,t.pass,t.x.toFixed(3),t.y.toFixed(3),(t.x*inv).toFixed(5),(t.y*inv).toFixed(5),
      tubeOdMm.toFixed(3),cfg.tubeOdIn,pitchMm.toFixed(3)].join(','));
    return[...hdr,...rows].join('\n');
  }
  export function toJSON(tubes:LayoutTube[],pitchMm:number,tubeOdMm:number,cfg:TEMAConfig):string{
    return JSON.stringify({
      meta:{tubeOdIn:cfg.tubeOdIn,tubeOdMm,pitchMm,pitchRatio:cfg.pitchRatio,
        pattern:cfg.pattern,passes:cfg.numPasses,shape:cfg.shape,totalTubes:tubes.length,
        generatedAt:new Date().toISOString()},
      tubes:tubes.map(t=>({id:`R${String(t.row+1).padStart(3,'0')}-C${String(t.col+1).padStart(3,'0')}`,
        row:t.row+1,col:t.col+1,pass:t.pass,
        x_mm:+t.x.toFixed(3),y_mm:+t.y.toFixed(3),
        x_in:+(t.x/25.4).toFixed(5),y_in:+(t.y/25.4).toFixed(5),
        od_mm:+tubeOdMm.toFixed(3),od_in:cfg.tubeOdIn})),
    },null,2);
  }
  export function toDXF(tubes:LayoutTube[],tubeOdMm:number):string{
    const lines=['0','SECTION','2','ENTITIES'];
    for(const t of tubes)
      lines.push('0','CIRCLE','8','TUBES','10',t.x.toFixed(4),'20',(-t.y).toFixed(4),'30','0.0','40',(tubeOdMm/2).toFixed(4));
    lines.push('0','ENDSEC','0','EOF');
    return lines.join('\n');
  }
  

'use client';

import * as React from 'react';
import { useForm, FormProvider, useFormContext, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Save, FolderOpen, FileText, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from '@/components/ui/menubar';
import { useFirebase, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, addDoc, setDoc, getDoc, updateDoc, serverTimestamp, query, where } from 'firebase/firestore';
import type { TankDesign } from '@/lib/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Label } from '@/components/ui/label';

const tankDesignerSchema = z.object({
  name: z.string().min(3, "Design name is required."),
  description: z.string().optional(),
  diameter: z.coerce.number().positive({ message: "Diameter must be a positive number." }),
  shellCourses: z.coerce.number().int().positive({ message: "Must be a whole number." }),
  floorPlates: z.coerce.number().int().positive({ message: "Must be a whole number." }),
  shellReadings: z.array(z.object({
    min: z.coerce.number().optional(),
    max: z.coerce.number().optional(),
    avg: z.coerce.number().optional(),
  })).optional(),
   annularReadings: z.array(z.object({
      position: z.string(),
      thickness: z.coerce.number().optional()
  })).optional(),
  floorScans: z.array(z.object({
    plate: z.coerce.number(),
    x: z.coerce.number(),
    y: z.coerce.number(),
    thickness: z.coerce.number().optional(),
  })).optional(),
});

type TankDesignerFormValues = z.infer<typeof tankDesignerSchema>;

const FloorPlanView = ({ onPlateClick }: { onPlateClick: (plateIndex: number) => void }) => {
    const { watch, getValues } = useFormContext<TankDesignerFormValues>();
    const floorPlates = watch('floorPlates');
    const diameter = watch('diameter');
    const [hoveredPlate, setHoveredPlate] = React.useState<number | null>(null);
    const allScans = getValues('floorScans') || [];

    const radius = 250; // SVG radius
    const angleStep = 360 / (floorPlates > 0 ? floorPlates : 1);

    const getWedgePath = (index: number) => {
        const startAngle = angleStep * index - 90;
        const endAngle = angleStep * (index + 1) - 90;
        const start = {
            x: radius + radius * Math.cos(startAngle * Math.PI / 180),
            y: radius + radius * Math.sin(startAngle * Math.PI / 180),
        };
        const end = {
            x: radius + radius * Math.cos(endAngle * Math.PI / 180),
            y: radius + radius * Math.sin(endAngle * Math.PI / 180),
        };
        const largeArcFlag = angleStep > 180 ? 1 : 0;
        return `M ${radius},${radius} L ${start.x},${start.y} A ${radius},${radius} 0 ${largeArcFlag} 1 ${end.x},${end.y} Z`;
    };

    return (
        <div>
            <p className="text-muted-foreground mb-4">
                An interactive map of the tank floor, generated from your configuration. Click a plate to enter readings.
            </p>
            <div className="aspect-square w-full max-w-lg mx-auto">
                <svg viewBox="0 0 500 500">
                    <circle cx="250" cy="250" r="250" fill="hsl(var(--muted))" />
                    {floorPlates > 0 && Array.from({ length: floorPlates }).map((_, index) => {
                        const plateScans = allScans.filter(s => s.plate === index && s.thickness);
                        const hasReadings = plateScans.length > 0;
                        const minThickness = hasReadings ? Math.min(...plateScans.map(s => s.thickness!)) : null;
                        
                        let fillColor = 'hsl(var(--muted))';
                        if (minThickness !== null) {
                            if (minThickness < 0.1) fillColor = 'hsl(var(--destructive) / 0.3)';
                            else if (minThickness < 0.2) fillColor = 'hsl(var(--card-color-3) / 0.3)';
                            else fillColor = 'hsl(var(--card-color-1) / 0.3)';
                        }
                        if (hoveredPlate === index) {
                            fillColor = 'hsl(var(--primary) / 0.2)';
                        }

                        return (
                            <path
                                key={index}
                                d={getWedgePath(index)}
                                fill={fillColor}
                                stroke="hsl(var(--border))"
                                strokeWidth="2"
                                className="cursor-pointer transition-all"
                                onMouseEnter={() => setHoveredPlate(index)}
                                onMouseLeave={() => setHoveredPlate(null)}
                                onClick={() => onPlateClick(index)}
                            />
                        )
                    })}
                    <text x="250" y="250" textAnchor="middle" dy=".3em" className="text-2xl font-bold fill-muted-foreground select-none pointer-events-none">
                        ø{diameter}'
                    </text>
                </svg>
            </div>
        </div>
    );
};

const ShellCoursesView = () => {
    const { control, watch } = useFormContext<TankDesignerFormValues>();
    const shellCourses = watch('shellCourses');
    
    return (
        <div>
            <p className="text-muted-foreground mb-4">
                Enter the minimum, maximum, and average thickness readings for each shell course. The view below represents the tank shell unrolled into a flat plate.
            </p>
            <div className="border rounded-md p-4 space-y-4">
                 {shellCourses > 0 && Array.from({ length: shellCourses }).map((_, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center border-b pb-4 last:border-b-0 last:pb-0">
                        <div className="font-semibold md:col-span-1">Course {index + 1}</div>
                        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                             <FormField
                                control={control}
                                name={`shellReadings.${index}.min`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Min Thickness (in)</FormLabel>
                                        <FormControl><Input type="number" step="0.001" placeholder="e.g., 0.235" {...field} /></FormControl>
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={control}
                                name={`shellReadings.${index}.max`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Max Thickness (in)</FormLabel>
                                        <FormControl><Input type="number" step="0.001" placeholder="e.g., 0.251" {...field} /></FormControl>
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={control}
                                name={`shellReadings.${index}.avg`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Avg Thickness (in)</FormLabel>
                                        <FormControl><Input type="number" step="0.001" placeholder="e.g., 0.246" {...field} /></FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                ))}
                {(!shellCourses || shellCourses === 0) && <p className="text-muted-foreground text-center py-8">Enter the number of shell courses in the configuration panel to begin.</p>}
            </div>
        </div>
    );
};

const AnnularRingView = () => {
    const { control } = useFormContext<TankDesignerFormValues>();
    const { fields } = useFieldArray({
        control,
        name: "annularReadings"
    });
    
    // Positions for inputs
    const positions = [
        { label: "12 o'clock", top: '0%', left: '50%', transform: 'translate(-50%, -50%)' },
        { label: "3 o'clock", top: '50%', left: '100%', transform: 'translate(-50%, -50%)' },
        { label: "6 o'clock", top: '100%', left: '50%', transform: 'translate(-50%, -50%)' },
        { label: "9 o'clock", top: '50%', left: '0%', transform: 'translate(-50%, -50%)' },
    ];
    
    const annularWidth = 50; // SVG units

    return (
        <div>
            <p className="text-muted-foreground mb-4">
                Log thickness readings for the annular ring at critical clock positions.
            </p>
            <div className="relative w-full max-w-lg mx-auto aspect-square">
                 <svg viewBox="0 0 500 500" className="w-full h-full">
                    <circle cx="250" cy="250" r="250" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1" />
                    <circle cx="250" cy="250" r={250 - annularWidth} fill="hsl(var(--muted))" />
                </svg>
                {fields.map((field, index) => {
                    const position = positions.find(p => p.label === field.position);
                    if (!position) return null;
                    return (
                        <div key={field.id} className="absolute" style={{ top: position.top, left: position.left, transform: position.transform }}>
                             <FormField
                                control={control}
                                name={`annularReadings.${index}.thickness`}
                                render={({ field }) => (
                                    <FormItem className="w-40">
                                        <FormLabel className="text-xs text-center block">{position.label}</FormLabel>
                                        <FormControl><Input type="number" step="0.001" placeholder="Thickness (in)" {...field} /></FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const FloorScanEntryDialog = ({
    isOpen,
    onClose,
    plateNumber,
}: {
    isOpen: boolean;
    onClose: () => void;
    plateNumber: number | null;
}) => {
    const { control, getValues } = useFormContext<TankDesignerFormValues>();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "floorScans",
    });

    if (plateNumber === null) return null;
    
    const existingReadingIndices = React.useMemo(() => {
        const allScans = getValues("floorScans") || [];
        const indices: number[] = [];
        allScans.forEach((scan, index) => {
            if (scan.plate === plateNumber) {
                indices.push(index);
            }
        });
        return indices;
    }, [getValues, plateNumber]);


    const handleAddReading = () => {
        // Dummy coordinates for now. A real implementation might get these from a click on the SVG.
        append({ plate: plateNumber, x: Math.random(), y: Math.random(), thickness: undefined });
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Floor Scan Readings for Plate {plateNumber + 1}</DialogTitle>
                    <DialogDescription>
                        Add or edit thickness readings for this floor plate.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-64">
                <div className="space-y-4 pr-4">
                    {existingReadingIndices.map((originalIndex, displayIndex) => (
                        <div key={originalIndex} className="flex items-end gap-2">
                            <FormField
                                control={control}
                                name={`floorScans.${originalIndex}.thickness`}
                                render={({ field }) => (
                                    <FormItem className="flex-grow">
                                        <FormLabel>Reading {displayIndex + 1} (in)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.001" placeholder="e.g., 0.245" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => remove(originalIndex)}
                            >
                                <Trash className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                     {existingReadingIndices.length === 0 && <p className="text-muted-foreground text-center py-8">No readings for this plate yet.</p>}
                </div>
                </ScrollArea>
                <DialogFooter>
                     <Button type="button" variant="outline" onClick={handleAddReading}>
                        Add Reading
                    </Button>
                    <Button onClick={onClose}>Done</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

function SaveDialog({isOpen, onClose, onSave, currentName, currentDescription}: {isOpen:boolean; onClose:()=>void; onSave:(name:string, desc:string)=>void, currentName?: string, currentDescription?: string}) {
    const [name, setName] = React.useState(currentName || "");
    const [desc, setDesc] = React.useState(currentDescription || "");

    React.useEffect(() => {
        if(isOpen) {
            setName(currentName || "New Tank Design");
            setDesc(currentDescription || "");
        }
    }, [isOpen, currentName, currentDescription])

    return <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent><DialogHeader><DialogTitle>Save Design As</DialogTitle><DialogDescription>Give your tank layout a name and an optional description.</DialogDescription></DialogHeader>
        <div className="space-y-4 py-2">
            <div><Label htmlFor="design-name">Design Name</Label><Input id="design-name" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g., West-101 Crude Tank"/></div>
            <div><Label htmlFor="design-desc">Description (Optional)</Label><Textarea id="design-desc" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="A brief description of this design..."/></div>
        </div>
        <DialogFooter><DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose><Button onClick={()=>onSave(name,desc)} disabled={!name}>Save</Button></DialogFooter>
        </DialogContent></Dialog>
}

function LoadDialog({isOpen, onClose, designs, onLoad, isLoading}: {isOpen:boolean; onClose:()=>void; designs:TankDesign[], onLoad:(design:TankDesign)=>void, isLoading:boolean}) {
    return <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Load Design</DialogTitle><DialogDescription>Select one of your previously saved designs to load it into the editor.</DialogDescription></DialogHeader>
        <ScrollArea className="h-72 border rounded-md">{isLoading ? <div className="p-4"><Skeleton className="h-20"/></div> : 
            <div className="p-2 space-y-1">{designs.length > 0 ? designs.map(d=><button key={d.id} onClick={()=>onLoad(d)} className="w-full text-left p-2 rounded-md hover:bg-muted">
                <p className="font-semibold">{d.name}</p><p className="text-xs text-muted-foreground">{d.description || `Diameter: ${d.config.diameter}ft`}</p></button>)
            : <p className="p-4 text-center text-sm text-muted-foreground">No saved designs found.</p>}</div>
        }</ScrollArea></DialogContent></Dialog>
}


export default function TankDesignerPage() {
    const form = useForm<TankDesignerFormValues>({
        resolver: zodResolver(tankDesignerSchema),
        defaultValues: {
            name: "New Tank Design",
            description: "",
            diameter: 40,
            shellCourses: 5,
            floorPlates: 8,
            annularReadings: [
                { position: "12 o'clock", thickness: undefined },
                { position: "3 o'clock", thickness: undefined },
                { position: "6 o'clock", thickness: undefined },
                { position: "9 o'clock", thickness: undefined },
            ],
            floorScans: [],
        },
    });
    
    const router = useRouter();
    const searchParams = useSearchParams();
    const { firestore, user } = useFirebase();
    const [designId, setDesignId] = React.useState<string | null>(null);
    const [isSaveModalOpen, setIsSaveModalOpen] = React.useState(false);
    const [isLoadModalOpen, setIsLoadModalOpen] = React.useState(false);
    const [editingPlate, setEditingPlate] = React.useState<number | null>(null);

    const designsQuery = useMemoFirebase(() => (firestore && user) ? query(collection(firestore, 'tankDesigns'), where('userId', '==', user.uid)) : null, [firestore, user]);
    const { data: savedDesigns, isLoading: isLoadingDesigns } = useCollection<TankDesign>(designsQuery);

    const applyDesignToForm = React.useCallback((design: TankDesign | null) => {
        if (!design) return;
        const { config, ...restOfDesign } = design;
        form.reset({
            ...restOfDesign,
            ...config,
            floorScans: design.floorScans || [],
            annularReadings: design.annularReadings || [],
            shellReadings: design.shellReadings || [],
        });
        setDesignId(design.id);
    }, [form]);

    React.useEffect(() => {
        const designIdFromUrl = searchParams.get('designId');
        if (designIdFromUrl && firestore && user && designIdFromUrl !== designId) {
          getDoc(doc(firestore, 'tankDesigns', designIdFromUrl)).then(docSnap => {
            if (docSnap.exists() && docSnap.data().userId === user.uid) {
              applyDesignToForm(docSnap.data() as TankDesign);
              toast.success(`Loaded design: ${docSnap.data().name}`);
            } else {
              toast.error("Design not found or permission denied.", {
                description: "You are being redirected to the main designer.",
              });
              router.replace('/dashboard/tank-designer'); 
            }
          }).catch((err) => {
            console.error("Error loading design:", err);
            toast.error("Error loading design.", {
              description: "There was a problem fetching the design from the database.",
            });
            router.replace('/dashboard/tank-designer');
          });
        }
    }, [searchParams, firestore, user, applyDesignToForm, router, designId]);

    const watchedName = form.watch('name');
    const watchedDescription = form.watch('description');

    const handleSave = async () => {
        if (!designId) {
            setIsSaveModalOpen(true);
            return;
        }
        if (!firestore || !user) return;
        
        await form.trigger();
        if (!form.formState.isValid) {
            toast.error("Validation Error", { description: "Please check your inputs."});
            return;
        }

        toast.info("Saving design...");
        try {
            const values = form.getValues();
            const { name, description, diameter, shellCourses, floorPlates, ...restOfValues } = values;
            const dataToSave = {
                name,
                description,
                userId: user.uid,
                config: { diameter, shellCourses, floorPlates },
                ...restOfValues,
                modifiedAt: serverTimestamp(),
            };
            await updateDoc(doc(firestore, 'tankDesigns', designId), dataToSave);
            toast.success("Design Saved!", { description: `"${values.name}" has been updated.`});
        } catch(e) {
            console.error(e);
            toast.error("Save Failed", { description: "Could not save design."});
        }
    };

    const handleSaveAs = async (name: string, description: string) => {
        if (!firestore || !user) return;

        await form.trigger();
        if (!form.formState.isValid) {
            toast.error("Validation Error", { description: "Please check your inputs."});
            return;
        }

        setIsSaveModalOpen(false);
        toast.info("Saving new design...");
        try {
            const values = form.getValues();
            const { diameter, shellCourses, floorPlates, ...restOfValues } = values;

            const newDocRef = doc(collection(firestore, 'tankDesigns'));
            const newDesign: Omit<TankDesign, 'createdAt' | 'modifiedAt'> & { createdAt: any; modifiedAt: any; } = {
                id: newDocRef.id,
                userId: user.uid,
                name,
                description: description || '',
                config: { diameter, shellCourses, floorPlates },
                shellReadings: restOfValues.shellReadings,
                annularReadings: restOfValues.annularReadings,
                floorScans: restOfValues.floorScans,
                createdAt: serverTimestamp(),
                modifiedAt: serverTimestamp(),
            };
            await setDoc(newDocRef, newDesign);
            setDesignId(newDocRef.id);
            form.setValue('name', name);
            form.setValue('description', description);
            toast.success("Design Saved!", { description: `"${name}" has been saved.`});
        } catch(e) {
            console.error(e);
            toast.error("Save Failed", { description: "Could not save new design."});
        }
    };
    
    const handleLoadDesign = (design: TankDesign) => {
        setIsLoadModalOpen(false);
        router.push(`/dashboard/tank-designer?designId=${design.id}`);
    };
    
    const handlePlateClick = (plateIndex: number) => {
        setEditingPlate(plateIndex);
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(() => handleSave())}>
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                           <Database className="h-8 w-8 text-primary" />
                           <div>
                                <h1 className="text-2xl font-headline font-semibold">Storage Tank Designer</h1>
                                <p className="text-muted-foreground mt-1">Visualize inspection data for API 650/653 storage tanks.</p>
                            </div>
                        </div>
                         <Menubar>
                            <MenubarMenu>
                                <MenubarTrigger>File</MenubarTrigger>
                                <MenubarContent>
                                    <MenubarItem onSelect={handleSave} disabled={!designId}>Save</MenubarItem>
                                    <MenubarItem onSelect={() => setIsSaveModalOpen(true)}>Save As...</MenubarItem>
                                    <MenubarItem onSelect={() => setIsLoadModalOpen(true)}>Load...</MenubarItem>
                                </MenubarContent>
                            </MenubarMenu>
                        </Menubar>
                    </div>

                    <div className="grid lg:grid-cols-4 gap-8 items-start">
                        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Configuration</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                     <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Design Name</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="diameter"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Diameter (ft)</FormLabel>
                                                <FormControl><Input type="number" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="shellCourses"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Shell Courses</FormLabel>
                                                <FormControl><Input type="number" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={form.control}
                                        name="floorPlates"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Floor Plates</FormLabel>
                                                <FormControl><Input type="number" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                        <div className="lg:col-span-3">
                             <Tabs defaultValue="floor">
                                <TabsList>
                                    <TabsTrigger value="floor">Floor Plan</TabsTrigger>
                                    <TabsTrigger value="shell">Shell Courses</TabsTrigger>
                                    <TabsTrigger value="annular">Annular Ring</TabsTrigger>
                                </TabsList>
                                <TabsContent value="floor" className="mt-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Floor Scan Mapping</CardTitle>
                                            <CardDescription>Visualize MFL or UT floor scan data.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <FloorPlanView onPlateClick={handlePlateClick} />
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="shell" className="mt-4">
                                     <Card>
                                        <CardHeader>
                                            <CardTitle>Shell Course Mapping</CardTitle>
                                            <CardDescription>Record wall thickness readings for each course.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <ShellCoursesView />
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="annular" className="mt-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Annular Plate Mapping</CardTitle>
                                            <CardDescription>Inspect the critical corrosion zone at the shell-to-floor junction.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <AnnularRingView />
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </form>
            <FloorScanEntryDialog
                isOpen={editingPlate !== null}
                onClose={() => setEditingPlate(null)}
                plateNumber={editingPlate}
            />
             <SaveDialog 
                isOpen={isSaveModalOpen} 
                onClose={() => setIsSaveModalOpen(false)} 
                onSave={handleSaveAs} 
                currentName={watchedName}
                currentDescription={watchedDescription}
            />
            <LoadDialog 
                isOpen={isLoadModalOpen} 
                onClose={() => setIsLoadModalOpen(false)} 
                designs={savedDesigns || []} 
                onLoad={handleLoadDesign} 
                isLoading={isLoadingDesigns} 
            />
        </FormProvider>
    );
}

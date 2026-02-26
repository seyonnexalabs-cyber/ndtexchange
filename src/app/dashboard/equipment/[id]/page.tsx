
'use client';
import * as React from 'react';
import { useMemo, useState, useEffect, useRef } from "react";
import { notFound, useSearchParams, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Equipment, EquipmentHistory, NDTTechnique, Job, EquipmentType, PlatformUser } from "@/lib/types";
import { ChevronLeft, Wrench, Calendar, Info, History, Clock, Send, Building, SlidersHorizontal, Tag, ChevronsUpDown, Edit, Printer, QrCode, Package, PlusCircle, ChevronRight, MoreVertical, AlertTriangle } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { cn, GLOBAL_DATE_FORMAT, GLOBAL_DATETIME_FORMAT, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CustomDateInput } from '@/components/ui/custom-date-input';
import Image from "next/image";
import { useFirebase, useDoc, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { doc, updateDoc, collection, setDoc, arrayUnion } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

const equipmentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters."),
  type: z.enum(['Instrument', 'Probe', 'Source', 'Sensor', 'Calibration Standard', 'Accessory', 'Visual Aid']),
  techniques: z.array(z.string()).min(1, "At least one technique is required."),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  status: z.enum(['Available', 'In Use', 'Calibration Due', 'Out of Service', 'Under Service']),
  nextCalibration: z.date(),
  thumbnail: z.any().optional(),
  parentId: z.string().optional(),
});

type EquipmentFormValues = z.infer<typeof equipmentSchema>;

const EquipmentForm = ({ allEquipment, allTechniques, onSubmit, onCancel, defaultValues, isEditing }: { 
    allEquipment: Equipment[], 
    allTechniques: NDTTechnique[],
    onSubmit: (values: EquipmentFormValues) => void, 
    onCancel: () => void,
    defaultValues: Partial<EquipmentFormValues>,
    isEditing: boolean,
}) => {
    const form = useForm<EquipmentFormValues>({
        resolver: zodResolver(equipmentSchema),
        defaultValues,
    });
    
    useEffect(() => {
        form.reset(defaultValues);
        if (typeof defaultValues.thumbnail === 'string') {
            setThumbnailPreview(defaultValues.thumbnail);
        }
    }, [defaultValues, form]);
    
    const [thumbnailPreview, setThumbnailPreview] = React.useState<string | null>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const possibleParents = React.useMemo(() => allEquipment.filter(e => e.id !== defaultValues.id && !e.parentId), [defaultValues.id, allEquipment]);

    const handleFileChange = (file: File | null) => {
        form.setValue('thumbnail', file);
        if (thumbnailPreview && thumbnailPreview.startsWith('blob:')) URL.revokeObjectURL(thumbnailPreview);
        if (file) {
            if (!file.type.startsWith('image/')) {
                setThumbnailPreview(null);
                form.setError('thumbnail', { type: 'manual', message: 'Only image files are accepted.' });
                return;
            }
            if (file.size > MAX_FILE_SIZE_BYTES) {
                setThumbnailPreview(null);
                form.setError('thumbnail', { type: 'manual', message: `File size cannot exceed ${MAX_FILE_SIZE_MB}MB.` });
                return;
            }
            setThumbnailPreview(URL.createObjectURL(file));
            form.clearErrors('thumbnail');
        } else {
            setThumbnailPreview(typeof defaultValues.thumbnail === 'string' ? defaultValues.thumbnail : null);
        }
    };

    const createDragHandlers = (setIsDragging: React.Dispatch<React.SetStateAction<boolean>>, handleFile: (file: File | null) => void) => ({
        handleDragEnter: (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); },
        handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); },
        handleDragOver: (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); },
        handleDrop: (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault(); e.stopPropagation(); setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
        },
    });

    const dragHandlers = createDragHandlers(setIsDragging, handleFileChange);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{isEditing ? `Edit: ${defaultValues.name}` : 'Add New Equipment'}</CardTitle>
                <CardDescription>{isEditing ? `Update the details for this piece of equipment.` : 'Enter the details for the new piece of equipment.'}</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                        <FormField control={form.control} name="type" render={({ field }) => ( <FormItem> <FormLabel>Type</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl> <SelectContent> <SelectItem value="Instrument">Instrument</SelectItem> <SelectItem value="Probe">Probe/Transducer</SelectItem> <SelectItem value="Source">Source</SelectItem> <SelectItem value="Sensor">Sensor/Detector</SelectItem> <SelectItem value="Calibration Standard">Calibration Standard</SelectItem> <SelectItem value="Accessory">Accessory</SelectItem> <SelectItem value="Visual Aid">Visual Aid</SelectItem> </SelectContent> </Select> <FormMessage /> </FormItem> )}/>
                        <FormField control={form.control} name="parentId" render={({ field }) => ( <FormItem> <FormLabel>Parent Equipment (Optional)</FormLabel> <Select onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)} defaultValue={field.value}> <FormControl> <SelectTrigger> <SelectValue placeholder="Assign to a kit or system" /> </SelectTrigger> </FormControl> <SelectContent> <SelectItem value="none">None (Standalone Equipment)</SelectItem> {possibleParents.map(parent => ( <SelectItem key={parent.id} value={parent.id}>{parent.name}</SelectItem> ))} </SelectContent> </Select> <FormMessage /> </FormItem> )}/>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="manufacturer" render={({ field }) => ( <FormItem> <FormLabel>Manufacturer (Optional)</FormLabel> <FormControl><Input placeholder="e.g., Olympus" {...field} value={field.value || ''} /></FormControl> <FormMessage /> </FormItem> )}/>
                            <FormField control={form.control} name="model" render={({ field }) => ( <FormItem> <FormLabel>Model (Optional)</FormLabel> <FormControl><Input placeholder="e.g., 45MG" {...field} value={field.value || ''} /></FormControl> <FormMessage /> </FormItem> )}/>
                        </div>
                        <FormField control={form.control} name="serialNumber" render={({ field }) => ( <FormItem> <FormLabel>Serial Number (Optional)</FormLabel> <FormControl><Input placeholder="e.g., SN-12345" {...field} value={field.value || ''} /></FormControl> <FormMessage /> </FormItem> )}/>
                        <FormField control={form.control} name="techniques" render={({ field }) => ( <FormItem className="flex flex-col"> <FormLabel>Technique(s)</FormLabel> <Popover> <PopoverTrigger asChild> <FormControl> <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value?.length && "text-muted-foreground")}> {field.value?.length > 0 ? `${field.value.length} selected` : "Select techniques"} <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /> </Button> </FormControl> </PopoverTrigger> <PopoverContent className="w-[--radix-popover-trigger-width] p-0"> <ScrollArea className="h-48"><div className="p-2"> {allTechniques.map((tech) => ( <div key={tech.id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md"> <Checkbox id={`tech-${tech.id}`} checked={field.value?.includes(tech.acronym)} onCheckedChange={(checked) => { return checked ? field.onChange([...(field.value || []), tech.acronym]) : field.onChange(field.value?.filter((value) => value !== tech.acronym)); }}/> <label htmlFor={`tech-${tech.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 w-full">{tech.title} ({tech.acronym})</label> </div> ))} </div></ScrollArea> </PopoverContent> </Popover> <FormMessage /> </FormItem> )}/>
                        <FormField control={form.control} name="status" render={({ field }) => ( <FormItem> <FormLabel>Status</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl> <SelectContent> <SelectItem value="Available">Available</SelectItem> <SelectItem value="In Use">In Use</SelectItem> <SelectItem value="Calibration Due">Calibration Due</SelectItem> <SelectItem value="Out of Service">Out of Service</SelectItem> <SelectItem value="Under Service">Under Service</SelectItem> </SelectContent> </Select> <FormMessage /> </FormItem> )}/>
                        <FormField control={form.control} name="nextCalibration" render={({ field }) => ( <FormItem className="flex flex-col"> <FormLabel>Next Calibration Date</FormLabel> <FormControl><CustomDateInput {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                        <FormField control={form.control} name="thumbnail" render={() => ( <FormItem> <FormLabel>Thumbnail Image</FormLabel> <div {...dragHandlers} onClick={() => fileInputRef.current?.click()} className={cn( "relative w-full h-48 rounded-md border-2 border-dashed flex items-center justify-center text-center text-muted-foreground cursor-pointer transition-colors", isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-muted/50" )} > {thumbnailPreview ? ( <> <Image src={thumbnailPreview} alt="Thumbnail preview" fill className="object-contain rounded-md p-2" /> <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-md"><p className="text-white font-semibold">Click or drag to replace</p></div> </> ) : ( <p>Click or drag &amp; drop to upload thumbnail</p> )} <FormControl> <Input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} /> </FormControl> </div> <FormDescription>This image will be used as the display card for the equipment.</FormDescription> <FormMessage /> </FormItem> )}/>
                        <CardFooter className="px-0 pt-4 flex justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                            <Button type="submit">{isEditing ? 'Save Changes' : 'Submit for Approval'}</Button>
                        </CardFooter>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};


export default function AddEditEquipmentPage() {
    const params = useParams();
    const id = params.id as string;
    const isEditing = id !== 'add';
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { firestore, user } = useFirebase();

    const { data: userProfile, isLoading: isLoadingProfile } = useDoc<PlatformUser>(
        useMemoFirebase(() => (firestore && user ? doc(firestore, 'users', user.uid) : null), [firestore, user])
    );
    const { data: equipmentToEdit, isLoading: isLoadingEquipmentToEdit } = useDoc<Equipment>(
        useMemoFirebase(() => (isEditing && firestore ? doc(firestore, 'equipment', id) : null), [isEditing, id, firestore])
    );
    const { data: allEquipment, isLoading: isLoadingAllEquipment } = useCollection<Equipment>(
        useMemoFirebase(() => (firestore ? collection(firestore, 'equipment') : null), [firestore])
    );
    const { data: allTechniques, isLoading: isLoadingTechniques } = useCollection<NDTTechnique>(
        useMemoFirebase(() => (firestore ? collection(firestore, 'techniques') : null), [firestore])
    );

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    };

    const handleFormSubmit = async (values: EquipmentFormValues) => {
        if (!firestore || !userProfile) return;
        
        const { thumbnail, ...equipmentData } = values;
        const dataToSave = {
            ...equipmentData,
            providerId: userProfile.companyId,
            nextCalibration: format(values.nextCalibration, 'yyyy-MM-dd')
        };
        
        try {
            if (isEditing) {
                const equipmentDocRef = doc(firestore, 'equipment', id);
                await updateDoc(equipmentDocRef, {
                    ...dataToSave,
                    history: arrayUnion({ event: 'Updated', user: userProfile.name, timestamp: new Date().toISOString() })
                });
                toast({ title: "Equipment Updated", description: `${values.name} has been updated.` });
            } else {
                const newEquipmentRef = doc(collection(firestore, 'equipment'));
                await setDoc(newEquipmentRef, {
                    id: newEquipmentRef.id,
                    ...dataToSave,
                    approvalStatus: 'Pending Approval',
                    isPublic: false,
                    history: [{ event: 'Created', user: userProfile.name, timestamp: new Date().toISOString() }]
                });
                toast({ title: "Equipment Submitted", description: `${values.name} is awaiting approval.` });
            }
            router.push(constructUrl('/dashboard/equipment'));
        } catch (error) {
            console.error("Error saving equipment:", error);
            toast({ variant: "destructive", title: "Save Failed", description: "Could not save equipment." });
        }
    };
    
    const isLoading = isLoadingProfile || isLoadingAllEquipment || isLoadingTechniques || (isEditing && isLoadingEquipmentToEdit);

    if (isLoading) {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-screen" />
            </div>
        )
    }

    if (isEditing && !equipmentToEdit) {
        notFound();
    }
    
    const defaultValues: Partial<EquipmentFormValues> = isEditing && equipmentToEdit ? {
        ...equipmentToEdit,
        nextCalibration: equipmentToEdit.nextCalibration !== 'N/A' ? new Date(equipmentToEdit.nextCalibration) : new Date(),
        thumbnail: equipmentToEdit.thumbnailUrl,
    } : {
        name: "",
        type: 'Instrument',
        techniques: [],
        status: "Available",
        nextCalibration: new Date(),
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Button asChild variant="outline" size="sm" className="mb-4">
                <Link href={constructUrl("/dashboard/equipment")}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Equipment
                </Link>
            </Button>
            <EquipmentForm
                isEditing={isEditing}
                defaultValues={defaultValues}
                onSubmit={handleFormSubmit}
                onCancel={() => router.push(constructUrl('/dashboard/equipment'))}
                allEquipment={allEquipment || []}
                allTechniques={allTechniques || []}
            />
        </div>
    )
}

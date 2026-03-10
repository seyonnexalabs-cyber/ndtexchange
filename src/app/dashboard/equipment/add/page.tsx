
'use client';
import * as React from 'react';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronsUpDown } from "lucide-react";
import { useFirebase, useCollection, useMemoFirebase, useUser, useStorage } from '@/firebase';
import { doc, collection, setDoc, arrayUnion } from 'firebase/firestore';
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import { Equipment, EquipmentHistory, NDTTechnique, PlatformUser } from "@/lib/types";
import { format } from 'date-fns';
import { cn, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from '@/lib/utils';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CustomDateInput } from '@/components/ui/custom-date-input';


const equipmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  type: z.enum(['Instrument', 'Probe', 'Source', 'Sensor', 'Calibration Standard', 'Accessory', 'Visual Aid']),
  techniques: z.array(z.string()).min(1, "At least one technique is required."),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  nextCalibration: z.date({ required_error: "Please select a date." }),
  thumbnail: z.any().optional(),
  parentId: z.string().optional(),
});

type EquipmentFormValues = z.infer<typeof equipmentSchema>;


export default function AddEquipmentPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { firestore, user, storage } = useFirebase();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const { data: userProfile, isLoading: isLoadingProfile } = useDoc<PlatformUser>(
        useMemoFirebase(() => (firestore && user ? doc(firestore, 'users', user.uid) : null), [firestore, user])
    );
    const { data: allEquipment, isLoading: isLoadingAllEquipment } = useCollection<Equipment>(
        useMemoFirebase(() => (firestore ? collection(firestore, 'equipment') : null), [firestore])
    );
    const { data: allTechniques, isLoading: isLoadingTechniques } = useCollection<NDTTechnique>(
        useMemoFirebase(() => (firestore ? collection(firestore, 'techniques') : null), [firestore])
    );

    const form = useForm<EquipmentFormValues>({
        resolver: zodResolver(equipmentSchema),
        defaultValues: { name: "", type: 'Instrument', techniques: [] },
    });
    
    React.useEffect(() => {
        if (!form.getValues('nextCalibration')) {
            form.setValue('nextCalibration', new Date());
        }
    }, [form]);

    const [thumbnailPreview, setThumbnailPreview] = React.useState<string | null>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const possibleParents = React.useMemo(() => allEquipment?.filter(e => !e.parentId) || [], [allEquipment]);

    const handleFileChange = (file: File | null) => {
        form.setValue('thumbnail', file);
        if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
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
            setThumbnailPreview(null);
        }
    };
    
    const dragHandlers = {
        onDragEnter: (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); },
        onDragLeave: (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); },
        onDragOver: (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); },
        onDrop: (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault(); e.stopPropagation(); setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) handleFileChange(e.dataTransfer.files[0]);
        },
    };

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    };

    const handleFormSubmit = async (values: EquipmentFormValues) => {
        if (!firestore || !userProfile || !storage) return;
        setIsSubmitting(true);
        
        const { thumbnail, ...equipmentData } = values;
        
        const newEquipmentRef = doc(collection(firestore, 'equipment'));
        
        let thumbnailUrl: string | undefined = undefined;
        if (thumbnail) {
            const file = thumbnail as File;
            const equipThumbnailRef = storageRef(storage, `equipment/${newEquipmentRef.id}/thumbnail-${file.name}`);
            try {
                const snapshot = await uploadBytes(equipThumbnailRef, file);
                thumbnailUrl = await getDownloadURL(snapshot.ref);
            } catch (error) {
                console.error("Error uploading thumbnail:", error);
                toast.error("Thumbnail Upload Failed");
                setIsSubmitting(false);
                return;
            }
        }

        const newHistoryEntry: EquipmentHistory = { event: 'Created', user: userProfile.name, timestamp: new Date().toISOString(), notes: 'Item created in inventory.' };

        const dataToSave = {
            id: newEquipmentRef.id,
            ...equipmentData,
            providerId: userProfile.companyId,
            thumbnailUrl,
            nextCalibration: format(values.nextCalibration, 'yyyy-MM-dd'),
            status: 'Available',
            approvalStatus: 'Pending Approval',
            isPublic: false,
            history: [newHistoryEntry]
        };
        
        try {
            await setDoc(newEquipmentRef, dataToSave);
            toast.success("Equipment Submitted", { description: `${values.name} is awaiting approval.` });
            router.push(constructUrl('/dashboard/equipment'));
        } catch (error) {
            console.error("Error saving equipment:", error);
            toast.error("Save Failed", { description: "Could not save equipment." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const isLoading = isLoadingProfile || isLoadingAllEquipment || isLoadingTechniques;

    if (isLoading) {
        return <div className="max-w-2xl mx-auto"><Skeleton className="h-screen" /></div>;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Link href={constructUrl("/dashboard/equipment")} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mb-4")}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Equipment
            </Link>
            <Card>
                <CardHeader>
                    <CardTitle>Add New Equipment</CardTitle>
                    <CardDescription>Enter the details for the new piece of equipment.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                            <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                            <FormField control={form.control} name="type" render={({ field }) => ( <FormItem> <FormLabel>Type</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl> <SelectContent> <SelectItem value="Instrument">Instrument</SelectItem> <SelectItem value="Probe">Probe/Transducer</SelectItem> <SelectItem value="Source">Source</SelectItem> <SelectItem value="Sensor">Sensor/Detector</SelectItem> <SelectItem value="Calibration Standard">Calibration Standard</SelectItem> <SelectItem value="Accessory">Accessory</SelectItem> <SelectItem value="Visual Aid">Visual Aid</SelectItem> </SelectContent> </Select> <FormMessage /> </FormItem> )}/>
                            <FormField control={form.control} name="parentId" render={({ field }) => ( <FormItem> <FormLabel>Parent Equipment (Optional)</FormLabel> <Select onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)} defaultValue={field.value}> <FormControl> <SelectTrigger> <SelectValue placeholder="Assign to a kit or system" /> </SelectTrigger> </FormControl> <SelectContent> <SelectItem value="none">None (Standalone Equipment)</SelectItem> {possibleParents.map(parent => ( <SelectItem key={parent.id} value={parent.id}>{parent.name}</SelectItem> ))} </SelectContent> </Select> <FormMessage /> </FormItem> )}/>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="manufacturer" render={({ field }) => ( <FormItem> <FormLabel>Manufacturer (Optional)</FormLabel> <FormControl><Input placeholder="e.g., Olympus" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                                <FormField control={form.control} name="model" render={({ field }) => ( <FormItem> <FormLabel>Model (Optional)</FormLabel> <FormControl><Input placeholder="e.g., 45MG" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                            </div>
                            <FormField control={form.control} name="serialNumber" render={({ field }) => ( <FormItem> <FormLabel>Serial Number (Optional)</FormLabel> <FormControl><Input placeholder="e.g., SN-12345" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                            <FormField control={form.control} name="techniques" render={({ field }) => ( <FormItem className="flex flex-col"> <FormLabel>Technique(s)</FormLabel> <Popover> <PopoverTrigger asChild> <FormControl> <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value?.length && "text-muted-foreground")}> {field.value?.length > 0 ? `${field.value.length} selected` : "Select techniques"} <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /> </Button> </FormControl> </PopoverTrigger> <PopoverContent className="w-[--radix-popover-trigger-width] p-0"> <ScrollArea className="h-48"><div className="p-2"> {(allTechniques || []).map((tech) => ( <div key={tech.id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md"> <Checkbox id={`tech-${tech.id}`} checked={field.value?.includes(tech.acronym)} onCheckedChange={(checked) => { return checked ? field.onChange([...(field.value || []), tech.acronym]) : field.onChange(field.value?.filter((value) => value !== tech.acronym)); }}/> <label htmlFor={`tech-${tech.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 w-full">{tech.title} ({tech.acronym})</label> </div> ))} </div></ScrollArea> </PopoverContent> </Popover> <FormMessage /> </FormItem> )}/>
                            <FormField control={form.control} name="nextCalibration" render={({ field }) => ( <FormItem className="flex flex-col"> <FormLabel>Next Calibration Date</FormLabel> <FormControl><CustomDateInput {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                            <FormField control={form.control} name="thumbnail" render={() => ( <FormItem> <FormLabel>Thumbnail Image</FormLabel> <div {...dragHandlers} onClick={() => fileInputRef.current?.click()} className={cn( "relative w-full h-48 rounded-md border-2 border-dashed flex items-center justify-center text-center text-muted-foreground cursor-pointer transition-colors", isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-muted/50" )} > {thumbnailPreview ? ( <> <Image src={thumbnailPreview} alt="Thumbnail preview" fill className="object-contain rounded-md p-2" /> <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-md"><p className="text-white font-semibold">Click or drag to replace</p></div> </> ) : ( <p>Click or drag &amp; drop to upload thumbnail</p> )} <FormControl> <Input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} /> </FormControl> </div> <FormDescription>This image will be used as the display card for the equipment.</FormDescription> <FormMessage /> </FormItem> )}/>
                            <CardFooter className="px-0 pt-4 flex justify-end gap-2">
                                <Button type="button" variant="ghost" onClick={() => router.push(constructUrl('/dashboard/equipment'))}>Cancel</Button>
                                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit for Approval'}</Button>
                            </CardFooter>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}

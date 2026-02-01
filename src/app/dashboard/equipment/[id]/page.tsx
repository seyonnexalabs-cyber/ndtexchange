
'use client';
import * as React from 'react';
import { useMemo, useState } from "react";
import { notFound, useSearchParams, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { inspectorAssets as initialEquipment, InspectorAsset, EquipmentHistory, NDTTechniques, jobs, EquipmentType } from "@/lib/placeholder-data";
import { ChevronLeft, Wrench, Calendar, Info, History, Clock, Send, Building, SlidersHorizontal, Tag, ChevronsUpDown, Edit, Printer, QrCode, Package, PlusCircle, ChevronRight, MoreVertical } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { cn, GLOBAL_DATE_FORMAT, GLOBAL_DATETIME_FORMAT } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CustomDateInput } from '@/components/ui/custom-date-input';
import Image from "next/image";
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


const ClientFormattedDate = ({ timestamp }: { timestamp: string }) => {
    const [formattedDate, setFormattedDate] = React.useState<string | null>(null);

    React.useEffect(() => {
        // This code runs only on the client, after the component has mounted.
        setFormattedDate(format(parseISO(timestamp), GLOBAL_DATETIME_FORMAT));
    }, [timestamp]);

    // On the server and during the initial client render, formattedDate is null.
    // We return a placeholder to prevent the mismatch.
    return <>{formattedDate || '...'}</>;
};

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

const EquipmentForm = ({ equipment, allEquipment, onSubmit, onCancel }: { equipment: InspectorAsset, allEquipment: InspectorAsset[], onSubmit: (values: EquipmentFormValues) => void, onCancel: () => void }) => {
    const form = useForm<EquipmentFormValues>({
        resolver: zodResolver(equipmentSchema),
        defaultValues: {
            ...equipment,
            nextCalibration: equipment.nextCalibration !== 'N/A' ? new Date(equipment.nextCalibration) : new Date(),
        }
    });
    
    const image = React.useMemo(() => equipment?.imageId ? PlaceHolderImages.find(p => p.id === equipment.imageId) : undefined, [equipment]);
    const [thumbnailPreview, setThumbnailPreview] = React.useState<string | null>(image?.imageUrl || null);
    const [isDragging, setIsDragging] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const possibleParents = React.useMemo(() => allEquipment.filter(e => e.id !== equipment.id && !e.parentId), [equipment.id, allEquipment]);

    React.useEffect(() => {
        return () => {
            if (thumbnailPreview && thumbnailPreview.startsWith('blob:')) {
                URL.revokeObjectURL(thumbnailPreview);
            }
        };
    }, [thumbnailPreview]);
    
    const handleFileChange = (file: File | null) => {
        form.setValue('thumbnail', file);
        if (thumbnailPreview && thumbnailPreview.startsWith('blob:')) {
            URL.revokeObjectURL(thumbnailPreview);
        }
        if (file) {
            if (file.type.startsWith('image/')) {
                setThumbnailPreview(URL.createObjectURL(file));
                form.clearErrors('thumbnail');
            } else {
                setThumbnailPreview(null);
                form.setError('thumbnail', { type: 'manual', message: 'Only image files are accepted.' });
            }
        } else {
            setThumbnailPreview(image?.imageUrl || null);
        }
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileChange(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Editing: {equipment.name}</CardTitle>
                <CardDescription>Make changes to the equipment details below.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="Instrument">Instrument</SelectItem>
                                            <SelectItem value="Probe">Probe/Transducer</SelectItem>
                                            <SelectItem value="Source">Source</SelectItem>
                                            <SelectItem value="Sensor">Sensor/Detector</SelectItem>
                                            <SelectItem value="Calibration Standard">Calibration Standard</SelectItem>
                                            <SelectItem value="Accessory">Accessory</SelectItem>
                                            <SelectItem value="Visual Aid">Visual Aid</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="parentId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Parent Equipment (Optional)</FormLabel>
                                    <Select onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Assign to a kit or system" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">None (Standalone Equipment)</SelectItem>
                                            {possibleParents.map(parent => (
                                                 <SelectItem key={parent.id} value={parent.id}>{parent.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="manufacturer"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Manufacturer (Optional)</FormLabel>
                                        <FormControl><Input placeholder="e.g., Olympus" {...field} value={field.value || ''} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="model"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Model (Optional)</FormLabel>
                                        <FormControl><Input placeholder="e.g., 45MG" {...field} value={field.value || ''} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="serialNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Serial Number (Optional)</FormLabel>
                                    <FormControl><Input placeholder="e.g., SN-12345" {...field} value={field.value || ''} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="techniques"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Technique(s)</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value?.length && "text-muted-foreground")}>
                                            {field.value?.length > 0 ? `${field.value.length} selected` : "Select techniques"}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                            <ScrollArea className="h-48"><div className="p-2">
                                                {NDTTechniques.map((tech) => (
                                                <div key={tech.id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md">
                                                    <Checkbox id={`tech-${tech.id}`} checked={field.value?.includes(tech.id)} onCheckedChange={(checked) => {
                                                        return checked ? field.onChange([...(field.value || []), tech.id]) : field.onChange(field.value?.filter((value) => value !== tech.id));
                                                    }}/>
                                                    <label htmlFor={`tech-${tech.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 w-full">{tech.name} ({tech.id})</label>
                                                </div>
                                                ))}
                                            </div></ScrollArea>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="Available">Available</SelectItem>
                                            <SelectItem value="In Use">In Use</SelectItem>
                                            <SelectItem value="Calibration Due">Calibration Due</SelectItem>
                                            <SelectItem value="Out of Service">Out of Service</SelectItem>
                                            <SelectItem value="Under Service">Under Service</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="nextCalibration"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>Next Calibration Date</FormLabel>
                                <FormControl><CustomDateInput {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="thumbnail"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Thumbnail Image</FormLabel>
                                     <div
                                        onDragEnter={handleDragEnter}
                                        onDragLeave={handleDragLeave}
                                        onDragOver={handleDragOver}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                        className={cn(
                                            "relative w-full h-48 rounded-md border-2 border-dashed flex items-center justify-center text-center text-muted-foreground cursor-pointer transition-colors",
                                            isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-muted/50"
                                        )}
                                    >
                                        {thumbnailPreview ? (
                                            <>
                                                <Image
                                                    src={thumbnailPreview}
                                                    alt="Thumbnail preview"
                                                    fill
                                                    className="object-contain rounded-md p-2"
                                                />
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-md">
                                                    <p className="text-white font-semibold">Click or drag to replace</p>
                                                </div>
                                            </>
                                        ) : (
                                            <p>Click or drag &amp; drop to upload thumbnail</p>
                                        )}
                                        <FormControl>
                                            <Input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                                            />
                                        </FormControl>
                                    </div>
                                    <FormDescription>
                                        This image will be used as the display card for the equipment.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                            <Button type="submit">Save Changes</Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

const addComponentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  type: z.enum(['Instrument', 'Probe', 'Source', 'Sensor', 'Calibration Standard', 'Accessory', 'Visual Aid']),
  techniques: z.array(z.string()).min(1, "At least one technique is required."),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  status: z.enum(['Available', 'In Use', 'Calibration Due', 'Out of Service', 'Under Service']),
  nextCalibration: z.date(),
  thumbnail: z.any().optional(),
});
type AddComponentFormValues = z.infer<typeof addComponentSchema>;

const AddComponentForm = ({ onCancel, onSubmit }: { onCancel: () => void, onSubmit: (values: AddComponentFormValues) => void }) => {
    const form = useForm<AddComponentFormValues>({
        resolver: zodResolver(addComponentSchema),
        defaultValues: { name: "", type: 'Probe', techniques: [], status: "Available", nextCalibration: new Date() },
    });

    const [thumbnailPreview, setThumbnailPreview] = React.useState<string | null>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

     React.useEffect(() => {
        return () => { if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview); };
    }, [thumbnailPreview]);
    
    const handleFileChange = (file: File | null) => {
        form.setValue('thumbnail', file);
        if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
        if (file) {
            if (file.type.startsWith('image/')) {
                setThumbnailPreview(URL.createObjectURL(file));
                form.clearErrors('thumbnail');
            } else {
                setThumbnailPreview(null);
                form.setError('thumbnail', { type: 'manual', message: 'Only image files are accepted.' });
            }
        } else { setThumbnailPreview(null); }
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileChange(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Component Name</FormLabel><FormControl><Input placeholder="e.g., 5MHz Phased Array Probe" {...field} /></FormControl><FormMessage /></FormItem>)} />
                 <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a type"/></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="Instrument">Instrument</SelectItem>
                                    <SelectItem value="Probe">Probe/Transducer</SelectItem>
                                    <SelectItem value="Source">Source</SelectItem>
                                    <SelectItem value="Sensor">Sensor/Detector</SelectItem>
                                    <SelectItem value="Calibration Standard">Calibration Standard</SelectItem>
                                    <SelectItem value="Accessory">Accessory</SelectItem>
                                    <SelectItem value="Visual Aid">Visual Aid</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="manufacturer" render={({ field }) => (<FormItem><FormLabel>Manufacturer</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="model" render={({ field }) => (<FormItem><FormLabel>Model</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                 <FormField control={form.control} name="serialNumber" render={({ field }) => (<FormItem><FormLabel>Serial Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="techniques" render={({ field }) => (
                     <FormItem><FormLabel>Technique(s)</FormLabel>
                         <Popover><PopoverTrigger asChild><FormControl><Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value?.length && "text-muted-foreground")}>{field.value?.length > 0 ? `${field.value.length} selected` : "Select techniques"}<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button></FormControl></PopoverTrigger>
                         <PopoverContent className="w-[--radix-popover-trigger-width] p-0"><ScrollArea className="h-48"><div className="p-2">{NDTTechniques.map((tech) => (<div key={tech.id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md">
                            <Checkbox id={`tech-${tech.id}`} checked={field.value?.includes(tech.id)} onCheckedChange={(checked) => { return checked ? field.onChange([...(field.value || []), tech.id]) : field.onChange(field.value?.filter((value) => value !== tech.id));}}/>
                            <label htmlFor={`tech-${tech.id}`} className="text-sm font-medium w-full">{tech.name} ({tech.id})</label>
                         </div>))}</div></ScrollArea></PopoverContent></Popover><FormMessage /></FormItem>
                 )}/>
                 <FormField control={form.control} name="nextCalibration" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Next Calibration Date</FormLabel><FormControl><CustomDateInput {...field} /></FormControl><FormMessage /></FormItem>)} />
                 <DialogFooter className="pt-4"><Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button><Button type="submit">Add Component</Button></DialogFooter>
            </form>
        </Form>
    );
};


const statusVariants: { [key in InspectorAsset['status']]: 'success' | 'default' | 'destructive' | 'outline' | 'secondary' } = {
    'Available': 'success',
    'In Use': 'default',
    'Calibration Due': 'destructive',
    'Out of Service': 'outline',
    'Under Service': 'secondary'
};

const historyEventIcons = {
    'Created': <Info className="h-4 w-4" />,
    'Updated': <Info className="h-4 w-4" />,
    'Checked Out': <Clock className="h-4 w-4" />,
    'Checked In': <Clock className="h-4 w-4" />,
    'Set to Available': <Info className="h-4 w-4" />,
    'Set to Calibration Due': <Info className="h-4 w-4" />,
    'Set to Out of Service': <Info className="h-4 w-4" />,
    'Checked Out for Service': <Send className="h-4 w-4" />,
    'Assigned to Kit': <Package className="h-4 w-4" />,
    'Removed from Kit': <Package className="h-4 w-4" />,
}

export default function EquipmentDetailPage() {
    const params = useParams();
    const { id } = params;
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [isAddComponentOpen, setIsAddComponentOpen] = useState(false);
    const [editingComponent, setEditingComponent] = useState<InspectorAsset | null>(null);

    const [allEquipment, setAllEquipment] = useState(initialEquipment);
    const equipment = useMemo(() => allEquipment.find(p => p.id === id), [allEquipment, id]);
    
    const childEquipment = useMemo(() => allEquipment.filter(e => e.parentId === id), [id, allEquipment]);
    const parentEquipment = useMemo(() => allEquipment.find(e => e.id === equipment?.parentId), [equipment, allEquipment]);

    if (!equipment) {
        notFound();
    }

    const image = useMemo(() => equipment?.imageId ? PlaceHolderImages.find(p => p.id === equipment.imageId) : undefined, [equipment]);

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const handleFormSubmit = (values: EquipmentFormValues) => {
        setAllEquipment(prev => prev.map(eq => 
            eq.id === equipment.id 
                ? { ...eq, ...values, nextCalibration: format(values.nextCalibration, 'yyyy-MM-dd') } 
                : eq
        ));
        toast({
            title: "Equipment Updated",
            description: `${equipment.name} has been updated.`,
        });
        setIsEditing(false);
    };

    const handleAddComponentSubmit = (values: AddComponentFormValues) => {
        const newComponent: InspectorAsset = {
            id: `COMP-${Date.now()}`,
            providerId: equipment.providerId,
            name: values.name,
            type: values.type,
            techniques: values.techniques,
            manufacturer: values.manufacturer,
            model: values.model,
            serialNumber: values.serialNumber,
            status: values.status,
            approvalStatus: 'Pending Approval',
            nextCalibration: format(values.nextCalibration, 'yyyy-MM-dd'),
            parentId: equipment.id,
            isPublic: false,
        };
        setAllEquipment(prev => [...prev, newComponent]);
        toast({ title: "Component Added", description: `"${values.name}" is pending approval and has been added to this kit.` });
        setIsAddComponentOpen(false);
    };

    const handleEditComponentClick = (component: InspectorAsset) => {
        setEditingComponent(component);
    };

    const handleComponentFormSubmit = (values: EquipmentFormValues) => {
        if (!editingComponent) return;

        setAllEquipment(prev => prev.map(eq => 
            eq.id === editingComponent.id 
                ? { ...eq, ...values, nextCalibration: format(values.nextCalibration, 'yyyy-MM-dd') } 
                : eq
        ));
        toast({
            title: "Component Updated",
            description: `${values.name} has been updated.`,
        });
        setEditingComponent(null);
    };

    if (isEditing) {
        return (
             <div className="max-w-2xl mx-auto">
                <Button variant="outline" size="sm" className="mb-4" onClick={() => setIsEditing(false)}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to View
                </Button>
                <EquipmentForm
                    onSubmit={handleFormSubmit}
                    onCancel={() => setIsEditing(false)}
                    equipment={equipment}
                    allEquipment={allEquipment}
                />
            </div>
        )
    }

    return (
        <div>
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <Button asChild variant="outline" size="sm" className="mb-4 sm:mb-0">
                    <Link href={constructUrl("/dashboard/equipment")}>
                        <ChevronLeft className="mr-2 h-4 w-4 text-primary" />
                        Back to Equipment
                    </Link>
                </Button>
                <div className="flex gap-2">
                    <Button onClick={() => setIsEditing(true)}><Edit className="mr-2 h-4 w-4" />Edit</Button>
                </div>
            </div>

            {parentEquipment ? (
                <div className="mb-6">
                    <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                        <Link href={constructUrl(`/dashboard/equipment/${parentEquipment.id}`)} className="hover:text-primary">
                            {parentEquipment.name}
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                    </div>
                    <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                        <Wrench className="h-6 w-6 text-primary" />
                        {equipment.name}
                    </h1>
                    <p className="font-extrabold text-sm text-muted-foreground">ID: {equipment.id}</p>
                </div>
            ) : (
                <div className="mb-6">
                    <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                        <Wrench className="h-6 w-6 text-primary" />
                        {equipment.name}
                    </h1>
                    <p className="font-extrabold text-sm text-muted-foreground">ID: {equipment.id}</p>
                </div>
            )}


            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader className="p-0">
                           {image && (
                                <div className="relative h-48 w-full block group">
                                    <Image src={image.imageUrl} alt={image.description} fill className="object-cover rounded-t-lg" data-ai-hint={image.imageHint}/>
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm p-6">
                            <div className="flex items-start">
                                <Info className="w-4 h-4 mr-3 mt-1 text-primary"/>
                                <div>
                                    <p className="font-semibold">Status</p>
                                    <Badge variant={statusVariants[equipment.status]}>{equipment.status}</Badge>
                                </div>
                            </div>
                             <div className="flex items-start">
                                <Package className="w-4 h-4 mr-3 mt-1 text-primary"/>
                                <div>
                                    <p className="font-semibold">Type</p>
                                    <p className="text-muted-foreground">{equipment.type}</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <SlidersHorizontal className="w-4 h-4 mr-3 mt-1 text-primary"/>
                                <div>
                                    <p className="font-semibold">Technique(s)</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {equipment.techniques.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
                                    </div>
                                </div>
                            </div>
                             {equipment.manufacturer && (
                                <div className="flex items-start">
                                    <Building className="w-4 h-4 mr-3 mt-1 text-primary"/>
                                    <div>
                                        <p className="font-semibold">Manufacturer</p>
                                        <p className="text-muted-foreground">{equipment.manufacturer}</p>
                                    </div>
                                </div>
                            )}
                            {equipment.model && (
                                <div className="flex items-start">
                                    <Wrench className="w-4 h-4 mr-3 mt-1 text-primary"/>
                                    <div>
                                        <p className="font-semibold">Model</p>
                                        <p className="text-muted-foreground">{equipment.model}</p>
                                    </div>
                                </div>
                            )}
                             {equipment.serialNumber && (
                                <div className="flex items-start">
                                    <Tag className="w-4 h-4 mr-3 mt-1 text-primary"/>
                                    <div>
                                        <p className="font-semibold">Serial Number</p>
                                        <p className="font-bold text-muted-foreground">{equipment.serialNumber}</p>
                                    </div>
                                </div>
                            )}
                             <div className="flex items-start">
                                <Calendar className="w-4 h-4 mr-3 mt-1 text-primary"/>
                                <div>
                                    <p className="font-semibold">Next Calibration</p>
                                    <p className="text-muted-foreground">{equipment.nextCalibration === 'N/A' ? 'N/A' : format(new Date(equipment.nextCalibration), GLOBAL_DATE_FORMAT)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="non-printable">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                                <QrCode className="h-5 w-5 text-primary" />
                                Equipment QR Code
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="printable-area border rounded-lg p-4 flex flex-col items-center justify-center gap-4">
                                <Image 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(equipment.id)}`}
                                    alt={`QR Code for ${equipment.name}`}
                                    width={250}
                                    height={250}
                                />
                                <div className="text-center">
                                    <p className="font-bold text-lg">{equipment.name}</p>
                                    <p className="font-extrabold text-muted-foreground">{equipment.id}</p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={() => window.print()}>
                                <Printer className="mr-2 h-4 w-4" />
                                Print QR Code
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Tabs defaultValue="history">
                        <TabsList className="mb-4">
                            <TabsTrigger value="history">Ledger</TabsTrigger>
                            <TabsTrigger value="kit">Parts &amp; Kit</TabsTrigger>
                        </TabsList>
                        <TabsContent value="history">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><History className="text-primary" /> Equipment Ledger</CardTitle>
                                    <CardDescription>A complete log of all check-in, check-out, and status changes for this item.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-96">
                                        <div className="relative pl-6">
                                            <div className="absolute left-6 top-0 h-full w-0.5 bg-border -translate-x-1/2" />
                                            {equipment.history && equipment.history.length > 0 ? (
                                                equipment.history.map((entry, index) => (
                                                    <div key={index} className="relative mb-8 pl-8">
                                                        <div className="absolute -left-3 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background border-2 border-primary">
                                                            <div className="text-primary">{historyEventIcons[entry.event]}</div>
                                                        </div>
                                                        <p className="text-sm font-medium">{entry.event}</p>
                                                        <div className="text-xs text-muted-foreground">
                                                            <ClientFormattedDate timestamp={entry.timestamp} /> by {entry.user}
                                                        </div>
                                                        {entry.notes && <p className="mt-1 text-xs italic text-muted-foreground">"{entry.notes}"</p>}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center text-muted-foreground py-10">
                                                    No history found for this item.
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="kit">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Package className="text-primary"/> Parts &amp; Kit Management</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {childEquipment.length > 0 ? (
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="font-semibold">Components in this Kit ({childEquipment.length})</h3>
                                                <Button onClick={() => setIsAddComponentOpen(true)} size="sm">
                                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Component
                                                </Button>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">This item is a parent system.</p>
                                            <div className="space-y-2">
                                                {childEquipment.map(child => (
                                                    <div key={child.id} className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/50 transition-colors">
                                                        <Link href={constructUrl(`/dashboard/equipment/${child.id}`)} className="flex-grow">
                                                            <p className="font-semibold hover:underline">{child.name}</p>
                                                            <p className="text-xs font-extrabold text-muted-foreground">{child.id}</p>
                                                        </Link>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant={statusVariants[child.status]}>{child.status}</Badge>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                        <MoreVertical className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={() => handleEditComponentClick(child)}>
                                                                        <Edit className="mr-2 h-4 w-4"/>
                                                                        Edit
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : parentEquipment ? (
                                        <div>
                                            <h3 className="font-semibold">Part of Kit</h3>
                                            <p className="text-sm text-muted-foreground mb-4">This item is a component of a larger system.</p>
                                            <Link href={constructUrl(`/dashboard/equipment/${parentEquipment.id}`)}>
                                                <div className="flex items-center justify-between rounded-md border p-3 hover:bg-muted">
                                                    <div>
                                                        <p className="font-semibold">{parentEquipment.name}</p>
                                                        <p className="text-xs text-muted-foreground">{parentEquipment.id}</p>
                                                    </div>
                                                    <Button variant="outline" size="sm">View Parent System</Button>
                                                </div>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 text-muted-foreground">
                                            <p>This is a standalone piece of equipment and is not part of a kit.</p>
                                            <Button onClick={() => setIsAddComponentOpen(true)} className="mt-4">
                                                <PlusCircle className="mr-2 h-4 w-4" /> Create a Kit
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
             <Dialog open={isAddComponentOpen} onOpenChange={setIsAddComponentOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Component to {equipment.name}</DialogTitle>
                        <DialogDescription>
                            Create a new equipment item that will be part of this kit. It will be submitted for approval.
                        </DialogDescription>
                    </DialogHeader>
                    <AddComponentForm
                        onSubmit={handleAddComponentSubmit}
                        onCancel={() => setIsAddComponentOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={!!editingComponent} onOpenChange={(open) => !open && setEditingComponent(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Component: {editingComponent?.name}</DialogTitle>
                        <DialogDescription>
                            Update the component's details below.
                        </DialogDescription>
                    </DialogHeader>
                    {editingComponent && (
                         <EquipmentForm
                            onSubmit={handleComponentFormSubmit}
                            onCancel={() => setEditingComponent(null)}
                            equipment={editingComponent}
                            allEquipment={allEquipment}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

    
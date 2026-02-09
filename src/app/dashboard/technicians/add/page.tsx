'use client';

import { useState, useMemo, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NDTTechniques, InspectorAsset, inspectorAssets } from "@/lib/placeholder-data";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { cn, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from "@/lib/utils";
import { PlusCircle, ChevronLeft } from "lucide-react";
import { CustomDateInput } from '@/components/ui/custom-date-input';
import Image from 'next/image';
import { MultiSelect } from "@/components/ui/multi-select";


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

export default function AddEquipmentPage() {
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const router = useRouter();
    const role = searchParams.get('role');

    useEffect(() => {
        if (role && role !== 'inspector') {
            router.replace(`/dashboard?${searchParams.toString()}`);
        }
    }, [role, router, searchParams]);

    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        return () => {
            if (thumbnailPreview) {
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

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const form = useForm<EquipmentFormValues>({
        resolver: zodResolver(equipmentSchema),
        defaultValues: {
            name: "",
            type: 'Instrument',
            techniques: [],
            manufacturer: "",
            model: "",
            serialNumber: "",
            status: "Available",
            nextCalibration: new Date(),
        }
    });

    const handleFormSubmit = (values: EquipmentFormValues) => {
        toast({
            title: "Equipment Submitted for Approval",
            description: `${values.name} has been submitted and is awaiting approval.`,
        });
        console.log("New Equipment Data:", values);
        router.push(constructUrl('/dashboard/equipment'));
    };

    const techniqueOptions = NDTTechniques.map(tech => ({ value: tech.id, label: `${tech.name} (${tech.id})` }));

    if (role && role !== 'inspector') {
        return null;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                        <PlusCircle className="text-primary" />
                        Add New Equipment
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Enter the details for the new piece of equipment.
                    </p>
                </div>
                <Button asChild variant="outline" className="w-full sm:w-auto">
                    <Link href={constructUrl('/dashboard/equipment')}>
                        <ChevronLeft className="mr-2 h-4 w-4 text-primary" />
                        Back to Equipment
                    </Link>
                </Button>
            </div>
            <Card>
                <CardContent className="pt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Equipment Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Olympus 45MG" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Equipment Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a type" />
                                                </SelectTrigger>
                                            </FormControl>
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
                                                {inspectorAssets.filter(eq => !eq.parentId).map(parent => (
                                                     <SelectItem key={parent.id} value={parent.id}>{parent.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Assigning a parent makes this item a component of another system.
                                        </FormDescription>
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
                                        <MultiSelect
                                            options={techniqueOptions}
                                            selected={field.value}
                                            onChange={field.onChange}
                                            placeholder="Select techniques..."
                                        />
                                        <FormDescription>
                                            Select all applicable NDT methods for this equipment.
                                        </FormDescription>
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
                                            <FormControl>
                                                <Input placeholder="e.g., Olympus" {...field} />
                                            </FormControl>
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
                                            <FormControl>
                                                <Input placeholder="e.g., 45MG" {...field} />
                                            </FormControl>
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
                                        <FormControl>
                                            <Input placeholder="e.g., SN-12345" {...field} />
                                        </FormControl>
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
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a status" />
                                        </SelectTrigger>
                                        </FormControl>
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
                                    <FormControl>
                                        <CustomDateInput {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="thumbnail"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Thumbnail Image (Optional)</FormLabel>
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
                                                        alt="New equipment thumbnail preview"
                                                        fill
                                                        className="object-contain rounded-md p-2"
                                                    />
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-md">
                                                        <p className="text-white font-semibold">Click or drag to replace</p>
                                                    </div>
                                                </>
                                            ) : (
                                                <p>Click or drag & drop to upload thumbnail</p>
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
                            <div className="flex justify-end pt-4">
                                <Button type="submit">Submit for Approval</Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

  

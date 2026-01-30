'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { clientAssets } from "@/lib/placeholder-data";
import { ACCEPTED_FILE_TYPES } from '@/lib/utils';
import { PlusCircle, ChevronLeft, FileText, X } from "lucide-react";
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { CustomDateInput } from '@/components/ui/custom-date-input';

const assetSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters.'),
    type: z.enum(['Tank', 'Piping', 'Vessel', 'Crane', 'Weld Joint']),
    location: z.string({ required_error: 'Please select a location or add a new one.'}),
    newLocation: z.string().optional(),
    status: z.enum(['Operational', 'Requires Inspection', 'Under Repair', 'Decommissioned']),
    nextInspection: z.date({ required_error: 'Please select a valid date.' }),
    notes: z.string().optional(),
    thumbnail: z.any().optional(),
    documents: z.any().optional(),
}).refine(data => {
    if (data.location === '__add_new__') {
        return data.newLocation && data.newLocation.length > 2;
    }
    return true;
}, {
    message: 'New location name must be at least 3 characters.',
    path: ['newLocation'],
});

export default function AddAssetPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof assetSchema>>({
        resolver: zodResolver(assetSchema),
        defaultValues: {
            name: '',
            type: 'Tank',
            status: 'Operational',
            notes: '',
        }
    });

    const [showNewLocation, setShowNewLocation] = React.useState(false);
    const [thumbnailPreview, setThumbnailPreview] = React.useState<string | null>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const documentsInputRef = React.useRef<HTMLInputElement>(null);
    const [documentFiles, setDocumentFiles] = React.useState<File[]>([]);

    const uniqueLocations = React.useMemo(() => {
        const allLocations = clientAssets.map(asset => asset.location);
        return [...new Set(allLocations)];
    }, []);
    
    React.useEffect(() => {
        return () => {
            if (thumbnailPreview) {
                URL.revokeObjectURL(thumbnailPreview);
            }
        };
    }, [thumbnailPreview]);
    
    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const handleFormSubmit = (values: z.infer<typeof assetSchema>) => {
        toast({
            title: "Asset Created",
            description: `${values.name} has been added to your asset list.`,
        });
        
        if (values.thumbnail) {
            console.log("Uploaded thumbnail: ", values.thumbnail);
        }

        if (values.documents && values.documents.length > 0) {
            console.log("Uploaded documents: ", values.documents);
        }

        router.push(constructUrl('/dashboard/assets'));
    };

    const handleFileChange = (file: File | null) => {
        form.setValue('thumbnail', file);
        if (thumbnailPreview) {
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

    const handleDocumentSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const newFilesArray = Array.from(files);
            setDocumentFiles(prev => [...prev, ...newFilesArray]);
            form.setValue('documents', [...documentFiles, ...newFilesArray]);
            if(documentsInputRef.current) documentsInputRef.current.value = '';
        }
    };

    const handleRemoveDocument = (indexToRemove: number) => {
        setDocumentFiles(prev => prev.filter((_, index) => index !== indexToRemove));
        form.setValue('documents', documentFiles.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                        <PlusCircle />
                        Add New Asset
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Enter the details for the new asset to add it to your inventory.
                    </p>
                </div>
                <Button asChild variant="outline" className="w-full sm:w-auto">
                    <Link href={constructUrl('/dashboard/assets')}>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Assets
                    </Link>
                </Button>
            </div>
            <Card>
                <CardContent className="pt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Asset Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Storage Tank T-102" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Asset Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Tank">Tank</SelectItem>
                                                    <SelectItem value="Piping">Piping</SelectItem>
                                                    <SelectItem value="Vessel">Vessel</SelectItem>
                                                    <SelectItem value="Crane">Crane</SelectItem>
                                                    <SelectItem value="Weld Joint">Weld Joint</SelectItem>
                                                </SelectContent>
                                            </Select>
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
                                                    <SelectTrigger><SelectValue placeholder="Select a status" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Operational">Operational</SelectItem>
                                                    <SelectItem value="Requires Inspection">Requires Inspection</SelectItem>
                                                    <SelectItem value="Under Repair">Under Repair</SelectItem>
                                                    <SelectItem value="Decommissioned">Decommissioned</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                             <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Location</FormLabel>
                                        <Select onValueChange={(value) => {
                                            field.onChange(value);
                                            setShowNewLocation(value === '__add_new__');
                                        }} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue placeholder="Select an existing location" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {uniqueLocations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                                                <SelectItem value="__add_new__">+ Add a new location</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             {showNewLocation && (
                                <FormField
                                    control={form.control}
                                    name="newLocation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>New Location Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Warehouse B, Section 3" {...field} autoFocus />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                )}
                             <FormField
                                control={form.control}
                                name="nextInspection"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Next Inspection Date</FormLabel>
                                        <FormControl>
                                            <CustomDateInput {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Enter the day, month, and year for the next inspection.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Notes / Comments (Optional)</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Add any additional details or comments about the asset..." {...field} />
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
                                                        alt="Thumbnail preview"
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
                                            This image will be used as the display card for the asset.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="documents"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Attach Additional Documents (Optional)</FormLabel>
                                         <Button type="button" variant="outline" className="w-full" onClick={() => documentsInputRef.current?.click()}>
                                            Select Files to Attach
                                        </Button>
                                        <FormControl>
                                            <Input
                                                ref={documentsInputRef}
                                                type="file"
                                                multiple
                                                accept={ACCEPTED_FILE_TYPES}
                                                className="hidden"
                                                onChange={handleDocumentSelection}
                                            />
                                        </FormControl>
                                        {documentFiles.length > 0 && (
                                            <div className="mt-4 space-y-2">
                                                 <p className="text-sm font-medium">{documentFiles.length} file(s) attached:</p>
                                                 <ScrollArea className="max-h-32 rounded-md border p-2">
                                                    {documentFiles.map((file, index) => (
                                                        <div key={`${file.name}-${index}`} className="flex items-center justify-between text-sm p-1 hover:bg-muted rounded">
                                                            <div className="flex items-center gap-2 truncate">
                                                                <FileText className="h-4 w-4 shrink-0" />
                                                                <span className="truncate">{file.name}</span>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 shrink-0"
                                                                onClick={() => handleRemoveDocument(index)}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </ScrollArea>
                                            </div>
                                        )}
                                        <FormDescription>
                                            Attach multiple files (PDFs, images). New selections will be added to the list.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end pt-4">
                                <Button type="submit">Create Asset</Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

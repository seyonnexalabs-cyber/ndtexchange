
'use client';
import * as React from 'react';
import { useMemo } from "react";
import { notFound, useSearchParams, useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from "@/hooks/use-toast";
import { CustomDateInput } from '@/components/ui/custom-date-input';
import { Switch } from '@/components/ui/switch';
import { useFirebase, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { doc, updateDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { cn, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from '@/lib/utils';
import type { Asset, PlatformUser } from '@/lib/types';


const assetSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters.'),
    type: z.enum(['Tank', 'Piping', 'Vessel', 'Crane', 'Weld Joint']),
    location: z.string({ required_error: 'Please select a location or add a new one.'}),
    isMovable: z.boolean().default(false),
    newLocation: z.string().optional(),
    nextInspection: z.date({ required_error: 'Please select a valid date.' }),
    status: z.enum(['Operational', 'Requires Inspection', 'Under Repair', 'Decommissioned']).optional(),
    manufacturer: z.string().optional(),
    model: z.string().optional(),
    serialNumber: z.string().optional(),
    installationDate: z.date().optional(),
    notes: z.string().optional(),
    thumbnail: z.any().optional(),
}).refine(data => {
    if (data.location === '__add_new__') {
        return data.newLocation && data.newLocation.length > 2;
    }
    return true;
}, {
    message: 'New location name must be at least 3 characters.',
    path: ['newLocation'],
});

type AssetFormValues = z.infer<typeof assetSchema>;

export default function EditAssetPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { firestore, user } = useFirebase();

    const { data: userProfile, isLoading: isLoadingProfile } = useDoc<PlatformUser>(
        useMemoFirebase(() => (firestore && user ? doc(firestore, 'users', user.uid) : null), [firestore, user])
    );
    const { data: asset, isLoading: isLoadingAsset } = useDoc<Asset>(
        useMemoFirebase(() => (firestore ? doc(firestore, 'assets', id) : null), [firestore, id])
    );
    const { data: existingAssets, isLoading: isLoadingAssets } = useCollection<Asset>(
        useMemoFirebase(() => (firestore ? collection(firestore, 'assets') : null), [firestore])
    );
    
    const [showNewLocation, setShowNewLocation] = React.useState(false);
    const [thumbnailPreview, setThumbnailPreview] = React.useState<string | null>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const form = useForm<AssetFormValues>({
        resolver: zodResolver(assetSchema),
    });

    React.useEffect(() => {
        if (asset) {
            form.reset({
                ...asset,
                nextInspection: asset.nextInspection ? new Date(asset.nextInspection) : new Date(),
                installationDate: asset.installationDate ? new Date(asset.installationDate) : undefined,
                thumbnail: asset.thumbnailUrl,
            });
            if (asset.thumbnailUrl) {
                setThumbnailPreview(asset.thumbnailUrl);
            }
        }
    }, [asset, form]);

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    };

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
            setThumbnailPreview(typeof asset?.thumbnailUrl === 'string' ? asset.thumbnailUrl : null);
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

    const uniqueLocations = React.useMemo(() => {
        if (!existingAssets) return [];
        const allLocations = existingAssets.map(asset => asset.location);
        return [...new Set(allLocations)];
    }, [existingAssets]);


    const handleFormSubmit = async (values: AssetFormValues) => {
        if (!firestore || !user || !userProfile) {
            toast({ variant: "destructive", title: "Error", description: "Not authenticated. Please try again." });
            return;
        }

        const location = values.location === '__add_new__' ? values.newLocation! : values.location;
        const dataToSave: Partial<Asset> = {
            ...values,
            companyId: userProfile.companyId,
            location,
            nextInspection: format(values.nextInspection, 'yyyy-MM-dd'),
            installationDate: values.installationDate ? format(values.installationDate, 'yyyy-MM-dd') : undefined,
            modifiedAt: serverTimestamp(),
            modifiedBy: user.uid,
        };
        delete (dataToSave as any).newLocation;
        delete (dataToSave as any).documents;
        delete (dataToSave as any).thumbnail;

        try {
            const assetRef = doc(firestore, 'assets', id);
            await updateDoc(assetRef, dataToSave);
            toast({ title: "Asset Updated", description: `${values.name} has been updated.` });
            router.push(constructUrl('/dashboard/assets'));
        } catch (error) {
            console.error("Error saving asset:", error);
            toast({ variant: "destructive", title: "Save Failed", description: "Could not save asset." });
        }
    };
    
    const isLoading = isLoadingAsset || isLoadingAssets || isLoadingProfile;
    
    if(isLoading) {
        return (
            <div className="space-y-6 max-w-4xl mx-auto">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-screen" />
            </div>
        )
    }

    if (!asset) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                 <Link href={constructUrl('/dashboard/assets')} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                    <span>
                        <ChevronLeft />
                        Back to Assets
                    </span>
                </Link>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Editing: {asset.name}</CardTitle>
                    <CardDescription>Make changes to the asset details below.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                            <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Asset Name <span className="text-destructive">*</span></FormLabel> <FormControl> <Input placeholder="e.g., Storage Tank T-102" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                            <FormField control={form.control} name="type" render={({ field }) => ( <FormItem> <FormLabel>Asset Type <span className="text-destructive">*</span></FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl> <SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger> </FormControl> <SelectContent> <SelectItem value="Tank">Tank</SelectItem> <SelectItem value="Piping">Piping</SelectItem> <SelectItem value="Vessel">Vessel</SelectItem> <SelectItem value="Crane">Crane</SelectItem> <SelectItem value="Weld Joint">Weld Joint</SelectItem> </SelectContent> </Select> <FormMessage /> </FormItem> )}/>
                            <FormField control={form.control} name="location" render={({ field }) => ( <FormItem> <FormLabel>Primary Site / Location <span className="text-destructive">*</span></FormLabel> <Select onValueChange={(value) => { field.onChange(value); setShowNewLocation(value === '__add_new__'); }} defaultValue={field.value}> <FormControl> <SelectTrigger><SelectValue placeholder="Select an existing location" /></SelectTrigger> </FormControl> <SelectContent> {uniqueLocations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)} <SelectItem value="__add_new__">+ Add a new location</SelectItem> </SelectContent> </Select> <FormMessage /> </FormItem> )}/>
                            {showNewLocation && ( <FormField control={form.control} name="newLocation" render={({ field }) => ( <FormItem> <FormLabel>New Location Name</FormLabel> <FormControl> <Input placeholder="e.g., Warehouse B, Section 3" {...field} autoFocus /> </FormControl> <FormMessage /> </FormItem> )}/> )}
                            <FormField control={form.control} name="isMovable" render={({ field }) => ( <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"> <div className="space-y-0.5"> <FormLabel>Movable Asset</FormLabel> <FormDescription>Is this a movable asset (e.g., a mobile crane)?</FormDescription> </div> <FormControl> <Switch checked={field.value} onCheckedChange={field.onChange} /> </FormControl> </FormItem> )}/>
                            <FormField control={form.control} name="nextInspection" render={({ field }) => ( <FormItem className="flex flex-col"> <FormLabel>Next Inspection Date <span className="text-destructive">*</span></FormLabel> <FormControl> <CustomDateInput {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="manufacturer" render={({ field }) => (<FormItem><FormLabel>Manufacturer</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)}/>
                                <FormField control={form.control} name="model" render={({ field }) => (<FormItem><FormLabel>Model</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)}/>
                                <FormField control={form.control} name="serialNumber" render={({ field }) => (<FormItem className="col-span-2"><FormLabel>Serial Number</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)}/>
                                <FormField control={form.control} name="installationDate" render={({ field }) => (<FormItem className="col-span-2 flex flex-col"><FormLabel>Installation Date</FormLabel><FormControl><CustomDateInput {...field} /></FormControl><FormMessage /></FormItem>)}/>
                            </div>
                            <FormField control={form.control} name="notes" render={({ field }) => (<FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)}/>
                            <FormField control={form.control} name="thumbnail" render={() => ( <FormItem> <FormLabel>Thumbnail Image</FormLabel> <div {...dragHandlers} onClick={() => fileInputRef.current?.click()} className={cn( "relative w-full h-48 rounded-md border-2 border-dashed flex items-center justify-center text-center text-muted-foreground cursor-pointer transition-colors", isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-muted/50" )} > {thumbnailPreview ? ( <> <Image src={thumbnailPreview} alt="Thumbnail preview" fill className="object-contain rounded-md p-2" /> <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-md"><p className="text-white font-semibold">Click or drag to replace</p></div> </> ) : ( <p>Click or drag & drop to upload thumbnail</p> )} <FormControl> <Input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} /> </FormControl> </div> <FormDescription>This image will be used as the display card for the asset.</FormDescription> <FormMessage /> </FormItem> )}/>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="ghost" onClick={() => router.push(constructUrl('/dashboard/assets'))}>Cancel</Button>
                                <Button type="submit">Save Changes</Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}


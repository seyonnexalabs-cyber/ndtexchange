
'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MultiSelect, type MultiSelectOption } from '@/components/ui/multi-select';
import { ChevronLeft, Wrench, Trash, Award } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter, useParams, notFound } from 'next/navigation';
import { toast } from 'sonner';
import { useFirebase, useCollection, useMemoFirebase, useUser, useDoc, useStorage } from '@/firebase';
import { getDownloadURL, ref, uploadBytes, deleteObject } from 'firebase/storage';
import { collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import type { Product, NDTTechnique, PlatformUser } from '@/lib/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';

const productSchema = z.object({
  name: z.string().min(2, "Product name is required."),
  type: z.enum(['Instrument', 'Probe', 'Source', 'Sensor', 'Calibration Standard', 'Accessory', 'Visual Aid']),
  techniques: z.array(z.string()).min(1, "At least one technique must be selected."),
  description: z.string().optional(),
  images: z.array(z.any()).optional(),
  isAwardWinning: z.boolean().optional(),
  awards: z.array(z.object({
    name: z.string().min(2, "Award name is required."),
    year: z.coerce.number().min(1900, "Invalid year.").max(new Date().getFullYear() + 1, "Invalid year."),
    imageUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  })).optional(),
  specifications: z.array(z.object({
    name: z.string().min(1, "Please enter a name."),
    value: z.string().min(1, "Please enter a value."),
  })).optional(),
  certifications: z.array(z.object({
    name: z.string().min(1, "Please enter a name."),
    authority: z.string().optional(),
    logoUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  })).optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

const ProductPreview = ({ productData, manufacturerName, imageUrls }: { productData: Partial<ProductFormValues>, manufacturerName: string, imageUrls: string[] }) => {
    const [api, setApi] = React.useState<CarouselApi>();

    return (
        <Card className="overflow-hidden flex flex-col h-full">
            <CardHeader className="p-0">
                <Carousel setApi={setApi} className="w-full">
                    <CarouselContent>
                        {imageUrls.length > 0 ? (
                            imageUrls.map((url, index) => (
                                <CarouselItem key={index}>
                                    <div className="relative aspect-square bg-muted rounded-t-lg overflow-hidden">
                                        <Image src={url} alt={`Product Preview ${index + 1}`} fill className="object-contain p-4" />
                                    </div>
                                </CarouselItem>
                            ))
                        ) : (
                            <CarouselItem>
                                <div className="relative aspect-square bg-muted rounded-t-lg overflow-hidden flex items-center justify-center h-full">
                                    <Wrench className="w-12 h-12 text-muted-foreground/30" />
                                </div>
                            </CarouselItem>
                        )}
                    </CarouselContent>
                    {imageUrls.length > 1 && (
                        <>
                            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
                            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
                        </>
                    )}
                </Carousel>
            </CardHeader>
            <CardContent className="p-4 flex-grow">
                <CardTitle className="text-base font-semibold leading-tight mb-1" title={productData.name}>{productData.name || "Product Name"}</CardTitle>
                <CardDescription>{manufacturerName}</CardDescription>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <div className="flex flex-wrap gap-1">
                    {productData.techniques?.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
                </div>
            </CardFooter>
        </Card>
    );
};

export default function EditProductPage() {
    const params = useParams();
    const productId = params.id as string;
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user: authUser } = useUser();
    const { firestore } = useFirebase();
    const storage = useStorage();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    
    const [isDragging, setIsDragging] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [imageFiles, setImageFiles] = React.useState<File[]>([]);
    const [existingImageUrls, setExistingImageUrls] = React.useState<string[]>([]);
    const [imagesToRemove, setImagesToRemove] = React.useState<string[]>([]);


    const { data: currentUserProfile, isLoading: isLoadingProfile } = useDoc<PlatformUser>(
        useMemoFirebase(() => (firestore && authUser ? doc(firestore, 'users', authUser.uid) : null), [firestore, authUser])
    );
    
    const { data: productToEdit, isLoading: isLoadingProduct } = useDoc<Product>(
        useMemoFirebase(() => (firestore ? doc(firestore, 'products', productId) : null), [firestore, productId])
    );

    const { data: allTechniques, isLoading: isLoadingTechniques } = useCollection<NDTTechnique>(
        useMemoFirebase(() => firestore ? collection(firestore, 'techniques') : null, [firestore])
    );

    const techniqueOptions: MultiSelectOption[] = React.useMemo(() => 
        (allTechniques || []).map(t => ({ value: t.acronym, label: `${t.title} (${t.acronym})` })), 
        [allTechniques]
    );

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: '', type: 'Instrument', techniques: [], description: '',
            images: [], isAwardWinning: false, awards: [],
        },
    });

    React.useEffect(() => {
        if (productToEdit) {
            form.reset({
                ...productToEdit,
                images: [], 
            });
            setExistingImageUrls(productToEdit.imageUrls || []);
        }
    }, [productToEdit, form]);

    const { fields: awardFields, append: appendAward, remove: removeAward } = useFieldArray({
        control: form.control,
        name: "awards"
    });
    
    const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({
        control: form.control,
        name: "specifications"
    });

    const { fields: certFields, append: appendCert, remove: removeCert } = useFieldArray({
        control: form.control,
        name: "certifications"
    });


    const watchedFormData = form.watch();
    const newImageFiles = form.watch('images') || [];
    
    const previewImageUrls = React.useMemo(() => {
        const newUrls = (newImageFiles as File[]).map(file => URL.createObjectURL(file));
        const combined = [...existingImageUrls, ...newUrls];
        return combined;
    }, [existingImageUrls, newImageFiles]);

    React.useEffect(() => {
        const newUrls = (newImageFiles as File[]).map(file => URL.createObjectURL(file));
        return () => {
            newUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [newImageFiles]);


    const handleFilesUpload = (files: FileList | null) => {
        if (!files) return;
        const newFiles = Array.from(files);
        const validFiles = newFiles.filter(file => {
            if (!['image/png', 'image/jpeg', 'image/gif'].includes(file.type)) {
                toast.error('Invalid File Type', { description: `Skipping ${file.name}: Only image files are accepted.` });
                return false;
            }
            if (file.size > 2 * 1024 * 1024) { // 2MB
                toast.error('File Too Large', { description: `Skipping ${file.name}: Image must be smaller than 2MB.` });
                return false;
            }
            return true;
        });

        const updatedFiles = [...imageFiles, ...validFiles];
        setImageFiles(updatedFiles);
        form.setValue('images', updatedFiles, { shouldValidate: true });
    };

    const handleRemoveNewImage = (index: number) => {
        const newFiles = imageFiles.filter((_, i) => i !== index);
        setImageFiles(newFiles);
        form.setValue('images', newFiles, { shouldValidate: true });
    };

    const handleRemoveExistingImage = (url: string) => {
        setExistingImageUrls(prev => prev.filter(u => u !== url));
        setImagesToRemove(prev => [...prev, url]);
    };
    
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFilesUpload(e.dataTransfer.files);
            e.dataTransfer.clearData();
        }
    };


    const onSubmit = async (values: ProductFormValues) => {
        if (!firestore || !currentUserProfile || !storage) return;
        setIsSubmitting(true);

        const { images, ...otherValues } = values;
        
        let finalImageUrls = [...existingImageUrls];

        if (images && images.length > 0) {
            toast.info("Uploading images...", { description: "Please wait while we upload your product images." });
            const uploadPromises = images.map(async (file: File) => {
                const storageRef = ref(storage, `products/${productId}/${file.name}`);
                const uploadTask = await uploadBytes(storageRef, file);
                return getDownloadURL(uploadTask.ref);
            });
            try {
                const newUrls = await Promise.all(uploadPromises);
                finalImageUrls.push(...newUrls);
            } catch (error) {
                console.error("Error uploading images:", error);
                toast.error('Image Upload Failed', { description: 'Could not upload product images. Please try again.' });
                setIsSubmitting(false);
                return;
            }
        }

        // Handle image removals from storage
        if(imagesToRemove.length > 0 && storage) {
            const removalPromises = imagesToRemove.map(url => {
                try {
                    const imageRef = ref(storage, url);
                    return deleteObject(imageRef);
                } catch(e) {
                    console.warn("Could not delete image from storage:", url, e);
                    return Promise.resolve();
                }
            });
            await Promise.all(removalPromises);
        }
        
        const dataToSave = {
            ...otherValues,
            manufacturerId: currentUserProfile.companyId,
            manufacturerName: currentUserProfile.company,
            imageUrls: finalImageUrls,
            modifiedAt: serverTimestamp(),
            modifiedBy: currentUserProfile.id
        };
        
        await updateDoc(doc(firestore, 'products', productId), dataToSave);
        toast.success("Product Updated", { description: `${values.name} has been updated successfully.` });
        
        setIsSubmitting(false);
        router.push(constructUrl('/dashboard/my-products'));
    };
    
    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const isLoading = isLoadingTechniques || isLoadingProfile || isLoadingProduct;

    if (isLoading) {
        return (
            <div className="max-w-6xl mx-auto space-y-6">
                <Skeleton className="h-10 w-48" />
                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    <Skeleton className="lg:col-span-2 h-screen" />
                    <Skeleton className="lg:col-span-1 h-96" />
                </div>
            </div>
        );
    }
    
    if (!productToEdit) {
        notFound();
    }

    return (
        <div className="max-w-6xl mx-auto">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <Link href={constructUrl('/dashboard/my-products')} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), "mb-2")}>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to My Products
                    </Link>
                    <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                        Edit Product
                    </h1>
                    <p className="text-muted-foreground mt-1">
                       Update the details for this product.
                    </p>
                </div>
            </div>
             <div className="grid lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2">
                    <Card>
                        <CardContent className="pt-6">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Product Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                    <FormField control={form.control} name="type" render={({ field }) => ( <FormItem> <FormLabel>Type</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl> <SelectContent> <SelectItem value="Instrument">Instrument</SelectItem> <SelectItem value="Probe">Probe/Transducer</SelectItem> <SelectItem value="Source">Source</SelectItem> <SelectItem value="Sensor">Sensor/Detector</SelectItem> <SelectItem value="Calibration Standard">Calibration Standard</SelectItem> <SelectItem value="Accessory">Accessory</SelectItem> <SelectItem value="Visual Aid">Visual Aid</SelectItem> </SelectContent> </Select> <FormMessage /> </FormItem> )}/>
                                    <FormField control={form.control} name="techniques" render={({ field }) => ( <FormItem className="flex flex-col"> <FormLabel>Applicable Technique(s)</FormLabel> <MultiSelect options={techniqueOptions} selected={field.value || []} onChange={field.onChange} placeholder="Select techniques..." /><FormMessage /> </FormItem> )}/>
                                    <FormField control={form.control} name="description" render={({ field }) => ( <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe the product..." {...field} className="min-h-[120px]" /></FormControl><FormMessage /></FormItem> )}/>
                                    
                                    {/* Image Upload */}
                                    <FormItem>
                                        <FormLabel>Product Images</FormLabel>
                                        <div {...{ onDragEnter: handleDragEnter, onDragLeave: handleDragLeave, onDragOver: handleDragOver, onDrop: handleDrop }} onClick={() => fileInputRef.current?.click()} className={cn("relative w-full min-h-[12rem] rounded-md border-2 border-dashed flex items-center justify-center text-center text-muted-foreground cursor-pointer transition-colors", isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-muted/50")}>
                                            <p>Click or drag &amp; drop to upload images</p>
                                            <FormControl><Input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFilesUpload(e.target.files)} /></FormControl>
                                        </div>
                                        <FormDescription>Upload one or more images for your product. Max 2MB each.</FormDescription>
                                        <div className="flex flex-wrap gap-4 mt-4">
                                            {existingImageUrls.map((url, index) => (
                                                <div key={`existing-${index}`} className="relative w-24 h-24 rounded-md overflow-hidden border">
                                                    <Image src={url} alt="Existing product image" fill className="object-cover" />
                                                    <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => handleRemoveExistingImage(url)}><Trash className="h-3 w-3"/></Button>
                                                </div>
                                            ))}
                                            {previewImageUrls.slice(existingImageUrls.length).map((url, index) => (
                                                 <div key={`new-${index}`} className="relative w-24 h-24 rounded-md overflow-hidden border">
                                                    <Image src={url} alt="New product image" fill className="object-cover" />
                                                    <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => handleRemoveNewImage(index)}><Trash className="h-3 w-3"/></Button>
                                                </div>
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>

                                    {/* Specifications */}
                                    <FormItem>
                                        <FormLabel>Technical Specifications</FormLabel>
                                        <FormDescription>List the key technical details of the product.</FormDescription>
                                        <div className="space-y-2">
                                            {specFields.map((field, index) => (
                                                <div key={field.id} className="flex gap-2 items-end">
                                                    <FormField control={form.control} name={`specifications.${index}.name`} render={({ field }) => <FormItem className="flex-grow"><FormControl><Input placeholder="Spec Name (e.g., Weight)" {...field} /></FormControl><FormMessage /></FormItem>} />
                                                    <FormField control={form.control} name={`specifications.${index}.value`} render={({ field }) => <FormItem className="flex-grow"><FormControl><Input placeholder="Value (e.g., 2.5kg)" {...field} /></FormControl><FormMessage /></FormItem>} />
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeSpec(index)}><Trash className="h-4 w-4" /></Button>
                                                </div>
                                            ))}
                                        </div>
                                        <Button type="button" variant="outline" size="sm" onClick={() => appendSpec({ name: '', value: '' })}>Add Specification</Button>
                                    </FormItem>
                                    
                                    {/* Certifications */}
                                    <FormItem>
                                        <FormLabel>Product Certifications</FormLabel>
                                        <FormDescription>List any certifications this product complies with.</FormDescription>
                                        <div className="space-y-4">
                                            {certFields.map((field, index) => (
                                                <div key={field.id} className="p-4 border rounded-md relative space-y-4">
                                                     <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeCert(index)}><Trash className="h-4 w-4" /></Button>
                                                     <FormField control={form.control} name={`certifications.${index}.name`} render={({ field }) => <FormItem><FormLabel>Certification Name</FormLabel><FormControl><Input placeholder="e.g., CE, IP67" {...field} /></FormControl><FormMessage /></FormItem>} />
                                                     <div className="grid grid-cols-2 gap-4">
                                                         <FormField control={form.control} name={`certifications.${index}.authority`} render={({ field }) => <FormItem><FormLabel>Authority (Optional)</FormLabel><FormControl><Input placeholder="e.g., European Commission" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>} />
                                                         <FormField control={form.control} name={`certifications.${index}.logoUrl`} render={({ field }) => <FormItem><FormLabel>Logo URL (Optional)</FormLabel><FormControl><Input placeholder="https://..." {...field} value={field.value || ''}/></FormControl><FormMessage /></FormItem>} />
                                                     </div>
                                                </div>
                                            ))}
                                        </div>
                                        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendCert({ name: '', authority: '', logoUrl: '' })}>Add Certification</Button>
                                    </FormItem>
                                    
                                    {/* Awards */}
                                    <FormItem>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <FormLabel>Awards & Recognitions</FormLabel>
                                                <FormDescription>Has this product won any industry awards?</FormDescription>
                                            </div>
                                            <FormField control={form.control} name="isAwardWinning" render={({ field }) => <FormItem><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>} />
                                        </div>
                                        {form.watch('isAwardWinning') && (
                                            <div className="space-y-4 mt-2">
                                                {awardFields.map((field, index) => (
                                                    <div key={field.id} className="p-4 border rounded-md relative space-y-4">
                                                        <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeAward(index)}><Trash className="h-4 w-4"/></Button>
                                                        <FormField control={form.control} name={`awards.${index}.name`} render={({ field }) => <FormItem><FormLabel>Award Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <FormField control={form.control} name={`awards.${index}.year`} render={({ field }) => <FormItem><FormLabel>Year</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
                                                            <FormField control={form.control} name={`awards.${index}.imageUrl`} render={({ field }) => <FormItem><FormLabel>Image URL (Optional)</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>} />
                                                        </div>
                                                    </div>
                                                ))}
                                                <Button type="button" variant="outline" size="sm" onClick={() => appendAward({ name: '', year: new Date().getFullYear(), imageUrl: '' })}>Add Award</Button>
                                            </div>
                                        )}
                                    </FormItem>
                                    
                                    <CardFooter className="px-0 pt-6 flex justify-end gap-2">
                                        <Button type="button" variant="ghost" onClick={() => router.push(constructUrl('/dashboard/my-products'))}>Cancel</Button>
                                        <Button type="submit" disabled={isSubmitting}>
                                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1 space-y-4 sticky top-24">
                     <h3 className="font-semibold text-lg">Live Preview</h3>
                     <ProductPreview 
                        productData={watchedFormData} 
                        manufacturerName={currentUserProfile?.company || 'Your Company'} 
                        imageUrls={previewImageUrls}
                    />
                </div>
            </div>
        </div>
    )
}

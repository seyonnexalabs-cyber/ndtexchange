
'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MultiSelect, type MultiSelectOption } from '@/components/ui/multi-select';
import { PlusCircle, ChevronLeft, Wrench, Trash } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useFirebase, useCollection, useMemoFirebase, useUser, useDoc, useStorage } from '@/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { collection, doc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
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
});

type ProductFormValues = z.infer<typeof productSchema>;

const ProductPreview = ({ productData, manufacturerName, existingImageUrls }: { productData: Partial<ProductFormValues>, manufacturerName: string, existingImageUrls: string[] }) => {
    const [api, setApi] = React.useState<CarouselApi>();
    const [previewUrls, setPreviewUrls] = React.useState<string[]>([]);

    React.useEffect(() => {
        let objectUrls: string[] = [];
        const newImageFiles = productData.images?.filter(file => file instanceof File) || [];

        if (newImageFiles.length > 0) {
            objectUrls = newImageFiles.map(file => URL.createObjectURL(file));
        }
        
        setPreviewUrls([...existingImageUrls, ...objectUrls]);

        return () => {
            objectUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [productData.images, existingImageUrls]);


    return (
        <Card className="overflow-hidden flex flex-col h-full">
            <CardHeader className="p-0">
                <Carousel setApi={setApi} className="w-full">
                    <CarouselContent>
                        {previewUrls.length > 0 ? (
                            previewUrls.map((url, index) => (
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
                    {previewUrls.length > 1 && (
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

export default function AddEditProductPage() {
    const params = useParams();
    const productId = params.id as string;
    const isEditing = productId !== 'add';
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { firestore, auth } = useFirebase();
    const { user: authUser } = useUser();
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
        useMemoFirebase(() => (isEditing && firestore ? doc(firestore, 'products', productId) : null), [isEditing, productId, firestore])
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
        if (isEditing && productToEdit) {
            form.reset({
                ...productToEdit,
                images: [], // Don't put existing URLs here
            });
            setExistingImageUrls(productToEdit.imageUrls || []);
        }
    }, [isEditing, productToEdit, form]);

    const { fields: awardFields, append: appendAward, remove: removeAward } = useFieldArray({
        control: form.control,
        name: "awards"
    });

    const watchedFormData = form.watch();

    const handleFilesUpload = (files: FileList | null) => {
        if (!files) return;
        const newFiles = Array.from(files);
        const validFiles = newFiles.filter(file => {
            if (!['image/png', 'image/jpeg', 'image/gif'].includes(file.type)) {
                toast({ variant: 'destructive', title: 'Invalid File Type', description: `Skipping ${file.name}: Only image files are accepted.` });
                return false;
            }
            if (file.size > 2 * 1024 * 1024) { // 2MB
                toast({ variant: 'destructive', title: 'File Too Large', description: `Skipping ${file.name}: Image must be smaller than 2MB.` });
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
        const docId = isEditing ? productId : doc(collection(firestore, 'products')).id;

        if (images && images.length > 0) {
            toast({ title: "Uploading images...", description: "Please wait while we upload your product images." });
            const uploadPromises = images.map(async (file: File) => {
                const storageRef = ref(storage, `products/${docId}/${file.name}`);
                const uploadTask = await uploadBytes(storageRef, file);
                return getDownloadURL(uploadTask.ref);
            });
            try {
                const newUrls = await Promise.all(uploadPromises);
                finalImageUrls.push(...newUrls);
            } catch (error) {
                console.error("Error uploading images:", error);
                toast({ variant: 'destructive', title: 'Image Upload Failed', description: 'Could not upload product images. Please try again.' });
                setIsSubmitting(false);
                return;
            }
        }
        
        const dataToSave = {
            id: docId,
            ...otherValues,
            manufacturerId: currentUserProfile.companyId,
            manufacturerName: currentUserProfile.company,
            imageUrls: finalImageUrls,
        };
        
        if (isEditing) {
            await updateDoc(doc(firestore, 'products', docId), dataToSave);
            toast({ title: "Product Updated", description: `${values.name} has been updated successfully.` });
        } else {
            await setDoc(doc(firestore, 'products', docId), dataToSave);
            toast({ title: "Product Added", description: `${values.name} has been added to your catalog.` });
        }

        setIsSubmitting(false);
        router.push(constructUrl('/dashboard/my-products'));
    };
    
    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    if (isLoadingTechniques || isLoadingProfile || (isEditing && isLoadingProduct)) {
        return (
            <div className="max-w-6xl mx-auto space-y-6">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-full" />
                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    <Skeleton className="lg:col-span-2 h-screen" />
                    <Skeleton className="lg:col-span-1 h-96" />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <Button asChild variant="outline" size="sm" className="mb-2">
                        <Link href={constructUrl('/dashboard/my-products')}>
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back to My Products
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                        <PlusCircle className="text-primary" />
                        {isEditing ? 'Edit Product' : 'Add New Product'}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {isEditing ? 'Update the details for this product.' : 'Fill out the form below to add a new product to your public catalog.'}
                    </p>
                </div>
            </div>
             <div className="grid lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2">
                    <Card>
                        <CardContent className="pt-6">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                     <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Product Name</FormLabel>
                                                <FormControl><Input placeholder="e.g., OmniScan X3" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Product Type</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
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
                                    <FormField
                                        control={form.control}
                                        name="techniques"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Applicable Techniques</FormLabel>
                                                <MultiSelect
                                                    options={techniqueOptions}
                                                    selected={field.value || []}
                                                    onChange={field.onChange}
                                                    placeholder="Select techniques..."
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description (Optional)</FormLabel>
                                                <FormControl><Textarea placeholder="A brief description of the product." {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={form.control}
                                        name="images"
                                        render={() => (
                                            <FormItem>
                                            <FormLabel>Product Images</FormLabel>
                                            <div
                                                onDragEnter={handleDragEnter}
                                                onDragLeave={handleDragLeave}
                                                onDragOver={handleDragOver}
                                                onDrop={handleDrop}
                                                onClick={() => fileInputRef.current?.click()}
                                                className={cn(
                                                    "relative mt-2 w-full p-4 rounded-md border-2 border-dashed flex flex-col items-center justify-center text-center text-muted-foreground cursor-pointer transition-colors",
                                                    isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-muted/50"
                                                )}
                                            >
                                                <p>Click or drag & drop to upload images</p>
                                                <p className="text-xs">PNG, JPG, or GIF, up to 2MB each</p>
                                            </div>
                                            <FormControl>
                                                <Input
                                                    ref={fileInputRef}
                                                    id="file-upload"
                                                    type="file"
                                                    multiple
                                                    className="hidden"
                                                    accept="image/png, image/jpeg, image/gif"
                                                    onChange={(e) => handleFilesUpload(e.target.files)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                             {(existingImageUrls.length > 0 || imageFiles.length > 0) && (
                                                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                                    {existingImageUrls.map((url, index) => (
                                                        <div key={`${url}-${index}`} className="relative aspect-square group">
                                                            <Image src={url} alt={`Existing Image ${index}`} fill className="object-cover rounded-md" />
                                                            <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRemoveExistingImage(url)}>
                                                                <Trash className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    {imageFiles.map((file, index) => (
                                                        <div key={`${file.name}-${index}`} className="relative aspect-square group">
                                                            <Image src={URL.createObjectURL(file)} alt={`Preview ${index}`} fill className="object-cover rounded-md" />
                                                            <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRemoveNewImage(index)}>
                                                                <Trash className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="isAwardWinning"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                            <div className="space-y-0.5">
                                                <FormLabel>Award-Winning Product</FormLabel>
                                                <FormDescription>Highlight this product as an award-winner.</FormDescription>
                                            </div>
                                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            </FormItem>
                                        )}
                                        />

                                    <div className="space-y-2">
                                        <FormLabel>Awards &amp; Recognitions</FormLabel>
                                        {awardFields.map((field, index) => (
                                            <div key={field.id} className="grid grid-cols-2 gap-x-4 gap-y-2 p-4 border rounded-md relative">
                                                <FormField
                                                    control={form.control}
                                                    name={`awards.${index}.name`}
                                                    render={({ field }) => (
                                                        <FormItem className="col-span-2">
                                                        <FormLabel className="text-xs">Award Name</FormLabel>
                                                        <FormControl><Input placeholder="e.g., Red Dot Design Award" {...field} /></FormControl>
                                                        <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`awards.${index}.year`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                        <FormLabel className="text-xs">Year</FormLabel>
                                                        <FormControl><Input type="number" placeholder="e.g., 2023" {...field} /></FormControl>
                                                        <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`awards.${index}.imageUrl`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                        <FormLabel className="text-xs">Image URL (Optional)</FormLabel>
                                                        <FormControl><Input placeholder="https://example.com/award.png" {...field} /></FormControl>
                                                        <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeAward(index)}>
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        <Button type="button" variant="outline" size="sm" onClick={() => appendAward({ name: '', year: new Date().getFullYear(), imageUrl: '' })}>
                                            Add Award
                                        </Button>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <Button type="submit" disabled={isSubmitting}>
                                            {isSubmitting ? 'Saving...' : 'Save Product'}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1 space-y-4">
                     <h3 className="font-semibold text-lg">Live Preview</h3>
                     <ProductPreview 
                        productData={watchedFormData} 
                        manufacturerName={currentUserProfile?.company || 'Your Company'} 
                        existingImageUrls={existingImageUrls}
                    />
                </div>
            </div>
        </div>
    );
}

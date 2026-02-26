
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
import { ChevronLeft, Wrench, Trash, Award } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter, useParams, notFound } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
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

        if (images && images.length > 0) {
            toast({ title: "Uploading images...", description: "Please wait while we upload your product images." });
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
                toast({ variant: 'destructive', title: 'Image Upload Failed', description: 'Could not upload product images. Please try again.' });
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
        toast({ title: "Product Updated", description: `${values.name} has been updated successfully.` });
        
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
                    <Button asChild variant="outline" size="sm" className="mb-2">
                        <Link href={constructUrl('/dashboard/my-products')}>
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back to My Products
                        </Link>
                    </Button>
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
                            {/* The entire Form component will go here */}
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
    );
}

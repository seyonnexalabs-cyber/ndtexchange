'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MultiSelect, type MultiSelectOption } from '@/components/ui/multi-select';
import { PlusCircle, ChevronLeft, Wrench, Trash } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useFirebase, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { Product, NDTTechnique, PlatformUser } from '@/lib/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

const addProductSchema = z.object({
  name: z.string().min(2, "Product name is required."),
  type: z.enum(['Instrument', 'Probe', 'Source', 'Sensor', 'Calibration Standard', 'Accessory', 'Visual Aid']),
  techniques: z.array(z.string()).min(1, "At least one technique must be selected."),
  description: z.string().optional(),
  imageUrls: z.array(z.object({ value: z.string().url({ message: "Please enter a valid URL." }).or(z.literal('')) })).optional(),
});

type AddProductFormValues = z.infer<typeof addProductSchema>;

const ProductPreview = ({ productData, manufacturerName }: { productData: Partial<AddProductFormValues>, manufacturerName: string }) => {
    const primaryImage = productData.imageUrls?.[0]?.value;

    return (
        <Card className="overflow-hidden flex flex-col h-full">
            <CardHeader className="p-0">
                <div className="relative h-48 bg-muted rounded-t-lg overflow-hidden">
                    {primaryImage ? (
                        <Image src={primaryImage} alt={productData.name || "Product Preview"} fill className="object-contain p-4" />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <Wrench className="w-12 h-12 text-muted-foreground" />
                        </div>
                    )}
                </div>
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

export default function AddProductPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    const { firestore, auth } = useFirebase();
    const { user: authUser } = useUser();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const { data: currentUserProfile, isLoading: isLoadingProfile } = useDoc<PlatformUser>(
        useMemoFirebase(() => (firestore && authUser ? doc(firestore, 'users', authUser.uid) : null), [firestore, authUser])
    );
    
    const { data: allTechniques, isLoading: isLoadingTechniques } = useCollection<NDTTechnique>(
        useMemoFirebase(() => firestore ? collection(firestore, 'techniques') : null, [firestore])
    );

    const techniqueOptions: MultiSelectOption[] = React.useMemo(() => 
        (allTechniques || []).map(t => ({ value: t.acronym, label: `${t.title} (${t.acronym})` })), 
        [allTechniques]
    );

    const form = useForm<AddProductFormValues>({
        resolver: zodResolver(addProductSchema),
        defaultValues: {
            name: '',
            type: 'Instrument',
            techniques: [],
            description: '',
            imageUrls: [{ value: '' }],
        },
    });
    
    const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: "imageUrls",
    });

    const watchedFormData = form.watch();

    const onSubmit = async (values: AddProductFormValues) => {
        if (!firestore || !currentUserProfile) return;
        setIsSubmitting(true);

        const dataToSave = {
            name: values.name,
            manufacturerId: currentUserProfile.companyId,
            manufacturerName: currentUserProfile.company,
            type: values.type,
            techniques: values.techniques || [],
            description: values.description,
            imageUrls: values.imageUrls?.map(item => item.value).filter(Boolean) || [],
        };
        
        const newProdRef = doc(collection(firestore, 'products'));
        await setDoc(newProdRef, { id: newProdRef.id, ...dataToSave });

        toast({ title: "Product Added", description: `${values.name} has been added to your catalog.` });
        setIsSubmitting(false);
        router.push(constructUrl('/dashboard/my-products'));
    };
    
    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    if (isLoadingTechniques || isLoadingProfile) {
        return <div>Loading...</div>;
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
                        Add New Product
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Fill out the form below to add a new product to your public catalog.
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
                                    <div className="space-y-2">
                                        <FormLabel>Image URLs (Optional)</FormLabel>
                                        {fields.map((field, index) => (
                                        <FormField
                                            key={field.id}
                                            control={form.control}
                                            name={`imageUrls.${index}.value`}
                                            render={({ field }) => (
                                            <FormItem>
                                                <div className="flex items-center gap-2">
                                                <FormControl>
                                                    <Input placeholder="https://example.com/image.jpg" {...field} />
                                                </FormControl>
                                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                            )}
                                        />
                                        ))}
                                        <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => append({ value: "" })}
                                        >
                                        Add Image URL
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
                     <ProductPreview productData={watchedFormData} manufacturerName={currentUserProfile?.company || 'Your Company'} />
                </div>
            </div>
        </div>
    );
}

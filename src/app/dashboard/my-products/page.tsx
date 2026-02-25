'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Wrench, MoreVertical, Edit, PlusCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSearchParams, useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useMemo, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useFirebase, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase";
import { collection, doc, setDoc, updateDoc, query, where, serverTimestamp, addDoc } from 'firebase/firestore';
import { Product, Manufacturer, NDTTechnique, PlatformUser } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect, type MultiSelectOption } from "@/components/ui/multi-select";
import { Trash } from 'lucide-react';


const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Product name is required."),
  type: z.enum(['Instrument', 'Probe', 'Source', 'Sensor', 'Calibration Standard', 'Accessory', 'Visual Aid']),
  techniques: z.array(z.string()).min(1, "At least one technique must be selected."),
  description: z.string().optional(),
  imageUrls: z.array(z.object({ value: z.string().url({ message: "Please enter a valid URL." }).or(z.literal('')) })).optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

const ProductForm = ({
    formId,
    onSubmit,
    defaultValues,
    allTechniques,
}: {
    formId: string,
    onSubmit: (values: ProductFormValues) => void,
    defaultValues?: Partial<ProductFormValues>,
    allTechniques: NDTTechnique[],
}) => {
    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues,
    });

    const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: "imageUrls",
    });

    useEffect(() => {
        if (defaultValues) {
            form.reset({
                ...defaultValues,
                imageUrls: defaultValues.imageUrls && defaultValues.imageUrls.length > 0
                    ? defaultValues.imageUrls
                    : [{ value: '' }]
            });
        }
    }, [defaultValues, form]);
    
    const techniqueOptions: MultiSelectOption[] = useMemo(() =>
        allTechniques.map(t => ({ value: t.acronym, label: `${t.title} (${t.acronym})` })),
        [allTechniques]
    );

    return (
        <Form {...form}>
            <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
            </form>
        </Form>
    );
};

export default function MyProductsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role');
    const { toast } = useToast();
    const { firestore, user: authUser } = useFirebase();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const { data: currentUserProfile, isLoading: isLoadingProfile } = useDoc<PlatformUser>(
        useMemoFirebase(() => (firestore && authUser ? doc(firestore, 'users', authUser.uid) : null), [firestore, authUser])
    );

    const productsQuery = useMemoFirebase(() => (firestore && currentUserProfile?.companyId ? query(collection(firestore, 'products'), where('manufacturerId', '==', currentUserProfile.companyId)) : null), [firestore, currentUserProfile]);
    const { data: products, isLoading: isLoadingProducts } = useCollection<Product>(productsQuery);

    const { data: allTechniques, isLoading: isLoadingTechniques } = useCollection<NDTTechnique>(
        useMemoFirebase(() => firestore ? collection(firestore, 'techniques') : null, [firestore])
    );

    useEffect(() => {
        if (role && role !== 'manufacturer') {
            router.replace(`/dashboard?${searchParams.toString()}`);
        }
    }, [role, router, searchParams]);

    const handleAddClick = () => {
        setEditingProduct(null);
        setIsFormOpen(true);
    };

    const handleEditClick = (product: Product) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    const closeDialog = () => {
        setIsFormOpen(false);
        setEditingProduct(null);
    };

    const handleFormSubmit = async (values: ProductFormValues) => {
        if (!firestore || !currentUserProfile) return;

        const isEditing = !!editingProduct;
        
        const dataToSave: Omit<Product, 'id'> = {
            name: values.name,
            manufacturerId: currentUserProfile.companyId,
            manufacturerName: currentUserProfile.company,
            type: values.type,
            techniques: values.techniques || [],
            description: values.description,
            imageUrls: values.imageUrls?.map(item => item.value).filter(Boolean) || [],
        };

        if (isEditing && editingProduct) {
            const prodRef = doc(firestore, 'products', editingProduct.id);
            await updateDoc(prodRef, dataToSave);
            toast({ title: "Product Updated", description: `${values.name} has been updated.` });
        } else {
            const newProdRef = doc(collection(firestore, 'products'));
            await setDoc(newProdRef, { id: newProdRef.id, ...dataToSave });
            toast({ title: "Product Added", description: `${values.name} has been added to your catalog.` });
        }
        closeDialog();
    };

    if (role !== 'manufacturer') {
        return null;
    }

    const isLoading = isLoadingProducts || isLoadingProfile || isLoadingTechniques;

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <Wrench className="text-primary"/>
                    My Products
                </h1>
                <Button onClick={handleAddClick} className="w-full sm:w-auto"><PlusCircle className="mr-2 h-4 w-4" /> Add New Product</Button>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Your Product Catalog</CardTitle>
                        <CardDescription>Manage all your company's products listed on the NDT EXCHANGE platform.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Techniques</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products?.map(prod => (
                                    <TableRow key={prod.id}>
                                        <TableCell className="font-medium flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                {prod.imageUrls && prod.imageUrls[0] && <AvatarImage src={prod.imageUrls[0]} alt={prod.name} className="object-contain" />}
                                                <AvatarFallback>{prod.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                            </Avatar>
                                            {prod.name}
                                        </TableCell>
                                        <TableCell>{prod.type}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {prod.techniques.map(techId => <Badge key={techId} variant="secondary">{techId}</Badge>)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                        <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEditClick(prod)}>
                                                        <Edit className="mr-2 h-4 w-4"/>
                                                        Edit
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {products?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                            You haven't added any products yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            <Dialog open={isFormOpen} onOpenChange={closeDialog}>
                <DialogContent className="sm:max-w-lg flex flex-col max-h-[90vh] p-0">
                    <DialogHeader className="p-6 pb-4 border-b">
                        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                        <DialogDescription>
                            {editingProduct ? 'Update the details for this product.' : 'Enter the details for a new product to add it to your catalog.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-grow overflow-y-auto px-6">
                        <ProductForm
                            formId="product-form"
                            onSubmit={handleFormSubmit}
                            defaultValues={editingProduct ? {
                                ...editingProduct,
                                imageUrls: editingProduct.imageUrls?.map(url => ({value: url}))
                            } : { techniques: [], imageUrls: [{value: ''}] }}
                            allTechniques={allTechniques || []}
                        />
                    </div>
                    <DialogFooter className="p-6 pt-4 border-t">
                        <Button type="button" variant="ghost" onClick={closeDialog}>Cancel</Button>
                        <Button type="submit" form="product-form">{editingProduct ? 'Save Changes' : 'Add Product'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}

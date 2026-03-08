
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Wrench, MoreVertical, Edit, Trash } from "lucide-react";
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
import { toast } from 'sonner';
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, setDoc, updateDoc, query } from 'firebase/firestore';
import { Product, Manufacturer, NDTTechnique } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect, type MultiSelectOption } from "@/components/ui/multi-select";

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Product name is required."),
  manufacturerId: z.string({ required_error: "Please select a manufacturer." }),
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
    allManufacturers
}: { 
    formId: string, 
    onSubmit: (values: ProductFormValues) => void,
    defaultValues?: Partial<ProductFormValues>,
    allTechniques: NDTTechnique[],
    allManufacturers: Manufacturer[]
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
            form.reset(defaultValues);
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
                    name="manufacturerId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Manufacturer</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a manufacturer" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {allManufacturers.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
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

export default function ProductsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role');
    const { firestore } = useFirebase();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [defaultValues, setDefaultValues] = useState<Partial<ProductFormValues>>({ techniques: [], imageUrls: [{value: ''}] });

    const productsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'products'), orderBy('name')) : null, [firestore]);
    const { data: products, isLoading: isLoadingProducts } = useCollection<Product>(productsQuery);
    
    const manufacturersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'manufacturers') : null, [firestore]);
    const { data: allManufacturers, isLoading: isLoadingManufacturers } = useCollection<Manufacturer>(manufacturersQuery);

    const techniquesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'techniques') : null, [firestore]);
    const { data: allTechniques, isLoading: isLoadingTechniques } = useCollection<NDTTechnique>(techniquesQuery);

    useEffect(() => {
        if (role && role !== 'admin') {
            router.replace(`/dashboard?${searchParams.toString()}`);
        }
    }, [role, router, searchParams]);
    
    const handleAddClick = () => {
        setEditingProduct(null);
        setDefaultValues({ techniques: [], imageUrls: [{ value: '' }] });
        setIsFormOpen(true);
    };

    const handleEditClick = (product: Product) => {
        const imageUrlsForForm = product.imageUrls?.map(url => ({ value: url })) || [{value: ''}];
        if(imageUrlsForForm.length === 0) imageUrlsForForm.push({value: ''}); // Ensure at least one input
        
        setDefaultValues({
            ...product,
            imageUrls: imageUrlsForForm
        });
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    const closeDialog = () => {
        setIsFormOpen(false);
        setEditingProduct(null);
    };

    const handleFormSubmit = async (values: ProductFormValues) => {
        if (!firestore || !allManufacturers) return;
        
        const isEditing = !!editingProduct;
        const manufacturer = allManufacturers.find(m => m.id === values.manufacturerId);
        
        const dataToSave: Omit<Product, 'id'> = {
            name: values.name,
            manufacturerId: values.manufacturerId,
            manufacturerName: manufacturer?.name || 'Unknown',
            type: values.type,
            techniques: values.techniques || [],
            description: values.description,
            imageUrls: values.imageUrls?.map(item => item.value).filter(Boolean) || [],
        };

        if (isEditing && editingProduct) {
            const prodRef = doc(firestore, 'products', editingProduct.id);
            await updateDoc(prodRef, dataToSave);
            toast.success("Product Updated", { description: `${values.name} has been updated.` });
        } else {
            const newProdRef = doc(collection(firestore, 'products'));
            await setDoc(newProdRef, { id: newProdRef.id, ...dataToSave });
            toast.success("Product Added", { description: `${values.name} has been added to the catalog.` });
        }
        closeDialog();
    };

    if (role !== 'admin') {
        return null;
    }

    const isLoading = isLoadingProducts || isLoadingManufacturers || isLoadingTechniques;
    
    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <Wrench className="text-primary"/>
                    Product Catalog Management
                </h1>
                <Button onClick={handleAddClick} className="w-full sm:w-auto">Add New Product</Button>
            </div>
            
             <Card>
                <CardHeader>
                    <CardTitle>Product Directory</CardTitle>
                    <CardDescription>Manage all OEM products available on the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product Name</TableHead>
                                <TableHead>Manufacturer</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Techniques</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && [...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell>
                                </TableRow>
                            ))}
                            {!isLoading && products?.map(prod => (
                                <TableRow key={prod.id}>
                                    <TableCell className="font-medium flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            {prod.imageUrls && prod.imageUrls[0] && <AvatarImage src={prod.imageUrls[0]} alt={prod.name} className="object-contain" />}
                                            <AvatarFallback>{prod.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        {prod.name}
                                    </TableCell>
                                    <TableCell>{prod.manufacturerName}</TableCell>
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
                        </TableBody>
                    </Table>
                     {!isLoading && products?.length === 0 && (
                        <div className="text-center p-10 text-muted-foreground">No products found.</div>
                    )}
                </CardContent>
            </Card>

             <Dialog open={isFormOpen} onOpenChange={closeDialog}>
                 <DialogContent className="sm:max-w-lg flex flex-col max-h-[90vh] p-0">
                    <DialogHeader className="p-6 pb-4 border-b">
                        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                        <DialogDescription>
                            {editingProduct ? 'Update the details for this product.' : 'Enter the details for a new product to add it to the catalog.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-grow overflow-y-auto px-6">
                        <ProductForm
                            formId="product-form"
                            onSubmit={handleFormSubmit}
                            defaultValues={defaultValues}
                            allTechniques={allTechniques || []}
                            allManufacturers={allManufacturers || []}
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

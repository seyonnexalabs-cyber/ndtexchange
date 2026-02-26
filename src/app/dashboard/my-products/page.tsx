
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, Edit, PlusCircle, Trash, Award, Star, Check, X, Send } from "lucide-react";
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useMemo, useEffect, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useFirebase, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase";
import { collection, doc, setDoc, updateDoc, query, where, serverTimestamp, addDoc, orderBy } from 'firebase/firestore';
import { Product, Manufacturer, NDTTechnique, PlatformUser, Review, ReviewReply } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect, type MultiSelectOption } from "@/components/ui/multi-select";
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { GLOBAL_DATE_FORMAT, GLOBAL_DATETIME_FORMAT } from '@/lib/utils';
import { Dialog as ViewerDialog, DialogContent as ViewerDialogContent } from '@/components/ui/dialog';


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

const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-300 text-gray-300'}`}
            />
        ))}
        <span className="ml-2 text-xs text-muted-foreground">{rating > 0 ? rating.toFixed(1) : 'No reviews'}</span>
    </div>
);


const ProductDetailItem = ({ product, reviews, allTechniques, onEditClick, onApproveReview, onRejectReview, onReplyToReview, currentUser }: { 
    product: Product; 
    reviews: any[];
    allTechniques: NDTTechnique[]; 
    onEditClick: (product: Product) => void;
    onApproveReview: (reviewId: string) => void;
    onRejectReview: (reviewId: string) => void;
    onReplyToReview: (reviewId: string, replyText: string) => void;
    currentUser: PlatformUser | null;
}) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const [replyText, setReplyText] = useState("");

  const statusStyles: { [key in Review['status']]: 'success' | 'default' | 'secondary' | 'destructive' | 'outline' } = {
      Pending: 'secondary',
      Approved: 'success',
      Rejected: 'destructive',
  };

  const pendingReviews = reviews.filter(r => r.status === 'Pending');
  const approvedReviews = reviews.filter(r => r.status === 'Approved');
  const rejectedReviews = reviews.filter(r => r.status === 'Rejected');

  return (
    <Card className="overflow-hidden">
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 items-start p-6">
        <div className="md:col-span-1 space-y-2">
            <Carousel setApi={setApi} className="w-full">
                <CarouselContent>
                {product.imageUrls && product.imageUrls.length > 0 ? (
                    product.imageUrls.map((url, index) => (
                    <CarouselItem key={index}>
                        <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                        <Image src={url} alt={`${product.name} image ${index + 1}`} fill className="object-contain p-4" />
                        </div>
                    </CarouselItem>
                    ))
                ) : (
                    <CarouselItem>
                    <div className="relative aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center h-full">
                        <Wrench className="w-24 h-24 text-muted-foreground/30" />
                    </div>
                    </CarouselItem>
                )}
                </CarouselContent>
                 {product.imageUrls && product.imageUrls.length > 1 && (
                    <>
                        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
                        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
                    </>
                )}
            </Carousel>
        </div>
        <div className="md:col-span-2">
            <div className="flex justify-between items-start">
            <h2 className="text-2xl lg:text-3xl font-headline font-bold">{product.name}</h2>
            <Button variant="outline" onClick={() => onEditClick(product)}><Edit className="mr-2 h-4 w-4" /> Edit</Button>
            </div>
            <p className="mt-2 text-lg font-semibold text-primary">{product.type}</p>
            <div className="mt-6 flex flex-wrap gap-2">
            {product.techniques.map(tech => (
                <Badge key={tech} variant="secondary">{allTechniques?.find(t => t.acronym === tech)?.title || tech}</Badge>
            ))}
            </div>
            <div className="mt-8 border-t pt-6">
            <h3 className="text-xl font-semibold">Description</h3>
            <p className="mt-4 text-muted-foreground whitespace-pre-wrap">
                {product.description || 'No description available for this product.'}
            </p>
            </div>
        </div>
        </div>

        <Separator />

        <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Review Management</h3>
            <Tabs defaultValue="pending">
                <TabsList>
                    <TabsTrigger value="pending">Pending ({pendingReviews.length})</TabsTrigger>
                    <TabsTrigger value="approved">Approved ({approvedReviews.length})</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected ({rejectedReviews.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="pending" className="mt-4">
                     {pendingReviews.length > 0 ? (
                        pendingReviews.map(review => (
                             <Card key={review.id} className="mb-4">
                                <CardHeader><StarRating rating={review.rating} /></CardHeader>
                                <CardContent>
                                    <p className="italic text-muted-foreground">"{review.comment}"</p>
                                    <p className="text-xs text-muted-foreground mt-2">By {review.userName} on {review.date?.toDate ? format(review.date.toDate(), GLOBAL_DATE_FORMAT) : 'N/A'}</p>
                                </CardContent>
                                <CardFooter className="flex justify-end gap-2">
                                    <Button variant="outline" size="sm" onClick={() => onRejectReview(review.id)}><X className="mr-2 h-4 w-4" /> Reject</Button>
                                    <Button size="sm" onClick={() => onApproveReview(review.id)}><Check className="mr-2 h-4 w-4" /> Approve</Button>
                                </CardFooter>
                            </Card>
                        ))
                     ) : <p className="text-sm text-center text-muted-foreground py-8">No pending reviews.</p>}
                </TabsContent>
                <TabsContent value="approved" className="mt-4">
                     {approvedReviews.length > 0 ? (
                        approvedReviews.map(review => (
                            <Card key={review.id} className="mb-4">
                               <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <StarRating rating={review.rating} />
                                        <p className="text-xs text-muted-foreground">{review.date?.toDate ? format(review.date.toDate(), GLOBAL_DATE_FORMAT) : 'N/A'}</p>
                                    </div>
                               </CardHeader>
                                <CardContent>
                                    <p className="italic text-muted-foreground">"{review.comment}"</p>
                                    <p className="text-xs text-muted-foreground mt-2">By {review.userName}</p>
                                    {review.reply ? (
                                         <div className="mt-4 ml-8 p-4 bg-muted/50 rounded-lg border">
                                            <p className="text-sm font-semibold flex items-center gap-2">
                                                <Avatar className="h-6 w-6"><AvatarFallback className="text-xs">{review.reply.authorName.split(' ').map(n=>n[0]).join('')}</AvatarFallback></Avatar>
                                                Reply from {review.reply.authorName}
                                            </p>
                                            <p className="text-xs text-muted-foreground pl-8">{review.reply.timestamp?.toDate ? format(review.reply.timestamp.toDate(), GLOBAL_DATETIME_FORMAT) : ''}</p>
                                            <p className="mt-2 text-sm text-muted-foreground italic pl-8">"{review.reply.text}"</p>
                                        </div>
                                    ) : (
                                        <div className="mt-4 ml-8 space-y-2">
                                            <Textarea placeholder="Write a public reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} />
                                            <Button size="sm" onClick={() => { onReplyToReview(review.id, replyText); setReplyText(''); }} disabled={!replyText.trim()}>
                                                <Send className="mr-2 h-4 w-4" />
                                                Post Reply
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                     ) : <p className="text-sm text-center text-muted-foreground py-8">No approved reviews.</p>}
                </TabsContent>
                 <TabsContent value="rejected" className="mt-4">
                     {rejectedReviews.length > 0 ? (
                        rejectedReviews.map(review => (
                            <Card key={review.id} className="mb-4 bg-muted/30">
                                <CardHeader><StarRating rating={review.rating} /></CardHeader>
                                <CardContent>
                                    <p className="italic text-muted-foreground line-through">"{review.comment}"</p>
                                    <p className="text-xs text-muted-foreground mt-2">By {review.userName} on {review.date?.toDate ? format(review.date.toDate(), GLOBAL_DATE_FORMAT) : 'N/A'}</p>
                                </CardContent>
                            </Card>
                        ))
                     ) : <p className="text-sm text-center text-muted-foreground py-8">No rejected reviews.</p>}
                </TabsContent>
            </Tabs>
        </div>
    </Card>
  );
};


export default function MyProductsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role');
    const { toast } = useToast();
    const { firestore, auth } = useFirebase();
    const { user: authUser } = useUser();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [defaultValues, setDefaultValues] = useState<Partial<ProductFormValues>>({ techniques: [], imageUrls: [{value: ''}] });

    const { data: currentUserProfile, isLoading: isLoadingProfile } = useDoc<PlatformUser>(
        useMemoFirebase(() => (firestore && authUser ? doc(firestore, 'users', authUser.uid) : null), [firestore, authUser])
    );

    const productsQuery = useMemoFirebase(() => (firestore ? query(collection(firestore, 'products'), orderBy('name')) : null), [firestore]);
    const { data: allProducts, isLoading: isLoadingProducts } = useCollection<Product>(productsQuery);

    const products = useMemo(() => {
        if (!allProducts || !currentUserProfile?.companyId) return [];
        return allProducts.filter(p => p.manufacturerId === currentUserProfile.companyId);
    }, [allProducts, currentUserProfile]);

    const reviewsQuery = useMemoFirebase(() => {
        if (!firestore || !currentUserProfile?.companyId) return null;
        const productIds = products?.map(p => p.id) || [];
        if (productIds.length === 0) return null;
        return query(collection(firestore, 'reviews'), where('productId', 'in', productIds.slice(0,30)));
    }, [firestore, currentUserProfile, products]);
    const { data: reviewsData, isLoading: isLoadingReviews } = useCollection<Review>(reviewsQuery);
    
    const reviewsByProduct = useMemo(() => {
        if (!reviewsData) return new Map();
        return reviewsData.reduce((acc, review) => {
            if (review.productId) {
                if (!acc.has(review.productId)) {
                    acc.set(review.productId, []);
                }
                acc.get(review.productId)!.push(review);
            }
            return acc;
        }, new Map<string, any[]>());
    }, [reviewsData]);

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
        setDefaultValues({ techniques: [], imageUrls: [{ value: '' }] });
        setIsFormOpen(true);
    };

    const handleEditClick = (product: Product) => {
        const imageUrlsForForm = product.imageUrls?.map(url => ({ value: url })) || [{value: ''}];
        if(imageUrlsForForm.length === 0) imageUrlsForForm.push({value: ''});
        
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
    
    const handleApproveReview = async (reviewId: string) => {
        if (!firestore) return;
        await updateDoc(doc(firestore, 'reviews', reviewId), { status: 'Approved' });
        toast({ title: 'Review Approved' });
    };

    const handleRejectReview = async (reviewId: string) => {
        if (!firestore) return;
        await updateDoc(doc(firestore, 'reviews', reviewId), { status: 'Rejected' });
        toast({ variant: 'destructive', title: 'Review Rejected' });
    };

    const handleReplyToReview = async (reviewId: string, replyText: string) => {
        if (!firestore || !currentUserProfile) return;
        const reply: ReviewReply = {
            text: replyText,
            authorName: currentUserProfile.name,
            timestamp: serverTimestamp(),
        };
        await updateDoc(doc(firestore, 'reviews', reviewId), { reply: reply });
        toast({ title: 'Reply Posted' });
    };

    if (role !== 'manufacturer') {
        return null;
    }

    const isLoading = isLoadingProducts || isLoadingProfile || isLoadingTechniques || isLoadingReviews;

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <Wrench className="text-primary"/>
                    My Products
                </h1>
                <Button onClick={handleAddClick} className="w-full sm:w-auto"><PlusCircle className="mr-2 h-4 w-4" /> Add New Product</Button>
            </div>

            <div className="space-y-12">
                {isLoading ? (
                    <Skeleton className="h-96 w-full" />
                ) : (products || []).length > 0 ? (
                    (products || []).map((prod, index) => (
                        <React.Fragment key={prod.id}>
                            <ProductDetailItem
                                product={prod}
                                reviews={reviewsByProduct.get(prod.id) || []}
                                allTechniques={allTechniques || []}
                                onEditClick={handleEditClick}
                                onApproveReview={handleApproveReview}
                                onRejectReview={handleRejectReview}
                                onReplyToReview={handleReplyToReview}
                                currentUser={currentUserProfile}
                            />
                            {(products || []).length > 1 && index < (products || []).length - 1 && (
                                <Separator className="my-12" />
                            )}
                        </React.Fragment>
                    ))
                ) : (
                    <div className="col-span-full text-center p-10 border rounded-lg">
                        <Wrench className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h2 className="mt-4 text-xl font-headline">No Products Added Yet</h2>
                        <p className="mt-2 text-muted-foreground">Click "Add New Product" to build your catalog.</p>
                    </div>
                )}
            </div>

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
                            defaultValues={defaultValues}
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

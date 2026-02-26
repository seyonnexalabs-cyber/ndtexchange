
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, Edit, PlusCircle, Trash, Award, Star, Check, X, Send, Maximize, ChevronRight } from "lucide-react";
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useFirebase, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase";
import { collection, doc, setDoc, updateDoc, query, where, serverTimestamp, addDoc, orderBy, getDocs } from 'firebase/firestore';
import { Product, Manufacturer, NDTTechnique, PlatformUser, Review, ReviewReply } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { GLOBAL_DATE_FORMAT, GLOBAL_DATETIME_FORMAT } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from 'next/link';

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


const ProductDetailItem = ({ product, reviews, onEditClick, onApproveReview, onRejectReview, onReplyToReview, currentUser }: { 
    product: Product; 
    reviews: any[];
    onEditClick: (product: Product) => void;
    onApproveReview: (reviewId: string) => void;
    onRejectReview: (reviewId: string) => void;
    onReplyToReview: (reviewId: string, replyText: string) => void;
    currentUser: PlatformUser | null;
}) => {

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
        <CardHeader>
             <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl lg:text-3xl font-headline font-bold">{product.name}</h2>
                    <p className="mt-2 text-lg font-semibold text-primary">{product.type}</p>
                </div>
                <Button variant="outline" onClick={() => onEditClick(product)}><Edit className="mr-2 h-4 w-4" /> Edit</Button>
            </div>
        </CardHeader>
        <CardContent>
            <Separator />
             <div className="py-6">
                <h3 className="text-xl font-semibold">Description</h3>
                <p className="mt-4 text-muted-foreground whitespace-pre-wrap">
                    {product.description || 'No description available for this product.'}
                </p>
            </div>
             <Separator />
            <div className="py-6">
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
        </CardContent>
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
    
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const { data: currentUserProfile, isLoading: isLoadingProfile } = useDoc<PlatformUser>(
        useMemoFirebase(() => (firestore && authUser ? doc(firestore, 'users', authUser.uid) : null), [firestore, authUser])
    );

    const productsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'products'), orderBy('name'));
    }, [firestore]);
    const { data: allProducts, isLoading: isLoadingProducts } = useCollection<Product>(productsQuery);

    const products = useMemo(() => {
        if (!allProducts || !currentUserProfile) return [];
        return allProducts.filter(p => p.manufacturerId === currentUserProfile.companyId);
    }, [allProducts, currentUserProfile]);
    
    useEffect(() => {
        if(products && products.length > 0 && !selectedProduct) {
            setSelectedProduct(products[0]);
        }
    }, [products, selectedProduct]);

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
    
    const handleEditClick = (product: Product) => {
        router.push(constructUrl(`/dashboard/my-products/${product.id}`));
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

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    if (role !== 'manufacturer') {
        return null;
    }

    const isLoading = isLoadingProducts || isLoadingProfile || isLoadingTechniques || isLoadingReviews;

    return (
        <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                        <Wrench className="text-primary"/>
                        My Products
                    </h1>
                    <Button asChild className="w-full sm:w-auto">
                        <Link href={constructUrl("/dashboard/my-products/add")}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Product
                        </Link>
                    </Button>
                </div>
                 <Card>
                    <CardHeader>
                        <CardTitle>Your Catalog</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-2">
                                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                            </div>
                        ) : (
                             <div className="space-y-2">
                                {products.map(prod => (
                                    <button
                                        key={prod.id}
                                        onClick={() => setSelectedProduct(prod)}
                                        className={`w-full p-2 text-left rounded-md transition-colors ${selectedProduct?.id === prod.id ? 'bg-muted' : 'hover:bg-muted/50'}`}
                                    >
                                        <p className="font-semibold text-sm">{prod.name}</p>
                                        <p className="text-xs text-muted-foreground">{prod.type}</p>
                                    </button>
                                ))}
                                {products.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No products added yet.</p>}
                            </div>
                        )}
                    </CardContent>
                 </Card>
            </div>
             <div className="lg:col-span-2">
                 {isLoading ? <Skeleton className="h-[80vh]" /> : selectedProduct ? (
                    <ProductDetailItem
                        product={selectedProduct}
                        reviews={reviewsByProduct.get(selectedProduct.id) || []}
                        allTechniques={allTechniques || []}
                        onEditClick={handleEditClick}
                        onApproveReview={handleApproveReview}
                        onRejectReview={handleRejectReview}
                        onReplyToReview={handleReplyToReview}
                        currentUser={currentUserProfile}
                    />
                 ) : (
                    <Card className="flex flex-col items-center justify-center text-center p-12 min-h-[50vh]">
                        <Wrench className="mx-auto h-16 w-16 text-muted-foreground/50" />
                        <h2 className="mt-4 text-xl font-headline">Select a Product</h2>
                        <p className="mt-2 text-muted-foreground">Select a product from the list to view its details and manage reviews.</p>
                    </Card>
                 )}
            </div>
        </div>
    );
}

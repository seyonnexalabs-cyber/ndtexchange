'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, Edit, PlusCircle, Star, Award } from "lucide-react";
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useMemo } from "react";
import { useFirebase, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase";
import { collection, doc, query, where, orderBy } from 'firebase/firestore';
import { Product, PlatformUser, Review } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const StarRating = ({ rating }: { rating: number }) => {
    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-300 text-gray-300'}`}
                />
            ))}
            {rating > 0 && <span className="ml-2 text-xs text-muted-foreground">{rating.toFixed(1)}</span>}
        </div>
    );
};

export default function MyProductsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role');
    const { firestore } = useFirebase();
    const { user: authUser } = useUser();

    const { data: currentUserProfile, isLoading: isLoadingProfile } = useDoc<PlatformUser>(
        useMemoFirebase(() => (firestore && authUser ? doc(firestore, 'users', authUser.uid) : null), [firestore, authUser])
    );

    const productsQuery = useMemoFirebase(() => {
        if (!firestore || !currentUserProfile) return null;
        return query(collection(firestore, 'products'), where('manufacturerId', '==', currentUserProfile.companyId), orderBy('name'));
    }, [firestore, currentUserProfile]);
    const { data: products, isLoading: isLoadingProducts } = useCollection<Product>(productsQuery);

    const reviewsQuery = useMemoFirebase(() => {
        if (!firestore || !products || products.length === 0) return null;
        const productIds = products.map(p => p.id);
        return query(collection(firestore, 'reviews'), where('productId', 'in', productIds));
    }, [firestore, products]);
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


    React.useEffect(() => {
        if (role && role !== 'manufacturer') {
            router.replace(`/dashboard?${searchParams.toString()}`);
        }
    }, [role, router, searchParams]);
    
    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    if (role !== 'manufacturer') {
        return null;
    }

    const isLoading = isLoadingProducts || isLoadingProfile || isLoadingReviews;

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
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
            
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-80 w-full" />)}
                </div>
            ) : products && products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map(product => {
                        const productReviews = reviewsByProduct.get(product.id) || [];
                        const avgRating = productReviews.length > 0
                            ? productReviews.reduce((acc, r) => acc + r.rating, 0) / productReviews.length
                            : 0;
                        
                        return (
                             <Card key={product.id} className="flex flex-col group">
                                <CardHeader className="p-0">
                                    <div className="relative aspect-square bg-muted rounded-t-lg overflow-hidden">
                                        {product.imageUrls && product.imageUrls.length > 0 ? (
                                            <Image src={product.imageUrls[0]} alt={product.name} fill className="object-contain p-4" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <Wrench className="w-12 h-12 text-muted-foreground/30" />
                                            </div>
                                        )}
                                        {product.isAwardWinning && (
                                            <div className="absolute top-2 right-2 bg-amber-400 text-white p-1.5 rounded-full shadow-lg" title="Award-Winning Product">
                                                <Award className="h-4 w-4" />
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 flex-grow">
                                    <CardTitle className="text-base font-semibold leading-tight mb-1">{product.name}</CardTitle>
                                    <CardDescription>{product.type}</CardDescription>
                                    <div className="mt-2">
                                        <StarRating rating={avgRating} />
                                    </div>
                                </CardContent>
                                <CardFooter className="p-4 pt-0">
                                    <Button asChild variant="outline" size="sm" className="w-full">
                                        <Link href={constructUrl(`/dashboard/my-products/${product.id}`)}>
                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            ) : (
                 <Card className="flex flex-col items-center justify-center text-center p-12 min-h-[50vh]">
                    <Wrench className="mx-auto h-16 w-16 text-muted-foreground/50" />
                    <h2 className="mt-4 text-xl font-headline">No Products Added Yet</h2>
                    <p className="mt-2 text-muted-foreground">Click "Add Product" to build your public catalog.</p>
                </Card>
            )}
        </div>
    );
}

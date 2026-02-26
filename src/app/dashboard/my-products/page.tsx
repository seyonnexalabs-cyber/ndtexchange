
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, Edit, PlusCircle, Star, Award, MoreVertical, ExternalLink, Search, Circle } from "lucide-react";
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useMemo } from "react";
import { useFirebase, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase";
import { collection, doc, query, where, orderBy } from 'firebase/firestore';
import { Product, PlatformUser, Review } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import Link from 'next/link';
import Image from 'next/image';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const calculateCompleteness = (product: Product) => {
    let score = 0;
    const totalPoints = 5;
    if (product.description && product.description.length > 20) score++;
    if (product.imageUrls && product.imageUrls.length > 0) score++;
    if (product.specifications && product.specifications.length > 0) score++;
    if (product.certifications && product.certifications.length > 0) score++;
    if (product.techniques && product.techniques.length > 1) score++;
    return Math.round((score / totalPoints) * 100);
}


export default function MyProductsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role');
    const { firestore } = useFirebase();
    const { user: authUser } = useUser();
    const [searchQuery, setSearchQuery] = useState('');

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
    
    const filteredProducts = useMemo(() => {
        if (!products) return [];
        if (!searchQuery) return products;
        return products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [products, searchQuery]);


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
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-headline font-semibold">My Products</h1>
                    <p className="text-muted-foreground">All products for {currentUserProfile?.company}.</p>
                </div>
            </div>
             <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="w-full sm:w-auto flex-grow max-w-sm">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button onClick={() => router.push(constructUrl("/dashboard/my-products/add"))} className="w-full sm:w-auto">Add Product</Button>
                    <Button variant="outline" className="w-full sm:w-auto">Import</Button>
                </div>
            </div>
            
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
                </div>
            ) : filteredProducts && filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredProducts.map(product => {
                        const completeness = calculateCompleteness(product);
                        const completenessVariant: 'success' | 'destructive' | 'default' = completeness > 80 ? 'success' : completeness > 40 ? 'default' : 'destructive';
                        
                        return (
                             <Card key={product.id} className="group overflow-hidden transition-all hover:shadow-lg">
                                <CardHeader className="p-3 flex-row items-center justify-between">
                                    <Badge variant={completenessVariant}>{completeness}%</Badge>
                                    <div className="flex items-center gap-0">
                                        <Button asChild variant="ghost" size="icon" className="h-7 w-7">
                                            <Link href={constructUrl(`/dashboard/my-products/${product.id}`)}>
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-3 pt-0 text-center">
                                    <Link href={constructUrl(`/dashboard/my-products/${product.id}`)}>
                                        <div className="relative aspect-square bg-muted rounded-md overflow-hidden flex items-center justify-center">
                                             {product.imageUrls && product.imageUrls.length > 0 ? (
                                                <Image src={product.imageUrls[0]} alt={product.name} fill className="object-contain p-2 group-hover:scale-105 transition-transform" />
                                            ) : (
                                                <Wrench className="w-12 h-12 text-muted-foreground/30" />
                                            )}
                                        </div>
                                        <p className="font-semibold text-sm mt-2 truncate group-hover:text-primary">{product.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{product.id}</p>
                                    </Link>
                                </CardContent>
                                <CardFooter className="p-3 flex justify-between items-center">
                                    <div className="flex gap-1 flex-wrap">
                                        {product.techniques.slice(0, 2).map(t => (
                                            <Badge key={t} variant="secondary">{t}</Badge>
                                        ))}
                                    </div>
                                    <div className={cn("h-2 w-2 rounded-full", 'bg-green-500')} />
                                </CardFooter>
                            </Card>
                        )
                    })}
                     <Link href={constructUrl("/dashboard/my-products/add")}>
                        <Card className="h-full border-2 border-dashed bg-muted/50 hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center">
                            <div className="text-center text-muted-foreground">
                                <PlusCircle className="h-10 w-10 mx-auto" />
                                <p className="mt-2 font-semibold">Add New Product</p>
                            </div>
                        </Card>
                    </Link>
                </div>
            ) : (
                 <div className="text-center p-10 border-2 border-dashed rounded-lg">
                    <Wrench className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h2 className="mt-4 text-xl font-headline">No Products Found</h2>
                    <p className="mt-2 text-muted-foreground">Click "Add Product" to build your public catalog.</p>
                </div>
            )}
        </div>
    );
}


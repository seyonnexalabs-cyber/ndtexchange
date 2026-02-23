
'use client';
import * as React from 'react';
import { useMemo } from "react";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Star, ExternalLink, Wrench } from "lucide-react";
import { useFirebase, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import type { Product, Manufacturer, NDTTechnique } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const StarRating = ({ rating, reviewCount }: { rating: number, reviewCount: number }) => {
    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center">
                <span className="text-lg font-bold mr-1">{rating.toFixed(1)}</span>
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
            <span className="text-sm text-muted-foreground">({reviewCount} reviews)</span>
        </div>
    );
};

const createReferralUrl = (url: string) => {
    try {
        const referralUrl = new URL(url);
        referralUrl.searchParams.set('utm_source', 'ndt_exchange');
        referralUrl.searchParams.set('utm_medium', 'referral');
        referralUrl.searchParams.set('utm_campaign', 'product_directory');
        return referralUrl.toString();
    } catch (error) {
        console.error("Invalid URL:", url);
        return url;
    }
};

export default function PublicProductProfilePage() {
    const params = useParams();
    const { id } = params;
    const { firestore } = useFirebase();

    const productRef = useMemoFirebase(() => (firestore && id ? doc(firestore, 'products', id as string) : null), [firestore, id]);
    const { data: product, isLoading: isLoadingProduct } = useDoc<Product>(productRef);

    const manufacturerRef = useMemoFirebase(() => (firestore && product?.manufacturerId ? doc(firestore, 'manufacturers', product.manufacturerId) : null), [firestore, product]);
    const { data: manufacturer, isLoading: isLoadingManufacturer } = useDoc<Manufacturer>(manufacturerRef);
    
    const { data: ndtTechniques, isLoading: isLoadingTechniques } = useCollection<NDTTechnique>(useMemoFirebase(() => firestore ? collection(firestore, 'techniques') : null, [firestore]));

    const isLoading = isLoadingProduct || isLoadingManufacturer || isLoadingTechniques;

    if (isLoading) {
        return (
             <div className="bg-background">
                <PublicHeader />
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="space-y-6">
                        <Skeleton className="h-8 w-1/4 mb-6" />
                        <div className="grid md:grid-cols-3 gap-8">
                            <Skeleton className="md:col-span-1 h-80 w-full" />
                            <div className="md:col-span-2 space-y-4">
                                <Skeleton className="h-10 w-3/4" />
                                <Skeleton className="h-6 w-1/2" />
                                <Skeleton className="h-12 w-48" />
                                <Skeleton className="h-24 w-full" />
                            </div>
                        </div>
                    </div>
                </div>
                <PublicFooter />
            </div>
        );
    }
    
    if (!product) {
        notFound();
    }

    return (
        <div className="bg-background">
            <PublicHeader />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                    <Button asChild variant="outline" size="sm" className="mb-4 sm:mb-0">
                        <Link href="/ecosystem?tab=products">
                            <ChevronLeft className="mr-2 h-4 w-4 text-primary" />
                            Back to Product Catalog
                        </Link>
                    </Button>
                </div>

                <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                    <div className="md:col-span-1">
                        <Card className="overflow-hidden">
                            <Carousel className="w-full">
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
                                                <Wrench className="w-24 h-24 text-muted-foreground/30"/>
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
                        </Card>
                    </div>

                     <div className="md:col-span-2">
                        <h1 className="text-3xl lg:text-4xl font-headline font-bold">{product.name}</h1>
                        <p className="mt-2 text-lg text-primary font-semibold">by {manufacturer?.name || product.manufacturerName}</p>
                        
                        <div className="flex items-center gap-4 mt-4">
                             <StarRating rating={4.5} reviewCount={128} /> {/* Placeholder */}
                        </div>

                         <div className="mt-6 flex flex-wrap gap-2">
                            {product.techniques.map(tech => (
                                <Badge key={tech} variant="secondary">{ndtTechniques?.find(t => t.acronym === tech)?.title || tech}</Badge>
                            ))}
                        </div>

                        {manufacturer?.url && (
                             <Button asChild size="lg" className="mt-8">
                                <a href={createReferralUrl(manufacturer.url)} target="_blank" rel="noopener noreferrer">
                                    Visit Manufacturer <ExternalLink className="ml-2"/>
                                </a>
                            </Button>
                        )}
                        
                        <div className="mt-8 border-t pt-6">
                            <h2 className="text-xl font-semibold">Description</h2>
                            <p className="mt-4 text-muted-foreground whitespace-pre-wrap">
                                {product.description || 'No description available for this product.'}
                            </p>
                        </div>
                    </div>
                </div>

            </main>
            <PublicFooter />
        </div>
    );
}

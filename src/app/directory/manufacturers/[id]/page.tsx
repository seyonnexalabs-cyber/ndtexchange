
'use client';

import * as React from 'react';
import { useMemo } from "react";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import Image from 'next/image';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ExternalLink, Factory } from "lucide-react";
import { useFirebase, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query } from 'firebase/firestore';
import type { Manufacturer, NDTTechnique } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import HoneycombHero from '@/components/ui/honeycomb-hero';
import { cn } from '@/lib/utils';

const createReferralUrl = (url: string) => {
    try {
        const referralUrl = new URL(url);
        referralUrl.searchParams.set('utm_source', 'ndt_exchange');
        referralUrl.searchParams.set('utm_medium', 'referral');
        referralUrl.searchParams.set('utm_campaign', 'manufacturer_directory');
        return referralUrl.toString();
    } catch (error) {
        console.error("Invalid URL:", url);
        return url;
    }
};

export default function PublicManufacturerProfilePage() {
    const params = useParams();
    const { id } = params;
    const { firestore } = useFirebase();

    const manufacturerRef = useMemoFirebase(() => (firestore && id ? doc(firestore, 'manufacturers', id as string) : null), [firestore, id]);
    const { data: manufacturer, isLoading: isLoadingManufacturer } = useDoc<Manufacturer>(manufacturerRef);
    
    const { data: ndtTechniques, isLoading: isLoadingTechniques } = useCollection<NDTTechnique>(useMemoFirebase(() => firestore ? collection(firestore, 'techniques') : null, [firestore]));

    const isLoading = isLoadingManufacturer || isLoadingTechniques || !id;

    if (!id) {
        notFound();
    }
    
    if (isLoading) {
        return (
             <div className="bg-background">
                <PublicHeader />
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="space-y-6">
                        <Skeleton className="h-8 w-1/4 mb-6" />
                        <div className="flex items-center gap-4 mb-6">
                            <Skeleton className="h-20 w-20 rounded-lg" />
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-64" />
                                <Skeleton className="h-4 w-48" />
                            </div>
                        </div>
                        <Skeleton className="h-48 w-full" />
                    </div>
                </div>
                <PublicFooter />
            </div>
        );
    }
    
    if (!manufacturer) {
        notFound();
    }

    return (
        <div className="bg-background">
            <PublicHeader />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                    <Link href="/ecosystem?tab=manufacturers" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mb-4 sm:mb-0")}>
                        <ChevronLeft className="mr-2 h-4 w-4 text-primary" />
                        Back to Ecosystem
                    </Link>
                </div>

                <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                    <div className="md:col-span-1">
                        <Card>
                            <CardHeader>
                                <div className="relative h-24 w-full">
                                    <Image 
                                        src={manufacturer.logoUrl || `https://placehold.co/200x80/e2e8f0/64748b/png?text=${manufacturer.name.replace(/\s/g, '+')}`} 
                                        alt={`${manufacturer.name} logo`} 
                                        fill 
                                        className="object-contain" 
                                    />
                                </div>
                                <CardTitle className="text-center pt-4">{manufacturer.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                 <Button asChild className="w-full">
                                    <a href={createReferralUrl(manufacturer.url)} target="_blank" rel="noopener noreferrer">
                                        Visit Website <ExternalLink className="ml-2"/>
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                     <div className="md:col-span-2">
                         <Card>
                             <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Factory className="text-primary"/> About {manufacturer.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="font-semibold text-sm mb-1">Company Description</h3>
                                    <p className="text-sm text-muted-foreground">{manufacturer.description || 'No description available.'}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold mb-2">Specialized Techniques</h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {manufacturer.techniqueIds.map(techId => (
                                            <Badge key={techId} variant="secondary">{ndtTechniques?.find(t => t.acronym === techId)?.title || techId}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                         </Card>
                    </div>
                </div>

            </main>
            <PublicFooter />
        </div>
    );
}

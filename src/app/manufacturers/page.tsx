
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import { useMemo } from 'react';
import { Manufacturer, NDTTechnique, Product } from '@/lib/types';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import HoneycombHero from '@/components/ui/honeycomb-hero';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Wrench } from 'lucide-react';


export default function ManufacturersPage() {
    const { firestore } = useFirebase();

    const manufacturersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'manufacturers') : null, [firestore]);
    const { data: manufacturers, isLoading: isLoadingManufacturers } = useCollection<Manufacturer>(manufacturersQuery);
    
    const techniquesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'techniques') : null, [firestore]);
    const { data: ndtTechniques, isLoading: isLoadingTechniques } = useCollection<NDTTechnique>(techniquesQuery);
    
    const productsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'products') : null, [firestore]);
    const { data: allProducts, isLoading: isLoadingProducts } = useCollection<Product>(productsQuery);

    const groupedManufacturers = useMemo(() => {
        if (!ndtTechniques || !manufacturers) return [];
        return ndtTechniques
            .map(technique => {
                const associatedManufacturers = manufacturers.filter(m => m.techniqueIds.includes(technique.acronym));
                return {
                    ...technique,
                    manufacturers: associatedManufacturers
                };
            })
            .filter(group => group.manufacturers.length > 0)
            .sort((a,b) => a.title.localeCompare(b.title));
    }, [ndtTechniques, manufacturers]);

    const isLoading = isLoadingManufacturers || isLoadingTechniques || isLoadingProducts;

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <PublicHeader />

            <main className="flex-grow">
                <HoneycombHero>
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">
                            NDT Equipment Ecosystem
                        </h1>
                        <p className="mt-6 text-lg md:text-xl text-muted-foreground">
                            Browse our directory of Original Equipment Manufacturers (OEMs) and explore the products being used by NDT professionals on the platform.
                        </p>
                    </div>
                </HoneycombHero>
                
                <section className="py-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <Tabs defaultValue="directory" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-12">
                                <TabsTrigger value="directory">Manufacturers Directory</TabsTrigger>
                                <TabsTrigger value="products">Products Gallery</TabsTrigger>
                            </TabsList>
                            <TabsContent value="directory">
                                {isLoading ? (
                                    <div className="space-y-12">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i}>
                                                <Skeleton className="h-8 w-1/3 mb-2" />
                                                <Skeleton className="h-4 w-2/3 mb-6" />
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                                    {[...Array(5)].map((_, j) => <Skeleton key={j} className="h-48 w-full" />)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <TooltipProvider>
                                        <div className="space-y-16">
                                            {groupedManufacturers.map(group => (
                                                <div key={group.id}>
                                                    <div className="mb-8">
                                                        <h2 className="text-2xl font-headline font-semibold text-primary">{group.title} ({group.acronym})</h2>
                                                        <p className="mt-2 text-muted-foreground max-w-2xl">{group.description}</p>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                                        {group.manufacturers.map(manufacturer => (
                                                            <Card key={manufacturer.id} className="flex flex-col">
                                                                <CardHeader>
                                                                    <a href={manufacturer.url} target="_blank" rel="noopener noreferrer" className="block relative h-20 bg-card p-2 rounded-md">
                                                                        <Image 
                                                                            src={manufacturer.logoUrl || `https://placehold.co/200x80/e2e8f0/64748b/png?text=${manufacturer.name.replace(/\s/g, '+')}`}
                                                                            alt={`${manufacturer.name} logo`}
                                                                            fill
                                                                            className="object-contain"
                                                                        />
                                                                    </a>
                                                                </CardHeader>
                                                                <CardContent className="p-6 pt-0 flex-grow space-y-4">
                                                                    <CardTitle className="text-lg leading-tight" title={manufacturer.name}>{manufacturer.name}</CardTitle>
                                                                    {manufacturer.description && <p className="text-sm text-muted-foreground h-20 overflow-hidden">{manufacturer.description}</p>}
                                                                    <div>
                                                                        <h4 className="text-xs font-semibold mb-2 uppercase tracking-wider text-muted-foreground">Specialties</h4>
                                                                        <div className="flex flex-wrap gap-1.5">
                                                                            {manufacturer.techniqueIds.map(techId => {
                                                                                const technique = ndtTechniques?.find(t => t.acronym === techId);
                                                                                return (
                                                                                    <Tooltip key={techId}>
                                                                                        <TooltipTrigger>
                                                                                            <Badge variant="secondary" shape="rounded">{techId}</Badge>
                                                                                        </TooltipTrigger>
                                                                                        {technique && (
                                                                                            <TooltipContent><p>{technique.title}</p></TooltipContent>
                                                                                        )}
                                                                                    </Tooltip>
                                                                                )
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                </CardContent>
                                                                <CardFooter className="p-6 pt-0">
                                                                    <Button asChild variant="outline" className="w-full" size="sm">
                                                                        <a href={manufacturer.url} target="_blank" rel="noopener noreferrer">Visit Website</a>
                                                                    </Button>
                                                                </CardFooter>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                            {groupedManufacturers.length === 0 && (
                                                <div className="col-span-full text-center py-20">
                                                    <p className="text-xl font-semibold">No Manufacturers Found</p>
                                                    <p className="text-muted-foreground mt-2">Check back soon as we continue to grow our directory.</p>
                                                </div>
                                            )}
                                        </div>
                                    </TooltipProvider>
                                )}
                            </TabsContent>
                             <TabsContent value="products">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {isLoading ? (
                                        [...Array(8)].map((_, i) => <Skeleton key={i} className="h-80 w-full" />)
                                    ) : (
                                        (allProducts || []).map(product => (
                                            <Card key={product.id}>
                                                <CardHeader className="p-0">
                                                    <div className="relative h-40 bg-muted rounded-t-lg">
                                                        {product.imageUrl ? (
                                                            <Image src={product.imageUrl} alt={product.name} fill className="object-contain p-2"/>
                                                        ) : (
                                                            <div className="flex items-center justify-center h-full">
                                                                <Wrench className="w-12 h-12 text-muted-foreground"/>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="p-4">
                                                    <CardTitle className="text-base font-semibold" title={product.name}>{product.name}</CardTitle>
                                                    <CardDescription>{product.manufacturerName}</CardDescription>
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {product.techniques.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                    {!isLoading && allProducts?.length === 0 && (
                                        <div className="col-span-full text-center py-20">
                                            <p className="text-xl font-semibold">No Products Found</p>
                                            <p className="text-muted-foreground mt-2">Products from manufacturers will appear here.</p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </section>
                 <section className="bg-card py-20">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-headline font-semibold text-primary">
                      Are you an OEM?
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                      Connect with a targeted audience of NDT professionals and asset owners. Showcase your products and generate qualified leads.
                    </p>
                    <div className="mt-8">
                      <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                        <Link href="/oem-solutions">Explore OEM Solutions</Link>
                      </Button>
                    </div>
                  </div>
                </section>
            </main>
            <PublicFooter />
        </div>
    </TooltipProvider>
  );
}

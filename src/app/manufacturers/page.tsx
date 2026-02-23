
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import { useMemo, useState } from 'react';
import { Manufacturer, NDTTechnique, Product } from '@/lib/types';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import HoneycombHero from '@/components/ui/honeycomb-hero';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wrench, Handshake } from 'lucide-react';

export default function ManufacturersPage() {
    const { firestore } = useFirebase();
    const [selectedTechnique, setSelectedTechnique] = useState<string | null>(null);

    const manufacturersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'manufacturers') : null, [firestore]);
    const { data: manufacturers, isLoading: isLoadingManufacturers } = useCollection<Manufacturer>(manufacturersQuery);
    
    const techniquesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'techniques') : null, [firestore]);
    const { data: ndtTechniques, isLoading: isLoadingTechniques } = useCollection<NDTTechnique>(techniquesQuery);
    
    const productsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'products')) : null, [firestore]);
    const { data: productsData, isLoading: isLoadingProducts } = useCollection<Product>(productsQuery);

    const filteredManufacturers = useMemo(() => {
        if (!manufacturers) return [];
        if (!selectedTechnique) return manufacturers;
        return manufacturers.filter(m => m.techniqueIds.includes(selectedTechnique));
    }, [manufacturers, selectedTechnique]);

    const sortedNdtTechniques = useMemo(() => {
        if (!ndtTechniques) return [];
        return [...ndtTechniques].sort((a,b) => a.title.localeCompare(b.title));
    }, [ndtTechniques]);

    const isLoading = isLoadingManufacturers || isLoadingTechniques || isLoadingProducts;

    return (
        <TooltipProvider>
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
                            <div className="text-center mb-12">
                                <h2 className="text-3xl font-headline font-semibold text-primary">Manufacturers Directory</h2>
                                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">Filter by technology to discover leading equipment suppliers.</p>
                            </div>

                            <div className="flex flex-wrap justify-center gap-2 mb-12">
                                <Button variant={!selectedTechnique ? 'default' : 'outline'} onClick={() => setSelectedTechnique(null)}>All Manufacturers</Button>
                                {isLoadingTechniques ? (
                                    <Skeleton className="h-10 w-48" />
                                ) : (
                                    sortedNdtTechniques?.map(technique => (
                                        <Button key={technique.id} variant={selectedTechnique === technique.acronym ? 'default' : 'outline'} onClick={() => setSelectedTechnique(technique.acronym)}>
                                            {technique.title}
                                        </Button>
                                    ))
                                )}
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                                {isLoadingManufacturers ? (
                                    [...Array(10)].map((_, i) => <Skeleton key={i} className="h-80 w-full" />)
                                ) : (
                                    filteredManufacturers.map(manufacturer => (
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
                                                <CardTitle className="text-base leading-tight" title={manufacturer.name}>{manufacturer.name}</CardTitle>
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
                                    ))
                                )}
                            </div>
                             {filteredManufacturers.length === 0 && !isLoadingManufacturers && (
                                <div className="col-span-full text-center py-20">
                                    <p className="text-xl font-semibold">No Manufacturers Found</p>
                                    <p className="text-muted-foreground mt-2">No manufacturers match the selected technique.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="py-20 bg-card">
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl font-headline font-semibold text-primary">Featured Products</h2>
                                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">A gallery of cutting-edge NDT equipment used by professionals on the platform.</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                                {isLoadingProducts ? (
                                    [...Array(10)].map((_, i) => <Skeleton key={i} className="h-64 w-full" />)
                                ) : (productsData || []).map(product => (
                                    <Card key={product.id} className="group">
                                        <CardHeader className="p-0">
                                            <div className="relative h-48 bg-muted rounded-t-lg overflow-hidden">
                                                {product.imageUrl ? (
                                                    <Image src={product.imageUrl} alt={product.name} fill className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"/>
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
                                ))}
                            </div>
                        </div>
                    </section>
                    
                    <section className="py-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="p-8 md:p-12 bg-accent/10 rounded-lg max-w-4xl mx-auto border border-accent/20">
                            <div className="mx-auto bg-accent p-4 rounded-full w-fit mb-6">
                                <Handshake className="w-10 h-10 text-accent-foreground" />
                            </div>
                            <h2 className="text-3xl font-headline font-semibold text-accent">
                            Are you an OEM?
                            </h2>
                            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                            Connect with a targeted audience of NDT professionals and asset owners. Showcase your products and generate qualified leads by being featured on our platform.
                            </p>
                            <div className="mt-8">
                            <Button size="lg" asChild>
                                <Link href="/oem-solutions">Explore OEM Solutions</Link>
                            </Button>
                            </div>
                        </div>
                    </div>
                    </section>
                </main>
                <PublicFooter />
            </div>
        </TooltipProvider>
    );
}

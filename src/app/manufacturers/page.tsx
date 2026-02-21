
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import { useMemo } from 'react';
import { Manufacturer, NDTTechnique } from '@/lib/types';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import HoneycombHero from '@/components/ui/honeycomb-hero';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


export default function ManufacturersPage() {
    const { firestore } = useFirebase();

    const manufacturersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'manufacturers') : null, [firestore]);
    const { data: manufacturers, isLoading: isLoadingManufacturers } = useCollection<Manufacturer>(manufacturersQuery);
    
    const techniquesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'techniques') : null, [firestore]);
    const { data: ndtTechniques, isLoading: isLoadingTechniques } = useCollection<NDTTechnique>(techniquesQuery);

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
            .filter(group => group.manufacturers.length > 0) // Only show techniques that have manufacturers
            .sort((a,b) => a.title.localeCompare(b.title));
    }, [ndtTechniques, manufacturers]);
    
    const isLoading = isLoadingManufacturers || isLoadingTechniques;

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <PublicHeader />

            <main className="flex-grow">
                <HoneycombHero>
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">
                            NDT Equipment Manufacturers
                        </h1>
                        <p className="mt-6 text-lg md:text-xl text-muted-foreground">
                            Browse a curated directory of Original Equipment Manufacturers (OEMs), organized by NDT technique to help you find the right technology partner.
                        </p>
                    </div>
                </HoneycombHero>
                
                <section className="py-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        {isLoading ? (
                            <div className="space-y-12">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i}>
                                        <Skeleton className="h-8 w-1/3 mb-2" />
                                        <Skeleton className="h-4 w-2/3 mb-6" />
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center">
                                            {[...Array(6)].map((_, j) => <Skeleton key={j} className="h-16 w-full" />)}
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
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-12 items-center">
                                                {group.manufacturers.map(manufacturer => (
                                                    <Tooltip key={manufacturer.id}>
                                                        <TooltipTrigger asChild>
                                                            <Link href={manufacturer.url} target="_blank" rel="noopener noreferrer" className="grayscale opacity-75 hover:grayscale-0 hover:opacity-100 transition-all duration-300 ease-in-out flex items-center justify-center">
                                                                <Image 
                                                                    src={manufacturer.logoUrl || `https://placehold.co/200x80/e2e8f0/64748b/png?text=${manufacturer.name.replace(/\s/g, '+')}`}
                                                                    alt={`${manufacturer.name} logo`}
                                                                    width={200}
                                                                    height={80}
                                                                    className="object-contain w-full h-16"
                                                                />
                                                            </Link>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>{manufacturer.name}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
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
    );
}

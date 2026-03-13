
'use client';

import type { Metadata } from 'next';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { NDTTechnique, Manufacturer } from '@/lib/types';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import HoneycombHero from '@/components/ui/honeycomb-hero';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Factory } from 'lucide-react';

// export const metadata: Metadata = { // Can't use static metadata in a client component
//   title: 'NDT Techniques Directory',
//   description: 'Explore a comprehensive directory of Non-Destructive Testing (NDT) techniques and the manufacturers who specialize in them.',
// };

export default function TechniquesPage() {
    const { firestore } = useFirebase();

    const techniquesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'techniques') : null, [firestore]);
    const { data: ndtTechniques, isLoading: isLoadingTechniques } = useCollection<NDTTechnique>(techniquesQuery);
  
    const manufacturersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'manufacturers') : null, [firestore]);
    const { data: manufacturers, isLoading: isLoadingManufacturers } = useCollection<Manufacturer>(manufacturersQuery);

    const sortedNdtTechniques = useMemo(() => {
        if (!ndtTechniques) return [];
        return [...ndtTechniques].sort((a,b) => a.title.localeCompare(b.title));
    }, [ndtTechniques]);

    const isLoading = isLoadingTechniques || isLoadingManufacturers;

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <PublicHeader />
            <main className="flex-grow">
                <HoneycombHero>
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary-foreground">
                            NDT Techniques Directory
                        </h1>
                        <p className="mt-6 text-lg md:text-xl text-primary-foreground/80">
                            Explore a comprehensive guide to Non-Destructive Testing methods and the leading manufacturers who specialize in each technology.
                        </p>
                    </div>
                </HoneycombHero>

                <section className="py-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {isLoading ? [...Array(12)].map((_, i) => <Skeleton key={i} className="h-[450px] w-full" />) :
                            sortedNdtTechniques.map(technique => {
                                const techImage = PlaceHolderImages?.find(p => p.id === technique.imageId);
                                const relevantManufacturers = manufacturers?.filter(m => m.techniqueIds.includes(technique.acronym)) || [];
                                return (
                                    <Card key={technique.id} className="flex flex-col">
                                        <CardHeader className="p-0">
                                            <div className="relative h-48 w-full bg-muted rounded-t-lg overflow-hidden">
                                                {techImage?.imageUrl ? (
                                                    <Image src={techImage.imageUrl} alt={technique.title} fill className="object-cover" data-ai-hint={techImage.imageHint} />
                                                ) : <div className="flex items-center justify-center h-full"><Factory className="w-16 h-16 text-muted-foreground"/></div>}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-6 flex-grow flex flex-col">
                                            <CardTitle className="font-headline">{technique.title} <Badge variant="outline">{technique.acronym}</Badge></CardTitle>
                                            <CardDescription className="mt-2 flex-grow">{technique.description}</CardDescription>
                                            <div className="mt-4 pt-4 border-t">
                                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><Factory className="w-4 h-4 text-primary"/> Key Manufacturers</h4>
                                                {relevantManufacturers.length > 0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {relevantManufacturers.map(m => (
                                                            <Link key={m.id} href={`/directory/manufacturers/${m.id}`} passHref>
                                                                <Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground transition-colors">{m.name}</Badge>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-muted-foreground">No specific manufacturers listed.</p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>
                </section>
            </main>
            <PublicFooter />
        </div>
    );
}

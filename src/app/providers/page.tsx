

'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, MapPin, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { serviceProviders } from '@/lib/service-providers-data';
import { NDTTechniques } from '@/lib/placeholder-data';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';

const StarRating = ({ rating }: { rating: number }) => {
    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-300 text-gray-300'}`}
                />
            ))}
            <span className="ml-2 text-sm text-muted-foreground">{rating.toFixed(1)}</span>
        </div>
    );
};


export default function ProvidersPage() {
    const [selectedTechniques, setSelectedTechniques] = useState<string[]>([]);

    const filteredProviders = useMemo(() => {
        if (selectedTechniques.length === 0) {
            return serviceProviders;
        }
        return serviceProviders.filter(provider => 
            selectedTechniques.every(tech => provider.techniques.includes(tech))
        );
    }, [selectedTechniques]);

    const handleTechniqueChange = (techniqueId: string) => {
        setSelectedTechniques(prev => 
            prev.includes(techniqueId)
                ? prev.filter(t => t !== techniqueId)
                : [...prev, techniqueId]
        );
    };

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <PublicHeader />

            <main className="flex-grow">
                <section className="py-20 md:py-24 bg-primary text-primary-foreground">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-headline font-bold">
                            Find NDT Service Providers
                        </h1>
                        <p className="mt-6 text-lg md:text-xl text-primary-foreground/80">
                            Browse our directory of leading NDT companies from around the world. Filter by technique to find the right partner for your inspection needs.
                        </p>
                        </div>
                    </div>
                </section>

                <section className="py-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                            <h2 className="text-2xl font-headline font-semibold">Service Provider Directory</h2>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline">
                                        Filter by Technique ({selectedTechniques.length})
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                    <div className="grid gap-4">
                                        <div className="space-y-2">
                                            <h4 className="font-medium leading-none">Techniques</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Select the techniques you require.
                                            </p>
                                        </div>
                                        <div className="grid gap-2 max-h-60 overflow-y-auto p-1">
                                            {NDTTechniques.map(tech => (
                                                <div key={tech.id} className="flex items-center space-x-2">
                                                     <Checkbox 
                                                        id={`tech-${tech.id}`} 
                                                        checked={selectedTechniques.includes(tech.id)}
                                                        onCheckedChange={() => handleTechniqueChange(tech.id)}
                                                     />
                                                    <Label htmlFor={`tech-${tech.id}`}>{tech.name} ({tech.id})</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                        
                         {selectedTechniques.length > 0 && (
                            <div className="mb-4 flex items-center flex-wrap gap-2">
                                <span className="text-sm font-medium">Active Filters:</span>
                                {selectedTechniques.map(techId => (
                                    <Badge key={techId} variant="secondary">
                                        {NDTTechniques.find(t => t.id === techId)?.name}
                                        <button onClick={() => handleTechniqueChange(techId)} className="ml-1.5 rounded-full hover:bg-muted-foreground/20 p-0.5">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                                <Button variant="ghost" size="sm" onClick={() => setSelectedTechniques([])}>Clear All</Button>
                            </div>
                        )}

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredProviders.map(provider => (
                                <Card key={provider.id}>
                                    <CardHeader>
                                        <div className="flex items-center gap-4">
                                            <Image 
                                                src={provider.logoUrl} 
                                                alt={`${provider.name} logo`} 
                                                width={64} 
                                                height={64} 
                                                className="rounded-md border p-1"
                                                data-ai-hint={`${provider.name} logo`}
                                            />
                                            <div>
                                                <CardTitle className="font-headline">{provider.name}</CardTitle>
                                                <CardDescription className="flex items-center gap-1.5 mt-1">
                                                    <MapPin className="w-3 h-3"/> {provider.location}
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <StarRating rating={provider.rating} />
                                        <p className="mt-4 text-sm text-muted-foreground">{provider.description}</p>
                                        <div className="mt-4">
                                            <h4 className="text-sm font-semibold mb-2">Techniques Offered</h4>
                                            <div className="flex flex-wrap gap-1.5">
                                                {provider.techniques.map(tech => (
                                                    <Badge key={tech} variant="outline">{tech}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                             {filteredProviders.length === 0 && (
                                <div className="col-span-full text-center py-10">
                                    <p className="text-muted-foreground">No service providers match the selected filters.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            <PublicFooter />
        </div>
    );
}

'use client';

import * as React from 'react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Star, MapPin, X } from 'lucide-react';
import Link from 'next/link';
import { serviceProviders, NDTTechniques, auditFirmIndustries } from '@/lib/placeholder-data';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ndtTechniques as allNdtTechniques } from '@/lib/ndt-techniques-data';

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
    const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
    
    const filteredProviders = useMemo(() => {
        return serviceProviders.filter(provider => {
            const techniqueMatch = selectedTechniques.length === 0 || selectedTechniques.every(tech => provider.techniques.includes(tech));
            const industryMatch = selectedIndustries.length === 0 || selectedIndustries.every(ind => provider.industries.includes(ind));
            return techniqueMatch && industryMatch;
        });
    }, [selectedTechniques, selectedIndustries]);
    
    const handleTechniqueChange = (techniqueId: string) => {
        setSelectedTechniques(prev =>
            prev.includes(techniqueId)
                ? prev.filter(t => t !== techniqueId)
                : [...prev, techniqueId]
        );
    };

    const handleIndustryChange = (industry: string) => {
        setSelectedIndustries(prev =>
            prev.includes(industry)
                ? prev.filter(i => i !== industry)
                : [...prev, industry]
        );
    };
    
    const clearFilters = () => {
        setSelectedTechniques([]);
        setSelectedIndustries([]);
    };
    
    const hasActiveFilters = selectedTechniques.length > 0 || selectedIndustries.length > 0;

    return (
        <TooltipProvider>
            <div className="flex flex-col min-h-screen bg-background">
                <PublicHeader />
                <main className="flex-grow">
                    <section className="py-20 md:py-32 bg-primary/10">
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="max-w-3xl mx-auto text-center">
                                <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">
                                    Find NDT Service Providers
                                </h1>
                                <p className="mt-6 text-lg md:text-xl text-muted-foreground">
                                    Browse our directory of leading NDT companies from around the world. Filter by technique to find the right partner for your inspection needs.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="py-16">
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                                <h2 className="text-2xl font-headline font-semibold">Service Provider Directory</h2>
                                <div className="flex gap-2">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline">Technique ({selectedTechniques.length})</Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80">
                                            <div className="grid gap-4">
                                                <h4 className="font-medium leading-none">Techniques</h4>
                                                <ScrollArea className="grid gap-2 max-h-60 p-1">
                                                    {NDTTechniques.map(tech => (
                                                        <div key={tech.id} className="flex items-center space-x-2 p-1">
                                                            <Checkbox
                                                                id={`tech-${tech.id}`}
                                                                checked={selectedTechniques.includes(tech.id)}
                                                                onCheckedChange={() => handleTechniqueChange(tech.id)}
                                                            />
                                                            <Label htmlFor={`tech-${tech.id}`}>{tech.name}</Label>
                                                        </div>
                                                    ))}
                                                </ScrollArea>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline">Industry ({selectedIndustries.length})</Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80">
                                            <div className="grid gap-4">
                                                <h4 className="font-medium leading-none">Industries</h4>
                                                <ScrollArea className="grid gap-2 max-h-60 p-1">
                                                    {auditFirmIndustries.map(ind => (
                                                        <div key={ind} className="flex items-center space-x-2 p-1">
                                                            <Checkbox
                                                                id={`ind-${ind.replace(/\s+/g, '-')}`}
                                                                checked={selectedIndustries.includes(ind)}
                                                                onCheckedChange={() => handleIndustryChange(ind)}
                                                            />
                                                            <Label htmlFor={`ind-${ind.replace(/\s+/g, '-')}`}>{ind}</Label>
                                                        </div>
                                                    ))}
                                                </ScrollArea>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                    <Button variant="ghost" onClick={clearFilters} disabled={!hasActiveFilters}>Clear</Button>
                                </div>
                            </div>
                            
                            {hasActiveFilters && (
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
                                    {selectedIndustries.map(ind => (
                                        <Badge key={ind} variant="outline">
                                            {ind}
                                            <button onClick={() => handleIndustryChange(ind)} className="ml-1.5 rounded-full hover:bg-muted-foreground/20 p-0.5">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {filteredProviders.map(provider => (
                                    <Card key={provider.id} className="flex flex-col">
                                        <CardHeader>
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-16 w-16">
                                                     {provider.logoUrl && <AvatarImage src={provider.logoUrl} alt={`${provider.name} logo`} />}
                                                    <AvatarFallback className="text-xl">{provider.name.split(' ').map(n => n[0]).join('').slice(0,3)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <CardTitle className="font-headline">{provider.name}</CardTitle>
                                                    <CardDescription className="flex items-center gap-1.5 mt-1">
                                                        <MapPin className="w-3 h-3"/> {provider.location}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex-grow space-y-4">
                                            <StarRating rating={provider.rating} />
                                            <p className="text-sm text-muted-foreground h-20 overflow-hidden">{provider.description}</p>
                                            <div>
                                                <h4 className="text-sm font-semibold mb-2">Techniques Offered</h4>
                                                <div className="flex flex-wrap gap-1.5 min-h-16">
                                                     {provider.techniques.map(techAcronym => {
                                                        const technique = allNdtTechniques.find(t => t.id.toUpperCase() === techAcronym);
                                                        return (
                                                            <Tooltip key={techAcronym}>
                                                                <TooltipTrigger>
                                                                    <Badge variant="secondary" shape="rounded">{techAcronym}</Badge>
                                                                </TooltipTrigger>
                                                                {technique && (
                                                                    <TooltipContent>
                                                                        <p>{technique.title}</p>
                                                                    </TooltipContent>
                                                                )}
                                                            </Tooltip>
                                                        )
                                                    })}
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
                    
                    <section className="bg-card py-20">
                      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl font-headline font-semibold text-primary">
                          Ready to Join NDT Exchange?
                        </h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                          Experience the future of asset integrity management. Start your 14-day free trial today.
                        </p>
                        <div className="mt-8">
                          <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                            <Link href="/signup">Sign Up for a Free Trial</Link>
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

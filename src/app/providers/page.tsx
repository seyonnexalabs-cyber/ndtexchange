

'use client';

import * as React from 'react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Star, MapPin, X } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Job, NDTServiceProvider, NDTTechnique, Review } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

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
    const { firestore } = useFirebase();
    const [selectedTechniques, setSelectedTechniques] = useState<string[]>([]);
    const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState('rating-desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);
    
    const providersQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'companies'), where('type', '==', 'Provider')) : null, [firestore]);
    const { data: serviceProviders, isLoading: isLoadingProviders } = useCollection<NDTServiceProvider>(providersQuery);

    const jobsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'jobs') : null, [firestore]);
    const { data: jobs, isLoading: isLoadingJobs } = useCollection<Job>(jobsQuery);

    const techniquesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'techniques') : null, [firestore]);
    const { data: ndtTechniques, isLoading: isLoadingTechniques } = useCollection<NDTTechnique>(techniquesQuery);
    
    const { data: reviews, isLoading: isLoadingReviews } = useCollection<Review>(useMemoFirebase(() => firestore ? collection(firestore, 'reviews') : null, [firestore]));

    const auditFirmIndustries = useMemo(() => {
        if (!serviceProviders) return [];
        const industries = new Set(serviceProviders.flatMap(p => p.industries || []));
        return Array.from(industries).sort();
    }, [serviceProviders]);

    const filteredProviders = useMemo(() => {
        if (!serviceProviders || !jobs || !reviews) return [];

        const providersWithStats = serviceProviders.map(provider => {
            const completedJobs = jobs.filter(job => job.providerId === provider.id && (job.status === 'Completed' || job.status === 'Paid')).length;
            const providerReviews = reviews.filter(r => r.providerId === provider.id && r.status === 'Approved');
            const avgRating = providerReviews.length > 0
                ? providerReviews.reduce((acc, r) => acc + r.rating, 0) / providerReviews.length
                : 0;

            return { ...provider, completedJobs, rating: avgRating };
        });

        let providers = providersWithStats.filter(provider => {
            const techniqueMatch = selectedTechniques.length === 0 || selectedTechniques.every(tech => provider.techniques?.includes(tech));
            const industryMatch = selectedIndustries.length === 0 || selectedIndustries.every(ind => provider.industries?.includes(ind));
            return techniqueMatch && industryMatch;
        });

        switch (sortBy) {
            case 'rating-desc': providers.sort((a, b) => b.rating - a.rating); break;
            case 'rating-asc': providers.sort((a, b) => a.rating - b.rating); break;
            case 'name-asc': providers.sort((a, b) => a.name.localeCompare(b.name)); break;
            case 'name-desc': providers.sort((a, b) => b.name.localeCompare(a.name)); break;
            default: break;
        }

        return providers;
    }, [serviceProviders, jobs, reviews, selectedTechniques, selectedIndustries, sortBy]);

    const pageCount = Math.ceil(filteredProviders.length / itemsPerPage);
    const paginatedProviders = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredProviders.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredProviders, currentPage, itemsPerPage]);
    
    const handleTechniqueChange = (techniqueId: string) => {
        setSelectedTechniques(prev => prev.includes(techniqueId) ? prev.filter(t => t !== techniqueId) : [...prev, techniqueId]);
        setCurrentPage(1);
    };

    const handleIndustryChange = (industry: string) => {
        setSelectedIndustries(prev => prev.includes(industry) ? prev.filter(i => i !== industry) : [...prev, industry]);
        setCurrentPage(1);
    };
    
    const clearFilters = () => {
        setSelectedTechniques([]);
        setSelectedIndustries([]);
        setCurrentPage(1);
    };

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1);
    };
    
    const hasActiveFilters = selectedTechniques.length > 0 || selectedIndustries.length > 0;
    const isLoading = isLoadingProviders || isLoadingJobs || isLoadingTechniques || isLoadingReviews;

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
                                <h2 className="text-2xl font-headline font-semibold">Service Provider Directory ({filteredProviders.length})</h2>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Popover>
                                        <PopoverTrigger asChild><Button variant="outline" disabled={isLoading}>Technique ({selectedTechniques.length})</Button></PopoverTrigger>
                                        <PopoverContent className="w-80">
                                            <div className="grid gap-4">
                                                <h4 className="font-medium leading-none">Techniques</h4>
                                                <ScrollArea className="grid gap-2 max-h-60 p-1">
                                                    {ndtTechniques?.map(tech => (
                                                        <div key={tech.id} className="flex items-center space-x-2 p-1">
                                                            <Checkbox id={`tech-${tech.id}`} checked={selectedTechniques.includes(tech.acronym)} onCheckedChange={() => handleTechniqueChange(tech.acronym)} />
                                                            <Label htmlFor={`tech-${tech.id}`}>{tech.title}</Label>
                                                        </div>
                                                    ))}
                                                </ScrollArea>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                    <Popover>
                                        <PopoverTrigger asChild><Button variant="outline" disabled={isLoading}>Industry ({selectedIndustries.length})</Button></PopoverTrigger>
                                        <PopoverContent className="w-80">
                                            <div className="grid gap-4">
                                                <h4 className="font-medium leading-none">Industries</h4>
                                                <ScrollArea className="grid gap-2 max-h-60 p-1">
                                                    {auditFirmIndustries.map(ind => (
                                                        <div key={ind} className="flex items-center space-x-2 p-1">
                                                            <Checkbox id={`ind-${ind.replace(/\s+/g, '-')}`} checked={selectedIndustries.includes(ind)} onCheckedChange={() => handleIndustryChange(ind)} />
                                                            <Label htmlFor={`ind-${ind.replace(/\s+/g, '-')}`}>{ind}</Label>
                                                        </div>
                                                    ))}
                                                </ScrollArea>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                    <Select value={sortBy} onValueChange={setSortBy} disabled={isLoading}>
                                        <SelectTrigger className="w-full sm:w-[180px]">
                                            <SelectValue placeholder="Sort by" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="rating-desc">Rating: High to Low</SelectItem>
                                            <SelectItem value="rating-asc">Rating: Low to High</SelectItem>
                                            <SelectItem value="name-asc">Name: A-Z</SelectItem>
                                            <SelectItem value="name-desc">Name: Z-A</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button variant="ghost" onClick={clearFilters} disabled={!hasActiveFilters}>Clear</Button>
                                     <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">Per Page:</span>
                                        <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange} disabled={isLoading}>
                                            <SelectTrigger className="w-[75px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="25">25</SelectItem>
                                                <SelectItem value="50">50</SelectItem>
                                                <SelectItem value="100">100</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            
                            {hasActiveFilters && (
                                <div className="mb-4 flex items-center flex-wrap gap-2">
                                    <span className="text-sm font-medium">Active Filters:</span>
                                    {selectedTechniques.map(techId => (
                                        <Badge key={techId} variant="secondary">
                                            {ndtTechniques?.find(t => t.acronym === techId)?.title}
                                            <button onClick={() => handleTechniqueChange(techId)} className="ml-1.5 rounded-full hover:bg-muted-foreground/20 p-0.5"><X className="h-3 w-3" /></button>
                                        </Badge>
                                    ))}
                                    {selectedIndustries.map(ind => (
                                        <Badge key={ind} variant="outline">
                                            {ind}
                                            <button onClick={() => handleIndustryChange(ind)} className="ml-1.5 rounded-full hover:bg-muted-foreground/20 p-0.5"><X className="h-3 w-3" /></button>
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            {isLoading ? (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {[...Array(6)].map((_, i) => (
                                    <Card key={i}>
                                        <CardHeader>
                                            <div className="flex items-center gap-4">
                                                <Skeleton className="h-16 w-16 rounded-full" />
                                                <div className="space-y-2">
                                                    <Skeleton className="h-4 w-[150px]" />
                                                    <Skeleton className="h-4 w-[100px]" />
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <Skeleton className="h-6 w-1/2" />
                                            <Skeleton className="h-10 w-full" />
                                            <Skeleton className="h-10 w-full" />
                                        </CardContent>
                                    </Card>
                                ))}
                                </div>
                            ) : (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {paginatedProviders.map(provider => (
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
                                                <div className="flex justify-between items-center">
                                                    <StarRating rating={provider.rating} />
                                                    <div className="text-right">
                                                        <p className="font-bold text-lg">{provider.completedJobs}</p>
                                                        <p className="text-xs text-muted-foreground -mt-1">Jobs Completed</p>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-muted-foreground h-20 overflow-hidden">{provider.description}</p>
                                                <div>
                                                    <h4 className="text-sm font-semibold mb-2">Techniques Offered</h4>
                                                    <div className="flex flex-wrap gap-1.5 min-h-16">
                                                        {provider.techniques?.map(techAcronym => {
                                                            const technique = ndtTechniques?.find(t => t.acronym === techAcronym);
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
                                                <div>
                                                    <h4 className="text-sm font-semibold mb-2">Industry Focus</h4>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {provider.industries?.map(ind => (
                                                            <Badge key={ind} variant="outline" shape="rounded">{ind}</Badge>
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
                            )}

                             {pageCount > 1 && (
                                <div className="mt-12 flex justify-center">
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    href="#"
                                                    onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)); }}
                                                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : undefined}
                                                />
                                            </PaginationItem>
                                            <PaginationItem>
                                                <span className="p-2 text-sm font-medium">Page {currentPage} of {pageCount}</span>
                                            </PaginationItem>
                                            <PaginationItem>
                                                <PaginationNext
                                                    href="#"
                                                    onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(pageCount, p + 1)); }}
                                                    className={currentPage === pageCount ? 'pointer-events-none opacity-50' : undefined}
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            )}
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
    
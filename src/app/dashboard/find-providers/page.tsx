'use client';

import * as React from 'react';
import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Star, MapPin, X, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { serviceProviders, NDTTechniques, auditFirmIndustries, jobs } from '@/lib/placeholder-data';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useSearchParams, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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


export default function FindProvidersPage() {
    const [selectedTechniques, setSelectedTechniques] = useState<string[]>([]);
    const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState('rating-desc');
    const searchParams = useSearchParams();
    const router = useRouter();
    const role = searchParams.get('role');

    useEffect(() => {
        if (role && !['client', 'admin'].includes(role)) {
            router.replace(`/dashboard?${searchParams.toString()}`);
        }
    }, [role, router, searchParams]);

    const filteredProviders = useMemo(() => {
        let providers = serviceProviders.map(provider => {
            const completedJobs = jobs.filter(job => job.providerId === provider.id && (job.status === 'Completed' || job.status === 'Paid')).length;
            return { ...provider, completedJobs };
        });

        providers = providers.filter(provider => {
            const techniqueMatch = selectedTechniques.length === 0 || selectedTechniques.every(tech => provider.techniques.includes(tech));
            const industryMatch = selectedIndustries.length === 0 || selectedIndustries.every(i => provider.industries.includes(i));
            return techniqueMatch && industryMatch;
        });
        
        switch (sortBy) {
            case 'rating-desc':
                providers.sort((a, b) => b.rating - a.rating);
                break;
            case 'rating-asc':
                providers.sort((a, b) => a.rating - b.rating);
                break;
            case 'name-asc':
                providers.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                 providers.sort((a, b) => b.name.localeCompare(a.name));
                break;
            default:
                break;
        }

        return providers;
    }, [selectedTechniques, selectedIndustries, sortBy]);

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
                ? prev.filter(t => t !== industry)
                : [...prev, industry]
        );
    };
    
    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const clearFilters = () => {
        setSelectedTechniques([]);
        setSelectedIndustries([]);
    };

    const hasActiveFilters = selectedTechniques.length > 0 || selectedIndustries.length > 0;

    if (role && !['client', 'admin'].includes(role)) {
        return null;
    }

    return (
        <TooltipProvider>
            <div>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                        <ShieldCheck className="text-primary" />
                        Find Service Providers
                    </h1>
                    <div className="flex gap-2">
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
                                    <ScrollArea className="grid gap-2 max-h-60 p-1">
                                        {NDTTechniques.map(tech => (
                                            <div key={tech.id} className="flex items-center space-x-2 p-1">
                                                <Checkbox 
                                                    id={`tech-${tech.id}`} 
                                                    checked={selectedTechniques.includes(tech.id)}
                                                    onCheckedChange={() => handleTechniqueChange(tech.id)}
                                                />
                                                <Label htmlFor={`tech-${tech.id}`}>{tech.name} ({tech.id})</Label>
                                            </div>
                                        ))}
                                    </ScrollArea>
                                </div>
                            </PopoverContent>
                        </Popover>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline">
                                    Filter by Industry ({selectedIndustries.length})
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <h4 className="font-medium leading-none">Industries</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Select the industries you operate in.
                                        </p>
                                    </div>
                                    <ScrollArea className="grid gap-2 max-h-60 p-1">
                                        {auditFirmIndustries.map(spec => (
                                            <div key={spec} className="flex items-center space-x-2 p-1">
                                                <Checkbox 
                                                    id={`ind-${spec.replace(/\s+/g, '-')}`} 
                                                    checked={selectedIndustries.includes(spec)}
                                                    onCheckedChange={() => handleIndustryChange(spec)}
                                                />
                                                <Label htmlFor={`ind-${spec.replace(/\s+/g, '-')}`}>{spec}</Label>
                                            </div>
                                        ))}
                                    </ScrollArea>
                                </div>
                            </PopoverContent>
                        </Popover>
                        <Select value={sortBy} onValueChange={setSortBy}>
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
                    </div>
                </div>
                
                {hasActiveFilters && (
                    <div className="mb-4 flex items-center flex-wrap gap-2">
                        <span className="text-sm font-medium">Active Filters:</span>
                        {selectedTechniques.map(techId => (
                            <Badge key={techId} variant="secondary">
                                {NDTTechniques.find(t => t.id === techId)?.name}
                                <button onClick={() => handleTechniqueChange(techId)} className="ml-1.5 rounded-full hover:bg-muted-foreground/20 p-0.5">
                                    <X className="h-3 w-3 text-primary" />
                                </button>
                            </Badge>
                        ))}
                        {selectedIndustries.map(spec => (
                            <Badge key={spec} variant="outline">
                                {spec}
                                <button onClick={() => handleIndustryChange(spec)} className="ml-1.5 rounded-full hover:bg-muted-foreground/20 p-0.5">
                                    <X className="h-3 w-3 text-primary" />
                                </button>
                            </Badge>
                        ))}
                        <Button variant="ghost" size="sm" onClick={clearFilters}>Clear All</Button>
                    </div>
                )}

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredProviders.map(provider => (
                        <Card key={provider.id} className="flex flex-col">
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarFallback className="text-xl">{provider.name.split(' ').map(n => n[0]).join('').slice(0,3)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="font-headline">{provider.name}</CardTitle>
                                        <CardDescription className="flex items-center gap-1.5 mt-1">
                                            <MapPin className="w-3 h-3 text-primary"/> {provider.location}
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
                                    <div className="flex flex-wrap gap-1.5 min-h-[50px]">
                                        {provider.techniques.map(techAcronym => {
                                            const technique = allNdtTechniques.find(t => t.id.toUpperCase() === techAcronym);
                                            return (
                                                <Tooltip key={techAcronym}>
                                                    <TooltipTrigger>
                                                        <Badge variant="secondary" shape="rounded">{techAcronym}</Badge>
                                                    </TooltipTrigger>
                                                    {technique && (
                                                        <TooltipContent className="max-w-xs">
                                                            <p className="font-bold">{technique.title}</p>
                                                            <p>{technique.description}</p>
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
                                        {provider.industries.map(tech => (
                                            <Badge key={tech} variant="outline" shape="rounded">{tech}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full">
                                    <Link href={constructUrl(`/dashboard/providers/${provider.id}`)}>
                                        View Profile
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                    {filteredProviders.length === 0 && (
                        <div className="col-span-full text-center py-10">
                            <p className="text-muted-foreground">No service providers match the selected filters.</p>
                        </div>
                    )}
                </div>
            </div>
        </TooltipProvider>
    );
}


'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Link as LinkIcon, Building, X } from 'lucide-react';
import Link from 'next/link';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Manufacturer, NDTTechnique } from '@/lib/types';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import HoneycombHero from '@/components/ui/honeycomb-hero';


export default function ManufacturersPage() {
    const { firestore } = useFirebase();
    const [selectedTechniques, setSelectedTechniques] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);

    const manufacturersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'manufacturers') : null, [firestore]);
    const { data: manufacturers, isLoading: isLoadingManufacturers } = useCollection<Manufacturer>(manufacturersQuery);
    
    const techniquesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'techniques') : null, [firestore]);
    const { data: ndtTechniques, isLoading: isLoadingTechniques } = useCollection<NDTTechnique>(techniquesQuery);

    const filteredManufacturers = useMemo(() => {
        if (!manufacturers) return [];
        return manufacturers.filter(manufacturer => {
            const techniqueMatch = selectedTechniques.length === 0 || selectedTechniques.every(tech => manufacturer.techniqueIds.includes(tech));
            const searchMatch = !searchTerm || manufacturer.name.toLowerCase().includes(searchTerm.toLowerCase());
            return techniqueMatch && searchMatch;
        });
    }, [manufacturers, selectedTechniques, searchTerm]);
    
    const pageCount = Math.ceil(filteredManufacturers.length / itemsPerPage);
    const paginatedManufacturers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredManufacturers.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredManufacturers, currentPage, itemsPerPage]);

    const handleTechniqueChange = (techniqueId: string) => {
        setSelectedTechniques(prev =>
            prev.includes(techniqueId)
                ? prev.filter(t => t !== techniqueId)
                : [...prev, techniqueId]
        );
        setCurrentPage(1);
    };
    
    const clearFilters = () => {
        setSelectedTechniques([]);
        setSearchTerm('');
        setCurrentPage(1);
    };

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1);
    };
    
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
                            Browse a curated directory of Original Equipment Manufacturers (OEMs). Filter by technique to find the right technology partner.
                        </p>
                    </div>
                </HoneycombHero>
                
                <section className="py-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                            <Input 
                                placeholder="Search by manufacturer name..."
                                className="max-w-xs"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                disabled={isLoading}
                            />
                             <div className="flex flex-wrap items-center gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" disabled={isLoading}>Filter by Technique ({selectedTechniques.length})</Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80">
                                        <div className="grid gap-4">
                                            <div className="space-y-2">
                                                <h4 className="font-medium leading-none">Techniques</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Select the techniques you're interested in.
                                                </p>
                                            </div>
                                            <ScrollArea className="grid gap-2 max-h-60 p-1">
                                                {ndtTechniques?.map(tech => (
                                                    <div key={tech.id} className="flex items-center space-x-2 p-1">
                                                        <Checkbox
                                                            id={`tech-${tech.id}`}
                                                            checked={selectedTechniques.includes(tech.acronym)}
                                                            onCheckedChange={() => handleTechniqueChange(tech.acronym)}
                                                        />
                                                        <Label htmlFor={`tech-${tech.id}`}>{tech.title}</Label>
                                                    </div>
                                                ))}
                                            </ScrollArea>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                <Button variant="ghost" onClick={clearFilters} disabled={selectedTechniques.length === 0 && searchTerm === ''}>Clear</Button>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Per Page:</span>
                                    <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
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

                         {selectedTechniques.length > 0 && (
                            <div className="mb-4 flex items-center flex-wrap gap-2">
                                <span className="text-sm font-medium">Active Filters:</span>
                                {selectedTechniques.map(techId => (
                                    <Badge key={techId} variant="secondary">
                                        {ndtTechniques?.find(t => t.acronym === techId)?.title || techId}
                                        <button onClick={() => handleTechniqueChange(techId)} className="ml-1.5 rounded-full hover:bg-muted-foreground/20 p-0.5">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                        
                         {isLoading ? (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {[...Array(8)].map((_, i) => (
                                    <Card key={i}>
                                        <CardHeader>
                                            <Skeleton className="h-16 w-16 rounded-full" />
                                        </CardHeader>
                                        <CardContent>
                                            <Skeleton className="h-4 w-3/4 mb-2" />
                                            <Skeleton className="h-10 w-full" />
                                        </CardContent>
                                        <CardFooter>
                                            <Skeleton className="h-10 w-full" />
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {paginatedManufacturers.map(manufacturer => {
                                    return (
                                        <Card key={manufacturer.name} className="flex flex-col">
                                            <CardHeader>
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-16 w-16">
                                                        {manufacturer.logoUrl && <AvatarImage src={manufacturer.logoUrl} alt={manufacturer.name} />}
                                                        <AvatarFallback className="text-xl">{manufacturer.name.split(' ').map(n => n[0]).join('').slice(0,3)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <CardTitle className="font-headline">{manufacturer.name}</CardTitle>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="flex-grow">
                                                <p className="text-sm text-muted-foreground line-clamp-2 h-10 mb-4">{manufacturer.description}</p>
                                                <h4 className="text-sm font-semibold mb-2">Specialized Techniques</h4>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {manufacturer.techniqueIds.map(tech => (
                                                        <Badge key={tech} variant="secondary">{tech}</Badge>
                                                    ))}
                                                </div>
                                            </CardContent>
                                            <CardFooter>
                                                <Button variant="outline" asChild className="w-full">
                                                    <Link href={manufacturer.url} target="_blank" rel="noopener noreferrer">
                                                        Visit Website
                                                        <LinkIcon className="ml-2 h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    )
                                })}
                            </div>
                        )}
                        
                        {!isLoading && filteredManufacturers.length === 0 && (
                            <div className="col-span-full text-center py-20">
                                <p className="text-xl font-semibold">No Manufacturers Found</p>
                                <p className="text-muted-foreground mt-2">Try adjusting your search or filters.</p>
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
            </main>
            <PublicFooter />
        </div>
    );
}
  

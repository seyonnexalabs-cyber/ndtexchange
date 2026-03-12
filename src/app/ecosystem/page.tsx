
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import { useMemo, useState } from 'react';
import type { Manufacturer, NDTTechnique, Product, NDTServiceProvider, AuditFirm, Client, Review } from '@/lib/types';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import HoneycombHero from '@/components/ui/honeycomb-hero';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wrench, Handshake, Star, MapPin, Filter, X, Eye, HardHat, Factory, Check, Search as SearchIcon, Award } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";


const StarRating = ({ rating, reviewCount }: { rating: number, reviewCount?: number }) => {
    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-300 text-gray-300'}`}
                    />
                ))}
            </div>
            {reviewCount !== undefined && <span className="text-sm text-muted-foreground">({reviewCount} reviews)</span>}
        </div>
    );
};

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

const PaginationControls = ({ currentPage, pageCount, onPageChange, itemsPerPage, onItemsPerPageChange, totalItems }: { 
    currentPage: number, 
    pageCount: number, 
    onPageChange: (page: number) => void,
    itemsPerPage: number,
    onItemsPerPageChange: (value: string) => void,
    totalItems: number,
}) => {
    if (!(pageCount > 1 || totalItems > 0)) return null;
    return (
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} - {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">Items per page</p>
                    <Select value={`${itemsPerPage}`} onValueChange={onItemsPerPageChange}>
                        <SelectTrigger className="h-9 w-[70px]">
                            <SelectValue placeholder={itemsPerPage} />
                        </SelectTrigger>
                        <SelectContent>
                            {[25, 50, 100].map((pageSize) => (
                                <SelectItem key={pageSize} value={`${pageSize}`}>
                                {pageSize}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {pageCount > 1 && (
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onPageChange(Math.max(currentPage - 1, 1));
                                    }}
                                    className={cn(currentPage === 1 && "pointer-events-none opacity-50")}
                                />
                            </PaginationItem>
                            <PaginationItem>
                                <span className="text-sm font-medium p-2">Page {currentPage} of {pageCount}</span>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationNext
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onPageChange(Math.min(currentPage + 1, pageCount));
                                    }}
                                    className={cn(currentPage === pageCount && "pointer-events-none opacity-50")}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
            </div>
        </div>
    );
};


export default function EcosystemPage() {
    const searchParams = useSearchParams();
    const defaultTab = searchParams.get('tab') || 'products';
    const { firestore } = useFirebase();

    // Items per page state
    const [itemsPerPage, setItemsPerPage] = useState(25);

    // Provider States
    const [selectedProviderTechniques, setSelectedProviderTechniques] = useState<string[]>([]);
    const [selectedProviderIndustries, setSelectedProviderIndustries] = useState<string[]>([]);
    const [providerSortBy, setProviderSortBy] = useState('rating-desc');
    const [providerSearch, setProviderSearch] = useState('');
    const [providerPage, setProviderPage] = useState(1);
    
    // Auditor States
    const [selectedAuditorServices, setSelectedAuditorServices] = useState<string[]>([]);
    const [selectedAuditorIndustries, setSelectedAuditorIndustries] = useState<string[]>([]);
    const [auditorSearch, setAuditorSearch] = useState('');
    const [auditorPage, setAuditorPage] = useState(1);
    
    // Manufacturer States
    const [selectedManufacturerTechniques, setSelectedManufacturerTechniques] = useState<string[]>([]);
    const [manufacturerSearch, setManufacturerSearch] = useState('');
    const [manufacturerPage, setManufacturerPage] = useState(1);

    // Product States
    const [selectedProductTechniques, setSelectedProductTechniques] = useState<string[]>([]);
    const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([]);
    const [selectedProductManufacturers, setSelectedProductManufacturers] = useState<string[]>([]);
    const [productSearch, setProductSearch] = useState('');
    const [productPage, setProductPage] = useState(1);


    const companiesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'companies') : null, [firestore]);
    const { data: companies, isLoading: isLoadingCompanies } = useCollection<NDTServiceProvider | AuditFirm | Client>(companiesQuery);

    const techniquesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'techniques') : null, [firestore]);
    const { data: ndtTechniques, isLoading: isLoadingTechniques } = useCollection<NDTTechnique>(techniquesQuery);
    
    const manufacturersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'manufacturers') : null, [firestore]);
    const { data: manufacturers, isLoading: isLoadingManufacturers } = useCollection<Manufacturer>(manufacturersQuery);
    
    const productsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'products')) : null, [firestore]);
    const { data: productsData, isLoading: isLoadingProducts } = useCollection<Product>(productsQuery);

    const { data: reviews, isLoading: isLoadingReviews } = useCollection<Review>(useMemoFirebase(() => firestore ? query(collection(firestore, 'reviews'), where('status', '==', 'Approved')) : null, [firestore]));

    const handleItemsPerPageChange = (value: string) => {
        const newSize = Number(value);
        setItemsPerPage(newSize);
        setProviderPage(1);
        setAuditorPage(1);
        setManufacturerPage(1);
        setProductPage(1);
    };

    // --- PROVIDER LOGIC ---
    const { serviceProviders, providerTechniqueOptions, providerIndustryOptions } = useMemo(() => {
        if (!companies || !reviews) return { serviceProviders: [], providerTechniqueOptions: [], providerIndustryOptions: [] };
        const providers = companies.filter(c => c.type === 'Provider' && c.name !== 'NDT EXCHANGE') as NDTServiceProvider[];
        const techniques = new Set(providers.flatMap(p => p.techniques || []));
        const industries = new Set(providers.flatMap(p => p.industries || []));
        
        const providersWithStats = providers.map(provider => {
            const providerReviews = reviews.filter(r => r.providerId === provider.id);
            const avgRating = providerReviews.length > 0
                ? providerReviews.reduce((acc, r) => acc + r.rating, 0) / providerReviews.length
                : 0;
            return { ...provider, rating: avgRating };
        });

        return { 
            serviceProviders: providersWithStats, 
            providerTechniqueOptions: Array.from(techniques).sort(), 
            providerIndustryOptions: Array.from(industries).sort() 
        };
    }, [companies, reviews]);

     const filteredProviders = useMemo(() => {
        let providers = serviceProviders.filter(provider => {
            const techniqueMatch = selectedProviderTechniques.length === 0 || selectedProviderTechniques.every(tech => (provider.techniques || []).includes(tech));
            const industryMatch = selectedProviderIndustries.length === 0 || selectedProviderIndustries.every(ind => (provider.industries || []).includes(ind));
            const searchMatch = providerSearch === '' || 
                                provider.name.toLowerCase().includes(providerSearch.toLowerCase()) ||
                                (provider.description && provider.description.toLowerCase().includes(providerSearch.toLowerCase()));
            return techniqueMatch && industryMatch && searchMatch;
        });
        
        switch (providerSortBy) {
            case 'rating-desc': providers.sort((a, b) => b.rating - a.rating); break;
            case 'rating-asc': providers.sort((a, b) => a.rating - b.rating); break;
            case 'name-asc': providers.sort((a, b) => a.name.localeCompare(b.name)); break;
            case 'name-desc': providers.sort((a, b) => b.name.localeCompare(a.name)); break;
        }

        return providers;
    }, [serviceProviders, selectedProviderTechniques, selectedProviderIndustries, providerSortBy, providerSearch]);

    const providerPageCount = Math.ceil(filteredProviders.length / itemsPerPage);
    const paginatedProviders = useMemo(() => {
        const startIndex = (providerPage - 1) * itemsPerPage;
        return filteredProviders.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredProviders, providerPage, itemsPerPage]);

    // --- AUDITOR LOGIC ---
    const { auditorFirms, auditorServiceOptions, auditorIndustryOptions } = useMemo(() => {
        if (!companies) return { auditorFirms: [], auditorServiceOptions: [], auditorIndustryOptions: [] };
        const auditors = companies.filter(c => c.type === 'Auditor') as AuditFirm[];
        const services = new Set(auditors.flatMap(f => f.services || []));
        const industries = new Set(auditors.flatMap(f => f.industries || []));
        return { 
            auditorFirms: auditors, 
            auditorServiceOptions: Array.from(services).sort(), 
            auditorIndustryOptions: Array.from(industries).sort() 
        };
    }, [companies]);

    const filteredAuditors = useMemo(() => {
        return auditorFirms.filter(firm => {
            const serviceMatch = selectedAuditorServices.length === 0 || selectedAuditorServices.every(s => (firm.services || []).includes(s));
            const industryMatch = selectedAuditorIndustries.length === 0 || selectedAuditorIndustries.every(i => (firm.industries || []).includes(i));
            const searchMatch = auditorSearch === '' ||
                                firm.name.toLowerCase().includes(auditorSearch.toLowerCase()) ||
                                (firm.description && firm.description.toLowerCase().includes(auditorSearch.toLowerCase()));
            return serviceMatch && industryMatch && searchMatch;
        });
    }, [auditorFirms, selectedAuditorServices, selectedAuditorIndustries, auditorSearch]);
    
    const auditorPageCount = Math.ceil(filteredAuditors.length / itemsPerPage);
    const paginatedAuditors = useMemo(() => {
        const startIndex = (auditorPage - 1) * itemsPerPage;
        return filteredAuditors.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredAuditors, auditorPage, itemsPerPage]);

    // --- MANUFACTURER LOGIC ---
    const manufacturerTechniqueOptions = useMemo(() => {
        if (!manufacturers) return [];
        const techniques = new Set(manufacturers.flatMap(m => m.techniqueIds || []));
        return Array.from(techniques).sort();
    }, [manufacturers]);

     const filteredManufacturers = useMemo(() => {
        if (!manufacturers) return [];
        return manufacturers.filter(m => {
            const searchMatch = manufacturerSearch === '' || m.name.toLowerCase().includes(manufacturerSearch.toLowerCase());
            const techMatch = selectedManufacturerTechniques.length === 0 || selectedManufacturerTechniques.some(tech => (m.techniqueIds || []).includes(tech));
            return searchMatch && techMatch;
        });
    }, [manufacturers, selectedManufacturerTechniques, manufacturerSearch]);

    const manufacturerPageCount = Math.ceil(filteredManufacturers.length / itemsPerPage);
    const paginatedManufacturers = useMemo(() => {
        const startIndex = (manufacturerPage - 1) * itemsPerPage;
        return filteredManufacturers.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredManufacturers, manufacturerPage, itemsPerPage]);
    
    // --- PRODUCT LOGIC ---
    const { products, productTechniqueOptions, productTypeOptions, productManufacturerOptions } = useMemo(() => {
        if (!productsData || !reviews) return { products: [], productTechniqueOptions: [], productTypeOptions: [], productManufacturerOptions: [] };
        
        const productsWithStats = productsData.map(product => {
            const productReviews = reviews.filter(r => r.productId === product.id);
            const avgRating = productReviews.length > 0
                ? productReviews.reduce((acc, r) => acc + r.rating, 0) / productReviews.length
                : 0;
            return { ...product, rating: avgRating, reviewCount: productReviews.length };
        });

        const techniques = new Set(productsWithStats.flatMap(p => p.techniques || []));
        const types = new Set(productsWithStats.map(p => p.type));
        const manus = new Set(productsWithStats.map(p => p.manufacturerName));
        
        return { 
            products: productsWithStats,
            productTechniqueOptions: Array.from(techniques).sort(), 
            productTypeOptions: Array.from(types).sort(),
            productManufacturerOptions: Array.from(manus).sort(),
        };
    }, [productsData, reviews]);

     const filteredProducts = useMemo(() => {
        if (!products) return [];
        return products.filter(p => {
             const searchMatch = productSearch === '' || 
                p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
                p.manufacturerName.toLowerCase().includes(productSearch.toLowerCase());
            const techMatch = selectedProductTechniques.length === 0 || selectedProductTechniques.every(tech => (p.techniques || []).includes(tech));
            const typeMatch = selectedProductTypes.length === 0 || selectedProductTypes.includes(p.type);
            const manuMatch = selectedProductManufacturers.length === 0 || selectedProductManufacturers.includes(p.manufacturerName);
            return searchMatch && techMatch && manuMatch && typeMatch;
        });
    }, [products, productSearch, selectedProductTechniques, selectedProductTypes, selectedProductManufacturers]);

    const productPageCount = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = useMemo(() => {
        const startIndex = (productPage - 1) * itemsPerPage;
        return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredProducts, productPage, itemsPerPage]);

    const sortedNdtTechniques = useMemo(() => {
        if (!ndtTechniques) return [];
        return [...ndtTechniques].sort((a,b) => a.title.localeCompare(b.title));
    }, [ndtTechniques]);

    const isLoading = isLoadingCompanies || isLoadingTechniques || isLoadingManufacturers || isLoadingProducts || isLoadingReviews;

    return (
        <TooltipProvider>
            <div className="flex flex-col min-h-screen bg-background">
                <PublicHeader />
                <main className="flex-grow">
                    <HoneycombHero>
                        <div className="max-w-3xl mx-auto text-center">
                            <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary-foreground">
                                NDT Industry Ecosystem
                            </h1>
                            <p className="mt-6 text-lg md:text-xl text-primary-foreground/80">
                                Explore a curated directory of service providers, auditors, manufacturers, and products, all in one place.
                            </p>
                        </div>
                    </HoneycombHero>
                    
                    <Tabs defaultValue={defaultTab} className="py-16">
                        <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-2 md:grid-cols-4 h-auto">
                            <TabsTrigger value="products" className="gap-2 py-3"><Wrench /> Products</TabsTrigger>
                            <TabsTrigger value="providers" className="gap-2 py-3"><HardHat /> Providers</TabsTrigger>
                            <TabsTrigger value="auditors" className="gap-2 py-3"><Eye /> Auditors</TabsTrigger>
                            <TabsTrigger value="manufacturers" className="gap-2 py-3"><Factory /> Manufacturers</TabsTrigger>
                        </TabsList>
                        
                        {/* PRODUCTS TAB */}
                        <TabsContent value="products" className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-center mb-8">
                                <div className="relative lg:col-span-2">
                                     <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                     <Input 
                                        placeholder="Search products..."
                                        className="pl-10 w-full"
                                        value={productSearch}
                                        onChange={(e) => { setProductSearch(e.target.value); setProductPage(1); }}
                                    />
                                </div>
                                <div className="flex gap-2 lg:col-span-2 justify-start lg:justify-end">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" disabled={isLoading}>Type ({selectedProductTypes.length})</Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80">
                                            <Command>
                                                <CommandInput placeholder="Filter types..." />
                                                <CommandList><CommandEmpty>No results.</CommandEmpty><CommandGroup>
                                                {productTypeOptions.map(type => (
                                                    <CommandItem key={type} onSelect={() => {
                                                        setSelectedProductTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
                                                        setProductPage(1);
                                                    }}>
                                                        <Check className={cn("mr-2 h-4 w-4", selectedProductTypes.includes(type) ? "opacity-100" : "opacity-0")} />
                                                        {type}
                                                    </CommandItem>
                                                ))}
                                                </CommandGroup></CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" disabled={isLoading}>Techniques ({selectedProductTechniques.length})</Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80">
                                            <Command>
                                                <CommandInput placeholder="Filter techniques..." />
                                                <CommandList><CommandEmpty>No results.</CommandEmpty><CommandGroup>
                                                {productTechniqueOptions.map(tech => (
                                                    <CommandItem key={tech} onSelect={() => {
                                                        setSelectedProductTechniques(prev => prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]);
                                                        setProductPage(1);
                                                    }}>
                                                        <Check className={cn("mr-2 h-4 w-4", selectedProductTechniques.includes(tech) ? "opacity-100" : "opacity-0")} />
                                                        {ndtTechniques?.find(t => t.acronym === tech)?.title || tech}
                                                    </CommandItem>
                                                ))}
                                                </CommandGroup></CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" disabled={isLoading}>Manufacturers ({selectedProductManufacturers.length})</Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80">
                                            <Command>
                                                <CommandInput placeholder="Filter manufacturers..." />
                                                <CommandList><CommandEmpty>No results.</CommandEmpty><CommandGroup>
                                                {productManufacturerOptions.map(manu => (
                                                    <CommandItem key={manu} onSelect={() => {
                                                        setSelectedProductManufacturers(prev => prev.includes(manu) ? prev.filter(m => m !== manu) : [...prev, manu]);
                                                        setProductPage(1);
                                                    }}>
                                                        <Check className={cn("mr-2 h-4 w-4", selectedProductManufacturers.includes(manu) ? "opacity-100" : "opacity-0")} />
                                                        {manu}
                                                    </CommandItem>
                                                ))}
                                                </CommandGroup></CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {isLoading ? [...Array(8)].map((_, i) => <Skeleton key={i} className="h-96 w-full" />) : paginatedProducts.map(product => (
                                    <Card key={product.id} className="flex flex-col group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                                        <Link href={`/directory/products/${product.id}`} className="flex flex-col flex-grow">
                                            <div className="relative">
                                                {product.isAwardWinning && (
                                                    <div className="absolute top-3 right-3 z-10 bg-amber-400 text-white p-1.5 rounded-full shadow-lg" title="Award-Winning Product">
                                                        <Award className="h-5 w-5" />
                                                    </div>
                                                )}
                                                <div className="relative aspect-[4/3] bg-muted overflow-hidden rounded-t-lg">
                                                    {product.imageUrls && product.imageUrls.length > 0 ? (
                                                        <Image src={product.imageUrls[0]} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full">
                                                            <Wrench className="w-12 h-12 text-muted-foreground/30" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <CardContent className="p-4 flex-grow">
                                                <CardDescription>{product.manufacturerName}</CardDescription>
                                                <CardTitle className="text-base font-semibold leading-tight mt-1 group-hover:text-primary">{product.name}</CardTitle>
                                                <div className="mt-2">
                                                    <StarRating rating={product.rating} reviewCount={product.reviewCount} />
                                                </div>
                                            </CardContent>
                                        </Link>
                                    </Card>
                                ))}
                            </div>
                             <PaginationControls currentPage={productPage} pageCount={productPageCount} onPageChange={setProductPage} itemsPerPage={itemsPerPage} onItemsPerPageChange={handleItemsPerPageChange} totalItems={filteredProducts.length}/>
                        </TabsContent>

                        {/* PROVIDERS TAB */}
                        <TabsContent value="providers" className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-center mb-8">
                                <div className="relative lg:col-span-1">
                                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input 
                                        placeholder="Search providers by name or description..."
                                        className="pl-10 w-full"
                                        value={providerSearch}
                                        onChange={(e) => { setProviderSearch(e.target.value); setProviderPage(1); }}
                                    />
                                </div>
                                <div className="flex gap-2 lg:col-span-2 justify-start lg:justify-end">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" disabled={isLoading}>Techniques ({selectedProviderTechniques.length})</Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80">
                                            <Command>
                                                <CommandInput placeholder="Filter by technique..." />
                                                <CommandList><CommandEmpty>No results found.</CommandEmpty><CommandGroup>
                                                    {providerTechniqueOptions.map(tech => (
                                                        <CommandItem key={tech} onSelect={() => {
                                                            setSelectedProviderTechniques(prev => prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]);
                                                            setProviderPage(1);
                                                        }}>
                                                            <Check className={cn("mr-2 h-4 w-4", selectedProviderTechniques.includes(tech) ? "opacity-100" : "opacity-0")} />
                                                            {ndtTechniques?.find(t => t.acronym === tech)?.title || tech}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup></CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <Popover>
                                        <PopoverTrigger asChild><Button variant="outline" disabled={isLoading}>Industries ({selectedProviderIndustries.length})</Button></PopoverTrigger>
                                        <PopoverContent className="w-80">
                                             <Command>
                                                <CommandInput placeholder="Filter by industry..." />
                                                <CommandList><CommandEmpty>No results found.</CommandEmpty><CommandGroup>
                                                {providerIndustryOptions.map(ind => (
                                                    <CommandItem key={ind} onSelect={() => {
                                                        setSelectedProviderIndustries(prev => prev.includes(ind) ? prev.filter(i => i !== ind) : [...prev, ind]);
                                                        setProviderPage(1);
                                                    }}>
                                                        <Check className={cn("mr-2 h-4 w-4", selectedProviderIndustries.includes(ind) ? "opacity-100" : "opacity-0")} />{ind}
                                                    </CommandItem>
                                                ))}
                                                </CommandGroup></CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <Select value={providerSortBy} onValueChange={setProviderSortBy}>
                                        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="rating-desc">Rating: High to Low</SelectItem>
                                            <SelectItem value="name-asc">Name: A-Z</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                               {isLoading ? [...Array(6)].map((_, i) => <Skeleton key={i} className="h-96" />) : paginatedProviders.map(provider => (
                                    <Card key={provider.id} className="flex flex-col group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                                        <Link href={`/directory/providers/${provider.id}`} className="flex flex-col flex-grow">
                                            <CardHeader>
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-16 w-16 border-2 group-hover:border-primary transition-colors">
                                                        {provider.logoUrl && <AvatarImage src={provider.logoUrl} alt={`${provider.name} logo`} />}
                                                        <AvatarFallback className="text-xl">{provider.name.split(' ').map(n => n[0]).join('').slice(0,3)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <CardTitle className="font-headline group-hover:text-primary transition-colors">{provider.name}</CardTitle>
                                                        <CardDescription className="flex items-center gap-1.5 mt-1"><MapPin className="w-3 h-3 text-primary"/> {provider.location}</CardDescription>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="flex-grow space-y-4">
                                                <StarRating rating={provider.rating} reviewCount={(reviews || []).filter(r => r.providerId === provider.id).length} />
                                                <p className="text-sm text-muted-foreground h-16 overflow-hidden text-ellipsis">{provider.description}</p>
                                                <div><h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Techniques</h4><div className="flex flex-wrap gap-1.5 mt-2 min-h-[26px]">
                                                    {(provider.techniques || []).slice(0, 5).map(tech => (<Badge key={tech} variant="secondary">{tech}</Badge>))}
                                                    {(provider.techniques || []).length > 5 && <Badge variant="outline">+{ (provider.techniques || []).length - 5} more</Badge>}
                                                </div></div>
                                            </CardContent>
                                        </Link>
                                    </Card>
                               ))}
                            </div>
                            <PaginationControls currentPage={providerPage} pageCount={providerPageCount} onPageChange={setProviderPage} itemsPerPage={itemsPerPage} onItemsPerPageChange={handleItemsPerPageChange} totalItems={filteredProviders.length}/>
                        </TabsContent>
                        
                        {/* AUDITORS TAB */}
                        <TabsContent value="auditors" className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-center mb-8">
                                <div className="relative lg:col-span-1">
                                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input 
                                        placeholder="Search auditors..."
                                        className="pl-10 w-full"
                                        value={auditorSearch}
                                        onChange={(e) => { setAuditorSearch(e.target.value); setAuditorPage(1); }}
                                    />
                                </div>
                                <div className="flex gap-2 lg:col-span-2 justify-start lg:justify-end">
                                    <Popover>
                                        <PopoverTrigger asChild><Button variant="outline" disabled={isLoading}>Services ({selectedAuditorServices.length})</Button></PopoverTrigger>
                                        <PopoverContent className="w-80">
                                            <Command>
                                                <CommandInput placeholder="Filter by service..." />
                                                <CommandList><CommandEmpty>No results.</CommandEmpty><CommandGroup>
                                                {auditorServiceOptions.map(service => (
                                                    <CommandItem key={service} onSelect={() => {
                                                        setSelectedAuditorServices(prev => prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]);
                                                        setAuditorPage(1);
                                                    }}>
                                                        <Check className={cn("mr-2 h-4 w-4", selectedAuditorServices.includes(service) ? "opacity-100" : "opacity-0")} />{service}
                                                    </CommandItem>
                                                ))}
                                                </CommandGroup></CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <Popover>
                                        <PopoverTrigger asChild><Button variant="outline" disabled={isLoading}>Industry ({selectedAuditorIndustries.length})</Button></PopoverTrigger>
                                        <PopoverContent className="w-80">
                                             <Command>
                                                <CommandInput placeholder="Filter by industry..." />
                                                <CommandList><CommandEmpty>No results.</CommandEmpty><CommandGroup>
                                                {auditorIndustryOptions.map(ind => (
                                                    <CommandItem key={ind} onSelect={() => {
                                                        setSelectedAuditorIndustries(prev => prev.includes(ind) ? prev.filter(i => i !== ind) : [...prev, ind]);
                                                        setAuditorPage(1);
                                                    }}>
                                                        <Check className={cn("mr-2 h-4 w-4", selectedAuditorIndustries.includes(ind) ? "opacity-100" : "opacity-0")} />{ind}
                                                    </CommandItem>
                                                ))}
                                                </CommandGroup></CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {isLoading ? [...Array(3)].map((_, i) => <Skeleton key={i} className="h-96" />) : paginatedAuditors.map(firm => (
                                     <Card key={firm.id} className="flex flex-col group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                                        <Link href={`/directory/auditors/${firm.id}`} className="flex flex-col flex-grow">
                                            <CardHeader><div className="flex items-center gap-4">
                                                <Avatar className="h-16 w-16 border-2 group-hover:border-primary transition-colors"><AvatarFallback className="text-xl">{firm.name.split(' ').map(n => n[0]).join('').slice(0,3)}</AvatarFallback></Avatar>
                                                <div>
                                                    <CardTitle className="font-headline group-hover:text-primary transition-colors">{firm.name}</CardTitle>
                                                    <CardDescription className="flex items-center gap-1.5 mt-1"><MapPin className="w-3 h-3 text-primary"/> {firm.location}</CardDescription>
                                                </div>
                                            </div></CardHeader>
                                            <CardContent className="flex-grow space-y-4">
                                                <p className="text-sm text-muted-foreground h-16 overflow-hidden text-ellipsis">{firm.description}</p>
                                                <div><h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Services</h4><div className="flex flex-wrap gap-1.5 mt-2 min-h-[50px]">
                                                    {(firm.services || []).map(tech => (<Badge key={tech} variant="secondary">{tech}</Badge>))}
                                                </div></div>
                                            </CardContent>
                                        </Link>
                                    </Card>
                                ))}
                            </div>
                            <PaginationControls currentPage={auditorPage} pageCount={auditorPageCount} onPageChange={setAuditorPage} itemsPerPage={itemsPerPage} onItemsPerPageChange={handleItemsPerPageChange} totalItems={filteredAuditors.length}/>
                        </TabsContent>
                        
                        {/* MANUFACTURERS TAB */}
                        <TabsContent value="manufacturers" className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-center mb-8">
                                <div className="relative lg:col-span-1">
                                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input 
                                        placeholder="Search manufacturers..."
                                        className="pl-10 w-full"
                                        value={manufacturerSearch}
                                        onChange={(e) => { setManufacturerSearch(e.target.value); setManufacturerPage(1); }}
                                    />
                                </div>
                                <div className="lg:col-span-2 justify-start lg:justify-end">
                                      <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" disabled={isLoading}>Techniques ({selectedManufacturerTechniques.length})</Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80">
                                            <Command>
                                                <CommandInput placeholder="Filter techniques..." />
                                                <CommandList><CommandEmpty>No results.</CommandEmpty><CommandGroup>
                                                {manufacturerTechniqueOptions.map(tech => (
                                                    <CommandItem key={tech} onSelect={() => {
                                                        setSelectedManufacturerTechniques(prev => prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]);
                                                        setManufacturerPage(1);
                                                    }}>
                                                        <Check className={cn("mr-2 h-4 w-4", selectedManufacturerTechniques.includes(tech) ? "opacity-100" : "opacity-0")} />
                                                        {ndtTechniques?.find(t => t.acronym === tech)?.title || tech}
                                                    </CommandItem>
                                                ))}
                                                </CommandGroup></CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                                {isLoadingManufacturers ? [...Array(10)].map((_, i) => <Skeleton key={i} className="h-64 w-full" />) : (
                                    paginatedManufacturers.map(manufacturer => (
                                        <Card key={manufacturer.id} className="flex flex-col group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                                            <a href={createReferralUrl(manufacturer.url)} target="_blank" rel="noopener noreferrer" className="block">
                                                <CardHeader className="p-0">
                                                    <div className="relative h-20 bg-card p-2 rounded-t-lg">
                                                        <Image 
                                                            src={manufacturer.logoUrl || `https://placehold.co/200x80/e2e8f0/64748b/png?text=${manufacturer.name.replace(/\s/g, '+')}`}
                                                            alt={`${manufacturer.name} logo`}
                                                            fill
                                                            className="object-contain"
                                                        />
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="p-4 flex-grow">
                                                    <CardTitle className="text-base leading-tight group-hover:text-primary transition-colors" title={manufacturer.name}>{manufacturer.name}</CardTitle>
                                                </CardContent>
                                            </a>
                                        </Card>
                                    ))
                                )}
                            </div>
                            <PaginationControls currentPage={manufacturerPage} pageCount={manufacturerPageCount} onPageChange={setManufacturerPage} itemsPerPage={itemsPerPage} onItemsPerPageChange={handleItemsPerPageChange} totalItems={filteredManufacturers.length}/>
                        </TabsContent>

                    </Tabs>
                </main>
                <PublicFooter />
            </div>
        </TooltipProvider>
    );
}

    
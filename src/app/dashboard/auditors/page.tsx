

'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { MapPin, X, Eye } from 'lucide-react';
import Link from 'next/link';
import { auditFirms, auditFirmServices, auditFirmIndustries, AuditFirm } from '@/lib/auditors-data';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';


export default function FindAuditorsPage() {
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
    const searchParams = useSearchParams();
    const role = searchParams.get('role');

    const filteredAuditors = useMemo(() => {
        return auditFirms.filter(firm => {
            const serviceMatch = selectedServices.length === 0 || selectedServices.every(s => firm.services.includes(s));
            const industryMatch = selectedIndustries.length === 0 || selectedIndustries.every(i => firm.industries.includes(i));
            return serviceMatch && industryMatch;
        });
    }, [selectedServices, selectedIndustries]);

    const handleServiceChange = (service: string) => {
        setSelectedServices(prev => 
            prev.includes(service)
                ? prev.filter(t => t !== service)
                : [...prev, service]
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
        setSelectedServices([]);
        setSelectedIndustries([]);
    }

    const hasActiveFilters = selectedServices.length > 0 || selectedIndustries.length > 0;

    const pageTitle = role === 'admin' ? 'Auditor Management' : 'Find Auditors';

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <Eye className="text-primary" />
                    {pageTitle}
                </h1>
                <div className="flex gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline">
                                Filter by Service ({selectedServices.length})
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">Services</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Select the services you require.
                                    </p>
                                </div>
                                <ScrollArea className="grid gap-2 max-h-60 p-1">
                                    {auditFirmServices.map(spec => (
                                        <div key={spec} className="flex items-center space-x-2 p-1">
                                             <Checkbox 
                                                id={`spec-${spec.replace(/\s+/g, '-')}`} 
                                                checked={selectedServices.includes(spec)}
                                                onCheckedChange={() => handleServiceChange(spec)}
                                             />
                                            <Label htmlFor={`spec-${spec.replace(/\s+/g, '-')}`}>{spec}</Label>
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
                </div>
            </div>
            
             {hasActiveFilters && (
                <div className="mb-4 flex items-center flex-wrap gap-2">
                    <span className="text-sm font-medium">Active Filters:</span>
                    {selectedServices.map(spec => (
                        <Badge key={spec} variant="secondary">
                            {spec}
                            <button onClick={() => handleServiceChange(spec)} className="ml-1.5 rounded-full hover:bg-muted-foreground/20 p-0.5">
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
                {filteredAuditors.map(firm => (
                    <Card key={firm.id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarFallback className="text-xl">{firm.name.split(' ').map(n => n[0]).join('').slice(0,3)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="font-headline">{firm.name}</CardTitle>
                                    <CardDescription className="flex items-center gap-1.5 mt-1">
                                        <MapPin className="w-3 h-3 text-primary"/> {firm.location}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-4">
                            <p className="text-sm text-muted-foreground pt-2 h-24 overflow-hidden">{firm.description}</p>
                            <div>
                                <h4 className="text-sm font-semibold mb-2">Services Offered</h4>
                                <div className="flex flex-wrap gap-1.5 min-h-[50px]">
                                    {firm.services.map(tech => (
                                        <Badge key={tech} variant="secondary" shape="rounded">{tech}</Badge>
                                    ))}
                                </div>
                            </div>
                             <div>
                                <h4 className="text-sm font-semibold mb-2">Industry Focus</h4>
                                <div className="flex flex-wrap gap-1.5 min-h-[50px]">
                                    {firm.industries.map(tech => (
                                        <Badge key={tech} variant="outline" shape="rounded">{tech}</Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                         <CardFooter>
                            <Button asChild className="w-full">
                                <Link href={constructUrl(`/dashboard/auditors/${firm.id}`)}>
                                    View Profile
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
                 {filteredAuditors.length === 0 && (
                    <div className="col-span-full text-center py-10">
                        <p className="text-muted-foreground">No audit firms match the selected filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

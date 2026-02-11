
'use client';

import * as React from 'react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { MapPin, X, Eye } from 'lucide-react';
import Link from 'next/link';
import { auditFirms as initialAuditFirms, auditFirmServices, auditFirmIndustries } from '@/lib/placeholder-data';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function AuditorsPage() {
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);

    const filteredAuditors = useMemo(() => {
        return initialAuditFirms.filter(firm => {
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

    const clearFilters = () => {
        setSelectedServices([]);
        setSelectedIndustries([]);
    }

    const hasActiveFilters = selectedServices.length > 0 || selectedIndustries.length > 0;

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <PublicHeader />
            <main className="flex-grow">
                <section className="py-20 md:py-32 bg-primary/10">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-3xl mx-auto text-center">
                            <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">
                                Find a Certified Auditor
                            </h1>
                            <p className="mt-6 text-lg md:text-xl text-muted-foreground">
                                Browse our directory of independent, third-party auditors and Level III consultants to ensure your projects meet the highest standards of quality and compliance.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="py-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                            <h2 className="text-2xl font-headline font-semibold">Auditor Firm Directory</h2>
                            <div className="flex gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline">Filter by Service ({selectedServices.length})</Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80">
                                        <div className="grid gap-4">
                                            <h4 className="font-medium leading-none">Services</h4>
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
                                        <Button variant="outline">Filter by Industry ({selectedIndustries.length})</Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80">
                                        <div className="grid gap-4">
                                            <h4 className="font-medium leading-none">Industries</h4>
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
                                <Button variant="ghost" onClick={clearFilters} disabled={!hasActiveFilters}>Clear</Button>
                            </div>
                        </div>

                        {hasActiveFilters && (
                            <div className="mb-4 flex items-center flex-wrap gap-2">
                                <span className="text-sm font-medium">Active Filters:</span>
                                {selectedServices.map(spec => (
                                    <Badge key={spec} variant="secondary">
                                        {spec}
                                        <button onClick={() => handleServiceChange(spec)} className="ml-1.5 rounded-full hover:bg-muted-foreground/20 p-0.5">
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
                                        <p className="text-sm text-muted-foreground h-20 overflow-hidden">{firm.description}</p>
                                        <div>
                                            <h4 className="text-sm font-semibold mb-2">Services Offered</h4>
                                            <div className="flex flex-wrap gap-1.5">
                                                {firm.services.map(service => (
                                                    <Badge key={service} variant="secondary" shape="rounded">{service}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold mb-2">Industry Focus</h4>
                                            <div className="flex flex-wrap gap-1.5">
                                                {firm.industries.map(industry => (
                                                    <Badge key={industry} variant="outline" shape="rounded">{industry}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {filteredAuditors.length === 0 && (
                                <div className="col-span-full text-center py-10">
                                    <p className="text-muted-foreground">No auditor firms match the selected filters.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
                
                 <section className="bg-card py-20">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-headline font-semibold text-primary">
                      Are You a Level III or Auditor?
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                      Join NDT EXCHANGE for free to provide expert oversight and ensure compliance on jobs across the industry.
                    </p>
                    <div className="mt-8">
                      <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                        <Link href="/signup">Register as an Auditor</Link>
                      </Button>
                    </div>
                  </div>
                </section>
            </main>
            <PublicFooter />
        </div>
    );
}

    
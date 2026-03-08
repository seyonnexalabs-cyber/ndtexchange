
'use client';

import * as React from 'react';
import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { MapPin, X, Eye } from 'lucide-react';
import Link from 'next/link';
import type { AuditFirm } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useSearchParams, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';


// New schema and form for adding an auditor firm
const auditorFirmSchema = z.object({
  name: z.string().min(2, "Company name is required."),
  location: z.string().min(2, "Location is required."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  contactPerson: z.string().min(2, "Contact person name is required."),
  contactEmail: z.string().email("Please enter a valid email address."),
  services: z.array(z.string()).min(1, "Select at least one service."),
  industries: z.array(z.string()).min(1, "Select at least one industry."),
});

const AuditorFirmForm = ({ onCancel, onSubmit, allServices, allIndustries }: { onCancel: () => void; onSubmit: (values: z.infer<typeof auditorFirmSchema>) => void; allServices: string[]; allIndustries: string[] }) => {
    const form = useForm<z.infer<typeof auditorFirmSchema>>({
        resolver: zodResolver(auditorFirmSchema),
        defaultValues: {
            name: '',
            location: '',
            description: '',
            contactPerson: '',
            contactEmail: '',
            services: [],
            industries: [],
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Company Name</FormLabel><FormControl><Input placeholder="e.g., Global Audit Solutions" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="location" render={({ field }) => (
                        <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="City, Country" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                 <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Briefly describe the company..." {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                     <FormField control={form.control} name="contactPerson" render={({ field }) => (
                        <FormItem><FormLabel>Contact Person</FormLabel><FormControl><Input placeholder="e.g., Jane Doe" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="contactEmail" render={({ field }) => (
                        <FormItem><FormLabel>Contact Email</FormLabel><FormControl><Input type="email" placeholder="contact@company.com" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="services" render={() => (
                        <FormItem><FormLabel>Services Offered</FormLabel>
                        <ScrollArea className="h-40 rounded-md border p-4">
                            {allServices.map(service => (
                                <FormField key={service} control={form.control} name="services" render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-3">
                                        <FormControl><Checkbox checked={field.value?.includes(service)} onCheckedChange={checked => checked ? field.onChange([...field.value, service]) : field.onChange(field.value?.filter(v => v !== service))} /></FormControl>
                                        <FormLabel className="font-normal">{service}</FormLabel>
                                    </FormItem>
                                )} />
                            ))}
                        </ScrollArea><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="industries" render={() => (
                        <FormItem><FormLabel>Industry Focus</FormLabel>
                        <ScrollArea className="h-40 rounded-md border p-4">
                            {allIndustries.map(industry => (
                                <FormField key={industry} control={form.control} name="industries" render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-3">
                                        <FormControl><Checkbox checked={field.value?.includes(industry)} onCheckedChange={checked => checked ? field.onChange([...field.value, industry]) : field.onChange(field.value?.filter(v => v !== industry))} /></FormControl>
                                        <FormLabel className="font-normal">{industry}</FormLabel>
                                    </FormItem>
                                )} />
                            ))}
                        </ScrollArea><FormMessage /></FormItem>
                    )} />
                </div>
                 <DialogFooter className="pt-4">
                    <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                    <Button type="submit">Create Firm</Button>
                </DialogFooter>
            </form>
        </Form>
    );
};

const DesktopView = ({ firms, constructUrl }: { firms: AuditFirm[], constructUrl: (path: string) => string }) => (
    <Card>
        <CardHeader>
            <CardTitle>Auditor Firms</CardTitle>
            <CardDescription>A directory of all third-party auditor firms on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Firm Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Services</TableHead>
                        <TableHead>Industries</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {firms.map(firm => (
                        <TableRow key={firm.id}>
                            <TableCell className="font-medium flex items-center gap-3">
                                <Avatar>
                                    <AvatarFallback>{firm.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                {firm.name}
                            </TableCell>
                            <TableCell>{firm.location}</TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1 w-48">
                                    {firm.services.slice(0, 3).map(service => <Badge key={service} variant="secondary">{service}</Badge>)}
                                    {firm.services.length > 3 && <Badge variant="outline">+{firm.services.length - 3}</Badge>}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1 w-48">
                                    {firm.industries.slice(0, 3).map(industry => <Badge key={industry} variant="outline">{industry}</Badge>)}
                                    {firm.industries.length > 3 && <Badge variant="outline">+{firm.industries.length - 3}</Badge>}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                               <Button asChild variant="outline" size="sm">
                                    <Link href={constructUrl(`/dashboard/auditors/${firm.id}`)}>View Details</Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
             {firms.length === 0 && (
                <div className="col-span-full text-center py-10">
                    <p className="text-muted-foreground">No audit firms match the selected filters.</p>
                </div>
            )}
        </CardContent>
    </Card>
);

const MobileView = ({ firms, constructUrl }: { firms: AuditFirm[], constructUrl: (path: string) => string }) => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {firms.map(firm => (
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
         {firms.length === 0 && (
            <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">No audit firms match the selected filters.</p>
            </div>
        )}
    </div>
);


export default function AuditorsPage() {
    const { firestore } = useFirebase();
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
    const searchParams = useSearchParams();
    const router = useRouter();
    const role = searchParams.get('role');
    const [isAddFirmOpen, setIsAddFirmOpen] = useState(false);
    const isMobile = useIsMobile();

    const auditorsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'companies'), where('type', '==', 'Auditor')) : null, [firestore]);
    const { data: firms, isLoading: isLoadingFirms } = useCollection<AuditFirm>(auditorsQuery);

    const { auditFirmServices, auditFirmIndustries } = useMemo(() => {
        if (!firms) return { auditFirmServices: [], auditFirmIndustries: [] };
        const services = new Set(firms.flatMap(f => f.services || []));
        const industries = new Set(firms.flatMap(f => f.industries || []));
        return {
            auditFirmServices: Array.from(services).sort(),
            auditFirmIndustries: Array.from(industries).sort()
        };
    }, [firms]);

    useEffect(() => {
        if (role && !['client', 'admin'].includes(role)) {
            router.replace(`/dashboard?${searchParams.toString()}`);
        }
    }, [role, router, searchParams]);

    const filteredAuditors = useMemo(() => {
        if (!firms) return [];
        return firms.filter(firm => {
            const serviceMatch = selectedServices.length === 0 || selectedServices.every(s => (firm.services || []).includes(s));
            const industryMatch = selectedIndustries.length === 0 || selectedIndustries.every(i => (firm.industries || []).includes(i));
            return serviceMatch && industryMatch;
        });
    }, [selectedServices, selectedIndustries, firms]);

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

    const handleFormSubmit = (values: z.infer<typeof auditorFirmSchema>) => {
        // This would be a firestore call in a real app
        console.log("New Auditor Firm:", values);
        toast.success("Auditor Firm Created", {
            description: `${values.name} has been added to the directory.`,
        });
        setIsAddFirmOpen(false);
    };

    const hasActiveFilters = selectedServices.length > 0 || selectedIndustries.length > 0;

    const pageTitle = role === 'admin' ? 'Auditor Management' : 'Find Auditors';

    if (role && !['client', 'admin'].includes(role)) {
        return null;
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <Eye className="text-primary" />
                    {pageTitle}
                </h1>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="flex-grow sm:flex-grow-0" disabled={isLoadingFirms}>
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
                            <Button variant="outline" className="flex-grow sm:flex-grow-0" disabled={isLoadingFirms}>
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
                     {role === 'admin' && (
                        <Button onClick={() => setIsAddFirmOpen(true)} className="flex-grow sm:flex-grow-0">Add Firm</Button>
                    )}
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
            
            {isLoadingFirms ? (
                isMobile ? <Skeleton className="h-64 w-full" /> : <Skeleton className="h-96 w-full" />
            ) : (
                isMobile ? 
                    <MobileView firms={filteredAuditors} constructUrl={constructUrl} /> : 
                    <DesktopView firms={filteredAuditors} constructUrl={constructUrl} />
            )}

             <Dialog open={isAddFirmOpen} onOpenChange={setIsAddFirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Auditor Firm</DialogTitle>
                        <DialogDescription>
                            Create a new auditor firm profile. Users can be invited to this firm from the User Management page.
                        </DialogDescription>
                    </DialogHeader>
                    <AuditorFirmForm 
                        onSubmit={handleFormSubmit} 
                        onCancel={() => setIsAddFirmOpen(false)} 
                        allServices={auditFirmServices}
                        allIndustries={auditFirmIndustries}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}

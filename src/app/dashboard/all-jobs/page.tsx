
'use client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { jobs, Job, clientData } from "@/lib/placeholder-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Calendar, AlarmClock, Filter, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { cn, GLOBAL_DATE_FORMAT } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { serviceProviders } from "@/lib/service-providers-data";
import { useIsMobile } from "@/hooks/use-mobile";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, isToday } from "date-fns";
import { useSearch } from "@/app/components/layout/search-provider";


const statusFilters = ['Posted', 'Assigned', 'Scheduled', 'In Progress', 'Report Submitted', 'Under Audit', 'Audit Approved', 'Client Review', 'Client Approved', 'Completed', 'Paid'];

const jobStatusVariants: Record<Job['status'], 'success' | 'default' | 'secondary' | 'destructive' | 'outline'> = {
    'Draft': 'outline',
    'Posted': 'secondary',
    'Assigned': 'default',
    'Scheduled': 'default',
    'In Progress': 'default',
    'Report Submitted': 'secondary',
    'Under Audit': 'secondary',
    'Audit Approved': 'success',
    'Client Review': 'secondary',
    'Client Approved': 'success',
    'Completed': 'success',
    'Paid': 'success'
};

export default function AllJobsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role');
    const { searchQuery } = useSearch();
    const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
    const [selectedClients, setSelectedClients] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const isMobile = useIsMobile();
    const [today, setToday] = useState<Date | undefined>(undefined);

    useEffect(() => {
        if (role && role !== 'admin') {
            router.replace(`/dashboard?${searchParams.toString()}`);
        }
    }, [role, router, searchParams]);

    useEffect(() => {
        setToday(new Date());
    }, []);
    
    const constructUrl = (base: string) => {
        const [pathname, baseQuery] = base.split('?');
        const newParams = new URLSearchParams(searchParams.toString());

        if (baseQuery) {
            const baseParams = new URLSearchParams(baseQuery);
            baseParams.forEach((value, key) => {
                newParams.set(key, value);
            });
        }

        const queryString = newParams.toString();
        return queryString ? `${pathname}?${queryString}` : pathname;
    }

    const filteredJobs = useMemo(() => {
        return jobs.filter(job => {
            const searchMatch = !searchQuery ||
                job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.id.toLowerCase().includes(searchQuery.toLowerCase());
            
            const providerMatch = selectedProviders.length === 0 || (job.providerId && selectedProviders.includes(job.providerId));
            const clientMatch = selectedClients.length === 0 || selectedClients.includes(job.client);
            const statusMatch = selectedStatuses.length === 0 || selectedStatuses.includes(job.status);

            return searchMatch && providerMatch && statusMatch && clientMatch;
        });
    }, [searchQuery, selectedProviders, selectedStatuses, selectedClients]);

    const handleProviderChange = (providerId: string) => {
        setSelectedProviders(prev => prev.includes(providerId) ? prev.filter(id => id !== providerId) : [...prev, providerId]);
    };

    const handleClientChange = (clientName: string) => {
        setSelectedClients(prev => prev.includes(clientName) ? prev.filter(name => name !== clientName) : [...prev, clientName]);
    };
    
    const handleStatusChange = (status: string) => {
        setSelectedStatuses(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]);
    };

    const hasActiveFilters = selectedProviders.length > 0 || selectedStatuses.length > 0 || selectedClients.length > 0;

    if (role !== 'admin') {
        return null;
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <Briefcase className="text-primary" />
                    All Jobs
                </h1>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-end gap-4 mb-4">
                 <div className="flex gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full sm:w-auto">
                                <Filter className="mr-2 h-4 w-4 text-primary" />
                                Client ({selectedClients.length})
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64">
                             <div className="grid gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">Filter by Client</h4>
                                </div>
                                <div className="grid gap-2">
                                    {clientData.map(client => (
                                        <div key={client.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`client-${client.id}`}
                                                checked={selectedClients.includes(client.name)}
                                                onCheckedChange={() => handleClientChange(client.name)}
                                            />
                                            <Label htmlFor={`client-${client.id}`}>{client.name}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full sm:w-auto">
                                <Filter className="mr-2 h-4 w-4 text-primary" />
                                Provider ({selectedProviders.length})
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64">
                             <div className="grid gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">Filter by Provider</h4>
                                </div>
                                <div className="grid gap-2">
                                    {serviceProviders.map(provider => (
                                        <div key={provider.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`provider-${provider.id}`}
                                                checked={selectedProviders.includes(provider.id)}
                                                onCheckedChange={() => handleProviderChange(provider.id)}
                                            />
                                            <Label htmlFor={`provider-${provider.id}`}>{provider.name}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full sm:w-auto">
                                <Filter className="mr-2 h-4 w-4 text-primary" />
                                Status ({selectedStatuses.length})
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64">
                             <div className="grid gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">Filter by Status</h4>
                                </div>
                                <div className="grid gap-2 max-h-60 overflow-y-auto">
                                    {statusFilters.map(status => (
                                        <div key={status} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`status-${status}`}
                                                checked={selectedStatuses.includes(status)}
                                                onCheckedChange={() => handleStatusChange(status)}
                                            />
                                            <Label htmlFor={`status-${status}`}>{status}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                 </div>
            </div>

            {hasActiveFilters && (
                <div className="mb-4 flex items-center flex-wrap gap-2">
                    <span className="text-sm font-medium">Active Filters:</span>
                     {selectedClients.map(clientName => (
                        <Badge key={clientName} variant="secondary">
                            {clientName}
                            <button onClick={() => handleClientChange(clientName)} className="ml-1.5 rounded-full hover:bg-muted-foreground/20 p-0.5">
                                <X className="h-3 w-3 text-primary" />
                            </button>
                        </Badge>
                    ))}
                    {selectedProviders.map(providerId => (
                        <Badge key={providerId} variant="secondary">
                            {serviceProviders.find(p => p.id === providerId)?.name}
                            <button onClick={() => handleProviderChange(providerId)} className="ml-1.5 rounded-full hover:bg-muted-foreground/20 p-0.5">
                                <X className="h-3 w-3 text-primary" />
                            </button>
                        </Badge>
                    ))}
                    {selectedStatuses.map(status => (
                        <Badge key={status} variant="secondary">
                            Status: {status}
                             <button onClick={() => handleStatusChange(status)} className="ml-1.5 rounded-full hover:bg-muted-foreground/20 p-0.5">
                                <X className="h-3 w-3 text-primary" />
                            </button>
                        </Badge>
                    ))}
                    <Button variant="ghost" size="sm" onClick={() => { setSelectedProviders([]); setSelectedStatuses([]); setSelectedClients([]); }}>Clear All</Button>
                </div>
            )}
            
            {isMobile ? (
                 <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    {filteredJobs.map(job => (
                        <Card key={job.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="font-headline text-xl">{job.title}</CardTitle>
                                        <p className="text-xs text-muted-foreground font-extrabold">{job.id}</p>
                                    </div>
                                    <Badge variant={jobStatusVariants[job.status]}>{job.status}</Badge>
                                </div>
                                <CardDescription>{job.client} - {job.technique}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <MapPin className="w-4 h-4 mr-2 text-primary" />
                                    <span>{job.location}</span>
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                                    <span>Posted: {format(new Date(job.postedDate), GLOBAL_DATE_FORMAT)}</span>
                                    {today && isToday(new Date(job.postedDate)) && <Badge className="ml-2">Today</Badge>}
                                </div>
                                {job.bidExpiryDate && (
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <AlarmClock className="w-4 h-4 mr-2 text-primary" />
                                        <span>Bids Expire: {format(new Date(job.bidExpiryDate), GLOBAL_DATE_FORMAT)}</span>
                                        {today && isToday(new Date(job.bidExpiryDate)) && <Badge className="ml-2">Today</Badge>}
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button asChild>
                                    <Link href={constructUrl(`/dashboard/my-jobs/${job.id}`)}>View Job Details</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Job ID</TableHead>
                                <TableHead>Job Title</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Technique</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Posted</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredJobs.map(job => (
                                <TableRow key={job.id}>
                                    <TableCell className="font-extrabold text-xs">{job.id}</TableCell>
                                    <TableCell className="font-medium">{job.title}</TableCell>
                                    <TableCell>{job.client}</TableCell>
                                    <TableCell><Badge variant="secondary">{job.technique}</Badge></TableCell>
                                    <TableCell>{job.location}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span>{format(new Date(job.postedDate), GLOBAL_DATE_FORMAT)}</span>
                                            {today && isToday(new Date(job.postedDate)) && <Badge>Today</Badge>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={jobStatusVariants[job.status]}>{job.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={constructUrl(`/dashboard/my-jobs/${job.id}`)}>View Details</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}

             {filteredJobs.length === 0 && (
                <div className="text-center p-10 border rounded-lg">
                    <Briefcase className="mx-auto h-12 w-12 text-primary" />
                    <h2 className="mt-4 text-xl font-headline">No jobs found</h2>
                    <p className="mt-2 text-muted-foreground">There are no jobs matching your current filters.</p>
                </div>
            )}

        </div>
    );
}

    

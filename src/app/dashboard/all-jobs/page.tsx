
'use client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Calendar, AlarmClock, Filter, X, Building } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { cn, GLOBAL_DATE_FORMAT, safeParseDate } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useMobile } from "@/hooks/use-mobile";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, isToday } from "date-fns";
import { useSearch } from "@/app/components/layout/search-provider";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { useFirebase, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, collectionGroup } from 'firebase/firestore';
import type { Job, Client, NDTServiceProvider } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";


const statusFilters = ['Posted', 'Assigned', 'Scheduled', 'In Progress', 'Report Submitted', 'Under Audit', 'Audit Approved', 'Client Review', 'Client Approved', 'Completed', 'Paid'];
const JOBS_PER_PAGE = 10;

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
    'Paid': 'success',
    'Revisions Requested': 'destructive',
};

export default function AllJobsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role');
    const { searchQuery } = useSearch();
    const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
    const [selectedClients, setSelectedClients] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const isMobile = useMobile();
    const [today, setToday] = useState<Date | undefined>(undefined);
    const [currentPage, setCurrentPage] = useState(1);

    const { firestore, user } = useFirebase();
    const isReady = !!firestore && !!user && role === 'admin';

    const jobsQuery = useMemoFirebase(() => isReady ? query(collectionGroup(firestore, 'jobs')) : null, [isReady]);
    const { data: jobs, isLoading: isLoadingJobs } = useCollection<Job>(jobsQuery);
    
    const companiesQuery = useMemoFirebase(() => isReady ? collection(firestore, 'companies') : null, [isReady]);
    const { data: companies, isLoading: isLoadingCompanies } = useCollection<any>(companiesQuery);

    const clientData = useMemo(() => companies?.filter(c => c.type === 'Client') || [], [companies]);
    const serviceProviders = useMemo(() => companies?.filter(c => c.type === 'Provider') || [], [companies]);

    useEffect(() => {
        setToday(new Date());
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedProviders, selectedClients, selectedStatuses]);
    
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
        if (!isReady || !jobs) return [];
        
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
    }, [isReady, jobs, searchQuery, selectedProviders, selectedStatuses, selectedClients]);
    
    const pageCount = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);

    const paginatedJobs = useMemo(() => {
        const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
        return filteredJobs.slice(startIndex, startIndex + JOBS_PER_PAGE);
    }, [filteredJobs, currentPage]);


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

    const PaginationControls = () => (
         pageCount > 1 && (
            <div className="mt-6">
                 <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentPage((prev) => Math.max(prev - 1, 1));
                                }}
                                className={cn(currentPage === 1 && "pointer-events-none opacity-50")}
                            />
                        </PaginationItem>
                         <PaginationItem>
                            <span className="text-sm font-medium p-2">Page {currentPage} of {pageCount}</span>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentPage((prev) => Math.min(prev + 1, pageCount));
                                }}
                                 className={cn(currentPage === pageCount && "pointer-events-none opacity-50")}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        )
    );
    
    if (isLoadingJobs || isLoadingCompanies) {
        return (
             <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                        <Briefcase className="text-primary" />
                        All Jobs
                    </h1>
                </div>
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Job ID</TableHead>
                                <TableHead>Job Title</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Assets</TableHead>
                                <TableHead>Technique</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Posted</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-24" /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        )
    }

    if (!isReady) return null;

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
                                    {(clientData || []).map(client => (
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
                                    {(serviceProviders || []).map(provider => (
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
                <>
                    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                        {paginatedJobs.map(job => {
                            const postedDate = safeParseDate(job.postedDate);
                            const expiryDate = safeParseDate(job.bidExpiryDate);
                            return (
                            <Card key={job.id}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="font-headline text-xl">{job.title}</CardTitle>
                                            <p className="text-xs text-muted-foreground font-extrabold">{job.id}</p>
                                        </div>
                                        <Badge variant={jobStatusVariants[job.status]}>{job.status}</Badge>
                                    </div>
                                    <CardDescription>{job.client} - {(job.techniques || []).join(', ')}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Building className="w-4 h-4 mr-2 text-primary" />
                                        <span>{job.assetIds?.length || '0'} Asset(s) Involved</span>
                                    </div>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <MapPin className="w-4 h-4 mr-2 text-primary" />
                                        <span>{job.location}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Calendar className="w-4 h-4 mr-2 text-primary" />
                                        <span>Posted: {postedDate ? format(postedDate, GLOBAL_DATE_FORMAT) : 'N/A'}</span>
                                        {postedDate && isToday(postedDate) && <Badge className="ml-2">Today</Badge>}
                                    </div>
                                    {expiryDate && (
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <AlarmClock className="w-4 h-4 mr-2 text-primary" />
                                            <span>Bids Expire: {format(expiryDate, GLOBAL_DATE_FORMAT)}</span>
                                            {isToday(expiryDate) && <Badge className="ml-2">Today</Badge>}
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter>
                                    <Button asChild>
                                        <Link href={constructUrl(`/dashboard/my-jobs/${job.id}`)}>View Job Details</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        )})}
                    </div>
                     <PaginationControls />
                </>
            ) : (
                <>
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Job ID</TableHead>
                                    <TableHead>Job Title</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Assets</TableHead>
                                    <TableHead>Technique</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Posted</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedJobs.map(job => {
                                    const postedDate = safeParseDate(job.postedDate);
                                    return (
                                    <TableRow key={job.id}>
                                        <TableCell className="font-extrabold text-xs">{job.id}</TableCell>
                                        <TableCell className="font-medium">{job.title}</TableCell>
                                        <TableCell>{job.client}</TableCell>
                                        <TableCell>{job.assetIds?.length || 0}</TableCell>
                                        <TableCell><div className="flex flex-wrap gap-1">{(job.techniques || []).map(t => <Badge key={t} variant="secondary">{t}</Badge>)}</div></TableCell>
                                        <TableCell>{job.location}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span>{postedDate ? format(postedDate, GLOBAL_DATE_FORMAT) : 'N/A'}</span>
                                                {postedDate && isToday(postedDate) && <Badge>Today</Badge>}
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
                                )})}
                            </TableBody>
                        </Table>
                    </Card>
                    <PaginationControls />
                </>
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

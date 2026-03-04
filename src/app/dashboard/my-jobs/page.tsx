
'use client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, CheckCircle, MapPin, Award, PlusCircle, Filter, X, Gavel, Building, DollarSign, FileText, History, HardHat } from "lucide-react";
import Link from 'next/link';
import { useSearchParams } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { cn, GLOBAL_DATE_FORMAT, safeParseDate } from "@/lib/utils";
import { format, isToday } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useFirebase, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { Skeleton } from "@/components/ui/skeleton";
import type { Job, PlatformUser, NDTServiceProvider } from '@/lib/types';
import { useSearch } from "@/app/components/layout/search-provider";

type JobView = 'active' | 'completed' | 'upcoming' | 'drafts';

const jobStatusVariants: Record<Job['status'], 'success' | 'default' | 'secondary' | 'destructive' | 'outline'> = {
    'Draft': 'outline', 'Posted': 'secondary', 'Assigned': 'default', 'Scheduled': 'default', 'In Progress': 'default',
    'Report Submitted': 'secondary', 'Under Audit': 'secondary', 'Audit Approved': 'success', 'Client Review': 'secondary',
    'Client Approved': 'success', 'Completed': 'success', 'Paid': 'success', 'Revisions Requested': 'destructive'
};

export default function MyJobsPage() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'client';
    const [view, setView] = useState<JobView>(role === 'client' ? 'upcoming' : 'active');
    const { searchQuery } = useSearch();

    const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
    const [selectedClients, setSelectedClients] = useState<string[]>([]);
    const [auditFilter, setAuditFilter] = useState(false);

    const { firestore, user: authUser } = useFirebase();
    const { data: userProfile, isLoading: isLoadingProfile } = useDoc<PlatformUser>(
        useMemoFirebase(() => (authUser ? doc(firestore, 'users', authUser.uid) : null), [authUser, firestore])
    );
    
    const jobsQuery = useMemoFirebase(() => {
        if (!firestore || !userProfile?.companyId) return null;
        if (role === 'client') {
            return query(collection(firestore, 'jobs'), where('clientCompanyId', '==', userProfile.companyId));
        }
        if (role === 'inspector') {
            return query(collection(firestore, 'jobs'), where('providerCompanyId', '==', userProfile.companyId));
        }
        return null;
    }, [firestore, userProfile, role]);


    const { data: jobsFromDb, isLoading: isLoadingJobs } = useCollection<Job>(jobsQuery);
    const { data: allCompanies, isLoading: isLoadingCompanies } = useCollection<NDTServiceProvider>(useMemoFirebase(() => (firestore) ? collection(firestore, 'companies') : null, [firestore]));

    const jobsByCategory = useMemo(() => {
        if (!jobsFromDb) return { active: [], completed: [], upcoming: [], drafts: [] };
        
        const relevantJobs = jobsFromDb;

        return {
            active: relevantJobs.filter(job => job.status === 'In Progress'),
            completed: relevantJobs.filter(job => ['Completed', 'Paid'].includes(job.status)),
            upcoming: relevantJobs.filter(job => role === 'inspector' ? ['Assigned', 'Scheduled'].includes(job.status) : ['Posted', 'Assigned', 'Scheduled'].includes(job.status)),
            drafts: relevantJobs.filter(job => job.status === 'Draft'),
        };
    }, [jobsFromDb, role, userProfile]);
    
    const { displayedJobs, title, Icon } = useMemo(() => {
        let jobsToShow: Job[] = [];
        let pageTitle = '';
        let PageIcon: React.ElementType = Briefcase;
        
        switch(view) {
            case 'active':
                jobsToShow = jobsByCategory.active;
                pageTitle = 'Active Jobs';
                PageIcon = CheckCircle;
                break;
            case 'completed':
                jobsToShow = jobsByCategory.completed;
                pageTitle = 'Completed Jobs';
                PageIcon = History;
                break;
            case 'upcoming':
                jobsToShow = jobsByCategory.upcoming;
                pageTitle = role === 'inspector' ? 'Upcoming Jobs' : 'Pending & Upcoming';
                PageIcon = Award;
                break;
            case 'drafts':
                jobsToShow = jobsByCategory.drafts;
                pageTitle = 'Drafts';
                PageIcon = FileText;
                break;
        }

        const filtered = jobsToShow.filter(job => {
            const providerMatch = selectedProviders.length === 0 || (job.providerCompanyId && selectedProviders.includes(job.providerCompanyId));
            const clientMatch = selectedClients.length === 0 || selectedClients.includes(job.client);
            const auditMatch = !auditFilter || (job.workflow === 'level3' || job.workflow === 'auto');
            
            const searchLower = searchQuery.toLowerCase();
            const provider = allCompanies?.find(c => c.id === job.providerCompanyId);
            const searchMatch = !searchQuery ||
                job.title.toLowerCase().includes(searchLower) ||
                job.id.toLowerCase().includes(searchLower) ||
                job.client.toLowerCase().includes(searchLower) ||
                (provider && provider.name.toLowerCase().includes(searchLower));

            return providerMatch && clientMatch && auditMatch && searchMatch;
        });

        return { displayedJobs: filtered, title: pageTitle, Icon: PageIcon };
    }, [view, role, selectedProviders, selectedClients, auditFilter, jobsByCategory, searchQuery, allCompanies]);

    const jobsByMonth = useMemo(() => {
        return displayedJobs.reduce((acc, job) => {
            const date = safeParseDate(job.scheduledStartDate || job.postedDate);
            if (!date) return acc;

            const monthYear = format(date, 'MMMM yyyy');
            if (!acc[monthYear]) {
                acc[monthYear] = [];
            }
            acc[monthYear].push(job);
            return acc;
        }, {} as Record<string, Job[]>);
    }, [displayedJobs]);


    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const handleProviderChange = (providerId: string) => {
        setSelectedProviders(prev => prev.includes(providerId) ? prev.filter(id => id !== providerId) : [...prev, providerId]);
    };
    
    const handleClientChange = (clientName: string) => {
        setSelectedClients(prev => prev.includes(clientName) ? prev.filter(name => name !== clientName) : [...prev, clientName]);
    };

    const clearFilters = () => {
        setSelectedProviders([]);
        setSelectedClients([]);
        setAuditFilter(false);
    };

    const hasActiveFilters = selectedProviders.length > 0 || selectedClients.length > 0 || auditFilter;

    const getEmptyStateAction = () => {
        if (role === 'client') {
            return (
                <Button asChild className="mt-4">
                    <Link href={constructUrl('/dashboard/my-jobs/post')}>
                        <PlusCircle className="mr-2" />
                        Post a Job
                    </Link>
                </Button>
            );
        }
        if (role === 'inspector' && view !== 'completed') {
             return (
                <Button asChild className="mt-4">
                    <Link href={constructUrl('/dashboard/find-jobs')}>Find a Job</Link>
                </Button>
            );
        }
        return null;
    }

    const uniqueClients = useMemo(() => {
        if (role !== 'inspector' || !jobsFromDb) return [];
        const clients = new Set(jobsFromDb.map(j => j.client));
        return Array.from(clients);
    }, [role, jobsFromDb]);

    const uniqueProviders = useMemo(() => {
        if (role !== 'client' || !jobsFromDb || !allCompanies) return [];
        const providerIds = new Set(jobsFromDb.filter(j => j.providerCompanyId).map(j => j.providerCompanyId!));
        return allCompanies.filter(p => p.type === 'Provider' && providerIds.has(p.id));
    }, [role, jobsFromDb, allCompanies]);

    if (isLoadingJobs || isLoadingProfile || isLoadingCompanies) {
        return (
            <div>
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                        <Briefcase className="text-primary" />
                        My Jobs
                    </h1>
                </div>
                <div className="space-y-8">
                    {[...Array(3)].map((_, i) => (
                        <div key={i}>
                            <Skeleton className="h-8 w-48 mb-4" />
                            <div className="space-y-4">
                                <Skeleton className="h-24 w-full" />
                                <Skeleton className="h-24 w-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <Briefcase className="text-primary" />
                    My Jobs
                </h1>
                <div className="flex gap-2">
                    {role === 'client' && <Button variant={view === 'drafts' ? 'default' : 'outline'} onClick={() => setView('drafts')}>Drafts</Button>}
                    <Button variant={view === 'active' ? 'default' : 'outline'} onClick={() => setView('active')}>Active</Button>
                    <Button variant={view === 'upcoming' ? 'default' : 'outline'} onClick={() => setView('upcoming')}>
                        {role === 'inspector' ? 'Upcoming' : 'Pending'}
                    </Button>
                    <Button variant={view === 'completed' ? 'default' : 'outline'} onClick={() => setView('completed')}>Completed</Button>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b">
                {role === 'inspector' && uniqueClients.length > 0 && (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full sm:w-auto">
                                <Filter className="mr-2 h-4 w-4 text-primary" />
                                Client ({selectedClients.length})
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64">
                             <div className="grid gap-4">
                                <div className="space-y-2"><h4 className="font-medium leading-none">Filter by Client</h4></div>
                                <div className="grid gap-2">
                                    {uniqueClients.map(clientName => (
                                        <div key={clientName} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`client-${clientName.replace(/\s+/g, '-')}`}
                                                checked={selectedClients.includes(clientName)}
                                                onCheckedChange={() => handleClientChange(clientName)}
                                            />
                                            <Label htmlFor={`client-${clientName.replace(/\s+/g, '-')}`}>{clientName}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                )}
                 {role === 'client' && uniqueProviders.length > 0 && (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full sm:w-auto">
                                <Filter className="mr-2 h-4 w-4 text-primary" />
                                Provider ({selectedProviders.length})
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64">
                             <div className="grid gap-4">
                                <div className="space-y-2"><h4 className="font-medium leading-none">Filter by Provider</h4></div>
                                <div className="grid gap-2">
                                    {uniqueProviders.map(provider => (
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
                )}
                <div className="flex items-center space-x-2">
                    <Checkbox id="audit-filter" checked={auditFilter} onCheckedChange={(checked) => setAuditFilter(checked as boolean)} />
                    <Label htmlFor="audit-filter" className="whitespace-nowrap">Requires Audit</Label>
                </div>
            </div>

            {hasActiveFilters && (
                <div className="mb-4 flex items-center flex-wrap gap-2">
                    <span className="text-sm font-medium">Active Filters:</span>
                    {selectedClients.map(clientName => (
                        <Badge key={clientName} variant="secondary">
                            Client: {clientName}
                            <button onClick={() => handleClientChange(clientName)} className="ml-1.5 rounded-full hover:bg-muted-foreground/20 p-0.5">
                                <X className="h-3 w-3 text-primary" />
                            </button>
                        </Badge>
                    ))}
                    {selectedProviders.map(providerId => (
                        <Badge key={providerId} variant="secondary">
                            Provider: {allCompanies?.find(p => p.id === providerId)?.name}
                            <button onClick={() => handleProviderChange(providerId)} className="ml-1.5 rounded-full hover:bg-muted-foreground/20 p-0.5">
                                <X className="h-3 w-3 text-primary" />
                            </button>
                        </Badge>
                    ))}
                    {auditFilter && (
                        <Badge variant="secondary">
                            Requires Audit
                            <button onClick={() => setAuditFilter(false)} className="ml-1.5 rounded-full hover:bg-muted-foreground/20 p-0.5">
                                <X className="h-3 w-3 text-primary" />
                            </button>
                        </Badge>
                    )}
                    <Button variant="ghost" size="sm" onClick={clearFilters}>Clear All</Button>
                </div>
            )}
             
            {displayedJobs.length > 0 ? (
                 <div className="space-y-8">
                    {Object.entries(jobsByMonth).map(([month, jobs]) => (
                        <div key={month}>
                            <h2 className="font-semibold text-lg mb-4 pl-4">{month}</h2>
                            <div className="space-y-4">
                                {jobs.map(job => {
                                    const jobDate = safeParseDate(job.scheduledStartDate || job.postedDate);
                                    if (!jobDate) return null;
                                    const provider = allCompanies?.find(p => p.id === job.providerCompanyId);
                                    return (
                                        <Card key={job.id} className="mx-auto w-full transition-shadow hover:shadow-md">
                                            <div className="flex items-stretch">
                                                <div className="flex flex-col items-center justify-center p-4 border-r text-center w-24">
                                                    <p className="text-sm font-semibold text-muted-foreground">{format(jobDate, 'EEE')}</p>
                                                    <p className="text-3xl font-bold">{format(jobDate, 'dd')}</p>
                                                </div>
                                                <div className="flex-1 p-4">
                                                    <div className="flex justify-between items-start">
                                                        <Link href={constructUrl(`/dashboard/my-jobs/${job.id}`)}>
                                                            <CardTitle className="font-semibold text-lg hover:underline">{job.title}</CardTitle>
                                                        </Link>
                                                        <Badge variant={jobStatusVariants[job.status]}>{job.status}</Badge>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground mt-2 space-y-1">
                                                        <p className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-primary" />{job.location}</p>
                                                        {role === 'inspector' && <p className="flex items-center"><Building className="w-4 h-4 mr-2 text-primary" />{job.client}</p>}
                                                        {role === 'client' && provider && <p className="flex items-center"><HardHat className="w-4 h-4 mr-2 text-primary" />{provider.name}</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                 </div>
            ) : (
                 <div className="text-center p-10 border rounded-lg">
                    <Icon className="mx-auto h-12 w-12 text-primary" />
                    <h2 className="mt-4 text-xl font-headline">No {view} jobs</h2>
                    <p className="mt-2 text-muted-foreground">You don't have any jobs currently in this category or matching your filters.</p>
                     <div className="mt-4 space-y-1 text-sm">
                        {role === 'client' && view !== 'drafts' && jobsByCategory.drafts.length > 0 && (
                            <p>You have {jobsByCategory.drafts.length} job(s) in the <Button variant="link" className="p-0 h-auto" onClick={() => setView('drafts')}>Drafts</Button> tab.</p>
                        )}
                        {view !== 'completed' && jobsByCategory.completed.length > 0 && (
                            <p>You have {jobsByCategory.completed.length} job(s) in the <Button variant="link" className="p-0 h-auto" onClick={() => setView('completed')}>Completed</Button> tab.</p>
                        )}
                        {view !== 'active' && jobsByCategory.active.length > 0 && (
                            <p>You have {jobsByCategory.active.length} job(s) in the <Button variant="link" className="p-0 h-auto" onClick={() => setView('active')}>Active</Button> tab.</p>
                        )}
                        {view !== 'upcoming' && jobsByCategory.upcoming.length > 0 && (
                            <p>You have {jobsByCategory.upcoming.length} job(s) in the <Button variant="link" className="p-0 h-auto" onClick={() => setView('upcoming')}>Upcoming</Button> tab.</p>
                        )}
                    </div>
                     {getEmptyStateAction()}
                </div>
            )}
        </div>
    );
}
    
    


    
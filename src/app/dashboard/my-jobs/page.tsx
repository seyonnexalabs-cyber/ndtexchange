'use client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { jobs, allUsers, inspectorAssets, clientData, Job } from "@/lib/placeholder-data";
import { serviceProviders } from "@/lib/service-providers-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, CheckCircle, MapPin, Users, Wrench, Calendar, User, SlidersHorizontal, RadioTower, History, Award, AlarmClock, PlusCircle, Filter, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useMemo } from "react";
import { cn, GLOBAL_DATE_FORMAT } from "@/lib/utils";
import { format, isToday } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";


const equipmentIcons: { [key: string]: React.ReactNode } = {
    'UT': <RadioTower className="w-4 h-4 text-muted-foreground" />,
    'PAUT': <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />,
    'MT': <Wrench className="w-4 h-4 text-muted-foreground" />,
    'Calibration': <Wrench className="w-4 h-4 text-muted-foreground" />,
};

type JobView = 'active' | 'completed' | 'upcoming';

export default function MyJobsPage() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'client';
    const [view, setView] = useState<JobView>('active');

    // New state for filters
    const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
    const [selectedClients, setSelectedClients] = useState<string[]>([]);
    const [auditFilter, setAuditFilter] = useState(false);

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

    const { displayedJobs, title, Icon } = useMemo(() => {
        let jobsToShow: Job[] = [];
        let pageTitle = '';
        let PageIcon: React.ElementType = Briefcase;
        
        // This logic assumes the inspector is from provider-03 and the client is Global Energy Corp for demonstration
        let relevantJobs = role === 'inspector' 
            ? jobs.filter(j => j.providerId === 'provider-03' && ['In Progress', 'Completed', 'Assigned', 'Scheduled', 'Report Submitted', 'Under Audit', 'Audit Approved', 'Paid'].includes(j.status))
            : jobs.filter(j => j.client === 'Global Energy Corp.');

        switch(view) {
            case 'active':
                jobsToShow = relevantJobs.filter(job => job.status === 'In Progress');
                pageTitle = 'Active Jobs';
                PageIcon = CheckCircle;
                break;
            case 'completed':
                jobsToShow = relevantJobs.filter(job => ['Completed', 'Paid'].includes(job.status));
                pageTitle = 'Completed Jobs';
                PageIcon = History;
                break;
            case 'upcoming':
                jobsToShow = relevantJobs.filter(job => role === 'inspector' ? ['Assigned', 'Scheduled'].includes(job.status) : ['Posted', 'Assigned', 'Scheduled'].includes(job.status));
                pageTitle = role === 'inspector' ? 'Upcoming Jobs' : 'Pending & Upcoming';
                PageIcon = Award;
                break;
        }

        // Apply new filters
        const filtered = jobsToShow.filter(job => {
            const providerMatch = selectedProviders.length === 0 || (job.providerId && selectedProviders.includes(job.providerId));
            const clientMatch = selectedClients.length === 0 || selectedClients.includes(job.client);
            const auditMatch = !auditFilter || (job.workflow === 'level3' || job.workflow === 'auto');
            return providerMatch && clientMatch && auditMatch;
        });

        return { displayedJobs: filtered, title: pageTitle, Icon: PageIcon };
    }, [view, role, selectedProviders, selectedClients, auditFilter]);

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

     // Handlers for filters
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


    // Grouping logic
    const groupedJobs = useMemo(() => {
        if (displayedJobs.length === 0) return null;

        if (role === 'client') {
            return displayedJobs.reduce((acc, job) => {
                const provider = serviceProviders.find(p => p.id === job.providerId);
                const groupName = provider ? provider.name : 'Unassigned / Pending Bids';
                if (!acc[groupName]) acc[groupName] = [];
                acc[groupName].push(job);
                return acc;
            }, {} as Record<string, Job[]>);
        }

        if (role === 'inspector') {
            return displayedJobs.reduce((acc, job) => {
                const groupName = job.client;
                if (!acc[groupName]) acc[groupName] = [];
                acc[groupName].push(job);
                return acc;
            }, {} as Record<string, Job[]>);
        }

        return { 'All Jobs': displayedJobs };
    }, [displayedJobs, role]);

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
        if (role !== 'inspector') return [];
        const clients = new Set(jobs.filter(j => j.providerId === 'provider-03').map(j => j.client));
        return Array.from(clients);
    }, [role]);

    const uniqueProviders = useMemo(() => {
        if (role !== 'client') return [];
        const providerIds = new Set(jobs.filter(j => j.client === 'Global Energy Corp.' && j.providerId).map(j => j.providerId!));
        return serviceProviders.filter(p => providerIds.has(p.id));
    }, [role]);

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <Briefcase />
                    My Jobs
                </h1>
                <div className="flex gap-2">
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
                                <Filter className="mr-2 h-4 w-4" />
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
                                <Filter className="mr-2 h-4 w-4" />
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
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                    {selectedProviders.map(providerId => (
                        <Badge key={providerId} variant="secondary">
                            Provider: {serviceProviders.find(p => p.id === providerId)?.name}
                            <button onClick={() => handleProviderChange(providerId)} className="ml-1.5 rounded-full hover:bg-muted-foreground/20 p-0.5">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                    {auditFilter && (
                        <Badge variant="secondary">
                            Requires Audit
                            <button onClick={() => setAuditFilter(false)} className="ml-1.5 rounded-full hover:bg-muted-foreground/20 p-0.5">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                    <Button variant="ghost" size="sm" onClick={clearFilters}>Clear All</Button>
                </div>
            )}
             
            {groupedJobs ? (
                <div className="space-y-8">
                    {Object.entries(groupedJobs).map(([groupName, jobsInGroup]) => (
                        <div key={groupName}>
                            <h2 className="text-xl font-semibold mb-4 text-primary">{groupName}</h2>
                            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                                {jobsInGroup.map(job => {
                                    const assignedTechnicians = allUsers.filter(t => t.role === 'Inspector' && job.technicianIds?.includes(t.id));
                                    const assignedEquipment = inspectorAssets.filter(e => job.equipmentIds?.includes(e.id));
                                    const isOverdue = job.scheduledStartDate && new Date(job.scheduledStartDate) < new Date() && !['Completed', 'Paid'].includes(job.status);
            
                                    return (
                                        <Card key={job.id}>
                                            <CardHeader>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <CardTitle className="font-headline text-xl">{job.title}</CardTitle>
                                                        <p className="text-xs text-muted-foreground font-bold">{job.id}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        {isOverdue && <Badge variant="destructive" className="gap-1.5"><AlarmClock className="w-3.5 h-3.5"/> Overdue</Badge>}
                                                        <Badge variant={jobStatusVariants[job.status]}>{job.status}</Badge>
                                                    </div>
                                                </div>
                                                <CardDescription>{job.client} - {job.technique}</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <MapPin className="w-4 h-4 mr-2" />
                                                    <span>{job.location}</span>
                                                </div>
                                                 <div className="flex items-center text-sm text-muted-foreground">
                                                    <Calendar className="w-4 h-4 mr-2" />
                                                    <span>Posted: {format(new Date(job.postedDate), GLOBAL_DATE_FORMAT)}</span>
                                                    {isToday(new Date(job.postedDate)) && <Badge className="ml-2">Today</Badge>}
                                                </div>
                                                 {job.bidExpiryDate && (
                                                    <div className="flex items-center text-sm text-muted-foreground">
                                                        <AlarmClock className="w-4 h-4 mr-2" />
                                                        <span>Bids Expire: {format(new Date(job.bidExpiryDate), GLOBAL_DATE_FORMAT)}</span>
                                                        {isToday(new Date(job.bidExpiryDate)) && <Badge className="ml-2">Today</Badge>}
                                                    </div>
                                                )}
                                                {job.scheduledStartDate && (
                                                    <div className={cn("flex items-center text-sm", isOverdue ? "text-destructive font-medium" : "text-muted-foreground")}>
                                                        <Calendar className="w-4 h-4 mr-2" />
                                                        <span>Inspection: {format(new Date(job.scheduledStartDate), GLOBAL_DATE_FORMAT)}{job.scheduledEndDate && job.scheduledEndDate !== job.scheduledStartDate ? ` to ${format(new Date(job.scheduledEndDate), GLOBAL_DATE_FORMAT)}` : ''}</span>
                                                        {isToday(new Date(job.scheduledStartDate)) && <Badge className="ml-2">Today</Badge>}
                                                    </div>
                                                )}
            
                                                {(view === 'active' || view === 'upcoming') && role === 'inspector' && (
                                                    <>
                                                        <div>
                                                            <h4 className="font-semibold flex items-center gap-2 mb-2"><Users className="w-4 h-4" /> Assigned Technicians</h4>
                                                            {assignedTechnicians.length > 0 ? (
                                                                <div className="flex flex-wrap gap-2">
                                                                    {assignedTechnicians.map(tech => (
                                                                        <Badge key={tech.id} variant="secondary" className="flex items-center gap-1.5 pl-1.5">
                                                                            <User className="w-3 h-3"/>
                                                                            {tech.name}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            ) : <p className="text-xs text-muted-foreground">No technicians assigned yet.</p>}
                                                        </div>
            
                                                         <div>
                                                            <h4 className="font-semibold flex items-center gap-2 mb-2"><Wrench className="w-4 h-4"/> Assigned Equipment</h4>
                                                             {assignedEquipment.length > 0 ? (
                                                                <div className="flex flex-wrap gap-2">
                                                                    {assignedEquipment.map(equip => (
                                                                         <Badge key={equip.id} variant="secondary" className="flex items-center gap-1.5 pl-1.5">
                                                                            {equipmentIcons[equip.techniques[0] as keyof typeof equipmentIcons] || <Wrench className="w-3 h-3"/>}
                                                                            {equip.name}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            ) : <p className="text-xs text-muted-foreground">No equipment assigned yet.</p>}
                                                        </div>
                                                    </>
                                                )}
                                            </CardContent>
                                            <CardFooter>
                                                <Button asChild>
                                                    <Link href={constructUrl(`/dashboard/my-jobs/${job.id}`)}>View Job Details</Link>
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                 <div className="text-center p-10 border rounded-lg">
                    <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h2 className="mt-4 text-xl font-headline">No {view} jobs</h2>
                    <p className="mt-2 text-muted-foreground">You don't have any jobs currently in this category or matching your filters.</p>
                     {getEmptyStateAction()}
                </div>
            )}
        </div>
    );
}

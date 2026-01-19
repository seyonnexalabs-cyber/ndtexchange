'use client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { jobs, technicians, inspectorAssets } from "@/lib/placeholder-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Calendar, AlarmClock, Filter, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { serviceProviders } from "@/lib/service-providers-data";


const statusFilters = ['Posted', 'Assigned', 'Scheduled', 'In Progress', 'Report Submitted', 'Under Audit', 'Audit Approved', 'Client Review', 'Client Approved', 'Completed', 'Paid'];

export default function AllJobsPage() {
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    
    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const filteredJobs = useMemo(() => {
        return jobs.filter(job => {
            const searchMatch = !searchQuery ||
                job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.id.toLowerCase().includes(searchQuery.toLowerCase());
            
            const providerMatch = selectedProviders.length === 0 || (job.providerId && selectedProviders.includes(job.providerId));
            
            const statusMatch = statusFilter === 'all' || job.status === statusFilter;

            return searchMatch && providerMatch && statusMatch;
        });
    }, [searchQuery, selectedProviders, statusFilter]);

    const handleProviderChange = (providerId: string) => {
        setSelectedProviders(prev => prev.includes(providerId) ? prev.filter(id => id !== providerId) : [...prev, providerId]);
    };
    
    const hasActiveFilters = searchQuery || selectedProviders.length > 0 || statusFilter !== 'all';

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <Briefcase />
                    All Jobs
                </h1>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <Input 
                    placeholder="Search by job title, client, or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-grow"
                />
                 <div className="flex gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full sm:w-auto">
                                <Filter className="mr-2 h-4 w-4" />
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
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {statusFilters.map(status => (
                                <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 </div>
            </div>

            {hasActiveFilters && (
                <div className="mb-4 flex items-center flex-wrap gap-2">
                    <span className="text-sm font-medium">Active Filters:</span>
                    {selectedProviders.map(providerId => (
                        <Badge key={providerId} variant="secondary">
                            {serviceProviders.find(p => p.id === providerId)?.name}
                            <button onClick={() => handleProviderChange(providerId)} className="ml-1.5 rounded-full hover:bg-muted-foreground/20 p-0.5">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                    {statusFilter !== 'all' && (
                        <Badge variant="secondary">
                            Status: {statusFilter}
                             <button onClick={() => setStatusFilter('all')} className="ml-1.5 rounded-full hover:bg-muted-foreground/20 p-0.5">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => { setSearchQuery(''); setSelectedProviders([]); setStatusFilter('all'); }}>Clear All</Button>
                </div>
            )}
            
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {filteredJobs.map(job => (
                    <Card key={job.id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="font-headline text-xl">{job.title}</CardTitle>
                                <Badge variant={job.status === 'Posted' ? 'secondary' : job.status === 'In Progress' ? 'default' : 'outline'}>{job.status}</Badge>
                            </div>
                            <CardDescription>{job.client} - {job.technique}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center text-sm text-muted-foreground">
                                <MapPin className="w-4 h-4 mr-2" />
                                <span>{job.location}</span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span>Posted: {job.postedDate}</span>
                            </div>
                            {job.bidExpiryDate && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <AlarmClock className="w-4 h-4 mr-2" />
                                    <span>Bids Expire: {job.bidExpiryDate}</span>
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

             {filteredJobs.length === 0 && (
                <div className="text-center p-10 border rounded-lg">
                    <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h2 className="mt-4 text-xl font-headline">No jobs found</h2>
                    <p className="mt-2 text-muted-foreground">There are no jobs matching your current filters.</p>
                </div>
            )}

        </div>
    );
}

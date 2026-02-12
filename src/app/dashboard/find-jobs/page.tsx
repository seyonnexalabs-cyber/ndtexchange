'use client';

import { useState, useMemo, useEffect } from 'react';
import { jobs as initialJobs, Job } from '@/lib/seed-data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, MapPin, Calendar, Gavel, Filter, Search as SearchIcon, X, AlarmClock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useSearch } from '@/app/components/layout/search-provider';
import { format, isToday } from 'date-fns';
import { GLOBAL_DATE_FORMAT } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { NDTTechniques as NDTTechniquesData } from '@/lib/ndt-techniques-data';

export default function FindJobsPage() {
    const [selectedTechniques, setSelectedTechniques] = useState<string[]>([]);
    const [locationFilter, setLocationFilter] = useState('');
    const { searchQuery } = useSearch();
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role');

    useEffect(() => {
        if (role && role !== 'inspector') {
            router.replace(`/dashboard?${searchParams.toString()}`);
        }
    }, [role, router, searchParams]);

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const filteredJobs = useMemo(() => {
        const openJobs = initialJobs.filter(j => j.status === 'Posted' || (j.status === 'Posted' && j.bidExpiryDate && new Date(j.bidExpiryDate) < new Date()));
        
        return openJobs.filter(job => {
            const searchMatch = !searchQuery || 
                job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.client.toLowerCase().includes(searchQuery.toLowerCase());

            const techniqueMatch = selectedTechniques.length === 0 || selectedTechniques.some(tech => (job.techniques || []).includes(tech));
            const locationMatch = !locationFilter || job.location.toLowerCase().includes(locationFilter.toLowerCase());

            return searchMatch && techniqueMatch && locationMatch;
        });
    }, [searchQuery, selectedTechniques, locationFilter]);


    if (role && role !== 'inspector') {
        return null;
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <SearchIcon className="text-primary" />
                    Find Jobs
                </h1>
                <div className="flex items-center gap-2">
                    <Input 
                        placeholder="Filter by location..." 
                        className="w-48"
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                    />
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Filter className="text-primary" />
                                Technique ({selectedTechniques.length})
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">Filter by Technique</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Select the techniques you are certified for.
                                    </p>
                                </div>
                                <div className="grid gap-2 max-h-60 overflow-y-auto p-1">
                                    {NDTTechniquesData.map(tech => (
                                        <div key={tech.id} className="flex items-center space-x-2">
                                                <Checkbox 
                                                id={`tech-${tech.id}`} 
                                                checked={selectedTechniques.includes(tech.id)}
                                                onCheckedChange={(checked) => {
                                                    setSelectedTechniques(prev => checked ? [...prev, tech.id] : prev.filter(t => t !== tech.id))
                                                }}
                                                />
                                            <Label htmlFor={`tech-${tech.id}`}>{tech.title} ({tech.id})</Label>
                                        </div>
                                    ))}
                                </div>
                                 <Button variant="ghost" size="sm" onClick={() => setSelectedTechniques([])} disabled={selectedTechniques.length === 0}>Clear Filters</Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {selectedTechniques.length > 0 && (
                <div className="mb-4 flex items-center flex-wrap gap-2">
                    <span className="text-sm font-medium">Active Technique Filters:</span>
                    {selectedTechniques.map(techId => (
                        <Badge key={techId} variant="secondary">
                            {NDTTechniquesData.find(t => t.id === techId)?.name}
                            <button onClick={() => setSelectedTechniques(p => p.filter(t => t !== techId))} className="ml-1.5 rounded-full hover:bg-muted-foreground/20 p-0.5">
                                <X className="h-3 w-3 text-primary" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
            
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {filteredJobs.map(job => {
                    const isExpired = job.bidExpiryDate && new Date(job.bidExpiryDate) < new Date();
                    return (
                    <Card key={job.id} className={isExpired ? 'bg-muted/50' : ''}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="font-headline text-xl">{job.title}</CardTitle>
                                    <p className="text-xs font-extrabold text-muted-foreground">{job.id}</p>
                                </div>
                                {isExpired ? (
                                    <Badge variant="destructive">Bidding Expired</Badge>
                                ) : (
                                    <div className="flex flex-wrap gap-1 justify-end">
                                      {(job.techniques || []).map(t => <Badge key={t}>{t}</Badge>)}
                                    </div>
                                )}
                            </div>
                            <CardDescription>Posted by {job.client}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center text-sm text-muted-foreground">
                                <MapPin className="w-4 h-4 mr-2 text-primary" />
                                <span>{job.location}</span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4 mr-2 text-primary" />
                                <span>Posted: {format(new Date(job.postedDate), GLOBAL_DATE_FORMAT)}</span>
                                {isToday(new Date(job.postedDate)) && <Badge className="ml-2">Today</Badge>}
                            </div>
                            {job.scheduledStartDate && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                                    <span>Target: {format(new Date(job.scheduledStartDate), GLOBAL_DATE_FORMAT)}{job.scheduledEndDate && job.scheduledEndDate !== job.scheduledStartDate ? ` to ${format(new Date(job.scheduledEndDate), GLOBAL_DATE_FORMAT)}` : ''}</span>
                                    {isToday(new Date(job.scheduledStartDate)) && <Badge className="ml-2">Today</Badge>}
                                </div>
                            )}
                            {job.bidExpiryDate && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <AlarmClock className="w-4 h-4 mr-2 text-primary" />
                                    <span>Bids Expire: {format(new Date(job.bidExpiryDate), GLOBAL_DATE_FORMAT)}</span>
                                    {isToday(new Date(job.bidExpiryDate)) && <Badge className="ml-2">Today</Badge>}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                           <Button asChild>
                                <Link href={constructUrl(`/dashboard/my-jobs/${job.id}`)}>
                                    <Gavel className="mr-2"/>
                                    {isExpired ? 'View Details' : 'View & Bid'}
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                )})}
            </div>

            {filteredJobs.length === 0 && (
                <div className="text-center p-10 border rounded-lg">
                    <Briefcase className="mx-auto h-12 w-12 text-primary" />
                    <h2 className="mt-4 text-xl font-headline">No Open Jobs</h2>
                    <p className="mt-2 text-muted-foreground">There are currently no new jobs matching your filters.</p>
                </div>
            )}
        </div>
    );
}
    

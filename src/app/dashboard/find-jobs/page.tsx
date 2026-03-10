

'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, MapPin, Calendar, Gavel, Filter, Search as SearchIcon, X, AlarmClock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useSearch } from '@/app/components/layout/search-provider';
import { format, isToday } from 'date-fns';
import { GLOBAL_DATE_FORMAT, safeParseDate } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Job, NDTTechnique } from '@/lib/types';

const ClientRelativeDateBadge = ({ date, className }: { date: Date | null, className?: string }) => {
    const [isTodayFlag, setIsTodayFlag] = useState(false);

    useEffect(() => {
        if (date) {
            setIsTodayFlag(isToday(date));
        } else {
            setIsTodayFlag(false);
        }
    }, [date]);

    if (!isTodayFlag) return null;

    return <Badge className={className}>Today</Badge>;
};

export default function FindJobsPage() {
    const [selectedTechniques, setSelectedTechniques] = useState<string[]>([]);
    const [locationFilter, setLocationFilter] = useState('');
    const { searchQuery } = useSearch();
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role');
    const { firestore, user } = useFirebase();

    const [clientSideFilteredJobs, setClientSideFilteredJobs] = useState<Job[]>([]);
    const [isMounted, setIsMounted] = useState(false);

    const jobsQuery = useMemoFirebase(() => (firestore && user) ? query(collection(firestore, 'jobs'), where('status', 'in', ['Posted'])) : null, [firestore, user]);
    const { data: jobs, isLoading: isLoadingJobs } = useCollection<Job>(jobsQuery);
    
    const techniquesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'techniques') : null, [firestore]);
    const { data: ndtTechniques, isLoading: isLoadingTechniques } = useCollection<NDTTechnique>(techniquesQuery);
    
    useEffect(() => {
        setIsMounted(true);
    }, []);


    useEffect(() => {
        if (role && role !== 'inspector') {
            router.replace(`/dashboard?${searchParams.toString()}`);
        }
    }, [role, router, searchParams]);

    useEffect(() => {
        if (!jobs) {
            setClientSideFilteredJobs([]);
            return;
        }

        const openJobs = jobs.filter(j => {
            const bidExpiry = safeParseDate(j.bidExpiryDate);
            if(isMounted) {
                return j.status === 'Posted' && (!bidExpiry || bidExpiry >= new Date());
            }
            // During SSR or initial hydration, be optimistic to avoid layout shifts.
            return j.status === 'Posted';
        });
        
        const fullyFiltered = openJobs.filter(job => {
            const searchMatch = !searchQuery || 
                job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.client.toLowerCase().includes(searchQuery.toLowerCase());

            const techniqueMatch = selectedTechniques.length === 0 || selectedTechniques.some(tech => (job.techniques || []).includes(tech));
            const locationMatch = !locationFilter || job.location.toLowerCase().includes(locationFilter.toLowerCase());

            return searchMatch && techniqueMatch && locationMatch;
        });

        setClientSideFilteredJobs(fullyFiltered);

    }, [jobs, searchQuery, selectedTechniques, locationFilter, isMounted]);


    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    if (role && role !== 'inspector') {
        return null;
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <SearchIcon className="text-primary" />
                    Find Projects
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
                                    {ndtTechniques?.map(tech => (
                                        <div key={tech.id} className="flex items-center space-x-2">
                                                <Checkbox 
                                                id={`tech-${tech.id}`} 
                                                checked={selectedTechniques.includes(tech.acronym)}
                                                onCheckedChange={(checked) => {
                                                    setSelectedTechniques(prev => checked ? [...prev, tech.acronym] : prev.filter(t => t !== tech.acronym))
                                                }}
                                                />
                                            <Label htmlFor={`tech-${tech.id}`}>{tech.title} ({tech.acronym})</Label>
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
                            {ndtTechniques?.find(t => t.acronym === techId)?.title}
                            <button onClick={() => setSelectedTechniques(p => p.filter(t => t !== techId))} className="ml-1.5 rounded-full hover:bg-muted-foreground/20 p-0.5">
                                <X className="h-3 w-3 text-primary" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
            
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {clientSideFilteredJobs.map(job => {
                    const postedDate = safeParseDate(job.postedDate);
                    const bidExpiryDate = safeParseDate(job.bidExpiryDate);
                    const scheduledStartDate = safeParseDate(job.scheduledStartDate);
                    const scheduledEndDate = safeParseDate(job.scheduledEndDate);
                    const isExpired = isMounted && bidExpiryDate && bidExpiryDate < new Date();
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
                                <span>Posted: {postedDate ? format(postedDate, GLOBAL_DATE_FORMAT) : 'N/A'}</span>
                                <ClientRelativeDateBadge date={postedDate} className="ml-2" />
                            </div>
                            {scheduledStartDate && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                                    <span>Target: {format(scheduledStartDate, GLOBAL_DATE_FORMAT)}{scheduledEndDate && scheduledEndDate.getTime() !== scheduledStartDate.getTime() ? ` to ${format(scheduledEndDate, GLOBAL_DATE_FORMAT)}` : ''}</span>
                                    <ClientRelativeDateBadge date={scheduledStartDate} className="ml-2" />
                                </div>
                            )}
                            {bidExpiryDate && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <AlarmClock className="w-4 h-4 mr-2 text-primary" />
                                    <span>Bids Expire: {format(bidExpiryDate, GLOBAL_DATE_FORMAT)}</span>
                                    <ClientRelativeDateBadge date={bidExpiryDate} className="ml-2" />
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

            {clientSideFilteredJobs.length === 0 && (
                <div className="text-center p-10 border rounded-lg">
                    <Briefcase className="mx-auto h-12 w-12 text-primary" />
                    <h2 className="mt-4 text-xl font-headline">No Open Projects</h2>
                    <p className="mt-2 text-muted-foreground">There are currently no new projects matching your filters.</p>
                </div>
            )}
        </div>
    );
}

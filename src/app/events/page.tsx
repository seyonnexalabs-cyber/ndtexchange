'use client';

import * as React from 'react';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import HoneycombHero from '@/components/ui/honeycomb-hero';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ndtEvents, NDTEvent } from '@/lib/events-data';
import { format } from 'date-fns';
import { MapPin, Calendar } from 'lucide-react';

export default function EventsPage() {
    const [regionFilter, setRegionFilter] = React.useState('All');
    const [monthFilter, setMonthFilter] = React.useState('All');
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);
    
    const upcomingEvents = React.useMemo(() => {
        if (!isMounted) return []; // Prevent server/client mismatch on initial render
        const now = new Date();
        return ndtEvents
            .filter(event => new Date(event.date) >= now)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [isMounted]);

    const filteredEvents = React.useMemo(() => {
        return upcomingEvents.filter(event => {
            const regionMatch = regionFilter === 'All' || event.region === regionFilter;
            const monthMatch = monthFilter === 'All' || format(new Date(event.date), 'MMMM') === monthFilter;
            return regionMatch && monthMatch;
        });
    }, [upcomingEvents, regionFilter, monthFilter]);

    const uniqueRegions = ['All', ...Array.from(new Set(upcomingEvents.map(e => e.region)))];
    const uniqueMonths = ['All', ...Array.from(new Set(upcomingEvents.map(e => format(new Date(e.date), 'MMMM'))))];

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <PublicHeader />
            <main className="flex-grow">
                <HoneycombHero>
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">
                            NDT Events Worldwide
                        </h1>
                        <p className="mt-6 text-lg md:text-xl text-muted-foreground">
                            Explore upcoming conferences, exhibitions, and training courses for the Non-Destructive Testing industry.
                        </p>
                    </div>
                </HoneycombHero>
                
                <section className="py-8 md:py-12">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                         <div className="flex flex-col sm:flex-row gap-4 mb-8 p-4 bg-muted/50 border rounded-lg justify-center">
                            <Select value={regionFilter} onValueChange={setRegionFilter}>
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <SelectValue placeholder="Filter by region..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {uniqueRegions.map(region => (
                                        <SelectItem key={region} value={region}>{region}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={monthFilter} onValueChange={setMonthFilter}>
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <SelectValue placeholder="Filter by month..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {uniqueMonths.map(month => (
                                        <SelectItem key={month} value={month}>{month}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredEvents.map(event => (
                                <Card key={event.id} className="flex flex-col group overflow-hidden">
                                    <Link href={event.url} target="_blank" rel="noopener noreferrer" className="flex flex-col flex-grow">
                                        <CardHeader className="p-0">
                                            <div className="relative aspect-video bg-muted overflow-hidden">
                                                <Image src={event.imageUrl} alt={event.title} fill className="object-cover group-hover:scale-105 transition-transform" data-ai-hint={event.imageHint} />
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-4 flex-grow">
                                            <Badge variant="secondary" className="mb-2">{event.region}</Badge>
                                            <CardTitle className="font-headline text-lg group-hover:text-primary transition-colors">{event.title}</CardTitle>
                                            <CardDescription className="mt-2 text-sm">{event.description}</CardDescription>
                                        </CardContent>
                                        <CardFooter className="p-4 pt-0 text-sm font-semibold text-muted-foreground flex flex-col items-start gap-2">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-primary" />
                                                <span>{format(new Date(event.date), 'PPP')}</span>
                                            </div>
                                             <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-primary" />
                                                <span>{event.location}</span>
                                            </div>
                                        </CardFooter>
                                    </Link>
                                </Card>
                            ))}
                        </div>
                         {filteredEvents.length === 0 && (
                            <div className="text-center py-16">
                                <h3 className="text-xl font-semibold">No Upcoming Events</h3>
                                <p className="text-muted-foreground mt-2">There are no upcoming events matching your selected filters.</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <PublicFooter />
        </div>
    );
}
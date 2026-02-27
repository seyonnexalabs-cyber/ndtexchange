
'use client';

import * as React from 'react';
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Calendar, MapPin, ExternalLink, Filter, X } from 'lucide-react';
import Link from 'next/link';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import HoneycombHero from '@/components/ui/honeycomb-hero';
import { NDTEvent, ndtEvents } from '@/lib/events-data';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useMemo, useState } from 'react';

// export const metadata: Metadata = { // Can't be used in a Client Component
//   title: 'NDT Events Worldwide',
//   description: 'Explore upcoming conferences, exhibitions, and training for the Non-Destructive Testing industry.',
// };

const EventCard = ({ event }: { event: NDTEvent }) => {
    const startDate = parseISO(event.startDate);
    const endDate = parseISO(event.endDate);

    let dateString = format(startDate, 'dd MMM yyyy');
    if (format(startDate, 'yyyy-MM-dd') !== format(endDate, 'yyyy-MM-dd')) {
        if (startDate.getMonth() === endDate.getMonth()) {
            dateString = `${format(startDate, 'dd')} - ${format(endDate, 'dd MMM yyyy')}`;
        } else {
            dateString = `${format(startDate, 'dd MMM')} - ${format(endDate, 'dd MMM yyyy')}`;
        }
    }
    
    return (
        <Card className="flex flex-col group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
            <a href={event.website} target="_blank" rel="noopener noreferrer" className="flex flex-col flex-grow">
                <CardHeader className="p-0">
                    <div className="relative aspect-[16/9] bg-muted overflow-hidden">
                        <Image src={event.imageUrl} alt={event.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                </CardHeader>
                <CardContent className="p-4 flex-grow">
                    <Badge variant="secondary" className="mb-2">{event.organizer}</Badge>
                    <CardTitle className="font-headline text-lg leading-snug group-hover:text-primary transition-colors">{event.title}</CardTitle>
                    <p className="mt-2 text-sm text-muted-foreground">{event.description}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex-col items-start gap-2">
                    <div className="flex items-center text-sm font-semibold text-primary">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{dateString}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{event.city}, {event.country}</span>
                    </div>
                </CardFooter>
            </a>
        </Card>
    );
};


export default function EventsPage() {
    const [regionFilter, setRegionFilter] = useState('all');
    const [monthFilter, setMonthFilter] = useState('all');
    
    const uniqueRegions = useMemo(() => ['all', ...Array.from(new Set(ndtEvents.map(e => e.region)))], []);
    const uniqueMonths = useMemo(() => {
        const months = new Set(ndtEvents.map(e => format(parseISO(e.startDate), 'yyyy-MM')));
        return ['all', ...Array.from(months)].sort((a, b) => a.localeCompare(b));
    }, []);

    const filteredEvents = useMemo(() => {
        return ndtEvents.filter(event => {
            const regionMatch = regionFilter === 'all' || event.region === regionFilter;
            const monthMatch = monthFilter === 'all' || format(parseISO(event.startDate), 'yyyy-MM') === monthFilter;
            return regionMatch && monthMatch;
        }).sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    }, [regionFilter, monthFilter]);

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
                
                <section className="py-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <Card className="p-4 mb-12 bg-card">
                            <div className="flex flex-wrap items-center justify-center gap-4">
                                 <div className="flex items-center gap-2">
                                    <Filter className="w-5 h-5 text-primary" />
                                    <span className="font-semibold">Filter by:</span>
                                </div>
                                <Select value={regionFilter} onValueChange={setRegionFilter}>
                                    <SelectTrigger className="w-full sm:w-[180px]">
                                        <SelectValue placeholder="Region" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {uniqueRegions.map(region => (
                                            <SelectItem key={region} value={region}>{region === 'all' ? 'All Regions' : region}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={monthFilter} onValueChange={setMonthFilter}>
                                    <SelectTrigger className="w-full sm:w-[180px]">
                                        <SelectValue placeholder="Month" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {uniqueMonths.map(month => (
                                            <SelectItem key={month} value={month}>{month === 'all' ? 'All Months' : format(parseISO(`${month}-01`), 'MMMM yyyy')}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {(regionFilter !== 'all' || monthFilter !== 'all') && (
                                    <Button variant="ghost" onClick={() => { setRegionFilter('all'); setMonthFilter('all'); }}>
                                        <X className="mr-2 h-4 w-4" /> Clear
                                    </Button>
                                )}
                            </div>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredEvents.length > 0 ? (
                                filteredEvents.map(event => <EventCard key={event.id} event={event} />)
                            ) : (
                                <div className="md:col-span-2 lg:col-span-3 text-center py-10">
                                    <p className="text-lg text-muted-foreground">No events found for the selected filters.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>
            <PublicFooter />
        </div>
    );
}



'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { format, startOfWeek, addDays, subDays, isSameDay } from 'date-fns';
import { jobs } from '@/lib/placeholder-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Briefcase, Calendar as CalendarIcon } from 'lucide-react';
import Link from 'next/link';

type CalendarEvent = {
  id: string;
  title: string;
  date: Date;
  type: 'job';
  role: 'client' | 'inspector' | 'admin' | 'auditor';
  data: any;
};

const JobCard = ({ event, constructUrl }: { event: CalendarEvent, constructUrl: (base: string) => string }) => {
  return (
    <Link href={constructUrl(`/dashboard/my-jobs/${event.id}`)} className="block">
        <Card className="p-3 bg-card hover:bg-muted/50 transition-colors">
            <div className="flex justify-between items-start">
                <p className="font-semibold text-sm leading-tight">{event.title}</p>
                <Badge variant={event.data.status === 'Posted' ? 'secondary' : 'default'}>{event.data.status}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{event.data.technique}</p>
        </Card>
    </Link>
  );
};


export default function CalendarPage() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'client';
    const [currentDate, setCurrentDate] = useState(new Date());

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const events: CalendarEvent[] = useMemo(() => {
        return jobs
            .filter(job => {
                if (role === 'client') {
                    return job.client === 'Global Energy Corp.'; // Assuming a static client for demo
                }
                if (role === 'inspector') {
                    // Show assigned or jobs they bid on
                    return job.technicianIds?.length || ['JOB-001', 'JOB-005'].includes(job.id);
                }
                return true; // Admin/Auditor see all
            })
            .map(job => ({
                id: job.id,
                title: job.title,
                date: new Date(job.postedDate),
                type: 'job',
                role,
                data: job
            }));
    }, [role]);

    const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(start, i));

    const goToNextWeek = () => setCurrentDate(addDays(currentDate, 7));
    const goToPreviousWeek = () => setCurrentDate(subDays(currentDate, 7));
    const goToToday = () => setCurrentDate(new Date());

    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <CalendarIcon />
                    Job Scheduler
                </h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={goToPreviousWeek}>
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>
                    <Button variant="outline" onClick={goToToday} className="hidden sm:block">
                        Today
                    </Button>
                    <Button variant="outline" onClick={goToNextWeek}>
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-7 flex-grow border-t border-l">
                {weekDays.map(day => {
                    const dayEvents = events.filter(event => isSameDay(event.date, day));
                    return (
                        <div key={day.toISOString()} className="border-b border-r min-h-[150px] flex flex-col">
                            <div className="p-2 border-b">
                                <span className="font-semibold text-sm">{format(day, 'EEE')}</span>
                                <span className="ml-2 text-muted-foreground text-sm">{format(day, 'd')}</span>
                            </div>
                            <div className="p-2 space-y-2 flex-grow overflow-y-auto">
                                {dayEvents.length > 0 ? (
                                    dayEvents.map(event => (
                                        <JobCard key={event.id} event={event} constructUrl={constructUrl} />
                                    ))
                                ) : (
                                    <div className="h-full w-full"></div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}



'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { jobs } from '@/lib/placeholder-data';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Briefcase, MapPin, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { addDays, startOfWeek, format, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import Link from 'next/link';


type CalendarEvent = {
  id: string;
  title: string;
  date: Date;
  type: 'job';
  role: 'client' | 'inspector' | 'admin' | 'auditor';
  data: any;
};

export default function CalendarPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const role = searchParams.get('role') || 'client';
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

    const events: CalendarEvent[] = useMemo(() => {
        return jobs
            .filter(job => job.scheduledDate)
            .filter(job => {
                if (role === 'client') return job.client === 'Global Energy Corp.';
                if (role === 'inspector') return !!job.technicianIds?.length;
                return true;
            })
            .map(job => ({
                id: job.id,
                title: job.title,
                date: new Date(job.scheduledDate as string),
                type: 'job',
                role,
                data: job
            }));
    }, [role]);

    const weekStartsOn = 0; // Sunday
    const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn });

    const weekDays = useMemo(() => {
        return Array.from({ length: 7 }).map((_, i) => addDays(startOfCurrentWeek, i));
    }, [startOfCurrentWeek]);

    const eventsByDate = useMemo(() => {
        return events.reduce((acc, event) => {
            const dateKey = format(event.date, 'yyyy-MM-dd');
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push(event);
            return acc;
        }, {} as Record<string, CalendarEvent[]>);
    }, [events]);
    
    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <Briefcase />
                    Job Schedule
                </h1>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" onClick={() => setCurrentDate(subWeeks(currentDate, 1))}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                         <Button variant="outline" size="icon" onClick={() => setCurrentDate(addWeeks(currentDate, 1))}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button variant="outline" onClick={() => setCurrentDate(new Date())}>Today</Button>
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-[200px] justify-start text-left font-normal",
                                    !currentDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {currentDate ? format(currentDate, "MMMM yyyy") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={currentDate}
                                onSelect={(day) => day && setCurrentDate(day)}
                                captionLayout="dropdown"
                                initialFocus
                                className="rounded-md border shadow-sm"
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            <div className="flex-grow grid grid-cols-1 md:grid-cols-7 border-t border-l">
                {weekDays.map(day => (
                    <div key={day.toString()} className="border-b border-r p-2 flex flex-col min-h-[120px]">
                        <div className={`font-semibold text-center mb-2 ${isSameDay(day, new Date()) ? 'text-primary' : ''}`}>
                            <p className="text-sm">{format(day, 'EEE')}</p>
                            <p className="text-2xl">{format(day, 'd')}</p>
                        </div>
                        <div className="flex-grow space-y-2 overflow-y-auto">
                           {eventsByDate[format(day, 'yyyy-MM-dd')]?.map(event => (
                               <Card key={event.id} className="bg-muted/50 p-2 cursor-pointer hover:bg-muted" onClick={() => setSelectedEvent(event)}>
                                   <p className="text-xs font-semibold truncate">{event.title}</p>
                                   <p className="text-xs text-muted-foreground">{event.data.technique}</p>
                                   <Badge variant="secondary" className="mt-1 text-[10px] py-0 px-1 h-auto">{event.data.status}</Badge>
                               </Card>
                           ))}
                        </div>
                    </div>
                ))}
            </div>

            <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
                <DialogContent>
                    {selectedEvent && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="font-headline text-xl">{selectedEvent.data.title}</DialogTitle>
                                <DialogDescription>for {selectedEvent.data.client}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-3 text-muted-foreground" />
                                    <div>
                                        <p className="font-semibold">Status</p>
                                        <Badge>{selectedEvent.data.status}</Badge>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-3 text-muted-foreground" />
                                    <div>
                                        <p className="font-semibold">Location</p>
                                        <p className="text-muted-foreground">{selectedEvent.data.location}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <Briefcase className="w-4 h-4 mr-3 text-muted-foreground" />
                                    <div>
                                        <p className="font-semibold">Technique</p>
                                        <p className="text-muted-foreground">{selectedEvent.data.technique}</p>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setSelectedEvent(null)}>Close</Button>
                                <Button asChild>
                                    <Link href={constructUrl(`/dashboard/my-jobs/${selectedEvent.data.id}`)}>View Full Details</Link>
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

        </div>
    );
}

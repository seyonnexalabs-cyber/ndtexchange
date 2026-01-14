

'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { jobs } from '@/lib/placeholder-data';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { addDays, startOfWeek, format, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';


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
    const role = searchParams.get('role') || 'client';
    const [currentDate, setCurrentDate] = useState(new Date());

    const events: CalendarEvent[] = useMemo(() => {
        return jobs
            .filter(job => {
                if (role === 'client') return job.client === 'Global Energy Corp.';
                if (role === 'inspector') return job.technicianIds?.length;
                return true;
            })
            .map(job => ({
                id: job.id,
                title: job.title,
                date: addDays(new Date(job.postedDate), 7), // Demo: due 7 days after posting
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
                        <Button variant="outline" onClick={() => setCurrentDate(new Date())}>Today</Button>
                         <Button variant="outline" size="icon" onClick={() => setCurrentDate(addWeeks(currentDate, 1))}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
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
                                captionLayout="dropdown-buttons"
                                fromYear={new Date().getFullYear() - 5}
                                toYear={new Date().getFullYear() + 5}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            <div className="flex-grow grid grid-cols-1 md:grid-cols-7 border-t border-l">
                {weekDays.map(day => (
                    <div key={day.toString()} className="border-b border-r p-2 flex flex-col">
                        <div className={`font-semibold text-center mb-2 ${isSameDay(day, new Date()) ? 'text-primary' : ''}`}>
                            <p className="text-sm">{format(day, 'EEE')}</p>
                            <p className="text-2xl">{format(day, 'd')}</p>
                        </div>
                        <div className="flex-grow space-y-2 overflow-y-auto">
                           {eventsByDate[format(day, 'yyyy-MM-dd')]?.map(event => (
                               <Card key={event.id} className="bg-muted/50 p-2">
                                   <p className="text-xs font-semibold truncate">{event.title}</p>
                                   <p className="text-xs text-muted-foreground">{event.data.technique}</p>
                               </Card>
                           ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}



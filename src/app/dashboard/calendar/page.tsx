

'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { jobs } from '@/lib/placeholder-data';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';
import { format } from 'date-fns';

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
    const [date, setDate] = useState<Date | undefined>(new Date());

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


    const DayWithEvents = ({ date, ...props }: { date: Date } & React.HTMLAttributes<HTMLDivElement>) => {
        // This check is important because react-day-picker can pass undefined dates for empty cells
        if (!date) {
            return <div {...props}></div>;
        }

        const dateKey = format(date, 'yyyy-MM-dd');
        const dayEvents = eventsByDate[dateKey] || [];
        
        return (
            <div {...props}>
                <span>{format(date, 'd')}</span>
                <div className="mt-1 space-y-1">
                    {dayEvents.map((event, index) => (
                        <Badge 
                            key={`${event.id}-${index}`} 
                            variant="secondary"
                            className="block w-full text-left truncate text-xs p-1"
                        >
                            {event.title}
                        </Badge>
                    ))}
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col h-full">
             <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <Briefcase />
                    Job Calendar
                </h1>
            </div>
            <Card>
                <CardContent className="p-0 sm:p-2">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="w-full"
                        classNames={{
                            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                            month: "space-y-4 w-full",
                            table: "w-full border-collapse space-y-1",
                            head_row: "flex",
                            head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.8rem]",
                            row: "flex w-full mt-2",
                            cell: "h-24 w-full text-center text-sm p-1 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                            day: "h-full w-full p-2 font-normal flex flex-col items-start justify-start aria-selected:opacity-100 hover:bg-accent/50 rounded-md",
                            day_selected: "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                            day_today: "bg-accent/20 text-accent-foreground",
                            day_outside: "text-muted-foreground opacity-50",
                        }}
                        components={{
                            Day: DayWithEvents as any,
                        }}
                    />
                </CardContent>
            </Card>
        </div>
    );
}

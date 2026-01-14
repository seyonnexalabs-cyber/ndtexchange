
'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { jobs, technicians, inspectorAssets, Job, Technician, InspectorAsset } from '@/lib/placeholder-data';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Briefcase, MapPin, CheckCircle, Users, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { addDays, startOfWeek, format, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

type CalendarEvent = {
  id: string;
  title: string;
  date: Date;
  type: 'job' | 'technician' | 'equipment';
  isClash: boolean;
  data: Job | { resource: Technician | InspectorAsset; jobs: Job[] };
};

export default function CalendarPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const role = searchParams.get('role') || 'client';
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [activeTab, setActiveTab] = useState('jobs');

    const events: CalendarEvent[] = useMemo(() => {
        const scheduledJobs = jobs.filter(job => job.scheduledDate);

        if (activeTab === 'jobs') {
            return scheduledJobs
                .filter(job => {
                    if (role === 'client') return job.client === 'Global Energy Corp.';
                    if (role === 'inspector') return !!job.technicianIds?.length;
                    return true;
                })
                .map(job => ({
                    id: `job-${job.id}`,
                    title: job.title,
                    date: new Date(job.scheduledDate as string),
                    type: 'job',
                    isClash: false,
                    data: job,
                }));
        }

        if (activeTab === 'technicians') {
            const techSchedule: Record<string, { resource: Technician, jobs: Job[], date: Date }> = {};
            scheduledJobs.forEach(job => {
                job.technicianIds?.forEach(techId => {
                    const tech = technicians.find(t => t.id === techId);
                    if (tech) {
                        const key = `${tech.id}-${job.scheduledDate}`;
                        if (!techSchedule[key]) {
                            techSchedule[key] = { resource: tech, jobs: [], date: new Date(job.scheduledDate!) };
                        }
                        techSchedule[key].jobs.push(job);
                    }
                });
            });
            return Object.values(techSchedule).map(s => ({
                id: `tech-${s.resource.id}-${format(s.date, 'yyyy-MM-dd')}`,
                title: s.resource.name,
                date: s.date,
                type: 'technician',
                isClash: s.jobs.length > 1,
                data: { resource: s.resource, jobs: s.jobs },
            }));
        }

        if (activeTab === 'equipment') {
            const equipSchedule: Record<string, { resource: InspectorAsset, jobs: Job[], date: Date }> = {};
            scheduledJobs.forEach(job => {
                job.equipmentIds?.forEach(equipId => {
                    const equip = inspectorAssets.find(e => e.id === equipId);
                    if (equip) {
                        const key = `${equip.id}-${job.scheduledDate}`;
                        if (!equipSchedule[key]) {
                            equipSchedule[key] = { resource: equip, jobs: [], date: new Date(job.scheduledDate!) };
                        }
                        equipSchedule[key].jobs.push(job);
                    }
                });
            });
             return Object.values(equipSchedule).map(s => ({
                id: `equip-${s.resource.id}-${format(s.date, 'yyyy-MM-dd')}`,
                title: s.resource.name,
                date: s.date,
                type: 'equipment',
                isClash: s.jobs.length > 1,
                data: { resource: s.resource, jobs: s.jobs },
            }));
        }

        return [];
    }, [role, activeTab]);

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

    const renderEventCard = (event: CalendarEvent) => {
        let title = '';
        let details: React.ReactNode = null;
        let badgeText = '';

        if (event.type === 'job') {
            const job = event.data as Job;
            title = job.title;
            details = <p className="text-xs text-muted-foreground">{job.technique}</p>;
            badgeText = job.status;
        } else if (event.type === 'technician' || event.type === 'equipment') {
            const resourceData = event.data as { resource: Technician | InspectorAsset, jobs: Job[] };
            title = resourceData.resource.name;
            details = <p className="text-xs text-muted-foreground">{resourceData.jobs.map(j => j.title).join(', ')}</p>
            badgeText = `${resourceData.jobs.length} job(s)`;
        }

        return (
             <Card 
                key={event.id} 
                className={cn(
                    "bg-muted/50 p-2 cursor-pointer hover:bg-muted",
                    event.isClash && "border-destructive shadow-sm"
                )} 
                onClick={() => setSelectedEvent(event)}
            >
                <p className="text-xs font-semibold truncate">{title}</p>
                {details}
                <Badge variant={event.isClash ? "destructive" : "secondary"} className="mt-1 text-[10px] py-0 px-1 h-auto">{event.isClash ? "CLASH" : badgeText}</Badge>
            </Card>
        )
    };

    const renderDialogContent = () => {
        if (!selectedEvent) return null;

        if (selectedEvent.type === 'job') {
            const job = selectedEvent.data as Job;
            return (
                <>
                    <DialogHeader>
                        <DialogTitle className="font-headline text-xl">{job.title}</DialogTitle>
                        <DialogDescription>for {job.client}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-3 text-muted-foreground" />
                            <div>
                                <p className="font-semibold">Status</p>
                                <Badge>{job.status}</Badge>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-3 text-muted-foreground" />
                            <div>
                                <p className="font-semibold">Location</p>
                                <p className="text-muted-foreground">{job.location}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Briefcase className="w-4 h-4 mr-3 text-muted-foreground" />
                            <div>
                                <p className="font-semibold">Technique</p>
                                <p className="text-muted-foreground">{job.technique}</p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedEvent(null)}>Close</Button>
                        <Button asChild>
                            <Link href={constructUrl(`/dashboard/my-jobs/${job.id}`)}>View Full Details</Link>
                        </Button>
                    </DialogFooter>
                </>
            );
        } else {
             const resourceData = selectedEvent.data as { resource: Technician | InspectorAsset, jobs: Job[] };
             const resourceType = selectedEvent.type === 'technician' ? 'Technician' : 'Equipment';
             return (
                <>
                    <DialogHeader>
                        <DialogTitle className="font-headline text-xl">{resourceData.resource.name}</DialogTitle>
                        <DialogDescription>{resourceType} Schedule for {format(selectedEvent.date, 'PPP')}</DialogDescription>
                    </DialogHeader>
                    {selectedEvent.isClash && (
                        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm font-medium">
                            Scheduling conflict detected. This resource is assigned to multiple jobs on this day.
                        </div>
                    )}
                    <div className="space-y-4 py-4">
                       <h3 className="font-semibold">Assigned Jobs:</h3>
                        {resourceData.jobs.map(job => (
                            <Card key={job.id} className="p-3">
                                <p className="font-semibold">{job.title}</p>
                                <p className="text-sm text-muted-foreground">{job.location}</p>
                                <div className="mt-2 flex justify-end">
                                    <Button asChild variant="ghost" size="sm">
                                        <Link href={constructUrl(`/dashboard/my-jobs/${job.id}`)}>View Job</Link>
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                     <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedEvent(null)}>Close</Button>
                    </DialogFooter>
                </>
             )
        }
    };


    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <CalendarIcon />
                    Schedule
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

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="jobs" className="gap-2">
                        <Briefcase /> Jobs
                    </TabsTrigger>
                    <TabsTrigger value="technicians" className="gap-2">
                        <Users /> Technicians
                    </TabsTrigger>
                    <TabsTrigger value="equipment" className="gap-2">
                        <Wrench /> Equipment
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="jobs">
                    <div className="flex-grow grid grid-cols-1 md:grid-cols-7 border-t border-l">
                        {weekDays.map(day => (
                            <div key={day.toString()} className="border-b border-r p-2 flex flex-col min-h-[120px]">
                                <div className={`font-semibold text-center mb-2 ${isSameDay(day, new Date()) ? 'text-primary' : ''}`}>
                                    <p className="text-sm">{format(day, 'EEE')}</p>
                                    <p className="text-2xl">{format(day, 'd')}</p>
                                </div>
                                <div className="flex-grow space-y-2 overflow-y-auto">
                                {eventsByDate[format(day, 'yyyy-MM-dd')]?.map(renderEventCard)}
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>
                <TabsContent value="technicians">
                     <div className="flex-grow grid grid-cols-1 md:grid-cols-7 border-t border-l">
                        {weekDays.map(day => (
                            <div key={day.toString()} className="border-b border-r p-2 flex flex-col min-h-[120px]">
                                <div className={`font-semibold text-center mb-2 ${isSameDay(day, new Date()) ? 'text-primary' : ''}`}>
                                    <p className="text-sm">{format(day, 'EEE')}</p>
                                    <p className="text-2xl">{format(day, 'd')}</p>
                                </div>
                                <div className="flex-grow space-y-2 overflow-y-auto">
                                {eventsByDate[format(day, 'yyyy-MM-dd')]?.map(renderEventCard)}
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>
                <TabsContent value="equipment">
                    <div className="flex-grow grid grid-cols-1 md:grid-cols-7 border-t border-l">
                        {weekDays.map(day => (
                            <div key={day.toString()} className="border-b border-r p-2 flex flex-col min-h-[120px]">
                                <div className={`font-semibold text-center mb-2 ${isSameDay(day, new Date()) ? 'text-primary' : ''}`}>
                                    <p className="text-sm">{format(day, 'EEE')}</p>
                                    <p className="text-2xl">{format(day, 'd')}</p>
                                </div>
                                <div className="flex-grow space-y-2 overflow-y-auto">
                                {eventsByDate[format(day, 'yyyy-MM-dd')]?.map(renderEventCard)}
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>


            <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
                <DialogContent>
                    {renderDialogContent()}
                </DialogContent>
            </Dialog>

        </div>
    );
}

    
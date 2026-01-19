
'use client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { jobs, technicians, inspectorAssets, clientAssets, NDTTechniques, Job } from "@/lib/placeholder-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, CheckCircle, MapPin, Users, Wrench, Calendar, User, SlidersHorizontal, RadioTower, History, Award, AlarmClock, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";


const equipmentIcons = {
    'UT Equipment': <RadioTower className="w-4 h-4 text-muted-foreground" />,
    'PAUT Probe': <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />,
    'Yoke': <Wrench className="w-4 h-4 text-muted-foreground" />,
    'Calibration Block': <Wrench className="w-4 h-4 text-muted-foreground" />,
};

type JobView = 'active' | 'completed' | 'upcoming';

export default function MyJobsPage() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'client';
    const [view, setView] = useState<JobView>('active');

    const jobStatusVariants: Record<Job['status'], 'success' | 'default' | 'secondary' | 'destructive' | 'outline'> = {
        'Draft': 'outline',
        'Posted': 'secondary',
        'Assigned': 'default',
        'Scheduled': 'default',
        'In Progress': 'default',
        'Report Submitted': 'secondary',
        'Under Audit': 'secondary',
        'Audit Approved': 'success',
        'Client Review': 'secondary',
        'Client Approved': 'success',
        'Completed': 'success',
        'Paid': 'success'
    };

    const { displayedJobs, title, Icon } = useMemo(() => {
        let jobsToShow = [];
        let pageTitle = '';
        let PageIcon: React.ElementType = Briefcase;
        
        let relevantJobs = role === 'inspector' 
            ? jobs.filter(j => ['In Progress', 'Completed', 'Assigned', 'Scheduled', 'Report Submitted', 'Under Audit', 'Audit Approved', 'Paid'].includes(j.status))
            : jobs; 

        switch(view) {
            case 'active':
                jobsToShow = relevantJobs.filter(job => job.status === 'In Progress');
                pageTitle = 'Active Jobs';
                PageIcon = CheckCircle;
                break;
            case 'completed':
                jobsToShow = relevantJobs.filter(job => ['Completed', 'Paid'].includes(job.status));
                pageTitle = 'Completed Jobs';
                PageIcon = History;
                break;
            case 'upcoming':
                jobsToShow = relevantJobs.filter(job => role === 'inspector' ? ['Assigned', 'Scheduled'].includes(job.status) : ['Posted', 'Assigned', 'Scheduled'].includes(job.status));
                pageTitle = role === 'inspector' ? 'Upcoming Jobs' : 'Pending & Upcoming';
                PageIcon = Award;
                break;
        }
        return { displayedJobs: jobsToShow, title: pageTitle, Icon: PageIcon };
    }, [view, role]);

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const getEmptyStateAction = () => {
        if (role === 'client') {
            return (
                <Button asChild className="mt-4">
                    <Link href={constructUrl('/dashboard/my-jobs/post')}>
                        <PlusCircle className="mr-2" />
                        Post a Job
                    </Link>
                </Button>
            );
        }
        if (role === 'inspector' && view !== 'completed') {
             return (
                <Button asChild className="mt-4">
                    <Link href={constructUrl('/dashboard/find-jobs')}>Find a Job</Link>
                </Button>
            );
        }
        return null;
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <Briefcase />
                    My Jobs
                </h1>
                <div className="flex gap-2">
                    <Button variant={view === 'active' ? 'default' : 'outline'} onClick={() => setView('active')}>Active</Button>
                    <Button variant={view === 'upcoming' ? 'default' : 'outline'} onClick={() => setView('upcoming')}>
                        {role === 'inspector' ? 'Upcoming' : 'Pending'}
                    </Button>
                    <Button variant={view === 'completed' ? 'default' : 'outline'} onClick={() => setView('completed')}>Completed</Button>
                </div>
            </div>
             {displayedJobs.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    {displayedJobs.map(job => {
                        const assignedTechnicians = technicians.filter(t => job.technicianIds?.includes(t.id));
                        const assignedEquipment = inspectorAssets.filter(e => job.equipmentIds?.includes(e.id));
                        const isOverdue = job.scheduledStartDate && new Date(job.scheduledStartDate) < new Date() && !['Completed', 'Paid'].includes(job.status);

                        return (
                            <Card key={job.id}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="font-headline text-xl">{job.title}</CardTitle>
                                        <div className="flex items-center gap-2">
                                            {isOverdue && <Badge variant="destructive" className="gap-1.5"><AlarmClock className="w-3.5 h-3.5"/> Overdue</Badge>}
                                            <Badge variant={jobStatusVariants[job.status]}>{job.status}</Badge>
                                        </div>
                                    </div>
                                    <CardDescription>{job.client} - {job.technique}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
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
                                    {job.scheduledStartDate && (
                                        <div className={cn("flex items-center text-sm", isOverdue ? "text-destructive font-medium" : "text-muted-foreground")}>
                                            <Calendar className="w-4 h-4 mr-2" />
                                            <span>Inspection: {job.scheduledStartDate}{job.scheduledEndDate && job.scheduledEndDate !== job.scheduledStartDate ? ` to ${job.scheduledEndDate}` : ''}</span>
                                        </div>
                                    )}

                                    {(view === 'active' || view === 'upcoming') && (
                                        <>
                                            <div>
                                                <h4 className="font-semibold flex items-center gap-2 mb-2"><Users className="w-4 h-4" /> Assigned Technicians</h4>
                                                {assignedTechnicians.length > 0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {assignedTechnicians.map(tech => (
                                                            <Badge key={tech.id} variant="secondary" className="flex items-center gap-1.5 pl-1.5">
                                                                <User className="w-3 h-3"/>
                                                                {tech.name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                ) : <p className="text-xs text-muted-foreground">No technicians assigned yet.</p>}
                                            </div>

                                             <div>
                                                <h4 className="font-semibold flex items-center gap-2 mb-2"><Wrench className="w-4 h-4"/> Assigned Equipment</h4>
                                                 {assignedEquipment.length > 0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {assignedEquipment.map(equip => (
                                                             <Badge key={equip.id} variant="secondary" className="flex items-center gap-1.5 pl-1.5">
                                                                {equipmentIcons[equip.type as keyof typeof equipmentIcons] || <Wrench className="w-3 h-3"/>}
                                                                {equip.name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                ) : <p className="text-xs text-muted-foreground">No equipment assigned yet.</p>}
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                                <CardFooter>
                                    <Button asChild>
                                        <Link href={constructUrl(`/dashboard/my-jobs/${job.id}`)}>View Job Details</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            ) : (
                 <div className="text-center p-10 border rounded-lg">
                    <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h2 className="mt-4 text-xl font-headline">No {view} jobs</h2>
                    <p className="mt-2 text-muted-foreground">You don't have any jobs currently in this category.</p>
                     {getEmptyStateAction()}
                </div>
            )}
        </div>
    );
}

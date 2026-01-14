'use client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { jobs, technicians, inspectorAssets } from "@/lib/placeholder-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, CheckCircle, MapPin, Users, Wrench, Calendar, User, SlidersHorizontal, RadioTower, History, Award } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useMemo } from "react";

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

    const { displayedJobs, title, Icon } = useMemo(() => {
        let jobsToShow = [];
        let pageTitle = '';
        let PageIcon: React.ElementType = Briefcase;
        
        let relevantJobs = role === 'inspector' 
            ? jobs.filter(j => ['In Progress', 'Completed', 'Assigned', 'Scheduled', 'Report Submitted', 'Under Audit', 'Audit Approved'].includes(j.status))
            : jobs; // Clients see all jobs for now, could be filtered by poster ID in real app

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
                    <Link href={constructUrl('/dashboard/jobs')}>Post a Job</Link>
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
            <div className="flex justify-between items-center mb-6">
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

                        return (
                            <Card key={job.id}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="font-headline text-xl">{job.title}</CardTitle>
                                        <Badge variant={job.status === 'Posted' ? 'secondary' : job.status === 'In Progress' ? 'default' : 'outline'}>{job.status}</Badge>
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
                    <h2 className="mt-4 text-xl font-headline">No {view} Jobs</h2>
                    <p className="mt-2 text-muted-foreground">You don't have any jobs currently in this category.</p>
                     {getEmptyStateAction()}
                </div>
            )}
        </div>
    );
}

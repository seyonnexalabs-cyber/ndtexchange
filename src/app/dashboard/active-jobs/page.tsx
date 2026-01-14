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

export default function ActiveJobsPage() {
    const searchParams = useSearchParams();
    const [view, setView] = useState<JobView>('active');

    const { displayedJobs, title, Icon } = useMemo(() => {
        let jobsToShow = [];
        let pageTitle = '';
        let PageIcon: React.ElementType = Briefcase;

        switch(view) {
            case 'active':
                jobsToShow = jobs.filter(job => job.status === 'In Progress');
                pageTitle = 'Active Jobs';
                PageIcon = CheckCircle;
                break;
            case 'completed':
                jobsToShow = jobs.filter(job => job.status === 'Completed');
                pageTitle = 'Completed Jobs';
                PageIcon = History;
                break;
            case 'upcoming':
                jobsToShow = jobs.filter(job => job.status === 'Assigned' || job.status === 'Scheduled');
                pageTitle = 'Upcoming Jobs';
                PageIcon = Award;
                break;
        }
        return { displayedJobs: jobsToShow, title: pageTitle, Icon: PageIcon };
    }, [view]);

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <Icon />
                    {title}
                </h1>
                <div className="flex gap-2">
                    <Button variant={view === 'active' ? 'default' : 'outline'} onClick={() => setView('active')}>Active</Button>
                    <Button variant={view === 'upcoming' ? 'default' : 'outline'} onClick={() => setView('upcoming')}>Upcoming</Button>
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
                                        <Badge>{job.technique}</Badge>
                                    </div>
                                    <CardDescription>{job.client}</CardDescription>
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
                                    <Button>View Job Details</Button>
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
                     {view === 'active' || view === 'upcoming' ? (
                        <Button asChild className="mt-4">
                            <Link href={constructUrl('/dashboard/find-jobs')}>Find a Job</Link>
                        </Button>
                     ) : null}
                </div>
            )}
        </div>
    );
}

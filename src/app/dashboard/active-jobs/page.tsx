'use client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { jobs, technicians, inspectorAssets } from "@/lib/placeholder-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, CheckCircle, MapPin, Users, Wrench, Calendar, User, SlidersHorizontal, RadioTower, History } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useMemo } from "react";

const equipmentIcons = {
    'UT Equipment': <RadioTower className="w-4 h-4 text-muted-foreground" />,
    'PAUT Probe': <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />,
    'Yoke': <Wrench className="w-4 h-4 text-muted-foreground" />,
    'Calibration Block': <Wrench className="w-4 h-4 text-muted-foreground" />,
};

export default function ActiveJobsPage() {
    const searchParams = useSearchParams();
    const [view, setView] = useState<'active' | 'completed'>('active');

    const displayedJobs = useMemo(() => {
        if (view === 'active') {
            return jobs.filter(job => job.status === 'In Progress');
        }
        return jobs.filter(job => job.status === 'Completed');
    }, [view]);

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const title = view === 'active' ? 'Active Jobs' : 'Completed Jobs';
    const Icon = view === 'active' ? CheckCircle : History;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <Icon />
                    {title}
                </h1>
                <Button variant="outline" onClick={() => setView(view === 'active' ? 'completed' : 'active')}>
                    {view === 'active' ? 'View Completed Jobs' : 'View Active Jobs'}
                </Button>
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

                                    {view === 'active' && (
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
                                                ) : <p className="text-xs text-muted-foreground">No technicians assigned.</p>}
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
                                                ) : <p className="text-xs text-muted-foreground">No equipment assigned.</p>}
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
                     {view === 'completed' ? null : (
                        <Button asChild className="mt-4">
                            <Link href={constructUrl('/dashboard/find-jobs')}>Find a Job</Link>
                        </Button>
                     )}
                </div>
            )}
        </div>
    );
}

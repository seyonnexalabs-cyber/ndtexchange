

'use client';
import * as React from 'react';
import { useMemo } from "react";
import { notFound, useSearchParams, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { technicians, jobs, Technician, Job } from "@/lib/placeholder-data";
import { serviceProviders } from "@/lib/service-providers-data";
import { ChevronLeft, User, Briefcase, Star, HardHat, Edit, AlertTriangle } from "lucide-react";
import { useIsMobile } from '@/hooks/use-mobile';
import { format } from 'date-fns';
import { GLOBAL_DATE_FORMAT } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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

const technicianStatusVariants: { [key in Technician['status']]: 'success' | 'default' | 'outline' } = {
    'Available': 'success',
    'On Assignment': 'default',
    'Disabled': 'outline',
};


export default function TechnicianDetailPage() {
    const params = useParams();
    const { id } = params;
    const searchParams = useSearchParams();
    const isMobile = useIsMobile();
    
    const technician = useMemo(() => technicians.find(t => t.id === id), [id]);
    const assignedJobs = useMemo(() => jobs.filter(j => j.technicianIds?.includes(id as string)), [id]);
    const provider = useMemo(() => serviceProviders.find(p => p.id === technician?.providerId), [technician]);
    const completedJobsCount = useMemo(() => assignedJobs.filter(j => ['Completed', 'Paid'].includes(j.status)).length, [assignedJobs]);

    if (!technician) {
        notFound();
    }
    
    const highestLevel = useMemo(() => {
        if (!technician.certifications.length) return 'N/A';
        const levels = ['Level I', 'Level II', 'Level III'];
        const highestIndex = Math.max(...technician.certifications.map(c => levels.indexOf(c.level)));
        return levels[highestIndex];
    }, [technician.certifications]);

    const constructUrl = (base: string) => {
        const [pathname, baseQuery] = base.split('?');
        const newParams = new URLSearchParams(searchParams.toString());

        if (baseQuery) {
            const baseParams = new URLSearchParams(baseQuery);
            baseParams.forEach((value, key) => {
                newParams.set(key, value);
            });
        }

        const queryString = newParams.toString();
        return queryString ? `${pathname}?${queryString}` : pathname;
    }
    
    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <Button asChild variant="outline" size="sm" className="mb-4 sm:mb-0">
                    <Link href={constructUrl("/dashboard/technicians")}>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Technicians
                    </Link>
                </Button>
            </div>

            {technician.status === 'Disabled' && (
                <Alert variant="destructive" className="mb-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Technician Inactive</AlertTitle>
                    <AlertDescription>
                        This technician is no longer active with the company. Their profile is maintained for historical job records.
                    </AlertDescription>
                </Alert>
            )}
            
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col items-center gap-4 text-center">
                                <Avatar className="h-24 w-24">
                                    <AvatarFallback className="text-4xl">{technician.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h1 className="text-2xl font-headline font-bold">{technician.name}</h1>
                                    <Badge shape="rounded" variant={highestLevel === 'Level III' ? 'default' : highestLevel === 'Level II' ? 'success' : 'secondary'} className="mt-1">
                                        {highestLevel} Inspector
                                    </Badge>
                                    <p className="text-sm text-muted-foreground mt-1">{provider?.name}</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="text-center">
                             <Badge variant={technicianStatusVariants[technician.status]}>{technician.status}</Badge>
                             <div className="mt-4 text-sm border-t pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Jobs Completed</span>
                                    <span className="font-semibold">{completedJobsCount}</span>
                                </div>
                             </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Star /> Certifications</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Method</TableHead>
                                        <TableHead>Level</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {technician.certifications.map((cert, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Badge variant="outline" shape="rounded">{cert.method}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge shape="rounded" variant={cert.level === 'Level III' ? 'default' : cert.level === 'Level II' ? 'success' : 'secondary'}>
                                                    {cert.level}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
                 <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Briefcase /> Job History</CardTitle>
                            <CardDescription>All jobs assigned to {technician.name}.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isMobile ? (
                                <div className="space-y-4">
                                    {assignedJobs.map(job => (
                                        <Card key={job.id} className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold">{job.title}</p>
                                                    <p className="text-xs font-mono font-semibold text-muted-foreground">{job.id}</p>
                                                </div>
                                                <Badge variant={jobStatusVariants[job.status]}>{job.status}</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">{job.client}</p>
                                            <div className="flex justify-end mt-3">
                                                 <Button asChild size="sm" variant="ghost">
                                                    <Link href={constructUrl(`/dashboard/my-jobs/${job.id}`)}>View Job</Link>
                                                </Button>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Job ID</TableHead>
                                            <TableHead>Job Title</TableHead>
                                            <TableHead>Client</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {assignedJobs.map(job => (
                                            <TableRow key={job.id}>
                                                <TableCell className="font-mono text-xs font-medium">{job.id}</TableCell>
                                                <TableCell className="font-medium">
                                                    <Link href={constructUrl(`/dashboard/my-jobs/${job.id}`)} className="hover:underline">{job.title}</Link>
                                                </TableCell>
                                                <TableCell>{job.client}</TableCell>
                                                <TableCell>{format(new Date(job.scheduledStartDate || job.postedDate), GLOBAL_DATE_FORMAT)}</TableCell>
                                                <TableCell>
                                                    <Badge variant={jobStatusVariants[job.status]}>{job.status}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                             {assignedJobs.length === 0 && (
                                <div className="text-center py-10 text-muted-foreground">
                                    No jobs have been assigned to this technician yet.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                 </div>
            </div>
        </div>
    );
}

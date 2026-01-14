
'use client';
import * as React from 'react';
import { useMemo } from "react";
import { notFound, useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { clientData, jobs } from "@/lib/placeholder-data";
import { ChevronLeft, Mail, Users, Briefcase, DollarSign } from "lucide-react";
import { useIsMobile } from '@/hooks/use-mobile';


export default function ClientDetailPage() {
    const params = useParams();
    const { id } = params;
    const searchParams = useSearchParams();
    const isMobile = useIsMobile();
    
    const client = useMemo(() => clientData.find(c => c.id === id), [id]);
    const clientJobs = useMemo(() => jobs.filter(j => j.client === client?.name), [client]);

    if (!client) {
        notFound();
    }

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    return (
        <div>
            <Button asChild variant="outline" size="sm" className="mb-4">
                <Link href={constructUrl("/dashboard/clients")}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Clients
                </Link>
            </Button>
            
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader className="items-center">
                             <Avatar className="h-20 w-20 mb-4">
                                <AvatarImage src={`https://picsum.photos/seed/${client.id}/200/200`} />
                                <AvatarFallback>{client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-2xl font-headline">{client.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm">
                            <div className="space-y-4 text-muted-foreground">
                                <div className="flex items-center gap-3">
                                    <Users className="w-4 h-4" />
                                    <span>{client.contactPerson}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="w-4 h-4" />
                                    <span>{client.contactEmail}</span>
                                </div>
                                 <div className="flex items-center gap-3">
                                    <Briefcase className="w-4 h-4" />
                                    <span>{client.activeJobs} Active Jobs</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <DollarSign className="w-4 h-4" />
                                    <span>${client.totalSpend.toLocaleString()} Total Spend</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                 <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Briefcase /> Active & Recent Jobs
                            </CardTitle>
                            <CardDescription>
                                Jobs associated with {client.name}.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                           {isMobile ? (
                                <div className="space-y-4">
                                    {clientJobs.map(job => (
                                        <Card key={job.id} className="p-4">
                                             <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-semibold">{job.title}</p>
                                                    <p className="text-sm text-muted-foreground">{job.technique}</p>
                                                </div>
                                                <Badge variant={job.status === 'Completed' ? 'default' : 'secondary'}>{job.status}</Badge>
                                            </div>
                                             <div className="flex justify-end mt-3">
                                                <Button variant="ghost" size="sm" asChild>
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
                                        <TableHead>Job Title</TableHead>
                                        <TableHead>Technique</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {clientJobs.map(job => (
                                        <TableRow key={job.id}>
                                            <TableCell className="font-medium">{job.title}</TableCell>
                                            <TableCell>{job.technique}</TableCell>
                                            <TableCell>
                                                <Badge variant={job.status === 'Completed' ? 'default' : 'secondary'}>{job.status}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {job.scheduledStartDate || job.postedDate}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                           )}
                           {clientJobs.length === 0 && (
                                <div className="text-center text-muted-foreground py-10">
                                    No jobs found for this client.
                                </div>
                           )}
                        </CardContent>
                    </Card>
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Team Members</CardTitle>
                            <CardDescription>Users from {client.name} with access to the platform.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Team member management is coming soon.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

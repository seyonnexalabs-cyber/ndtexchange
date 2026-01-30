'use client';
import * as React from 'react';
import { useMemo } from "react";
import { notFound, useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { clientData, jobs, subscriptions } from "@/lib/placeholder-data";
import { ChevronLeft, Mail, Users, Briefcase, DollarSign, Calendar } from "lucide-react";
import { useIsMobile } from '@/hooks/use-is-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, isToday } from 'date-fns';
import { GLOBAL_DATE_FORMAT } from '@/lib/utils';


export default function ClientDetailPage() {
    const params = useParams();
    const { id } = params;
    const searchParams = useSearchParams();
    const isMobile = useIsMobile();
    
    const client = useMemo(() => clientData.find(c => c.id === id), [id]);
    const clientJobs = useMemo(() => jobs.filter(j => j.client === client?.name), [client]);
    const subscription = useMemo(() => subscriptions.find(s => s.companyId === id), [id]);

    if (!client) {
        notFound();
    }

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <Button asChild variant="outline" size="sm" className="mb-4 sm:mb-0">
                    <Link href={constructUrl("/dashboard/clients")}>
                        <ChevronLeft className="mr-2 h-4 w-4 text-primary" />
                        Back to Clients
                    </Link>
                </Button>
                <Button>Edit Client</Button>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
                 <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-3xl">{client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-2xl font-headline font-bold">{client.name}</h1>
                    <p className="text-muted-foreground">Client Management</p>
                </div>
            </div>
            
            <Tabs defaultValue="details">
                <TabsList className="mb-4">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="jobs">Jobs</TabsTrigger>
                    <TabsTrigger value="team">Team Members</TabsTrigger>
                </TabsList>
                <TabsContent value="details">
                    <Card>
                        <CardHeader>
                            <CardTitle>Client Details</CardTitle>
                             <CardDescription>
                                Company contact information and key metrics.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm">
                            <div className="space-y-4 text-muted-foreground">
                                <div className="flex items-center gap-3">
                                    <Users className="w-4 h-4 text-primary" />
                                    <span>{client.contactPerson}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-primary" />
                                    <span>{client.contactEmail}</span>
                                </div>
                                 <div className="flex items-center gap-3">
                                    <Briefcase className="w-4 h-4 text-primary" />
                                    <span>{client.activeJobs} Active Jobs</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <DollarSign className="w-4 h-4 text-primary" />
                                    <span>${client.totalSpend.toLocaleString()} Total Spend</span>
                                </div>
                                {subscription && (
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        <span>Member Since: {format(new Date(subscription.startDate), GLOBAL_DATE_FORMAT)}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="jobs">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Briefcase className="text-primary" /> Active & Recent Jobs
                            </CardTitle>
                            <CardDescription>
                                Jobs associated with {client.name}.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                        {isMobile ? (
                                <div className="space-y-4">
                                    {clientJobs.map(job => {
                                      const jobDate = new Date(job.scheduledStartDate || job.postedDate);
                                      return (
                                        <Card key={job.id} className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-semibold">{job.title}</p>
                                                    <p className="text-xs font-extrabold text-muted-foreground">{job.id}</p>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                        {job.technique} &bull; 
                                                        <span>{format(jobDate, GLOBAL_DATE_FORMAT)}</span>
                                                        {isToday(jobDate) && <Badge>Today</Badge>}
                                                    </p>
                                                </div>
                                                <Badge variant={job.status === 'Completed' ? 'default' : 'secondary'}>{job.status}</Badge>
                                            </div>
                                            <div className="flex justify-end mt-3">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={constructUrl(`/dashboard/my-jobs/${job.id}`)}>View Job</Link>
                                                </Button>
                                            </div>
                                        </Card>
                                    )})}
                                </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Job ID</TableHead>
                                        <TableHead>Job Title</TableHead>
                                        <TableHead>Technique</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {clientJobs.map(job => {
                                      const jobDate = new Date(job.scheduledStartDate || job.postedDate);
                                      return (
                                        <TableRow key={job.id}>
                                            <TableCell className="font-extrabold text-sm">{job.id}</TableCell>
                                            <TableCell className="font-medium">{job.title}</TableCell>
                                            <TableCell>{job.technique}</TableCell>
                                            <TableCell>
                                                <Badge variant={job.status === 'Completed' ? 'default' : 'secondary'}>{job.status}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span>{format(jobDate, GLOBAL_DATE_FORMAT)}</span>
                                                    {isToday(jobDate) && <Badge>Today</Badge>}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )})}
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
                </TabsContent>
                <TabsContent value="team">
                     <Card>
                        <CardHeader>
                            <CardTitle>Team Members</CardTitle>
                            <CardDescription>Users from {client.name} with access to the platform.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Team member management is coming soon.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

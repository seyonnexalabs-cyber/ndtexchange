
'use client';
import * as React from 'react';
import { useMemo, useEffect } from "react";
import { notFound, useSearchParams, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChevronLeft, Mail, Users, Briefcase, DollarSign, Calendar } from "lucide-react";
import { useMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, isToday } from 'date-fns';
import { GLOBAL_DATE_FORMAT, cn, safeParseDate } from '@/lib/utils';
import { useFirebase, useDoc, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import type { Client, Job, Subscription, PlatformUser } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';


const statusStyles: { [key in PlatformUser['status']]: 'success' | 'default' | 'secondary' | 'destructive' | 'outline' } = {
    Active: 'success',
    Invited: 'secondary',
    Disabled: 'destructive',
};

const ClientRelativeDateBadge = ({ date }: { date: Date | null }) => {
  const [isTodayFlag, setIsTodayFlag] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    if (date) {
      setIsTodayFlag(isToday(date));
    } else {
      setIsTodayFlag(false);
    }
  }, [date]);

  if (isTodayFlag === null || !isTodayFlag) {
      return null;
  }

  return <Badge>Today</Badge>;
};

const ClientFormattedDate = ({ date, formatString }: { date: Date | null, formatString: string }) => {
    const [formatted, setFormatted] = React.useState<string | null>(null);
    React.useEffect(() => {
        if (date) {
            setFormatted(format(date, formatString));
        }
    }, [date, formatString]);

    if (!formatted) return null;
    return <>{formatted}</>;
};

export default function ClientDetailPage() {
    const params = useParams();
    const { id } = params;
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role');
    const isMobile = useMobile();
    const { firestore, user } = useFirebase();

    useEffect(() => {
        if (role && role !== 'admin') {
            router.replace(`/dashboard?${searchParams.toString()}`);
        }
    }, [role, router, searchParams]);

    const clientRef = useMemoFirebase(() => firestore && id ? doc(firestore, 'companies', id as string) : null, [firestore, id]);
    const { data: client, isLoading: isLoadingClient } = useDoc<Client>(clientRef);
    
    const jobsQuery = useMemoFirebase(() => (firestore && user && id) ? query(collection(firestore, 'jobs'), where('clientCompanyId', '==', id)) : null, [firestore, user, id]);
    const { data: clientJobs, isLoading: isLoadingJobs } = useCollection<Job>(jobsQuery);

    const subscriptionQuery = useMemoFirebase(() => (firestore && user && id) ? query(collection(firestore, 'subscriptions'), where('companyId', '==', id)) : null, [firestore, user, id]);
    const { data: subscriptions, isLoading: isLoadingSubs } = useCollection<Subscription>(subscriptionQuery);
    const subscription = subscriptions?.[0];

    const teamQuery = useMemoFirebase(() => (firestore && user && id) ? query(collection(firestore, 'users'), where('companyId', '==', id)) : null, [firestore, user, id]);
    const { data: clientTeam, isLoading: isLoadingTeam } = useCollection<PlatformUser>(teamQuery);

    const clientStats = useMemo(() => {
        if (!clientJobs) return { activeJobs: 0, totalSpend: 0 };
        const activeJobs = clientJobs.filter(j => !['Completed', 'Paid', 'Canceled'].includes(j.status)).length;
        const totalSpend = clientJobs.reduce((acc, job) => {
            const awardedBid = job.bids?.find(b => b.status === 'Awarded');
            return acc + (awardedBid?.amount || 0);
        }, 0);
        return { activeJobs, totalSpend };
    }, [clientJobs]);

    const isLoading = isLoadingClient || isLoadingJobs || isLoadingSubs || isLoadingTeam || !id;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-1/4 mb-6" />
                <div className="flex items-center gap-4 mb-6">
                    <Skeleton className="h-20 w-20 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </div>
                <Skeleton className="h-64 w-full" />
            </div>
        )
    }

    if (!client) {
        notFound();
    }
    
    if (role !== 'admin') {
        return null;
    }

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const memberSinceDate = safeParseDate(subscription?.startDate);

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <Link href={constructUrl("/dashboard/clients")} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mb-4 sm:mb-0")}>
                    <ChevronLeft className="mr-2 h-4 w-4 text-primary" />
                    Back to Clients
                </Link>
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
                                    <span>{clientStats.activeJobs} Active Jobs</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <DollarSign className="w-4 h-4 text-primary" />
                                    <span>${clientStats.totalSpend.toLocaleString()} Total Spend</span>
                                </div>
                                {subscription && (
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        <span>
                                            Member Since: <ClientFormattedDate date={memberSinceDate} formatString={GLOBAL_DATE_FORMAT} />
                                        </span>
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
                                    {(clientJobs || []).map(job => {
                                      const jobDate = safeParseDate(job.scheduledStartDate || job.postedDate);
                                      return (
                                        <Card key={job.id} className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-semibold">{job.title}</p>
                                                    <p className="text-xs font-extrabold text-muted-foreground">{job.id}</p>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                        {(job.techniques || []).join(', ')} &bull; 
                                                        <span><ClientFormattedDate date={jobDate} formatString={GLOBAL_DATE_FORMAT} /></span>
                                                        <ClientRelativeDateBadge date={jobDate} />
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
                                    {(clientJobs || []).map(job => {
                                      const jobDate = safeParseDate(job.scheduledStartDate || job.postedDate);
                                      return (
                                        <TableRow key={job.id}>
                                            <TableCell className="font-extrabold text-sm">{job.id}</TableCell>
                                            <TableCell className="font-medium">{job.title}</TableCell>
                                            <TableCell>{(job.techniques || []).join(', ')}</TableCell>
                                            <TableCell>
                                                <Badge variant={job.status === 'Completed' ? 'default' : 'secondary'}>{job.status}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span><ClientFormattedDate date={jobDate} formatString={GLOBAL_DATE_FORMAT} /></span>
                                                    <ClientRelativeDateBadge date={jobDate} />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )})}
                                </TableBody>
                            </Table>
                        )}
                        {(clientJobs || []).length === 0 && (
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
                            {isMobile ? (
                                <div className="space-y-4">
                                    {(clientTeam || []).map(user => (
                                        <Card key={user.id} className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold">{user.name}</p>
                                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                                    <p className="text-sm text-muted-foreground">{user.role}</p>
                                                </div>
                                                <Badge variant={statusStyles[user.status]}>{user.status}</Badge>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(clientTeam || []).map(user => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                    </Avatar>
                                                    {user.name}
                                                </TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>{user.role}</TableCell>
                                                <TableCell><Badge variant={statusStyles[user.status]}>{user.status}</Badge></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                             {(clientTeam || []).length === 0 && (
                                <div className="text-center text-muted-foreground py-10">
                                    No team members found for this client.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

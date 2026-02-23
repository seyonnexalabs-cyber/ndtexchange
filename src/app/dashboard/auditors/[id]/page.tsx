

'use client';
import * as React from 'react';
import { useMemo } from "react";
import { notFound, useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, MapPin, Users } from "lucide-react";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFirebase, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import type { PlatformUser, AuditFirm } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';


export default function AuditorDetailPage() {
    const params = useParams();
    const { id } = params;
    const searchParams = useSearchParams();
    const role = searchParams.get('role');
    const { firestore } = useFirebase();

    const auditorRef = useMemoFirebase(() => (firestore && id ? doc(firestore, 'companies', id as string) : null), [firestore, id]);
    const { data: auditor, isLoading: isLoadingAuditor } = useDoc<AuditFirm>(auditorRef);
    
    const teamQuery = useMemoFirebase(() => {
        if (!firestore || !id || role !== 'admin') return null; // Query only for admins
        return query(collection(firestore, 'users'), where('companyId', '==', id))
    }, [firestore, id, role]);

    const { data: auditorTeam, isLoading: isLoadingTeam } = useCollection<PlatformUser>(teamQuery);

    const isLoading = isLoadingAuditor || (role === 'admin' && isLoadingTeam) || !id;

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
        );
    }
    
    if (!auditor) {
        notFound();
    }

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const backUrl = role === 'admin' ? "/dashboard/auditors" : "/dashboard/find-auditors";
    const backText = role === 'admin' ? "Back to Auditors" : "Back to Find Auditors";

    return (
        <div>
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <Button asChild variant="outline" size="sm" className="mb-4 sm:mb-0">
                    <Link href={constructUrl(backUrl)}>
                        <ChevronLeft className="mr-2 h-4 w-4 text-primary" />
                        {backText}
                    </Link>
                </Button>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-3xl">{auditor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-2xl font-headline font-bold">{auditor.name}</h1>
                    <p className="text-muted-foreground flex items-center gap-1.5 pt-1">
                        <MapPin className="w-4 h-4 text-primary"/> {auditor.location}
                    </p>
                </div>
            </div>

            <Tabs defaultValue="details">
                <TabsList className="mb-4">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="team">Team Members</TabsTrigger>
                </TabsList>
                <TabsContent value="details">
                    <Card>
                        <CardHeader>
                            <CardTitle>Auditor Profile</CardTitle>
                            <CardDescription>Company information and areas of specialty.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div>
                                <h3 className="font-semibold text-sm mb-1">About</h3>
                                <p className="text-sm text-muted-foreground">{auditor.description}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold mb-2">Services Offered</h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {(auditor.services || []).map(service => (
                                        <Badge key={service} variant="secondary" shape="rounded">{service}</Badge>
                                    ))}
                                </div>
                            </div>
                             <div className="mt-4">
                                <h4 className="text-sm font-semibold mb-2">Industry Focus</h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {(auditor.industries || []).map(industry => (
                                        <Badge key={industry} variant="outline" shape="rounded">{industry}</Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="team">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Users className="text-primary" /> Team Members</CardTitle>
                            <CardDescription>Auditors and staff from {auditor.name}.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {role === 'admin' ? (
                                <>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Role</TableHead>
                                                <TableHead>Email</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {(auditorTeam || []).map(user => (
                                                <TableRow key={user.id}>
                                                    <TableCell className="font-medium flex items-center gap-3">
                                                        <Avatar>
                                                            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                        </Avatar>
                                                        {user.name}
                                                    </TableCell>
                                                    <TableCell>{user.role}</TableCell>
                                                    <TableCell>{user.email}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    {(auditorTeam || []).length === 0 && !isLoadingTeam && (
                                        <div className="text-center text-muted-foreground py-10">
                                            No team members are assigned to this firm.
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center text-muted-foreground py-10">
                                    Team member information is only visible to administrators.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

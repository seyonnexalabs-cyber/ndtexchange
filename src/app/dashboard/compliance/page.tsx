
'use client';

import * as React from 'react';
import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Calendar, Filter, X } from "lucide-react";
import Link from "next/link";
import { useFirebase, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import type { Asset, PlatformUser } from '@/lib/types';
import { Skeleton } from "@/components/ui/skeleton";
import { format, differenceInDays, startOfDay } from 'date-fns';
import { GLOBAL_DATE_FORMAT, safeParseDate } from '@/lib/utils';
import { useMobile } from '@/hooks/use-mobile';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ComplianceStatus = 'Compliant' | 'Due Soon' | 'Overdue';

const statusConfig: { [key in ComplianceStatus]: { variant: 'success' | 'secondary' | 'destructive', daysRemaining: (days: number) => string } } = {
    'Compliant': { variant: 'success', daysRemaining: (days) => `Due in ${days} days` },
    'Due Soon': { variant: 'secondary', daysRemaining: (days) => `Due in ${days} days` },
    'Overdue': { variant: 'destructive', daysRemaining: (days) => `Overdue by ${Math.abs(days)} days` },
};

const getComplianceStatus = (nextInspection: string, today: Date): { status: ComplianceStatus, days: number } | null => {
    const inspectionDate = safeParseDate(nextInspection);
    if (!inspectionDate) return null;
    
    const inspectionDay = startOfDay(inspectionDate);
    const days = differenceInDays(inspectionDay, today);

    if (days < 0) {
        return { status: 'Overdue', days };
    }
    if (days <= 30) {
        return { status: 'Due Soon', days };
    }
    return { status: 'Compliant', days };
};

export default function CompliancePage() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role');
    const { firestore, user: authUser } = useFirebase();
    const { data: userProfile, isLoading: isLoadingProfile } = useDoc<PlatformUser>(
        useMemoFirebase(() => (authUser ? doc(firestore, 'users', authUser.uid) : null), [authUser, firestore])
    );
    const [today, setToday] = useState(startOfDay(new Date()));
    const isMobile = useMobile();
    const [statusFilter, setStatusFilter] = useState('all');

    const assetsQuery = useMemoFirebase(() => {
        if (!firestore || !userProfile?.companyId) return null;
        return query(collection(firestore, 'assets'), where('companyId', '==', userProfile.companyId));
    }, [firestore, userProfile]);

    const { data: assets, isLoading: isLoadingAssets } = useCollection<Asset>(assetsQuery);

    const assetComplianceData = useMemo(() => {
        if (!assets) return [];
        return assets.map(asset => {
            const compliance = getComplianceStatus(asset.nextInspection, today);
            return {
                ...asset,
                compliance
            };
        }).filter(asset => asset.compliance !== null).sort((a, b) => a.compliance!.days - b.compliance!.days) as (Asset & { compliance: NonNullable<ReturnType<typeof getComplianceStatus>> })[];
    }, [assets, today]);
    
    const filteredData = useMemo(() => {
        if (statusFilter === 'all') return assetComplianceData;
        return assetComplianceData.filter(asset => asset.compliance.status === statusFilter);
    }, [assetComplianceData, statusFilter]);

    const stats = useMemo(() => {
        const total = assetComplianceData.length;
        const compliant = assetComplianceData.filter(a => a.compliance.status === 'Compliant').length;
        const dueSoon = assetComplianceData.filter(a => a.compliance.status === 'Due Soon').length;
        const overdue = assetComplianceData.filter(a => a.compliance.status === 'Overdue').length;
        return { total, compliant, dueSoon, overdue };
    }, [assetComplianceData]);

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    };
    
    if (isLoadingAssets || isLoadingProfile) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-1/3" />
                <div className="grid gap-6 md:grid-cols-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                <ShieldCheck className="text-primary"/>
                Compliance Tracker
            </h1>
            
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Compliant</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.compliant}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inspection Due Soon</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">{stats.dueSoon}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle>Asset Compliance Status</CardTitle>
                            <CardDescription>A list of all your assets, sorted by their next inspection date.</CardDescription>
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="Compliant">Compliant</SelectItem>
                                <SelectItem value="Due Soon">Due Soon</SelectItem>
                                <SelectItem value="Overdue">Overdue</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    {isMobile ? (
                        <div className="space-y-4">
                            {filteredData.map(asset => {
                                const nextInspectionDate = safeParseDate(asset.nextInspection);
                                return (
                                <Card key={asset.id} className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold">{asset.name}</p>
                                            <p className="text-xs font-extrabold text-muted-foreground">{asset.id}</p>
                                        </div>
                                        <Badge variant={statusConfig[asset.compliance.status].variant}>
                                            {asset.compliance.status}
                                        </Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-2">
                                        <p>Location: {asset.location}</p>
                                        <p>Next Inspection: {nextInspectionDate ? format(nextInspectionDate, GLOBAL_DATE_FORMAT) : 'N/A'}</p>
                                        <p>Days Remaining: {statusConfig[asset.compliance.status].daysRemaining(asset.compliance.days)}</p>
                                    </div>
                                    <CardFooter className="p-0 pt-4">
                                         <Button asChild variant="outline" size="sm" className="w-full">
                                            <Link href={constructUrl(`/dashboard/assets/${asset.id}`)}>View Asset</Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            )})}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Asset Name</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Next Inspection</TableHead>
                                    <TableHead>Compliance Status</TableHead>
                                    <TableHead>Timeframe</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredData.map(asset => {
                                    const nextInspectionDate = safeParseDate(asset.nextInspection);
                                    return (
                                    <TableRow key={asset.id}>
                                        <TableCell className="font-medium">{asset.name}</TableCell>
                                        <TableCell>{asset.location}</TableCell>
                                        <TableCell>{nextInspectionDate ? format(nextInspectionDate, GLOBAL_DATE_FORMAT) : 'N/A'}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusConfig[asset.compliance.status].variant}>
                                                {asset.compliance.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{statusConfig[asset.compliance.status].daysRemaining(asset.compliance.days)}</TableCell>
                                        <TableCell className="text-right">
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={constructUrl(`/dashboard/assets/${asset.id}`)}>View Asset</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )})}
                            </TableBody>
                        </Table>
                    )}
                     {filteredData.length === 0 && (
                        <div className="text-center h-24 flex items-center justify-center text-muted-foreground">
                            No assets found for the selected filter.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

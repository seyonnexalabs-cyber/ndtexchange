'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMemo, useEffect } from 'react';
import { NDTTechniques, jobs, allUsers, PlatformUser, Inspection } from '@/lib/placeholder-data';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Filter, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, isToday } from 'date-fns';
import { GLOBAL_DATE_FORMAT } from '@/lib/utils';
import { useSearch } from '@/app/components/layout/search-provider';

const statusFilters = ['Scheduled', 'Completed', 'Requires Review'];
const inspectionStatusVariants: Record<Inspection['status'], 'success' | 'default' | 'secondary' | 'destructive' | 'outline'> = {
    'Scheduled': 'secondary',
    'Completed': 'success',
    'Requires Review': 'destructive'
};

export default function ReportsListPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'client';
    const isMobile = useIsMobile();
    const { searchQuery } = useSearch();
    const [selectedTechniques, setSelectedTechniques] = React.useState<string[]>([]);
    const [statusFilter, setStatusFilter] = React.useState<string>('all');
    
    const constructUrl = (base: string) => {
        const newParams = new URLSearchParams();
        const role = searchParams.get('role');
        const plan = searchParams.get('plan');
        if (role) newParams.set('role', role);
        if (plan) newParams.set('plan', plan);

        const queryString = newParams.toString();
        return queryString ? `${base}?${queryString}` : base;
    }

    const allInspections = useMemo(() => {
        // In a real app, this would be based on user's company/permissions
        let relevantJobs = jobs;
        if (role === 'client') {
            relevantJobs = jobs.filter(j => j.client === 'Global Energy Corp.');
        } else if (role === 'inspector') {
            relevantJobs = jobs.filter(j => j.providerId === 'provider-03');
        }
        return relevantJobs.flatMap(job => (job.inspections || []).map(inspection => ({...inspection, job})))
    }, [role]);

    const augmentedAndFilteredInspections = useMemo(() => {
        let filtered = allInspections.filter(i => i.report); // Only show inspections with reports
        
        if (statusFilter !== 'all') {
            filtered = filtered.filter(i => i.status === statusFilter);
        }

        const augmented = filtered.map(inspection => {
            const assignedTechnicians = inspection.job?.technicianIds
                ?.map(techId => allUsers.find(t => t.id === techId))
                .filter((t): t is PlatformUser => !!t) ?? [];
            return {
                ...inspection,
                assignedTechnicians
            };
        });

        return augmented.filter(inspection => {
            const searchMatch = !searchQuery ||
                inspection.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                inspection.jobId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (inspection.assignedTechnicians.length > 0
                    ? inspection.assignedTechnicians.some(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    : inspection.inspector.toLowerCase().includes(searchQuery.toLowerCase())
                );
            
            const techniqueMatch = selectedTechniques.length === 0 || selectedTechniques.includes(inspection.technique);
            
            return searchMatch && techniqueMatch;
        });
    }, [allInspections, searchQuery, selectedTechniques, statusFilter]);

    const handleTechniqueChange = (techniqueId: string) => {
        setSelectedTechniques(prev => prev.includes(techniqueId) ? prev.filter(id => id !== techniqueId) : [...prev, techniqueId]);
    };

    const hasActiveFilters = selectedTechniques.length > 0 || statusFilter !== 'all';
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                        <FileText className="text-primary" />
                        Inspection Reports
                    </h1>
                    <p className="text-muted-foreground mt-1">Browse all submitted inspection reports.</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-end gap-4 mb-4">
                 <div className="flex gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full sm:w-auto">
                                <Filter className="mr-2 h-4 w-4 text-primary" />
                                Technique ({selectedTechniques.length})
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64">
                             <div className="grid gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">Filter by Technique</h4>
                                </div>
                                <div className="grid gap-2">
                                    {NDTTechniques.map(tech => (
                                        <div key={tech.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`tech-${tech.id}`}
                                                checked={selectedTechniques.includes(tech.id)}
                                                onCheckedChange={() => handleTechniqueChange(tech.id)}
                                            />
                                            <Label htmlFor={`tech-${tech.id}`}>{tech.name}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {statusFilters.map(status => (
                                <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 </div>
            </div>

             {hasActiveFilters && (
                <div className="mb-4 flex items-center flex-wrap gap-2">
                    <span className="text-sm font-medium">Active Filters:</span>
                    {selectedTechniques.map(techId => (
                        <Badge key={techId} variant="secondary">
                            {NDTTechniques.find(t => t.id === techId)?.name}
                            <button onClick={() => handleTechniqueChange(techId)} className="ml-1.5 rounded-full hover:bg-muted-foreground/20 p-0.5">
                                <X className="h-3 w-3 text-primary" />
                            </button>
                        </Badge>
                    ))}
                    {statusFilter !== 'all' && (
                        <Badge variant="secondary">
                            Status: {statusFilter}
                             <button onClick={() => setStatusFilter('all')} className="ml-1.5 rounded-full hover:bg-muted-foreground/20 p-0.5">
                                <X className="h-3 w-3 text-primary" />
                            </button>
                        </Badge>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => { setSelectedTechniques([]); setStatusFilter('all'); }}>Clear All</Button>
                </div>
            )}
            
            {isMobile ? (
                <div className="space-y-4">
                    {augmentedAndFilteredInspections.map(inspection => {
                        const inspectionDate = new Date(inspection.date);
                        return (
                            <Card key={inspection.id}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-base">{inspection.assetName}</CardTitle>
                                            <p className="font-extrabold text-xs text-muted-foreground">{inspection.jobId}</p>
                                        </div>
                                        <Badge variant={inspectionStatusVariants[inspection.status]}>{inspection.status}</Badge>
                                    </div>
                                    <CardDescription>
                                        <Badge variant="secondary" shape="rounded">{inspection.technique}</Badge>
                                        <span className="mx-1.5">by</span>
                                        {inspection.assignedTechnicians.length > 0 
                                            ? inspection.assignedTechnicians.map(t => t.name).join(', ') 
                                            : inspection.inspector
                                        }
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                                        Report Date: {format(inspectionDate, GLOBAL_DATE_FORMAT)}
                                        {isToday(inspectionDate) && <Badge>Today</Badge>}
                                    </p>
                                </CardContent>
                                 <CardFooter>
                                    <Button asChild variant="outline" size="sm" className="w-full">
                                        <Link href={constructUrl(`/dashboard/reports/${inspection.id}`)}>View Report</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            ) : (
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Job ID</TableHead>
                                <TableHead>Asset Name</TableHead>
                                <TableHead>Technique</TableHead>
                                <TableHead>Inspector(s)</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {augmentedAndFilteredInspections.map(inspection => {
                                const inspectionDate = new Date(inspection.date);
                                return (
                                <TableRow key={inspection.id}>
                                    <TableCell className="font-extrabold text-xs">{inspection.jobId}</TableCell>
                                    <TableCell className="font-medium">{inspection.assetName}</TableCell>
                                    <TableCell><Badge variant="secondary" shape="rounded">{inspection.technique}</Badge></TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            {inspection.assignedTechnicians.length > 0 
                                                ? inspection.assignedTechnicians.map(t => <span key={t.id}>{t.name}</span>)
                                                : <span>{inspection.inspector}</span>
                                            }
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span>{format(inspectionDate, GLOBAL_DATE_FORMAT)}</span>
                                            {isToday(inspectionDate) && <Badge>Today</Badge>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={inspectionStatusVariants[inspection.status]}>{inspection.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={constructUrl(`/dashboard/reports/${inspection.id}`)}>View Report</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>
                </Card>
            )}

             {augmentedAndFilteredInspections.length === 0 && (
                <div className="text-center p-10 border rounded-lg">
                    <div className="mx-auto h-12 w-12 text-primary"><FileText /></div>
                    <h2 className="mt-4 text-xl font-headline">No Reports Found</h2>
                    <p className="mt-2 text-muted-foreground">No reports match the current filters.</p>
                </div>
            )}
        </div>
    );
}

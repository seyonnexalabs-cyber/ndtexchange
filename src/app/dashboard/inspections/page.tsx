
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMemo, useEffect } from 'react';
import { inspections, NDTTechniques, jobs, technicians, Technician, Inspection } from '@/lib/placeholder-data';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Filter, X, Eye } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { GLOBAL_DATE_FORMAT } from '@/lib/utils';
import { useSearch } from '@/app/components/layout/search-provider';

const statusFilters = ['Scheduled', 'Completed', 'Requires Review'];
const inspectionStatusVariants: Record<Inspection['status'], 'success' | 'default' | 'secondary' | 'destructive' | 'outline'> = {
    'Scheduled': 'secondary',
    'Completed': 'success',
    'Requires Review': 'destructive'
};

export default function InspectionsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role');

    useEffect(() => {
        if (role && role !== 'auditor') {
            const params = new URLSearchParams(searchParams.toString());
            const redirectPath = role === 'admin' ? '/dashboard/all-jobs' : '/dashboard';
            router.replace(`${redirectPath}?${params.toString()}`);
        }
    }, [role, router, searchParams]);

    const isMobile = useIsMobile();
    const { searchQuery } = useSearch();
    const [selectedTechniques, setSelectedTechniques] = React.useState<string[]>([]);
    const [statusFilter, setStatusFilter] = React.useState<string>(role === 'admin' ? 'all' : 'Requires Review');
    
    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const augmentedAndFilteredInspections = useMemo(() => {
        let filtered = inspections;
        
        // For auditors, default "all" is their actionable queue.
        if (role === 'auditor' && statusFilter === 'all') {
            filtered = inspections.filter(i => i.status === 'Requires Review');
        }

        const augmented = filtered.map(inspection => {
            const job = jobs.find(j => j.id === inspection.jobId);
            const assignedTechnicians = job?.technicianIds
                ?.map(techId => technicians.find(t => t.id === techId))
                .filter((t): t is Technician => !!t) ?? [];
            return {
                ...inspection,
                job,
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
            
            let statusMatch = true;
            if (role === 'admin' && statusFilter !== 'all') {
                statusMatch = inspection.status === statusFilter;
            } else if (role === 'auditor') {
                statusMatch = statusFilter === 'all' ? inspection.status === 'Requires Review' : inspection.status === statusFilter;
            }

            return searchMatch && techniqueMatch && statusMatch;
        });
    }, [searchQuery, selectedTechniques, statusFilter, role]);

    const handleTechniqueChange = (techniqueId: string) => {
        setSelectedTechniques(prev => prev.includes(techniqueId) ? prev.filter(id => id !== techniqueId) : [...prev, techniqueId]);
    };
    
    const isAuditor = role === 'auditor';
    const pageTitle = isAuditor ? 'Audit Queue' : 'Inspection Reports';
    const pageDescription = isAuditor ? 'Review and approve submitted inspection reports.' : 'View all inspection reports across the platform.';
    const emptyStateTitle = isAuditor ? 'Audit Queue is Empty' : 'No Reports Found';
    const emptyStateDescription = isAuditor ? 'There are no reports currently awaiting your review.' : 'No inspection reports match the current filters.';
    const buttonText = isAuditor ? 'Audit Report' : 'View Report';
    const hasActiveFilters = selectedTechniques.length > 0 || (role === 'admin' && statusFilter !== 'all') || (role === 'auditor' && statusFilter !== 'Requires Review');


    // Render a redirecting state while the redirect happens
    if (role && !isAuditor && role !== 'admin') {
        return (
           <div className="text-center p-10">
               <h1 className="text-2xl font-headline">Redirecting...</h1>
               <p className="mt-4 text-muted-foreground">You are being redirected to the appropriate page.</p>
           </div>
       );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                        <Eye />
                        {pageTitle}
                    </h1>
                    <p className="text-muted-foreground mt-1">{pageDescription}</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-end gap-4 mb-4">
                 <div className="flex gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full sm:w-auto">
                                <Filter className="mr-2 h-4 w-4" />
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
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                    {(statusFilter !== 'all' && role === 'admin') && (
                        <Badge variant="secondary">
                            Status: {statusFilter}
                             <button onClick={() => setStatusFilter('all')} className="ml-1.5 rounded-full hover:bg-muted-foreground/20 p-0.5">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                    {(statusFilter !== 'Requires Review' && role === 'auditor') && (
                         <Badge variant="secondary">
                            Status: {statusFilter}
                             <button onClick={() => setStatusFilter('Requires Review')} className="ml-1.5 rounded-full hover:bg-muted-foreground/20 p-0.5">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => { setSelectedTechniques([]); setStatusFilter(isAuditor ? 'Requires Review' : 'all'); }}>Clear All</Button>
                </div>
            )}
            
            {isMobile ? (
                <div className="space-y-4">
                    {augmentedAndFilteredInspections.map(inspection => (
                        <Card key={inspection.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-base">{inspection.assetName}</CardTitle>
                                        <p className="text-xs text-muted-foreground font-mono">{inspection.jobId}</p>
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
                                <p className="text-sm text-muted-foreground">Date: {format(new Date(inspection.date), GLOBAL_DATE_FORMAT)}</p>
                            </CardContent>
                             <CardFooter>
                                <Button asChild variant="outline" size="sm" className="w-full">
                                    <Link href={constructUrl(`/dashboard/inspections/${inspection.id}`)}>{buttonText}</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Asset Name</TableHead>
                                <TableHead>Job ID</TableHead>
                                <TableHead>Technique</TableHead>
                                <TableHead>Inspectors</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {augmentedAndFilteredInspections.map(inspection => (
                                <TableRow key={inspection.id}>
                                    <TableCell className="font-medium">{inspection.assetName}</TableCell>
                                    <TableCell className="font-mono text-xs">{inspection.jobId}</TableCell>
                                    <TableCell><Badge variant="secondary" shape="rounded">{inspection.technique}</Badge></TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            {inspection.assignedTechnicians.length > 0 
                                                ? inspection.assignedTechnicians.map(t => <span key={t.id}>{t.name}</span>)
                                                : <span>{inspection.inspector}</span>
                                            }
                                        </div>
                                    </TableCell>
                                    <TableCell>{format(new Date(inspection.date), GLOBAL_DATE_FORMAT)}</TableCell>
                                    <TableCell>
                                        <Badge variant={inspectionStatusVariants[inspection.status]}>{inspection.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={constructUrl(`/dashboard/inspections/${inspection.id}`)}>{buttonText}</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}

             {augmentedAndFilteredInspections.length === 0 && (
                <div className="text-center p-10 border rounded-lg">
                    <div className="mx-auto h-12 w-12 text-muted-foreground"><Eye /></div>
                    <h2 className="mt-4 text-xl font-headline">{emptyStateTitle}</h2>
                    <p className="mt-2 text-muted-foreground">{emptyStateDescription}</p>
                </div>
            )}
        </div>
    );
}

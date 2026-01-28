
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { inspections, NDTTechniques, clientAssets, Inspection } from '@/lib/placeholder-data';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClipboardList, Filter, X, Eye } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const statusFilters = ['Scheduled', 'Completed', 'Requires Review'];
const inspectionStatusVariants: Record<Inspection['status'], 'success' | 'default' | 'secondary' | 'destructive' | 'outline'> = {
    'Scheduled': 'secondary',
    'Completed': 'success',
    'Requires Review': 'destructive'
};

export default function InspectionsPage() {
    const isMobile = useIsMobile();
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'admin';
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedTechniques, setSelectedTechniques] = React.useState<string[]>([]);
    const [statusFilter, setStatusFilter] = React.useState<string>(role === 'auditor' ? 'Requires Review' : 'all');
    
    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const filteredInspections = useMemo(() => {
        let relevantInspections = inspections;
        // If the user is an auditor, this page becomes their dedicated queue
        if (role === 'auditor') {
            relevantInspections = inspections.filter(i => i.status === 'Requires Review');
        }

        return relevantInspections.filter(inspection => {
            const searchMatch = !searchQuery ||
                inspection.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                inspection.inspector.toLowerCase().includes(searchQuery.toLowerCase());
            
            const techniqueMatch = selectedTechniques.length === 0 || selectedTechniques.includes(inspection.technique);
            
            const statusMatch = role === 'auditor' ? inspection.status === 'Requires Review' : (statusFilter === 'all' || inspection.status === statusFilter);

            return searchMatch && techniqueMatch && statusMatch;
        });
    }, [searchQuery, selectedTechniques, statusFilter, role]);

    const handleTechniqueChange = (techniqueId: string) => {
        setSelectedTechniques(prev => prev.includes(techniqueId) ? prev.filter(id => id !== techniqueId) : [...prev, techniqueId]);
    };

    const hasActiveFilters = searchQuery || selectedTechniques.length > 0 || (statusFilter !== 'all' && role !== 'auditor');

    const pageTitle = role === 'auditor' ? 'Audit Queue' : 'All Inspections';
    const pageIcon = role === 'auditor' ? <Eye /> : <ClipboardList />;
    const emptyStateTitle = role === 'auditor' ? 'Audit Queue is Empty' : 'No inspections found';
    const emptyStateDescription = role === 'auditor' ? 'There are no reports currently awaiting your review.' : 'There are no inspections matching your current filters.';

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    {pageIcon}
                    {pageTitle}
                </h1>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <Input 
                    placeholder="Search by asset name or inspector..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-grow"
                />
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
                    <Select value={statusFilter} onValueChange={setStatusFilter} disabled={role === 'auditor'}>
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
                    {statusFilter !== 'all' && role !== 'auditor' && (
                        <Badge variant="secondary">
                            Status: {statusFilter}
                             <button onClick={() => setStatusFilter('all')} className="ml-1.5 rounded-full hover:bg-muted-foreground/20 p-0.5">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => { setSearchQuery(''); setSelectedTechniques([]); setStatusFilter(role === 'auditor' ? 'Requires Review' : 'all'); }}>Clear All</Button>
                </div>
            )}
            
            {isMobile ? (
                <div className="space-y-4">
                    {filteredInspections.map(inspection => (
                        <Card key={inspection.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-base">{inspection.assetName}</CardTitle>
                                    <Badge variant={inspectionStatusVariants[inspection.status]}>{inspection.status}</Badge>
                                </div>
                                <CardDescription>{inspection.technique} by {inspection.inspector}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">Date: {inspection.date}</p>
                            </CardContent>
                             <CardFooter>
                                <Button asChild variant="outline" size="sm" className="w-full">
                                    <Link href={constructUrl(`/dashboard/inspections/${inspection.id}`)}>Audit Report</Link>
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
                                <TableHead>Technique</TableHead>
                                <TableHead>Inspector</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredInspections.map(inspection => (
                                <TableRow key={inspection.id}>
                                    <TableCell className="font-medium">{inspection.assetName}</TableCell>
                                    <TableCell>{inspection.technique}</TableCell>
                                    <TableCell>{inspection.inspector}</TableCell>
                                    <TableCell>{inspection.date}</TableCell>
                                    <TableCell>
                                        <Badge variant={inspectionStatusVariants[inspection.status]}>{inspection.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={constructUrl(`/dashboard/inspections/${inspection.id}`)}>Audit Report</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}

             {filteredInspections.length === 0 && (
                <div className="text-center p-10 border rounded-lg">
                    <div className="mx-auto h-12 w-12 text-muted-foreground">{pageIcon}</div>
                    <h2 className="mt-4 text-xl font-headline">{emptyStateTitle}</h2>
                    <p className="mt-2 text-muted-foreground">{emptyStateDescription}</p>
                </div>
            )}
        </div>
    );
}

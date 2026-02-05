
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { inspections, NDTTechniques, Inspection } from '@/lib/placeholder-data';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { History, Filter, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useSearch } from '@/app/components/layout/search-provider';

const inspectionStatusVariants: Record<Inspection['status'], 'success' | 'default' | 'secondary' | 'destructive' | 'outline'> = {
    'Scheduled': 'secondary',
    'Completed': 'success',
    'Requires Review': 'destructive'
};

// A broader set for history
const historyStatusVariants: Record<string, 'success' | 'default' | 'secondary' | 'destructive' | 'outline'> = {
    ...inspectionStatusVariants,
    'Audit Approved': 'success',
    'Client Approved': 'success',
    'Completed': 'success',
    'Paid': 'success'
};


export default function AuditHistoryPage() {
    const isMobile = useIsMobile();
    const searchParams = useSearchParams();
    const { searchQuery } = useSearch();
    const [selectedTechniques, setSelectedTechniques] = React.useState<string[]>([]);
    
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

    const filteredInspections = useMemo(() => {
        // In a real app, you'd fetch inspections audited by the current user.
        // Here, we'll simulate it by taking completed/reviewed inspections.
        let relevantInspections = inspections.filter(i => i.status === 'Completed');

        return relevantInspections.filter(inspection => {
            const searchMatch = !searchQuery ||
                inspection.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                inspection.inspector.toLowerCase().includes(searchQuery.toLowerCase());
            
            const techniqueMatch = selectedTechniques.length === 0 || selectedTechniques.includes(inspection.technique);

            return searchMatch && techniqueMatch;
        });
    }, [searchQuery, selectedTechniques]);

    const handleTechniqueChange = (techniqueId: string) => {
        setSelectedTechniques(prev => prev.includes(techniqueId) ? prev.filter(id => id !== techniqueId) : [...prev, techniqueId]);
    };

    const hasActiveFilters = selectedTechniques.length > 0;

    const pageTitle = 'Audit History';
    const pageIcon = <History className="text-primary" />;
    const emptyStateTitle = 'No Audit History';
    const emptyStateDescription = 'You have not audited any reports yet.';

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    {pageIcon}
                    {pageTitle}
                </h1>
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
                    <Button variant="ghost" size="sm" onClick={() => { setSelectedTechniques([]); }}>Clear All</Button>
                </div>
            )}
            
            {isMobile ? (
                <div className="space-y-4">
                    {filteredInspections.map(inspection => (
                        <Card key={inspection.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-base">{inspection.assetName}</CardTitle>
                                    <Badge variant={historyStatusVariants[inspection.status]}>{inspection.status}</Badge>
                                </div>
                                <CardDescription>{inspection.technique} by {inspection.inspector}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">Date: {inspection.date}</p>
                            </CardContent>
                             <CardFooter>
                                <Button asChild variant="outline" size="sm" className="w-full">
                                    <Link href={constructUrl(`/dashboard/inspections/${inspection.id}`)}>View Report</Link>
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
                                        <Badge variant={historyStatusVariants[inspection.status]}>{inspection.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={constructUrl(`/dashboard/inspections/${inspection.id}`)}>View Report</Link>
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
                    <div className="mx-auto h-12 w-12 text-primary">{pageIcon}</div>
                    <h2 className="mt-4 text-xl font-headline">{emptyStateTitle}</h2>
                    <p className="mt-2 text-muted-foreground">{emptyStateDescription}</p>
                </div>
            )}
        </div>
    );
}

    
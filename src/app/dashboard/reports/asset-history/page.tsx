'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { inspections, clientAssets } from '@/lib/placeholder-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, FileText, Printer, BarChart2 } from 'lucide-react';
import { parseISO, format } from 'date-fns';

export default function AssetHistoryReportPage() {
    const searchParams = useSearchParams();

    const { filteredInspections, filters } = React.useMemo(() => {
        const assetIds = searchParams.get('assetIds')?.split(',') || [];
        const fromDate = searchParams.get('from') ? parseISO(searchParams.get('from')) : null;
        const toDate = searchParams.get('to') ? parseISO(searchParams.get('to')) : null;

        const filters = {
            assets: assetIds.map(id => clientAssets.find(a => a.id === id)?.name).filter(Boolean) as string[],
            dateRange: fromDate && toDate ? `${format(fromDate, 'PPP')} to ${format(toDate, 'PPP')}` : 'All time'
        };

        const filteredInspections = inspections.filter(inspection => {
            const inspectionDate = parseISO(inspection.date);
            const assetMatch = assetIds.length === 0 || assetIds.includes(inspection.assetId);
            const dateMatch = fromDate && toDate ? (inspectionDate >= fromDate && inspectionDate <= toDate) : true;
            return assetMatch && dateMatch;
        });
            
        return { filteredInspections, filters };
    }, [searchParams]);
    
    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        // remove report-specific params
        params.delete('assetIds');
        params.delete('from');
        params.delete('to');
        params.delete('format');
        return `${base}?${params.toString()}`;
    }
    
    return (
        <div>
            <div className="flex justify-between items-start mb-6">
                <div>
                     <Button asChild variant="outline" size="sm" className="mb-4">
                        <Link href={constructUrl("/dashboard/reports")}>
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back to Reports
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                        <FileText />
                        Asset Inspection History
                    </h1>
                    <p className="text-muted-foreground mt-1">Generated on {format(new Date(), 'PPP')}</p>
                </div>
                <Button onClick={() => window.print()}>
                    <Printer className="mr-2 h-4 w-4"/>
                    Print / Save as PDF
                </Button>
            </div>
            
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Report Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex">
                        <strong className="w-32">Date Range:</strong>
                        <span className="text-muted-foreground">{filters.dateRange}</span>
                    </div>
                    <div className="flex">
                        <strong className="w-32">Assets:</strong>
                        <span className="text-muted-foreground">{filters.assets.length > 0 ? filters.assets.join(', ') : 'All'}</span>
                    </div>
                </CardContent>
            </Card>

             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inspections Analyzed</CardTitle>
                        <BarChart2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredInspections.length}</div>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Detailed Inspection Data</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Asset Name</TableHead>
                                <TableHead>Technique</TableHead>
                                <TableHead>Inspector</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredInspections.map(inspection => (
                                <TableRow key={inspection.id}>
                                    <TableCell className="font-medium">{inspection.assetName}</TableCell>
                                    <TableCell><Badge variant="secondary">{inspection.technique}</Badge></TableCell>
                                    <TableCell>{inspection.inspector}</TableCell>
                                    <TableCell>
                                         <Badge variant={inspection.status === 'Completed' ? 'default' : 'secondary'}>{inspection.status}</Badge>
                                    </TableCell>
                                    <TableCell>{inspection.date}</TableCell>
                                </TableRow>
                            ))}
                             {filteredInspections.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        No inspections found matching your criteria.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

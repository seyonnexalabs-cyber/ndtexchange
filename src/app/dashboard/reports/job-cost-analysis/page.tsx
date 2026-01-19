'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { jobs, bids, NDTTechniques } from '@/lib/placeholder-data';
import { serviceProviders } from '@/lib/service-providers-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, FileText, Printer, DollarSign, Clock, BarChart2 } from 'lucide-react';
import { parseISO, differenceInDays, format } from 'date-fns';

export default function JobCostAnalysisReportPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const { jobs: filteredJobs, filters } = React.useMemo(() => {
        const providerIds = searchParams.get('providers')?.split(',') || [];
        const techniqueIds = searchParams.get('techniques')?.split(',') || [];
        const fromDate = searchParams.get('from') ? parseISO(searchParams.get('from')) : null;
        const toDate = searchParams.get('to') ? parseISO(searchParams.get('to')) : null;

        const filters = {
            providers: providerIds.map(id => serviceProviders.find(p => p.id === id)?.name).filter(Boolean) as string[],
            techniques: techniqueIds.map(id => NDTTechniques.find(t => t.id === id)?.name).filter(Boolean) as string[],
            dateRange: fromDate && toDate ? `${format(fromDate, 'PPP')} to ${format(toDate, 'PPP')}` : 'All time'
        };

        const jobsWithBids = jobs
            .map(job => {
                const awardedBid = bids.find(bid => bid.jobId === job.id && bid.status === 'Awarded');
                if (!awardedBid) return null;
                const duration = (job.scheduledStartDate && job.scheduledEndDate)
                    ? differenceInDays(parseISO(job.scheduledEndDate), parseISO(job.scheduledStartDate)) + 1
                    : 1;

                return { ...job, awardedBid, duration };
            })
            .filter((job): job is NonNullable<typeof job> => job !== null)
            .filter(job => {
                const jobDate = parseISO(job.scheduledStartDate || job.postedDate);
                const providerMatch = providerIds.length === 0 || providerIds.includes(job.providerId!);
                const techniqueMatch = techniqueIds.length === 0 || techniqueIds.includes(job.technique);
                const dateMatch = fromDate && toDate ? (jobDate >= fromDate && jobDate <= toDate) : true;

                return providerMatch && techniqueMatch && dateMatch;
            });
            
        return { jobs: jobsWithBids, filters };
    }, [searchParams]);

    const { totalCost, avgCost, avgDuration } = React.useMemo(() => {
        if (filteredJobs.length === 0) {
            return { totalCost: 0, avgCost: 0, avgDuration: 0 };
        }
        const totalCost = filteredJobs.reduce((sum, job) => sum + (job.awardedBid?.amount || 0), 0);
        const totalDuration = filteredJobs.reduce((sum, job) => sum + (job.duration || 0), 0);

        return {
            totalCost,
            avgCost: totalCost / filteredJobs.length,
            avgDuration: totalDuration / filteredJobs.length,
        }
    }, [filteredJobs]);
    
    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        // remove report-specific params
        params.delete('providers');
        params.delete('techniques');
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
                        Job Cost & Duration Analysis
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
                        <strong className="w-32">Providers:</strong>
                        <span className="text-muted-foreground">{filters.providers.length > 0 ? filters.providers.join(', ') : 'All'}</span>
                    </div>
                     <div className="flex">
                        <strong className="w-32">Techniques:</strong>
                        <span className="text-muted-foreground">{filters.techniques.length > 0 ? filters.techniques.join(', ') : 'All'}</span>
                    </div>
                </CardContent>
            </Card>

             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Jobs Analyzed</CardTitle>
                        <BarChart2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredJobs.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalCost.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Job Cost</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${avgCost.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Job Duration</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{avgDuration.toFixed(1)} Days</div>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Detailed Job Data</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Job Title</TableHead>
                                <TableHead>Provider</TableHead>
                                <TableHead>Technique</TableHead>
                                <TableHead>Cost</TableHead>
                                <TableHead>Duration (Days)</TableHead>
                                <TableHead>Completion Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredJobs.map(job => (
                                <TableRow key={job!.id}>
                                    <TableCell className="font-medium">{job!.title}</TableCell>
                                    <TableCell>{serviceProviders.find(p => p.id === job!.providerId)?.name}</TableCell>
                                    <TableCell><Badge variant="secondary">{job!.technique}</Badge></TableCell>
                                    <TableCell>${job!.awardedBid!.amount.toLocaleString()}</TableCell>
                                    <TableCell>{job!.duration}</TableCell>
                                    <TableCell>{job!.scheduledEndDate}</TableCell>
                                </TableRow>
                            ))}
                             {filteredJobs.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">
                                        No jobs found matching your criteria.
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

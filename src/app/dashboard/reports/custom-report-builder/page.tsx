
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn, GLOBAL_DATE_FORMAT, safeParseDate } from '@/lib/utils';
import { format } from 'date-fns';
import { Settings2, Filter, Printer, ChevronLeft, Calendar as CalendarIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, collectionGroup } from 'firebase/firestore';
import type { Job, Bid, NDTServiceProvider, NDTTechnique } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const reportBuilderSchema = z.object({
    dataSource: z.enum(['jobs', 'assets'], { required_error: 'Please select a data source.' }),
    columns: z.array(z.string()).refine(value => value.length > 0, {
        message: "Please select at least one column to display."
    }),
    dateRange: z.object({
        from: z.date().optional(),
        to: z.date().optional(),
    }).optional(),
    providerIds: z.array(z.string()).optional(),
    techniqueIds: z.array(z.string()).optional(),
});

type ReportData = { [key: string]: any };

const jobColumns = [
    { id: 'title', label: 'Job Title' },
    { id: 'client', label: 'Client' },
    { id: 'provider', label: 'Provider' },
    { id: 'status', label: 'Status' },
    { id: 'cost', label: 'Cost' },
    { id: 'postedDate', label: 'Posted Date' },
    { id: 'scheduledStartDate', label: 'Scheduled Date' },
    { id: 'technique', label: 'Technique' },
];

export default function CustomReportBuilderPage() {
    const [reportData, setReportData] = React.useState<ReportData[]>([]);
    const [reportHeaders, setReportHeaders] = React.useState<string[]>([]);
    const [isReportGenerated, setIsReportGenerated] = React.useState(false);

    const searchParams = useSearchParams();
    const { firestore } = useFirebase();

    const { data: jobs, isLoading: isLoadingJobs } = useCollection<Job>(useMemoFirebase(() => firestore ? collection(firestore, 'jobs') : null, [firestore]));
    const { data: bids, isLoading: isLoadingBids } = useCollection<Bid>(useMemoFirebase(() => firestore ? query(collectionGroup(firestore, 'bids'), where('status', '==', 'Awarded')) : null, [firestore]));
    const { data: serviceProviders, isLoading: isLoadingProviders } = useCollection<NDTServiceProvider>(useMemoFirebase(() => firestore ? query(collection(firestore, 'companies'), where('type', '==', 'Provider')) : null, [firestore]));
    const { data: techniques, isLoading: isLoadingTechniques } = useCollection<NDTTechnique>(useMemoFirebase(() => firestore ? collection(firestore, 'techniques') : null, [firestore]));
    
    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const form = useForm<z.infer<typeof reportBuilderSchema>>({
        resolver: zodResolver(reportBuilderSchema),
        defaultValues: {
            dataSource: 'jobs',
            columns: ['title', 'provider', 'cost', 'status'],
            dateRange: {},
            providerIds: [],
            techniqueIds: [],
        },
    });

    const onSubmit = (values: z.infer<typeof reportBuilderSchema>) => {
        let results: ReportData[] = [];
        const headers = values.columns.map(colId => jobColumns.find(c => c.id === colId)?.label || colId);
        setReportHeaders(headers);

        if (values.dataSource === 'jobs' && jobs) {
            const filteredJobs = jobs.filter(job => {
                const jobDate = safeParseDate(job.scheduledStartDate || job.postedDate);
                const providerMatch = !values.providerIds || values.providerIds.length === 0 || values.providerIds.includes(job.providerId!);
                const techniqueMatch = !values.techniqueIds || values.techniqueIds.length === 0 || job.techniques.some(t => values.techniqueIds?.includes(t));
                const dateMatch = !values.dateRange?.from || !values.dateRange?.to || (jobDate && jobDate >= values.dateRange.from && jobDate <= values.dateRange.to);
                return providerMatch && techniqueMatch && dateMatch;
            });

            results = filteredJobs.map(job => {
                const awardedBid = bids?.find(bid => bid.jobId === job.id);
                const provider = serviceProviders?.find(p => p.id === job.providerId);
                
                const row: ReportData = {};
                for (const col of values.columns) {
                    switch (col) {
                        case 'title': row[col] = job.title; break;
                        case 'client': row[col] = job.client; break;
                        case 'provider': row[col] = provider?.name || 'N/A'; break;
                        case 'status': row[col] = job.status; break;
                        case 'cost': row[col] = awardedBid ? `$${awardedBid.amount.toLocaleString()}` : 'N/A'; break;
                        case 'postedDate': row[col] = format(safeParseDate(job.postedDate)!, GLOBAL_DATE_FORMAT); break;
                        case 'scheduledStartDate': row[col] = job.scheduledStartDate ? format(safeParseDate(job.scheduledStartDate)!, GLOBAL_DATE_FORMAT) : 'N/A'; break;
                        case 'technique': row[col] = job.techniques.join(', '); break;
                    }
                }
                return row;
            });
        }
        
        setReportData(results);
        setIsReportGenerated(true);
    };
    
    const isLoading = isLoadingJobs || isLoadingBids || isLoadingProviders || isLoadingTechniques;

    return (
        <div className="space-y-6">
            <Button asChild variant="outline" size="sm">
                <Link href={constructUrl("/dashboard/reports")}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Reports
                </Link>
            </Button>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                        <Settings2 />
                        Custom Report Builder
                    </h1>
                    <p className="text-muted-foreground mt-1">Create your own report by selecting custom data points.</p>
                </div>
                {isReportGenerated && (
                    <Button onClick={() => window.print()}>
                        <Printer className="mr-2 h-4 w-4"/>
                        Print / Save as PDF
                    </Button>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Filter /> Report Configuration</CardTitle>
                    <CardDescription>Select a data source, choose columns, and apply filters to build your report.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="dataSource"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>1. Data Source</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="jobs">Jobs</SelectItem>
                                                    <SelectItem value="assets" disabled>Assets (coming soon)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="columns"
                                    render={() => (
                                    <FormItem className="lg:col-span-2">
                                        <FormLabel>2. Select Columns to Display</FormLabel>
                                        <ScrollArea className="h-40 w-full rounded-md border p-4">
                                            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                                                {jobColumns.map((col) => (
                                                <FormField
                                                    key={col.id}
                                                    control={form.control}
                                                    name="columns"
                                                    render={({ field }) => {
                                                    return (
                                                        <FormItem key={col.id} className="flex flex-row items-center space-x-2 space-y-0">
                                                            <FormControl>
                                                                <Checkbox
                                                                checked={field.value?.includes(col.id)}
                                                                onCheckedChange={(checked) => {
                                                                    return checked
                                                                    ? field.onChange([...(field.value || []), col.id])
                                                                    : field.onChange(
                                                                        field.value?.filter(
                                                                            (value) => value !== col.id
                                                                        )
                                                                        )
                                                                }}
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="font-normal text-sm">{col.label}</FormLabel>
                                                        </FormItem>
                                                    )
                                                    }}
                                                />
                                                ))}
                                            </div>
                                        </ScrollArea>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                             </div>
                             
                            <div className="space-y-2">
                                <h3 className="font-medium">3. Filters (Optional)</h3>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 rounded-md border p-4">
                                    <FormField
                                        control={form.control}
                                        name="dateRange"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                            <FormLabel>Date range</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button id="date" variant="outline" className={cn("justify-start text-left font-normal", !field.value?.from && "text-muted-foreground")}>
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {field.value?.from ? ( field.value.to ? (<> {format(field.value.from, "LLL dd, y")} - {format(field.value.to, "LLL dd, y")} </>) : (format(field.value.from, "LLL dd, y"))) : (<span>Pick a date range</span>)}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <CalendarComponent initialFocus mode="range" defaultMonth={field.value?.from} selected={field.value} onSelect={field.onChange} numberOfMonths={2}/>
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="providerIds"
                                        render={() => (
                                            <FormItem>
                                                <FormLabel>Providers</FormLabel>
                                                <FormControl>
                                                     <p className="text-sm text-muted-foreground">Provider filter coming soon.</p>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={form.control}
                                        name="techniqueIds"
                                        render={() => (
                                            <FormItem>
                                                <FormLabel>Techniques</FormLabel>
                                                <FormControl>
                                                     <p className="text-sm text-muted-foreground">Technique filter coming soon.</p>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                            
                            <div className="flex justify-end">
                                <Button type="submit">Generate Report</Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {isReportGenerated && (
                <Card>
                    <CardHeader>
                        <CardTitle>Report Results</CardTitle>
                        <CardDescription>Generated {reportData.length} records based on your criteria.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {reportHeaders.map(header => <TableHead key={header}>{header}</TableHead>)}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reportData.map((row, rowIndex) => (
                                    <TableRow key={rowIndex}>
                                        {reportHeaders.map(header => {
                                            const columnId = jobColumns.find(c => c.label === header)?.id;
                                            return <TableCell key={header}>{columnId ? row[columnId] : ''}</TableCell>
                                        })}
                                    </TableRow>
                                ))}
                                {reportData.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={reportHeaders.length} className="h-24 text-center">No results found for your criteria.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

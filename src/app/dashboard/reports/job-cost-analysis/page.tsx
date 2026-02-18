
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { jobs, reviews, clientData, serviceProviders, NDTTechniques } from '@/lib/seed-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Printer, DollarSign, Clock, BarChart2, Calendar as CalendarIcon, Filter, ChevronLeft } from 'lucide-react';
import { parseISO, differenceInDays, format } from 'date-fns';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn, GLOBAL_DATE_FORMAT } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { useMobile } from '@/hooks/use-mobile';


const reportSchema = z.object({
  providerIds: z.array(z.string()),
  techniqueIds: z.array(z.string()),
  dateRange: z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  }),
});

export default function JobCostAnalysisReportPage() {
    const form = useForm<z.infer<typeof reportSchema>>({
        resolver: zodResolver(reportSchema),
        defaultValues: {
          providerIds: [],
          techniqueIds: [],
          dateRange: {
            from: undefined,
            to: undefined,
          }
        },
    });

    const searchParams = useSearchParams();
    const isMobile = useMobile();
    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const filters = form.watch();

    const filteredJobs = React.useMemo(() => {
        const { providerIds, techniqueIds, dateRange } = filters;
        // For demo purposes, assume we are logged in as the primary client company
        const currentClient = clientData.find(c => c.id === 'client-01');

        return jobs
            .filter(job => job.client === currentClient?.name) // Filter for current client's jobs
            .map(job => {
                const awardedBid = job.bids?.find(bid => bid.status === 'Awarded');
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
                const dateMatch = !dateRange?.from || !dateRange?.to || (jobDate >= dateRange.from && jobDate <= dateRange.to);

                return providerMatch && techniqueMatch && dateMatch;
            });
    }, [filters]);

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
                        <FileText className="text-primary" />
                        Job Cost & Duration Analysis
                    </h1>
                    <p className="text-muted-foreground mt-1">Analyze costs and timelines for completed jobs.</p>
                </div>
                <Button onClick={() => window.print()}>
                    <Printer className="mr-2 h-4 w-4"/>
                    Print / Save as PDF
                </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Filter className="text-primary" /> Report Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form className="grid grid-cols-1 md:grid-cols-4 gap-6">
                           <FormField
                                control={form.control}
                                name="providerIds"
                                render={() => (
                                <FormItem>
                                    <FormLabel>Filter by Provider(s)</FormLabel>
                                    <ScrollArea className="h-40 w-full rounded-md border p-4">
                                        {serviceProviders.map((provider) => (
                                        <FormField
                                            key={provider.id}
                                            control={form.control}
                                            name="providerIds"
                                            render={({ field }) => {
                                            return (
                                                <FormItem
                                                key={provider.id}
                                                className="flex flex-row items-start space-x-3 space-y-0 mb-2"
                                                >
                                                <FormControl>
                                                    <Checkbox
                                                    checked={field.value?.includes(provider.id)}
                                                    onCheckedChange={(checked) => {
                                                        return checked
                                                        ? field.onChange([...(field.value || []), provider.id])
                                                        : field.onChange(
                                                            field.value?.filter(
                                                                (value) => value !== provider.id
                                                            )
                                                            )
                                                    }}
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-normal text-sm">
                                                    {provider.name}
                                                </FormLabel>
                                                </FormItem>
                                            )
                                            }}
                                        />
                                        ))}
                                    </ScrollArea>
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="techniqueIds"
                                render={() => (
                                <FormItem>
                                    <FormLabel>Filter by Technique(s)</FormLabel>
                                    <ScrollArea className="h-40 w-full rounded-md border p-4">
                                        {NDTTechniques.map((tech) => (
                                        <FormField
                                            key={tech.id}
                                            control={form.control}
                                            name="techniqueIds"
                                            render={({ field }) => {
                                            return (
                                                <FormItem
                                                key={tech.id}
                                                className="flex flex-row items-start space-x-3 space-y-0 mb-2"
                                                >
                                                <FormControl>
                                                    <Checkbox
                                                    checked={field.value?.includes(tech.id)}
                                                    onCheckedChange={(checked) => {
                                                        return checked
                                                        ? field.onChange([...(field.value || []), tech.id])
                                                        : field.onChange(
                                                            field.value?.filter(
                                                                (value) => value !== tech.id
                                                            )
                                                            )
                                                    }}
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-normal text-sm">
                                                    {tech.name}
                                                </FormLabel>
                                                </FormItem>
                                            )
                                            }}
                                        />
                                        ))}
                                    </ScrollArea>
                                </FormItem>
                                )}
                            />
                            <FormField
                                    control={form.control}
                                    name="dateRange"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                        <FormLabel>Date range</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                id="date"
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !field.value.from && "text-muted-foreground"
                                                )}
                                                >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {field.value.from ? (
                                                    field.value.to ? (
                                                    <>
                                                        {format(field.value.from, GLOBAL_DATE_FORMAT)} -{" "}
                                                        {format(field.value.to, GLOBAL_DATE_FORMAT)}
                                                    </>
                                                    ) : (
                                                    format(field.value.from, GLOBAL_DATE_FORMAT)
                                                    )
                                                ) : (
                                                    <span>Pick a date range</span>
                                                )}
                                                </Button>
                                            </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                initialFocus
                                                mode="range"
                                                defaultMonth={field.value.from}
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                numberOfMonths={1}
                                            />
                                            </PopoverContent>
                                        </Popover>
                                         <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex items-end">
                                    <Button type="button" variant="outline" onClick={() => form.reset({ providerIds: [], techniqueIds: [], dateRange: { from: undefined, to: undefined }})}>
                                        Clear Filters
                                    </Button>
                                </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
                    {isMobile ? (
                        <div className="space-y-4">
                            {filteredJobs.map(job => (
                                <Card key={job.id} className="p-4">
                                    <p className="font-semibold">{job.title}</p>
                                    <p className="text-xs font-extrabold text-muted-foreground">{job.id}</p>
                                    <div className="text-sm text-muted-foreground mt-2 space-y-1">
                                        <p>Provider: {serviceProviders.find(p => p.id === job.providerId)?.name}</p>
                                        <p>Technique: <Badge variant="secondary" shape="rounded">{job.technique}</Badge></p>
                                        <p>Cost: ${job.awardedBid.amount.toLocaleString()}</p>
                                        <p>Duration: {job.duration} Day(s)</p>
                                        <p>Completed: {job.scheduledEndDate ? format(new Date(job.scheduledEndDate), GLOBAL_DATE_FORMAT) : 'N/A'}</p>
                                    </div>
                                </Card>
                            ))}
                            {filteredJobs.length === 0 && (
                                <div className="text-center h-24 flex items-center justify-center text-muted-foreground">
                                    No jobs found matching your criteria.
                                </div>
                            )}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Job ID</TableHead>
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
                                        <TableCell className="font-extrabold text-xs">{job!.id}</TableCell>
                                        <TableCell className="font-medium">{job!.title}</TableCell>
                                        <TableCell>{serviceProviders.find(p => p.id === job!.providerId)?.name}</TableCell>
                                        <TableCell><Badge variant="secondary" shape="rounded">{job!.technique}</Badge></TableCell>
                                        <TableCell>${job!.awardedBid!.amount.toLocaleString()}</TableCell>
                                        <TableCell>{job!.duration}</TableCell>
                                        <TableCell>{job!.scheduledEndDate ? format(new Date(job.scheduledEndDate), GLOBAL_DATE_FORMAT): ''}</TableCell>
                                    </TableRow>
                                ))}
                                {filteredJobs.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center h-24">
                                            No jobs found matching your criteria.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
    

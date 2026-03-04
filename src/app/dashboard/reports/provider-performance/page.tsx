
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Printer, DollarSign, Clock, BarChart2, Calendar as CalendarIcon, Filter, ChevronLeft, HardHat, Star } from 'lucide-react';
import { parseISO, differenceInDays, format } from 'date-fns';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from "@/components/ui/calendar";
import { cn, GLOBAL_DATE_FORMAT, safeParseDate } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { useMobile } from '@/hooks/use-mobile';
import { useFirebase, useCollection, useMemoFirebase, useDoc, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Job, Bid, PlatformUser, NDTServiceProvider, Review, NDTTechnique } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const reportSchema = z.object({
  providerIds: z.array(z.string()).optional(),
  dateRange: z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  }),
});

type ProviderPerformanceData = {
    providerId: string;
    providerName: string;
    jobsAwarded: number;
    avgRating: number;
    totalSpend: number;
    avgJobCost: number;
};


export default function ProviderPerformanceReportPage() {
    const form = useForm<z.infer<typeof reportSchema>>({
        resolver: zodResolver(reportSchema),
        defaultValues: {
          providerIds: [],
          dateRange: { from: undefined, to: undefined }
        },
    });
    
    const searchParams = useSearchParams();
    const isMobile = useMobile();
    const { firestore, user } = useFirebase();
    const { data: userProfile, isLoading: isLoadingProfile } = useDoc<PlatformUser>(useMemoFirebase(() => (firestore && user ? doc(firestore, 'users', user.uid) : null), [firestore, user]));

    const { data: serviceProviders, isLoading: isLoadingProviders } = useCollection<NDTServiceProvider>(useMemoFirebase(() => (firestore ? query(collection(firestore, 'companies'), where('type', '==', 'Provider')) : null), [firestore]));
    
    const jobsQuery = useMemoFirebase(() => {
      if (!firestore || !userProfile?.companyId) return null;
      return query(collection(firestore, 'jobs'), where('clientCompanyId', '==', userProfile.companyId));
    }, [firestore, userProfile]);

    const { data: jobs, isLoading: isLoadingJobs } = useCollection<Job>(jobsQuery);
    
    const { data: bids, isLoading: isLoadingBids } = useCollection<Bid>(useMemoFirebase(() => (firestore ? query(collection(firestore, 'bids'), where('status', '==', 'Awarded')) : null), [firestore]));
    const { data: reviews, isLoading: isLoadingReviews } = useCollection<Review>(useMemoFirebase(() => (firestore ? query(collection(firestore, 'reviews'), where('status', '==', 'Approved')) : null), [firestore]));

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const filters = form.watch();

    const performanceData = React.useMemo(() => {
        if (!jobs || !reviews || !serviceProviders || !bids) return [];

        const { providerIds, dateRange } = filters;

        let relevantProviders = serviceProviders.filter(provider => {
            const hasJobs = jobs.some(job => job.providerCompanyId === provider.id && ['Completed', 'Paid'].includes(job.status));
            return hasJobs;
        });

        if (providerIds && providerIds.length > 0) {
            relevantProviders = relevantProviders.filter(p => providerIds.includes(p.id));
        }

        const data: ProviderPerformanceData[] = relevantProviders.map(provider => {
            const providerJobs = jobs.filter(job => {
                const jobIsForProvider = job.providerCompanyId === provider.id && ['Completed', 'Paid'].includes(job.status);
                if (!jobIsForProvider) return false;

                const jobDate = safeParseDate(job.scheduledStartDate || job.postedDate);
                const dateMatch = !dateRange?.from || !dateRange?.to || (jobDate && jobDate >= dateRange.from && jobDate <= dateRange.to);
                
                return dateMatch;
            });
            
            if (providerJobs.length === 0) return null;

            const jobIds = providerJobs.map(j => j.id);
            const providerReviews = reviews.filter(r => r.providerId === provider.id && r.clientId === userProfile?.id);
            
            const totalSpend = providerJobs.reduce((acc, job) => {
                const awardedBid = bids.find(b => b.jobId === job.id);
                return acc + (awardedBid?.amount || 0);
            }, 0);

            const avgRating = providerReviews.length > 0
                ? providerReviews.reduce((acc, r) => acc + r.rating, 0) / providerReviews.length
                : 0;

            return {
                providerId: provider.id,
                providerName: provider.name,
                jobsAwarded: providerJobs.length,
                avgRating: avgRating,
                totalSpend: totalSpend,
                avgJobCost: totalSpend / providerJobs.length,
            };
        }).filter((p): p is ProviderPerformanceData => p !== null);

        return data;

    }, [filters, jobs, reviews, serviceProviders, bids, userProfile]);

     const summaryStats = React.useMemo(() => {
        const totalProviders = new Set(performanceData.map(p => p.providerId)).size;
        const totalSpend = performanceData.reduce((acc, p) => acc + p.totalSpend, 0);
        const overallAvgRating = performanceData.length > 0
            ? performanceData.reduce((acc, p) => acc + p.avgRating * p.jobsAwarded, 0) / performanceData.reduce((acc, p) => acc + p.jobsAwarded, 0)
            : 0;
        
        return { totalProviders, totalSpend, overallAvgRating };
    }, [performanceData]);

    const chartConfig: ChartConfig = React.useMemo(() => (
      performanceData.reduce((acc, provider, index) => {
          acc[provider.providerName] = { 
              label: provider.providerName,
              color: `hsl(var(--chart-${(index % 5) + 1}))`
          };
          return acc;
      }, {} as ChartConfig)
    ), [performanceData]);

    const isLoading = isLoadingJobs || isLoadingBids || isLoadingProfile || isLoadingProviders || isLoadingReviews;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        )
    }
    
    return (
        <div className="space-y-6">
            <Link href={constructUrl("/dashboard/reports")} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Reports
            </Link>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                        <HardHat className="text-primary" />
                        Provider Performance Review
                    </h1>
                    <p className="text-muted-foreground mt-1">Compare performance metrics for service providers.</p>
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
                        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <FormField
                                control={form.control}
                                name="providerIds"
                                render={() => (
                                <FormItem>
                                    <FormLabel>Filter by Provider(s)</FormLabel>
                                    <ScrollArea className="h-40 w-full rounded-md border p-4">
                                        {(serviceProviders || []).map((provider) => (
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
                                    name="dateRange"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                        <FormLabel>Date range (Job Completion)</FormLabel>
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
                                <div className="flex items-end md:col-span-2">
                                    <Button type="button" variant="outline" onClick={() => form.reset({ providerIds: [], dateRange: { from: undefined, to: undefined }})}>
                                        Clear Filters
                                    </Button>
                                </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Providers Analyzed</CardTitle>
                        <HardHat className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.totalProviders}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${summaryStats.totalSpend.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overall Avg. Rating</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.overallAvgRating.toFixed(1)} / 5.0</div>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart2 className="text-primary" /> Performance Details</CardTitle>
                    <CardDescription>
                        Found {performanceData.length} provider(s) matching your criteria.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isMobile ? (
                        <div className="space-y-4">
                            {performanceData.map(provider => (
                                <Card key={provider.providerId} className="p-4">
                                    <p className="font-bold">{provider.providerName}</p>
                                    <div className="text-sm text-muted-foreground mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                                        <span className="font-medium">Jobs Awarded:</span><span>{provider.jobsAwarded}</span>
                                        <span className="font-medium">Avg. Rating:</span><span>{provider.avgRating > 0 ? provider.avgRating.toFixed(1) : 'N/A'}</span>
                                        <span className="font-medium">Avg. Job Cost:</span><span>${provider.avgJobCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                        <span className="font-medium">Total Spend:</span><span>${provider.totalSpend.toLocaleString()}</span>
                                    </div>
                                </Card>
                            ))}
                            {performanceData.length === 0 && (
                                <div className="text-center h-24 flex items-center justify-center text-muted-foreground">
                                    No provider performance data found for the selected filters.
                                </div>
                            )}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Provider</TableHead>
                                    <TableHead>Jobs Awarded</TableHead>
                                    <TableHead>Avg. Rating</TableHead>
                                    <TableHead>Avg. Job Cost</TableHead>
                                    <TableHead>Total Spend</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {performanceData.map(provider => (
                                    <TableRow key={provider.providerId}>
                                        <TableCell className="font-medium">{provider.providerName}</TableCell>
                                        <TableCell>{provider.jobsAwarded}</TableCell>
                                        <TableCell>{provider.avgRating > 0 ? provider.avgRating.toFixed(1) : 'N/A'}</TableCell>
                                        <TableCell>${provider.avgJobCost.toLocaleString(undefined, {maximumFractionDigits: 0})}</TableCell>
                                        <TableCell>${provider.totalSpend.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                                {performanceData.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24">
                                            No provider performance data found for the selected filters.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Jobs Awarded by Provider</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[300px] w-full">
                            <BarChart accessibilityLayer data={performanceData} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid horizontal={false} />
                                <YAxis dataKey="providerName" type="category" tickLine={false} axisLine={false} tickMargin={10} className="text-xs" width={120} tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 12)}...` : value} />
                                <XAxis dataKey="jobsAwarded" type="number" hide />
                                <ChartTooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                                <Bar dataKey="jobsAwarded" layout="vertical" radius={4}>
                                    <LabelList dataKey="jobsAwarded" position="right" offset={8} className="fill-foreground" fontSize={12} />
                                    {performanceData.map((entry) => (
                                        <Cell key={`cell-${entry.providerId}`} fill={cn(chartConfig[entry.providerName]?.color)} />
                                    ))}
                                </Bar>
                                <ChartLegend content={<ChartLegendContent nameKey="providerName" />} className="flex-wrap justify-center" />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Average Job Cost by Provider</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[300px] w-full">
                            <BarChart accessibilityLayer data={performanceData} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid horizontal={false} />
                                <YAxis dataKey="providerName" type="category" tickLine={false} axisLine={false} tickMargin={10} className="text-xs" width={120} tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 12)}...` : value} />
                                <XAxis dataKey="avgJobCost" type="number" hide />
                                <ChartTooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent formatter={(value) => `$${Number(value).toLocaleString()}`} />} />
                                <Bar dataKey="avgJobCost" layout="vertical" radius={4}>
                                    <LabelList
                                        dataKey="avgJobCost"
                                        position="right"
                                        offset={8}
                                        className="fill-foreground"
                                        fontSize={12}
                                        formatter={(value: number) => `$${value.toLocaleString(undefined, {maximumFractionDigits: 0})}`}
                                    />
                                    {performanceData.map((entry) => (
                                        <Cell key={`cell-${entry.providerId}`} fill={cn(chartConfig[entry.providerName]?.color)} />
                                    ))}
                                </Bar>
                                <ChartLegend content={<ChartLegendContent nameKey="providerName" />} className="flex-wrap justify-center" />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

    
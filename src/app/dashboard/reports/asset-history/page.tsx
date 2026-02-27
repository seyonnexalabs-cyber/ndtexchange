
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { jobs, clientAssets } from '@/lib/seed-data';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Printer, BarChart2, Calendar as CalendarIcon, Filter, ChevronLeft } from 'lucide-react';
import { parseISO, format } from 'date-fns';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from "@/components/ui/calendar";
import { cn, GLOBAL_DATE_FORMAT } from "@/lib/utils";
import { useMobile } from '@/hooks/use-mobile';


const reportSchema = z.object({
  assetIds: z.array(z.string()),
  dateRange: z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  }),
});

export default function AssetHistoryReportPage() {
    const form = useForm<z.infer<typeof reportSchema>>({
        resolver: zodResolver(reportSchema),
        defaultValues: {
          assetIds: [],
          dateRange: {
            from: undefined,
            to: undefined
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

    const filteredInspections = React.useMemo(() => {
        const { assetIds, dateRange } = filters;
        const allInspections = jobs.flatMap(j => j.inspections || []);

        return allInspections.filter(inspection => {
            const inspectionDate = parseISO(inspection.date);
            const assetMatch = assetIds.length === 0 || assetIds.includes(inspection.assetId);
            const dateMatch = dateRange?.from && dateRange?.to ? (inspectionDate >= dateRange.from && inspectionDate <= dateRange.to) : true;
            return assetMatch && dateMatch;
        });
    }, [filters]);
    
    return (
        <div className="space-y-6">
            <Link href={constructUrl("/dashboard/reports")} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Reports
            </Link>
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                        <FileText className="text-primary" />
                        Asset Inspection History
                    </h1>
                    <p className="text-muted-foreground mt-1">Generate a detailed history of all inspections for selected assets.</p>
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
                        <form className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             <FormField
                                control={form.control}
                                name="assetIds"
                                render={() => (
                                <FormItem>
                                    <FormLabel>Select Asset(s)</FormLabel>
                                    <ScrollArea className="h-40 w-full rounded-md border p-4">
                                        {clientAssets.map((asset) => (
                                        <FormField
                                            key={asset.id}
                                            control={form.control}
                                            name="assetIds"
                                            render={({ field }) => {
                                            return (
                                                <FormItem
                                                key={asset.id}
                                                className="flex flex-row items-start space-x-3 space-y-0 mb-2"
                                                >
                                                <FormControl>
                                                    <Checkbox
                                                    checked={field.value?.includes(asset.id)}
                                                    onCheckedChange={(checked) => {
                                                        return checked
                                                        ? field.onChange([...(field.value || []), asset.id])
                                                        : field.onChange(
                                                            field.value?.filter(
                                                                (value) => value !== asset.id
                                                            )
                                                            )
                                                    }}
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-normal text-sm">
                                                    {asset.name} ({asset.location})
                                                </FormLabel>
                                                </FormItem>
                                            )
                                            }}
                                        />
                                        ))}
                                    </ScrollArea>
                                    <FormMessage />
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
                                    <Button type="button" variant="outline" onClick={() => form.reset({ assetIds: [], dateRange: { from: undefined, to: undefined }})}>
                                        Clear Filters
                                    </Button>
                                </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart2 className="text-primary" /> Report Results</CardTitle>
                    <CardDescription>
                        Found {filteredInspections.length} inspection(s) matching your criteria.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isMobile ? (
                        <div className="space-y-4">
                            {filteredInspections.map(inspection => (
                                <Card key={inspection.id} className="p-4">
                                    <div className="flex justify-between items-start">
                                        <p className="font-semibold">{inspection.assetName}</p>
                                        <Badge variant={inspection.status === 'Completed' ? 'default' : 'secondary'}>{inspection.status}</Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-2">
                                        <p>Technique: <Badge variant="secondary" shape="rounded">{inspection.technique}</Badge></p>
                                        <p>Inspector: {inspection.inspector}</p>
                                        <p>Date: {format(new Date(inspection.date), GLOBAL_DATE_FORMAT)}</p>
                                    </div>
                                </Card>
                            ))}
                            {filteredInspections.length === 0 && (
                                <div className="text-center h-24 flex items-center justify-center text-muted-foreground">
                                    No inspections found matching your criteria.
                                </div>
                            )}
                        </div>
                    ) : (
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
                                        <TableCell><Badge variant="secondary" shape="rounded">{inspection.technique}</Badge></TableCell>
                                        <TableCell>{inspection.inspector}</TableCell>
                                        <TableCell>
                                            <Badge variant={inspection.status === 'Completed' ? 'default' : 'secondary'}>{inspection.status}</Badge>
                                        </TableCell>
                                        <TableCell>{format(new Date(inspection.date), GLOBAL_DATE_FORMAT)}</TableCell>
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
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

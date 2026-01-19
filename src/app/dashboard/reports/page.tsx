'use client';

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, BarChart, HardHat, Building, Settings2, Download, Calendar as CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { clientAssets } from '@/lib/placeholder-data';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';


const assetReportSchema = z.object({
  assetIds: z.array(z.string()).nonempty({
    message: "You must select at least one asset.",
  }),
  dateRange: z.object({
    from: z.date({ required_error: "A start date is required."}),
    to: z.date({ required_error: "An end date is required."}),
  }),
  format: z.enum(['PDF', 'CSV']),
});

const AssetHistoryReportDialog = ({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) => {
    const form = useForm<z.infer<typeof assetReportSchema>>({
        resolver: zodResolver(assetReportSchema),
        defaultValues: {
          assetIds: [],
          format: 'PDF',
          dateRange: {
            from: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
            to: new Date()
          }
        },
    });

    const onSubmit = (data: z.infer<typeof assetReportSchema>) => {
        toast({
            title: "Report Generation Started",
            description: "Your Asset Inspection History report is being generated.",
        });
        console.log(data);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Generate Asset Inspection History</DialogTitle>
                    <DialogDescription>
                        Select assets and a date range to generate the report.
                    </DialogDescription>
                </DialogHeader>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                        <div className="grid md:grid-cols-2 gap-6">
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
                            <div className="space-y-6">
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
                                                        {format(field.value.from, "LLL dd, y")} -{" "}
                                                        {format(field.value.to, "LLL dd, y")}
                                                    </>
                                                    ) : (
                                                    format(field.value.from, "LLL dd, y")
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
                                <FormField
                                    control={form.control}
                                    name="format"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Report Format</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a format" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="PDF">PDF</SelectItem>
                                                    <SelectItem value="CSV">CSV (Excel)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit">Generate Report</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

const ClientReports = () => {
    const [isAssetReportOpen, setAssetReportOpen] = useState(false);

    const reportTypes = [
        {
            title: "Asset Inspection History",
            description: "Generate a detailed history of all inspections for a specific asset or group of assets.",
            icon: <Building className="w-6 h-6 text-accent" />,
            action: () => setAssetReportOpen(true),
            disabled: false,
        },
        {
            title: "Job Cost & Duration Analysis",
            description: "Analyze costs and timelines across all completed jobs to identify trends and outliers.",
            icon: <BarChart className="w-6 h-6 text-accent" />,
            action: () => {},
            disabled: true,
        },
        {
            title: "Provider Performance Review",
            description: "Compare performance metrics for service providers, including on-time delivery and report quality.",
            icon: <HardHat className="w-6 h-6 text-accent" />,
            action: () => {},
            disabled: true,
        },
        {
            title: "Custom Report Builder",
            description: "Create your own report by selecting custom data points, filters, and date ranges.",
            icon: <Settings2 className="w-6 h-6 text-accent" />,
            action: () => {},
            disabled: true,
        }
    ];
    
    return (
    <div>
        <div className="grid gap-6 md:grid-cols-2">
            {reportTypes.map(report => (
                 <Card key={report.title}>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <div className="bg-accent/10 p-4 rounded-full">
                            {report.icon}
                        </div>
                        <div>
                            <CardTitle>{report.title}</CardTitle>
                            <CardDescription className="mt-1">{report.description}</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={report.action} disabled={report.disabled}>
                            <Download className="mr-2 h-4 w-4" />
                            Generate Report
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
        <Card className="mt-6 bg-muted/50">
            <CardHeader>
                <CardTitle>What is this page for?</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-2">
                <p>This <span className="font-semibold text-foreground">Reports</span> section is your business intelligence hub. It is designed for in-depth analysis and generating formal documentation from historical data.</p>
                <p>Your <span className="font-semibold text-foreground">Dashboard</span>, on the other hand, provides a real-time, at-a-glance overview of current statuses and recent activities.</p>
            </CardContent>
        </Card>
        <AssetHistoryReportDialog open={isAssetReportOpen} onOpenChange={setAssetReportOpen} />
    </div>
);
}


const InspectorReports = () => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><HardHat /> Inspection Report Generation</CardTitle>
            <CardDescription>This is your workspace to create, manage, and submit technical inspection reports for specific jobs.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">After completing a job, you will come here to find technique-specific digital forms (UT, MT, PAUT, etc.). You'll fill out your findings, attach any necessary data or images, and submit the final report for review and approval.</p>
        </CardContent>
    </Card>
);

const AdminReports = () => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart /> Platform Business Intelligence</CardTitle>
            <CardDescription>Generate reports on platform-wide metrics, including revenue, user activity, and marketplace trends.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">This area provides tools to generate formal business reports for stakeholders, conduct financial analysis, and track overall platform growth and health.</p>
        </CardContent>
    </Card>
);


export default function ReportsPage() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'client';

    const renderContentByRole = () => {
        switch (role) {
            case 'inspector':
                return <InspectorReports />;
            case 'admin':
                return <AdminReports />;
            case 'client':
            default:
                return <ClientReports />;
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <FileText />
                    Reports
                </h1>
            </div>
            {renderContentByRole()}
        </div>
    );
}

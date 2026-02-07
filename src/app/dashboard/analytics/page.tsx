
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LabelList } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { jobs, NDTTechniques, allUsers } from '@/lib/placeholder-data';
import { serviceProviders } from '@/lib/service-providers-data';
import { useMemo } from 'react';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { BarChart3, Users, ShieldCheck, FileCheck } from 'lucide-react';


const jobsByMonthChartConfig = {
  count: { label: "Jobs", color: "hsl(var(--accent))" },
} satisfies ChartConfig;

const revenueByMonthChartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--primary))" },
} satisfies ChartConfig;


const techniquesChartConfig = {
  count: { label: "Jobs" },
  UT: { label: "UT", color: "hsl(var(--chart-1))" },
  PAUT: { label: "PAUT", color: "hsl(var(--chart-2))" },
  RT: { label: "RT", color: "hsl(var(--chart-3))" },
  MT: { label: "MT", color: "hsl(var(--chart-4))" },
  PT: { label: "PT", color: "hsl(var(--chart-5))" },
  VT: { label: "VT", color: "hsl(var(--chart-1))" },
  ET: { label: "ET", color: "hsl(var(--chart-2))" },
  AE: { label: "AE", color: "hsl(var(--chart-3))" },
  LT: { label: "LT", color: "hsl(var(--chart-4))" },
  IR: { label: "IR", color: "hsl(var(--chart-5))" },
  APR: { label: "APR", color: "hsl(var(--chart-1))" },
  TOFD: { label: "TOFD", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;


export default function AnalyticsPage() {
    const analyticsData = useMemo(() => {
        const jobsByMonth: { [key: string]: number } = {};
        const revenueByMonth: { [key: string]: number } = {};
        const jobsByTechnique: { [key: string]: number } = {};

        jobs.forEach(job => {
            const month = new Date(job.postedDate).toLocaleString('default', { month: 'short', year: '2-digit' });
            jobsByMonth[month] = (jobsByMonth[month] || 0) + 1;
            jobsByTechnique[job.technique] = (jobsByTechnique[job.technique] || 0) + 1;

            if (job.status === 'Paid' || job.status === 'Completed') {
                 const awardedBid = job.bids?.find(b => b.status === 'Awarded');
                 if (awardedBid) {
                     revenueByMonth[month] = (revenueByMonth[month] || 0) + awardedBid.amount;
                 }
            }
        });

        const jobsByMonthData = Object.entries(jobsByMonth).map(([name, count]) => ({ name, count })).reverse();
        const revenueByMonthData = Object.entries(revenueByMonth).map(([name, revenue]) => ({ name, revenue })).reverse();
        const jobsByTechniqueData = Object.entries(jobsByTechnique).map(([name, count]) => ({ name, count, fill: `var(--color-${name})` }));

        const totalRevenue = Object.values(revenueByMonth).reduce((acc, val) => acc + val, 0);

        return { jobsByMonthData, revenueByMonthData, jobsByTechniqueData, totalRevenue };
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <BarChart3 className="text-primary" />
                    Platform Analytics
                </h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${analyticsData.totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">All-time revenue from completed jobs</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Providers</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{serviceProviders.length}</div>
                        <p className="text-xs text-muted-foreground">Active service providers</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                        <FileCheck className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{jobs.length}</div>
                        <p className="text-xs text-muted-foreground">All jobs created on the platform</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Jobs This Month</CardTitle>
                        <BarChart3 className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analyticsData.jobsByMonthData[0]?.count || 0}</div>
                        <p className="text-xs text-muted-foreground">New jobs created this month</p>
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Jobs Created Per Month</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <ChartContainer config={jobsByMonthChartConfig} className="h-[300px] w-full">
                            <BarChart data={analyticsData.jobsByMonthData}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                                <YAxis />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Bar dataKey="count" fill="var(--color-count)" radius={4}>
                                    <LabelList position="top" offset={4} className="fill-foreground" fontSize={12} />
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Revenue Per Month</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <ChartContainer config={revenueByMonthChartConfig} className="h-[300px] w-full">
                            <BarChart data={analyticsData.revenueByMonthData}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                                <YAxis tickFormatter={(value) => `$${value/1000}k`}/>
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4}>
                                    <LabelList
                                        position="top"
                                        offset={4}
                                        className="fill-foreground"
                                        fontSize={12}
                                        formatter={(value: number) => `$${(value / 1000).toFixed(1)}k`}
                                    />
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
             <div className="grid gap-6 mt-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Job Distribution by Technique</CardTitle>
                        <CardDescription>An overview of the most requested NDT techniques.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center">
                         <ChartContainer
                        config={techniquesChartConfig}
                        className="mx-auto aspect-square h-[350px]"
                        >
                        <PieChart>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent />}
                            />
                            <Pie
                            data={analyticsData.jobsByTechniqueData}
                            dataKey="count"
                            nameKey="name"
                            innerRadius={80}
                            strokeWidth={5}
                            >
                                {analyticsData.jobsByTechniqueData.map((entry) => (
                                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                                ))}
                                 <LabelList
                                    dataKey="count"
                                    className="fill-background font-semibold"
                                    stroke="none"
                                    fontSize={12}
                                />
                            </Pie>
                            <ChartLegend content={<ChartLegendContent nameKey="name" className="flex-wrap justify-center"/>} className="mt-4" />
                        </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
             </div>
        </div>
    );
}

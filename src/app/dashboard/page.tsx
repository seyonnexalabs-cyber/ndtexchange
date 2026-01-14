'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building, Briefcase, BellRing } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { assets, jobs, inspections } from "@/lib/placeholder-data";

const chartData = [
  { status: "Operational", count: assets.filter(a => a.status === 'Operational').length, fill: "var(--color-operational)" },
  { status: "Requires Inspection", count: assets.filter(a => a.status === 'Requires Inspection').length, fill: "var(--color-inspection)" },
  { status: "Under Repair", count: assets.filter(a => a.status === 'Under Repair').length, fill: "var(--color-repair)" },
];

const chartConfig = {
  count: {
    label: "Assets",
  },
  operational: {
    label: "Operational",
    color: "hsl(var(--chart-2))",
  },
  inspection: {
    label: "Requires Inspection",
    color: "hsl(var(--chart-4))",
  },
  repair: {
    label: "Under Repair",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;


export default function DashboardPage() {
  const upcomingInspections = inspections.filter(i => new Date(i.date) > new Date() && i.status === 'Scheduled');
  const recentActivities = [...inspections, ...jobs].sort((a,b) => new Date((a as any).date || (a as any).postedDate).getTime() - new Date((b as any).date || (b as any).postedDate).getTime()).reverse().slice(0, 5);
  
  return (
    <div className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assets.length}</div>
            <p className="text-xs text-muted-foreground">+2 since last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.filter(j => j.status === 'In Progress' || j.status === 'Posted').length}</div>
            <p className="text-xs text-muted-foreground">+1 open this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Inspections</CardTitle>
            <BellRing className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingInspections.length}</div>
            <p className="text-xs text-muted-foreground">Due within 30 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Recent Activity</CardTitle>
            <CardDescription>An overview of recent inspections and job updates.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivities.map(activity => {
                  if ('technique' in activity && 'assetName' in activity) { // It's an inspection
                    return (
                      <TableRow key={`insp-${activity.id}`}>
                        <TableCell><Badge variant="outline">Inspection</Badge></TableCell>
                        <TableCell className="font-medium">{activity.technique} on {activity.assetName}</TableCell>
                        <TableCell>{activity.date}</TableCell>
                        <TableCell><Badge variant={activity.status === 'Completed' ? 'default' : activity.status === 'Scheduled' ? 'secondary' : 'outline'}>{activity.status}</Badge></TableCell>
                      </TableRow>
                    )
                  } else if ('client' in activity) { // It's a job
                    return (
                       <TableRow key={`job-${activity.id}`}>
                         <TableCell><Badge variant="outline">Job</Badge></TableCell>
                         <TableCell className="font-medium">{activity.title}</TableCell>
                         <TableCell>{activity.postedDate}</TableCell>
                         <TableCell><Badge variant={activity.status === 'Posted' ? 'secondary' : activity.status === 'In Progress' ? 'default' : 'outline'}>{activity.status}</Badge></TableCell>
                       </TableRow>
                    )
                  }
                  return null;
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">Asset Status</CardTitle>
            <CardDescription>Distribution of asset operational status.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square h-[250px]"
            >
              <PieChart>
                <Tooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={chartData}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={60}
                  strokeWidth={5}
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

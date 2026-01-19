'use client';

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, BarChart, HardHat, Building, Settings2, Download } from 'lucide-react';
import Link from 'next/link';


const ClientReports = () => {
    const searchParams = useSearchParams();

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const reportTypes = [
        {
            title: "Asset Inspection History",
            description: "Generate a detailed history of all inspections for a specific asset or group of assets.",
            icon: <Building className="w-6 h-6 text-accent" />,
            href: constructUrl('/dashboard/reports/asset-history'),
            disabled: false,
        },
        {
            title: "Job Cost & Duration Analysis",
            description: "Analyze costs and timelines across all completed jobs to identify trends and outliers.",
            icon: <BarChart className="w-6 h-6 text-accent" />,
            href: constructUrl('/dashboard/reports/job-cost-analysis'),
            disabled: false,
        },
        {
            title: "Provider Performance Review",
            description: "Compare performance metrics for service providers, including on-time delivery and report quality.",
            icon: <HardHat className="w-6 h-6 text-accent" />,
            href: constructUrl('/dashboard/reports/provider-performance'),
            disabled: false,
        },
        {
            title: "Custom Report Builder",
            description: "Create your own report by selecting custom data points, filters, and date ranges.",
            icon: <Settings2 className="w-6 h-6 text-accent" />,
            href: constructUrl('/dashboard/reports/custom-report-builder'),
            disabled: false,
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
                        <Button asChild disabled={report.disabled}>
                            <Link href={report.href}>
                                <Download className="mr-2 h-4 w-4" />
                                Generate Report
                            </Link>
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

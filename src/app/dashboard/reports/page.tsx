'use client';

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, BarChart, HardHat, Building } from 'lucide-react';

const ClientReports = () => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building /> Asset & Job Reports</CardTitle>
            <CardDescription>Generate and download historical reports for your assets, job statuses, and financial summaries.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">This section will act as your business intelligence center. You will be able to create custom reports, filter by date ranges, and export data to PDF or CSV for compliance and analysis.</p>
        </CardContent>
    </Card>
);

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

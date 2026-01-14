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
            <p className="text-muted-foreground">Coming soon: You will be able to create custom reports, filter by date ranges, and export data to PDF or CSV for compliance and analysis.</p>
        </CardContent>
    </Card>
);

const InspectorReports = () => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><HardHat /> Inspection Report Generation</CardTitle>
            <CardDescription>This is your workspace to create, manage, and submit technical inspection reports for your jobs.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Coming soon: You will find technique-specific digital forms (UT, MT, PAUT, etc.) here to fill out your findings and submit them for review.</p>
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
            <p className="text-muted-foreground">Coming soon: This area will provide tools to generate formal business reports for stakeholders, financial analysis, and tracking platform growth.</p>
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
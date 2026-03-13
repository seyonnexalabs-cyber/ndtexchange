
'use client';
import * as React from 'react';
import { notFound, useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, FileText, Printer } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { cn, safeParseDate } from '@/lib/utils';
import Link from 'next/link';
import { useFirebase, useCollection, useMemoFirebase, useDoc, useUser } from '@/firebase';
import { collection, query, where, doc, onSnapshot, collectionGroup, limit } from 'firebase/firestore';
import type { Job, Client, NDTServiceProvider, PlatformUser, Inspection, Equipment, NDTTechnique } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

// --- VIEWER COMPONENTS ---

const UTReportViewer = ({ data }: { data: any }) => (
    <Card>
        <CardHeader>
            <CardTitle>Detailed Findings: Ultrasonic Testing (UT)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
                <h4 className="font-semibold text-sm mb-2">Equipment & Setup</h4>
                <div className="grid grid-cols-2 gap-4 text-sm p-4 border rounded-md">
                    <p><strong>Instrument:</strong> {data.equipmentUsed || 'N/A'}</p>
                    <p><strong>Calibration Block:</strong> {data.calibrationBlock || 'N/A'}</p>
                    <p><strong>Couplant:</strong> {data.couplant || 'N/A'}</p>
                    <p><strong>Surface Condition:</strong> {data.surfaceCondition || 'N/A'}</p>
                </div>
            </div>
             <div>
                <h4 className="font-semibold text-sm mb-2">Thickness Readings</h4>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Location / Reading Point</TableHead>
                            <TableHead>Thickness (mm)</TableHead>
                            <TableHead>Notes</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.findings?.map((finding: any, index: number) => (
                            <TableRow key={index}>
                                <TableCell>{finding.location}</TableCell>
                                <TableCell>{finding.thickness?.toFixed(3)}</TableCell>
                                <TableCell>{finding.notes}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
             <div>
                <h4 className="font-semibold text-sm mb-2">Summary</h4>
                <p className="text-sm text-muted-foreground p-4 border rounded-md bg-muted/50">{data.summary}</p>
            </div>
        </CardContent>
    </Card>
);

const MTReportViewer = ({ data }: { data: any }) => (
    <Card>
        <CardHeader>
            <CardTitle>Detailed Findings: Magnetic Particle Testing (MT)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
                <h4 className="font-semibold text-sm mb-2">Equipment & Setup</h4>
                <div className="grid grid-cols-2 gap-4 text-sm p-4 border rounded-md">
                    <p><strong>Equipment:</strong> {data.equipment || 'N/A'}</p>
                    <p><strong>Medium:</strong> {data.media || 'N/A'}</p>
                    <p><strong>Field Strength:</strong> {data.fieldStrength || 'N/A'}</p>
                    <p><strong>Lighting:</strong> {data.lighting || 'N/A'}</p>
                </div>
            </div>
            <div>
                <h4 className="font-semibold text-sm mb-2">Summary</h4>
                <p className="text-sm text-muted-foreground p-4 border rounded-md bg-muted/50">{data.summary}</p>
            </div>
        </CardContent>
    </Card>
);

const GenericReportViewer = ({ data }: { data: any }) => (
    <Card>
        <CardHeader><CardTitle>Summary of Findings</CardTitle></CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground p-4 border rounded-md bg-muted/50">{data.summary || 'No detailed template available for this technique. See summary for findings.'}</p>
        </CardContent>
    </Card>
);

const ReportBody = ({ technique, data }: { technique: string; data: any }) => {
    switch (technique) {
        case 'UT':
        case 'PAUT':
        case 'TOFD':
            return <UTReportViewer data={data} />;
        case 'MT':
            return <MTReportViewer data={data} />;
        default:
            return <GenericReportViewer data={data} />;
    }
};

export default function ViewReportPage() {
    const params = useParams();
    const { reportId } = params as { reportId: string };
    const { firestore } = useFirebase();
    const router = useRouter();
    const searchParams = useSearchParams();

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    };

    const [report, setReport] = React.useState<any | null>(null);
    const [isLoadingReport, setIsLoadingReport] = React.useState(true);
    const [reportError, setReportError] = React.useState<Error | null>(null);

    React.useEffect(() => {
        if (!firestore || !reportId) {
            setIsLoadingReport(false);
            return;
        }

        const reportsRef = collectionGroup(firestore, 'reports');
        const q = query(reportsRef, where('id', '==', reportId), limit(1));

        const unsubscribe = onSnapshot(q, 
            (snapshot) => {
                if (!snapshot.empty) {
                    const reportDoc = snapshot.docs[0];
                    setReport(reportDoc.data());
                } else {
                    setReport(null);
                }
                setIsLoadingReport(false);
                setReportError(null);
            },
            (error) => {
                console.error("Error fetching report:", error);
                setReportError(error);
                setIsLoadingReport(false);
            }
        );

        return () => unsubscribe();
    }, [firestore, reportId]);

    const { data: inspection, isLoading: isLoadingInspection } = useDoc<Inspection>(
        useMemoFirebase(() => (firestore && report?.inspectionId ? doc(firestore, 'inspections', report.inspectionId) : null), [firestore, report])
    );
    const { data: job, isLoading: isLoadingJob } = useDoc<Job>(
        useMemoFirebase(() => (firestore && report?.jobId ? doc(firestore, 'jobs', report.jobId) : null), [firestore, report])
    );
    const { data: asset, isLoading: isLoadingAsset } = useDoc<any>(
        useMemoFirebase(() => (firestore && report?.assetId ? doc(firestore, 'assets', report.assetId) : null), [firestore, report])
    );
    const { data: client, isLoading: isLoadingClient } = useDoc<Client>(
        useMemoFirebase(() => (firestore && job?.clientCompanyId ? doc(firestore, 'companies', job.clientCompanyId) : null), [firestore, job])
    );
    const { data: provider, isLoading: isLoadingProvider } = useDoc<NDTServiceProvider>(
        useMemoFirebase(() => (firestore && job?.providerCompanyId ? doc(firestore, 'companies', job.providerCompanyId) : null), [firestore, job])
    );
    const { data: inspector, isLoading: isLoadingInspector } = useDoc<PlatformUser>(
        useMemoFirebase(() => (firestore && report?.createdBy ? doc(firestore, 'users', report.createdBy) : null), [firestore, report])
    );

    const isLoading = isLoadingReport || isLoadingJob || isLoadingInspection || isLoadingAsset || isLoadingClient || isLoadingProvider || isLoadingInspector;
    
    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-[200px] w-full" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        );
    }
    
    if (!report) {
        notFound();
    }
    
    const reportDate = safeParseDate(report.createdAt);
    
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Link href={constructUrl(`/dashboard/my-jobs/${job?.id}`)} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "print-hidden")}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Job Details
            </Link>
            <div className="flex justify-between items-center print-hidden">
                <h1 className="text-2xl font-headline font-bold">Inspection Report</h1>
                <Button onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Print / Save as PDF</Button>
            </div>
            
            <div className="printable-area">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Inspection Report: {job?.title}</CardTitle>
                        <CardDescription>Report ID: {report.id}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-3 gap-6 text-sm">
                            <div><p className="font-semibold text-muted-foreground">Client</p><p>{client?.name}</p></div>
                            <div><p className="font-semibold text-muted-foreground">Service Provider</p><p>{provider?.name}</p></div>
                            <div><p className="font-semibold text-muted-foreground">Report Date</p><p>{reportDate ? format(reportDate, 'PPP') : 'N/A'}</p></div>
                            <div><p className="font-semibold text-muted-foreground">Asset</p><p>{asset?.name}</p></div>
                            <div><p className="font-semibold text-muted-foreground">Asset Location</p><p>{asset?.location}</p></div>
                            <div><p className="font-semibold text-muted-foreground">Technique</p><p><Badge variant="secondary">{inspection?.technique}</Badge></p></div>
                            <div><p className="font-semibold text-muted-foreground">Inspector</p><p>{inspector?.name}</p></div>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-6">
                    <ReportBody technique={inspection?.technique || ''} data={report.reportData || {}} />
                </div>
            </div>
        </div>
    );
};

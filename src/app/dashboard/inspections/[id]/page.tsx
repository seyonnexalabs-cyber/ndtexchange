
'use client';

import * as React from 'react';
import { useMemo } from 'react';
import { notFound, useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';
import { inspections, jobs, Inspection } from '@/lib/placeholder-data';
import { serviceProviders } from '@/lib/service-providers-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, FileText, User, Calendar, HardHat, Building, CheckCircle, XCircle, Maximize } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import UniformDocumentViewer, { ViewerDocument } from '@/app/dashboard/components/uniform-document-viewer';

const inspectionStatusVariants: Record<Inspection['status'], 'success' | 'default' | 'secondary' | 'destructive' | 'outline'> = {
    'Scheduled': 'secondary',
    'Completed': 'success',
    'Requires Review': 'destructive'
};

export default function InspectionDetailPage() {
    const params = useParams();
    const { id } = params;
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [isViewerOpen, setIsViewerOpen] = React.useState(false);

    const inspection = useMemo(() => inspections.find(i => i.id === id), [id]);
    const job = useMemo(() => jobs.find(j => j.assetIds?.includes(inspection?.assetId ?? '')), [inspection]);
    const provider = useMemo(() => serviceProviders.find(p => p.id === job?.providerId), [job]);

    const allDocuments: ViewerDocument[] = React.useMemo(() => {
        const docs: ViewerDocument[] = [];
        docs.push({ name: `Inspection_Report_${inspection?.id}.pdf`, source: 'Provider (Main Report)' });
        docs.push({ name: 'calibration_record.pdf', source: 'Provider' });
        docs.push({ name: 'technician_certs.pdf', source: 'Provider' });
        return docs;
    }, [inspection]);

    if (!inspection || !job) {
        notFound();
    }
    
    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const handleApprove = () => {
        toast({
            title: "Report Approved",
            description: `The inspection report for ${inspection.assetName} has been approved.`,
        });
        // In a real app, update status in the backend.
    }

    const handleReject = () => {
        toast({
            variant: "destructive",
            title: "Revisions Requested",
            description: `The report has been sent back to the provider for revisions.`,
        });
         // In a real app, update status in the backend.
    }

    return (
        <div>
            <Button asChild variant="outline" size="sm" className="mb-4">
                <Link href={constructUrl("/dashboard/inspections")}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Inspections
                </Link>
            </Button>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-2xl font-headline flex items-center gap-3">
                                        <FileText />
                                        Audit Report for {inspection.assetName}
                                    </CardTitle>
                                    <CardDescription>Inspection ID: <span className="font-bold text-foreground">{inspection.id}</span></CardDescription>
                                </div>
                                <Badge variant={inspectionStatusVariants[inspection.status]}>{inspection.status}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                           <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold">Available Documents ({allDocuments.length})</h3>
                                    <Button onClick={() => setIsViewerOpen(true)} disabled={allDocuments.length === 0}>
                                        <Maximize className="mr-2 h-4 w-4" />
                                        View All Documents
                                    </Button>
                                </div>
                                <ScrollArea className="space-y-2 rounded-md border p-2 max-h-48">
                                    {allDocuments.map((doc) => (
                                        <div key={doc.name} className="flex items-center gap-2 p-2">
                                            <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                                            <span className="text-sm font-medium truncate" title={doc.name}>{doc.name}</span>
                                        </div>
                                    ))}
                                </ScrollArea>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                         <CardHeader>
                            <CardTitle>Auditor Actions</CardTitle>
                            <CardDescription>Review the report and provide your decision.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div>
                                <Label htmlFor="audit-comments">Comments for Provider (if requesting revisions)</Label>
                                <Textarea id="audit-comments" placeholder="e.g., 'Please clarify the UT readings in section 3.2. The provided image is unclear...'" className="mt-2 min-h-[120px]"/>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="destructive" onClick={handleReject}>
                                <XCircle className="mr-2"/>
                                Request Revisions
                            </Button>
                             <Button className="bg-green-600 hover:bg-green-700" onClick={handleApprove}>
                                <CheckCircle className="mr-2"/>
                                Approve Report
                            </Button>
                        </CardFooter>
                    </Card>

                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Inspection Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                             <div className="flex items-start">
                                <HardHat className="w-4 h-4 mr-3 mt-1 text-muted-foreground"/>
                                <div>
                                    <p className="font-semibold">Technique</p>
                                    <p className="text-muted-foreground">{inspection.technique}</p>
                                </div>
                            </div>
                             <div className="flex items-start">
                                <User className="w-4 h-4 mr-3 mt-1 text-muted-foreground"/>
                                <div>
                                    <p className="font-semibold">Inspector</p>
                                    <p className="text-muted-foreground">{inspection.inspector}</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <Calendar className="w-4 h-4 mr-3 mt-1 text-muted-foreground"/>
                                <div>
                                    <p className="font-semibold">Inspection Date</p>
                                    <p className="text-muted-foreground">{inspection.date}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Job Context</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex items-start">
                                <Building className="w-4 h-4 mr-3 mt-1 text-muted-foreground"/>
                                <div>
                                    <p className="font-semibold">Client</p>
                                    <p className="text-muted-foreground">{job.client}</p>
                                </div>
                            </div>
                             <div className="flex items-start">
                                <HardHat className="w-4 h-4 mr-3 mt-1 text-muted-foreground"/>
                                <div>
                                    <p className="font-semibold">Service Provider</p>
                                    <p className="text-muted-foreground">{provider?.name}</p>
                                </div>
                            </div>
                            <Separator />
                             <Button asChild variant="outline" className="w-full">
                                <Link href={constructUrl(`/dashboard/my-jobs/${job.id}`)}>
                                    View Full Job Details
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <UniformDocumentViewer 
                isOpen={isViewerOpen}
                onOpenChange={setIsViewerOpen}
                documents={allDocuments}
                title={`Documents for Inspection ${inspection.id}`}
                description="Securely view all reports and documents associated with this inspection."
            />
        </div>
    );
}

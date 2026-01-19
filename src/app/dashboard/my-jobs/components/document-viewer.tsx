
'use client';

import * as React from 'react';
import { Job, JobDocument } from '@/lib/placeholder-data';
import { Button } from '@/components/ui/button';
import { FileText, Maximize, Upload, Download, FileUp } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from '@/components/ui/scroll-area';

interface DocumentViewerProps {
    job: Job;
}

type CategorizedDocument = JobDocument & { 
    source: 'Client' | 'Provider' | 'Auditor' 
};

const DocumentList = ({ documents, title }: { documents: CategorizedDocument[], title: string }) => {
    if (documents.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-10">
                No {title} found for this job.
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {documents.map(doc => (
                <div key={doc.name} className="flex items-center justify-between rounded-md border p-3">
                    <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">Source: {doc.source}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon">
                        <Download className="w-4 h-4" />
                    </Button>
                </div>
            ))}
        </div>
    );
};

export default function DocumentViewer({ job }: DocumentViewerProps) {
    const reportSubmitted = ['Report Submitted', 'Under Audit', 'Audit Approved', 'Client Review', 'Client Approved', 'Completed', 'Paid'].includes(job.status);

    const allDocuments: CategorizedDocument[] = React.useMemo(() => {
        const docs: CategorizedDocument[] = [];
        job.documents?.forEach(doc => {
            docs.push({ ...doc, source: 'Client' });
        });

        if (reportSubmitted) {
            docs.push({ name: `Inspection_Report_${job.id}.pdf`, url: '#', source: 'Provider' });
        }
        
        if ((job.status === 'Audit Approved' || job.status === 'Under Audit') && (job.workflow === 'level3' || job.workflow === 'auto')) {
             docs.push({ name: `Audit_Findings_${job.id}.pdf`, url: '#', source: 'Auditor' });
        }
        return docs;
    }, [job, reportSubmitted]);

    const clientDocs = allDocuments.filter(d => d.source === 'Client');
    const providerDocs = allDocuments.filter(d => d.source === 'Provider');
    const auditorDocs = allDocuments.filter(d => d.source === 'Auditor');

    if (allDocuments.length === 0) {
         return (
            <div className="relative aspect-[4/3] sm:aspect-video bg-muted/30 rounded-lg flex flex-col items-center justify-center border-2 border-dashed">
                <FileUp className="w-16 h-16 text-muted-foreground/70" />
                <p className="mt-4 text-sm font-medium text-muted-foreground">No documents have been uploaded for this job yet.</p>
            </div>
        );
    }
    
    return (
        <Dialog>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Available Documents ({allDocuments.length})</h3>
                    <DialogTrigger asChild>
                        <Button>
                            <Maximize className="mr-2 h-4 w-4" />
                            View All Documents
                        </Button>
                    </DialogTrigger>
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

            <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Document Viewer</DialogTitle>
                    <DialogDescription>
                        Review all documents associated with job: {job.title}
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="client" className="flex-grow flex flex-col min-h-0">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="client">Client Documents ({clientDocs.length})</TabsTrigger>
                        <TabsTrigger value="provider" disabled={providerDocs.length === 0}>Provider Reports ({providerDocs.length})</TabsTrigger>
                        <TabsTrigger value="auditor" disabled={auditorDocs.length === 0}>Auditor Files ({auditorDocs.length})</TabsTrigger>
                    </TabsList>
                    <ScrollArea className="flex-grow mt-4">
                         <TabsContent value="client">
                            <DocumentList documents={clientDocs} title="Client Documents"/>
                        </TabsContent>
                        <TabsContent value="provider">
                            <DocumentList documents={providerDocs} title="Provider Reports"/>
                        </TabsContent>
                        <TabsContent value="auditor">
                             <DocumentList documents={auditorDocs} title="Auditor Files"/>
                        </TabsContent>
                    </ScrollArea>
                </Tabs>
                <DialogFooter>
                    <DialogTrigger asChild>
                        <Button variant="outline">Close</Button>
                    </DialogTrigger>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

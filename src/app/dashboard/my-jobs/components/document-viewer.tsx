'use client';

import * as React from 'react';
import { Job, JobDocument } from '@/lib/placeholder-data';
import { Button } from '@/components/ui/button';
import { FileText, Maximize, FileUp, Shield, HelpCircle } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface DocumentViewerProps {
    job: Job;
}

type CategorizedDocument = JobDocument & { 
    source: 'Client' | 'Provider' | 'Auditor' 
};

const DocumentList = ({ documents, onSelect, selectedDoc, title }: { documents: CategorizedDocument[], onSelect: (doc: CategorizedDocument) => void, selectedDoc: CategorizedDocument | null, title: string }) => {
    if (documents.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-10">
                No {title} found for this job.
            </div>
        )
    }

    return (
        <div className="space-y-2">
            {documents.map(doc => (
                <button
                    key={doc.name}
                    onClick={() => onSelect(doc)}
                    className={cn(
                        "w-full flex items-center gap-3 rounded-md border p-3 text-left transition-colors",
                        selectedDoc?.name === doc.name ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                    )}
                >
                    <FileText className="w-5 h-5" />
                    <div>
                        <p className="text-sm font-medium">{doc.name}</p>
                        <p className="text-xs">{doc.source}</p>
                    </div>
                </button>
            ))}
        </div>
    );
};

export default function DocumentViewer({ job }: DocumentViewerProps) {
    const [selectedDoc, setSelectedDoc] = React.useState<CategorizedDocument | null>(null);

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

    React.useEffect(() => {
        if (allDocuments.length > 0 && !selectedDoc) {
            setSelectedDoc(allDocuments[0]);
        }
        if (allDocuments.length === 0) {
            setSelectedDoc(null);
        }
    }, [allDocuments, selectedDoc]);

    if (allDocuments.length === 0) {
         return (
            <div className="relative aspect-[4/3] sm:aspect-video bg-muted/30 rounded-lg flex flex-col items-center justify-center border-2 border-dashed">
                <FileUp className="w-16 h-16 text-muted-foreground/70" />
                <p className="mt-4 text-sm font-medium text-muted-foreground">No documents have been uploaded for this job yet.</p>
            </div>
        );
    }
    
    return (
        <Dialog onOpenChange={(isOpen) => { if (!isOpen) setSelectedDoc(allDocuments[0] || null)}}>
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

            <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle>Secure Document Viewer</DialogTitle>
                    <DialogDescription>
                        Review all documents associated with job: {job.title}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-4 flex-grow min-h-0 gap-4 p-6">
                    <div className="md:col-span-1 flex flex-col gap-4">
                         <div className="bg-primary/10 text-primary p-3 rounded-lg flex items-center gap-3 text-sm">
                            <Shield className="w-5 h-5 shrink-0"/>
                            <div>
                                <p className="font-semibold">Secure Viewing</p>
                                <p className="text-xs">Downloads and screenshots are disabled.</p>
                            </div>
                        </div>
                        <Tabs defaultValue="client" className="flex-grow flex flex-col min-h-0">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="client">Client</TabsTrigger>
                                <TabsTrigger value="provider" disabled={providerDocs.length === 0}>Provider</TabsTrigger>
                                <TabsTrigger value="auditor" disabled={auditorDocs.length === 0}>Auditor</TabsTrigger>
                            </TabsList>
                            <ScrollArea className="flex-grow mt-4">
                                <TabsContent value="client">
                                    <DocumentList documents={clientDocs} onSelect={setSelectedDoc} selectedDoc={selectedDoc} title="Client Documents"/>
                                </TabsContent>
                                <TabsContent value="provider">
                                    <DocumentList documents={providerDocs} onSelect={setSelectedDoc} selectedDoc={selectedDoc} title="Provider Reports"/>
                                </TabsContent>
                                <TabsContent value="auditor">
                                    <DocumentList documents={auditorDocs} onSelect={setSelectedDoc} selectedDoc={selectedDoc} title="Auditor Files"/>
                                </TabsContent>
                            </ScrollArea>
                        </Tabs>
                    </div>
                    <div className="md:col-span-3 bg-muted/50 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                        {selectedDoc ? (
                             <div className="w-full h-full flex flex-col items-center justify-center p-8">
                                <FileText className="w-24 h-24 text-muted-foreground/50"/>
                                <h3 className="text-lg font-bold mt-4">{selectedDoc.name}</h3>
                                <p className="text-sm text-muted-foreground">Document preview would appear here.</p>
                                <p className="text-xs text-muted-foreground mt-2">(This is a mock-up for demonstration)</p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <HelpCircle className="w-12 h-12 text-muted-foreground/50 mx-auto"/>
                                <p className="mt-4 text-muted-foreground">Select a document to view</p>
                            </div>
                        )}
                        <div 
                            className="absolute inset-0 bg-transparent"
                            onContextMenu={(e) => e.preventDefault()}
                            style={{ userSelect: 'none', pointerEvents: 'none' }}
                         />
                    </div>
                </div>
                <DialogFooter className="p-6 pt-0 border-t">
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

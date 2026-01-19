
'use client';

import { Job, JobDocument } from '@/lib/placeholder-data';
import { Button } from '@/components/ui/button';
import { FileText, Maximize, FileUp, Upload } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DocumentViewerProps {
    job: Job;
    isInspector: boolean;
    reportSubmitted: boolean;
}

export default function DocumentViewer({ job, isInspector, reportSubmitted }: DocumentViewerProps) {
    const reportName = `Inspection_Report_${job.id}.pdf`;
    
    const allDocuments: JobDocument[] = [];
    if (reportSubmitted) {
        // Ensure the main report is always first
        allDocuments.push({ name: reportName, url: '#' });
    }
    if (job.documents) {
        // Add other documents, avoiding duplicates if names match
        job.documents.forEach(doc => {
            if (!allDocuments.some(d => d.name === doc.name)) {
                allDocuments.push(doc);
            }
        });
    }
    
    const defaultTab = allDocuments.length > 0 ? allDocuments[0].name : '';

    return (
        <Dialog>
            {reportSubmitted ? (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold">Available Documents ({allDocuments.length})</h3>
                        {allDocuments.length > 0 && (
                            <DialogTrigger asChild>
                                <Button>
                                    <Maximize className="mr-2 h-4 w-4" />
                                    View All Documents
                                </Button>
                            </DialogTrigger>
                        )}
                    </div>
                    <div className="space-y-2 rounded-md border p-2 max-h-48 overflow-y-auto">
                        {allDocuments.map((doc) => (
                             <div key={doc.name} className="flex items-center gap-2 p-2">
                                <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                                <span className="text-sm font-medium truncate" title={doc.name}>{doc.name}</span>
                            </div>
                        ))}
                         {allDocuments.length === 0 && (
                            <p className="p-2 text-sm text-muted-foreground">No documents are associated with this report.</p>
                         )}
                    </div>
                </div>
            ) : (
                <div className="relative aspect-[4/3] sm:aspect-video bg-muted/30 rounded-lg flex flex-col items-center justify-center border-2 border-dashed">
                    <FileUp className="w-16 h-16 text-muted-foreground/70" />
                    <p className="mt-4 text-sm font-medium text-muted-foreground">No report has been submitted yet.</p>
                    {isInspector && (
                        <Button variant="outline" className="mt-4">
                            <Upload className="mr-2 h-4 w-4" /> Upload Report
                        </Button>
                    )}
                </div>
            )}
            <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Document Viewer</DialogTitle>
                    <DialogDescription>
                        Review all documents associated with job: {job.title}
                    </DialogDescription>
                </DialogHeader>
                 {allDocuments.length > 0 && (
                    <Tabs defaultValue={defaultTab} className="flex-grow flex flex-col min-h-0">
                        <TabsList className="w-full justify-start overflow-x-auto">
                            {allDocuments.map((doc) => (
                                <TabsTrigger key={doc.name} value={doc.name} className="truncate max-w-[200px] shrink-0">{doc.name}</TabsTrigger>
                            ))}
                        </TabsList>
                        <div className="flex-grow mt-4 overflow-y-auto">
                            {allDocuments.map((doc) => (
                                <TabsContent key={doc.name} value={doc.name} className="h-full m-0">
                                    <div className="w-full h-full bg-gray-800 flex flex-col items-center justify-center text-white p-4 rounded-md">
                                        <FileText className="w-24 h-24" />
                                        <h2 className="text-2xl font-bold mt-4 text-center">{doc.name}</h2>
                                        <p className="mt-2 text-center">A full-featured PDF document viewer for this document would be implemented here.</p>
                                    </div>
                                </TabsContent>
                            ))}
                        </div>
                    </Tabs>
                 )}
            </DialogContent>
        </Dialog>
    );
}


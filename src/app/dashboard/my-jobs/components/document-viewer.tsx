'use client';

import { Job } from '@/lib/placeholder-data';
import { Button } from '@/components/ui/button';
import { FileText, Maximize, FileUp, Upload } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import Image from 'next/image';

interface DocumentViewerProps {
    job: Job;
    isInspector: boolean;
    reportSubmitted: boolean;
}

export default function DocumentViewer({ job, isInspector, reportSubmitted }: DocumentViewerProps) {
    const reportName = `Inspection_Report_${job.id}.pdf`;
    const submittedTimestamp = job.history?.find(h => h.action.includes('submitted'))?.timestamp || 'N/A';

    return (
        <Dialog>
            {reportSubmitted ? (
                <DialogTrigger asChild>
                     <div className="relative group aspect-[4/3] sm:aspect-video bg-muted/30 rounded-lg flex flex-col items-center justify-center border-2 border-dashed cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors">
                        <FileText className="w-16 h-16 text-muted-foreground/70" />
                        <p className="mt-2 text-sm font-semibold">{reportName}</p>
                        <p className="text-xs text-muted-foreground">Submitted on {submittedTimestamp}</p>
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button onClick={(e) => e.stopPropagation()}>
                                <Maximize className="mr-2 h-4 w-4"/>
                                View Fullscreen
                            </Button>
                        </div>
                    </div>
                </DialogTrigger>
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
            <DialogContent className="max-w-5xl h-[90vh]">
                 {/* This is a mock viewer. In a real app, you would use a library like react-pdf */}
                 <div className="w-full h-full bg-gray-800 flex flex-col items-center justify-center text-white p-4">
                    <FileText className="w-24 h-24" />
                    <h2 className="text-2xl font-bold mt-4 text-center">{reportName}</h2>
                    <p className="mt-2 text-center">A full-featured PDF document viewer would be implemented here.</p>
                 </div>
            </DialogContent>
        </Dialog>
    );
}

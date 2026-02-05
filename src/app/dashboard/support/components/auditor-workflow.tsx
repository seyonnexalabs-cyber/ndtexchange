'use client';
import React from 'react';
import { ClipboardList, FileSearch, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

const Step = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
    <div className="flex flex-col items-center text-center p-4 max-w-xs mx-auto">
        <div className="bg-primary/10 text-primary p-4 rounded-full mb-4">
            <Icon className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold font-headline text-primary">{title}</h3>
        <p className="mt-1 text-muted-foreground text-sm">{description}</p>
    </div>
);

const AuditorWorkflow = () => {
    const coreSteps = [
        { icon: ClipboardList, title: '1. Monitor Queue', description: 'Reports from jobs requiring Level III review will automatically appear in your Audit Queue.' },
        { icon: FileSearch, title: '2. Review Report', description: 'Open the job to securely view the inspection report and all associated documents.' },
        { icon: CheckCircle, title: '3. Approve Report', description: 'If the report meets all standards and requirements, approve it to send it to the client for final review.' },
        { icon: XCircle, title: '4. Request Revisions', description: 'If the report is incomplete or incorrect, reject it with comments to send it back to the provider for revision.' },
    ];

    return (
        <div className="space-y-12">
            <div>
                <h2 className="text-2xl font-headline font-semibold text-center mb-2">The Auditor Workflow</h2>
                <p className="text-muted-foreground text-center max-w-2xl mx-auto">Your role is to provide expert oversight and ensure compliance. Here is your streamlined process.</p>
                <div className="relative w-full max-w-7xl mx-auto mt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        {coreSteps.map((stage, index) => (
                            <React.Fragment key={stage.title}>
                                <div className="flex-1 min-w-0">
                                    <Step icon={stage.icon} title={stage.title} description={stage.description} />
                                </div>
                                {index < coreSteps.length - 1 && (
                                    <div className="hidden md:flex flex-shrink-0 mx-4 text-muted-foreground/50">
                                        <ArrowRight className="w-8 h-8" />
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditorWorkflow;

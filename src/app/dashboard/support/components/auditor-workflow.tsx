'use client';
import React from 'react';
import { ClipboardList, FileSearch, CheckCircle, XCircle } from 'lucide-react';
import { FeatureCard } from '@/app/components/feature-card';

const AuditorWorkflow = () => {
    const coreSteps = [
        { icon: ClipboardList, title: '1. Monitor Queue', description: 'Reports from jobs requiring Level III review will automatically appear in your Reports page.' },
        { icon: FileSearch, title: '2. Review Report', description: 'Open the job to securely view the inspection report and all associated documents.' },
        { icon: CheckCircle, title: '3. Approve Report', description: 'If the report meets all standards and requirements, approve it to send it to the client for final review.' },
        { icon: XCircle, title: '4. Request Revisions', description: 'If the report is incomplete or incorrect, reject it with comments to send it back to the provider for revision.' },
    ];

    return (
        <div className="space-y-12">
            <div>
                <h2 className="text-2xl font-headline font-semibold text-center mb-2">The Auditor Workflow</h2>
                <p className="text-muted-foreground text-center max-w-2xl mx-auto">Your role is to provide expert oversight and ensure compliance. Here is your streamlined process.</p>
                 <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                    {coreSteps.map((step) => (
                        <FeatureCard
                            key={step.title}
                            icon={<step.icon className="w-8 h-8 text-primary" />}
                            title={step.title}
                            description={step.description}
                            cardClass="text-center"
                            iconContainerClass="bg-primary/10"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AuditorWorkflow;

'use client';
import React from 'react';
import { Users, Wrench, Search, Briefcase, FileText, ArrowRight } from 'lucide-react';

const Step = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
    <div className="flex flex-col items-center text-center p-4 max-w-xs mx-auto">
        <div className="bg-primary/10 text-primary p-4 rounded-full mb-4">
            <Icon className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold font-headline text-primary">{title}</h3>
        <p className="mt-1 text-muted-foreground text-sm">{description}</p>
    </div>
);

const InspectorWorkflow = () => {
    const coreSteps = [
        { icon: Users, title: '1. Build Your Team', description: 'Add your technicians and manage their certifications in the Technicians roster.' },
        { icon: Wrench, title: '2. Log Equipment', description: 'Log all your inspection equipment and track calibration schedules.' },
        { icon: Search, title: '3. Find & Bid on Jobs', description: 'Browse the marketplace for jobs that match your expertise and submit competitive bids.' },
        { icon: Briefcase, title: '4. Assign Resources', description: 'Once a job is awarded, assign your available technicians and calibrated equipment.' },
        { icon: FileText, title: '5. Inspect & Report', description: 'Perform the inspection and use the platform to submit your digital reports for client review.' },
    ];

    return (
        <div className="space-y-12">
            <div>
                <h2 className="text-2xl font-headline font-semibold text-center mb-2">The Service Provider Workflow</h2>
                <p className="text-muted-foreground text-center max-w-2xl mx-auto">From managing your company\'s resources to winning and completing jobs, here’s how to leverage the platform.</p>
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

export default InspectorWorkflow;

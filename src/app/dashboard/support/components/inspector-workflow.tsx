'use client';
import React from 'react';
import { Users, Wrench, Search, Briefcase, FileText } from 'lucide-react';
import { FeatureCard } from '@/app/components/feature-card';

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
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 max-w-7xl mx-auto">
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

export default InspectorWorkflow;

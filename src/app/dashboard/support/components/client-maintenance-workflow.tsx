'use client';

import React from 'react';
import {
  FilePlus2,
  Search,
  Award,
  Monitor,
  CheckCircle,
  ClipboardList,
  TrendingUp,
  TriangleAlert,
  CalendarCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FeatureCard } from '@/app/components/feature-card';

const MaintenanceType = ({ icon: Icon, title, description, steps, iconBg, iconColor }: { 
    icon: React.ElementType, 
    title: string, 
    description: string, 
    steps: string[],
    iconBg?: string,
    iconColor?: string,
}) => (
    <div className={`p-6 rounded-lg border bg-card`}>
        <div className="flex items-center gap-4">
            <div className={cn('p-3 rounded-full w-fit', iconBg)}>
                {<Icon className={cn("w-6 h-6", iconColor)} />}
            </div>
            <h3 className="text-xl font-headline font-semibold">{title}</h3>
        </div>
        <p className="mt-4 text-muted-foreground">{description}</p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {steps.map(step => (
                <li key={step} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{step}</span>
                </li>
            ))}
        </ul>
    </div>
);


const ClientMaintenanceWorkflow = () => {
    const coreSteps = [
        { icon: Search, title: '1. Identify Need', description: 'Assets are flagged automatically or manually, prompting action.' },
        { icon: FilePlus2, title: '2. Create Job', description: 'A detailed scope of work is created and posted internally or to the marketplace.' },
        { icon: Award, title: '3. Procure Service', description: 'Bids are reviewed and a qualified service provider is awarded the job.' },
        { icon: Monitor, title: '4. Monitor & Approve', description: 'Progress is tracked in real-time, and final reports are reviewed for approval.' },
    ];

    const maintenanceTypes = [
        { 
            icon: ClipboardList, 
            title: 'Shutdown / Turnaround', 
            description: 'For large-scale, planned events covering multiple assets.',
            steps: [
                'Review asset list sorted by "Next Inspection" date to build scope.',
                'Create a single job covering all assets in the shutdown.',
                'Invite providers to bid and award the job.',
                'Monitor progress on the job detail page and calendar.',
            ],
            iconBg: 'bg-primary/10',
            iconColor: 'text-primary'
        },
        { 
            icon: TrendingUp, 
            title: 'Predictive & Condition-Based', 
            description: 'Proactive inspections triggered by upcoming dates or condition monitoring.',
            steps: [
                'Asset status is automatically flagged as "Requires Inspection".',
                'Create a job for the specific asset.',
                'Award the job to a preferred or available provider.',
                'Review and approve the report to clear the asset\'s status.',
            ],
            iconBg: 'bg-accent/10',
            iconColor: 'text-accent',
        },
        { 
            icon: TriangleAlert, 
            title: 'Breakdown / Emergency', 
            description: 'Reactive work to address unexpected issues found in the field.',
            steps: [
                'A field operator flags an issue via a routine QR code check.',
                'Asset status immediately changes, alerting management.',
                'Post an urgent job to the marketplace.',
                'Quickly award to a responsive local provider.',
            ],
            iconBg: 'bg-destructive/10',
            iconColor: 'text-destructive',
        },
        { 
            icon: CalendarCheck, 
            title: 'Routine Checks (Daily/Weekly)', 
            description: 'Simple, regular checks performed by field staff to ensure operational readiness.',
            steps: [
                'Operator scans the asset QR code in the field.',
                'Opens a simple "Log Routine Check" form.',
                'Submits the check, creating an auditable log entry.',
                'If issues are flagged, asset status is automatically updated.',
            ],
            iconBg: 'bg-secondary',
            iconColor: 'text-secondary-foreground',
        },
    ];

    return (
        <div className="space-y-12">
            <div>
                <h2 className="text-2xl font-headline font-semibold text-center mb-2">The Core Client Workflow</h2>
                <p className="text-muted-foreground text-center max-w-2xl mx-auto">Regardless of the maintenance type, the core process for managing an inspection job remains consistent.</p>
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

            <div>
                 <h2 className="text-2xl font-headline font-semibold text-center mb-2">Applying the Workflow to Maintenance Strategies</h2>
                <p className="text-muted-foreground text-center max-w-2xl mx-auto">Here’s how the core workflow adapts to different maintenance scenarios you might encounter.</p>
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                    {maintenanceTypes.map(type => <MaintenanceType key={type.title} {...type} />)}
                </div>
            </div>
        </div>
    );
};

export default ClientMaintenanceWorkflow;

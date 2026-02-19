'use client';
import React from 'react';
import { FilePlus2, Gavel, Award, Search, FileText, Users, UserCheck, Archive, DollarSign, CalendarCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

// A single, more descriptive data source for the steps
const lifecycleSteps = [
    { step: 1, icon: FilePlus2, title: 'Project Creation', description: 'Client defines the scope, assets, and requirements for the inspection.', actor: 'Client' },
    { step: 2, icon: Gavel, title: 'Marketplace Bidding', description: 'Qualified service providers submit competitive bids for the project.', actor: 'Service Provider' },
    { step: 3, icon: Award, title: 'Project Award & Assignment', description: 'Client reviews bids, awards the contract, and assigns the project.', actor: 'Client' },
    { step: 4, icon: CalendarCheck, title: 'Pre-Inspection Prep', description: 'Provider confirms site readiness, prepares an inspection plan, and mobilizes team.', actor: 'Service Provider' },
    { step: 5, icon: Search, title: 'Inspection Execution', description: 'Provider performs the on-site NDT work, capturing all necessary data.', actor: 'Service Provider' },
    { step: 6, icon: FileText, title: 'Report Drafting & Submission', description: 'Provider uses platform tools to create and submit a digital report.', actor: 'Service Provider' },
    { step: 7, icon: Users, title: 'Collaborative Report Review', description: 'Auditor (if required) and Client review the report and provide feedback.', actor: 'All Parties' },
    { step: 8, icon: UserCheck, title: 'Final Report Approval', description: 'Client gives final approval, confirming the work meets all requirements.', actor: 'Client' },
    { step: 9, icon: Archive, title: 'Project Closure & Archiving', description: 'The platform archives all documents and updates the asset’s history.', actor: 'Platform' },
    { step: 10, icon: DollarSign, title: 'Payment & Billing', description: 'Client settles the invoice directly with the provider. Financial reports are generated.', actor: 'Client & Provider' },
];

const ActorBadge = ({ actor }: { actor: string }) => {
    let variant: 'default' | 'secondary' | 'outline' | 'success' = 'default';
    let text = actor;
    switch (actor) {
        case 'Client':
            variant = 'default';
            break;
        case 'Service Provider':
            variant = 'secondary';
            text = 'Provider';
            break;
        case 'Auditor': 
            variant = 'outline';
            break;
        case 'Platform':
            variant = 'outline';
            break;
        case 'All Parties':
            variant = 'success';
            break;
        case 'Client & Provider':
             variant = 'success';
             text = 'Both Parties';
            break;
    }
    return <Badge variant={variant} shape="rounded">{text}</Badge>
};


const StepCard = ({ step, icon: Icon, title, description, actor }: { 
    step: number,
    icon: React.ElementType,
    title: string,
    description: string,
    actor: string 
}) => (
    <div className="bg-card border rounded-lg p-4 w-full h-full text-center relative shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl flex flex-col">
        <div className="absolute -top-4 -left-4 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg border-4 border-background">
            {step}
        </div>
        <div className="pt-8 flex flex-col items-center flex-grow">
             <div className="icon-container mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit mb-3">
                <Icon className="w-7 h-7" />
            </div>
            <h4 className="font-semibold text-primary text-lg leading-tight">{title}</h4>
            <p className="text-sm text-muted-foreground mt-2 flex-grow">{description}</p>
             <div className="mt-4">
                <ActorBadge actor={actor} />
            </div>
        </div>
    </div>
);


const UserActivityDiagram = () => {
    return (
        <div className="w-full max-w-7xl mx-auto mt-16">
            {/* Desktop View - A clear, ordered grid */}
            <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-12">
                {lifecycleSteps.map((step) => (
                    <StepCard key={step.step} {...step} />
                ))}
            </div>

            {/* Mobile View - Vertical timeline */}
            <div className="lg:hidden space-y-8">
                 <h3 className="text-xl font-bold text-center text-primary font-headline">The Inspection Lifecycle</h3>
                 <div className="relative ml-8 border-l-2 border-dashed border-border">
                    <div className="space-y-12">
                        {lifecycleSteps.map(step => (
                            <div key={step.step} className="relative pl-12 py-2">
                                <div className="absolute -left-8 top-1 flex h-16 w-16 items-center justify-center rounded-full bg-background border-2 border-primary">
                                    <div className="text-primary"><step.icon className="w-8 h-8" /></div>
                                </div>
                                <div className="pt-2">
                                    <p className="text-lg font-semibold text-primary">{step.step}. {step.title}</p>
                                    <p className="text-sm text-muted-foreground">{step.description}</p>
                                    <div className="mt-2"><ActorBadge actor={step.actor} /></div>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
            </div>
        </div>
    );
};
export default UserActivityDiagram;

'use client';
import React from 'react';
import { FilePlus2, Gavel, Award, Search, FileText, ShieldCheck, UserCheck, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

// A single, more descriptive data source for the steps
const lifecycleSteps = [
    { step: 1, icon: FilePlus2, title: 'Post Job', description: 'Client defines the scope, assets, and requirements for the inspection.', actor: 'Client' },
    { step: 2, icon: Gavel, title: 'Bidding', description: 'Qualified service providers submit competitive bids for the job.', actor: 'Provider' },
    { step: 3, icon: Award, title: 'Award Job', description: 'Client reviews bids, communicates with providers, and awards the contract.', actor: 'Client' },
    { step: 4, icon: Search, title: 'Perform Inspection', description: 'The awarded provider conducts the on-site NDT work as per the scope.', actor: 'Provider' },
    { step: 5, icon: FileText, title: 'Submit Report', description: 'Provider uses platform tools to generate and submit a digital inspection report.', actor: 'Provider' },
    { step: 6, icon: ShieldCheck, title: 'Audit Report', description: '(As Required) A Level III auditor reviews the report for compliance and accuracy.', actor: 'Auditor' },
    { step: 7, icon: UserCheck, title: 'Client Review', description: 'Client performs the final review of the report, with the ability to request revisions.', actor: 'Client' },
    { step: 8, icon: CheckCircle, title: 'Complete & Pay', description: 'Client approves the final report, completing the job and initiating payment.', actor: 'Client' },
];

const ActorBadge = ({ actor }: { actor: string }) => {
    let variant: 'default' | 'secondary' | 'outline' = 'default';
    switch (actor) {
        case 'Client':
            variant = 'default';
            break;
        case 'Provider':
            variant = 'secondary';
            break;
        case 'Auditor':
            variant = 'outline';
            break;
    }
    return <Badge variant={variant}>{actor}</Badge>
};


const StepCard = ({ step, icon: Icon, title, description, actor }: { 
    step: number,
    icon: React.ElementType,
    title: string,
    description: string,
    actor: string 
}) => (
    <div className="bg-card border rounded-lg p-4 w-full h-full text-center relative shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">
        <div className="absolute -top-4 -left-4 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg border-4 border-background">
            {step}
        </div>
        <div className="pt-8">
             <div className="icon-container mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit mb-3">
                <Icon className="w-7 h-7" />
            </div>
            <h4 className="font-semibold text-primary text-lg leading-tight">{title}</h4>
            <p className="text-sm text-muted-foreground mt-2 h-16">{description}</p>
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
            <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                {lifecycleSteps.map((step) => (
                    <StepCard key={step.step} {...step} />
                ))}
            </div>

            {/* Mobile View - Vertical timeline */}
            <div className="lg:hidden space-y-8">
                 <h3 className="text-xl font-bold text-center text-primary font-headline">The Inspection Lifecycle</h3>
                 <div className="relative pl-8 border-l-2 border-dashed border-border">
                    <div className="space-y-12">
                        {lifecycleSteps.map(step => (
                            <div key={step.step} className="relative">
                                <div className="absolute -left-[2.1rem] top-0 flex h-16 w-16 items-center justify-center rounded-full bg-background border-2 border-primary">
                                    <div className="text-primary"><step.icon className="w-8 h-8" /></div>
                                </div>
                                <div className="ml-4 pt-2">
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

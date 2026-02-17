'use client';
import React from 'react';
import { FilePlus2, Gavel, Award, Search, FileText, ShieldCheck, UserCheck, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ArrowBigRight } from 'lucide-react';

const ActorColumn = ({ title, children, className }: { title: string, children: React.ReactNode, className?: string }) => (
    <div className={cn("flex flex-col items-center gap-8 w-full", className)}>
        <h3 className="text-lg font-bold text-center text-primary font-headline sticky top-0 bg-background/80 backdrop-blur-sm py-2 z-20 w-full">{title}</h3>
        <div className="flex flex-col items-center gap-16 w-full">
            {children}
        </div>
    </div>
);

const StepCard = ({ icon, title, description, step, className }: { icon: React.ReactElementType, title: string, description: string, step: number, className?: string }) => (
    <div className={cn("bg-card border rounded-lg p-4 w-full text-center relative z-10 shadow-lg", className)}>
        <div className="absolute -top-4 -left-4 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg border-4 border-background">
            {step}
        </div>
        <div className="pt-8">
             <div className="icon-container mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit mb-3">
                {React.createElement(icon, { className: "w-7 h-7" })}
            </div>
            <h4 className="font-semibold text-primary text-lg leading-tight">{title}</h4>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
    </div>
);

const Connector = ({ className, direction = 'right' }: { className?: string; direction?: 'right' | 'left' }) => (
  <div className={cn("absolute top-1/2 -translate-y-1/2", direction === 'right' ? 'right-0 translate-x-1/2' : 'left-0 -translate-x-1/2', className)}>
    <ArrowBigRight className="w-8 h-8 text-primary/30" />
  </div>
);


const UserActivityDiagram = () => {
    return (
        <div className="w-full max-w-6xl mx-auto mt-16">
            {/* Desktop View */}
            <div className="hidden lg:grid grid-cols-3 gap-x-16 items-start">
                
                <ActorColumn title="Asset Owner (Client)">
                    <div className="relative w-full">
                        <StepCard icon={FilePlus2} title="Post Job" description="Defines scope and requirements." step={1} />
                        <Connector />
                    </div>
                     <div className="relative w-full">
                         <StepCard icon={Award} title="Award Job" description="Selects the best provider." step={3} />
                        <Connector />
                    </div>
                     <div className="h-48" /> {/* Spacer */}
                    <div className="relative w-full">
                        <StepCard icon={UserCheck} title="Client Review" description="Reviews the final report." step={7} />
                    </div>
                     <div className="relative w-full">
                        <StepCard icon={CheckCircle} title="Complete & Pay" description="Closes out the successful job." step={8} />
                    </div>
                </ActorColumn>

                <ActorColumn title="NDT Provider (Inspector)">
                    <div className="h-48" /> {/* Spacer */}
                    <div className="relative w-full">
                        <StepCard icon={Gavel} title="Submit Bids" description="Providers compete for the job." step={2} />
                        <Connector direction="left" />
                    </div>
                    <div className="relative w-full">
                        <StepCard icon={Search} title="Perform Inspection" description="Conducts on-site NDT work." step={4} />
                    </div>
                     <div className="relative w-full">
                        <StepCard icon={FileText} title="Submit Report" description="Uploads digital findings." step={5} />
                        <Connector />
                    </div>
                </ActorColumn>

                <ActorColumn title="Auditor">
                    <div className="h-48" /> {/* Spacer */}
                    <div className="h-48" /> {/* Spacer */}
                     <div className="h-48" /> {/* Spacer */}
                     <div className="relative w-full">
                        <StepCard icon={ShieldCheck} title="Audit Report" description="(As Required) Level III review for compliance." step={6} />
                         <Connector direction="left" />
                    </div>
                </ActorColumn>
            </div>

            {/* Mobile View */}
            <div className="lg:hidden space-y-8">
                 <h3 className="text-xl font-bold text-center text-primary font-headline">The Inspection Lifecycle</h3>
                 <div className="relative pl-8 border-l-2 border-dashed border-border">
                    <div className="space-y-12">
                        {[
                            { icon: FilePlus2, title: '1. Post Job', description: 'Client posts a new inspection job.', actor: 'Client' },
                            { icon: Gavel, title: '2. Bidding', description: 'Providers submit competitive bids.', actor: 'Provider' },
                            { icon: Award, title: '3. Award Job', description: 'Client reviews bids and awards the job.', actor: 'Client' },
                            { icon: Search, title: '4. Perform Inspection', description: 'Provider conducts the NDT inspection.', actor: 'Provider' },
                            { icon: FileText, title: '5. Submit Report', description: 'Provider uploads the digital report and findings.', actor: 'Provider' },
                            { icon: ShieldCheck, title: '6. Audit Report', description: '(As Required) Level III review for compliance.', actor: 'Auditor' },
                            { icon: UserCheck, title: '7. Client Review', description: 'Client reviews the final report.', actor: 'Client' },
                            { icon: CheckCircle, title: '8. Complete', description: 'Client approves job and handles payment.', actor: 'Client' },
                        ].map(step => (
                            <div key={step.title} className="relative">
                                <div className="absolute -left-[2.1rem] top-0 flex h-16 w-16 items-center justify-center rounded-full bg-background border-2 border-primary">
                                    <div className="text-primary"><step.icon className="w-8 h-8" /></div>
                                </div>
                                <div className="ml-4 pt-2">
                                    <p className="text-lg font-semibold text-primary">{step.title}</p>
                                    <p className="text-sm text-muted-foreground">{step.description}</p>
                                    <p className="text-xs font-bold text-muted-foreground mt-1">Actor: {step.actor}</p>
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

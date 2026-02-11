
import type { Metadata } from 'next';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import * as React from 'react';

export const metadata: Metadata = {
  title: 'Job Bidding Workflow',
  description: 'End-to-end process from job creation to payment — click each phase to expand the step-by-step breakdown.',
};

const actors = [
    { name: 'Client', color: 'bg-orange-500' },
    { name: 'Service Provider', color: 'bg-blue-600' },
    { name: 'Platform', color: 'bg-gray-800' },
    { name: 'Both Parties', color: 'bg-red-600' },
];

const workflowData = [
  {
    phase: 'PHASE 01',
    title: 'Job Creation & Scoping',
    actor: 'Client',
    steps: [
      { number: 1, title: 'Create Job Posting', description: 'Client fills in the job wizard: facility type, location, inspection techniques, asset count, access window, and deadline. NDT type tags auto-suggested.', actor: 'Client' },
      { number: 2, title: 'Upload Scope Documents', description: 'Attach P&IDs, previous inspection reports, isometric drawings, and HSE requirements. Documents are shared only with shortlisted bidders.', actor: 'Client' },
      { number: 3, title: 'Set Budget & Visibility', description: 'Choose budget type (fixed, indicative range, or open). Select visibility: public open bid, invited tender, or private to preferred providers.', actor: 'Client' },
      { number: 4, title: 'Platform Verification & Publishing', description: 'NDT EXCHANGE auto-validates required certification types, flags incomplete scopes, and publishes to the matching provider pool.', actor: 'Platform' }
    ]
  },
  {
    phase: 'PHASE 02',
    title: 'Discovery & Bid Preparation',
    actor: 'Service Provider',
    steps: [
        { number: 5, title: 'Smart Matching & Notifications', description: "Platform matches job requirements against provider profiles: location, technique certifications (ASNT Level II/III), industry experience, and capacity calendar.", actor: 'Platform' },
        { number: 6, title: 'Review Scope & Express Interest', description: "Provider reads the scope, downloads documents (NDA-gated if required), and signals intent to bid — activating the Q&A channel with the client.", actor: 'Service Provider' },
        { number: 7, title: 'Pre-Bid Q&A', description: "Provider asks clarification questions via the platform's structured Q&A. Client answers are visible to all registered bidders to ensure fair information.", actor: 'Both Parties' },
        { number: 8, title: 'Build & Submit Bid', description: "Provider completes structured bid: lump-sum price, team CVs, certifications, method statement summary, mobilisation date, and payment schedule.", actor: 'Service Provider' }
    ]
  },
    {
    phase: 'PHASE 03',
    title: 'Evaluation & Award',
    actor: 'Both Parties',
    steps: [
        { number: 9, title: 'Bid Comparison Review', description: "Client views all bids in a scored comparison table — auto-ranked by platform scoring algorithm weighing price, certifications, experience, ratings, and response time.", actor: 'Client' },
        { number: 10, title: 'Shortlist & Interview (Optional)', description: "Client shortlists 2–3 providers, can request a live video call or additional documentation before making the final decision.", actor: 'Client' },
        { number: 11, title: 'Contract Generation', description: "Platform auto-generates an NDT-specific service contract from the awarded bid scope. Both parties e-sign digitally within the platform.", actor: 'Platform' },
        { number: 12, title: 'Escrow Activation', description: "Client deposits contract value into platform escrow. Platform notifies all unsuccessful bidders. Job status moves to 'Awarded.'", actor: 'Platform' }
    ]
  },
  {
    phase: 'PHASE 04',
    title: 'Mobilisation & Execution',
    actor: 'Service Provider',
    steps: [
        { number: 13, title: 'Team & Equipment Mobilisation', description: "Provider confirms team roster, equipment manifest, and site arrival schedule. Client approves access via the platform's site permit module.", actor: 'Service Provider' },
        { number: 14, title: 'Daily Progress Updates', description: "Provider submits structured daily field reports: work completed, defects found, delays flagged. Client reviews in real-time via the job dashboard.", actor: 'Service Provider' },
        { number: 15, title: 'Milestone Payment Releases', description: "Platform releases partial escrow payments as client approves completion milestones (e.g. 30% on mobilisation, 40% on inspection complete, 30% on report accepted).", actor: 'Platform' }
    ]
  },
  {
    phase: 'PHASE 05',
    title: 'Reporting, Closeout & Review',
    actor: 'Both Parties',
    steps: [
        { number: 16, title: 'Final Report Submission', description: "Provider uploads structured final report: all findings, defect classifications, recommended actions, and NDT data files — stored permanently in the client's asset register.", actor: 'Service Provider' },
        { number: 17, title: 'Client Sign-off', description: "Client reviews and approves the final deliverables. Any disputes are handled via the platform's structured dispute resolution process before final release.", actor: 'Client' },
        { number: 18, title: 'Final Payment & Platform Fee', description: "Remaining escrow released to provider. Platform deducts commission (5–10%). Invoice issued to client. Transaction recorded for tax reporting.", actor: 'Platform' },
        { number: 19, title: 'Mutual Ratings & Review', description: "Both parties rate each other. Ratings feed the platform's reputation engine, improving match quality for future jobs. Disputes flagged to trust & safety team.", actor: 'Both Parties' }
    ]
  },
];

const ActorBadge = ({ actor, full = false }: { actor: string, full?: boolean }) => {
    let color = '';
    let bgColor = '';
    let text = actor;

    switch(actor) {
        case 'Client':
            color = 'text-orange-800';
            bgColor = 'bg-orange-100';
            break;
        case 'Service Provider':
            color = 'text-blue-800';
            bgColor = 'bg-blue-100';
            text = full ? actor : 'Provider';
            break;
        case 'Platform':
            color = 'text-gray-800';
            bgColor = 'bg-gray-200';
            break;
        case 'Both Parties':
            color = 'text-red-800';
            bgColor = 'bg-red-100';
            text = full ? actor : 'Both Parties';
            break;
    }
    return <Badge className={`font-bold ${color} ${bgColor}`}>{text}</Badge>
}

export default function PlatformWorkflowPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <PublicHeader />
            <main className="py-16">
                 <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-headline font-bold">Job Bidding Workflow</h1>
                        <p className="mt-4 text-lg text-muted-foreground">End-to-end process from job creation to payment — click each phase to expand the step-by-step breakdown.</p>
                    </div>

                    <div className="flex justify-center items-center gap-4 mb-12 flex-wrap">
                        {actors.map(actor => (
                            <div key={actor.name} className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${actor.color}`}></div>
                                <span className="text-sm font-medium text-muted-foreground">{actor.name}</span>
                            </div>
                        ))}
                    </div>

                    <Accordion type="multiple" className="w-full space-y-4">
                        {workflowData.map((phase, index) => (
                             <AccordionItem key={phase.phase} value={`item-${index}`} className="border-none">
                                <AccordionTrigger className="bg-muted hover:bg-muted/80 px-4 py-3 rounded-t-lg data-[state=closed]:rounded-b-lg transition-all text-lg font-semibold hover:no-underline">
                                    <div className="flex justify-between items-center w-full">
                                        <div className="flex items-center gap-4">
                                            <Badge className="bg-primary text-primary-foreground">{phase.phase}</Badge>
                                            <span>{phase.title}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mr-2">
                                            <ActorBadge actor={phase.actor} full={true} />
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="border border-t-0 rounded-b-lg p-6 space-y-8">
                                    {phase.steps.map(step => (
                                        <div key={step.number} className="grid grid-cols-[auto_1fr_auto] items-start gap-x-6">
                                            <div className="w-8 h-8 flex-shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                                                {step.number}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">{step.title}</h4>
                                                <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                                            </div>
                                            <div className="justify-self-end">
                                                <ActorBadge actor={step.actor} />
                                            </div>
                                        </div>
                                    ))}
                                </AccordionContent>
                             </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </main>
            <PublicFooter />
        </div>
    );
}


import type { Metadata } from 'next';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import * as React from 'react';

export const metadata: Metadata = {
  title: 'Platform Workflow',
  description: 'End-to-end process from job creation to payment — a step-by-step breakdown of each phase of the NDT Exchange platform.',
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
      { number: 1, title: 'Create Job Posting', description: 'Client details the job: assets, NDT methods, urgency, and location. They select a workflow (Standard, Level III Required) and upload scope documents.', actor: 'Client' },
      { number: 2, title: 'Platform Verification & Publishing', description: 'NDT EXCHANGE validates the job requirements and publishes it to a pool of qualified and matching service providers.', actor: 'Platform' }
    ]
  },
  {
    phase: 'PHASE 02',
    title: 'Bidding & Award',
    actor: 'Both Parties',
    steps: [
        { number: 3, title: 'Discover & Prepare Bids', description: "Providers are notified of matching jobs. They review the scope and can ask questions through a structured Q&A channel before submitting a detailed bid.", actor: 'Service Provider' },
        { number: 4, title: 'Evaluate Bids & Award Job', description: "Client compares bids side-by-side, chats with providers, and awards the job. The platform auto-generates a service contract for e-signature.", actor: 'Client' },
    ]
  },
    {
    phase: 'PHASE 03',
    title: 'Preparation & Execution',
    actor: 'Service Provider',
    steps: [
        { number: 5, title: 'Pre-Inspection & Mobilisation', description: "The awarded provider confirms site readiness, prepares an inspection plan (which an Auditor may review), and mobilizes team and equipment.", actor: 'Service Provider' },
        { number: 6, title: 'Execute On-Site Inspection', description: "The inspector performs the NDT work, capturing all necessary data, readings, and defect information as per the job scope.", actor: 'Service Provider' },
    ]
  },
  {
    phase: 'PHASE 04',
    title: 'Reporting & Collaborative Review',
    actor: 'Both Parties',
    steps: [
        { number: 7, title: 'Draft Report Submission', description: "Inspector uses platform tools to create a structured digital report, including findings, images, and recommendations, and submits it for review.", actor: 'Service Provider' },
        { number: 8, title: 'Auditor & Client Review', description: "Depending on the workflow, the report is routed to a Level III Auditor and/or the Client for review. Comments and revision requests are handled directly on the platform.", actor: 'Both Parties' }
    ]
  },
  {
    phase: 'PHASE 05',
    title: 'Final Approval & Job Closeout',
    actor: 'Both Parties',
    steps: [
        { number: 9, title: 'Final Report Approval', description: "After all revisions, the Client gives final approval on the report, confirming that the work meets all requirements.", actor: 'Client' },
        { number: 10, title: 'Closure & Payment', description: "The system finalizes the job, updates the asset's history with the new inspection data, and enables client reviews. Payment is then handled between the parties.", actor: 'Platform' }
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
};

export default function PlatformWorkflowPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <PublicHeader />
            <main className="pt-28 pb-16">
                 <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-headline font-bold">Platform Workflow</h1>
                        <p className="mt-4 text-lg text-muted-foreground">End-to-end process from job creation to payment — a step-by-step breakdown of each phase.</p>
                    </div>

                    <div className="flex justify-center items-center gap-4 mb-12 flex-wrap">
                        {actors.map(actor => (
                            <div key={actor.name} className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${actor.color}`}></div>
                                <span className="text-sm font-medium text-muted-foreground">{actor.name}</span>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-8">
                        {workflowData.map((phase) => (
                            <Card key={phase.phase}>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <Badge className="bg-primary text-primary-foreground text-sm">{phase.phase}</Badge>
                                            <CardTitle className="text-xl md:text-2xl">{phase.title}</CardTitle>
                                        </div>
                                        <div className="hidden sm:block">
                                            <ActorBadge actor={phase.actor} full={true} />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-8 pt-4">
                                    {phase.steps.map(step => (
                                        <div key={step.number} className="grid grid-cols-[auto_1fr] md:grid-cols-[auto_1fr_auto] items-start gap-x-6">
                                            <div className="w-8 h-8 flex-shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                                {step.number}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">{step.title}</h4>
                                                <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                                                <div className="md:hidden mt-2">
                                                    <ActorBadge actor={step.actor} />
                                                </div>
                                            </div>
                                            <div className="hidden md:block justify-self-end">
                                                <ActorBadge actor={step.actor} />
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </main>
            <PublicFooter />
        </div>
    );
}

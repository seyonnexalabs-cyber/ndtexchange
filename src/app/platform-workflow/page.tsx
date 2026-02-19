

import type { Metadata } from 'next';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import * as React from 'react';

export const metadata: Metadata = {
  title: 'Platform Workflow',
  description: 'End-to-end process from project creation to payment — a step-by-step breakdown of each phase of the NDT Exchange platform.',
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
    title: 'Project Creation & Scoping',
    actor: 'Client',
    description: 'Client details the project: assets, NDT methods, urgency, and location. They select a workflow (Standard or Level III Required) and upload scope documents. The platform verifies and publishes the project.',
  },
  {
    phase: 'PHASE 02',
    title: 'Marketplace Bidding',
    actor: 'Service Provider',
    description: 'Inspectors discover projects, review requirements, ask questions via a structured Q&A channel, and submit detailed bids including price, schedule, and qualifications.',
  },
  {
    phase: 'PHASE 03',
    title: 'Project Award & Assignment',
    actor: 'Client',
    description: 'Client compares bids, chats with inspectors, and awards the contract. The platform auto-generates a service contract for e-signature. The project status updates to "Assigned".',
  },
  {
    phase: 'PHASE 04',
    title: 'Pre-Inspection & Scheduling',
    actor: 'Service Provider',
    description: 'The awarded provider confirms site readiness, prepares an inspection plan (which an Auditor may review if required), and mobilizes team and equipment. The project is formally scheduled on the platform.',
  },
  {
    phase: 'PHASE 05',
    title: 'Inspection Execution',
    actor: 'Service Provider',
    description: 'The inspector performs the on-site NDT work, capturing all necessary data, readings, and defect information as per the project scope. Progress can be tracked on the platform.',
  },
  {
    phase: 'PHASE 06',
    title: 'Report Drafting & Submission',
    actor: 'Service Provider',
    description: 'Inspector uses platform tools to create a structured digital report, including findings, images, and recommendations, and submits it for review.',
  },
  {
    phase: 'PHASE 07',
    title: 'Collaborative Report Review',
    actor: 'Both Parties',
    description: 'The report is routed for review. If a Level III workflow was selected, an Auditor reviews it first. Otherwise, it goes directly to the Client. Comments and revision requests are handled on the platform.',
  },
  {
    phase: 'PHASE 08',
    title: 'Final Report Approval',
    actor: 'Client',
    description: 'After all revisions, the Client gives final approval on the report, confirming that the work meets all requirements. The project is marked as completed.',
  },
  {
    phase: 'PHASE 09',
    title: 'Project Closure & Data Archiving',
    actor: 'Platform',
    description: 'The system generates a final PDF of the report, updates the asset\'s history with the new inspection data, logs all activity, and enables client reviews and ratings.',
  },
  {
    phase: 'PHASE 10',
    title: 'Payment & Billing',
    actor: 'Both Parties',
    description: 'The platform facilitates the final step where the client reviews the invoice and handles payment directly with the provider. Financial reports are generated.',
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
                        <p className="mt-4 text-lg text-muted-foreground">End-to-end process from project creation to payment — a step-by-step breakdown of each phase.</p>
                    </div>

                    <div className="flex justify-center items-center gap-4 mb-12 flex-wrap">
                        {actors.map(actor => (
                            <div key={actor.name} className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${actor.color}`}></div>
                                <span className="text-sm font-medium text-muted-foreground">{actor.name}</span>
                            </div>
                        ))}
                    </div>

                    <div className="relative pl-8">
                      {/* Timeline line */}
                      <div className="absolute left-8 top-0 h-full w-0.5 bg-border -translate-x-1/2" />
                      
                      <div className="space-y-12">
                        {workflowData.map((phase, index) => (
                           <div key={phase.phase} className="relative">
                              <div className="absolute -left-11 top-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm z-10">
                                {index + 1}
                              </div>
                              <div className="ml-4">
                                <p className="text-sm font-semibold text-primary">{phase.phase}</p>
                                <div className="flex justify-between items-center">
                                  <h3 className="text-xl font-headline font-semibold mt-1">{phase.title}</h3>
                                  <ActorBadge actor={phase.actor} full={true} />
                                </div>
                                <p className="mt-2 text-muted-foreground">{phase.description}</p>
                              </div>
                           </div>
                        ))}
                      </div>
                    </div>
                </div>
            </main>
            <PublicFooter />
        </div>
    );
}

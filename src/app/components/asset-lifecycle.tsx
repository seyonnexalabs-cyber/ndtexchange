'use client';

import React from 'react';
import {
  FilePlus2,
  QrCode,
  FileArchive,
  History,
  BellRing,
  ArrowRight,
  ArrowDown
} from 'lucide-react';

const StageCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
    <div className="flex flex-col items-center text-center p-4 max-w-xs mx-auto">
        <div className="bg-primary/10 text-primary p-4 rounded-full mb-4">
            <Icon className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold font-headline text-primary">{title}</h3>
        <p className="mt-1 text-muted-foreground text-sm">{description}</p>
    </div>
);

const AssetLifecycleDiagram = () => {
    const stages = [
        {
            icon: FilePlus2,
            title: '1. Create Asset',
            description: 'Easily add new assets using predefined templates for tanks, piping, cranes, and more.'
        },
        {
            icon: QrCode,
            title: '2. Tag & Identify',
            description: 'Generate and assign a unique QR code to each asset for quick identification and field access.'
        },
        {
            icon: FileArchive,
            title: '3. Centralize Documents',
            description: 'Upload and store all relevant files—Piping & Instrumentation Diagrams (P&IDs), fabrication drawings, and certificates—in a secure digital vault.'
        },
        {
            icon: History,
            title: '4. Track Lifecycle',
            description: 'Log every inspection, defect, and repair, building a complete, tamper-proof history for each asset.'
        },
        {
            icon: BellRing,
            title: '5. Monitor & Maintain',
            description: 'Receive automated reminders for upcoming inspections and monitor overall asset health from your dashboard.'
        }
    ];

    return (
        <div className="relative w-full max-w-6xl mx-auto mt-12">
            <div className="flex flex-col md:flex-row justify-between items-center">
                {stages.map((stage, index) => (
                    <React.Fragment key={stage.title}>
                        <div className="flex-1 min-w-0">
                            <StageCard icon={stage.icon} title={stage.title} description={stage.description} />
                        </div>

                        {/* Desktop Arrow */}
                        {index < stages.length - 1 && (
                            <div className="hidden md:flex flex-shrink-0 mx-2 text-muted-foreground/50">
                                <ArrowRight className="w-8 h-8" />
                            </div>
                        )}

                         {/* Mobile Arrow */}
                        {index < stages.length - 1 && (
                            <div className="md:hidden my-2 text-muted-foreground/50">
                                <ArrowDown className="w-8 h-8" />
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default AssetLifecycleDiagram;

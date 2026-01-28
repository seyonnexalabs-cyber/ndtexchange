
'use client';

import React from 'react';
import {
  FilePlus2,
  QrCode,
  FileArchive,
  History,
  BellRing,
} from 'lucide-react';

const StageCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
    <div className="flex flex-col items-center text-center p-4">
        <div className="bg-primary/10 text-primary p-4 rounded-full mb-4">
            <Icon className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold font-headline text-primary">{title}</h3>
        <p className="mt-1 text-muted-foreground text-sm max-w-xs">{description}</p>
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
            description: 'Upload and store all relevant files—drawings, certificates, and photos—in a secure digital vault.'
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
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2" />
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center">
                {stages.map((stage, index) => (
                    <div key={stage.title} className="relative flex flex-col items-center w-full md:w-1/5 py-4 md:py-0">
                         {/* Connector for mobile */}
                        {index < stages.length - 1 && <div className="md:hidden absolute top-full left-1/2 w-0.5 h-12 bg-border -translate-x-1/2" />}
                        {/* Dot on the line for desktop */}
                        <div className="hidden md:block absolute top-1/2 left-1/2 w-3 h-3 bg-background border-2 border-primary rounded-full -translate-x-1/2 -translate-y-1/2" />
                        <StageCard icon={stage.icon} title={stage.title} description={stage.description} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AssetLifecycleDiagram;

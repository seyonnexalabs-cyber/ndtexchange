'use client';

import React from 'react';
import {
  FilePlus2,
  QrCode,
  FileArchive,
  History,
  BellRing,
} from 'lucide-react';
import { FeatureCard } from '@/app/components/feature-card';

const AssetLifecycleDiagram = () => {
    const stages = [
        {
            icon: <FilePlus2 className="w-8 h-8 text-primary" />,
            title: '1. Create Asset',
            description: 'Easily add new assets using predefined templates for tanks, piping, cranes, and more.'
        },
        {
            icon: <QrCode className="w-8 h-8 text-primary" />,
            title: '2. Tag & Identify',
            description: 'Generate and assign a unique QR code to each asset for quick identification and field access.'
        },
        {
            icon: <FileArchive className="w-8 h-8 text-primary" />,
            title: '3. Centralize Documents',
            description: 'Upload and store all relevant files—P&IDs, fabrication drawings, and certificates—in a secure digital vault.'
        },
        {
            icon: <History className="w-8 h-8 text-primary" />,
            title: '4. Track Lifecycle',
            description: 'Log every inspection, defect, and repair, building a complete, tamper-proof history for each asset.'
        },
        {
            icon: <BellRing className="w-8 h-8 text-primary" />,
            title: '5. Monitor & Maintain',
            description: 'Receive automated reminders for upcoming inspections and monitor overall asset health from your dashboard.'
        }
    ];

    return (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stages.map((stage) => (
                 <div key={stage.title} className={stages.length === 5 && stage.title.startsWith('4') ? 'lg:col-start-1 lg:col-end-2 lg:col-span-1' : ''}>
                    <FeatureCard
                        icon={stage.icon}
                        title={stage.title}
                        description={stage.description}
                        cardClass="hover:border-primary/20 text-center h-full"
                        iconContainerClass="bg-primary/10"
                    />
                </div>
            ))}
        </div>
    );
};

export default AssetLifecycleDiagram;

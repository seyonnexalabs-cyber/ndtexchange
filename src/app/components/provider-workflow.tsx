
'use client';

import React from 'react';
import {
  Users,
  Wrench,
  Briefcase,
  QrCode,
  LayoutDashboard,
} from 'lucide-react';
import { FeatureCard } from '@/app/components/feature-card';

const ProviderWorkflowDiagram = () => {
    const stages = [
        {
            icon: <Users className="w-8 h-8 text-accent icon-hover-effect" />,
            title: '1. Onboard Team',
            description: 'Add technicians to your roster and manage their qualifications and certifications in one place.'
        },
        {
            icon: <Wrench className="w-8 h-8 text-accent icon-hover-effect" />,
            title: '2. Log Equipment',
            description: 'Create a digital inventory of your NDT equipment and track calibration schedules with automated reminders.'
        },
        {
            icon: <Briefcase className="w-8 h-8 text-accent icon-hover-effect" />,
            title: '3. Assign to Jobs',
            description: 'Assign available technicians and calibrated equipment to internal or marketplace jobs with ease.'
        },
        {
            icon: <QrCode className="w-8 h-8 text-accent icon-hover-effect" />,
            title: '4. Empower Fieldwork',
            description: 'Technicians scan QR codes on-site to instantly view equipment status and checkout history.'
        },
        {
            icon: <LayoutDashboard className="w-8 h-8 text-accent icon-hover-effect" />,
            title: '5. Monitor & Optimize',
            description: 'Get a clear overview of team schedules and equipment utilization to optimize your operations.'
        }
    ];

    return (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stages.map((stage) => (
                <FeatureCard
                    key={stage.title}
                    icon={stage.icon}
                    title={stage.title}
                    description={stage.description}
                    cardClass="hover:border-accent/20 text-center h-full group"
                    iconContainerClass="bg-accent/10"
                />
            ))}
        </div>
    );
};

export default ProviderWorkflowDiagram;


'use client';

import React from 'react';
import {
  Users,
  Wrench,
  Briefcase,
  QrCode,
  LayoutDashboard,
  ArrowRight,
  ArrowDown
} from 'lucide-react';

const StageCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
    <div className="flex flex-col items-center text-center p-4 max-w-xs mx-auto">
        <div className="bg-accent/10 text-accent p-4 rounded-full mb-4">
            <Icon className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold font-headline text-accent">{title}</h3>
        <p className="mt-1 text-muted-foreground text-sm">{description}</p>
    </div>
);

const ProviderWorkflowDiagram = () => {
    const stages = [
        {
            icon: Users,
            title: '1. Onboard Team',
            description: 'Add technicians to your roster and manage their qualifications and certifications in one place.'
        },
        {
            icon: Wrench,
            title: '2. Log Equipment',
            description: 'Create a digital inventory of your NDT equipment and track calibration schedules with automated reminders.'
        },
        {
            icon: Briefcase,
            title: '3. Assign to Jobs',
            description: 'Assign available technicians and calibrated equipment to internal or marketplace jobs with ease.'
        },
        {
            icon: QrCode,
            title: '4. Empower Fieldwork',
            description: 'Technicians scan QR codes on-site to instantly view equipment status and checkout history.'
        },
        {
            icon: LayoutDashboard,
            title: '5. Monitor & Optimize',
            description: 'Get a clear overview of team schedules and equipment utilization to optimize your operations.'
        }
    ];

    return (
        <div className="relative w-full max-w-6xl mx-auto mt-12">
            <div className="flex flex-col md:flex-row justify-between items-start">
                {stages.map((stage, index) => (
                    <React.Fragment key={stage.title}>
                        <div className="flex-1 min-w-0">
                            <StageCard icon={stage.icon} title={stage.title} description={stage.description} />
                        </div>

                        {/* Desktop Arrow */}
                        {index < stages.length - 1 && (
                            <div className="hidden md:flex flex-shrink-0 mx-2 text-muted-foreground/50 self-center">
                                <ArrowRight className="w-8 h-8" />
                            </div>
                        )}

                         {/* Mobile Arrow */}
                        {index < stages.length - 1 && (
                            <div className="md:hidden my-2 text-muted-foreground/50 self-center">
                                <ArrowDown className="w-8 h-8" />
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default ProviderWorkflowDiagram;

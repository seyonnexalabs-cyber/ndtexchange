
'use client';

import React from 'react';
import {
  ClipboardList,
  Users,
  CalendarDays,
  Wrench,
  BarChart2,
} from 'lucide-react';

const Phase = ({ icon: Icon, title, description, isLast = false }: { icon: React.ElementType, title: string, description: string, isLast?: boolean }) => (
    <div className="flex items-start gap-6">
        <div className="flex flex-col items-center">
            <div className="bg-primary/10 text-primary p-4 rounded-full">
                <Icon className="w-8 h-8" />
            </div>
            {!isLast && <div className="mt-4 w-px h-24 bg-border" />}
        </div>
        <div>
            <h3 className="text-xl font-headline font-semibold text-primary">{title}</h3>
            <p className="mt-2 text-muted-foreground">{description}</p>
        </div>
    </div>
);


const ShutdownPhases = () => {
  const phases = [
    {
      icon: ClipboardList,
      title: '1. Initiation & Scope Definition',
      description: 'Leverage the centralized asset history on NDT Exchange to accurately define the inspection scope. Create detailed job postings that clearly outline all requirements, ensuring potential service providers have a complete understanding from the start.'
    },
    {
      icon: Users,
      title: '2. Planning & Resource Allocation',
      description: 'Access a competitive marketplace to find and vet certified NDT providers. Providers can use the platform to manage their technician roster and equipment inventory, ensuring the right resources are allocated for your shutdown.'
    },
    {
      icon: CalendarDays,
      title: '3. Detailed Scheduling',
      description: 'Use the integrated calendar to schedule jobs and coordinate with service providers. Real-time communication tools ensure that all stakeholders are aligned on timelines and dependencies, minimizing delays.'
    },
    {
      icon: Wrench,
      title: '4. Execution & Data Capture',
      description: 'Empower field technicians with instant access to asset data via QR codes. Standardized digital reporting ensures consistent, high-quality data capture, which is uploaded directly to the platform for real-time progress tracking.'
    },
    {
      icon: BarChart2,
      title: '5. Evaluation & Improvement',
      description: 'With all inspection data, reports, and job history centralized in one place, post-shutdown analysis becomes simple. Evaluate provider performance, analyze defect trends, and use the insights to optimize your next turnaround event.'
    }
  ];

  return (
    <div className="mt-16 max-w-3xl mx-auto">
        <div className="space-y-12">
            {phases.map((phase, index) => (
                <Phase
                    key={phase.title}
                    icon={phase.icon}
                    title={phase.title}
                    description={phase.description}
                    isLast={index === phases.length - 1}
                />
            ))}
        </div>
    </div>
  );
};

export default ShutdownPhases;

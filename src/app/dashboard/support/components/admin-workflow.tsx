'use client';
import React from 'react';
import { Users, BarChart3, Star, Briefcase } from 'lucide-react';
import { FeatureCard } from '@/app/components/feature-card';

const AdminWorkflow = () => {
    const coreAreas = [
        {
            icon: <Users className="w-8 h-8 text-primary" />,
            title: 'User & Company Management',
            description: 'Use the "Users", "Clients", and "Providers" pages to manage all accounts on the platform. You can invite new users, create new companies, and manage administrative roles.'
        },
        {
            icon: <Briefcase className="w-8 h-8 text-primary" />,
            title: 'Job Oversight',
            description: 'The "All Jobs" and "Inspections" pages give you a global view of all marketplace activity. You can monitor progress and access details for any job on the platform.'
        },
        {
            icon: <BarChart3 className="w-8 h-8 text-primary" />,
            title: 'Platform Analytics',
            description: 'Visit the "Analytics" page to see key performance indicators for the platform, including new user growth, revenue trends, and job distribution by technique.'
        },
        {
            icon: <Star className="w-8 h-8 text-primary" />,
            title: 'Content Moderation',
            description: 'The "Reviews" page is your moderation queue. Here you can approve or reject reviews submitted by clients to ensure they meet community guidelines.'
        },
    ];

    return (
        <div>
            <h2 className="text-2xl font-headline font-semibold text-center mb-2">Platform Administration Guide</h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto">As a platform administrator, your role is to oversee and manage the entire ecosystem. Here are your key areas of responsibility.</p>
            <div className="grid md:grid-cols-2 gap-6 mt-8">
                {coreAreas.map(area => (
                    <FeatureCard
                        key={area.title}
                        icon={area.icon}
                        title={area.title}
                        description={area.description}
                        cardClass="text-left"
                        iconContainerClass="bg-primary/10"
                    />
                ))}
            </div>
        </div>
    );
};

export default AdminWorkflow;

'use client';

import React from 'react';
import { FilePlus2, Gavel, Award, Search, FileText, ShieldCheck, CheckCircle } from 'lucide-react';

const lifecycleStages = [
    { icon: FilePlus2, title: '1. Post Job' },
    { icon: Gavel, title: '2. Bidding' },
    { icon: Award, title: '3. Award Job' },
    { icon: Search, title: '4. Inspect' },
    { icon: FileText, title: '5. Report' },
    { icon: ShieldCheck, title: '6. Review' },
    { icon: CheckCircle, title: '7. Complete' },
];

const InspectionLifecycleAnimation = () => {
    return (
        <div className="w-full overflow-hidden p-4">
            <div className="relative flex items-center justify-between lifecycle-container">
                {/* Dashed line background */}
                <div className="absolute top-8 left-0 w-full h-px bg-transparent -z-10" >
                     <svg width="100%" height="2" className="overflow-visible">
                        <line x1="0" y1="1" x2="100%" y2="1" strokeWidth="2" stroke="hsl(var(--border))" strokeDasharray="5, 5" />
                    </svg>
                </div>
                {/* Animated line */}
                 <div className="absolute top-8 left-0 h-0.5 bg-primary lifecycle-progress -z-10" />

                {lifecycleStages.map((stage, index) => (
                    <div key={index} className="relative z-10 flex flex-col items-center lifecycle-stage">
                        <div className="w-16 h-16 rounded-full bg-card border-2 flex items-center justify-center lifecycle-icon-wrapper">
                             <stage.icon className="w-8 h-8 text-muted-foreground lifecycle-icon" />
                        </div>
                        <p className="mt-4 text-xs sm:text-sm font-semibold text-center whitespace-nowrap">{stage.title}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InspectionLifecycleAnimation;

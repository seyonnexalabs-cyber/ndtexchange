
'use client';

import React from 'react';
import { FilePlus2, Gavel, Award, Search, FileText, ShieldCheck, CheckCircle, ChevronRight, UserCheck, PersonStanding } from 'lucide-react';

const lifecycleStages = [
    { icon: FilePlus2, title: '1. Post Job' },
    { icon: Gavel, title: '2. Bidding' },
    { icon: Award, title: '3. Award Job' },
    { icon: Search, title: '4. Inspect' },
    { icon: FileText, title: '5. Submit Report' },
    { icon: ShieldCheck, title: '6. Audit (As Required)' },
    { icon: UserCheck, title: '7. Client Review' },
    { icon: CheckCircle, title: '8. Complete' },
];

const InspectionLifecycleAnimation = () => {
    return (
        <div className="relative pt-12">
            <div className="progress-pulse-container">
                <div className="progress-pulse"></div>
            </div>
            <div className="w-full overflow-x-auto px-4 pb-4">
                <div className="flex items-center justify-center flex-wrap md:flex-nowrap gap-y-4 lifecycle-container">

                    {lifecycleStages.map((stage, index) => (
                        <div key={index} className="flex items-center lifecycle-item">
                            <div className="relative z-10 flex flex-col items-center lifecycle-stage text-center shrink-0 mx-2 sm:mx-4">
                                <div className="w-16 h-16 rounded-full bg-card border-2 flex items-center justify-center lifecycle-icon-wrapper">
                                     <stage.icon className="w-8 h-8 text-muted-foreground lifecycle-icon" />
                                </div>
                                <p className="mt-4 text-xs sm:text-sm font-semibold whitespace-nowrap">{stage.title}</p>
                            </div>
                            {index < lifecycleStages.length - 1 && (
                                <div className="relative z-0 flex items-center lifecycle-arrow shrink-0">
                                    <ChevronRight className="w-8 h-8 text-muted-foreground/30" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default InspectionLifecycleAnimation;

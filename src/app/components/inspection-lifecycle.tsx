'use client';

import React from 'react';
import {
  FilePlus2,
  Gavel,
  Award,
  Search,
  FileText,
  ShieldCheck,
  UserCheck,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Helper component for stage cards
const StageCard = ({ icon: Icon, title, description, animationDelay }: { icon: React.ElementType, title: string, description: string, animationDelay: string }) => (
    <div
      className="stage-card bg-card border rounded-lg p-2 sm:p-4 w-full text-center relative z-10 h-full flex flex-col justify-center items-center"
      style={{ animationDelay }}
    >
        <div className="icon-container mx-auto bg-primary/10 text-primary p-2 sm:p-3 rounded-full w-fit mb-1 sm:mb-2 transition-all" style={{ animationDelay }}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <h4 className="font-semibold text-primary text-sm sm:text-base leading-tight">{title}</h4>
        <p className="text-xs text-muted-foreground mt-1 hidden sm:block">{description}</p>
    </div>
);

// Main Diagram Component
const UserActivityDiagram = () => {
    const totalDuration = 14; // seconds
    const numSteps = 8;
    const stepDuration = totalDuration / numSteps;

    // This path is manually created to trace the flow between the cards.
    const motionPath = "M 16.66% 6.25% L 50% 6.25% L 50% 18.75% L 16.66% 18.75% L 16.66% 31.25% L 50% 31.25% L 50% 43.75% L 50% 56.25% L 83.33% 56.25% L 83.33% 68.75% L 16.66% 68.75% L 16.66% 81.25% L 16.66% 93.75%";

    return (
        <div className="w-full max-w-6xl mx-auto mt-12">
            <div className="sm:hidden text-center text-sm text-muted-foreground mb-4 italic">
                (Scroll horizontally to see the full diagram)
            </div>
            <div className="pb-4 overflow-x-auto sm:overflow-visible">
                <div className="relative w-full min-w-[640px]">
                    {/* SVG for connecting wires and animation */}
                    <svg className="absolute top-0 left-0 w-full h-full z-0" aria-hidden="true" preserveAspectRatio="none">
                        {/* Background static wire */}
                        <path d={motionPath} stroke="hsl(var(--border))" strokeWidth="2" strokeDasharray="4,4" fill="none"/>

                        {/* Animated "light" using a circle with a glow effect */}
                        <circle cx="0" cy="0" r="6" fill="hsl(var(--accent))" className="animated-light-pulse">
                            <animateMotion
                                dur={`${totalDuration}s`}
                                repeatCount="indefinite"
                                path={motionPath}
                                begin="0s"
                            />
                        </circle>
                    </svg>

                    {/* Grid Layout for Stages */}
                    <div className="grid grid-cols-3 gap-x-4 sm:gap-x-8 items-start relative z-10">
                        {/* Headers */}
                        <h3 className="text-base sm:text-lg font-bold text-center text-primary font-headline mb-4">Asset Owner (Client)</h3>
                        <h3 className="text-base sm:text-lg font-bold text-center text-primary font-headline mb-4">NDT Provider (Inspector)</h3>
                        <h3 className="text-base sm:text-lg font-bold text-center text-primary font-headline mb-4">Auditor</h3>

                        {/* Stages with animation delays */}
                        <div className="p-2 h-32 sm:h-44"><StageCard icon={FilePlus2} title="1. Post Job" description="Posts a new inspection job." animationDelay={`${stepDuration * 0}s`} /></div>
                        <div className="p-2 h-32 sm:h-44"><StageCard icon={Gavel} title="2. Bidding" description="Vetted providers submit competitive bids." animationDelay={`${stepDuration * 1}s`} /></div>
                        <div></div>

                        <div className="p-2 h-32 sm:h-44"><StageCard icon={Award} title="3. Award Job" description="Reviews bids and awards the job." animationDelay={`${stepDuration * 2}s`} /></div>
                        <div className="p-2 h-32 sm:h-44"><StageCard icon={Search} title="4. Perform Inspection" description="Conducts the NDT inspection." animationDelay={`${stepDuration * 3}s`} /></div>
                        <div></div>
                        
                        <div></div>
                        <div className="p-2 h-32 sm:h-44"><StageCard icon={FileText} title="5. Submit Report" description="Uploads the digital report and findings." animationDelay={`${stepDuration * 4}s`} /></div>
                        <div className="p-2 h-32 sm:h-44"><StageCard icon={ShieldCheck} title="6. Audit Report" description="(As Required) Level III review for compliance." animationDelay={`${stepDuration * 5}s`} /></div>
                        
                        <div className="p-2 h-32 sm:h-44"><StageCard icon={UserCheck} title="7. Client Review" description="Reviews the final report." animationDelay={`${stepDuration * 6}s`} /></div>
                        <div></div>
                        <div></div>

                        <div className="p-2 h-32 sm:h-44"><StageCard icon={CheckCircle} title="8. Complete" description="Approves job and handles payment." animationDelay={`${stepDuration * 7}s`} /></div>
                        <div></div>
                        <div></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserActivityDiagram;

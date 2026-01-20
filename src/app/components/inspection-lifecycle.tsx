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
const StageCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
    <div className="bg-card border rounded-lg p-3 sm:p-4 w-full text-center relative z-10 h-full flex flex-col justify-center items-center">
        <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit mb-2">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <h4 className="font-semibold text-primary text-sm sm:text-base leading-tight">{title}</h4>
        <p className="text-xs text-muted-foreground mt-1 hidden sm:block">{description}</p>
    </div>
);

// Main Diagram Component
const UserActivityDiagram = () => {
    return (
        <div className="relative mt-12 w-full max-w-6xl mx-auto">
            {/* SVG for connecting arrows */}
            <svg className="absolute top-0 left-0 w-full h-full z-0" aria-hidden="true" preserveAspectRatio="none">
                <defs>
                    <marker id="arrowhead" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--border))" />
                    </marker>
                </defs>
                
                {/* Vertical lines in columns */}
                <line x1="16.66%" y1="6.25%" x2="16.66%" y2="93.75%" stroke="hsl(var(--border))" strokeWidth="2" strokeDasharray="4,4" />
                <line x1="50%" y1="18.75%" x2="50%" y2="68.75%" stroke="hsl(var(--border))" strokeWidth="2" strokeDasharray="4,4" />
                <line x1="83.33%" y1="56.25%" x2="83.33%" y2="81.25%" stroke="hsl(var(--border))" strokeWidth="2" strokeDasharray="4,4" />
                
                {/* Horizontal Connectors with Arrows */}
                <path d="M 17.66% 6.25% H 49%" stroke="hsl(var(--border))" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
                <path d="M 49% 18.75% H 17.66%" stroke="hsl(var(--border))" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
                <path d="M 17.66% 31.25% H 49%" stroke="hsl(var(--border))" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
                <path d="M 49% 43.75% V 43.75%" stroke="hsl(var(--border))" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
                <path d="M 49% 56.25% H 82.33%" stroke="hsl(var(--border))" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
                <path d="M 82.33% 68.75% H 17.66%" stroke="hsl(var(--border))" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
                <path d="M 17.66% 81.25% V 81.25%" stroke="hsl(var(--border))" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
            </svg>

            {/* Grid Layout for Stages */}
            <div className="grid grid-cols-3 gap-x-4 sm:gap-x-8 items-start relative z-10">
                {/* Headers */}
                <h3 className="text-base sm:text-lg font-bold text-center text-primary font-headline mb-4">Asset Owner (Client)</h3>
                <h3 className="text-base sm:text-lg font-bold text-center text-primary font-headline mb-4">NDT Provider (Inspector)</h3>
                <h3 className="text-base sm:text-lg font-bold text-center text-primary font-headline mb-4">Auditor</h3>

                {/* Row 1 */}
                <div className="h-28 sm:h-40"><StageCard icon={FilePlus2} title="1. Post Job" description="Posts a new inspection job." /></div>
                <div></div>
                <div></div>

                {/* Row 2 */}
                <div></div>
                <div className="h-28 sm:h-40"><StageCard icon={Gavel} title="2. Bidding" description="Vetted providers submit competitive bids." /></div>
                <div></div>

                {/* Row 3 */}
                <div className="h-28 sm:h-40"><StageCard icon={Award} title="3. Award Job" description="Reviews bids and awards the job." /></div>
                <div></div>
                <div></div>

                {/* Row 4 */}
                <div></div>
                <div className="h-28 sm:h-40"><StageCard icon={Search} title="4. Perform Inspection" description="Conducts the NDT inspection." /></div>
                <div></div>

                {/* Row 5 */}
                <div></div>
                <div className="h-28 sm:h-40"><StageCard icon={FileText} title="5. Submit Report" description="Uploads the digital report and findings." /></div>
                <div></div>

                {/* Row 6 */}
                <div></div>
                <div></div>
                <div className="h-28 sm:h-40"><StageCard icon={ShieldCheck} title="6. Audit Report" description="(As Required) Level III review for compliance." /></div>

                {/* Row 7 */}
                <div className="h-28 sm:h-40"><StageCard icon={UserCheck} title="7. Client Review" description="Reviews the final report." /></div>
                <div></div>
                <div></div>

                {/* Row 8 */}
                <div className="h-28 sm:h-40"><StageCard icon={CheckCircle} title="8. Complete" description="Approves job and handles payment." /></div>
                <div></div>
                <div></div>
            </div>
        </div>
    );
};

export default UserActivityDiagram;

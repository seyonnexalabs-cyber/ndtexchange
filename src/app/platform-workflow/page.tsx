
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  FilePlus2, UploadCloud, DollarSign, Globe, CheckCircle as CheckBadge,
  BellRing, FileSearch, MessagesSquare, Gavel,
  Users, Video, FileSignature, Banknote,
  Truck, Package, ClipboardList, Milestone,
  FileText, UserCheck, Receipt, Star,
  HardHat, Building as BuildingIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import * as React from 'react';

export const metadata: Metadata = {
  title: 'Platform Workflow',
  description: 'Understand the end-to-end job lifecycle on NDT EXCHANGE, from job creation and bidding to reporting and payment.',
};

const StepCard = ({ number, title, description, icon }: { number: number; title: string; description: string; icon: React.ReactNode }) => (
    <div className="flex gap-6">
        <div className="flex flex-col items-center">
            <div className="w-12 h-12 flex-shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                {number}
            </div>
            <div className="w-px flex-1 bg-border my-2"></div>
        </div>
        <div>
            <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-md">{icon}</div>
                <h4 className="text-lg font-headline font-semibold">{title}</h4>
            </div>
            <p className="mt-2 text-muted-foreground">{description}</p>
        </div>
    </div>
);

const PhaseSection = ({ phase, title, actor, children }: { phase: string, title: string, actor: string, children: React.ReactNode }) => {
    const actorInfo = {
        Customer: { icon: <BuildingIcon className="w-5 h-5"/>, color: "text-blue-600" },
        "Provider / OEM": { icon: <HardHat className="w-5 h-5"/>, color: "text-green-600" },
        "Both Parties": { icon: <Users className="w-5 h-5"/>, color: "text-gray-600" },
    };
    const currentActor = actorInfo[actor as keyof typeof actorInfo];
    return (
        <section className="py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                 <div className="mb-12 text-center">
                    <h2 className="text-3xl font-headline font-semibold">{phase}: {title}</h2>
                    <div className="inline-flex items-center gap-2 mt-4 text-lg font-medium">
                        {currentActor && React.cloneElement(currentActor.icon, {className: `w-6 h-6 ${currentActor.color}`})}
                        <span className={currentActor?.color}>{actor}</span>
                    </div>
                </div>
                <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-x-12 gap-y-10">
                    {children}
                </div>
            </div>
        </section>
    );
}

export default function PlatformWorkflowPage() {
    const heroImage = PlaceHolderImages.find(p => p.id === 'hero-providers');
    
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <PublicHeader />
            <main>
                <section className="relative py-20 md:py-24 text-primary-foreground">
                    <div className="absolute inset-0">
                        {heroImage && (
                        <Image
                            src={heroImage.imageUrl}
                            alt="A team of engineers collaborating on a project."
                            fill
                            className="object-cover"
                            data-ai-hint={heroImage.imageHint}
                            priority
                        />
                        )}
                        <div className="absolute inset-0 bg-primary/60" />
                    </div>
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
                        <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-headline font-bold">
                            The NDT EXCHANGE Lifecycle
                        </h1>
                        <p className="mt-6 text-lg md:text-xl text-primary-foreground/90">
                            From job creation to final payment, our platform provides a standardized, transparent workflow to ensure quality and efficiency at every step.
                        </p>
                        </div>
                    </div>
                </section>
                
                <PhaseSection phase="PHASE 01" title="Job Creation & Scoping" actor="Customer">
                    <StepCard number={1} title="Create Job Posting" description="Customer fills in the job wizard: facility type, location, inspection techniques, asset count, access window, and deadline. NDT type tags auto-suggested." icon={<FilePlus2 />} />
                    <StepCard number={2} title="Upload Scope Documents" description="Attach P&IDs, previous inspection reports, isometric drawings, and HSE requirements. Documents are shared only with shortlisted bidders." icon={<UploadCloud />} />
                    <StepCard number={3} title="Set Budget & Visibility" description="Choose budget type (fixed, indicative range, or open). Select visibility: public open bid, invited tender, or private to preferred providers." icon={<DollarSign />} />
                    <StepCard number={4} title="Platform Verification & Publishing" description="NDT Exchange auto-validates required certification types, flags incomplete scopes, and publishes to the matching provider pool." icon={<CheckBadge />} />
                </PhaseSection>

                <div className="bg-card">
                <PhaseSection phase="PHASE 02" title="Discovery & Bid Preparation" actor="Provider / OEM">
                     <StepCard number={5} title="Smart Matching & Notifications" description="Platform matches job requirements against provider profiles: location, technique certifications (ASNT Level II/III), industry experience, and capacity calendar." icon={<BellRing />} />
                    <StepCard number={6} title="Review Scope & Express Interest" description="Provider reads the scope, downloads documents (NDA-gated if required), and signals intent to bid — activating the Q&A channel with the customer." icon={<FileSearch />} />
                    <StepCard number={7} title="Pre-Bid Q&A" description="Provider asks clarification questions via the platform's structured Q&A. Customer answers are visible to all registered bidders to ensure fair information." icon={<MessagesSquare />} />
                    <StepCard number={8} title="Build & Submit Bid" description="Provider completes structured bid: lump-sum price, team CVs, certifications, method statement summary, mobilisation date, and payment schedule." icon={<Gavel />} />
                </PhaseSection>
                </div>
                
                <PhaseSection phase="PHASE 03" title="Evaluation & Award" actor="Both Parties">
                    <StepCard number={9} title="Bid Comparison Review" description="Customer views all bids in a scored comparison table — auto-ranked by platform scoring algorithm weighing price, certifications, experience, ratings, and response time." icon={<Users />} />
                    <StepCard number={10} title="Shortlist & Interview (Optional)" description="Customer shortlists 2–3 providers, can request a live video call or additional documentation before making the final decision." icon={<Video />} />
                    <StepCard number={11} title="Contract Generation" description="Platform auto-generates an NDT-specific service contract from the awarded bid scope. Both parties e-sign digitally within the platform." icon={<FileSignature />} />
                    <StepCard number={12} title="Escrow Activation" description="Customer deposits contract value into platform escrow. Platform notifies all unsuccessful bidders. Job status moves to 'Awarded.'" icon={<Banknote />} />
                </PhaseSection>
                
                 <div className="bg-card">
                <PhaseSection phase="PHASE 04" title="Mobilisation & Execution" actor="Provider / OEM">
                    <StepCard number={13} title="Team & Equipment Mobilisation" description="Provider confirms team roster, equipment manifest, and site arrival schedule. Customer approves access via the platform's site permit module." icon={<Truck />} />
                    <StepCard number={14} title="OEM Equipment Dispatch (if applicable)" description="For OEM-bid jobs, specialist instruments are dispatched from the OEM or distributor directly to the site, tracked via the platform logistics module." icon={<Package />} />
                    <StepCard number={15} title="Daily Progress Updates" description="Provider submits structured daily field reports: work completed, defects found, delays flagged. Customer reviews in real-time via the job dashboard." icon={<ClipboardList />} />
                    <StepCard number={16} title="Milestone Payment Releases" description="Platform releases partial escrow payments as customer approves completion milestones (e.g. 30% on mobilisation, 40% on inspection complete, 30% on report accepted)." icon={<Milestone />} />
                </PhaseSection>
                </div>

                <PhaseSection phase="PHASE 05" title="Reporting, Closeout & Review" actor="Both Parties">
                    <StepCard number={17} title="Final Report Submission" description="Provider uploads structured final report: all findings, defect classifications, recommended actions, and NDT data files — stored permanently in the customer's asset register." icon={<FileText />} />
                    <StepCard number={18} title="Customer Sign-off" description="Customer reviews and approves the final deliverables. Any disputes are handled via the platform's structured dispute resolution process before final release." icon={<UserCheck />} />
                    <StepCard number={19} title="Final Payment & Platform Fee" description="Remaining escrow released to provider. Platform deducts commission (5–10%). Invoice issued to customer. Transaction recorded for tax reporting." icon={<Receipt />} />
                    <StepCard number={20} title="Mutual Ratings & Review" description="Both parties rate each other. Ratings feed the platform's reputation engine, improving match quality for future jobs. Disputes flagged to trust & safety team." icon={<Star />} />
                </PhaseSection>
                
                 <section className="bg-card py-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl font-headline font-semibold text-primary">
                        Ready to Join NDT EXCHANGE?
                        </h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                        Experience the future of asset integrity management. Start your 14-day free trial today.
                        </p>
                        <div className="mt-8">
                        <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                            <Link href="/signup">Sign Up for a Free Trial</Link>
                        </Button>
                        </div>
                    </div>
                </section>
            </main>
            <PublicFooter />
        </div>
    );
}

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, CreditCard, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';

function PricingCard({ plan, price, description, features, isFeatured, isCurrent = false, onUpgradeClick }: { 
    plan: string; 
    price: string; 
    description: string; 
    features: string[], 
    isFeatured?: boolean, 
    isCurrent?: boolean,
    onUpgradeClick: (plan: string, price: string) => void
}) {
  return (
    <Card className={cn("flex flex-col", isFeatured ? "border-primary ring-2 ring-primary shadow-lg" : "", isCurrent && "bg-muted")}>
      <CardHeader className="text-center">
        {isCurrent && <div className="text-sm font-bold text-primary">CURRENT PLAN</div>}
        <CardTitle className="text-2xl font-headline">{plan}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="pt-4">
            <span className="text-4xl font-bold">{price}</span>
             {price !== "Custom" && <span className="text-sm text-muted-foreground">/mo</span>}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-3">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start">
              <CheckCircle className="w-5 h-5 text-primary mr-3 mt-1 shrink-0" />
              <span className="text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
            className={cn("w-full", isFeatured && "bg-accent hover:bg-accent/90 text-accent-foreground")} 
            variant={isCurrent ? 'outline' : isFeatured ? 'default' : 'outline'} 
            disabled={isCurrent}
            onClick={() => !isCurrent && onUpgradeClick(plan, price)}
        >
            {isCurrent ? "This is your current plan" : (price === 'Custom' ? 'Contact Sales' : 'Proceed to Payment')}
        </Button>
      </CardFooter>
    </Card>
  );
}


const ClientPlans = ({ onUpgradeClick }: { onUpgradeClick: (plan: string, price: string) => void }) => (
    <>
        <PricingCard
            plan="Client Basic"
            price="$99"
            description="For asset owners with smaller-scale needs."
            features={[
                "Up to 100 managed assets",
                "Secure Document & Data Vault (10GB)",
                "Post jobs to the marketplace",
                "Transparent bidding process",
                "Standard historical reporting",
                "Email Support",
            ]}
            isCurrent={true}
            onUpgradeClick={onUpgradeClick}
        />
        <PricingCard
            plan="Client Pro"
            price="$299"
            description="For growing organizations managing more assets."
            features={[
                "Up to 500 managed assets",
                "Secure Document & Data Vault (50GB)",
                "All Client Basic features",
                "Advanced analytics & cost analysis",
                "Priority email & phone support",
                "Team management up to 10 users",
            ]}
            isFeatured={true}
            onUpgradeClick={onUpgradeClick}
        />
        <PricingCard
            plan="Enterprise"
            price="Custom"
            description="For large organizations with advanced needs."
            features={[
                "Unlimited assets & users",
                "Full API access for integrations",
                "Single Sign-On (SSO)",
                "Dedicated Auditor & Regulator portals",
                "A dedicated Account Manager",
                "24/7/365 Premium Support",
            ]}
            onUpgradeClick={onUpgradeClick}
        />
    </>
);

const ProviderPlans = ({ onUpgradeClick }: { onUpgradeClick: (plan: string, price: string) => void }) => (
    <>
        <PricingCard
            plan="Provider Starter"
            price="$49"
            description="For individual inspectors or small teams."
            features={[
                "Access to job marketplace",
                "Submit up to 10 bids per month",
                "Manage up to 5 technicians",
                "Digital reporting tools",
                "Direct client communication",
            ]}
            isCurrent={true}
            onUpgradeClick={onUpgradeClick}
        />
        <PricingCard
            plan="Provider Growth"
            price="$149"
            description="For established NDT companies."
            features={[
                "Unlimited bids",
                "Manage up to 25 technicians",
                "Advanced equipment management",
                "Calendar & scheduling tools",
                "Company performance analytics",
                "Priority email & phone support",
            ]}
            isFeatured={true}
            onUpgradeClick={onUpgradeClick}
        />
        <PricingCard
            plan="Enterprise"
            price="Custom"
            description="For large service providers with complex needs."
            features={[
                "All Provider Growth features",
                "Full API access for integrations",
                "Multi-location management",
                "Custom branding on reports",
                "A dedicated Account Manager",
                "24/7/365 Premium Support",
            ]}
             onUpgradeClick={onUpgradeClick}
        />
    </>
);

const AuditorView = ({ constructUrl }: { constructUrl: (url: string) => string }) => (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader>
            <CardTitle>Auditor & Regulator Access</CardTitle>
            <CardDescription>Your access is managed through Client or Enterprise accounts.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">
                As an auditor, your firm is typically granted access to specific jobs or assets by a Client company that holds an Enterprise plan. There is no separate subscription plan for auditors. If a client needs to grant you access, they can do so through their Enterprise account settings.
            </p>
        </CardContent>
         <CardFooter>
            <Button asChild variant="outline">
                <Link href={constructUrl("/dashboard/settings")}>
                    Back to Settings
                </Link>
            </Button>
        </CardFooter>
    </Card>
);

const AdminView = ({ constructUrl }: { constructUrl: (url: string) => string }) => (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader>
            <CardTitle>Platform Subscription Management</CardTitle>
            <CardDescription>You are viewing this page as a platform administrator.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">
                As an administrator, you manage the subscription plans for all users on the platform. This page is typically for clients and providers to manage their own subscriptions. To manage all platform subscriptions, please visit the <Link href={constructUrl("/dashboard/subscriptions")} className="text-primary underline">Subscription Management</Link> page.
            </p>
        </CardContent>
         <CardFooter>
            <Button asChild variant="outline">
                <Link href={constructUrl("/dashboard/settings")}>
                    Back to Settings
                </Link>
            </Button>
        </CardFooter>
    </Card>
);


export default function BillingPage() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'client';
    const { toast } = useToast();

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const handleUpgradeClick = (plan: string, price: string) => {
        if (price === "Custom") {
             const mailtoHref = `mailto:sales@ndtexchange.com?subject=Subscription Upgrade Request: ${plan} Plan&body=Hello, I'm interested in upgrading to the ${plan} plan. Please provide me with more details.`;
             window.location.href = mailtoHref;
        } else {
            toast({
                title: "Redirecting to Payment Gateway...",
                description: `You are being redirected to complete your purchase for the ${plan} plan.`,
            });
            // In a real app, this would be a router.push('/payment-gateway') or similar.
        }
    };

  const renderPlansByRole = () => {
    switch(role) {
        case 'client':
            return <ClientPlans onUpgradeClick={handleUpgradeClick} />;
        case 'inspector':
            return <ProviderPlans onUpgradeClick={handleUpgradeClick} />;
        case 'auditor':
            return <AuditorView constructUrl={constructUrl} />;
        case 'admin':
            return <AdminView constructUrl={constructUrl} />;
        default:
             return <ClientPlans onUpgradeClick={handleUpgradeClick} />; // Default to client view
    }
  }

  return (
    <div className="space-y-6">
        <Button asChild variant="outline" size="sm">
            <Link href={constructUrl("/dashboard/settings")}>
                <ChevronLeft className="mr-2 h-4 w-4 text-primary" />
                Back to Settings
            </Link>
        </Button>
      <div className="flex items-center gap-4">
        <CreditCard className="w-8 h-8 text-primary" />
        <div>
            <h1 className="text-2xl font-headline font-semibold">Subscription Plans</h1>
            <p className="text-muted-foreground">
                Choose a plan that fits your needs.
            </p>
        </div>
      </div>
      
      <section id="pricing" className="py-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {renderPlansByRole()}
          </div>
           <p className="text-center text-muted-foreground mt-8 text-sm">
              All plans are billed annually. Pricing is usage-based, determined by factors like platform hosting, data storage, and number of users. We do not process payments for jobs. Contact our sales team for a detailed quote tailored to your needs.
           </p>
      </section>
    </div>
  );
}

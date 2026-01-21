'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, CreditCard, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

function PricingCard({ plan, price, description, features, isFeatured }: { plan: string; price: string; description: string; features: string[], isFeatured: boolean }) {
  return (
    <Card className={cn("flex flex-col", isFeatured ? "border-primary ring-2 ring-primary shadow-lg" : "")}>
      <CardHeader className="text-center">
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
              <CheckCircle className="w-5 h-5 text-accent mr-3 mt-1 shrink-0" />
              <span className="text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button asChild className={cn("w-full", isFeatured && "bg-accent hover:bg-accent/90 text-accent-foreground")} variant={isFeatured ? 'default' : 'outline'}>
          <Link href="/contact">Contact Sales</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}


export default function BillingPage() {
    const searchParams = useSearchParams();

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

  return (
    <div className="space-y-6">
        <Button asChild variant="outline" size="sm">
            <Link href={constructUrl("/dashboard/settings")}>
                <ChevronLeft className="mr-2 h-4 w-4" />
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
            <PricingCard
              plan="Client"
              price="Custom"
              description="For asset owners managing critical infrastructure."
              features={[
                "Full Asset Lifecycle Management",
                "Secure Document & Data Vault",
                "Post jobs to a global marketplace",
                "Transparent bidding & awarding process",
                "Advanced historical reporting",
                "Flexible usage-based pricing",
              ]}
              isFeatured={false}
            />
            <PricingCard
              plan="Service Provider"
              price="Custom"
              description="For NDT companies providing inspection services."
              features={[
                "Access to exclusive job marketplace",
                "Submit competitive digital bids",
                "Team & equipment management tools",
                "Streamlined digital reporting",
                "Direct client communication channels",
                "Priority email & phone support",
              ]}
              isFeatured={true}
            />
            <PricingCard
              plan="Enterprise"
              price="Custom"
              description="For large organizations with advanced integration, security, and support needs."
              features={[
                "All Client & Provider features",
                "Full API access for custom integrations",
                "Single Sign-On (SSO) capabilities",
                "Dedicated Auditor & Regulator portals",
                "A dedicated Account Manager",
                "24/7/365 Premium Support",
              ]}
              isFeatured={false}
            />
          </div>
           <p className="text-center text-muted-foreground mt-8 text-sm">
              All plans are billed annually. Pricing is usage-based, determined by factors like platform hosting, data storage, and number of users. We do not process payments for jobs. Contact our sales team for a detailed quote tailored to your needs.
           </p>
      </section>
    </div>
  );
}

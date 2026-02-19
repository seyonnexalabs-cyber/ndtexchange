
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, UserCheck, Calendar, Bot } from 'lucide-react';
import Link from 'next/link';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import HoneycombHero from '@/components/ui/honeycomb-hero';

export const metadata: Metadata = {
  title: 'Request a Demo',
  description: 'Schedule a personalized demo of NDT EXCHANGE and see how our platform can transform your asset integrity and inspection workflows.',
};

export default function RequestDemoPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader />

      <main className="flex-grow">
        <HoneycombHero>
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">
                See NDT EXCHANGE in Action
              </h1>
              <p className="mt-6 text-lg md:text-xl text-muted-foreground">
                Schedule a live, personalized demo with one of our specialists to see how our platform can address your specific challenges in asset integrity management.
              </p>
               <div className="mt-8">
                  <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Link href="/contact#contact-form">Book Your Demo</Link>
                  </Button>
              </div>
            </div>
        </HoneycombHero>

        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-headline font-semibold text-primary">
                    What to Expect in Your Demo
                </h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                    Our demos are tailored to you. We'll focus on the features and workflows that matter most to your business, whether you're an asset owner, service provider, or OEM.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
                <Card className="text-center">
                    <CardHeader>
                        <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                            <Calendar className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="mt-4 font-headline">1. Discovery Call</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground">
                        <p>We'll start with a brief chat to understand your current workflows, challenges, and goals. This helps us tailor the demo to your specific needs.</p>
                    </CardContent>
                </Card>
                <Card className="text-center">
                    <CardHeader>
                        <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                            <Video className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="mt-4 font-headline">2. Live Platform Tour</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground">
                        <p>Your specialist will walk you through the platform in real-time, focusing on the features relevant to your role (e.g., asset management, job bidding, equipment tracking).</p>
                    </CardContent>
                </Card>
                 <Card className="text-center">
                    <CardHeader>
                        <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                            <UserCheck className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="mt-4 font-headline">3. Custom Use-Cases</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground">
                        <p>We'll demonstrate how NDT EXCHANGE can solve your specific problems, whether it's managing shutdown maintenance or finding certified local inspectors on short notice.</p>
                    </CardContent>
                </Card>
                 <Card className="text-center">
                    <CardHeader>
                        <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                            <Bot className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="mt-4 font-headline">4. Q&A and Next Steps</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground">
                        <p>We'll answer all your questions and discuss pricing, onboarding, and how you can get started with a free 14-day trial.</p>
                    </CardContent>
                </Card>
            </div>
          </div>
        </section>

         <section className="bg-card py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-headline font-semibold text-primary">
              Ready for a Closer Look?
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Our team is ready to show you how NDT EXCHANGE can revolutionize your asset integrity workflow.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/contact#contact-form">Schedule Your Personalized Demo</Link>
              </Button>
            </div>
          </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}

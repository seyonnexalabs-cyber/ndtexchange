
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LifeBuoy, MessageSquare, BookOpen } from 'lucide-react';
import Link from 'next/link';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import HoneycombHero from '@/components/ui/honeycomb-hero';

export const metadata: Metadata = {
  title: 'Help & Support Center',
  description: 'Find answers to common questions, view workflow guides, or contact our support team for assistance with the NDT EXCHANGE platform.',
};

export default function HelpPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader />

      <main className="flex-grow">
        <HoneycombHero>
            <div className="max-w-3xl mx-auto text-center">
              <div className="mx-auto bg-primary text-primary-foreground p-4 rounded-full w-fit mb-6">
                <LifeBuoy className="w-10 h-10" />
              </div>
              <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">
                Help & Support Center
              </h1>
              <p className="mt-6 text-lg md:text-xl text-muted-foreground">
                We're here to help. Find the resources you need to get the most out of NDT EXCHANGE, or get in touch with our support team.
              </p>
            </div>
        </HoneycombHero>

        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <BookOpen className="w-6 h-6 text-primary" />
                        <span>Guides & FAQs</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        Our frequently asked questions and workflow guides are the fastest way to find answers.
                    </p>
                    <ul className="space-y-2">
                        <li>
                            <Button variant="link" asChild className="p-0 h-auto">
                                <Link href="/platform-workflow">View the Platform Workflow</Link>
                            </Button>
                        </li>
                         <li>
                            <Button variant="link" asChild className="p-0 h-auto">
                                <Link href="/contact#faq">Frequently Asked Questions</Link>
                            </Button>
                        </li>
                    </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <MessageSquare className="w-6 h-6 text-primary" />
                        <span>Contact Support</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        Can't find what you're looking for? Our team is ready to assist you with any questions or issues.
                    </p>
                    <Button asChild>
                        <Link href="/contact#contact-form">Submit a Ticket</Link>
                    </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}

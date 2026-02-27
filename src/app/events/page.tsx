
'use client';

import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import HoneycombHero from '@/components/ui/honeycomb-hero';

export default function EventsPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <PublicHeader />
            <main className="flex-grow">
                <HoneycombHero>
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">
                            NDT Events Worldwide
                        </h1>
                        <p className="mt-6 text-lg md:text-xl text-muted-foreground">
                            Explore upcoming conferences, exhibitions, and training courses for the Non-Destructive Testing industry, powered by the International Committee for Non-Destructive Testing (ICNDT).
                        </p>
                    </div>
                </HoneycombHero>
                
                <section className="py-8 md:py-12">
                    <div className="container mx-auto px-0 sm:px-6 lg:px-8">
                        <div className="w-full h-[80vh] bg-background">
                            <iframe
                                src="https://www.icndt.org/Events/International-Event-Calendar"
                                title="ICNDT International Event Calendar"
                                className="w-full h-full border rounded-lg"
                            />
                        </div>
                    </div>
                </section>
            </main>
            <PublicFooter />
        </div>
    );
}

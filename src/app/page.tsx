
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { NdtExchangeLogo } from '@/app/components/icons';

export const metadata: Metadata = {
  title: 'NDT EXCHANGE | The Industrial Standard',
  description: 'The premier marketplace connecting NDT clients with certified inspection providers and Level III auditors. Trusted, verified, and built for precision.',
};

export default function HomePage() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-providers');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-background pt-32 pb-20 md:pt-48 md:pb-28">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="text-center lg:text-left">
                        <div className="flex justify-center lg:justify-start items-center gap-4 mb-6">
                            <NdtExchangeLogo className="w-20 h-20 text-primary" />
                            <div>
                                <h2 className="text-3xl font-bold text-primary tracking-tighter">NDT EXCHANGE</h2>
                                <p className="text-lg font-semibold text-muted-foreground tracking-widest">THE INDUSTRIAL STANDARD</p>
                            </div>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-headline font-extrabold tracking-tight">
                            <span className="text-primary">THE INDUSTRIAL</span>
                            <br />
                            <span className="text-foreground">STANDARD</span>
                        </h1>
                        <p className="mt-6 max-w-xl mx-auto lg:mx-0 text-lg md:text-xl text-muted-foreground">
                            The premier marketplace connecting NDT clients with certified inspection providers and Level III auditors. Trusted, verified, and built for precision.
                        </p>
                         <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                            <Button size="lg" asChild>
                                <Link href="/signup">Get Started</Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                                <Link href="/dashboard?role=client">View Marketplace</Link>
                            </Button>
                        </div>
                        <div className="mt-12 grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-4xl font-bold text-primary">500+</p>
                                <p className="text-sm font-medium text-muted-foreground">PROVIDERS</p>
                            </div>
                             <div>
                                <p className="text-4xl font-bold text-primary">10K+</p>
                                <p className="text-sm font-medium text-muted-foreground">INSPECTIONS</p>
                            </div>
                             <div>
                                <p className="text-4xl font-bold text-primary">100+</p>
                                <p className="text-sm font-medium text-muted-foreground">LEVEL III</p>
                            </div>
                        </div>
                    </div>
                    <div className="hidden lg:block relative">
                         <div className="absolute -top-8 -left-8 w-full h-full border-8 border-primary rounded-2xl transform -rotate-3" />
                         <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                             {heroImage && (
                                <Image
                                    src={heroImage.imageUrl}
                                    alt="NDT inspector working on an industrial pipeline"
                                    width={600}
                                    height={700}
                                    className="object-cover"
                                    data-ai-hint={heroImage.imageHint}
                                    priority
                                />
                            )}
                            <div className="absolute top-4 right-4 bg-foreground/80 text-white px-4 py-2 rounded-md animate-scan-glow">
                                <p className="text-sm font-mono tracking-widest">SCANNING...</p>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Other sections can be added here */}
        
      </main>

      <PublicFooter />
    </div>
  );
}
```
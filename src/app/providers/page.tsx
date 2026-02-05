
import type { Metadata } from 'next';
import * as React from 'react';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, MapPin, X } from 'lucide-react';
import Link from 'next/link';
import { serviceProviders } from '@/lib/service-providers-data';
import { NDTTechniques } from '@/lib/placeholder-data';
import { auditFirmIndustries } from '@/lib/auditors-data';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';


export const metadata: Metadata = {
    title: 'NDT Service Provider Directory',
    description: 'Browse our directory of leading NDT companies from around the world. Filter by technique to find the right partner for your inspection needs.',
};

const StarRating = ({ rating }: { rating: number }) => {
    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-300 text-gray-300'}`}
                />
            ))}
            <span className="ml-2 text-sm text-muted-foreground">{rating.toFixed(1)}</span>
        </div>
    );
};


export default function ProvidersPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
    const selectedTechniques = React.useMemo(() => {
        const techniques = searchParams?.techniques;
        if (Array.isArray(techniques)) return techniques;
        if (typeof techniques === 'string') return [techniques];
        return [];
    }, [searchParams]);

    const selectedIndustries = React.useMemo(() => {
        const industries = searchParams?.industries;
        if (Array.isArray(industries)) return industries;
        if (typeof industries === 'string') return [industries];
        return [];
    }, [searchParams]);

    const heroImage = PlaceHolderImages.find(p => p.id === 'hero-providers');

    const filteredProviders = useMemo(() => {
        return serviceProviders.filter(provider => {
            const techniqueMatch = selectedTechniques.length === 0 || selectedTechniques.every(tech => provider.techniques.includes(tech));
            const industryMatch = selectedIndustries.length === 0 || selectedIndustries.every(ind => provider.industries.includes(ind));
            return techniqueMatch && industryMatch;
        });
    }, [selectedTechniques, selectedIndustries]);
    
    const createQueryString = (params: Record<string, string[]>) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, values]) => {
            values.forEach(value => searchParams.append(key, value));
        });
        return searchParams.toString();
    };

    const filterForm = (
        <form>
            <div className="flex gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline">
                            Technique ({selectedTechniques.length})
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <h4 className="font-medium leading-none">Techniques</h4>
                                <p className="text-sm text-muted-foreground">Select the techniques you require.</p>
                            </div>
                             <ScrollArea className="grid gap-2 max-h-60 p-1">
                                {NDTTechniques.map(tech => (
                                    <div key={tech.id} className="flex items-center space-x-2 p-1">
                                        <Checkbox 
                                            id={`tech-${tech.id}`} 
                                            name="techniques"
                                            value={tech.id}
                                            defaultChecked={selectedTechniques.includes(tech.id)}
                                        />
                                        <Label htmlFor={`tech-${tech.id}`}>{tech.name} ({tech.id})</Label>
                                    </div>
                                ))}
                            </ScrollArea>
                        </div>
                    </PopoverContent>
                </Popover>
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline">
                            Industry ({selectedIndustries.length})
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <h4 className="font-medium leading-none">Industries</h4>
                                <p className="text-sm text-muted-foreground">Select the industries you operate in.</p>
                            </div>
                             <ScrollArea className="grid gap-2 max-h-60 p-1">
                                {auditFirmIndustries.map(ind => (
                                    <div key={ind} className="flex items-center space-x-2 p-1">
                                        <Checkbox 
                                            id={`ind-${ind.replace(/\s+/g, '-')}`} 
                                            name="industries"
                                            value={ind}
                                            defaultChecked={selectedIndustries.includes(ind)}
                                        />
                                        <Label htmlFor={`ind-${ind.replace(/\s+/g, '-')}`}>{ind}</Label>
                                    </div>
                                ))}
                            </ScrollArea>
                        </div>
                    </PopoverContent>
                </Popover>
                <Button type="submit">Apply</Button>
                 <Button variant="ghost" asChild>
                    <Link href="/providers">Clear</Link>
                </Button>
            </div>
        </form>
    );

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <PublicHeader />

            <main className="flex-grow">
                <section className="relative py-20 md:py-32">
                  <div className="absolute inset-0">
                    {heroImage && (
                      <Image
                        src={heroImage.imageUrl}
                        alt={heroImage.description}
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
                      <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary-foreground">
                        Find NDT Service Providers
                      </h1>
                      <p className="mt-6 text-lg md:text-xl text-primary-foreground/80">
                        Browse our directory of leading NDT companies from around the world. Filter by technique to find the right partner for your inspection needs.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="py-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                            <h2 className="text-2xl font-headline font-semibold">Service Provider Directory</h2>
                            {filterForm}
                        </div>
                        
                         {(selectedTechniques.length > 0 || selectedIndustries.length > 0) && (
                            <div className="mb-4 flex items-center flex-wrap gap-2">
                                <span className="text-sm font-medium">Active Filters:</span>
                                {selectedTechniques.map(techId => (
                                    <Badge key={techId} variant="secondary">
                                        {NDTTechniques.find(t => t.id === techId)?.name}
                                        <Link href={`/providers?${createQueryString({
                                            techniques: selectedTechniques.filter(t => t !== techId),
                                            industries: selectedIndustries
                                        })}`}>
                                          <button className="ml-1.5 rounded-full hover:bg-muted-foreground/20 p-0.5">
                                              <X className="h-3 w-3" />
                                          </button>
                                        </Link>
                                    </Badge>
                                ))}
                                {selectedIndustries.map(ind => (
                                    <Badge key={ind} variant="outline">
                                        {ind}
                                        <Link href={`/providers?${createQueryString({
                                            techniques: selectedTechniques,
                                            industries: selectedIndustries.filter(i => i !== ind)
                                        })}`}>
                                          <button className="ml-1.5 rounded-full hover:bg-muted-foreground/20 p-0.5">
                                              <X className="h-3 w-3" />
                                          </button>
                                        </Link>
                                    </Badge>
                                ))}
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/providers">Clear All</Link>
                                </Button>
                            </div>
                        )}

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredProviders.map(provider => (
                                <Card key={provider.id} className="flex flex-col">
                                    <CardHeader>
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-16 w-16">
                                                <AvatarFallback className="text-xl">{provider.name.split(' ').map(n => n[0]).join('').slice(0,3)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <CardTitle className="font-headline">{provider.name}</CardTitle>
                                                <CardDescription className="flex items-center gap-1.5 mt-1">
                                                    <MapPin className="w-3 h-3"/> {provider.location}
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <StarRating rating={provider.rating} />
                                        <p className="mt-4 text-sm text-muted-foreground h-20 overflow-hidden">{provider.description}</p>
                                        <div className="mt-4">
                                            <h4 className="text-sm font-semibold mb-2">Techniques Offered</h4>
                                            <div className="flex flex-wrap gap-1.5 min-h-16">
                                                {provider.techniques.map(tech => (
                                                    <Badge key={tech} variant="secondary" shape="rounded">{tech}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                             {filteredProviders.length === 0 && (
                                <div className="col-span-full text-center py-10">
                                    <p className="text-muted-foreground">No service providers match the selected filters.</p>
                                </div>
                            )}
                        </div>
                        <div className="mt-16 text-center text-sm text-muted-foreground max-w-4xl mx-auto p-4 border rounded-lg bg-card">
                            <p className="font-semibold">Disclaimer</p>
                            <p className="mt-2">
                                The service providers listed in this directory are for informational purposes only. NDT Exchange does not endorse or recommend any specific provider. Users are encouraged to perform their own due diligence before engaging with any service provider. All company names and logos are the property of their respective owners.
                            </p>
                        </div>
                    </div>
                </section>
                <section className="bg-card py-20">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-headline font-semibold text-primary">
                      Ready to Join NDT Exchange?
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                      Experience the future of asset integrity management. Start your 30-day free trial today. No credit card required, full access to all features.
                    </p>
                    <div className="mt-8">
                      <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                        <Link href="/contact">Start Your Free Trial</Link>
                      </Button>
                    </div>
                  </div>
                </section>
            </main>

            <PublicFooter />
        </div>
    );
}

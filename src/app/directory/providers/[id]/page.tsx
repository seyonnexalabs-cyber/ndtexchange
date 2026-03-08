
'use client';
import * as React from 'react';
import { useMemo } from "react";
import { notFound, useSearchParams, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronLeft, MapPin, Star, Users, Wrench, Calendar } from "lucide-react";
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { GLOBAL_DATE_FORMAT, safeParseDate, cn } from '@/lib/utils';
import { useFirebase, useCollection, useDoc, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import type { NDTServiceProvider, PlatformUser, InspectorAsset, Subscription, Review, NDTTechnique } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';

const ClientFormattedDate = ({ date }: { date: Date | null }) => {
    const [formatted, setFormatted] = React.useState<string | null>(null);
    React.useEffect(() => {
        if (date) {
            setFormatted(format(date, GLOBAL_DATE_FORMAT));
        }
    }, [date]);
    if (!formatted) return null;
    return <p className="text-sm text-muted-foreground">{formatted}</p>;
};

const StarRating = ({ rating }: { rating: number }) => {
    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-300 text-gray-300'}`}
                />
            ))}
            <span className="ml-2 text-xs text-muted-foreground">{rating > 0 ? rating.toFixed(1) : 'No reviews'}</span>
        </div>
    );
};

export default function PublicProviderProfilePage() {
    const params = useParams();
    const { id } = params;
    const searchParams = useSearchParams();
    const isMobile = useIsMobile();
    const role = searchParams.get('role');
    const { firestore, user } = useFirebase();
    
    const providerRef = useMemoFirebase(() => (firestore && id ? doc(firestore, 'companies', id as string) : null), [firestore, id]);
    const { data: provider, isLoading: isLoadingProvider } = useDoc<NDTServiceProvider>(providerRef);
    
    const equipmentQuery = useMemoFirebase(() => (firestore && user && id ? query(collection(firestore, 'equipment'), where('providerId', '==', id), where('isPublic', '==', true)) : null), [firestore, user, id]);
    const { data: publicEquipment, isLoading: isLoadingEquipment } = useCollection<InspectorAsset>(equipmentQuery);

    const subscriptionQuery = useMemoFirebase(() => {
        if (firestore && user && id && role === 'admin') {
            return query(collection(firestore, 'subscriptions'), where('companyId', '==', id));
        }
        return null;
    }, [firestore, user, id, role]);
    const { data: subscriptions, isLoading: isLoadingSubs } = useCollection<Subscription>(subscriptionQuery);
    const subscription = subscriptions?.[0];
    
    const reviewsQuery = useMemoFirebase(() => (firestore && user && id ? query(collection(firestore, 'reviews'), where('providerId', '==', id), where('status', '==', 'Approved')) : null), [firestore, user, id]);
    const { data: reviewsData, isLoading: isLoadingReviews } = useCollection<Review>(reviewsQuery);
    
    const allClientsQuery = useMemoFirebase(() => (firestore && user ? query(collection(firestore, 'companies'), where('type', '==', 'Client')) : null), [firestore, user]);
    const { data: allClients, isLoading: isLoadingClients } = useCollection<any>(allClientsQuery);

    const allNdtTechniquesQuery = useMemoFirebase(() => (firestore && user ? collection(firestore, 'techniques') : null), [firestore, user]);
    const { data: allNdtTechniques, isLoading: isLoadingTechniques } = useCollection<NDTTechnique>(allNdtTechniquesQuery);

    const providerReviews = useMemo(() => {
        if (!reviewsData || !allClients) return [];
        return reviewsData.map(review => {
            const client = allClients.find(c => c.id === review.clientId);
            return {
                ...review,
                clientName: client ? client.name : 'Anonymous Client',
            };
        });
    }, [reviewsData, allClients]);
    
    const avgRating = useMemo(() => {
        if (!providerReviews || providerReviews.length === 0) return 0;
        return providerReviews.reduce((acc, r) => acc + r.rating, 0) / providerReviews.length;
    }, [providerReviews]);


    const isLoading = isLoadingProvider || isLoadingEquipment || isLoadingSubs || isLoadingReviews || isLoadingClients || isLoadingTechniques || !id;

    if (isLoading) {
        return (
            <div className="bg-background">
                <PublicHeader />
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="space-y-6">
                        <Skeleton className="h-8 w-1/4 mb-6" />
                        <div className="flex items-center gap-4 mb-6">
                            <Skeleton className="h-20 w-20 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-64" />
                                <Skeleton className="h-4 w-48" />
                            </div>
                        </div>
                        <Skeleton className="h-96 w-full" />
                    </div>
                </div>
                <PublicFooter />
            </div>
        );
    }
    
    if (!provider) {
        notFound();
    }

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }
    
    const backUrl = role === 'admin' ? "/dashboard/providers" : "/ecosystem?tab=providers";
    const backText = role === 'admin' ? "Back to Providers" : "Back to Find Providers";

    const startDate = subscription ? safeParseDate(subscription.startDate) : null;

    return (
        <TooltipProvider>
            <div className="bg-background">
                <PublicHeader />
                <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                        <Link href={backUrl} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), "mb-4 sm:mb-0")}>
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            {backText}
                        </Link>
                        <div className="flex gap-2">
                            <Button asChild variant="outline"><Link href="/login">Log In to Contact</Link></Button>
                            <Button asChild><Link href="/signup">Post a Job</Link></Button>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-6">
                        <Avatar className="h-20 w-20">
                            {provider.logoUrl && <AvatarImage src={provider.logoUrl} alt={`${provider.name} logo`} />}
                            <AvatarFallback className="text-3xl">{provider.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-2xl font-headline font-bold">{provider.name}</h1>
                            <p className="text-muted-foreground flex items-center gap-1.5 pt-1">
                                <MapPin className="w-4 h-4 text-primary"/> {provider.location}
                            </p>
                        </div>
                    </div>

                    <Tabs defaultValue="details">
                        <TabsList className="mb-4">
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="reviews">Reviews ({providerReviews.length})</TabsTrigger>
                            <TabsTrigger value="equipment">Public Equipment ({(publicEquipment || []).length})</TabsTrigger>
                        </TabsList>
                        <TabsContent value="details">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Provider Details</CardTitle>
                                    <CardDescription>Company information and offered services.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <h3 className="font-semibold text-sm mb-1">Rating</h3>
                                        <StarRating rating={avgRating} />
                                    </div>
                                     {role === 'admin' && subscription && (
                                        <div>
                                            <h3 className="font-semibold text-sm mb-1">Member Since</h3>
                                            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4" />
                                                <ClientFormattedDate date={startDate} />
                                            </p>
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-semibold text-sm mb-1">About</h3>
                                        <p className="text-sm text-muted-foreground">{provider.description}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold mb-2">Techniques Offered</h4>
                                        <div className="flex flex-wrap gap-1.5">
                                            {provider.techniques.map(techAcronym => {
                                                const technique = allNdtTechniques?.find(t => t.acronym.toUpperCase() === techAcronym);
                                                return (
                                                    <Tooltip key={techAcronym}>
                                                        <TooltipTrigger>
                                                            <Badge variant="secondary" shape="rounded">{techAcronym}</Badge>
                                                        </TooltipTrigger>
                                                        {technique && (
                                                            <TooltipContent className="max-w-xs">
                                                                <p className="font-bold">{technique.title}</p>
                                                                <p>{technique.description}</p>
                                                            </TooltipContent>
                                                        )}
                                                    </Tooltip>
                                                )
                                            })}
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <h4 className="text-sm font-semibold mb-2">Industry Focus</h4>
                                        <div className="flex flex-wrap gap-1.5">
                                            {provider.industries.map(industry => (
                                                <Badge key={industry} variant="outline" shape="rounded">{industry}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="reviews">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Star className="text-primary" /> Client Reviews
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {providerReviews.length > 0 ? (
                                        <div className="space-y-6">
                                            {providerReviews.map(review => {
                                                const reviewDate = safeParseDate(review.date);
                                                return (
                                                    <div key={review.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar><AvatarFallback>{review.clientName.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                                                                <div>
                                                                    <p className="font-semibold">{review.clientName}</p>
                                                                    <StarRating rating={review.rating} />
                                                                </div>
                                                            </div>
                                                            <ClientFormattedDate date={reviewDate} />
                                                        </div>
                                                        <p className="mt-4 text-sm text-muted-foreground italic bg-muted/50 p-4 rounded-md">"{review.comment}"</p>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center text-muted-foreground py-10">No approved reviews found for this provider yet.</div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="equipment">
                             <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Wrench className="text-primary" /> Public Equipment</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {(publicEquipment || []).map(equip => (
                                            <Card key={equip.id} className="p-4">
                                                <div className="space-y-1">
                                                    <p className="font-semibold">{equip.name}</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {equip.techniques.map((tech: string) => <Badge key={tech} variant="secondary">{tech}</Badge>)}
                                                    </div>
                                                    {(equip.manufacturer || equip.model) && (
                                                        <p className="text-xs text-muted-foreground">{equip.manufacturer}{equip.manufacturer && equip.model && ' - '}{equip.model}</p>
                                                    )}
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                    {(publicEquipment || []).length === 0 && (
                                        <div className="text-center text-muted-foreground py-10">This provider has not listed any public equipment.</div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </main>
                <PublicFooter />
            </div>
        </TooltipProvider>
    );
}

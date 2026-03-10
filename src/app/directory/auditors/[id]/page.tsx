
'use client';
import * as React from 'react';
import { useMemo } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, MapPin, Users, Star } from "lucide-react";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useFirebase, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import type { PlatformUser, AuditFirm, Review } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { GLOBAL_DATE_FORMAT, cn, safeParseDate } from '@/lib/utils';

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

export default function PublicAuditorProfilePage() {
    const params = useParams();
    const { id } = params;
    const { firestore } = useFirebase();

    const auditorRef = useMemoFirebase(() => (firestore && id ? doc(firestore, 'companies', id as string) : null), [firestore, id]);
    const { data: auditor, isLoading: isLoadingAuditor } = useDoc<AuditFirm>(auditorRef);
    
    const reviewsQuery = useMemoFirebase(() => (firestore && id ? query(collection(firestore, 'reviews'), where('providerId', '==', id), where('status', '==', 'Approved')) : null), [firestore, id]);
    const { data: reviewsData, isLoading: isLoadingReviews } = useCollection<Review>(reviewsQuery);

    const allClientsQuery = useMemoFirebase(() => (firestore ? query(collection(firestore, 'companies'), where('type', '==', 'Client')) : null), [firestore]);
    const { data: allClients, isLoading: isLoadingClients } = useCollection<any>(allClientsQuery);

    const auditorReviews = useMemo(() => {
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
        if (!auditorReviews || auditorReviews.length === 0) return 0;
        return auditorReviews.reduce((acc, r) => acc + r.rating, 0) / auditorReviews.length;
    }, [auditorReviews]);


    const isLoading = isLoadingAuditor || isLoadingReviews || isLoadingClients || !id;

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
    
    if (!auditor) {
        notFound();
    }

    return (
        <div className="bg-background">
            <PublicHeader />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <Link href="/ecosystem?tab=auditors" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), "mb-4 sm:mb-0")}>
                        <ChevronLeft className="mr-2 h-4 w-4 text-primary" />
                        Back to Ecosystem
                    </Link>
                     <div className="flex gap-2">
                        <Button asChild variant="outline"><Link href="/login">Log In to Contact</Link></Button>
                        <Button asChild><Link href="/signup">Post a Job</Link></Button>
                    </div>
                </div>
                
                <div className="flex items-center gap-4 mb-6">
                    <Avatar className="h-20 w-20">
                        <AvatarFallback className="text-3xl">{auditor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-2xl font-headline font-bold">{auditor.name}</h1>
                        <p className="text-muted-foreground flex items-center gap-1.5 pt-1">
                            <MapPin className="w-4 h-4 text-primary"/> {auditor.location}
                        </p>
                    </div>
                </div>

                <Tabs defaultValue="details">
                    <TabsList className="mb-4">
                        <TabsTrigger value="details">Details</TabsTrigger>
                         <TabsTrigger value="reviews">Reviews ({auditorReviews.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="details">
                        <Card>
                            <CardHeader>
                                <CardTitle>Auditor Profile</CardTitle>
                                <CardDescription>Company information and areas of specialty.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="font-semibold text-sm mb-1">Rating</h3>
                                    <StarRating rating={avgRating} />
                                </div>
                                 <div>
                                    <h3 className="font-semibold text-sm mb-1">About</h3>
                                    <p className="text-sm text-muted-foreground">{auditor.description}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold mb-2">Services Offered</h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(auditor.services || []).map(service => (
                                            <Badge key={service} variant="secondary" shape="rounded">{service}</Badge>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <h4 className="text-sm font-semibold mb-2">Industry Focus</h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(auditor.industries || []).map(industry => (
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
                                <CardDescription>
                                    Feedback from clients who have worked with {auditor.name}.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {(auditorReviews || []).length > 0 ? (
                                    <div className="space-y-6">
                                        {auditorReviews.map(review => {
                                            const reviewDate = safeParseDate(review.date);
                                            return (
                                                <div key={review.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar>
                                                                <AvatarFallback>{review.clientName.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-semibold">{review.clientName}</p>
                                                                <StarRating rating={review.rating} />
                                                            </div>
                                                        </div>
                                                        <ClientFormattedDate date={reviewDate} />
                                                    </div>
                                                    <p className="mt-4 text-sm text-muted-foreground italic bg-muted/50 p-4 rounded-md">
                                                        "{review.comment}"
                                                    </p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center text-muted-foreground py-10">
                                        No approved reviews found for this firm yet.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
            <PublicFooter />
        </div>
    );
}

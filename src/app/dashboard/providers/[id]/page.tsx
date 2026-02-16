'use client';
import * as React from 'react';
import { useMemo } from "react";
import { notFound, useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronLeft, MapPin, Star, Users, Wrench, Calendar } from "lucide-react";
import { useMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { GLOBAL_DATE_FORMAT } from '@/lib/utils';
import { useFirebase, useCollection, useDoc, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import type { NDTServiceProvider, PlatformUser, InspectorAsset, Subscription, Review, NDTTechnique } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const StarRating = ({ rating }: { rating: number }) => {
    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-300 text-gray-300'}`}
                />
            ))}
            <span className="ml-2 text-xs text-muted-foreground">{rating.toFixed(1)}</span>
        </div>
    );
};

export default function ProviderDetailPage() {
    const params = useParams();
    const { id } = params;
    const searchParams = useSearchParams();
    const isMobile = useMobile();
    const role = searchParams.get('role');
    const { firestore, user } = useFirebase();
    
    const providerRef = useMemoFirebase(() => (firestore && id ? doc(firestore, 'companies', id as string) : null), [firestore, id]);
    const { data: provider, isLoading: isLoadingProvider } = useDoc<NDTServiceProvider>(providerRef);

    const teamQuery = useMemoFirebase(() => (firestore && user && id ? query(collection(firestore, 'users'), where('companyId', '==', id)) : null), [firestore, user, id]);
    const { data: providerTechnicians, isLoading: isLoadingTeam } = useCollection<PlatformUser>(teamQuery);

    const equipmentQuery = useMemoFirebase(() => (firestore && user && id ? query(collection(firestore, 'equipment'), where('providerId', '==', id), where('isPublic', '==', true)) : null), [firestore, user, id]);
    const { data: publicEquipment, isLoading: isLoadingEquipment } = useCollection<InspectorAsset>(equipmentQuery);

    const subscriptionQuery = useMemoFirebase(() => (firestore && user && id ? query(collection(firestore, 'subscriptions'), where('companyId', '==', id)) : null), [firestore, user, id]);
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
    
    const isLoading = isLoadingProvider || isLoadingTeam || isLoadingEquipment || isLoadingSubs || isLoadingReviews || isLoadingClients || isLoadingTechniques;

    if (isLoading) {
       return (
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
       )
    }

    if (!provider) {
        notFound();
    }

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }
    
    const backUrl = role === 'admin' ? "/dashboard/providers" : "/dashboard/find-providers";
    const backText = role === 'admin' ? "Back to Providers" : "Back to Find Providers";

    return (
        <TooltipProvider>
            <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <Button asChild variant="outline" size="sm" className="mb-4 sm:mb-0">
                        <Link href={constructUrl(backUrl)}>
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            {backText}
                        </Link>
                    </Button>
                    {role === 'admin' && <Button>Edit Provider</Button>}
                </div>
                
                <div className="flex items-center gap-4 mb-6">
                    <Avatar className="h-20 w-20">
                        {provider.logoUrl && <AvatarImage src={provider.logoUrl} alt={`${provider.name} logo`} />}
                        <AvatarFallback className="text-3xl">{provider.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-2xl font-headline font-bold">{provider.name}</h1>
                        <p className="text-muted-foreground flex items-center gap-1.5 pt-1">
                            <MapPin className="w-4 h-4"/> {provider.location}
                        </p>
                    </div>
                </div>

                <Tabs defaultValue="details">
                    <TabsList className="mb-4">
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="reviews">Reviews ({(providerReviews || []).length})</TabsTrigger>
                        <TabsTrigger value="technicians">Technicians</TabsTrigger>
                        <TabsTrigger value="equipment">Equipment</TabsTrigger>
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
                                    <StarRating rating={provider.rating} />
                                </div>
                                 {subscription && (
                                    <div>
                                        <h3 className="font-semibold text-sm mb-1">Member Since</h3>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4" /> {format(new Date(subscription.startDate), GLOBAL_DATE_FORMAT)}
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
                                <CardDescription>
                                    Feedback from clients who have worked with {provider.name}.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {(providerReviews || []).length > 0 ? (
                                    <div className="space-y-6">
                                        {providerReviews.map(review => (
                                            <div key={review.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar>
                                                            <AvatarFallback>{review.clientName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-semibold">{review.clientName}</p>
                                                            <StarRating rating={review.rating} />
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{review.date?.toDate ? format(review.date.toDate(), GLOBAL_DATE_FORMAT) : ''}</p>
                                                </div>
                                                <p className="mt-4 text-sm text-muted-foreground italic bg-muted/50 p-4 rounded-md">
                                                    "{review.comment}"
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-muted-foreground py-10">
                                        No approved reviews found for this provider yet.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="technicians">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="text-primary" /> Technician Roster
                                </CardTitle>
                                <CardDescription>
                                    Technicians employed by {provider.name}.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                            {isMobile ? (
                                    <div className="space-y-4">
                                        {(providerTechnicians || []).map(tech => {
                                            return (
                                                <Card key={tech.id} className="p-4">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar>
                                                                <AvatarFallback>{tech.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-semibold">{tech.name}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1 mt-3">
                                                        {tech.certifications?.map((cert, i) => (
                                                            <Badge key={i} variant="secondary" shape="rounded">
                                                                {cert.method}
                                                                <Separator orientation="vertical" className="h-3 mx-1.5 bg-muted-foreground/30" />
                                                                {cert.level}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </Card>
                                            );
                                        })}
                                    </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Certifications</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(providerTechnicians || []).map(tech => {
                                            return (
                                                <TableRow key={tech.id}>
                                                    <TableCell className="font-medium flex items-center gap-3">
                                                        <Avatar>
                                                        <AvatarFallback>{tech.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                        </Avatar>
                                                        {tech.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-1">
                                                            {tech.certifications?.map((cert, i) => (
                                                                <Badge key={i} variant="secondary" shape="rounded">
                                                                    {cert.method}
                                                                    <Separator orientation="vertical" className="h-3 mx-1.5 bg-muted-foreground/30" />
                                                                    {cert.level}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            )}
                            {(providerTechnicians || []).length === 0 && (
                                    <div className="text-center text-muted-foreground py-10">
                                        No technicians found for this provider.
                                    </div>
                            )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="equipment">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Wrench className="text-primary" /> Public Equipment
                                </CardTitle>
                                <CardDescription>
                                    A selection of publicly listed equipment from {provider.name}.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                            {isMobile ? (
                                    <div className="space-y-4">
                                        {(publicEquipment || []).map(equip => (
                                            <Card key={equip.id} className="p-4">
                                                <div className="space-y-1">
                                                    <p className="font-semibold">{equip.name}</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {equip.techniques.map(tech => <Badge key={tech} variant="secondary">{tech}</Badge>)}
                                                    </div>
                                                    {(equip.manufacturer || equip.model) && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {equip.manufacturer}{equip.manufacturer && equip.model && ' - '}{equip.model}
                                                        </p>
                                                    )}
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Equipment Name</TableHead>
                                            <TableHead>Technique(s)</TableHead>
                                            <TableHead>Manufacturer</TableHead>
                                            <TableHead>Model</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(publicEquipment || []).map(equip => (
                                            <TableRow key={equip.id}>
                                                <TableCell className="font-medium">{equip.name}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {equip.techniques.map(tech => <Badge key={tech} variant="secondary">{tech}</Badge>)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{equip.manufacturer || 'N/A'}</TableCell>
                                                <TableCell>{equip.model || 'N/A'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                            {(publicEquipment || []).length === 0 && (
                                    <div className="text-center text-muted-foreground py-10">
                                        This provider has not listed any public equipment.
                                    </div>
                            )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </TooltipProvider>
    );
}

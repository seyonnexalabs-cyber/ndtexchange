
'use client';
import * as React from 'react';
import { useMemo } from "react";
import { notFound, useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { serviceProviders } from "@/lib/service-providers-data";
import { technicians } from "@/lib/placeholder-data";
import { ChevronLeft, MapPin, Star, Users } from "lucide-react";
import { useIsMobile } from '@/hooks/use-mobile';


const StarRating = ({ rating }: { rating: number }) => {
    return (
        <div className="flex items-center">
            {[...Array(Math.floor(rating))].map((_, i) => (
                <Star key={`full-${i}`} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
            {[...Array(5 - Math.floor(rating))].map((_, i) => (
                <Star key={`empty-${i}`} className="w-4 h-4 fill-gray-300 text-gray-300" />
            ))}
            <span className="ml-2 text-xs text-muted-foreground">{rating.toFixed(1)}</span>
        </div>
    );
};

export default function ProviderDetailPage() {
    const params = useParams();
    const { id } = params;
    const searchParams = useSearchParams();
    const isMobile = useIsMobile();
    
    const provider = useMemo(() => serviceProviders.find(p => p.id === id), [id]);
    const providerTechnicians = useMemo(() => technicians.filter(t => t.providerId === id), [id]);

    if (!provider) {
        notFound();
    }

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    return (
        <div>
            <Button asChild variant="outline" size="sm" className="mb-4">
                <Link href={constructUrl("/dashboard/providers")}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Providers
                </Link>
            </Button>
            
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader className="items-center">
                             <Image 
                                src={provider.logoUrl} 
                                alt={`${provider.name} logo`} 
                                width={80} 
                                height={80} 
                                className="rounded-lg border p-1 mb-4"
                            />
                            <CardTitle className="text-2xl font-headline">{provider.name}</CardTitle>
                            <CardDescription className="flex items-center gap-1.5 pt-1">
                                <MapPin className="w-4 h-4"/> {provider.location}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <StarRating rating={provider.rating} />
                            <p className="mt-4 text-sm text-muted-foreground">{provider.description}</p>
                            <div className="mt-4">
                                <h4 className="text-sm font-semibold mb-2">Techniques Offered</h4>
                                <div className="flex flex-wrap gap-1.5 justify-center">
                                    {provider.techniques.map(tech => (
                                        <Badge key={tech} variant="outline">{tech}</Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                 <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users /> Technician Roster
                            </CardTitle>
                            <CardDescription>
                                Technicians employed by {provider.name}.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                           {isMobile ? (
                                <div className="space-y-4">
                                    {providerTechnicians.map(tech => (
                                        <Card key={tech.id} className="p-4">
                                             <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={`https://picsum.photos/seed/${tech.avatar}/100/100`} />
                                                        <AvatarFallback>{tech.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold">{tech.name}</p>
                                                        <p className="text-sm text-muted-foreground">{tech.level}</p>
                                                    </div>
                                                </div>
                                                <Badge variant={tech.status === 'Available' ? 'default' : 'outline'}>{tech.status}</Badge>
                                            </div>
                                             <div className="flex flex-wrap gap-1 mt-3">
                                                {tech.certifications.map(cert => <Badge key={cert} variant="secondary">{cert}</Badge>)}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                           ) : (
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Level</TableHead>
                                        <TableHead>Certifications</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {providerTechnicians.map(tech => (
                                        <TableRow key={tech.id}>
                                            <TableCell className="font-medium flex items-center gap-3">
                                                <Avatar>
                                                <AvatarImage src={`https://picsum.photos/seed/${tech.avatar}/100/100`} />
                                                <AvatarFallback>{tech.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                </Avatar>
                                                {tech.name}
                                            </TableCell>
                                            <TableCell>{tech.level}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {tech.certifications.map(cert => <Badge key={cert} variant="secondary">{cert}</Badge>)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={tech.status === 'Available' ? 'default' : 'outline'}>{tech.status}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                           )}
                           {providerTechnicians.length === 0 && (
                                <div className="text-center text-muted-foreground py-10">
                                    No technicians found for this provider.
                                </div>
                           )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

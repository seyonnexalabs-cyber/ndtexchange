
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
import { technicians, inspectorAssets, InspectorAsset, Technician } from "@/lib/placeholder-data";
import { ChevronLeft, MapPin, Star, Users, Wrench } from "lucide-react";
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


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
    const isMobile = useIsMobile();
    const role = searchParams.get('role');
    
    const provider = useMemo(() => serviceProviders.find(p => p.id === id), [id]);
    const providerTechnicians = useMemo(() => technicians.filter(t => t.providerId === id), [id]);
    const publicEquipment = useMemo(() => inspectorAssets.filter(e => e.providerId === id && e.isPublic), [id]);

    if (!provider) {
        notFound();
    }

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    return (
        <div>
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <Button asChild variant="outline" size="sm" className="mb-4 sm:mb-0">
                    <Link href={constructUrl(role === 'admin' ? "/dashboard/providers" : "/dashboard/find-providers")}>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Providers
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
                    <TabsTrigger value="technicians">Technicians</TabsTrigger>
                    <TabsTrigger value="equipment">Equipment</TabsTrigger>
                </TabsList>
                <TabsContent value="details">
                     <Card>
                        <CardHeader>
                            <CardTitle>Provider Details</CardTitle>
                            <CardDescription>Company information and offered services.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-sm mb-1">Rating</h3>
                                <StarRating rating={provider.rating} />
                            </div>
                             <div>
                                <h3 className="font-semibold text-sm mb-1">About</h3>
                                <p className="text-sm text-muted-foreground">{provider.description}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold mb-2">Techniques Offered</h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {provider.techniques.map(tech => (
                                        <Badge key={tech} variant="outline" shape="rounded">{tech}</Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="technicians">
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
                                    {providerTechnicians.map(tech => {
                                        const highestLevel = (tech.certifications.length > 0)
                                            ? (['Level I', 'Level II', 'Level III'] as const)[Math.max(...tech.certifications.map(c => ['Level I', 'Level II', 'Level III'].indexOf(c.level)))]
                                            : 'N/A';
                                        return (
                                            <Card key={tech.id} className="p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar>
                                                            <AvatarFallback>{tech.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-semibold">{tech.name}</p>
                                                            <p className="text-sm text-muted-foreground">{highestLevel}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-1 mt-3">
                                                    {tech.certifications.map(cert => <Badge key={cert.method} variant="secondary" shape="rounded">{cert.method}</Badge>)}
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
                                        <TableHead>Level</TableHead>
                                        <TableHead>Certifications</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {providerTechnicians.map(tech => {
                                        const highestLevel = (tech.certifications.length > 0)
                                            ? (['Level I', 'Level II', 'Level III'] as const)[Math.max(...tech.certifications.map(c => ['Level I', 'Level II', 'Level III'].indexOf(c.level)))]
                                            : 'N/A';
                                        return (
                                            <TableRow key={tech.id}>
                                                <TableCell className="font-medium flex items-center gap-3">
                                                    <Avatar>
                                                    <AvatarFallback>{tech.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                    </Avatar>
                                                    {tech.name}
                                                </TableCell>
                                                <TableCell>{highestLevel}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {tech.certifications.map(cert => <Badge key={cert.method} variant="secondary" shape="rounded">{cert.method}</Badge>)}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
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
                </TabsContent>
                 <TabsContent value="equipment">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wrench /> Public Equipment
                            </CardTitle>
                            <CardDescription>
                                A selection of publicly listed equipment from {provider.name}.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                           {isMobile ? (
                                <div className="space-y-4">
                                    {publicEquipment.map(equip => (
                                        <Card key={equip.id} className="p-4">
                                             <div className="space-y-1">
                                                <p className="font-semibold">{equip.name}</p>
                                                <p className="text-sm text-muted-foreground">Type: {equip.type}</p>
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
                                        <TableHead>Type</TableHead>
                                        <TableHead>Manufacturer</TableHead>
                                        <TableHead>Model</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {publicEquipment.map(equip => (
                                        <TableRow key={equip.id}>
                                            <TableCell className="font-medium">{equip.name}</TableCell>
                                            <TableCell>{equip.type}</TableCell>
                                            <TableCell>{equip.manufacturer || 'N/A'}</TableCell>
                                            <TableCell>{equip.model || 'N/A'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                           )}
                           {publicEquipment.length === 0 && (
                                <div className="text-center text-muted-foreground py-10">
                                    This provider has not listed any public equipment.
                                </div>
                           )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

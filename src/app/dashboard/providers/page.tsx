'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { serviceProviders } from "@/lib/service-providers-data";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ShieldCheck, MapPin, Star, MoreVertical } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

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


const DesktopView = ({ constructUrl }: { constructUrl: (base: string) => string }) => (
    <Card>
        <CardHeader>
            <CardTitle>Service Providers</CardTitle>
            <CardDescription>An overview of all NDT service provider companies on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Company Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Techniques</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {serviceProviders.map(provider => (
                        <TableRow key={provider.id}>
                            <TableCell className="font-medium flex items-center gap-3">
                                <Image 
                                    src={provider.logoUrl} 
                                    alt={`${provider.name} logo`} 
                                    width={40} 
                                    height={40} 
                                    className="rounded-md border p-0.5"
                                />
                                {provider.name}
                            </TableCell>
                            <TableCell>{provider.location}</TableCell>
                            <TableCell><StarRating rating={provider.rating} /></TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1 w-64">
                                    {provider.techniques.slice(0, 4).map(tech => <Badge key={tech} variant="secondary">{tech}</Badge>)}
                                    {provider.techniques.length > 4 && <Badge variant="outline">+{provider.techniques.length - 4}</Badge>}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                               <Button asChild variant="outline" size="sm">
                                    <Link href={constructUrl(`/dashboard/providers/${provider.id}`)}>View Details</Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
);

const MobileView = ({ constructUrl }: { constructUrl: (base: string) => string }) => (
    <div className="space-y-4">
        {serviceProviders.map(provider => (
            <Card key={provider.id}>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Image 
                            src={provider.logoUrl} 
                            alt={`${provider.name} logo`} 
                            width={48} 
                            height={48} 
                            className="rounded-md border p-1"
                        />
                        <div>
                            <CardTitle>{provider.name}</CardTitle>
                            <CardDescription className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {provider.location}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                     <StarRating rating={provider.rating} />
                     <div>
                        <h4 className="text-xs font-semibold mb-2">Techniques</h4>
                        <div className="flex flex-wrap gap-1.5">
                            {provider.techniques.map(tech => (
                                <Badge key={tech} variant="secondary">{tech}</Badge>
                            ))}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={constructUrl(`/dashboard/providers/${provider.id}`)}>View Details</Link>
                    </Button>
                </CardFooter>
            </Card>
        ))}
    </div>
);


export default function ProvidersPage() {
    const isMobile = useIsMobile();
    const searchParams = useSearchParams();

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                        <ShieldCheck/>
                        Provider Management
                    </h1>
                </div>
                <Button className="w-full sm:w-auto">Add New Provider</Button>
            </div>
            
            {isMobile ? <MobileView constructUrl={constructUrl}/> : <DesktopView constructUrl={constructUrl}/>}
        </div>
    );
}

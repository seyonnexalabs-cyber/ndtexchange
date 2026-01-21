'use client';
import * as React from 'react';
import { useMemo } from "react";
import { notFound, useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { auditFirms } from "@/lib/auditors-data";
import { ChevronLeft, MapPin, Star, Users } from "lucide-react";

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

export default function AuditorDetailPage() {
    const params = useParams();
    const { id } = params;
    const searchParams = useSearchParams();
    
    const auditor = useMemo(() => auditFirms.find(p => p.id === id), [id]);

    if (!auditor) {
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
                    <Link href={constructUrl("/dashboard/find-auditors")}>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Auditors
                    </Link>
                </Button>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
                 <Image 
                    src={auditor.logoUrl} 
                    alt={`${auditor.name} logo`} 
                    width={80} 
                    height={80} 
                    className="rounded-lg border p-1"
                />
                <div>
                    <h1 className="text-2xl font-headline font-bold">{auditor.name}</h1>
                    <p className="text-muted-foreground flex items-center gap-1.5 pt-1">
                        <MapPin className="w-4 h-4"/> {auditor.location}
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Auditor Profile</CardTitle>
                    <CardDescription>Company information and areas of specialty.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-sm mb-1">Rating</h3>
                        <StarRating rating={auditor.rating} />
                    </div>
                     <div>
                        <h3 className="font-semibold text-sm mb-1">About</h3>
                        <p className="text-sm text-muted-foreground">{auditor.description}</p>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold mb-2">Specialties</h4>
                        <div className="flex flex-wrap gap-1.5">
                            {auditor.specialties.map(tech => (
                                <Badge key={tech} variant="outline">{tech}</Badge>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

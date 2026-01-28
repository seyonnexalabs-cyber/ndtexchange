
'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Star, MapPin, X, Eye } from 'lucide-react';
import Link from 'next/link';
import { auditFirms, NDTSpecialties } from '@/lib/auditors-data';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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


export default function FindAuditorsPage() {
    const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
    const searchParams = useSearchParams();

    const filteredAuditors = useMemo(() => {
        if (selectedSpecialties.length === 0) {
            return auditFirms;
        }
        return auditFirms.filter(provider => 
            selectedSpecialties.every(tech => provider.specialties.includes(tech))
        );
    }, [selectedSpecialties]);

    const handleSpecialtyChange = (specialty: string) => {
        setSelectedSpecialties(prev => 
            prev.includes(specialty)
                ? prev.filter(t => t !== specialty)
                : [...prev, specialty]
        );
    };
    
    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <Eye />
                    Find Auditors
                </h1>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline">
                            Filter by Specialty ({selectedSpecialties.length})
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <h4 className="font-medium leading-none">Specialties</h4>
                                <p className="text-sm text-muted-foreground">
                                    Select the specialties you require.
                                </p>
                            </div>
                            <div className="grid gap-2 max-h-60 overflow-y-auto p-1">
                                {NDTSpecialties.map(spec => (
                                    <div key={spec} className="flex items-center space-x-2">
                                         <Checkbox 
                                            id={`spec-${spec.replace(/\s+/g, '-')}`} 
                                            checked={selectedSpecialties.includes(spec)}
                                            onCheckedChange={() => handleSpecialtyChange(spec)}
                                         />
                                        <Label htmlFor={`spec-${spec.replace(/\s+/g, '-')}`}>{spec}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
            
             {selectedSpecialties.length > 0 && (
                <div className="mb-4 flex items-center flex-wrap gap-2">
                    <span className="text-sm font-medium">Active Filters:</span>
                    {selectedSpecialties.map(spec => (
                        <Badge key={spec} variant="secondary">
                            {spec}
                            <button onClick={() => handleSpecialtyChange(spec)} className="ml-1.5 rounded-full hover:bg-muted-foreground/20 p-0.5">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                    <Button variant="ghost" size="sm" onClick={() => setSelectedSpecialties([])}>Clear All</Button>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredAuditors.map(firm => (
                    <Card key={firm.id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarFallback className="text-xl">{firm.name.split(' ').map(n => n[0]).join('').slice(0,3)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="font-headline">{firm.name}</CardTitle>
                                    <CardDescription className="flex items-center gap-1.5 mt-1">
                                        <MapPin className="w-3 h-3"/> {firm.location}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <StarRating rating={firm.rating} />
                            <p className="mt-4 text-sm text-muted-foreground h-20 overflow-hidden">{firm.description}</p>
                            <div className="mt-4">
                                <h4 className="text-sm font-semibold mb-2">Specialties</h4>
                                <div className="flex flex-wrap gap-1.5 min-h-16">
                                    {firm.specialties.map(tech => (
                                        <Badge key={tech} variant="outline" shape="rounded">{tech}</Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                         <CardFooter>
                            <Button asChild className="w-full">
                                <Link href={constructUrl(`/dashboard/auditors/${firm.id}`)}>
                                    View Profile
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
                 {filteredAuditors.length === 0 && (
                    <div className="col-span-full text-center py-10">
                        <p className="text-muted-foreground">No audit firms match the selected filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

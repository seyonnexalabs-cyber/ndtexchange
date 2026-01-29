

'use client';
import * as React from 'react';
import { useMemo } from "react";
import { notFound, useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { inspectorAssets as allEquipment, InspectorAsset } from "@/lib/placeholder-data";
import { ChevronLeft, Wrench, Calendar, Info, History, Clock, Send, Building, SlidersHorizontal, Tag } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { cn, GLOBAL_DATE_FORMAT, GLOBAL_DATETIME_FORMAT } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

const statusVariants: { [key in InspectorAsset['status']]: 'success' | 'default' | 'destructive' | 'outline' | 'secondary' } = {
    'Available': 'success',
    'In Use': 'default',
    'Calibration Due': 'destructive',
    'Out of Service': 'outline',
    'Under Service': 'secondary'
};

const historyEventIcons = {
    'Created': <Info className="h-4 w-4" />,
    'Updated': <Info className="h-4 w-4" />,
    'Checked Out': <Clock className="h-4 w-4" />,
    'Checked In': <Clock className="h-4 w-4" />,
    'Set to Available': <Info className="h-4 w-4" />,
    'Set to Calibration Due': <Info className="h-4 w-4" />,
    'Set to Out of Service': <Info className="h-4 w-4" />,
    'Checked Out for Service': <Send className="h-4 w-4" />,
}


export default function EquipmentDetailPage() {
    const params = useParams();
    const { id } = params;
    const searchParams = useSearchParams();

    // In a real app, you would fetch this data. Here we find it in the placeholder data.
    // Note: This won't reflect the state changes from the parent page without a proper state management solution.
    const equipment = useMemo(() => allEquipment.find(p => p.id === id), [id]);

    if (!equipment) {
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
                    <Link href={constructUrl("/dashboard/equipment")}>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Equipment
                    </Link>
                </Button>
                <div className="flex gap-2">
                    <Button>Edit</Button>
                    <Button variant="outline">Print QR Code</Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 font-headline">
                                <Wrench className="h-6 w-6 text-primary" />
                                {equipment.name}
                            </CardTitle>
                            <CardDescription>ID: <span className="font-mono font-semibold text-foreground">{equipment.id}</span></CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex items-start">
                                <Info className="w-4 h-4 mr-3 mt-1 text-muted-foreground"/>
                                <div>
                                    <p className="font-semibold">Status</p>
                                    <Badge variant={statusVariants[equipment.status]}>{equipment.status}</Badge>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <SlidersHorizontal className="w-4 h-4 mr-3 mt-1 text-muted-foreground"/>
                                <div>
                                    <p className="font-semibold">Technique(s)</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {equipment.techniques.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
                                    </div>
                                </div>
                            </div>
                             {equipment.manufacturer && (
                                <div className="flex items-start">
                                    <Building className="w-4 h-4 mr-3 mt-1 text-muted-foreground"/>
                                    <div>
                                        <p className="font-semibold">Manufacturer</p>
                                        <p className="text-muted-foreground">{equipment.manufacturer}</p>
                                    </div>
                                </div>
                            )}
                            {equipment.model && (
                                <div className="flex items-start">
                                    <Wrench className="w-4 h-4 mr-3 mt-1 text-muted-foreground"/>
                                    <div>
                                        <p className="font-semibold">Model</p>
                                        <p className="text-muted-foreground">{equipment.model}</p>
                                    </div>
                                </div>
                            )}
                             {equipment.serialNumber && (
                                <div className="flex items-start">
                                    <Tag className="w-4 h-4 mr-3 mt-1 text-muted-foreground"/>
                                    <div>
                                        <p className="font-semibold">Serial Number</p>
                                        <p className="text-muted-foreground">{equipment.serialNumber}</p>
                                    </div>
                                </div>
                            )}
                             <div className="flex items-start">
                                <Calendar className="w-4 h-4 mr-3 mt-1 text-muted-foreground"/>
                                <div>
                                    <p className="font-semibold">Next Calibration</p>
                                    <p className="text-muted-foreground">{equipment.nextCalibration === 'N/A' ? 'N/A' : format(new Date(equipment.nextCalibration), GLOBAL_DATE_FORMAT)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><History /> Equipment Ledger</CardTitle>
                            <CardDescription>A complete log of all check-in, check-out, and status changes for this item.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <ScrollArea className="h-96">
                                <div className="relative pl-6">
                                     {/* Vertical line */}
                                    <div className="absolute left-6 top-0 h-full w-0.5 bg-border -translate-x-1/2" />
                                    {equipment.history && equipment.history.length > 0 ? (
                                        equipment.history.map((entry, index) => (
                                            <div key={index} className="relative mb-8 pl-8">
                                                <div className="absolute -left-3 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background border-2 border-primary">
                                                    <div className="text-primary">{historyEventIcons[entry.event]}</div>
                                                </div>
                                                <p className="text-sm font-medium">{entry.event}</p>
                                                <p className="text-xs text-muted-foreground">{entry.user} - {format(parseISO(entry.timestamp), GLOBAL_DATETIME_FORMAT)}</p>
                                                {entry.notes && <p className="mt-1 text-xs italic text-muted-foreground">"{entry.notes}"</p>}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center text-muted-foreground py-10">
                                            No history found for this item.
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

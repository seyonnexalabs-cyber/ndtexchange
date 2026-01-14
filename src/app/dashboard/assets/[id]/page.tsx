'use client';
import * as React from 'react';
import { useMemo } from "react";
import { assets, inspections } from "@/lib/placeholder-data";
import { notFound, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CraneIcon, PipeIcon, TankIcon, WeldIcon } from "@/app/components/icons";
import { Paperclip, FileText, ImageIcon, Calendar, MapPin, Tag, ChevronLeft } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const assetIcons = {
    'Tank': <TankIcon className="w-8 h-8 text-muted-foreground" />,
    'Piping': <PipeIcon className="w-8 h-8 text-muted-foreground" />,
    'Crane': <CraneIcon className="w-8 h-8 text-muted-foreground" />,
    'Vessel': <TankIcon className="w-8 h-8 text-muted-foreground" />,
    'Weld Joint': <WeldIcon className="w-8 h-8 text-muted-foreground" />,
};

export default function AssetDetailPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const asset = useMemo(() => assets.find(a => a.id === id), [id]);
    const searchParams = useSearchParams();

    if (!asset) {
        notFound();
    }
    
    const image = PlaceHolderImages.find(p => p.id.startsWith('asset') && asset.id.endsWith(p.id.slice(-1)));
    const assetInspections = inspections.filter(i => i.assetId === asset.id);

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <Button asChild variant="outline" size="sm" className="mb-4">
                        <Link href={constructUrl("/dashboard/assets")}>
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back to Assets
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                        {assetIcons[asset.type]}
                        {asset.name}
                    </h1>
                    <p className="text-muted-foreground">{asset.id}</p>
                </div>
                <div>
                    <Button className="mr-2">Edit Asset</Button>
                    <Button variant="destructive">Delete Asset</Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <Tabs defaultValue="history">
                        <TabsList className="mb-4">
                            <TabsTrigger value="history">Inspection History</TabsTrigger>
                            <TabsTrigger value="documents">Documents</TabsTrigger>
                            <TabsTrigger value="details">Details</TabsTrigger>
                        </TabsList>
                        <TabsContent value="history">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Inspection History</CardTitle>
                                    <CardDescription>Previous inspections, defects, and repairs for this asset.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Technique</TableHead>
                                                <TableHead>Inspector</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Report</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {assetInspections.map(inspection => (
                                                <TableRow key={inspection.id}>
                                                    <TableCell>{inspection.date}</TableCell>
                                                    <TableCell>{inspection.technique}</TableCell>
                                                    <TableCell>{inspection.inspector}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={inspection.status === 'Completed' ? 'default' : 'secondary'}>{inspection.status}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button variant="outline" size="sm">View</Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {assetInspections.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center text-muted-foreground">No inspection history found.</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="documents">
                             <Card>
                                <CardHeader>
                                    <CardTitle>Documents</CardTitle>
                                    <CardDescription>Drawings, photos, certificates, and sketches associated with this asset.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-4">
                                   <div className="flex items-center justify-between p-3 border rounded-md">
                                       <div className="flex items-center gap-3">
                                           <FileText className="w-5 h-5 text-muted-foreground" />
                                           <span className="font-medium">P&ID-101.pdf</span>
                                       </div>
                                       <Button variant="ghost" size="sm">Download</Button>
                                   </div>
                                    <div className="flex items-center justify-between p-3 border rounded-md">
                                       <div className="flex items-center gap-3">
                                           <ImageIcon className="w-5 h-5 text-muted-foreground" />
                                           <span className="font-medium">installation_photo.jpg</span>
                                       </div>
                                       <Button variant="ghost" size="sm">Download</Button>
                                   </div>
                                    <div className="flex items-center justify-between p-3 border rounded-md">
                                       <div className="flex items-center gap-3">
                                           <Paperclip className="w-5 h-5 text-muted-foreground" />
                                           <span className="font-medium">fabrication_cert.pdf</span>
                                       </div>
                                       <Button variant="ghost" size="sm">Download</Button>
                                   </div>
                                   <Button className="mt-2 w-full" variant="outline">Upload Document</Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                         <TabsContent value="details">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Asset Details</CardTitle>
                                    <CardDescription>Full details and specifications for this asset.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">Detailed specifications will be shown here.</p>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
                <div>
                     <Card>
                        <CardHeader className="p-0">
                            {image && (
                                <div className="relative h-48 w-full">
                                    <Image src={image.imageUrl} alt={asset.name} fill className="object-cover rounded-t-lg" data-ai-hint={image.imageHint}/>
                                </div>
                            )}
                            <div className="p-6">
                                <CardTitle>Asset Summary</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm p-6 pt-0">
                            <div className="flex items-start">
                                <Tag className="w-4 h-4 mr-3 mt-1 text-muted-foreground"/>
                                <div>
                                    <p className="font-semibold">Status</p>
                                    <Badge variant={
                                        asset.status === 'Operational' ? 'default' :
                                        asset.status === 'Requires Inspection' ? 'destructive' :
                                        asset.status === 'Under Repair' ? 'secondary' : 'outline'
                                    }>{asset.status}</Badge>
                                </div>
                            </div>
                             <div className="flex items-start">
                                <MapPin className="w-4 h-4 mr-3 mt-1 text-muted-foreground"/>
                                <div>
                                    <p className="font-semibold">Location</p>
                                    <p className="text-muted-foreground">{asset.location}</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <Calendar className="w-4 h-4 mr-3 mt-1 text-muted-foreground"/>
                                <div>
                                    <p className="font-semibold">Next Inspection</p>
                                    <p className="text-muted-foreground">{asset.nextInspection}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
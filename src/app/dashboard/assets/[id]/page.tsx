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
import { Paperclip, FileText, ImageIcon, Calendar, MapPin, Tag, ChevronLeft, Maximize } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from '@/hooks/use-mobile';
import { format } from 'date-fns';
import { GLOBAL_DATE_FORMAT } from '@/lib/utils';
import UniformDocumentViewer, { ViewerDocument } from '@/app/dashboard/components/uniform-document-viewer';
import { ScrollArea } from '@/components/ui/scroll-area';


const assetIcons = {
    'Tank': <TankIcon className="w-8 h-8 text-muted-foreground" />,
    'Piping': <PipeIcon className="w-8 h-8 text-muted-foreground" />,
    'Crane': <CraneIcon className="w-8 h-8 text-muted-foreground" />,
    'Vessel': <TankIcon className="w-8 h-8 text-muted-foreground" />,
    'Weld Joint': <WeldIcon className="w-8 h-8 text-muted-foreground" />,
};

export default function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    const asset = useMemo(() => assets.find(a => a.id === id), [id]);
    const searchParams = useSearchParams();
    const isMobile = useIsMobile();
    const [isViewerOpen, setIsViewerOpen] = React.useState(false);

    const assetDocs: ViewerDocument[] = [
        { name: 'P&ID-101.pdf', source: 'Asset Documentation'},
        { name: 'installation_photo.jpg', source: 'Asset Documentation' },
        { name: 'fabrication_cert.pdf', source: 'Asset Documentation' },
    ];

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
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between mb-6 gap-4">
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
                <div className='flex gap-2 self-start sm:self-center'>
                    <Button>Edit Asset</Button>
                    <Button variant="destructive">Delete Asset</Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <Tabs defaultValue="history">
                        <TabsList className="mb-4 w-full sm:w-auto grid grid-cols-3">
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
                                    {isMobile ? (
                                        <div className="space-y-4">
                                            {assetInspections.map(inspection => (
                                                <Card key={inspection.id} className="p-4">
                                                    <div className="flex justify-between items-start">
                                                        <div className="font-medium">{inspection.technique}</div>
                                                        <Badge variant={inspection.status === 'Completed' ? 'success' : 'secondary'}>{inspection.status}</Badge>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground mt-2">Date: {format(new Date(inspection.date), GLOBAL_DATE_FORMAT)}</div>
                                                    <div className="text-sm text-muted-foreground">Inspector: {inspection.inspector}</div>
                                                    <div className="mt-2 flex justify-end">
                                                        <Button variant="outline" size="sm">View Report</Button>
                                                    </div>
                                                </Card>
                                            ))}
                                            {assetInspections.length === 0 && (
                                                <div className="text-center text-muted-foreground py-4">No inspection history found.</div>
                                            )}
                                        </div>
                                    ) : (
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
                                                        <TableCell>{format(new Date(inspection.date), GLOBAL_DATE_FORMAT)}</TableCell>
                                                        <TableCell>{inspection.technique}</TableCell>
                                                        <TableCell>{inspection.inspector}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={inspection.status === 'Completed' ? 'success' : 'secondary'}>{inspection.status}</Badge>
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
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="documents">
                             <Card>
                                <CardHeader>
                                    <CardTitle>Documents</CardTitle>
                                    <CardDescription>Drawings, photos, certificates, and sketches associated with this asset.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-semibold">Available Documents ({assetDocs.length})</h3>
                                            <Button onClick={() => setIsViewerOpen(true)} disabled={assetDocs.length === 0}>
                                                <Maximize className="mr-2 h-4 w-4" />
                                                View All Documents
                                            </Button>
                                        </div>
                                        <ScrollArea className="space-y-2 rounded-md border p-2 max-h-48">
                                            {assetDocs.map((doc) => (
                                                <div key={doc.name} className="flex items-center gap-2 p-2">
                                                    <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                                                    <span className="text-sm font-medium truncate" title={doc.name}>{doc.name}</span>
                                                </div>
                                            ))}
                                             {assetDocs.length === 0 && (
                                                <div className="text-center text-muted-foreground py-4">No documents found.</div>
                                            )}
                                        </ScrollArea>
                                    </div>
                                    <Button className="mt-4 w-full" variant="outline">Upload Document</Button>
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
                                        asset.status === 'Operational' ? 'success' :
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
                                    <p className="text-muted-foreground">{format(new Date(asset.nextInspection), GLOBAL_DATE_FORMAT)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <UniformDocumentViewer 
                isOpen={isViewerOpen}
                onOpenChange={setIsViewerOpen}
                documents={assetDocs}
                title={`Documents for ${asset.name}`}
                description="Securely view all documents associated with this asset."
            />
        </div>
    );
}

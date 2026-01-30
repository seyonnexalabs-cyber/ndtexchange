
'use client';
import * as React from 'react';
import { useMemo, useState, useRef } from "react";
import { assets, jobs, clientAssets, Asset } from "@/lib/placeholder-data";
import { notFound, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CraneIcon, PipeIcon, TankIcon, WeldIcon } from "@/app/components/icons";
import { Paperclip, FileText, ImageIcon, Calendar, MapPin, Tag, ChevronLeft, Maximize, UploadCloud } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages, ImagePlaceholder } from "@/lib/placeholder-images";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from '@/hooks/use-mobile';
import { format } from 'date-fns';
import { cn, GLOBAL_DATE_FORMAT, ACCEPTED_FILE_TYPES } from '@/lib/utils';
import UniformDocumentViewer, { ViewerDocument } from '@/app/dashboard/components/uniform-document-viewer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { CustomDateInput } from '@/components/ui/custom-date-input';


const assetSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters.'),
    type: z.enum(['Tank', 'Piping', 'Vessel', 'Crane', 'Weld Joint']),
    location: z.string().min(2, 'Location is required.'),
    status: z.enum(['Operational', 'Requires Inspection', 'Under Repair', 'Decommissioned']),
    nextInspection: z.date({ required_error: "Please select a valid date." }),
    manufacturer: z.string().optional(),
    model: z.string().optional(),
    serialNumber: z.string().optional(),
    installationDate: z.date().optional(),
    notes: z.string().optional(),
    thumbnail: z.any().optional(),
});

const AssetForm = ({ asset, onSubmit, onCancel }: { asset: Asset, onSubmit: (values: z.infer<typeof assetSchema>) => void, onCancel: () => void }) => {
    const form = useForm<z.infer<typeof assetSchema>>({
        resolver: zodResolver(assetSchema),
        defaultValues: {
            ...asset,
            nextInspection: new Date(asset.nextInspection),
            installationDate: asset.installationDate ? new Date(asset.installationDate) : undefined,
        }
    });

    const image = React.useMemo(() => asset?.imageId ? PlaceHolderImages.find(p => p.id === asset.imageId) : undefined, [asset]);

    const [thumbnailPreview, setThumbnailPreview] = React.useState<string | null>(image?.imageUrl || null);
    const [isDragging, setIsDragging] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        // Cleanup function to revoke the object URL
        return () => {
            if (thumbnailPreview && thumbnailPreview.startsWith('blob:')) {
                URL.revokeObjectURL(thumbnailPreview);
            }
        };
    }, [thumbnailPreview]);
    
    const handleFileChange = (file: File | null) => {
        form.setValue('thumbnail', file);
        if (thumbnailPreview && thumbnailPreview.startsWith('blob:')) {
            URL.revokeObjectURL(thumbnailPreview);
        }
        if (file) {
            if (file.type.startsWith('image/')) {
                setThumbnailPreview(URL.createObjectURL(file));
                form.clearErrors('thumbnail');
            } else {
                setThumbnailPreview(null);
                form.setError('thumbnail', { type: 'manual', message: 'Only image files are accepted.' });
            }
        } else {
             // When cleared, revert to the original asset image if it exists
            setThumbnailPreview(image?.imageUrl || null);
        }
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileChange(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };


    return (
        <Card>
            <CardHeader>
                <CardTitle>Editing: {asset.name}</CardTitle>
                <CardDescription>Make changes to the asset details below.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                         <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Asset Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Asset Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="Tank">Tank</SelectItem>
                                                <SelectItem value="Piping">Piping</SelectItem>
                                                <SelectItem value="Vessel">Vessel</SelectItem>
                                                <SelectItem value="Crane">Crane</SelectItem>
                                                <SelectItem value="Weld Joint">Weld Joint</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="Operational">Operational</SelectItem>
                                                <SelectItem value="Requires Inspection">Requires Inspection</SelectItem>
                                                <SelectItem value="Under Repair">Under Repair</SelectItem>
                                                <SelectItem value="Decommissioned">Decommissioned</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Location</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="installationDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Installation Date</FormLabel>
                                        <FormControl>
                                            <CustomDateInput {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <FormField
                                control={form.control}
                                name="manufacturer"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Manufacturer</FormLabel>
                                        <FormControl>
                                            <Input {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="model"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Model</FormLabel>
                                        <FormControl>
                                            <Input {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                         <FormField
                            control={form.control}
                            name="serialNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Serial Number</FormLabel>
                                    <FormControl>
                                        <Input {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                          <FormField
                            control={form.control}
                            name="thumbnail"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Thumbnail Image</FormLabel>
                                     <div
                                        onDragEnter={handleDragEnter}
                                        onDragLeave={handleDragLeave}
                                        onDragOver={handleDragOver}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                        className={cn(
                                            "relative w-full h-48 rounded-md border-2 border-dashed flex items-center justify-center text-center text-muted-foreground cursor-pointer transition-colors",
                                            isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-muted/50"
                                        )}
                                    >
                                        {thumbnailPreview ? (
                                            <>
                                                <Image
                                                    src={thumbnailPreview}
                                                    alt="Thumbnail preview"
                                                    fill
                                                    className="object-contain rounded-md p-2"
                                                />
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-md">
                                                    <p className="text-white font-semibold">Click or drag to replace</p>
                                                </div>
                                            </>
                                        ) : (
                                            <p>Click or drag & drop to upload thumbnail</p>
                                        )}
                                        <FormControl>
                                            <Input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                                            />
                                        </FormControl>
                                    </div>
                                    <FormDescription>
                                        This image will be used as the display card for the asset.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="nextInspection"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Next Inspection Date</FormLabel>
                                    <FormControl>
                                        <CustomDateInput {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                            <Button type="submit">Save Changes</Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};


const assetIcons = {
    'Tank': <TankIcon className="w-8 h-8 text-muted-foreground" />,
    'Piping': <PipeIcon className="w-8 h-8 text-muted-foreground" />,
    'Crane': <CraneIcon className="w-8 h-8 text-muted-foreground" />,
    'Vessel': <TankIcon className="w-8 h-8 text-muted-foreground" />,
    'Weld Joint': <WeldIcon className="w-8 h-8 text-muted-foreground" />,
};

const DetailItem = ({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) => (
    <div className={cn("flex flex-col gap-1", className)}>
        <p className="font-semibold text-muted-foreground">{label}</p>
        <div className="font-medium text-foreground">{value}</div>
    </div>
);

export default function AssetDetailPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const [isEditing, setIsEditing] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    
    const [asset, setAsset] = React.useState(() => assets.find(a => a.id === id));

    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'client';
    const isMobile = useIsMobile();
    const [isViewerOpen, setIsViewerOpen] = React.useState(false);
    const [initialDoc, setInitialDoc] = React.useState<string | null>(null);

    const image = React.useMemo(() => asset?.imageId ? PlaceHolderImages.find(p => p.id === asset.imageId) : undefined, [asset]);

    const allDocuments: ViewerDocument[] = React.useMemo(() => {
        const docs: ViewerDocument[] = [
            { name: 'P&ID-101.pdf', source: 'Asset Documentation', url: '' },
            { name: 'installation_photo.jpg', source: 'Asset Documentation', url: 'https://picsum.photos/seed/install/800/600' },
            { name: 'fabrication_cert.pdf', source: 'Asset Documentation', url: '' },
        ];
        if (image) {
            docs.unshift({ name: image.description, source: 'Asset Thumbnail', url: image.imageUrl });
        }
        return docs;
    }, [image]);

    if (!asset) {
        notFound();
    }
    
    const assetInspections = jobs.filter(j => j.assetIds?.includes(asset.id)).flatMap(j => j.inspections || []);

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const handleOpenViewer = (docName: string) => {
        setInitialDoc(docName);
        setIsViewerOpen(true);
    };

    const handleCloseViewer = (open: boolean) => {
        setIsViewerOpen(open);
        if (!open) {
            setInitialDoc(null);
        }
    };
    
    const handleFormSubmit = (values: z.infer<typeof assetSchema>) => {
        if (values.thumbnail) {
            console.log("Uploaded thumbnail: ", values.thumbnail);
        }
        const updatedAsset = { 
            ...asset, 
            ...values, 
            nextInspection: format(values.nextInspection, 'yyyy-MM-dd'),
            installationDate: values.installationDate ? format(values.installationDate, 'yyyy-MM-dd') : undefined
        };
        // In a real app, you would handle the imageId update here
        setAsset(updatedAsset as Asset);
        toast({
            title: "Asset Updated",
            description: `${values.name} has been updated successfully.`,
        });
        setIsEditing(false);
    };

    const isClient = role === 'client';

    if (isEditing) {
        return <AssetForm asset={asset} onSubmit={handleFormSubmit} onCancel={() => setIsEditing(false)} />;
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
                    <p className="font-extrabold text-sm text-muted-foreground">{asset.id}</p>
                </div>
                {isClient && (
                    <div className='flex gap-2 self-start sm:self-center'>
                        <Button onClick={() => setIsEditing(true)}>Edit Asset</Button>
                        <Button variant="outline">Archive Asset</Button>
                    </div>
                )}
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
                                            <h3 className="font-semibold">Available Documents ({allDocuments.length})</h3>
                                            <Button onClick={() => handleOpenViewer(allDocuments[0]?.name)} disabled={allDocuments.length === 0}>
                                                <Maximize className="mr-2 h-4 w-4" />
                                                View All Documents
                                            </Button>
                                        </div>
                                        <ScrollArea className="space-y-2 rounded-md border p-2 max-h-48">
                                            {allDocuments.map((doc) => {
                                                 const isImage = doc.name.match(/\.(jpg|jpeg|png)$/i);
                                                 return (
                                                    <button key={doc.name} onClick={() => handleOpenViewer(doc.name)} className="w-full flex items-center gap-2 p-2 text-left hover:bg-muted rounded-md">
                                                        {isImage ? <ImageIcon className="w-4 h-4 text-muted-foreground shrink-0" /> : <FileText className="w-4 h-4 text-muted-foreground shrink-0" />}
                                                        <span className="text-sm font-medium truncate" title={doc.name}>{doc.name}</span>
                                                    </button>
                                                )
                                            })}
                                             {allDocuments.length === 0 && (
                                                <div className="text-center text-muted-foreground py-4">No documents found.</div>
                                            )}
                                        </ScrollArea>
                                    </div>
                                    {isClient && (
                                        <Button className="mt-4 w-full" variant="outline">Upload Document</Button>
                                    )}
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                                        <DetailItem label="Asset ID" value={<span className='font-extrabold'>{asset.id}</span>} />
                                        <DetailItem label="Asset Type" value={asset.type} />
                                        <DetailItem label="Location" value={asset.location} />
                                        <DetailItem label="Status" value={<Badge variant={
                                            asset.status === 'Operational' ? 'success' :
                                            asset.status === 'Requires Inspection' ? 'destructive' :
                                            asset.status === 'Under Repair' ? 'secondary' : 'outline'
                                        }>{asset.status}</Badge>} />
                                        {asset.manufacturer && <DetailItem label="Manufacturer" value={asset.manufacturer} />}
                                        {asset.model && <DetailItem label="Model" value={asset.model} />}
                                        {asset.serialNumber && <DetailItem label="Serial Number" value={<span className="font-extrabold">{asset.serialNumber}</span>} />}
                                        {asset.installationDate && <DetailItem label="Installation Date" value={format(new Date(asset.installationDate), GLOBAL_DATE_FORMAT)} />}
                                        {asset.notes && <DetailItem label="Notes" value={asset.notes} className="md:col-span-2" />}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
                <div>
                     <Card>
                        <CardHeader className="p-0">
                            {image && (
                                <button onClick={() => handleOpenViewer(image.description)} className="relative h-48 w-full block group">
                                    <Image src={image.imageUrl} alt={image.description} fill className="object-cover rounded-t-lg" data-ai-hint={image.imageHint}/>
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Maximize className="w-8 h-8 text-white" />
                                    </div>
                                </button>
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
                onOpenChange={handleCloseViewer}
                documents={allDocuments}
                initialSelectedDocumentName={initialDoc}
                title={`Documents for ${asset.name}`}
                description="Securely view all documents associated with this asset."
            />
        </div>
    );
}

    

    
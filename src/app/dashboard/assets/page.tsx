

'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { clientAssets as initialClientAssets, Asset } from "@/lib/placeholder-data";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Building, QrCode, Printer, UploadCloud, X, FileText } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { TankIcon, PipeIcon, CraneIcon, WeldIcon } from "@/app/components/icons";
import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useState, cloneElement, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useSearch } from "@/app/components/layout/search-provider";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { cn, ACCEPTED_FILE_TYPES } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useQRScanner } from "@/app/components/layout/qr-scanner-provider";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

const assetSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters.'),
    type: z.enum(['Tank', 'Piping', 'Vessel', 'Crane', 'Weld Joint']),
    location: z.string({ required_error: 'Please select a location or add a new one.'}),
    newLocation: z.string().optional(),
    status: z.enum(['Operational', 'Requires Inspection', 'Under Repair', 'Decommissioned']),
    nextInspection: z.string().min(1, 'Next inspection date is required.'),
    notes: z.string().optional(),
    thumbnail: z.any().optional(),
    documents: z.any().optional(),
}).refine(data => {
    if (data.location === '__add_new__') {
        return data.newLocation && data.newLocation.length > 2;
    }
    return true;
}, {
    message: 'New location name must be at least 3 characters.',
    path: ['newLocation'],
});

const AssetForm = ({ onCancel, onSubmit, assets }: { onCancel: () => void, onSubmit: (values: z.infer<typeof assetSchema>) => void, assets: Asset[] }) => {
    const form = useForm<z.infer<typeof assetSchema>>({
        resolver: zodResolver(assetSchema),
        defaultValues: {
            name: '',
            type: 'Tank',
            status: 'Operational',
            nextInspection: format(new Date(), 'dd-MMMM-yyyy'),
            notes: '',
        }
    });

    const [showNewLocation, setShowNewLocation] = useState(false);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const documentsInputRef = useRef<HTMLInputElement>(null);
    const [documentFiles, setDocumentFiles] = useState<File[]>([]);

    const uniqueLocations = useMemo(() => {
        const allLocations = assets.map(asset => asset.location);
        return [...new Set(allLocations)];
    }, [assets]);
    
    useEffect(() => {
        // Cleanup function to revoke the object URL
        return () => {
            if (thumbnailPreview) {
                URL.revokeObjectURL(thumbnailPreview);
            }
        };
    }, [thumbnailPreview]);
    
    const handleFileChange = (file: File | null) => {
        form.setValue('thumbnail', file);
        if (thumbnailPreview) {
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
            setThumbnailPreview(null);
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
            const file = e.dataTransfer.files[0];
            handleFileChange(file);
            e.dataTransfer.clearData();
        }
    };

    const handleDocumentSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const newFilesArray = Array.from(files);
            const updatedFiles = [...documentFiles, ...newFilesArray];
            setDocumentFiles(updatedFiles);
            form.setValue('documents', updatedFiles);
            
            // Reset the input value to allow selecting the same file again
            if(documentsInputRef.current) {
                documentsInputRef.current.value = '';
            }
        }
    };

    const handleRemoveDocument = (indexToRemove: number) => {
        const updatedFiles = documentFiles.filter((_, index) => index !== indexToRemove);
        setDocumentFiles(updatedFiles);
        form.setValue('documents', updatedFiles);
    };


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Asset Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Storage Tank T-102" {...field} />
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
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger>
                                    </FormControl>
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
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Select a status" /></SelectTrigger>
                                    </FormControl>
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
                 <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Location</FormLabel>
                            <Select onValueChange={(value) => {
                                field.onChange(value);
                                setShowNewLocation(value === '__add_new__');
                            }} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Select an existing location" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {uniqueLocations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                                    <SelectItem value="__add_new__">+ Add a new location</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 {showNewLocation && (
                    <FormField
                        control={form.control}
                        name="newLocation"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>New Location Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Warehouse B, Section 3" {...field} autoFocus />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                 <FormField
                    control={form.control}
                    name="nextInspection"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Next Inspection Date</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. 29-January-2026" {...field} />
                            </FormControl>
                            <FormDescription>
                                Please use dd-MMMM-yyyy format.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes / Comments (Optional)</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Add any additional details or comments about the asset..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="thumbnail"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Thumbnail Image (Optional)</FormLabel>
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
                                    <div className="flex flex-col items-center gap-2 pointer-events-none">
                                        <UploadCloud className="w-8 h-8" />
                                        <p>
                                            <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs">PNG, JPG, GIF up to 10MB</p>
                                    </div>
                                )}
                                <FormControl>
                                    <Input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0] || null;
                                            handleFileChange(file);
                                        }}
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
                    name="documents"
                    render={() => (
                        <FormItem>
                            <FormLabel>Attach Additional Documents (Optional)</FormLabel>
                             <Button type="button" variant="outline" className="w-full" onClick={() => documentsInputRef.current?.click()}>
                                Select Files to Attach
                            </Button>
                            <FormControl>
                                <Input
                                    ref={documentsInputRef}
                                    type="file"
                                    multiple
                                    accept={ACCEPTED_FILE_TYPES}
                                    className="hidden"
                                    onChange={handleDocumentSelection}
                                />
                            </FormControl>
                            {documentFiles.length > 0 && (
                                <div className="mt-4 space-y-2">
                                     <p className="text-sm font-medium">{documentFiles.length} file(s) attached:</p>
                                     <ScrollArea className="max-h-32 rounded-md border p-2">
                                        {documentFiles.map((file, index) => (
                                            <div key={`${file.name}-${index}`} className="flex items-center justify-between text-sm p-1 hover:bg-muted rounded">
                                                <div className="flex items-center gap-2 truncate">
                                                    <FileText className="h-4 w-4 shrink-0" />
                                                    <span className="truncate">{file.name}</span>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 shrink-0"
                                                    onClick={() => handleRemoveDocument(index)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </ScrollArea>
                                </div>
                            )}
                            <FormDescription>
                                Attach multiple files (PDFs, images). New selections will be added to the list.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <DialogFooter className="pt-4 sticky bottom-0 bg-background z-10 -mx-6 px-6 pb-6 -mb-6">
                    <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                    <Button type="submit">Create Asset</Button>
                </DialogFooter>
            </form>
        </Form>
    );
};


const assetIcons = {
    'Tank': <TankIcon className="w-6 h-6 text-muted-foreground" />,
    'Piping': <PipeIcon className="w-6 h-6 text-muted-foreground" />,
    'Crane': <CraneIcon className="w-6 h-6 text-muted-foreground" />,
    'Vessel': <TankIcon className="w-6 h-6 text-muted-foreground" />,
    'Weld Joint': <WeldIcon className="w-6 h-6 text-muted-foreground" />,
};

const ClientAssetsView = ({ assets }: { assets: Asset[] }) => {
    const searchParams = useSearchParams();
    const [qrCodeData, setQrCodeData] = useState<{ id: string, name: string } | null>(null);
    const { searchQuery } = useSearch();

    const filteredAssets = useMemo(() => {
        if (!searchQuery) return assets;
        return assets.filter(asset => 
            asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            asset.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            asset.location.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, assets]);

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const assetsByLocation = useMemo(() => {
        return filteredAssets.reduce((acc, asset) => {
            if (!acc[asset.location]) {
                acc[asset.location] = [];
            }
            acc[asset.location].push(asset);
            return acc;
        }, {} as Record<string, typeof initialClientAssets>);
    }, [filteredAssets]);

    return (
        <div className="space-y-8">
            {Object.keys(assetsByLocation).length === 0 && (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">No assets found for your search.</p>
                </div>
            )}
            {Object.entries(assetsByLocation).map(([location, locationAssets]) => (
                <div key={location}>
                    <h2 className="text-xl font-semibold mb-4">{location}</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {locationAssets.map((asset) => {
                            const image = asset.imageId ? PlaceHolderImages.find(p => p.id === asset.imageId) : undefined;
                            return (
                                <Card key={asset.id} className="flex flex-col">
                                    <CardHeader className="p-0">
                                        <div className="relative h-48 w-full flex items-center justify-center bg-muted/20 rounded-t-lg">
                                            {image ? (
                                                <Image src={image.imageUrl} alt={image.description} fill className="object-cover rounded-t-lg" data-ai-hint={image.imageHint}/>
                                            ) : (
                                                cloneElement(assetIcons[asset.type], { className: 'w-16 h-16 text-muted-foreground/50' })
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 flex-grow">
                                        <div className="flex items-start justify-between">
                                            {assetIcons[asset.type]}
                                            <Badge variant={
                                                asset.status === 'Operational' ? 'success' :
                                                asset.status === 'Requires Inspection' ? 'destructive' :
                                                asset.status === 'Under Repair' ? 'secondary' : 'outline'
                                            }>{asset.status}</Badge>
                                        </div>
                                        <CardTitle className="mt-2 font-semibold text-lg">{asset.name}</CardTitle>
                                        <CardDescription className="font-bold">{asset.id}</CardDescription>
                                    </CardContent>
                                    <CardFooter className="p-4 pt-0 flex justify-between items-center text-sm text-muted-foreground">
                                        <span>Next: {format(new Date(asset.nextInspection), 'dd-MMM-yyyy')}</span>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild><Link href={constructUrl(`/dashboard/assets/${asset.id}`)}>View Details</Link></DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setQrCodeData({ id: asset.id, name: asset.name })}>Show QR Code</DropdownMenuItem>
                                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                                <DropdownMenuItem>Archive</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            ))}
             <Dialog open={!!qrCodeData} onOpenChange={(open) => {if (!open) {setQrCodeData(null)}}}>
                <DialogContent className="sm:max-w-md">
                    <div className="printable-area">
                        <DialogHeader>
                            <DialogTitle>Asset QR Code</DialogTitle>
                            <DialogDescription>
                               Print this QR code and attach it to your asset for easy scanning.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col items-center justify-center p-6 gap-4">
                            {qrCodeData && (
                                <>
                                    <Image 
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrCodeData.id)}`}
                                        alt={`QR Code for ${qrCodeData.name}`}
                                        width={250}
                                        height={250}
                                    />
                                    <div className="text-center">
                                        <p className="font-bold text-lg">{qrCodeData.name}</p>
                                        <p className="font-bold text-muted-foreground">{qrCodeData.id}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    <DialogFooter className="non-printable">
                        <Button type="button" variant="secondary" onClick={() => setQrCodeData(null)}>
                            Close
                        </Button>
                        <Button type="button" onClick={() => window.print()}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}


export default function AssetsPage() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'client';

    // This would come from a user session/context in a real app
    // For this demo, we'll map the client role to a specific company ID
    const currentUserCompanyId = 'client-01'; // 'Global Energy Corp.'

    const [currentAssets, setCurrentAssets] = useState<Asset[]>(() =>
        initialClientAssets.filter(asset => asset.companyId === currentUserCompanyId)
    );
    
    const [isAddAssetOpen, setAddAssetOpen] = useState(false);
    const { setScanOpen } = useQRScanner();
    const { toast } = useToast();
    const router = useRouter();
    
    const handleFormSubmit = (values: z.infer<typeof assetSchema>) => {
        const finalLocation = values.location === '__add_new__' ? values.newLocation! : values.location;

        const newAsset: Asset = {
            id: `ASSET-${String(initialClientAssets.length + 1).padStart(3, '0')}`,
            companyId: currentUserCompanyId,
            name: values.name,
            type: values.type,
            location: finalLocation,
            status: values.status,
            nextInspection: format(new Date(values.nextInspection), 'yyyy-MM-dd'),
            notes: values.notes,
        };
        
        setCurrentAssets(prevAssets => {
            const newAssets = [newAsset, ...prevAssets];
            // Sort by location then name to keep things organized
            newAssets.sort((a, b) => {
                if (a.location < b.location) return -1;
                if (a.location > b.location) return 1;
                return a.name.localeCompare(b.name);
            });
            return newAssets;
        });

        toast({
            title: "Asset Created",
            description: `${values.name} has been added to your asset list.`,
        });
        
        if (values.thumbnail) {
            console.log("Uploaded thumbnail: ", values.thumbnail);
            toast({
                title: "Thumbnail Attached",
                description: `A thumbnail was attached to the new asset. (This is a simulation)`,
            });
        }

        if (values.documents && values.documents.length > 0) {
            console.log("Uploaded documents: ", values.documents);
            toast({
                title: "Documents Attached",
                description: `${values.documents.length} document(s) were attached to the new asset. (This is a simulation)`,
            });
        }

        setAddAssetOpen(false);
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <Building/>
                    Asset Management
                </h1>
                <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
                    <Button onClick={() => setScanOpen(true)} className="w-full sm:w-auto">
                        <QrCode className="mr-2 h-4 w-4"/>
                        Scan Asset
                    </Button>
                    {role === 'client' && (
                        <Button variant="outline" onClick={() => setAddAssetOpen(true)} className="w-full sm:w-auto">
                            Add New Asset
                        </Button>
                    )}
                </div>
            </div>
            
            {role === 'client' ? <ClientAssetsView assets={currentAssets} /> : (
                 <div className="text-center p-10 border rounded-lg mt-8">
                    <QrCode className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h2 className="mt-4 text-xl font-headline">Ready to Scan</h2>
                    <p className="mt-2 text-muted-foreground">Click "Scan Asset" to find an asset and view its details.</p>
                </div>
            )}


             <Dialog open={isAddAssetOpen} onOpenChange={setAddAssetOpen}>
                <DialogContent className="sm:max-w-4xl h-[90dvh] flex flex-col p-0">
                    <DialogHeader className="p-6 pb-4">
                        <DialogTitle>Add New Asset</DialogTitle>
                        <DialogDescription>
                            Enter the details for the new asset to add it to your inventory.
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="flex-grow px-6">
                        <AssetForm
                            assets={currentAssets}
                            onSubmit={handleFormSubmit}
                            onCancel={() => setAddAssetOpen(false)}
                        />
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    );
}








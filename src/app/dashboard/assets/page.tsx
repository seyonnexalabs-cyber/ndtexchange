'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { clientAssets, jobs } from "@/lib/placeholder-data";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Building, QrCode, Calendar as CalendarIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { TankIcon, PipeIcon, CraneIcon, WeldIcon } from "@/app/components/icons";
import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useSearch } from "@/app/components/layout/search-provider";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useQRScanner } from "@/app/components/layout/qr-scanner-provider";

const assetSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters.'),
    type: z.enum(['Tank', 'Piping', 'Vessel', 'Crane', 'Weld Joint']),
    location: z.string().min(2, 'Location is required.'),
    status: z.enum(['Operational', 'Requires Inspection', 'Under Repair', 'Decommissioned']),
    nextInspection: z.date(),
});

const AssetForm = ({ onCancel, onSubmit }: { onCancel: () => void, onSubmit: (values: z.infer<typeof assetSchema>) => void }) => {
    const form = useForm<z.infer<typeof assetSchema>>({
        resolver: zodResolver(assetSchema),
        defaultValues: {
            name: '',
            type: 'Tank',
            location: '',
            status: 'Operational',
            nextInspection: new Date(),
        }
    });

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
                            <FormControl>
                                <Input placeholder="e.g., Refinery A, Section 2" {...field} />
                            </FormControl>
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
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? (
                                    format(field.value, "PPP")
                                ) : (
                                    <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                    date < new Date("1900-01-01")
                                }
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <DialogFooter>
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

const ClientAssetsView = () => {
    const searchParams = useSearchParams();
    const [qrCodeData, setQrCodeData] = useState<{ id: string, name: string } | null>(null);
    const { searchQuery } = useSearch();

    const filteredAssets = useMemo(() => {
        if (!searchQuery) return clientAssets;
        return clientAssets.filter(asset => 
            asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            asset.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            asset.location.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

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
        }, {} as Record<string, typeof clientAssets>);
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
                            const imageIndex = clientAssets.findIndex(a => a.id === asset.id);
                            const image = PlaceHolderImages.find(p => p.id === `asset${imageIndex + 1}`);
                            return (
                                <Card key={asset.id} className="flex flex-col">
                                    <CardHeader className="p-0">
                                        <div className="relative h-48 w-full">
                                            {image && (
                                                <Image src={image.imageUrl} alt={asset.name} fill className="object-cover rounded-t-lg" data-ai-hint={image.imageHint}/>
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
                                        <CardDescription>{asset.id}</CardDescription>
                                    </CardContent>
                                    <CardFooter className="p-4 pt-0 flex justify-between items-center text-sm text-muted-foreground">
                                        <span>Next: {asset.nextInspection}</span>
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
                                                <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">Delete</DropdownMenuItem>
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
                    <DialogHeader>
                        <DialogTitle>QR Code for {qrCodeData?.name}</DialogTitle>
                        <DialogDescription>
                           Scan this code to quickly access asset details.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center justify-center p-4">
                        {qrCodeData && (
                            <Image 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeData.id)}`}
                                alt={`QR Code for ${qrCodeData.name}`}
                                width={200}
                                height={200}
                            />
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={() => setQrCodeData(null)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}


export default function AssetsPage() {
    const [isAddAssetOpen, setAddAssetOpen] = useState(false);
    const { setScanOpen } = useQRScanner();
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'client';

    const handleFormSubmit = (values: z.infer<typeof assetSchema>) => {
        console.log("New Asset Data:", values);
        toast({
            title: "Asset Created",
            description: `${values.name} has been added to your asset list.`,
        });
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
            
            {role === 'client' ? <ClientAssetsView /> : (
                 <div className="text-center p-10 border rounded-lg mt-8">
                    <QrCode className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h2 className="mt-4 text-xl font-headline">Ready to Scan</h2>
                    <p className="mt-2 text-muted-foreground">Click "Scan Asset" to find an asset and view its details.</p>
                </div>
            )}


             <Dialog open={isAddAssetOpen} onOpenChange={setAddAssetOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Asset</DialogTitle>
                        <DialogDescription>
                            Enter the details for the new asset to add it to your inventory.
                        </DialogDescription>
                    </DialogHeader>
                    <AssetForm
                        onSubmit={handleFormSubmit}
                        onCancel={() => setAddAssetOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}

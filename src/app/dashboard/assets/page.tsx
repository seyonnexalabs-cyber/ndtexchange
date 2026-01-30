
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { clientAssets as initialClientAssets, Asset } from "@/lib/placeholder-data";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Building, QrCode, Printer } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { TankIcon, PipeIcon, CraneIcon, WeldIcon } from "@/app/components/icons";
import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useState, cloneElement, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useSearch } from "@/app/components/layout/search-provider";
import { format } from 'date-fns';
import { useQRScanner } from "@/app/components/layout/qr-scanner-provider";

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
    const currentUserCompanyId = 'client-01'; 
    const { setScanOpen } = useQRScanner();
    const router = useRouter();

    const [currentAssets, setCurrentAssets] = useState<Asset[]>(() =>
        initialClientAssets.filter(asset => asset.companyId === currentUserCompanyId)
    );
    
    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

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
                        <Button asChild variant="outline" className="w-full sm:w-auto">
                           <Link href={constructUrl("/dashboard/assets/add")}>Add New Asset</Link>
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
        </div>
    );
}

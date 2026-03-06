

'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Building, QrCode, Printer, AlertTriangle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from 'next/link';
import Image from "next/image";
import { TankIcon, PipeIcon, CraneIcon, WeldIcon } from "@/app/components/icons";
import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useState, cloneElement, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useSearch } from "@/app/components/layout/search-provider";
import { format } from 'date-fns';
import { useQRScanner } from "@/app/components/layout/qr-scanner-provider";
import { useToast } from "@/hooks/use-toast";
import { cn, safeParseDate } from "@/lib/utils";
import { useFirebase, useCollection, useDoc, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Asset, PlatformUser } from '@/lib/types';


const assetIcons = {
    'Tank': <TankIcon className="w-6 h-6 text-primary" />,
    'Piping': <PipeIcon className="w-6 h-6 text-primary" />,
    'Crane': <CraneIcon className="w-6 h-6 text-primary" />,
    'Vessel': <TankIcon className="w-6 h-6 text-primary" />,
    'Weld Joint': <WeldIcon className="w-6 h-6 text-primary" />,
};

const ClientFormattedDate = ({ date, formatString }: { date: Date | null, formatString: string }) => {
    const [formatted, setFormatted] = useState<string | null>(null);
    useEffect(() => {
        if (date) {
            setFormatted(format(date, formatString));
        }
    }, [date, formatString]);

    if (!formatted) return null;
    return <>{formatted}</>;
};

const ClientAssetsView = ({ assets, isLoading, onApprove, onReject, isSubscriptionActive }: { assets: Asset[], isLoading: boolean, onApprove: (id: string) => void, onReject: (id: string) => void, isSubscriptionActive: boolean }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [qrCodeData, setQrCodeData] = useState<{ id: string, name: string } | null>(null);
    const { searchQuery } = useSearch();
    const role = searchParams.get('role');
    const isCompanyAdmin = role === 'client'; // Simplified logic for demo

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
        }, {} as Record<string, Asset[]>);
    }, [filteredAssets]);

    if (isLoading) {
      return (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                  <Card key={i}>
                      <CardHeader className="p-0">
                          <Skeleton className="h-48 w-full rounded-t-lg" />
                      </CardHeader>
                      <CardContent className="p-4 space-y-2">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                          <Skeleton className="h-10 w-full" />
                      </CardFooter>
                  </Card>
              ))}
          </div>
      );
    }

    return (
        <div className="space-y-8">
            {!isSubscriptionActive && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Subscription Expired</AlertTitle>
                    <AlertDescription>
                        Your plan has expired. Your account is in read-only mode. You cannot add new assets. Please visit settings to upgrade your plan.
                    </AlertDescription>
                </Alert>
            )}
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
                            const nextInspectionDate = safeParseDate(asset.nextInspection);
                            return (
                                <Card key={asset.id} className={cn(
                                    "flex flex-col transition-all hover:border-primary/50 hover:shadow-md",
                                    asset.approvalStatus === 'Pending Approval' && "border-amber-500/50 bg-amber-500/5",
                                    asset.status === 'Requires Inspection' && "border-destructive/50 bg-destructive/5"
                                )}>
                                    <Link href={constructUrl(`/dashboard/assets/${asset.id}`)} className="flex flex-col flex-grow">
                                        <CardHeader className="p-0">
                                            <div className="relative h-48 w-full flex items-center justify-center bg-muted/20 rounded-t-lg">
                                                {asset.thumbnailUrl ? (
                                                    <Image src={asset.thumbnailUrl} alt={asset.name} fill className="object-cover rounded-t-lg" />
                                                ) : (
                                                    cloneElement(assetIcons[asset.type] || <Building />, { className: 'w-16 h-16 text-primary/50' })
                                                )}
                                            </div>
                                        </CardHeader>
                                        {asset.approvalStatus === 'Pending Approval' && (
                                            <div className="p-4 pt-4 pb-0 text-amber-600 flex items-center gap-2 text-sm font-semibold">
                                                <AlertTriangle className="h-4 w-4" />
                                                Pending Admin Approval
                                            </div>
                                        )}
                                        <CardContent className="p-4 flex-grow">
                                            <div className="flex items-start justify-between">
                                                {cloneElement(assetIcons[asset.type] || <Building />, { className: 'w-6 h-6 text-primary' })}
                                                <Badge variant={
                                                    asset.status === 'Operational' ? 'success' :
                                                    asset.status === 'Requires Inspection' ? 'destructive' :
                                                    asset.status === 'Under Repair' ? 'secondary' : 'outline'
                                                }>{asset.status}</Badge>
                                            </div>
                                            <CardTitle className="mt-2 font-semibold text-lg flex items-center gap-2">
                                                {asset.name}
                                                {asset.status === 'Requires Inspection' && (
                                                    <AlertTriangle className="h-5 w-5 text-destructive" />
                                                )}
                                            </CardTitle>
                                            <CardDescription className="font-bold">{asset.id}</CardDescription>
                                        </CardContent>
                                        <CardFooter className="p-4 pt-0 text-sm text-muted-foreground">
                                           <span>Next: {nextInspectionDate ? <ClientFormattedDate date={nextInspectionDate} formatString='dd-MMM-yyyy' /> : 'N/A'}</span>
                                        </CardFooter>
                                    </Link>
                                    {isCompanyAdmin && asset.approvalStatus === 'Pending Approval' && (
                                        <CardFooter className="p-4 pt-0">
                                            <div className="flex w-full justify-end gap-2">
                                                <Button variant="outline" size="sm" onClick={(e) => {e.stopPropagation(); onReject(asset.id)}}>Reject</Button>
                                                <Button size="sm" onClick={(e) => {e.stopPropagation(); onApprove(asset.id)}}>Approve</Button>
                                            </div>
                                        </CardFooter>
                                    )}
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
                    <DialogFooter>
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
    const router = useRouter();
    const { setScanOpen } = useQRScanner();
    const { toast } = useToast();
    
    // In a real app, this would come from a user context or subscription check.
    const isSubscriptionActive = false;

    const { firestore, user: authUser } = useFirebase();
    const { data: userProfile, isLoading: isLoadingProfile } = useDoc<PlatformUser>(
        useMemoFirebase(() => (firestore && authUser ? doc(firestore, 'users', authUser.uid) : null), [firestore, authUser])
    );
    
    useEffect(() => {
        if (role && !['client', 'inspector'].includes(role)) {
            router.replace(`/dashboard?${searchParams.toString()}`);
        }
    }, [role, router, searchParams]);
    
    const assetsQuery = useMemoFirebase(() => {
        if (!firestore || !userProfile?.companyId) return null;
        return query(collection(firestore, `assets`), where('companyId', '==', userProfile.companyId));
    }, [firestore, userProfile]);
    
    const { data: assetsFromDb, isLoading: isLoadingAssets } = useCollection<Asset>(assetsQuery);
    const isLoading = isLoadingAssets || isLoadingProfile;

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const handleApproveAsset = async (assetId: string) => {
        if (!firestore) return;
        const assetRef = doc(firestore, 'assets', assetId);
        try {
            await setDoc(assetRef, { approvalStatus: 'Approved' }, { merge: true });
            toast({ title: 'Asset Approved', description: 'The asset is now active.' });
        } catch (error) {
            console.error('Error approving asset:', error);
            toast({ variant: 'destructive', title: 'Approval Failed', description: 'Could not approve the asset.' });
        }
    };

    const handleRejectAsset = async (assetId: string) => {
        if (!firestore) return;
        const assetRef = doc(firestore, 'assets', assetId);
        try {
            await deleteDoc(assetRef);
            toast({ variant: 'destructive', title: 'Asset Rejected', description: 'The new asset submission has been removed.' });
        } catch (error) {
            console.error('Error rejecting asset:', error);
            toast({ variant: 'destructive', title: 'Rejection Failed', description: 'Could not remove the asset.' });
        }
    };
    
    if (role && !['client', 'inspector'].includes(role)) {
        return null;
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <Building className="text-primary"/>
                    Asset Management
                </h1>
                <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
                    <Button onClick={() => setScanOpen(true)} className="w-full sm:w-auto">
                        <QrCode className="mr-2 h-4 w-4"/>
                        Scan Asset
                    </Button>
                    {role === 'client' && (
                        <Button asChild variant="outline" className="w-full sm:w-auto" disabled={!isSubscriptionActive}>
                           <Link href={constructUrl("/dashboard/assets/add")}>Add New Asset</Link>
                        </Button>
                    )}
                </div>
            </div>
            
            {role === 'client' ? <ClientAssetsView assets={assetsFromDb || []} isLoading={isLoading} onApprove={handleApproveAsset} onReject={handleRejectAsset} isSubscriptionActive={isSubscriptionActive} /> : (
                 <div className="text-center p-10 border rounded-lg mt-8">
                    <QrCode className="mx-auto h-12 w-12 text-primary" />
                    <h2 className="mt-4 text-xl font-headline">Ready to Scan</h2>
                    <p className="mt-2 text-muted-foreground">Click "Scan Asset" to find an asset and view its details.</p>
                </div>
            )}
        </div>
    );
}

    
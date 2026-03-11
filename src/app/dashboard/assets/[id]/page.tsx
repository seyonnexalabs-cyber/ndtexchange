

'use client';
import * as React from 'react';
import { notFound, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ChevronLeft, Edit, Calendar, QrCode, MoreVertical, FileText, Printer, Building } from 'lucide-react';
import Image from 'next/image';
import { useFirebase, useCollection, useMemoFirebase, useDoc, useUser } from '@/firebase';
import { doc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { cn, safeParseDate } from '@/lib/utils';
import type { Asset, PlatformUser, Inspection } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const inspectionStatusVariants: Record<Inspection['status'], 'success' | 'destructive' | 'secondary'> = {
    'Completed': 'success',
    'Scheduled': 'secondary',
    'Requires Review': 'destructive',
};

const ClientFormattedDate = ({ date, formatString }: { date: Date | null, formatString: string }) => {
    const [formatted, setFormatted] = React.useState<string | null>(null);
    React.useEffect(() => {
        if (date) {
            setFormatted(format(date, formatString));
        }
    }, [date, formatString]);

    if (!formatted) return null;
    return <>{formatted}</>;
};

const UserAvatar = ({ userId }: { userId: string }) => {
    const { firestore } = useFirebase();
    const { data: user, isLoading } = useDoc<PlatformUser>(useMemoFirebase(() => (firestore && userId ? doc(firestore, 'users', userId) : null), [firestore, userId]));

    if (isLoading) return <Skeleton className="h-8 w-8 rounded-full" />;
    if (!user) return <Avatar className="h-8 w-8"><AvatarFallback>?</AvatarFallback></Avatar>;
    
    return (
        <Avatar className="h-8 w-8">
            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
    );
};


export default function AssetDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const searchParams = useSearchParams();
    const { firestore, user: authUser } = useFirebase();
    const [qrCodeData, setQrCodeData] = React.useState<{ id: string, name: string } | null>(null);

    const { data: asset, isLoading: isLoadingAsset, error: assetError } = useDoc<Asset>(
        useMemoFirebase(() => (firestore && id ? doc(firestore, `assets`, id) : null), [firestore, id])
    );
    
    const inspectionsQuery = useMemoFirebase(() => (firestore && id ? query(collection(firestore, `inspections`), where('assetId', '==', id), orderBy('date', 'desc'), limit(5)) : null), [firestore, id]);
    const { data: inspections, isLoading: isLoadingInspections } = useCollection<Inspection>(inspectionsQuery);
    
    const { data: createdBy, isLoading: isLoadingCreatedBy } = useDoc<PlatformUser>(useMemoFirebase(() => (firestore && asset?.createdBy ? doc(firestore, 'users', asset.createdBy) : null), [firestore, asset]));
    const { data: modifiedBy, isLoading: isLoadingModifiedBy } = useDoc<PlatformUser>(useMemoFirebase(() => (firestore && asset?.modifiedBy ? doc(firestore, 'users', asset.modifiedBy) : null), [firestore, asset]));

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    };

    const isLoading = isLoadingAsset || isLoadingInspections || isLoadingCreatedBy || isLoadingModifiedBy;

    if ((!isLoadingAsset && !asset) || assetError) {
        notFound();
    }
    
    const createdAtDate = asset?.createdAt ? safeParseDate(asset.createdAt) : null;
    const modifiedAtDate = asset?.modifiedAt ? safeParseDate(asset.modifiedAt) : null;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-1/4" />
                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-[450px] w-full" />
                    </div>
                    <div className="lg:col-span-1 space-y-6">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-4">
                <div>
                     <nav className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                        <Link href={constructUrl("/dashboard/assets")} className="hover:text-primary">Assets</Link>
                        <ChevronLeft className="h-4 w-4 transform rotate-180" />
                        <span className="font-medium text-foreground">Asset Detail</span>
                    </nav>
                    <h1 className="text-2xl lg:text-3xl font-headline font-bold">Asset Detail: {asset?.name}</h1>
                </div>
                <div className="flex gap-2">
                    <Button asChild variant="outline"><Link href={constructUrl(`/dashboard/assets/${id}/edit`)}><Edit className="mr-2"/>Edit Asset</Link></Button>
                    <Button>Schedule Inspection</Button>
                    <Button variant="ghost" size="icon" aria-label="More actions" title="More actions"><MoreVertical/></Button>
                </div>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Asset Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="grid md:grid-cols-3 gap-8">
                                <div className="md:col-span-1">
                                    <div className="relative aspect-square bg-muted rounded-md overflow-hidden">
                                        {asset?.thumbnailUrl ? (
                                            <Image src={asset.thumbnailUrl} alt={asset.name} fill className="object-cover" />
                                        ) : (
                                             <div className="flex items-center justify-center h-full">
                                                <Building className="w-16 h-16 text-muted-foreground/30" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="md:col-span-2 grid grid-cols-2 gap-x-4 gap-y-6 text-sm">
                                    <div><p className="font-semibold">Asset Type</p><p className="text-muted-foreground">{asset?.type}</p></div>
                                    <div><p className="font-semibold">Serial Number</p><p className="text-muted-foreground">{asset?.serialNumber || 'N/A'}</p></div>
                                    <div><p className="font-semibold">Location</p><p className="text-muted-foreground">{asset?.location}</p></div>
                                    <div><p className="font-semibold">Movable</p><p className="text-muted-foreground">{asset?.isMovable ? 'Yes' : 'No'}</p></div>
                                    <div className="col-span-2"><p className="font-semibold">Description</p><p className="text-muted-foreground">{asset?.notes || 'No description provided.'}</p></div>
                                    <div className="col-span-2">
                                        <Button variant="link" className="p-0 h-auto" onClick={() => setQrCodeData({ id: asset!.id, name: asset!.name })}>
                                            <QrCode className="mr-2" />
                                            View QR Code
                                        </Button>
                                    </div>
                                </div>
                             </div>
                        </CardContent>
                         <CardFooter className="bg-muted/50 p-4 border-t flex flex-col sm:flex-row sm:justify-between gap-4">
                            <div className="flex items-center gap-3 text-sm">
                                {createdBy ? <UserAvatar userId={asset!.createdBy!} /> : <Skeleton className="h-8 w-8 rounded-full" />}
                                <div>
                                    <span className="text-muted-foreground">Created by </span>
                                    <span className="font-semibold">{createdBy?.name || '...'}</span>
                                    <span className="text-muted-foreground"> on <ClientFormattedDate date={createdAtDate} formatString='PP' /></span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                {modifiedBy ? <UserAvatar userId={asset!.modifiedBy!} /> : <Skeleton className="h-8 w-8 rounded-full" />}
                                <div>
                                    <span className="text-muted-foreground">Last modified by </span>
                                    <span className="font-semibold">{modifiedBy?.name || '...'}</span>
                                    <span className="text-muted-foreground"> on <ClientFormattedDate date={modifiedAtDate} formatString='PP' /></span>
                                </div>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Inspections</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {inspections?.map(inspection => {
                                    const inspectionDate = safeParseDate(inspection.date);
                                    return (
                                        <div key={inspection.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Calendar className="h-5 w-5 text-muted-foreground"/>
                                                <div>
                                                    <p className="font-semibold"><ClientFormattedDate date={inspectionDate} formatString='PP' /></p>
                                                    <p className="text-xs text-muted-foreground">Inspector: {inspection.inspector}</p>
                                                </div>
                                            </div>
                                            <Badge variant={inspectionStatusVariants[inspection.status]}>{inspection.status}</Badge>
                                        </div>
                                    )
                                })}
                                 {inspections?.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No recent inspections found.</p>}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="secondary" className="w-full">View All Inspections</Button>
                        </CardFooter>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Documents</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 rounded-md border p-3 hover:bg-muted cursor-pointer">
                                    <FileText className="h-5 w-5 text-primary"/>
                                    <p className="font-medium text-sm">User_Manual.pdf</p>
                                </div>
                                <div className="flex items-center gap-3 rounded-md border p-3 hover:bg-muted cursor-pointer">
                                    <FileText className="h-5 w-5 text-primary"/>
                                    <p className="font-medium text-sm">Calibration_Cert_2024.pdf</p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter><Button variant="secondary" className="w-full">View All Documents</Button></CardFooter>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Associated Team</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground text-center py-4">Team association feature coming soon.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

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

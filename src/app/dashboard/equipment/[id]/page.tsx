'use client';
import * as React from 'react';
import { notFound, useParams, useRouter, useSearchParams } from "next/navigation";
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Edit, MoreVertical, QrCode, Printer, Wrench, HardHat, Package, SlidersHorizontal, RadioTower, Waves, Cpu, Eye, Cable, History, Calendar } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useFirebase, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import type { Equipment, EquipmentHistory, Job, PlatformUser, EquipmentType } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { format, differenceInDays, startOfDay } from 'date-fns';
import { cn, safeParseDate } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Image from 'next/image';

const equipmentTypeIcons: { [key in EquipmentType]: React.ReactNode } = {
    'Instrument': <RadioTower className="w-6 h-6 text-primary" />,
    'Probe': <SlidersHorizontal className="w-6 h-6 text-primary" />,
    'Source': <Waves className="w-6 h-6 text-primary" />,
    'Sensor': <Cpu className="w-6 h-6 text-primary" />,
    'Calibration Standard': <Wrench className="w-6 h-6 text-primary" />,
    'Accessory': <Cable className="w-6 h-6 text-primary" />,
    'Visual Aid': <Eye className="w-6 h-6 text-primary" />,
};

const statusVariants: { [key in Equipment['status']]: 'success' | 'default' | 'destructive' | 'outline' | 'secondary' } = {
    'Available': 'success',
    'In Use': 'default',
    'Calibration Due': 'destructive',
    'Out of Service': 'outline',
    'Under Service': 'secondary',
};

const UserAvatar = ({ userId }: { userId: string }) => {
    const { firestore } = useFirebase();
    const { data: user, isLoading } = useDoc<PlatformUser>(useMemoFirebase(() => (firestore && userId ? doc(firestore, 'users', userId) : null), [firestore, userId]));

    if (isLoading) return <Skeleton className="h-8 w-8 rounded-full" />;
    if (!user) return null;
    
    return <p className="font-semibold">{user.name}</p>;
};

const CalibrationCard = ({ nextCalibration }: { nextCalibration: string }) => {
    if (nextCalibration === 'N/A') {
        return (
            <Card>
                <CardHeader><CardTitle>Calibration</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">No calibration date set.</p></CardContent>
            </Card>
        )
    }

    const today = startOfDay(new Date());
    const calDate = safeParseDate(nextCalibration);

    if (!calDate) {
        return <div className="text-xs text-muted-foreground">Invalid cal. date</div>;
    }
    
    const totalPeriod = 365; // Assume a 1-year calibration cycle for visualization
    const daysRemaining = differenceInDays(calDate, today);
    const percentage = Math.max(0, Math.min(100, (daysRemaining / totalPeriod) * 100));

    let colorClass = 'bg-green-500';
    let daysText = `${daysRemaining} days remaining`;
    let statusText = "Calibration is up to date.";
    
    if (daysRemaining <= 0) {
        colorClass = 'bg-red-500';
        daysText = `Overdue by ${Math.abs(daysRemaining)} days`;
        statusText = "Calibration is overdue. This equipment should not be used.";
    } else if (daysRemaining <= 30) {
        colorClass = 'bg-amber-500';
        daysText = `${daysRemaining} days left`;
        statusText = "Calibration is due soon. Schedule service to avoid downtime.";
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Calibration Status</CardTitle>
                <CardDescription>Next calibration due: {format(calDate, 'PPP')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground mb-1">
                        <span className="font-semibold">Time Remaining</span>
                        <span className={cn(
                            "font-semibold",
                            daysRemaining <= 0 ? "text-red-500" :
                            daysRemaining <= 30 ? "text-amber-500" : "text-green-500"
                        )}>{daysText}</span>
                    </div>
                    <Progress value={percentage} indicatorClassName={colorClass} />
                </div>
                <p className="text-sm text-muted-foreground">{statusText}</p>
            </CardContent>
        </Card>
    );
}

export default function EquipmentDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const searchParams = useSearchParams();
    const router = useRouter();
    const { firestore } = useFirebase();

    const [qrCodeData, setQrCodeData] = React.useState<{ id: string, name: string } | null>(null);

    const { data: equipment, isLoading: isLoadingEquipment } = useDoc<Equipment>(useMemoFirebase(() => (firestore ? doc(firestore, 'equipment', id) : null), [firestore, id]));
    
    const { data: parentEquipment, isLoading: isLoadingParent } = useDoc<Equipment>(useMemoFirebase(() => (firestore && equipment?.parentId ? doc(firestore, 'equipment', equipment.parentId) : null), [firestore, equipment]));

    const assignedJobsQuery = useMemoFirebase(() => {
        if (!firestore || !id) return null;
        return query(
            collection(firestore, 'jobs'),
            where('equipmentIds', 'array-contains', id)
        );
    }, [firestore, id]);
    const { data: assignedJobs, isLoading: isLoadingJobs } = useCollection<Job>(assignedJobsQuery);

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    };

    const isLoading = isLoadingEquipment || isLoadingJobs || isLoadingParent;

    if (!isLoading && !equipment) {
        notFound();
    }
    
    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-1/4" />
                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-1 space-y-6">
                        <Skeleton className="h-[450px] w-full" />
                    </div>
                    <div className="lg:col-span-2 space-y-6">
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
                        <Link href={constructUrl("/dashboard/equipment")} className="hover:text-primary">Equipment</Link>
                        <ChevronLeft className="h-4 w-4 transform rotate-180" />
                        <span className="font-medium text-foreground">Equipment Detail</span>
                    </nav>
                    <h1 className="text-2xl lg:text-3xl font-headline font-bold">{equipment?.name}</h1>
                </div>
                <div className="flex gap-2">
                    <Button asChild variant="outline"><Link href={constructUrl(`/dashboard/equipment/${id}/edit`)}><Edit className="mr-2"/>Edit Equipment</Link></Button>
                    <Button>Check Out/In</Button>
                    <Button variant="ghost" size="icon"><MoreVertical/></Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-start">
                 <div className="lg:col-span-1 space-y-6">
                     <Card>
                        <CardHeader className="p-0">
                            <div className="relative aspect-square bg-muted rounded-t-lg overflow-hidden">
                                {equipment?.thumbnailUrl ? (
                                    <Image src={equipment.thumbnailUrl} alt={equipment.name} fill className="object-contain p-4" />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        {React.cloneElement(equipmentTypeIcons[equipment!.type] || <Wrench />, { className: 'w-24 h-24 text-primary/30' })}
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <Badge variant="outline">{equipment?.type}</Badge>
                                    <h3 className="text-xl font-bold mt-1">{equipment?.name}</h3>
                                    <p className="font-bold text-muted-foreground text-sm">{equipment?.id}</p>
                                </div>
                                <Badge variant={statusVariants[equipment!.status]}>{equipment?.status}</Badge>
                            </div>
                             <div className="mt-4 space-y-2 text-sm">
                                <p><strong className="w-24 inline-block">Manufacturer:</strong> <span className="text-muted-foreground">{equipment?.manufacturer || 'N/A'}</span></p>
                                <p><strong className="w-24 inline-block">Model:</strong> <span className="text-muted-foreground">{equipment?.model || 'N/A'}</span></p>
                                <p><strong className="w-24 inline-block">Serial #:</strong> <span className="text-muted-foreground">{equipment?.serialNumber || 'N/A'}</span></p>
                            </div>
                            {parentEquipment && (
                                <Link href={constructUrl(`/dashboard/equipment/${parentEquipment.id}`)} className="text-sm">
                                    <Card className="mt-4 p-3 bg-muted/50 hover:bg-muted">
                                        <p className="text-xs text-muted-foreground">Part of kit:</p>
                                        <p className="font-semibold flex items-center gap-2"><Package className="h-4 w-4"/> {parentEquipment.name}</p>
                                    </Card>
                                </Link>
                            )}
                             <div className="mt-4">
                                <h4 className="text-sm font-semibold mb-2">Techniques</h4>
                                <div className="flex flex-wrap gap-1">
                                    {equipment?.techniques.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
                                </div>
                            </div>
                        </CardContent>
                         <CardFooter>
                            <Button variant="link" className="p-0 h-auto" onClick={() => setQrCodeData({ id: equipment!.id, name: equipment!.name })}>
                                <QrCode className="mr-2" />
                                View QR Code
                            </Button>
                        </CardFooter>
                    </Card>
                     <CalibrationCard nextCalibration={equipment!.nextCalibration} />
                 </div>
                 <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><History className="text-primary"/> History Log</CardTitle></CardHeader>
                        <CardContent>
                            <div className="relative pl-6">
                                <div className="absolute left-3 top-0 h-full w-px bg-border" />
                                {(equipment?.history || []).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((item, index) => (
                                    <div key={index} className="relative flex items-start space-x-4 mb-6">
                                        <div className="absolute left-0 top-1.5 h-3 w-3 -translate-x-1/2 rounded-full bg-primary" />
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm">{item.event}</p>
                                            <p className="text-xs text-muted-foreground">by <UserAvatar userId={item.user} /> on {format(safeParseDate(item.timestamp)!, 'dd-MMM-yyyy @ p')}</p>
                                            {item.notes && <p className="text-xs text-muted-foreground italic mt-1">"{item.notes}"</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="text-primary"/> Assigned Jobs</CardTitle></CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader><TableRow><TableHead>Job Title</TableHead><TableHead>Client</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {(assignedJobs || []).map(job => (
                                        <TableRow key={job.id}>
                                            <TableCell className="font-medium"><Link href={constructUrl(`/dashboard/my-jobs/${job.id}`)} className="hover:underline">{job.title}</Link></TableCell>
                                            <TableCell>{job.client}</TableCell>
                                            <TableCell><Badge variant="default">{job.status}</Badge></TableCell>
                                        </TableRow>
                                    ))}
                                    {(assignedJobs || []).length === 0 && <TableRow><TableCell colSpan={3} className="text-center h-24">Not currently assigned to any jobs.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                 </div>
            </div>
             <Dialog open={!!qrCodeData} onOpenChange={(open) => {if (!open) {setQrCodeData(null)}}}>
                <DialogContent className="sm:max-w-md">
                    <div className="printable-area">
                        <DialogHeader>
                            <DialogTitle>Equipment QR Code</DialogTitle>
                            <DialogDescription>
                                Print this QR code and attach it to your equipment for easy scanning.
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


'use client';
import { useState, useMemo, cloneElement, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, SlidersHorizontal, RadioTower, QrCode, Wrench, Printer, LogIn, LogOut, Edit, History, Send, Package, Cpu, Waves, Cable, Eye, AlertTriangle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GLOBAL_DATE_FORMAT, cn, safeParseDate } from "@/lib/utils";
import { format, differenceInDays, startOfDay } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from 'sonner';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Textarea } from "@/components/ui/textarea";
import { useQRScanner } from "@/app/components/layout/qr-scanner-provider";
import { useSearch } from "@/app/components/layout/search-provider";
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CustomDateInput } from '@/components/ui/custom-date-input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useFirebase, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import type { Equipment, EquipmentHistory, InspectorAsset, Job, EquipmentType, PlatformUser } from '@/lib/types';
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";


const equipmentTypeIcons: { [key in EquipmentType]: React.ReactElement } = {
    'Instrument': <RadioTower className="w-6 h-6 text-primary" />,
    'Probe': <SlidersHorizontal className="w-6 h-6 text-primary" />,
    'Source': <Waves className="w-6 h-6 text-primary" />,
    'Sensor': <Cpu className="w-6 h-6 text-primary" />,
    'Calibration Standard': <Wrench className="w-6 h-6 text-primary" />,
    'Accessory': <Cable className="w-6 h-6 text-primary" />,
    'Visual Aid': <Eye className="w-6 h-6 text-primary" />,
};

const checkInSchema = z.object({
  condition: z.enum(['Good', 'Damaged', 'Requires Calibration']),
  hoursUsed: z.coerce.number().min(0, "Hours must be 0 or more.").optional(),
  notes: z.string().optional(),
});
type CheckInFormValues = z.infer<typeof checkInSchema>;

const checkOutSchema = z.object({
  jobId: z.string().min(1, 'Please select a job.'),
  notes: z.string().optional(),
});
type CheckOutFormValues = z.infer<typeof checkOutSchema>;

const serviceOutSchema = z.object({
  serviceType: z.enum(['Calibration', 'Repair', 'Maintenance']),
  vendor: z.string().min(2, "Vendor name is required."),
  serviceOrderNumber: z.string().optional(),
  expectedReturnDate: z.date().optional(),
  vendorContactPerson: z.string().optional(),
  vendorContactEmail: z.string().email({ message: "Please enter a valid email." }).optional().or(z.literal('')),
  notes: z.string().optional(),
});
type ServiceOutFormValues = z.infer<typeof serviceOutSchema>;


const CheckInOutForm = ({ 
    formId,
    action, 
    onSubmit, 
    jobsForCheckout,
 }: { 
    formId: string;
    action: 'check-in' | 'check-out';
    onSubmit: SubmitHandler<CheckInFormValues | CheckOutFormValues>;
    jobsForCheckout: Job[];
}) => {
    const isCheckIn = action === 'check-in';
    const form = useForm<CheckInFormValues | CheckOutFormValues>({
        resolver: zodResolver(isCheckIn ? checkInSchema : checkOutSchema),
        defaultValues: isCheckIn 
            ? { condition: 'Good', hoursUsed: 0, notes: '' } 
            : { jobId: '', notes: '' },
    });

    return (
        <Form {...form}>
            <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                {isCheckIn ? (
                    <>
                        <FormField
                            control={form.control}
                            name="condition"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Condition</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a condition" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Good">Good</SelectItem>
                                        <SelectItem value="Damaged">Damaged</SelectItem>
                                        <SelectItem value="Requires Calibration">Requires Calibration</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="hoursUsed"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Hours Used (Optional)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="e.g., 8" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </>
                ) : (
                    <FormField
                        control={form.control}
                        name="jobId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Assign to Job</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a job" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {jobsForCheckout.map(job => (
                                            <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                 <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes (Optional)</FormLabel>
                            <FormControl>
                                <Textarea placeholder="e.g., Casing is cracked, returned early..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    );
};

const ServiceOutForm = ({
    formId,
    onSubmit,
}: {
    formId: string;
    onSubmit: (values: ServiceOutFormValues) => void;
}) => {
    const form = useForm<ServiceOutFormValues>({
        resolver: zodResolver(serviceOutSchema),
        defaultValues: {
            serviceType: 'Calibration',
            notes: '',
            vendor: '',
            serviceOrderNumber: '',
            vendorContactPerson: '',
            vendorContactEmail: '',
        }
    });

    return (
        <Form {...form}>
            <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                    control={form.control}
                    name="serviceType"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Service Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a service type" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Calibration">Calibration</SelectItem>
                                    <SelectItem value="Repair">Repair</SelectItem>
                                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="vendor"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Vendor / Service Provider</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Acme Calibration Services" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="serviceOrderNumber"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Service Order / RMA Number (Optional)</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., SO-12345" {...field} />
                            </FormControl>
                             <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="expectedReturnDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Expected Return Date (Optional)</FormLabel>
                        <FormControl>
                           <CustomDateInput {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="vendorContactPerson"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Contact Person (Optional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="John Smith" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="vendorContactEmail"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Contact Email (Optional)</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="contact@acme.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                 <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes (Optional)</FormLabel>
                            <FormControl>
                                <Textarea placeholder="e.g., Sent out for annual calibration." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    );
};


const statusVariants: { [key in Equipment['status']]: 'success' | 'default' | 'destructive' | 'outline' | 'secondary' } = {
    'Available': 'success',
    'In Use': 'default',
    'Calibration Due': 'destructive',
    'Out of Service': 'outline',
    'Under Service': 'secondary',
};

const CalibrationBar = ({ nextCalibration }: { nextCalibration: string }) => {
    const [calibrationStatus, setCalibrationStatus] = useState<{
        percentage: number;
        colorClass: string;
        daysText: string;
    } | null>(null);

    useEffect(() => {
        if (nextCalibration === 'N/A') {
            setCalibrationStatus(null);
            return;
        }

        const calDate = safeParseDate(nextCalibration);
        if (!calDate) {
            setCalibrationStatus(null); 
            return;
        }

        const today = startOfDay(new Date());
        const totalPeriod = 365;
        const daysRemaining = differenceInDays(calDate, today);
        const percentage = Math.max(0, Math.min(100, (daysRemaining / totalPeriod) * 100));

        let colorClass = 'bg-green-500';
        let daysText = `${daysRemaining} days`;
        
        if (daysRemaining <= 0) {
            colorClass = 'bg-red-500';
            daysText = `${Math.abs(daysRemaining)} days overdue`;
        } else if (daysRemaining <= 30) {
            colorClass = 'bg-amber-500';
            daysText = `${daysRemaining} days left`;
        }

        setCalibrationStatus({ percentage, colorClass, daysText });

    }, [nextCalibration]);

    if (nextCalibration === 'N/A' || calibrationStatus === null) {
        return (
             <div className="w-full">
                 <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                    <span className="font-semibold">Calibration</span>
                 </div>
                <Skeleton className="h-2 w-full" />
            </div>
        );
    }
    
    return (
        <div className="w-full">
            <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                <span className="font-semibold">Calibration</span>
                <span className={cn(
                    "font-semibold",
                    calibrationStatus.colorClass === 'bg-red-500' ? "text-red-500" :
                    calibrationStatus.colorClass === 'bg-amber-500' ? "text-amber-500" : "text-green-500"
                )}>{calibrationStatus.daysText}</span>
            </div>
            <Progress value={calibrationStatus.percentage} indicatorClassName={calibrationStatus.colorClass} />
        </div>
    );
};


const EquipmentCard = ({ asset, onQrClick, constructUrl, onCheckOutClick, onCheckInClick, onServiceOutClick, isSubscriptionActive }: {
    asset: InspectorAsset,
    onQrClick: (data: {id: string, name: string}) => void,
    constructUrl: (base: string) => string,
    onCheckOutClick: (equipment: InspectorAsset) => void,
    onCheckInClick: (equipment: InspectorAsset) => void,
    onServiceOutClick: (equipment: InspectorAsset) => void,
    isSubscriptionActive: boolean,
}) => {
    return (
        <Card key={asset.id} className="flex flex-col">
            <CardHeader className="p-0">
                <div className="relative h-48 w-full flex items-center justify-center bg-muted/20 rounded-t-lg">
                    {asset.thumbnailUrl ? (
                        <Image src={asset.thumbnailUrl} alt={asset.name} fill className="object-cover rounded-t-lg" />
                    ) : (
                        cloneElement(equipmentTypeIcons[asset.type] || <Wrench className="text-primary"/>, { className: 'w-16 h-16 text-primary/50' })
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-4 flex-grow">
                 <div className="flex items-start justify-between">
                    <div className="flex flex-wrap gap-1">
                        <Badge variant="outline">{asset.type}</Badge>
                    </div>
                    <Badge variant={statusVariants[asset.status]}>{asset.status}</Badge>
                </div>
                <CardTitle className="mt-2 font-semibold text-lg">{asset.name}</CardTitle>
                <CardDescription className="font-bold flex items-center gap-2">
                    {asset.id}
                    {asset.parentId && <Badge variant="outline" className="text-xs">Kit Component</Badge>}
                </CardDescription>
            </CardContent>
             <CardFooter className="p-4 pt-2 flex flex-col items-start gap-3">
                <CalibrationBar nextCalibration={asset.nextCalibration} />
                <div className="w-full flex justify-end -mb-2 -mr-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {asset.status === 'Available' ? (
                                <>
                                    <DropdownMenuItem onSelect={() => onCheckOutClick(asset)} disabled={!isSubscriptionActive}><LogOut className="mr-2 h-4 w-4"/>Check Out for Job</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => onServiceOutClick(asset)} disabled={!isSubscriptionActive}><Send className="mr-2 h-4 w-4"/>Send for Service</DropdownMenuItem>
                                </>
                            ) : ( (asset.status === 'In Use' || asset.status === 'Under Service') && 
                                <DropdownMenuItem onSelect={() => onCheckInClick(asset)} disabled={!isSubscriptionActive}><LogIn className="mr-2 h-4 w-4"/>Check In</DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild><Link href={constructUrl(`/dashboard/equipment/${asset.id}`)}><History className="mr-2 h-4 w-4"/>View Details</Link></DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => onQrClick({ id: asset.id, name: asset.name })}>Show QR Code</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardFooter>
        </Card>
    );
};


export default function EquipmentPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role');
    const { firestore, user } = useFirebase();
    const { setScanOpen } = useQRScanner();
    const { searchQuery } = useSearch();

    const [userProfile, setUserProfile] = useState<PlatformUser | null>(null);
    const [qrCodeData, setQrCodeData] = useState<{ id: string, name: string } | null>(null);
    const [statusFilter, setStatusFilter] = useState('all');
    
    // In a real app, this would come from a user context or subscription check.
    const isSubscriptionActive = false;

    useEffect(() => {
        if (role && role !== 'inspector') {
            router.replace(`/dashboard?${searchParams.toString()}`);
        }
        if (user && firestore) {
            getDoc(doc(firestore, 'users', user.uid)).then(docSnap => {
                if (docSnap.exists()) setUserProfile(docSnap.data() as PlatformUser);
            });
        }
    }, [role, router, searchParams, user, firestore]);
    
    const equipmentQuery = useMemoFirebase(() => {
        if (!firestore || !userProfile?.companyId) return null;
        return query(collection(firestore, 'equipment'), where('providerId', '==', userProfile.companyId), where('parentId', '==', null));
    }, [firestore, userProfile]);
    
    const { data: equipmentFromDb, isLoading: isLoadingEquipment } = useCollection<InspectorAsset>(equipmentQuery);

    const jobsQuery = useMemoFirebase(() => {
        if (!firestore || !userProfile?.companyId) return null;
        return query(collection(firestore, 'jobs'), where('providerId', '==', userProfile.companyId));
    }, [firestore, userProfile]);
    
    const { data: jobsFromDb, isLoading: isLoadingJobs } = useCollection<Job>(jobsQuery);

    const equipment = equipmentFromDb || [];

    const jobsForCheckout = useMemo(() => {
        if (!jobsFromDb) return [];
        return jobsFromDb.filter(j => ['Assigned', 'Scheduled', 'In Progress'].includes(j.status));
    }, [jobsFromDb]);

    
    const [transactionState, setTransactionState] = useState<{ action: 'check-in' | 'check-out' | 'service-out' | null; equipment: InspectorAsset | null }>({ action: null, equipment: null });

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const filteredEquipment = useMemo(() => {
        return equipment.filter(item => {
            const searchMatch = !searchQuery ||
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.id.toLowerCase().includes(searchQuery.toLowerCase());

            const statusMatch = statusFilter === 'all' || item.status === statusFilter;

            return searchMatch && statusMatch;
        });
    }, [equipment, searchQuery, statusFilter]);
    
    const handleCheckOutClick = (equipment: InspectorAsset) => {
        setTransactionState({ action: 'check-out', equipment });
    };

    const handleCheckInClick = (equipment: InspectorAsset) => {
        setTransactionState({ action: 'check-in', equipment });
    };
    
    const handleServiceOutClick = (equipment: InspectorAsset) => {
        setTransactionState({ action: 'service-out', equipment });
    };
    
    const handleQrClick = (data: { id: string, name: string }) => {
        setQrCodeData(data);
    }

    const handleTransactionSubmit = async (values: CheckInFormValues | CheckOutFormValues | ServiceOutFormValues) => {
        const { action, equipment } = transactionState;
        
        closeTransactionDialog();

        if (!equipment || !action || !firestore) return;

        let notes = '';
        let newStatus: InspectorAsset['status'] = equipment.status;
        let historyEvent: EquipmentHistory['event'];

        if (action === 'check-in') {
            const formValues = values as CheckInFormValues;
            notes = [`Condition: ${formValues.condition}`, formValues.hoursUsed !== undefined && `Hours Used: ${formValues.hoursUsed}`, formValues.notes].filter(Boolean).join('. ');
            newStatus = formValues.condition === 'Damaged' ? 'Out of Service' : formValues.condition === 'Requires Calibration' ? 'Calibration Due' : 'Available';
            historyEvent = 'Checked In';
        } else if (action === 'check-out') {
            const formValues = values as CheckOutFormValues;
            const jobTitle = jobsFromDb?.find(j => j.id === formValues.jobId)?.title || formValues.jobId;
            notes = [`Job: ${jobTitle}`, formValues.notes].filter(Boolean).join('. ');
            newStatus = 'In Use';
            historyEvent = 'Checked Out';
        } else { // service-out
             const formValues = values as ServiceOutFormValues;
            notes = [`Service: ${formValues.serviceType} with ${formValues.vendor}`, formValues.serviceOrderNumber && `SO#: ${formValues.serviceOrderNumber}`, formValues.expectedReturnDate && `Expected Return: ${format(formValues.expectedReturnDate, GLOBAL_DATE_FORMAT)}`, formValues.vendorContactPerson, formValues.notes].filter(Boolean).join('. ');
            newStatus = 'Under Service';
            historyEvent = 'Checked Out for Service';
        }

        const newHistoryEntry: EquipmentHistory = { event: historyEvent!, user: userProfile?.name || 'System', timestamp: new Date().toISOString(), notes: notes };
        const equipmentRef = doc(firestore, 'equipment', equipment.id);
        
        try {
            await updateDoc(equipmentRef, {
                status: newStatus,
                history: arrayUnion(newHistoryEntry)
            });
            toast.success(`Equipment ${action === 'check-in' ? 'Checked In' : 'Checked Out'}`, { description: `${equipment.name} status has been updated to '${newStatus}'.`});
        } catch(e) {
            console.error(e);
            toast.error('Update failed', { description: 'Could not update equipment status.'});
        }
    };

    const isTransactionDialogOpen = transactionState.action !== null;
    const closeTransactionDialog = () => setTransactionState({ action: null, equipment: null });

    const transactionDialogTitleMap = {
        'check-in': 'Check In Equipment',
        'check-out': 'Check Out for Job',
        'service-out': 'Check Out for Service',
    } as const;

    const transactionDialogTitle = transactionState.action ? transactionDialogTitleMap[transactionState.action] : '';

    if (role !== 'inspector') {
        return null;
    }
    
    if(isLoadingEquipment || isLoadingJobs || !userProfile) {
        return (
             <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-48" />
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-36" />
                    </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-80 w-full" />)}
                </div>
            </div>
        )
    }
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <Wrench className="text-primary"/>
                    Equipment
                </h1>
                 <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setScanOpen(true)}>
                        <QrCode className="mr-2 h-4 w-4 text-primary"/>
                        Scan QR
                    </Button>
                    <Button asChild disabled={!isSubscriptionActive}><Link href={constructUrl('/dashboard/equipment/add')}>Add New Equipment</Link></Button>
                </div>
            </div>

            {!isSubscriptionActive && (
                 <Alert variant="destructive" className="mb-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Subscription Expired</AlertTitle>
                    <AlertDescription>
                        Your plan has expired. Your account is in read-only mode. You cannot add new equipment. Please visit settings to upgrade your plan.
                    </AlertDescription>
                </Alert>
            )}
            
            <div className="flex flex-col sm:flex-row sm:justify-end gap-4 mb-6">
                <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="Available">Available</SelectItem>
                            <SelectItem value="In Use">In Use</SelectItem>
                            <SelectItem value="Under Service">Under Service</SelectItem>
                            <SelectItem value="Calibration Due">Calibration Due</SelectItem>
                            <SelectItem value="Out of Service">Out of Service</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {filteredEquipment.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredEquipment.map(asset => (
                        <EquipmentCard 
                            key={asset.id}
                            asset={asset}
                            onQrClick={handleQrClick}
                            onCheckInClick={handleCheckInClick}
                            onCheckOutClick={handleCheckOutClick}
                            onServiceOutClick={handleServiceOutClick}
                            constructUrl={constructUrl}
                            isSubscriptionActive={isSubscriptionActive}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center p-10 border rounded-lg">
                    <Wrench className="mx-auto h-12 w-12 text-primary" />
                    <h2 className="mt-4 text-xl font-headline">No Equipment Found</h2>
                    <p className="mt-2 text-muted-foreground">No equipment matches your current search or filter criteria.</p>
                </div>
            )}


             <Dialog open={!!qrCodeData} onOpenChange={(open) => {if (!open) {setQrCodeData(null)}}}>
                <DialogContent className="sm:max-w-md">
                    <div className="printable-area">
                        <DialogHeader>
                            <DialogTitle>QR Code for {qrCodeData?.name}</DialogTitle>
                            <DialogDescription>
                               Scan this code to quickly access equipment details for ID: {qrCodeData?.id}
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
                                        <p className="font-extrabold text-muted-foreground">{qrCodeData.id}</p>
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

             <Dialog open={isTransactionDialogOpen} onOpenChange={closeTransactionDialog}>
                <DialogContent className="flex flex-col max-h-[90vh] p-0">
                    <DialogHeader className="p-6 pb-4 border-b">
                        <DialogTitle>{transactionDialogTitle}</DialogTitle>
                        <DialogDescription>Record details for {transactionState.equipment?.name}.</DialogDescription>
                    </DialogHeader>
                    <div className="flex-grow overflow-y-auto px-6">
                        {transactionState.action === 'check-in' && (
                            <CheckInOutForm
                                formId="transaction-form"
                                action="check-in"
                                onSubmit={handleTransactionSubmit}
                                jobsForCheckout={jobsForCheckout}
                            />
                        )}
                        {transactionState.action === 'check-out' && (
                            <CheckInOutForm
                                formId="transaction-form"
                                action="check-out"
                                onSubmit={handleTransactionSubmit}
                                jobsForCheckout={jobsForCheckout}
                            />
                        )}
                        {transactionState.action === 'service-out' && (
                            <ServiceOutForm 
                                formId="transaction-form"
                                onSubmit={handleTransactionSubmit}
                            />
                        )}
                    </div>
                    <DialogFooter className="p-6 pt-4 border-t">
                         <Button type="button" variant="ghost" onClick={closeTransactionDialog}>Cancel</Button>
                         <Button type="submit" form="transaction-form">Confirm</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

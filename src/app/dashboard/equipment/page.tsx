

'use client';
import { useState, useMemo, cloneElement } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { inspectorAssets as initialEquipment, jobs, InspectorAsset, EquipmentHistory, Job } from "@/lib/placeholder-data";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, SlidersHorizontal, RadioTower, QrCode, Wrench, Printer, LogIn, LogOut, Edit, History, Send, Package } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GLOBAL_DATE_FORMAT, cn } from '@/lib/utils';
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Textarea } from "@/components/ui/textarea";
import { useQRScanner } from "@/app/components/layout/qr-scanner-provider";
import { useSearch } from "@/app/components/layout/search-provider";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CustomDateInput } from '@/components/ui/custom-date-input';
import { PlaceHolderImages } from "@/lib/placeholder-images";


const equipmentIcons: { [key: string]: React.ReactNode } = {
    'UT': <RadioTower className="w-6 h-6 text-primary" />,
    'PAUT': <SlidersHorizontal className="w-6 h-6 text-primary" />,
    'MT': <Wrench className="w-6 h-6 text-primary" />,
    'Calibration': <Wrench className="w-6 h-6 text-primary" />,
    'APR': <RadioTower className="w-6 h-6 text-primary" />,
};

const checkInSchema = z.object({
  condition: z.enum(['Good', 'Damaged', 'Requires Calibration'], { required_error: "Please select the equipment's condition." }),
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
  serviceType: z.enum(['Calibration', 'Repair', 'Maintenance'], { required_error: "Please select a service type." }),
  vendor: z.string().min(2, "Vendor name is required."),
  serviceOrderNumber: z.string().optional(),
  expectedReturnDate: z.date().optional(),
  vendorContactPerson: z.string().optional(),
  vendorContactEmail: z.string().email({ message: "Please enter a valid email." }).optional().or(z.literal('')),
  notes: z.string().optional(),
});
type ServiceOutFormValues = z.infer<typeof serviceOutSchema>;


const CheckInOutForm = ({ 
    action, 
    onSubmit, 
    onCancel,
    jobsForCheckout,
 }: { 
    action: 'check-in' | 'check-out';
    onSubmit: (values: CheckInFormValues | CheckOutFormValues) => void;
    onCancel: () => void;
    jobsForCheckout: Job[];
}) => {
    const isCheckIn = action === 'check-in';
    const form = useForm({
        resolver: zodResolver(isCheckIn ? checkInSchema : checkOutSchema),
        defaultValues: isCheckIn 
            ? { condition: 'Good', hoursUsed: 0, notes: '' } 
            : { jobId: '', notes: '' },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
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

                <DialogFooter className="pt-4">
                    <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                    <Button type="submit">{isCheckIn ? 'Confirm Check-In' : 'Confirm Check-Out'}</Button>
                </DialogFooter>
            </form>
        </Form>
    );
};

const ServiceOutForm = ({
    onSubmit,
    onCancel,
}: {
    onSubmit: (values: ServiceOutFormValues) => void;
    onCancel: () => void;
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
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
                <DialogFooter className="pt-4">
                    <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                    <Button type="submit">Confirm Service Check-Out</Button>
                </DialogFooter>
            </form>
        </Form>
    );
};


const statusVariants: { [key in InspectorAsset['status']]: 'success' | 'default' | 'destructive' | 'outline' | 'secondary' } = {
    'Available': 'success',
    'In Use': 'default',
    'Calibration Due': 'destructive',
    'Out of Service': 'outline',
    'Under Service': 'secondary',
};


const EquipmentCard = ({ asset, onQrClick, constructUrl, onCheckOutClick, onCheckInClick, onServiceOutClick }: {
    asset: InspectorAsset,
    onQrClick: (data: {id: string, name: string}) => void,
    constructUrl: (base: string) => string,
    onCheckOutClick: (equipment: InspectorAsset) => void,
    onCheckInClick: (equipment: InspectorAsset) => void,
    onServiceOutClick: (equipment: InspectorAsset) => void,
}) => {
    const image = asset.imageId ? PlaceHolderImages.find(p => p.id === asset.imageId) : undefined;
    return (
        <Card key={asset.id} className="flex flex-col">
            <CardHeader className="p-0">
                <div className="relative h-48 w-full flex items-center justify-center bg-muted/20 rounded-t-lg">
                    {image ? (
                        <Image src={image.imageUrl} alt={image.description} fill className="object-cover rounded-t-lg" data-ai-hint={image.imageHint}/>
                    ) : (
                        cloneElement(equipmentIcons[asset.techniques[0] as keyof typeof equipmentIcons] || <Wrench className="text-primary"/>, { className: 'w-16 h-16 text-primary/50' })
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-4 flex-grow">
                 <div className="flex items-start justify-between">
                    <div className="flex flex-wrap gap-1">
                        {asset.techniques.map(tech => <Badge key={tech} variant="secondary">{tech}</Badge>)}
                    </div>
                    <Badge variant={statusVariants[asset.status]}>{asset.status}</Badge>
                </div>
                <CardTitle className="mt-2 font-semibold text-lg">{asset.name}</CardTitle>
                <CardDescription className="font-bold flex items-center gap-2">
                    {asset.id}
                    {asset.parentId && <Badge variant="outline" className="text-xs">Kit Component</Badge>}
                </CardDescription>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between items-center text-sm text-muted-foreground">
                <span>Cal Due: {asset.nextCalibration === 'N/A' ? 'N/A' : format(new Date(asset.nextCalibration), GLOBAL_DATE_FORMAT)}</span>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {asset.status === 'Available' ? (
                            <>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={() => onCheckOutClick(asset)}><LogOut className="mr-2 h-4 w-4"/>Check Out for Job</DropdownMenuItem>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={() => onServiceOutClick(asset)}><Send className="mr-2 h-4 w-4"/>Send for Service</DropdownMenuItem>
                            </>
                        ) : ( (asset.status === 'In Use' || asset.status === 'Under Service') && 
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={() => onCheckInClick(asset)}><LogIn className="mr-2 h-4 w-4"/>Check In</DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild><Link href={constructUrl(`/dashboard/equipment/${asset.id}`)}><Edit className="mr-2 h-4 w-4" /> View/Edit</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href={constructUrl(`/dashboard/equipment/${asset.id}`)}><History className="mr-2 h-4 w-4"/>View History</Link></DropdownMenuItem>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={() => onQrClick({ id: asset.id, name: asset.name })}>Show QR Code</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardFooter>
        </Card>
    );
};


export default function EquipmentPage() {
    const usersProviderId = 'provider-03';
    
    const [equipment, setEquipment] = useState<InspectorAsset[]>(() => initialEquipment.filter(e => e.providerId === usersProviderId));
    const [qrCodeData, setQrCodeData] = useState<{ id: string, name: string } | null>(null);
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const { setScanOpen } = useQRScanner();
    const { searchQuery } = useSearch();
    const [statusFilter, setStatusFilter] = useState('all');
    
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

    const jobsForCheckout = useMemo(() => jobs.filter(j => j.providerId === usersProviderId && ['Assigned', 'Scheduled', 'In Progress'].includes(j.status)), [usersProviderId]);

     const handleCheckOutClick = (equipment: InspectorAsset) => {
        setTimeout(() => {
            setTransactionState({ action: 'check-out', equipment });
        }, 50);
    };

    const handleCheckInClick = (equipment: InspectorAsset) => {
        setTimeout(() => {
            setTransactionState({ action: 'check-in', equipment });
        }, 50);
    };
    
    const handleServiceOutClick = (equipment: InspectorAsset) => {
        setTimeout(() => {
            setTransactionState({ action: 'service-out', equipment });
        }, 50);
    };
    
    const handleQrClick = (data: { id: string, name: string }) => {
        setTimeout(() => {
            setQrCodeData(data);
        }, 50);
    }

    const handleTransactionSubmit = (values: CheckInFormValues | CheckOutFormValues | ServiceOutFormValues) => {
        const { action, equipment } = transactionState;
        
        closeTransactionDialog();

        setTimeout(() => {
            if (!equipment || !action) return;

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
                const jobTitle = jobs.find(j => j.id === formValues.jobId)?.title || formValues.jobId;
                notes = [`Job: ${jobTitle}`, formValues.notes].filter(Boolean).join('. ');
                newStatus = 'In Use';
                historyEvent = 'Checked Out';
            } else { // service-out
                 const formValues = values as ServiceOutFormValues;
                notes = [`Service: ${formValues.serviceType} with ${formValues.vendor}`, formValues.serviceOrderNumber && `SO#: ${formValues.serviceOrderNumber}`, formValues.expectedReturnDate && `Expected Return: ${format(formValues.expectedReturnDate, GLOBAL_DATE_FORMAT)}`, formValues.vendorContactPerson, formValues.notes].filter(Boolean).join('. ');
                newStatus = 'Under Service';
                historyEvent = 'Checked Out for Service';
            }

            const newHistoryEntry: EquipmentHistory = { event: historyEvent!, user: 'Jane Smith', timestamp: new Date().toISOString(), notes: notes };
            setEquipment(prev => prev.map(eq => eq.id === equipment.id ? { ...eq, status: newStatus, history: [newHistoryEntry, ...(eq.history || [])] } : eq));
            toast({ title: `Equipment ${action === 'check-in' ? 'Checked In' : 'Checked Out'}`, description: `${equipment.name} status has been updated to '${newStatus}'.`});
        }, 50);
    };

    const isTransactionDialogOpen = transactionState.action !== null;
    const closeTransactionDialog = () => setTransactionState({ action: null, equipment: null });

    const transactionDialogTitle = {
        'check-in': 'Check In Equipment',
        'check-out': 'Check Out for Job',
        'service-out': 'Check Out for Service',
    }[transactionState.action || ''] || '';
    
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
                    <Button asChild><Link href={constructUrl('/dashboard/equipment/add')}>Add New Equipment</Link></Button>
                </div>
            </div>
            
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

             <Dialog open={isTransactionDialogOpen} onOpenChange={closeTransactionDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{transactionDialogTitle}</DialogTitle>
                        <DialogDescription>Record details for {transactionState.equipment?.name}.</DialogDescription>
                    </DialogHeader>
                    {transactionState.action === 'check-in' && (
                         <CheckInOutForm
                            action="check-in"
                            onSubmit={handleTransactionSubmit}
                            onCancel={closeTransactionDialog}
                            jobsForCheckout={jobsForCheckout}
                        />
                    )}
                     {transactionState.action === 'check-out' && (
                         <CheckInOutForm
                            action="check-out"
                            onSubmit={handleTransactionSubmit}
                            onCancel={closeTransactionDialog}
                            jobsForCheckout={jobsForCheckout}
                        />
                    )}
                     {transactionState.action === 'service-out' && (
                        <ServiceOutForm 
                            onSubmit={handleTransactionSubmit}
                            onCancel={closeTransactionDialog}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

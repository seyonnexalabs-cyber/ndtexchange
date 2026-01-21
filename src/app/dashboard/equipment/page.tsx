

'use client';
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { inspectorAssets as initialEquipment, jobs, InspectorAsset, EquipmentHistory, Job } from "@/lib/placeholder-data";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, SlidersHorizontal, RadioTower, QrCode, Wrench, Calendar as CalendarIcon, Printer, LogIn, LogOut, Edit, History, Send } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn, GLOBAL_DATE_FORMAT, GLOBAL_DATETIME_FORMAT } from "@/lib/utils";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Textarea } from "@/components/ui/textarea";


const equipmentIcons = {
    'UTM-1000': <RadioTower className="w-6 h-6 text-muted-foreground" />,
    'PA-Probe-5MHz': <SlidersHorizontal className="w-6 h-6 text-muted-foreground" />,
    'CAL-BLK-01': <Wrench className="w-6 h-6 text-muted-foreground" />,
    'YOKE-02': <Wrench className="w-6 h-6 text-muted-foreground" />,
};

const equipmentSchema = z.object({
  id: z.string().min(2, "ID is required."),
  name: z.string().min(2, "Name must be at least 2 characters."),
  type: z.string().min(2, "Type must be at least 2 characters."),
  status: z.enum(['Available', 'In Use', 'Calibration Due', 'Out of Service', 'Under Service']),
  nextCalibration: z.date(),
});

type EquipmentFormValues = z.infer<typeof equipmentSchema>;

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


const EquipmentForm = ({ onSubmit, defaultValues, onCancel }: { onSubmit: (values: EquipmentFormValues) => void, defaultValues?: Partial<EquipmentFormValues>, onCancel: () => void }) => {
    const form = useForm<EquipmentFormValues>({
        resolver: zodResolver(equipmentSchema),
        defaultValues: {
            id: '',
            name: "",
            type: "",
            status: "Available",
            ...defaultValues,
            nextCalibration: defaultValues?.nextCalibration || new Date(),
        }
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Equipment ID</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., UTM-1001" {...field} disabled={!!defaultValues?.id}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Equipment Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Olympus 45MG" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Equipment Type</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., UT Equipment" {...field} />
                            </FormControl>
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
                            <SelectTrigger>
                                <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Available">Available</SelectItem>
                                <SelectItem value="In Use">In Use</SelectItem>
                                <SelectItem value="Calibration Due">Calibration Due</SelectItem>
                                <SelectItem value="Out of Service">Out of Service</SelectItem>
                                <SelectItem value="Under Service">Under Service</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="nextCalibration"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Next Calibration Date</FormLabel>
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
                                    format(field.value, GLOBAL_DATE_FORMAT)
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
                    <Button type="submit">Save Changes</Button>
                </DialogFooter>
            </form>
        </Form>
    );
};


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
                                    format(field.value, GLOBAL_DATE_FORMAT)
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
                                    date < new Date(new Date().setHours(0,0,0,0))
                                }
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
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


const DesktopView = ({ equipment, onEditClick, onQrClick, onCheckOutClick, onCheckInClick, onServiceOutClick, constructUrl }: { 
    equipment: InspectorAsset[], 
    onEditClick: (equipment: InspectorAsset) => void, 
    onQrClick: (data: {id: string, name: string}) => void,
    onCheckOutClick: (equipment: InspectorAsset) => void,
    onCheckInClick: (equipment: InspectorAsset) => void,
    onServiceOutClick: (equipment: InspectorAsset) => void,
    constructUrl: (base: string) => string;
}) => (
    <Card>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next Calibration</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {equipment.map(asset => (
                    <TableRow key={asset.id}>
                        <TableCell className="font-mono text-xs">{asset.id}</TableCell>
                        <TableCell className="font-medium flex items-center gap-3">
                            {equipmentIcons[asset.id as keyof typeof equipmentIcons] || <Wrench className="w-5 h-5 text-muted-foreground" />}
                            {asset.name}
                        </TableCell>
                        <TableCell>{asset.type}</TableCell>
                        <TableCell>
                            <Badge variant={statusVariants[asset.status]}>{asset.status}</Badge>
                        </TableCell>
                        <TableCell>{asset.nextCalibration === 'N/A' ? 'N/A' : format(new Date(asset.nextCalibration), GLOBAL_DATE_FORMAT)}</TableCell>
                        <TableCell className="text-right">
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
                                    
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={() => onEditClick(asset)}><Edit className="mr-2" /> Edit</DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href={constructUrl(`/dashboard/equipment/${asset.id}`)}><History className="mr-2"/>View History</Link></DropdownMenuItem>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={() => onQrClick({ id: asset.id, name: asset.name })}>Show QR Code</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </Card>
);

const MobileView = ({ equipment, onEditClick, onQrClick, onCheckOutClick, onCheckInClick, onServiceOutClick, constructUrl }: { 
    equipment: InspectorAsset[], 
    onEditClick: (equipment: InspectorAsset) => void, 
    onQrClick: (data: {id: string, name: string}) => void,
    onCheckOutClick: (equipment: InspectorAsset) => void,
    onCheckInClick: (equipment: InspectorAsset) => void,
    onServiceOutClick: (equipment: InspectorAsset) => void,
    constructUrl: (base: string) => string;
}) => (
     <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {equipment.map(asset => (
            <Card key={asset.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-semibold">{asset.name}</CardTitle>
                    {equipmentIcons[asset.id as keyof typeof equipmentIcons] || <Wrench className="w-6 h-6 text-muted-foreground" />}
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{asset.type}</p>
                     <p className="text-xs font-mono text-muted-foreground">{asset.id}</p>
                    <Badge variant={statusVariants[asset.status]} className="mt-2">{asset.status}</Badge>
                </CardContent>
                <CardFooter className="flex justify-between items-center text-sm text-muted-foreground">
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

                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={() => onEditClick(asset)}><Edit className="mr-2"/> Edit</DropdownMenuItem>
                            <DropdownMenuItem asChild><Link href={constructUrl(`/dashboard/equipment/${asset.id}`)}><History className="mr-2"/>View History</Link></DropdownMenuItem>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={() => onQrClick({ id: asset.id, name: asset.name })}>Show QR Code</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardFooter>
            </Card>
        ))}
    </div>
);


export default function EquipmentPage() {
    const [equipment, setEquipment] = useState<InspectorAsset[]>(initialEquipment);
    const [qrCodeData, setQrCodeData] = useState<{ id: string, name: string } | null>(null);
    const [dialogState, setDialogState] = useState<'closed' | 'add' | 'edit'>('closed');
    const [editingEquipment, setEditingEquipment] = useState<Partial<InspectorAsset> | undefined>(undefined);
    const isMobile = useIsMobile();
    const { toast } = useToast();
    const searchParams = useSearchParams();
    
    const [searchQuery, setSearchQuery] = useState('');
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

    const jobsForCheckout = useMemo(() => jobs.filter(j => ['Assigned', 'Scheduled', 'In Progress'].includes(j.status)), []);

    const handleEditClick = (equipment: InspectorAsset) => {
        setEditingEquipment(equipment);
        setDialogState('edit');
    };

    const handleAddClick = () => {
        setEditingEquipment(undefined);
        setDialogState('add');
    };

    const handleFormSubmit = (values: EquipmentFormValues) => {
        const historyEntry = {
            event: dialogState === 'add' ? 'Created' : 'Updated',
            user: 'Jane Smith', // In a real app, this would be the current user
            timestamp: new Date().toISOString(),
            notes: dialogState === 'add' ? 'Item created in inventory.' : 'Item details updated.'
        };

        if(dialogState === 'add') {
             toast({
                title: "Equipment Added",
                description: `${values.name} has been added to your inventory.`,
            });
            const newEquipment: InspectorAsset = {
                ...values,
                nextCalibration: format(values.nextCalibration, 'yyyy-MM-dd'),
                history: [historyEntry],
            };
            setEquipment(prev => [newEquipment, ...prev]);
        } else {
            toast({
                title: "Equipment Updated",
                description: `${values.name} has been successfully updated.`,
            });
            setEquipment(prev => prev.map(eq => eq.id === values.id ? {
                ...values,
                 nextCalibration: format(values.nextCalibration, 'yyyy-MM-dd'),
                 history: [historyEntry, ...(eq.history || [])],
            } : eq));
        }
        setDialogState('closed');
    };

     const handleCheckOutClick = (equipment: InspectorAsset) => {
        setTransactionState({ action: 'check-out', equipment });
    };

    const handleCheckInClick = (equipment: InspectorAsset) => {
        setTransactionState({ action: 'check-in', equipment });
    };
    
    const handleServiceOutClick = (equipment: InspectorAsset) => {
        setTransactionState({ action: 'service-out', equipment });
    };

    const handleTransactionSubmit = (values: CheckInFormValues | CheckOutFormValues | ServiceOutFormValues) => {
        const { action, equipment } = transactionState;
        if (!equipment || !action) return;

        let notes = '';
        let newStatus: InspectorAsset['status'] = equipment.status;
        let historyEvent: EquipmentHistory['event'];

        if (action === 'check-in') {
            const formValues = values as CheckInFormValues;
            notes = [
                formValues.notes,
                `Condition: ${formValues.condition}`,
                formValues.hoursUsed !== undefined && `Hours Used: ${formValues.hoursUsed}`
            ].filter(Boolean).join('. ');

            switch (formValues.condition) {
                case 'Damaged':
                    newStatus = 'Out of Service';
                    break;
                case 'Requires Calibration':
                    newStatus = 'Calibration Due';
                    break;
                default:
                    newStatus = 'Available';
                    break;
            }
            historyEvent = 'Checked In';

        } else if (action === 'check-out') {
            const formValues = values as CheckOutFormValues;
            const jobTitle = jobs.find(j => j.id === formValues.jobId)?.title || formValues.jobId;
            notes = [
                formValues.notes,
                `Job: ${jobTitle}`
            ].filter(Boolean).join('. ');
            newStatus = 'In Use';
            historyEvent = 'Checked Out';
        } else { // service-out
             const formValues = values as ServiceOutFormValues;
            notes = [
                `Service: ${formValues.serviceType} with ${formValues.vendor}`,
                formValues.serviceOrderNumber && `SO#: ${formValues.serviceOrderNumber}`,
                formValues.expectedReturnDate && `Expected Return: ${format(formValues.expectedReturnDate, GLOBAL_DATE_FORMAT)}`,
                formValues.vendorContactPerson && `Contact: ${formValues.vendorContactPerson}${formValues.vendorContactEmail ? ` (${formValues.vendorContactEmail})` : ''}`,
                formValues.notes,
            ].filter(Boolean).join('. ');
            newStatus = 'Under Service';
            historyEvent = 'Checked Out for Service';
        }


        const newHistoryEntry: EquipmentHistory = {
            event: historyEvent!,
            user: 'Jane Smith',
            timestamp: new Date().toISOString(),
            notes: notes,
        };

        // Close the dialog immediately to prevent focus issues.
        setTransactionState({ action: null, equipment: null });

        // Defer the state update that causes the main page re-render.
        setTimeout(() => {
            setEquipment(prev => prev.map(eq =>
                eq.id === equipment.id
                    ? { ...eq, status: newStatus, history: [newHistoryEntry, ...(eq.history || [])] }
                    : eq
            ));

            toast({
                title: `Equipment ${action === 'check-in' ? 'Checked In' : 'Checked Out'}`,
                description: `${equipment.name} status has been updated to '${newStatus}'.`,
            });
        }, 50);
    };

    const isAddEditDialogOpen = dialogState !== 'closed';
    const closeAddEditDialog = () => setDialogState('closed');
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
                    <Wrench/>
                    Equipment
                </h1>
                 <Button onClick={handleAddClick}>Add New Equipment</Button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Input
                    placeholder="Search by name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-grow"
                />
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
                     <Button variant="outline">
                        <QrCode className="mr-2 h-4 w-4"/>
                        Scan QR
                    </Button>
                </div>
            </div>

            {filteredEquipment.length > 0 ? (
                isMobile ? 
                    <MobileView 
                        equipment={filteredEquipment} 
                        onEditClick={handleEditClick} 
                        onQrClick={setQrCodeData}
                        onCheckInClick={handleCheckInClick}
                        onCheckOutClick={handleCheckOutClick}
                        onServiceOutClick={handleServiceOutClick}
                        constructUrl={constructUrl}
                    /> : 
                    <DesktopView 
                        equipment={filteredEquipment} 
                        onEditClick={handleEditClick} 
                        onQrClick={setQrCodeData}
                        onCheckInClick={handleCheckInClick}
                        onCheckOutClick={handleCheckOutClick}
                        onServiceOutClick={handleServiceOutClick}
                        constructUrl={constructUrl}
                    />
            ) : (
                <div className="text-center p-10 border rounded-lg">
                    <Wrench className="mx-auto h-12 w-12 text-muted-foreground" />
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
                                        <p className="font-mono text-muted-foreground">{qrCodeData.id}</p>
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

            <Dialog open={isAddEditDialogOpen} onOpenChange={(open) => {if(!open) closeAddEditDialog()}}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{dialogState === 'add' ? 'Add New Equipment' : `Edit ${editingEquipment?.name}`}</DialogTitle>
                        <DialogDescription>
                             {dialogState === 'add' ? 'Enter the details for the new piece of equipment.' : 'Update the details for this piece of equipment.'}
                        </DialogDescription>
                    </DialogHeader>
                   <EquipmentForm 
                        onSubmit={handleFormSubmit}
                        onCancel={closeAddEditDialog}
                        defaultValues={dialogState === 'edit' ? {
                            ...editingEquipment,
                            nextCalibration: editingEquipment?.nextCalibration === 'N/A' ? new Date() : new Date(editingEquipment!.nextCalibration!)
                        } : undefined}
                   />
                </DialogContent>
            </Dialog>

             <Dialog open={isTransactionDialogOpen} onOpenChange={(open) => {if(!open) closeTransactionDialog()}}>
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

    
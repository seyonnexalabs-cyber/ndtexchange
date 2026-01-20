
'use client';
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { inspectorAssets, InspectorAsset } from "@/lib/placeholder-data";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, SlidersHorizontal, RadioTower, QrCode, Wrench, Calendar as CalendarIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn, GLOBAL_DATE_FORMAT } from "@/lib/utils";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

const equipmentIcons = {
    'UTM-1000': <RadioTower className="w-6 h-6 text-muted-foreground" />,
    'PA-Probe-5MHz': <SlidersHorizontal className="w-6 h-6 text-muted-foreground" />,
};

const equipmentSchema = z.object({
  id: z.string().min(2, "ID is required."),
  name: z.string().min(2, "Name must be at least 2 characters."),
  type: z.string().min(2, "Type must be at least 2 characters."),
  status: z.enum(['Calibrated', 'Calibration Due', 'In Service']),
  nextCalibration: z.date(),
});

type EquipmentFormValues = z.infer<typeof equipmentSchema>;

const EquipmentForm = ({ onSubmit, defaultValues, onCancel }: { onSubmit: (values: EquipmentFormValues) => void, defaultValues?: Partial<EquipmentFormValues>, onCancel: () => void }) => {
    const form = useForm<EquipmentFormValues>({
        resolver: zodResolver(equipmentSchema),
        defaultValues: {
            id: '',
            name: "",
            type: "",
            status: "In Service",
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
                                <SelectItem value="Calibrated">Calibrated</SelectItem>
                                <SelectItem value="Calibration Due">Calibration Due</SelectItem>
                                <SelectItem value="In Service">In Service</SelectItem>
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


const DesktopView = ({ onEditClick, onQrClick }: { onEditClick: (equipment: InspectorAsset) => void, onQrClick: (data: {id: string, name: string}) => void }) => (
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
                {inspectorAssets.map(asset => (
                    <TableRow key={asset.id}>
                        <TableCell className="font-mono text-xs">{asset.id}</TableCell>
                        <TableCell className="font-medium flex items-center gap-3">
                            {equipmentIcons[asset.id as keyof typeof equipmentIcons] || <Wrench className="w-5 h-5 text-muted-foreground" />}
                            {asset.name}
                        </TableCell>
                        <TableCell>{asset.type}</TableCell>
                        <TableCell>
                            <Badge variant={asset.status === 'Calibrated' ? 'success' : asset.status === 'In Service' ? 'default' : 'destructive'}>{asset.status}</Badge>
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
                                    <DropdownMenuItem onClick={() => onQrClick({ id: asset.id, name: asset.name })}>Show QR Code</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onEditClick(asset)}>Edit</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </Card>
);

const MobileView = ({ onEditClick, onQrClick }: { onEditClick: (equipment: InspectorAsset) => void, onQrClick: (data: {id: string, name: string}) => void }) => (
     <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {inspectorAssets.map(asset => (
            <Card key={asset.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-semibold">{asset.name}</CardTitle>
                    {equipmentIcons[asset.id as keyof typeof equipmentIcons] || <Wrench className="w-6 h-6 text-muted-foreground" />}
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{asset.type}</p>
                     <p className="text-xs font-mono text-muted-foreground">{asset.id}</p>
                    <Badge variant={asset.status === 'Calibrated' ? 'success' : 'default'} className="mt-2">{asset.status}</Badge>
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
                            <DropdownMenuItem onClick={() => onQrClick({ id: asset.id, name: asset.name })}>Show QR Code</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEditClick(asset)}>Edit</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardFooter>
            </Card>
        ))}
    </div>
);


export default function EquipmentPage() {
    const [qrCodeData, setQrCodeData] = useState<{ id: string, name: string } | null>(null);
    const [dialogState, setDialogState] = useState<'closed' | 'add' | 'edit'>('closed');
    const [editingEquipment, setEditingEquipment] = useState<Partial<InspectorAsset> | undefined>(undefined);
    const isMobile = useIsMobile();
    const { toast } = useToast();

    const handleEditClick = (equipment: InspectorAsset) => {
        setEditingEquipment(equipment);
        setDialogState('edit');
    };

    const handleAddClick = () => {
        setEditingEquipment(undefined);
        setDialogState('add');
    };

    const handleFormSubmit = (values: EquipmentFormValues) => {
        if(dialogState === 'add') {
             toast({
                title: "Equipment Added",
                description: `${values.name} has been added to your inventory.`,
            });
            console.log("New Equipment Data:", values);
        } else {
            toast({
                title: "Equipment Updated",
                description: `${values.name} has been successfully updated.`,
            });
            console.log("Updated Equipment Data:", values);
        }
        setDialogState('closed');
    };
    
    const isDialogOpen = dialogState !== 'closed';
    const closeDialog = () => setDialogState('closed');

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <Wrench/>
                    Equipment
                </h1>
                 <div className="flex gap-2">
                     <Button variant="outline">
                        <QrCode className="mr-2 h-4 w-4"/>
                        Scan QR
                    </Button>
                    <Button onClick={handleAddClick}>Add New Equipment</Button>
                </div>
            </div>
            
            {isMobile ? 
                <MobileView onEditClick={handleEditClick} onQrClick={setQrCodeData} /> : 
                <DesktopView onEditClick={handleEditClick} onQrClick={setQrCodeData} />
            }

             <Dialog open={!!qrCodeData} onOpenChange={(open) => {if (!open) {setQrCodeData(null)}}}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>QR Code for {qrCodeData?.name}</DialogTitle>
                        <DialogDescription>
                           Scan this code to quickly access equipment details for ID: {qrCodeData?.id}
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

            <Dialog open={isDialogOpen} onOpenChange={(open) => {if(!open) closeDialog()}}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{dialogState === 'add' ? 'Add New Equipment' : `Edit ${editingEquipment?.name}`}</DialogTitle>
                        <DialogDescription>
                             {dialogState === 'add' ? 'Enter the details for the new piece of equipment.' : 'Update the details for this piece of equipment.'}
                        </DialogDescription>
                    </DialogHeader>
                   <EquipmentForm 
                        onSubmit={handleFormSubmit}
                        onCancel={closeDialog}
                        defaultValues={dialogState === 'edit' ? {
                            ...editingEquipment,
                            nextCalibration: editingEquipment?.nextCalibration === 'N/A' ? new Date() : new Date(editingEquipment!.nextCalibration!)
                        } : undefined}
                   />
                </DialogContent>
            </Dialog>
        </div>
    );
}

    


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
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const equipmentIcons = {
    'UTM-1000': <RadioTower className="w-6 h-6 text-muted-foreground" />,
    'PA-Probe-5MHz': <SlidersHorizontal className="w-6 h-6 text-muted-foreground" />,
};

const equipmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  type: z.enum(['UT Equipment', 'PAUT Probe', 'Calibration Block', 'Yoke']),
  status: z.enum(['Calibrated', 'Calibration Due', 'In Service']),
  nextCalibration: z.date(),
});

const DesktopView = ({ onEditClick, onQrClick }: { onEditClick: (equipment: InspectorAsset) => void, onQrClick: (data: {id: string, name: string}) => void }) => (
    <Card>
        <Table>
            <TableHeader>
                <TableRow>
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
                        <TableCell className="font-medium flex items-center gap-3">
                            {equipmentIcons[asset.id as keyof typeof equipmentIcons] || <Wrench className="w-5 h-5 text-muted-foreground" />}
                            {asset.name}
                        </TableCell>
                        <TableCell>{asset.type}</TableCell>
                        <TableCell>
                            <Badge variant={asset.status === 'Calibrated' ? 'default' : asset.status === 'In Service' ? 'secondary' : 'destructive'}>{asset.status}</Badge>
                        </TableCell>
                        <TableCell>{asset.nextCalibration}</TableCell>
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
                    <Badge variant={asset.status === 'Calibrated' ? 'default' : 'secondary'} className="mt-2">{asset.status}</Badge>
                </CardContent>
                <CardFooter className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Cal Due: {asset.nextCalibration}</span>
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
    const [editingEquipment, setEditingEquipment] = useState<InspectorAsset | null>(null);
    const isMobile = useIsMobile();

    const form = useForm<z.infer<typeof equipmentSchema>>({
        resolver: zodResolver(equipmentSchema),
        defaultValues: {
            name: "",
            type: "UT Equipment",
            status: "In Service",
            nextCalibration: new Date(),
        }
    });

    const handleEditClick = (equipment: InspectorAsset) => {
        setEditingEquipment(equipment);
        form.reset({
            name: equipment.name,
            type: equipment.type,
            status: equipment.status,
            nextCalibration: equipment.nextCalibration === 'N/A' ? new Date() : new Date(equipment.nextCalibration),
        });
    };

    function onSubmit(values: z.infer<typeof equipmentSchema>) {
        console.log("Updated Equipment Data:", values);
        // Here you would typically call an API to update the data
        // For this demo, we'll just log it and close the dialog
        setEditingEquipment(null);
    }

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
                    <Button>Add New Equipment</Button>
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
                           Scan this code to quickly access equipment details.
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

            <Dialog open={!!editingEquipment} onOpenChange={(open) => {if(!open) {setEditingEquipment(null)}}}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit {editingEquipment?.name}</DialogTitle>
                        <DialogDescription>
                            Update the details for this piece of equipment.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Equipment Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Olympus 45MG" {...field} />
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
                                    <FormLabel>Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select an equipment type" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="UT Equipment">UT Equipment</SelectItem>
                                            <SelectItem value="PAUT Probe">PAUT Probe</SelectItem>
                                            <SelectItem value="Calibration Block">Calibration Block</SelectItem>
                                            <SelectItem value="Yoke">Yoke</SelectItem>
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
                                <Button type="button" variant="ghost" onClick={() => setEditingEquipment(null)}>Cancel</Button>
                                <Button type="submit">Save Changes</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

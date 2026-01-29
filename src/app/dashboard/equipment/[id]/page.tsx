
'use client';
import * as React from 'react';
import { useMemo, useState } from "react";
import { notFound, useSearchParams, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { inspectorAssets as allEquipment, InspectorAsset, EquipmentHistory, Job, NDTTechniques } from "@/lib/placeholder-data";
import { ChevronLeft, Wrench, Calendar, Info, History, Clock, Send, Building, SlidersHorizontal, Tag, ChevronsUpDown, Edit, Calendar as CalendarIcon, Printer } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { cn, GLOBAL_DATE_FORMAT, GLOBAL_DATETIME_FORMAT } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from '@/components/ui/textarea';

const equipmentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters."),
  techniques: z.array(z.string()).min(1, "At least one technique is required."),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  status: z.enum(['Available', 'In Use', 'Calibration Due', 'Out of Service', 'Under Service']),
  nextCalibration: z.date(),
});

type EquipmentFormValues = z.infer<typeof equipmentSchema>;

const EquipmentForm = ({ onSubmit, defaultValues, onCancel }: { onSubmit: (values: EquipmentFormValues) => void, defaultValues?: Partial<EquipmentFormValues>, onCancel: () => void }) => {
    const form = useForm<EquipmentFormValues>({
        resolver: zodResolver(equipmentSchema),
        defaultValues: {
            name: "",
            techniques: [],
            manufacturer: "",
            model: "",
            serialNumber: "",
            status: "Available",
            ...defaultValues,
            nextCalibration: defaultValues?.nextCalibration ? new Date(defaultValues.nextCalibration) : new Date(),
        }
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {defaultValues?.id && (
                    <FormField
                        control={form.control}
                        name="id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Equipment ID</FormLabel>
                                <FormControl>
                                    <Input {...field} readOnly className="bg-muted cursor-not-allowed font-mono" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
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
                    name="techniques"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Technique(s)</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                        "w-full justify-between",
                                        !field.value?.length && "text-muted-foreground"
                                    )}
                                    >
                                    {field.value?.length > 0
                                        ? `${field.value.length} selected`
                                        : "Select techniques"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                    <ScrollArea className="h-48">
                                    <div className="p-2">
                                        {NDTTechniques.map((tech) => (
                                        <div
                                            key={tech.id}
                                            className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md"
                                        >
                                            <Checkbox
                                            id={`tech-${tech.id}`}
                                            checked={field.value?.includes(tech.id)}
                                            onCheckedChange={(checked) => {
                                                return checked
                                                ? field.onChange([...(field.value || []), tech.id])
                                                : field.onChange(
                                                    field.value?.filter(
                                                        (value) => value !== tech.id
                                                    )
                                                    );
                                            }}
                                            />
                                            <label
                                            htmlFor={`tech-${tech.id}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 w-full"
                                            >
                                            {tech.name} ({tech.id})
                                            </label>
                                        </div>
                                        ))}
                                    </div>
                                    </ScrollArea>
                                </PopoverContent>
                            </Popover>
                            <FormDescription>
                                Select all applicable NDT methods for this equipment.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="manufacturer"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Manufacturer (Optional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Olympus" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="model"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Model (Optional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., 45MG" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                 <FormField
                    control={form.control}
                    name="serialNumber"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Serial Number (Optional)</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., SN-12345" {...field} />
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
                            <CalendarComponent
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

const statusVariants: { [key in InspectorAsset['status']]: 'success' | 'default' | 'destructive' | 'outline' | 'secondary' } = {
    'Available': 'success',
    'In Use': 'default',
    'Calibration Due': 'destructive',
    'Out of Service': 'outline',
    'Under Service': 'secondary'
};

const historyEventIcons = {
    'Created': <Info className="h-4 w-4" />,
    'Updated': <Info className="h-4 w-4" />,
    'Checked Out': <Clock className="h-4 w-4" />,
    'Checked In': <Clock className="h-4 w-4" />,
    'Set to Available': <Info className="h-4 w-4" />,
    'Set to Calibration Due': <Info className="h-4 w-4" />,
    'Set to Out of Service': <Info className="h-4 w-4" />,
    'Checked Out for Service': <Send className="h-4 w-4" />,
}


export default function EquipmentDetailPage() {
    const params = useParams();
    const { id } = params;
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);

    // In a real app, you would fetch this data. Here we find it in the placeholder data.
    // Note: This won't reflect the state changes from the parent page without a proper state management solution.
    const equipment = useMemo(() => allEquipment.find(p => p.id === id), [id]);

    if (!equipment) {
        notFound();
    }

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const handleFormSubmit = (values: EquipmentFormValues) => {
        console.log("Updated Equipment:", { ...equipment, ...values });
        toast({
            title: "Equipment Updated",
            description: `${equipment.name} has been updated.`,
        });
        setIsFormOpen(false);
        router.refresh();
    };

    return (
        <div>
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <Button asChild variant="outline" size="sm" className="mb-4 sm:mb-0">
                    <Link href={constructUrl("/dashboard/equipment")}>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Equipment
                    </Link>
                </Button>
                <div className="flex gap-2">
                    <Button onClick={() => setIsFormOpen(true)}><Edit className="mr-2 h-4 w-4" />Edit</Button>
                    <Button variant="outline"><Printer className="mr-2 h-4 w-4" />Print QR Code</Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 font-headline">
                                <Wrench className="h-6 w-6 text-primary" />
                                {equipment.name}
                            </CardTitle>
                            <CardDescription>ID: <span className="font-mono font-semibold text-foreground">{equipment.id}</span></CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex items-start">
                                <Info className="w-4 h-4 mr-3 mt-1 text-muted-foreground"/>
                                <div>
                                    <p className="font-semibold">Status</p>
                                    <Badge variant={statusVariants[equipment.status]}>{equipment.status}</Badge>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <SlidersHorizontal className="w-4 h-4 mr-3 mt-1 text-muted-foreground"/>
                                <div>
                                    <p className="font-semibold">Technique(s)</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {equipment.techniques.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
                                    </div>
                                </div>
                            </div>
                             {equipment.manufacturer && (
                                <div className="flex items-start">
                                    <Building className="w-4 h-4 mr-3 mt-1 text-muted-foreground"/>
                                    <div>
                                        <p className="font-semibold">Manufacturer</p>
                                        <p className="text-muted-foreground">{equipment.manufacturer}</p>
                                    </div>
                                </div>
                            )}
                            {equipment.model && (
                                <div className="flex items-start">
                                    <Wrench className="w-4 h-4 mr-3 mt-1 text-muted-foreground"/>
                                    <div>
                                        <p className="font-semibold">Model</p>
                                        <p className="text-muted-foreground">{equipment.model}</p>
                                    </div>
                                </div>
                            )}
                             {equipment.serialNumber && (
                                <div className="flex items-start">
                                    <Tag className="w-4 h-4 mr-3 mt-1 text-muted-foreground"/>
                                    <div>
                                        <p className="font-semibold">Serial Number</p>
                                        <p className="font-mono text-muted-foreground">{equipment.serialNumber}</p>
                                    </div>
                                </div>
                            )}
                             <div className="flex items-start">
                                <Calendar className="w-4 h-4 mr-3 mt-1 text-muted-foreground"/>
                                <div>
                                    <p className="font-semibold">Next Calibration</p>
                                    <p className="text-muted-foreground">{equipment.nextCalibration === 'N/A' ? 'N/A' : format(new Date(equipment.nextCalibration), GLOBAL_DATE_FORMAT)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><History /> Equipment Ledger</CardTitle>
                            <CardDescription>A complete log of all check-in, check-out, and status changes for this item.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <ScrollArea className="h-96">
                                <div className="relative pl-6">
                                     {/* Vertical line */}
                                    <div className="absolute left-6 top-0 h-full w-0.5 bg-border -translate-x-1/2" />
                                    {equipment.history && equipment.history.length > 0 ? (
                                        equipment.history.map((entry, index) => (
                                            <div key={index} className="relative mb-8 pl-8">
                                                <div className="absolute -left-3 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background border-2 border-primary">
                                                    <div className="text-primary">{historyEventIcons[entry.event]}</div>
                                                </div>
                                                <p className="text-sm font-medium">{entry.event}</p>
                                                <p className="text-xs text-muted-foreground">{entry.user} - {format(parseISO(entry.timestamp), GLOBAL_DATETIME_FORMAT)}</p>
                                                {entry.notes && <p className="mt-1 text-xs italic text-muted-foreground">"{entry.notes}"</p>}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center text-muted-foreground py-10">
                                            No history found for this item.
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </div>
             <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Equipment: {equipment.name}</DialogTitle>
                        <DialogDescription>
                            Update the equipment's details below.
                        </DialogDescription>
                    </DialogHeader>
                    <EquipmentForm
                        onSubmit={handleFormSubmit}
                        onCancel={() => setIsFormOpen(false)}
                        defaultValues={{
                            id: equipment.id,
                            name: equipment.name,
                            techniques: equipment.techniques,
                            manufacturer: equipment.manufacturer,
                            model: equipment.model,
                            serialNumber: equipment.serialNumber,
                            status: equipment.status,
                            nextCalibration: new Date(equipment.nextCalibration),
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}

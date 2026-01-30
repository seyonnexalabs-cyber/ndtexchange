
'use client';
import * as React from 'react';
import { useMemo, useState } from "react";
import { notFound, useSearchParams, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { inspectorAssets as allEquipment, InspectorAsset, EquipmentHistory, NDTTechniques } from "@/lib/placeholder-data";
import { ChevronLeft, Wrench, Calendar, Info, History, Clock, Send, Building, SlidersHorizontal, Tag, ChevronsUpDown, Edit, Printer } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { cn, GLOBAL_DATE_FORMAT, GLOBAL_DATETIME_FORMAT } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CustomDateInput } from '@/components/ui/custom-date-input';


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

const EquipmentForm = ({ equipment, onSubmit, onCancel }: { equipment: InspectorAsset, onSubmit: (values: EquipmentFormValues) => void, onCancel: () => void }) => {
    const form = useForm<EquipmentFormValues>({
        resolver: zodResolver(equipmentSchema),
        defaultValues: {
            ...equipment,
            nextCalibration: equipment.nextCalibration !== 'N/A' ? new Date(equipment.nextCalibration) : new Date(),
        }
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Editing: {equipment.name}</CardTitle>
                <CardDescription>Make changes to the equipment details below.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
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
                                            <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value?.length && "text-muted-foreground")}>
                                            {field.value?.length > 0 ? `${field.value.length} selected` : "Select techniques"}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                            <ScrollArea className="h-48"><div className="p-2">
                                                {NDTTechniques.map((tech) => (
                                                <div key={tech.id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md">
                                                    <Checkbox id={`tech-${tech.id}`} checked={field.value?.includes(tech.id)} onCheckedChange={(checked) => {
                                                        return checked ? field.onChange([...(field.value || []), tech.id]) : field.onChange(field.value?.filter((value) => value !== tech.id));
                                                    }}/>
                                                    <label htmlFor={`tech-${tech.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 w-full">{tech.name} ({tech.id})</label>
                                                </div>
                                                ))}
                                            </div></ScrollArea>
                                        </PopoverContent>
                                    </Popover>
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
                                        <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
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
                                <FormControl><CustomDateInput {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                            <Button type="submit">Save Changes</Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
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
    const [isEditing, setIsEditing] = useState(false);
    
    const [equipment, setEquipment] = useState(() => allEquipment.find(p => p.id === id));

    if (!equipment) {
        notFound();
    }

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const handleFormSubmit = (values: EquipmentFormValues) => {
        const updatedEquipment = { ...equipment, ...values, nextCalibration: format(values.nextCalibration, 'yyyy-MM-dd') };
        setEquipment(updatedEquipment);
        toast({
            title: "Equipment Updated",
            description: `${equipment.name} has been updated.`,
        });
        setIsEditing(false);
    };

    if (isEditing) {
        return (
             <div className="max-w-2xl mx-auto">
                <Button variant="outline" size="sm" className="mb-4" onClick={() => setIsEditing(false)}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to View
                </Button>
                <EquipmentForm
                    onSubmit={handleFormSubmit}
                    onCancel={() => setIsEditing(false)}
                    equipment={equipment}
                />
            </div>
        )
    }

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
                    <Button onClick={() => setIsEditing(true)}><Edit className="mr-2 h-4 w-4" />Edit</Button>
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
                            <CardDescription>ID: <span className="font-extrabold text-foreground">{equipment.id}</span></CardDescription>
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
                                        <p className="font-bold text-muted-foreground">{equipment.serialNumber}</p>
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
        </div>
    );
}

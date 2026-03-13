'use client';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const APRReportTemplate = () => {
    const { control } = useFormContext();
     const { fields, append, remove } = useFieldArray({
        control,
        name: "findings",
    });


    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Acoustic Pulse Reflectometry (APR) Setup</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                 <FormField control={control} name="transducerType" render={({ field }) => (
                    <FormItem><FormLabel>Transducer Type</FormLabel><FormControl><Input placeholder="e.g., Piezoelectric" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={control} name="pulseWidth" render={({ field }) => (
                    <FormItem><FormLabel>Pulse Width</FormLabel><FormControl><Input placeholder="e.g., 50 µs" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={control} name="samplingRate" render={({ field }) => (
                    <FormItem><FormLabel>Sampling Rate</FormLabel><FormControl><Input placeholder="e.g., 5 MHz" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            </div>
             <Separator className="my-6" />
             <h3 className="text-lg font-semibold border-b pb-2">Tube Inspection Findings</h3>
             <div className="space-y-4">
                {fields.map((item, index) => (
                    <div key={item.id} className="p-4 border rounded-md relative space-y-4 bg-background">
                         <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => remove(index)} disabled={fields.length <= 1}>
                            <Trash className="h-4 w-4" />
                        </Button>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                            <FormField control={control} name={`findings.${index}.tubeId`} render={({ field }) => (
                                <FormItem><FormLabel>Tube ID</FormLabel><FormControl><Input placeholder={`e.g., R5-C12`} {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={control} name={`findings.${index}.indicationType`} render={({ field }) => (
                                <FormItem><FormLabel>Indication Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Blockage">Blockage</SelectItem><SelectItem value="Wall Loss">Wall Loss</SelectItem><SelectItem value="Hole">Hole</SelectItem><SelectItem value="Clear">Clear</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                            )}/>
                            <FormField control={control} name={`findings.${index}.location`} render={({ field }) => (
                                <FormItem><FormLabel>Location (from Tube End)</FormLabel><FormControl><Input placeholder="e.g., 3.2m" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>
                    </div>
                ))}
                 <Button type="button" variant="outline" size="sm" onClick={() => append({ tubeId: "", indicationType: "Clear", location: "" })}>
                    Add Tube Finding
                </Button>
            </div>
        </div>
    );
};

export default APRReportTemplate;

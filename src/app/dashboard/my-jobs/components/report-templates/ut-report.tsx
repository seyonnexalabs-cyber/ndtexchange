'use client';

import { useFormContext, useFieldArray } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Trash } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const UTReportTemplate = () => {
    const { control } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "findings",
    });

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Ultrasonic Testing (UT) Setup</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField control={control} name="equipmentUsed" render={({ field }) => (
                    <FormItem><FormLabel>UT Instrument & Probes</FormLabel><FormControl><Input placeholder="e.g., Olympus 45MG, M110-RM probe" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={control} name="calibrationBlock" render={({ field }) => (
                    <FormItem><FormLabel>Calibration Block</FormLabel><FormControl><Input placeholder="e.g., IIW Type 1, S/N: CB-54321" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={control} name="couplant" render={({ field }) => (
                    <FormItem><FormLabel>Couplant</FormLabel><FormControl><Input placeholder="e.g., Sonotech Ultragel II" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={control} name="surfaceCondition" render={({ field }) => (
                    <FormItem><FormLabel>Surface Condition</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select surface condition..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="As-is">As-is</SelectItem><SelectItem value="Cleaned">Cleaned</SelectItem><SelectItem value="Ground">Ground</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )}/>
                 <FormField control={control} name="utTechnique" render={({ field }) => (
                    <FormItem><FormLabel>Technique</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select technique..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Pulse-Echo">Pulse-Echo</SelectItem><SelectItem value="Through-Transmission">Through-Transmission</SelectItem><SelectItem value="TOFD">TOFD</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )}/>
                 <FormField control={control} name="angle" render={({ field }) => (
                    <FormItem><FormLabel>Angle (degrees)</FormLabel><FormControl><Input type="number" placeholder="e.g., 45" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            </div>
             <Separator className="my-6" />
             <h3 className="text-lg font-semibold border-b pb-2">Findings & Measurements</h3>
              <FormField control={control} name="inspectionArea" render={({ field }) => (
                <FormItem><FormLabel>General Area of Inspection</FormLabel><FormControl><Input placeholder="e.g., Vessel Shell Course 3, West Side" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            
            <div className="space-y-4">
                {fields.map((item, index) => (
                    <div key={item.id} className="p-4 border rounded-md relative space-y-4 bg-background">
                         <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => remove(index)} disabled={fields.length <= 1}>
                            <Trash className="h-4 w-4" />
                        </Button>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
                             <FormField control={control} name={`findings.${index}.location`} render={({ field }) => (
                                <FormItem><FormLabel>Location / TML</FormLabel><FormControl><Input placeholder={`e.g., TML-${index + 1}`} {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={control} name={`findings.${index}.thickness`} render={({ field }) => (
                                <FormItem><FormLabel>Thickness (mm)</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                             <FormField control={control} name={`findings.${index}.indicationType`} render={({ field }) => (
                                <FormItem><FormLabel>Indication Type</FormLabel><FormControl><Input placeholder="e.g., Lamination, Pitting" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={control} name={`findings.${index}.result`} render={({ field }) => (
                                <FormItem><FormLabel>Result</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select result..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Acceptable">Acceptable</SelectItem><SelectItem value="Rejectable">Rejectable</SelectItem><SelectItem value="Monitor">Monitor</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                            )}/>
                        </div>
                         <FormField control={control} name={`findings.${index}.notes`} render={({ field }) => (
                            <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea placeholder="Describe the finding, dimensions, and reference any images." {...field} rows={2} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>
                ))}
                 <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ location: "", thickness: 0, notes: "" })}
                >
                    Add Finding
                </Button>
            </div>
        </div>
    );
}

export default UTReportTemplate;

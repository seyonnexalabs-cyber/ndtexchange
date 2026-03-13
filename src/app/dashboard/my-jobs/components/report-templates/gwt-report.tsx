'use client';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const GWTReportTemplate = () => {
    const { control } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "findings",
    });

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Guided Wave Testing (GWT) Setup</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField control={control} name="equipmentUsed" render={({ field }) => (
                    <FormItem><FormLabel>GWT Instrument</FormLabel><FormControl><Input placeholder="e.g., GUL Wavemaker G4" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={control} name="transducerRing" render={({ field }) => (
                    <FormItem><FormLabel>Transducer Ring</FormLabel><FormControl><Input placeholder="e.g., Solid, Inflatable" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={control} name="frequencyRange" render={({ field }) => (
                    <FormItem><FormLabel>Frequency Range (kHz)</FormLabel><FormControl><Input placeholder="e.g., 20-100 kHz" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={control} name="testRange" render={({ field }) => (
                    <FormItem><FormLabel>Test Range (m)</FormLabel><FormControl><Input placeholder="e.g., -30m to +30m" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            </div>
             <Separator className="my-6" />
             <h3 className="text-lg font-semibold border-b pb-2">Findings</h3>
            <div className="space-y-4">
                {fields.map((item, index) => (
                    <div key={item.id} className="p-4 border rounded-md relative space-y-4 bg-background">
                         <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => remove(index)} disabled={fields.length <= 1}>
                            <Trash className="h-4 w-4" />
                        </Button>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                             <FormField control={control} name={`findings.${index}.distance`} render={({ field }) => (
                                <FormItem><FormLabel>Distance from Ring (m)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="e.g., 12.5" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={control} name={`findings.${index}.orientation`} render={({ field }) => (
                                <FormItem><FormLabel>Orientation</FormLabel><FormControl><Input placeholder="e.g., 3 o'clock" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                             <FormField control={control} name={`findings.${index}.csc`} render={({ field }) => (
                                <FormItem><FormLabel>Cross-Sectional Change (%)</FormLabel><FormControl><Input type="number" step="1" placeholder="e.g., -15" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={control} name={`findings.${index}.result`} render={({ field }) => (
                                <FormItem><FormLabel>Result</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Monitor">Monitor</SelectItem><SelectItem value="Further Inspection">Requires Further Inspection</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                            )}/>
                        </div>
                    </div>
                ))}
                 <Button type="button" variant="outline" size="sm" onClick={() => append({ distance: 0, orientation: '', csc: 0, result: 'Monitor' })}>
                    Add Finding
                </Button>
            </div>
        </div>
    );
};

export default GWTReportTemplate;

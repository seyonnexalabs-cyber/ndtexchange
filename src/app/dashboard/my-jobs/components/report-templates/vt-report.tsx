'use client';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const VTReportTemplate = () => {
    const { control } = useFormContext();
     const { fields, append, remove } = useFieldArray({
        control,
        name: "findings",
    });

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Visual Testing (VT) Details</h3>
            <div className="grid md:grid-cols-2 gap-4">
                <FormField control={control} name="equipment" render={({ field }) => (
                    <FormItem><FormLabel>Inspection Tool(s)</FormLabel><FormControl><Input placeholder="e.g., Borescope, Magnifying glass, Welding gauges" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={control} name="lighting" render={({ field }) => (
                    <FormItem><FormLabel>Lighting Conditions</FormLabel><FormControl><Input placeholder="e.g., Direct sunlight, 1000 Lux artificial" {...field} /></FormControl><FormMessage /></FormItem>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                             <FormField control={control} name={`findings.${index}.location`} render={({ field }) => (
                                <FormItem><FormLabel>Location / Component</FormLabel><FormControl><Input placeholder={`e.g., Weld #3, Surface A`} {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                             <FormField control={control} name={`findings.${index}.result`} render={({ field }) => (
                                <FormItem><FormLabel>Result</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select result..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Acceptable">Acceptable</SelectItem><SelectItem value="Rejectable">Rejectable</SelectItem><SelectItem value="Monitor">Monitor</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                            )}/>
                        </div>
                         <FormField control={control} name={`findings.${index}.notes`} render={({ field }) => (
                            <FormItem><FormLabel>Description of Finding</FormLabel><FormControl><Textarea placeholder="Describe the observation (e.g., 'Linear indication approx. 5mm long', 'No visible defects')." {...field} rows={2} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>
                ))}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ location: "", notes: "", result: "Acceptable" })}
                >
                    Add Finding
                </Button>
            </div>
        </div>
    );
};

export default VTReportTemplate;

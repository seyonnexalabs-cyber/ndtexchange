
'use client';

import { useFormContext, useFieldArray } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Trash } from 'lucide-react';

const UTReportTemplate = () => {
    const { control } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "findings",
    });

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">UT Equipment & Setup</h3>
            <div className="grid md:grid-cols-2 gap-4">
                <FormField control={control} name="equipmentUsed" render={({ field }) => (
                    <FormItem><FormLabel>UT Instrument & Probes</FormLabel><FormControl><Input placeholder="e.g., Olympus 45MG, M110-RM probe" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={control} name="calibrationBlock" render={({ field }) => (
                    <FormItem><FormLabel>Calibration Block</FormLabel><FormControl><Input placeholder="e.g., IIW Type 1 Block, S/N: CB-54321" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={control} name="couplant" render={({ field }) => (
                    <FormItem><FormLabel>Couplant</FormLabel><FormControl><Input placeholder="e.g., Sonotech Ultragel II" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={control} name="surfaceCondition" render={({ field }) => (
                    <FormItem><FormLabel>Surface Condition</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select surface condition..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="As-is">As-is</SelectItem><SelectItem value="Cleaned">Cleaned</SelectItem><SelectItem value="Ground">Ground</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )}/>
            </div>
             <Separator className="my-6" />
             <h3 className="text-lg font-semibold border-b pb-2">Findings</h3>
              <FormField control={control} name="inspectionArea" render={({ field }) => (
                <FormItem><FormLabel>General Area of Inspection</FormLabel><FormControl><Input placeholder="e.g., Vessel Shell Course 3, West Side" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            
            <div className="space-y-4">
                {fields.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-8 gap-4 items-end p-4 border rounded-md relative">
                         <FormField
                            control={control}
                            name={`findings.${index}.location`}
                            render={({ field }) => (
                                <FormItem className="md:col-span-3">
                                    <FormLabel>Location / Reading Point</FormLabel>
                                    <FormControl>
                                        <Input placeholder={`e.g., TML-${index + 1}`} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={control}
                            name={`findings.${index}.thickness`}
                            render={({ field }) => (
                                <FormItem className="md:col-span-1">
                                    <FormLabel>Thickness (mm)</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.001" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={control}
                            name={`findings.${index}.notes`}
                            render={({ field }) => (
                                <FormItem className="md:col-span-3">
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Reading taken at 3 o'clock position" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => remove(index)}
                            className="md:col-span-1"
                            disabled={fields.length <= 1}
                        >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Remove Finding</span>
                        </Button>
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

'use client';

import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

const UTReportTemplate = () => {
    const { control } = useFormContext();

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
             <h3 className="text-lg font-semibold border-b pb-2 pt-4">Findings</h3>
              <FormField control={control} name="inspectionArea" render={({ field }) => (
                <FormItem><FormLabel>General Area of Inspection</FormLabel><FormControl><Input placeholder="e.g., Vessel Shell Course 3, West Side" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
    );
}

export default UTReportTemplate;

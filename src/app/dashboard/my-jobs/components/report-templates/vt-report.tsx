
'use client';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

const VTReportTemplate = () => {
    const { control } = useFormContext();

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Visual Inspection Details</h3>
            <div className="grid md:grid-cols-2 gap-4">
                <FormField control={control} name="equipment" render={({ field }) => (
                    <FormItem><FormLabel>Inspection Tool(s)</FormLabel><FormControl><Input placeholder="e.g., Borescope, Magnifying glass" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={control} name="lighting" render={({ field }) => (
                    <FormItem><FormLabel>Lighting Conditions</FormLabel><FormControl><Input placeholder="e.g., Direct sunlight, 1000 Lux artificial" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            </div>
        </div>
    );
};

export default VTReportTemplate;


'use client';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

const GWTReportTemplate = () => {
    const { control } = useFormContext();

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Guided Wave (GWT) Setup</h3>
            <div className="grid md:grid-cols-2 gap-4">
                <FormField control={control} name="ringSpacing" render={({ field }) => (
                    <FormItem><FormLabel>Ring Spacing</FormLabel><FormControl><Input placeholder="e.g., 100 mm" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={control} name="frequencyRange" render={({ field }) => (
                    <FormItem><FormLabel>Frequency Range</FormLabel><FormControl><Input placeholder="e.g., 20-100 kHz" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={control} name="deadZone" render={({ field }) => (
                    <FormItem><FormLabel>Dead Zone</FormLabel><FormControl><Input placeholder="e.g., 0.5 m" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            </div>
        </div>
    );
};

export default GWTReportTemplate;

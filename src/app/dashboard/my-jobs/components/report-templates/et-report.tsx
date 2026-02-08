'use client';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

const ETReportTemplate = () => {
    const { control } = useFormContext();

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Eddy Current Setup</h3>
            <div className="grid md:grid-cols-2 gap-4">
                <FormField control={control} name="instrument" render={({ field }) => (
                    <FormItem><FormLabel>ET Instrument</FormLabel><FormControl><Input placeholder="e.g., Zetec MIZ-21C" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={control} name="probe" render={({ field }) => (
                    <FormItem><FormLabel>Probe Type</FormLabel><FormControl><Input placeholder="e.g., Pencil probe, 100-500 kHz" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={control} name="frequency" render={({ field }) => (
                    <FormItem><FormLabel>Test Frequency (kHz)</FormLabel><FormControl><Input type="number" placeholder="e.g., 200" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            </div>
        </div>
    );
};

export default ETReportTemplate;

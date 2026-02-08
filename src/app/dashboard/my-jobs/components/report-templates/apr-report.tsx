
'use client';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

const APRReportTemplate = () => {
    const { control } = useFormContext();

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Acoustic Pulse Reflectometry (APR) Setup</h3>
            <div className="grid md:grid-cols-2 gap-4">
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
        </div>
    );
};

export default APRReportTemplate;

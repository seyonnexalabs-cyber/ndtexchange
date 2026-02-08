
'use client';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

const AEReportTemplate = () => {
    const { control } = useFormContext();

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Acoustic Emission (AE) Setup</h3>
            <div className="grid md:grid-cols-2 gap-4">
                <FormField control={control} name="sensorLayout" render={({ field }) => (
                    <FormItem><FormLabel>Sensor Layout</FormLabel><FormControl><Input placeholder="e.g., Linear array, 12 sensors" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={control} name="threshold" render={({ field }) => (
                    <FormItem><FormLabel>Threshold</FormLabel><FormControl><Input placeholder="e.g., 40 dB" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={control} name="preamplifierGain" render={({ field }) => (
                    <FormItem><FormLabel>Preamplifier Gain</FormLabel><FormControl><Input placeholder="e.g., 20 dB" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            </div>
        </div>
    );
};

export default AEReportTemplate;

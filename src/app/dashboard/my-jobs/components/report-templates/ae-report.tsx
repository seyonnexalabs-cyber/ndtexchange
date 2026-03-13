'use client';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

const AEReportTemplate = () => {
    const { control } = useFormContext();

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Acoustic Emission (AE) Setup</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField control={control} name="sensorLayout" render={({ field }) => (
                    <FormItem><FormLabel>Sensor Layout</FormLabel><FormControl><Input placeholder="e.g., Linear array, 12 sensors" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={control} name="threshold" render={({ field }) => (
                    <FormItem><FormLabel>Threshold</FormLabel><FormControl><Input placeholder="e.g., 40 dB" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={control} name="preamplifierGain" render={({ field }) => (
                    <FormItem><FormLabel>Preamplifier Gain</FormLabel><FormControl><Input placeholder="e.g., 20 dB" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={control} name="dataSystem" render={({ field }) => (
                    <FormItem><FormLabel>Data Acquisition System</FormLabel><FormControl><Input placeholder="e.g., Vallen AMSY-6" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={control} name="loadConditions" render={({ field }) => (
                    <FormItem className="lg:col-span-2"><FormLabel>Load/Stress Conditions</FormLabel><FormControl><Input placeholder="e.g., Pressurized to 95% of MAWP over 30 minutes" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            </div>
             <Separator className="my-6" />
            <h3 className="text-lg font-semibold border-b pb-2">Results</h3>
             <FormField control={control} name="resultsSummary" render={({ field }) => (
                <FormItem>
                    <FormLabel>Summary of Results</FormLabel>
                    <FormControl><Textarea placeholder="Describe the AE activity observed, including location of acoustic sources, event counts, amplitude distributions, and classification of sources (e.g., active, critically active)." className="min-h-[150px]" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
        </div>
    );
};

export default AEReportTemplate;

'use client';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

const ETReportTemplate = () => {
    const { control } = useFormContext();

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Eddy Current (ET) Setup</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField control={control} name="instrument" render={({ field }) => (
                    <FormItem><FormLabel>ET Instrument</FormLabel><FormControl><Input placeholder="e.g., Zetec MIZ-21C" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={control} name="probe" render={({ field }) => (
                    <FormItem><FormLabel>Probe Type</FormLabel><FormControl><Input placeholder="e.g., Pencil probe, 100-500 kHz" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={control} name="frequency" render={({ field }) => (
                    <FormItem><FormLabel>Test Frequency (kHz)</FormLabel><FormControl><Input type="number" placeholder="e.g., 200" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={control} name="calibrationStandard" render={({ field }) => (
                    <FormItem><FormLabel>Calibration Standard</FormLabel><FormControl><Input placeholder="e.g., ASME Sec V, Art 8" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            </div>
            <Separator className="my-6" />
            <h3 className="text-lg font-semibold border-b pb-2">Findings</h3>
             <FormField control={control} name="findingsDescription" render={({ field }) => (
                <FormItem>
                    <FormLabel>Description of Indications</FormLabel>
                    <FormControl><Textarea placeholder="Describe any relevant indications found, including their phase angle, amplitude, location, and length. If none, state 'No reportable indications found'." className="min-h-[150px]" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
        </div>
    );
};

export default ETReportTemplate;

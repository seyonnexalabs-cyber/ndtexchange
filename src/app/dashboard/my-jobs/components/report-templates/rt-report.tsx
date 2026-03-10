
'use client';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

const RTReportTemplate = () => {
    const { control } = useFormContext();

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">RT Setup & Exposure Details</h3>
            <div className="grid md:grid-cols-2 gap-4">
                <FormField control={control} name="source" render={({ field }) => (
                    <FormItem><FormLabel>Radiation Source</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select source..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="X-Ray">X-Ray</SelectItem><SelectItem value="Gamma Ray (Ir-192)">Gamma Ray (Ir-192)</SelectItem><SelectItem value="Gamma Ray (Co-60)">Gamma Ray (Co-60)</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )}/>
                <FormField control={control} name="voltage" render={({ field }) => (
                    <FormItem><FormLabel>Voltage (kV)</FormLabel><FormControl><Input type="number" placeholder="e.g., 200" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={control} name="exposure" render={({ field }) => (
                    <FormItem><FormLabel>Exposure Time</FormLabel><FormControl><Input placeholder="e.g., 2 minutes" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={control} name="filmType" render={({ field }) => (
                    <FormItem><FormLabel>Film/Detector Type</FormLabel><FormControl><Input placeholder="e.g., Agfa D7" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            </div>
        </div>
    );
};

export default RTReportTemplate;

'use client';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

const PTReportTemplate = () => {
    const { control } = useFormContext();

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">PT Materials & Setup</h3>
            <div className="grid md:grid-cols-2 gap-4">
                <FormField control={control} name="penetrant" render={({ field }) => (
                    <FormItem><FormLabel>Penetrant Type</FormLabel><FormControl><Input placeholder="e.g., Type I, Method C" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={control} name="remover" render={({ field }) => (
                    <FormItem><FormLabel>Remover</FormLabel><FormControl><Input placeholder="e.g., Solvent Removable" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={control} name="developer" render={({ field }) => (
                    <FormItem><FormLabel>Developer</FormLabel><FormControl><Input placeholder="e.g., Non-aqueous" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={control} name="dwellTime" render={({ field }) => (
                    <FormItem><FormLabel>Dwell Time (minutes)</FormLabel><FormControl><Input type="number" placeholder="e.g., 10" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            </div>
        </div>
    );
};

export default PTReportTemplate;

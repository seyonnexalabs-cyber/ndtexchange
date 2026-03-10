
'use client';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

const MTReportTemplate = () => {
    const { control } = useFormContext();

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">MT Equipment & Setup</h3>
            <div className="grid md:grid-cols-2 gap-4">
                <FormField control={control} name="equipment" render={({ field }) => (
                    <FormItem><FormLabel>MT Yoke/Equipment</FormLabel><FormControl><Input placeholder="e.g., Parker B-300S Yoke" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={control} name="media" render={({ field }) => (
                    <FormItem><FormLabel>Magnetic Particle Medium</FormLabel><FormControl><Input placeholder="e.g., Dry Powder, Wet Fluorescent" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={control} name="fieldStrength" render={({ field }) => (
                    <FormItem><FormLabel>Magnetic Field Strength</FormLabel><FormControl><Input placeholder="e.g., 40 A/cm" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={control} name="lighting" render={({ field }) => (
                    <FormItem><FormLabel>Lighting Conditions</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select lighting..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Visible Light">Visible Light</SelectItem><SelectItem value="UV-A Light">UV-A Light</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )}/>
            </div>
        </div>
    );
};

export default MTReportTemplate;

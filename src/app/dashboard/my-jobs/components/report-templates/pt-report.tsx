'use client';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

const PTReportTemplate = () => {
    const { control } = useFormContext();

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Liquid Penetrant (PT) Materials & Setup</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField control={control} name="penetrantType" render={({ field }) => (
                    <FormItem><FormLabel>Penetrant Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Type I - Fluorescent">Type I - Fluorescent</SelectItem><SelectItem value="Type II - Visible">Type II - Visible</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )}/>
                <FormField control={control} name="removerMethod" render={({ field }) => (
                    <FormItem><FormLabel>Remover Method</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select method..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="A - Water-Washable">A - Water-Washable</SelectItem><SelectItem value="B - Post-Emulsifiable, Lipophilic">B - Post-Emulsifiable, Lipophilic</SelectItem><SelectItem value="C - Solvent Removable">C - Solvent Removable</SelectItem><SelectItem value="D - Post-Emulsifiable, Hydrophilic">D - Post-Emulsifiable, Hydrophilic</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )}/>
                <FormField control={control} name="developer" render={({ field }) => (
                    <FormItem><FormLabel>Developer</FormLabel><FormControl><Input placeholder="e.g., Form d - Non-aqueous" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={control} name="surfaceTemp" render={({ field }) => (
                    <FormItem><FormLabel>Surface Temperature</FormLabel><FormControl><Input placeholder="e.g., 20°C / 68°F" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={control} name="dwellTime" render={({ field }) => (
                    <FormItem><FormLabel>Dwell Time (minutes)</FormLabel><FormControl><Input type="number" placeholder="e.g., 10" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            </div>
             <Separator className="my-6" />
            <h3 className="text-lg font-semibold border-b pb-2">Findings</h3>
             <FormField control={control} name="findingsDescription" render={({ field }) => (
                <FormItem>
                    <FormLabel>Description of Indications</FormLabel>
                    <FormControl><Textarea placeholder="Describe any relevant indications found, including their location, size, and character (e.g., linear, rounded). If none, state 'No reportable indications found'." className="min-h-[150px]" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
        </div>
    );
};

export default PTReportTemplate;

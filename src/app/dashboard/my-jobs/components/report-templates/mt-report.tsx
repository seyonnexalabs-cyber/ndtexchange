'use client';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

const MTReportTemplate = () => {
    const { control } = useFormContext();

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Magnetic Particle (MT) Setup</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField control={control} name="equipment" render={({ field }) => (
                    <FormItem><FormLabel>MT Equipment</FormLabel><FormControl><Input placeholder="e.g., Parker B-300S Yoke" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={control} name="technique" render={({ field }) => (
                    <FormItem><FormLabel>Technique</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select technique..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Yoke">Yoke</SelectItem><SelectItem value="Prods">Prods</SelectItem><SelectItem value="Coil">Coil</SelectItem><SelectItem value="Bench">Bench</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )}/>
                <FormField control={control} name="waveform" render={({ field }) => (
                    <FormItem><FormLabel>Waveform</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select waveform..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="AC">AC</SelectItem><SelectItem value="HWDC">HWDC</SelectItem><SelectItem value="FWDC">FWDC</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )}/>
                <FormField control={control} name="media" render={({ field }) => (
                    <FormItem><FormLabel>Magnetic Particle Medium</FormLabel><FormControl><Input placeholder="e.g., Dry Powder (Red), Wet Fluorescent" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={control} name="fieldStrength" render={({ field }) => (
                    <FormItem><FormLabel>Magnetic Field Strength</FormLabel><FormControl><Input placeholder="e.g., 40 A/cm" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={control} name="lighting" render={({ field }) => (
                    <FormItem><FormLabel>Lighting Conditions</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select lighting..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Visible Light (>100 fc)">Visible Light (&gt;100 fc)</SelectItem><SelectItem value="UV-A Light (>1000 µW/cm²)">UV-A Light (&gt;1000 µW/cm²)</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )}/>
            </div>
            <Separator className="my-6" />
            <h3 className="text-lg font-semibold border-b pb-2">Findings</h3>
             <FormField control={control} name="findingsDescription" render={({ field }) => (
                <FormItem>
                    <FormLabel>Description of Indications</FormLabel>
                    <FormControl><Textarea placeholder="Describe any relevant indications found, including their location, size, and orientation. If none, state 'No reportable indications found'." className="min-h-[150px]" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
        </div>
    );
};

export default MTReportTemplate;

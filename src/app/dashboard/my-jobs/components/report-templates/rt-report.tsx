'use client';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

const RTReportTemplate = () => {
    const { control } = useFormContext();

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Radiographic Testing (RT) Setup</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField control={control} name="source" render={({ field }) => (
                    <FormItem><FormLabel>Radiation Source</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select source..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="X-Ray">X-Ray</SelectItem><SelectItem value="Gamma Ray (Ir-192)">Gamma Ray (Ir-192)</SelectItem><SelectItem value="Gamma Ray (Co-60)">Gamma Ray (Co-60)</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )}/>
                <FormField control={control} name="voltage" render={({ field }) => (
                    <FormItem><FormLabel>Voltage (kV) / Source Size</FormLabel><FormControl><Input placeholder="e.g., 200 kV or 50 Ci" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={control} name="exposure" render={({ field }) => (
                    <FormItem><FormLabel>Exposure Time</FormLabel><FormControl><Input placeholder="e.g., 2 minutes" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={control} name="filmDetector" render={({ field }) => (
                    <FormItem><FormLabel>Film/Detector Type</FormLabel><FormControl><Input placeholder="e.g., Agfa D7, DDA Panel" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={control} name="sfd" render={({ field }) => (
                    <FormItem><FormLabel>Source-to-Film Distance</FormLabel><FormControl><Input placeholder="e.g., 700 mm" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={control} name="iqi" render={({ field }) => (
                    <FormItem><FormLabel>IQI (Penetrameter) Used</FormLabel><FormControl><Input placeholder="e.g., ASTM 10E" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            </div>
            <Separator className="my-6" />
            <h3 className="text-lg font-semibold border-b pb-2">Findings</h3>
             <FormField control={control} name="findingsDescription" render={({ field }) => (
                <FormItem>
                    <FormLabel>Interpretation of Radiographs</FormLabel>
                    <FormControl><Textarea placeholder="Describe the findings for each radiograph, including location, type of discontinuity (e.g., porosity, lack of fusion), and evaluation against acceptance criteria. If none, state 'No unacceptable indications found'." className="min-h-[150px]" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
        </div>
    );
};

export default RTReportTemplate;

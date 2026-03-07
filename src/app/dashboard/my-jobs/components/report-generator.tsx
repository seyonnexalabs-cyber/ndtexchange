
'use client';
import { useFormContext } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import dynamic from 'next/dynamic';
import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// A map of technique keys to their dynamic import functions
const templateLoaders: { [key: string]: () => Promise<any> } = {
    UT: () => import('./report-templates/ut-report'),
    PAUT: () => import('./report-templates/ut-report'),
    TOFD: () => import('./report-templates/ut-report'),
    MT: () => import('./report-templates/mt-report'),
    PT: () => import('./report-templates/pt-report'),
    RT: () => import('./report-templates/rt-report'),
    CR: () => import('./report-templates/rt-report'),
    DR: () => import('./report-templates/rt-report'),
    VT: () => import('./report-templates/vt-report'),
    RVI: () => import('./report-templates/vt-report'),
    ET: () => import('./report-templates/et-report'),
    AE: () => import('./report-templates/ae-report'),
    GWT: () => import('./report-templates/gwt-report'),
    APR: () => import('./report-templates/apr-report'),
};

const DefaultTemplate = () => (
    <p className="text-muted-foreground p-4 text-center border rounded-md">
        No specific data entry template for this technique. Please use the summary field below to detail your findings.
    </p>
);

const ReportGenerator = ({ technique, devOverrideTechnique }: { technique: string, devOverrideTechnique?: string }) => {
    const { control } = useFormContext();
    
    const activeTechnique = process.env.NODE_ENV === 'development' && devOverrideTechnique ? devOverrideTechnique : technique;

    // Use useMemo to ensure the component is only created when the technique changes
    const TemplateComponent = React.useMemo(() => {
        const loader = templateLoaders[activeTechnique];
        if (loader) {
            return dynamic(loader, {
                ssr: false, // Ensure it's a client component
                loading: () => <Skeleton className="h-48 w-full" />,
            });
        }
        return DefaultTemplate;
    }, [activeTechnique]);
    
    return (
        <div className="space-y-6">
            <TemplateComponent />

            <Separator className="my-6" />
            <h3 className="text-lg font-semibold border-b pb-2">Summary & Conclusion</h3>
            <FormField
                control={control}
                name="summary"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Summary of Findings</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Provide a detailed summary of the inspection results, including any recommendations, especially if no specific template was available."
                                className="min-h-[250px]"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
};

export default ReportGenerator;

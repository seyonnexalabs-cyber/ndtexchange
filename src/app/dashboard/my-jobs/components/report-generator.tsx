
'use client';

import { useFormContext } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import dynamic from 'next/dynamic';
import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const loadingComponent = { loading: () => <Skeleton className="h-48 w-full" />, ssr: false };

// Pre-load all templates dynamically at the top level of the module, ensuring default export is resolved.
const templates = {
    UT: dynamic(() => import('./report-templates/ut-report').then((mod) => mod.default), loadingComponent),
    PAUT: dynamic(() => import('./report-templates/ut-report').then((mod) => mod.default), loadingComponent),
    TOFD: dynamic(() => import('./report-templates/ut-report').then((mod) => mod.default), loadingComponent),
    MT: dynamic(() => import('./report-templates/mt-report').then((mod) => mod.default), loadingComponent),
    PT: dynamic(() => import('./report-templates/pt-report').then((mod) => mod.default), loadingComponent),
    RT: dynamic(() => import('./report-templates/rt-report').then((mod) => mod.default), loadingComponent),
    CR: dynamic(() => import('./report-templates/rt-report').then((mod) => mod.default), loadingComponent),
    DR: dynamic(() => import('./report-templates/rt-report').then((mod) => mod.default), loadingComponent),
    VT: dynamic(() => import('./report-templates/vt-report').then((mod) => mod.default), loadingComponent),
    RVI: dynamic(() => import('./report-templates/vt-report').then((mod) => mod.default), loadingComponent),
    ET: dynamic(() => import('./report-templates/et-report').then((mod) => mod.default), loadingComponent),
    AE: dynamic(() => import('./report-templates/ae-report').then((mod) => mod.default), loadingComponent),
    APR: dynamic(() => import('./report-templates/apr-report').then((mod) => mod.default), loadingComponent),
};

const DefaultTemplate = () => (
    <p className="text-muted-foreground p-4 text-center border rounded-md">
        No specific data entry template for this technique. Please use the summary field below to detail your findings.
    </p>
);

const ReportGenerator = ({ technique, devOverrideTechnique }: { technique: string, devOverrideTechnique?: string }) => {
    const { control } = useFormContext();
    
    const activeTechnique = process.env.NODE_ENV === 'development' && devOverrideTechnique ? devOverrideTechnique : technique;

    // Select the correct component from the pre-loaded map.
    const TemplateComponent = templates[activeTechnique as keyof typeof templates] || DefaultTemplate;
    
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

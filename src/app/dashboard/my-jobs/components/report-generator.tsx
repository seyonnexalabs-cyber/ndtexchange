
'use client';

import { useFormContext } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import dynamic from 'next/dynamic';
import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Pre-load all templates dynamically at the top level of the module.
const dynamicTemplates: { [key: string]: React.ComponentType<any> } = {
    UT: dynamic(() => import('./report-templates/ut-report').then((mod) => mod.default), { loading: () => <Skeleton className="h-48 w-full" />, ssr: false }),
    PAUT: dynamic(() => import('./report-templates/ut-report').then((mod) => mod.default), { loading: () => <Skeleton className="h-48 w-full" />, ssr: false }),
    TOFD: dynamic(() => import('./report-templates/ut-report').then((mod) => mod.default), { loading: () => <Skeleton className="h-48 w-full" />, ssr: false }),
    MT: dynamic(() => import('./report-templates/mt-report').then((mod) => mod.default), { loading: () => <Skeleton className="h-48 w-full" />, ssr: false }),
    PT: dynamic(() => import('./report-templates/pt-report').then((mod) => mod.default), { loading: () => <Skeleton className="h-48 w-full" />, ssr: false }),
    RT: dynamic(() => import('./report-templates/rt-report').then((mod) => mod.default), { loading: () => <Skeleton className="h-48 w-full" />, ssr: false }),
    CR: dynamic(() => import('./report-templates/rt-report').then((mod) => mod.default), { loading: () => <Skeleton className="h-48 w-full" />, ssr: false }),
    DR: dynamic(() => import('./report-templates/rt-report').then((mod) => mod.default), { loading: () => <Skeleton className="h-48 w-full" />, ssr: false }),
    VT: dynamic(() => import('./report-templates/vt-report').then((mod) => mod.default), { loading: () => <Skeleton className="h-48 w-full" />, ssr: false }),
    RVI: dynamic(() => import('./report-templates/vt-report').then((mod) => mod.default), { loading: () => <Skeleton className="h-48 w-full" />, ssr: false }),
    ET: dynamic(() => import('./report-templates/et-report').then((mod) => mod.default), { loading: () => <Skeleton className="h-48 w-full" />, ssr: false }),
    AE: dynamic(() => import('./report-templates/ae-report').then((mod) => mod.default), { loading: () => <Skeleton className="h-48 w-full" />, ssr: false }),
    APR: dynamic(() => import('./report-templates/apr-report').then((mod) => mod.default), { loading: () => <Skeleton className="h-48 w-full" />, ssr: false }),
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
    const TemplateComponent = dynamicTemplates[activeTechnique] || DefaultTemplate;
    
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

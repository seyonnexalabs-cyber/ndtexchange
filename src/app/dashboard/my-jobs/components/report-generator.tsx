
'use client';
import { useFormContext } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';

// Lazy load templates
import dynamic from 'next/dynamic';

const UTReportTemplate = dynamic(() => import('./report-templates/ut-report'));
const MTReportTemplate = dynamic(() => import('./report-templates/mt-report'));
const PTReportTemplate = dynamic(() => import('./report-templates/pt-report'));
const RTReportTemplate = dynamic(() => import('./report-templates/rt-report'));
const VTReportTemplate = dynamic(() => import('./report-templates/vt-report'));
const ETReportTemplate = dynamic(() => import('./report-templates/et-report'));
const AEReportTemplate = dynamic(() => import('./report-templates/ae-report'));
const GWTReportTemplate = dynamic(() => import('./report-templates/gwt-report'));
const APRReportTemplate = dynamic(() => import('./report-templates/apr-report'));

const reportTemplates: { [key: string]: React.ComponentType } = {
    UT: UTReportTemplate,
    PAUT: UTReportTemplate,
    TOFD: UTReportTemplate,
    MT: MTReportTemplate,
    PT: PTReportTemplate,
    RT: RTReportTemplate,
    CR: RTReportTemplate,
    DR: RTReportTemplate,
    VT: VTReportTemplate,
    RVI: VTReportTemplate,
    ET: ETReportTemplate,
    AE: AEReportTemplate,
    GWT: GWTReportTemplate,
    APR: APRReportTemplate,
};

const DefaultTemplate = () => (
    <p className="text-muted-foreground p-4 text-center border rounded-md">
        No specific data entry template for this technique. Please use the summary field below to detail your findings.
    </p>
);

const ReportGenerator = ({ technique, devOverrideTechnique }: { technique: string, devOverrideTechnique?: string }) => {
    const { control } = useFormContext();
    
    // In dev mode, allow override. Otherwise, strictly use job's technique.
    const activeTechnique = process.env.NODE_ENV === 'development' && devOverrideTechnique ? devOverrideTechnique : technique;

    const TemplateComponent = reportTemplates[activeTechnique] || DefaultTemplate;
    
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

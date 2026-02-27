
'use client';

import * as React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Folder, File, FileUp } from 'lucide-react';
import type { Inspection, Job, NDTTechnique } from '@/lib/types';
import { format, parseISO, isValid } from 'date-fns';
import Link from 'next/link';

const inspectionStatusVariants: Record<Inspection['status'], 'success' | 'destructive' | 'secondary' > = {
    'Completed': 'success',
    'Scheduled': 'secondary',
    'Requires Review': 'destructive',
};

const WorkBreakdownAccordion = ({ inspections, job, constructUrl, role, handleViewDocuments, allNdtTechniques }: { 
    inspections: Inspection[], 
    job: Job, 
    constructUrl: (path: string) => string, 
    role: string, 
    handleViewDocuments: (docs: any[], initialDoc?: string) => void,
    allNdtTechniques: NDTTechnique[] | null
}) => {
    const isClient = role === 'client';
    const isInspector = role === 'inspector';

    const getSafeDate = (dateInput: any): Date | null => {
        if (!dateInput) return null;
        if (dateInput.toDate) { // Firestore Timestamp
            return dateInput.toDate();
        }
        if (dateInput instanceof Date && isValid(dateInput)) {
            return dateInput;
        }
        if (typeof dateInput === 'string') { // String from seed data or API
            const d = parseISO(dateInput);
            return isValid(d) ? d : null;
        }
        return null;
    };

    const groupedData = React.useMemo(() => {
        if (!inspections || inspections.length === 0) return [];
        const groupedByTechnique = inspections.reduce((acc, inspection) => {
            const tech = inspection.technique || 'Uncategorized';
            if (!acc[tech]) acc[tech] = [];
            acc[tech].push(inspection);
            return acc;
        }, {} as Record<string, Inspection[]>);

        return Object.entries(groupedByTechnique).map(([technique, inspList]) => {
            const groupedByAsset = (inspList as Inspection[]).reduce((acc, inspection) => {
                const assetId = inspection.assetId || 'Unknown Asset';
                if (!acc[assetId]) {
                    acc[assetId] = {
                        assetName: inspection.assetName,
                        inspections: []
                    };
                }
                acc[assetId].inspections.push(inspection);
                return acc;
            }, {} as Record<string, { assetName: string, inspections: Inspection[] }>);
            return { technique, assets: Object.entries(groupedByAsset) };
        });
    }, [inspections]);

    if (groupedData.length === 0) {
        return <p className="text-sm text-muted-foreground text-center py-4">No specific inspections are associated with this job's assets.</p>;
    }
    
    const techniqueDefaultValues = groupedData.map(g => g.technique);

    return (
        <Accordion type="multiple" defaultValue={techniqueDefaultValues} className="w-full">
            {groupedData.map(({ technique, assets }) => (
                <AccordionItem key={technique} value={technique}>
                    <AccordionTrigger className="font-semibold text-base">
                         <div className="flex items-center gap-2">
                             <Folder className="h-5 w-5 text-primary" />
                             {(allNdtTechniques || []).find(t=>t.acronym === technique)?.title || technique}
                         </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-6">
                        <Accordion type="multiple" defaultValue={assets.map(([assetId]) => assetId)} className="w-full space-y-2">
                            {assets.map(([assetId, assetData]) => (
                                <AccordionItem key={assetId} value={assetId} className="border-none">
                                    <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline rounded-md hover:bg-muted px-2">
                                        <div className="flex items-center gap-2">
                                             <Folder className="h-4 w-4 text-muted-foreground" />
                                            {assetData.assetName}
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pl-8 space-y-2 pt-2">
                                        {assetData.inspections.map(inspection => {
                                            const inspectionDate = getSafeDate(inspection.date);
                                            return (
                                                <div key={inspection.id} className="flex justify-between items-center bg-background p-2 rounded-md border">
                                                    <div className="flex items-center gap-3">
                                                        <File className="h-4 w-4 text-muted-foreground"/>
                                                        <div>
                                                            <p className="text-sm font-medium">Inspection: {inspectionDate ? format(inspectionDate, 'dd-MMM-yy') : 'Invalid Date'}</p>
                                                            <Badge variant={inspectionStatusVariants[inspection.status]} className="mt-1">{inspection.status}</Badge>
                                                        </div>
                                                    </div>
                                                    <div>
                                                    {inspection.report ? (
                                                        <Button variant="outline" size="sm" onClick={() => handleViewDocuments([{ name: `Report_${inspection.report?.id}.pdf`, url: '', source: 'Generated Report' }])}>
                                                            View Report
                                                        </Button>
                                                    ) : (
                                                        (isInspector || (isClient && job.isInternal)) && ['Assigned', 'In Progress', 'Scheduled', 'Revisions Requested'].includes(job.status) && (
                                                            <Button asChild size="sm">
                                                                <Link href={constructUrl(`/dashboard/reports/new?jobId=${job.id}&inspectionId=${inspection.id}&assetId=${assetId}`)}>
                                                                    <>
                                                                        <FileUp className="mr-2 h-4 w-4" />
                                                                        Generate Report
                                                                    </>
                                                                </Link>
                                                            </Button>
                                                        )
                                                    )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
};

export default WorkBreakdownAccordion;

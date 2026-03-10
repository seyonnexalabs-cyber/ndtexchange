
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Building, Settings2, FileText, ChevronRight, Plus } from 'lucide-react';
import type { Inspection, Job, NDTTechnique } from '@/lib/types';
import { cn } from '@/lib/utils';

const inspectionStatusVariants: Record<Inspection['status'], 'success' | 'destructive' | 'secondary' > = {
    'Completed': 'success',
    'Scheduled': 'secondary',
    'Requires Review': 'destructive',
};

const TreeNode = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("pl-6 border-l-2 border-dashed ml-3", className)}>
        {children}
    </div>
);

const NodeItem = ({ icon, label, href, constructUrl, children, badge }: { icon: React.ReactNode, label: string, href: string, constructUrl: (path: string) => string, children?: React.ReactNode, badge?: React.ReactNode }) => (
    <div className="flex items-center gap-2 py-1.5 group">
        {icon}
        <Link href={constructUrl(href)} className="font-medium hover:underline group-hover:text-primary transition-colors">
            {label}
        </Link>
        {badge}
        {children}
    </div>
);

const ActionItem = ({ icon, label, href, constructUrl }: { icon: React.ReactNode, label: string, href: string, constructUrl: (path: string) => string }) => (
    <Button variant="ghost" size="sm" asChild className="h-auto px-2 py-1 text-xs">
        <Link href={constructUrl(href)}>
            {icon}
            {label}
        </Link>
    </Button>
);

const WorkBreakdownTree = ({ inspections, job, constructUrl, allNdtTechniques }: { 
    inspections: Inspection[], 
    job: Job, 
    constructUrl: (path: string) => string,
    allNdtTechniques: NDTTechnique[] | null
}) => {
    const groupedByAsset = React.useMemo(() => {
        if (!inspections) return new Map();
        
        const map = new Map<string, { assetName: string; inspections: Inspection[] }>();
        
        // Ensure all assets from the job are present, even if they have no inspections yet.
        (job.assetIds || []).forEach(assetId => {
            map.set(assetId, { assetName: `Asset ${assetId.substring(0,5)}...`, inspections: [] });
        });

        inspections.forEach(inspection => {
            const assetId = inspection.assetId;
            if (!map.has(assetId)) {
                map.set(assetId, { assetName: inspection.assetName, inspections: [] });
            }
            map.get(assetId)!.assetName = inspection.assetName; // Update name in case it's more accurate
            map.get(assetId)!.inspections.push(inspection);
        });

        return map;
    }, [inspections, job.assetIds]);

    return (
        <div className="font-mono text-sm p-4 rounded-lg bg-muted/30 border">
            <NodeItem 
                icon={<Briefcase className="h-5 w-5 text-primary"/>} 
                label={`Job: ${job.title}`}
                href={`/dashboard/my-jobs/${job.id}`}
                constructUrl={constructUrl}
            />

            <TreeNode>
                {Array.from(groupedByAsset.entries()).map(([assetId, assetData]) => (
                    <div key={assetId} className="mt-2">
                        <NodeItem
                            icon={<Building className="h-5 w-5 text-primary/80"/>}
                            label={`Asset: ${assetData.assetName}`}
                            href={`/dashboard/assets/${assetId}`}
                            constructUrl={constructUrl}
                        />
                        <TreeNode>
                            {assetData.inspections.map(inspection => {
                                const technique = allNdtTechniques?.find(t => t.acronym === inspection.technique);
                                return (
                                    <div key={inspection.id} className="mt-1">
                                        <NodeItem
                                            icon={<Settings2 className="h-5 w-5 text-primary/70"/>}
                                            label={technique?.title || inspection.technique}
                                            href={`/dashboard/my-jobs/${job.id}?tab=scope`}
                                            constructUrl={constructUrl}
                                        >
                                            <div className="flex items-center gap-1.5 text-muted-foreground ml-2">
                                                <ChevronRight className="h-4 w-4" />
                                                <Link href={constructUrl(inspection.report ? `/dashboard/reports/${inspection.report.id}` : `/dashboard/reports/new?jobId=${job.id}&inspectionId=${inspection.id}`)} className="hover:underline flex items-center gap-1">
                                                    <FileText className="h-4 w-4"/> [Report]
                                                </Link>
                                                <Badge variant={inspectionStatusVariants[inspection.status]}>{inspection.status}</Badge>
                                            </div>
                                        </NodeItem>
                                    </div>
                                );
                            })}
                             <ActionItem 
                                icon={<Plus className="h-4 w-4"/>}
                                label="Add Technique"
                                href={`/dashboard/my-jobs/${job.id}/edit`} // Simplified to link to edit page
                                constructUrl={constructUrl}
                            />
                        </TreeNode>
                    </div>
                ))}
                <ActionItem 
                    icon={<Plus className="h-4 w-4"/>}
                    label="Add Asset"
                    href={`/dashboard/my-jobs/${job.id}/edit`} // Simplified to link to edit page
                    constructUrl={constructUrl}
                />
            </TreeNode>
        </div>
    );
};

export default WorkBreakdownTree;

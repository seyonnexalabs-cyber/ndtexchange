'use client';
import { Job, JobUpdate } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { GLOBAL_DATETIME_FORMAT, safeParseDate } from '@/lib/utils';
import * as React from 'react';
import { FileText, PlusCircle, Gavel, Award, History, Users, Calendar } from 'lucide-react';


const jobStatusVariants: Record<Job['status'], 'success' | 'default' | 'secondary' | 'destructive' | 'outline'> = {
    'Draft': 'outline',
    'Posted': 'secondary',
    'Assigned': 'default',
    'Scheduled': 'default',
    'In Progress': 'default',
    'Report Submitted': 'secondary',
    'Under Audit': 'secondary',
    'Audit Approved': 'success',
    'Client Review': 'secondary',
    'Client Approved': 'success',
    'Completed': 'success',
    'Paid': 'success',
    'Revisions Requested': 'destructive',
};

const ClientFormattedDate = ({ timestamp }: { timestamp: any }) => {
    const [formattedDate, setFormattedDate] = React.useState<string | null>(null);

    React.useEffect(() => {
        const date = safeParseDate(timestamp);
        if (date) {
            setFormattedDate(format(date, GLOBAL_DATETIME_FORMAT));
        }
    }, [timestamp]);

    return (
        <p className="text-xs text-muted-foreground/80 shrink-0">
            {formattedDate || '...'}
        </p>
    );
};

const getEventIcon = (action: string): React.ReactNode => {
    const lowerCaseAction = action.toLowerCase();
    if (lowerCaseAction.startsWith('created job')) return <PlusCircle className="h-4 w-4" />;
    if (lowerCaseAction.startsWith('awarded job')) return <Award className="h-4 w-4" />;
    if (lowerCaseAction.startsWith('scheduled job')) return <Calendar className="h-4 w-4" />;
    if (lowerCaseAction.startsWith('submitted inspection report')) return <FileText className="h-4 w-4" />;
    if (lowerCaseAction.startsWith('bid for')) return <Gavel className="h-4 w-4" />;
    if (lowerCaseAction.startsWith('assigned resources')) return <Users className="h-4 w-4" />;
    if (lowerCaseAction.startsWith('status changed')) return <History className="h-4 w-4" />;
    return <History className="h-4 w-4" />;
};


export default function JobActivityLog({ history }: { history?: JobUpdate[] }) {
    if (!history || history.length === 0) {
        return <p className="text-sm text-muted-foreground text-center py-4">No activity log available for this job.</p>
    }
    
    const sortedHistory = [...history].sort((a, b) => {
        const dateA = safeParseDate(a.timestamp);
        const dateB = safeParseDate(b.timestamp);
        if (!dateA || !dateB) return 0;
        return dateB.getTime() - dateA.getTime();
    });

    return (
        <ScrollArea className="max-h-96">
             <div className="relative pl-6">
                {/* Vertical line */}
                <div className="absolute left-6 top-2 h-[calc(100%_-_1rem)] w-0.5 bg-border -translate-x-1/2 border-l-2 border-dashed border-muted-foreground/30 -z-10" />
                
                {sortedHistory.map((entry, index) => {
                    const icon = getEventIcon(entry.action);

                    return (
                        <div key={index} className="relative mb-8 pl-8">
                            <div className="absolute -left-3 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background border-2 border-primary">
                                <div className="text-primary">{icon}</div>
                            </div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium">{entry.user}</p>
                                    {/* User role and company can be added if available */}
                                </div>
                                <ClientFormattedDate timestamp={entry.timestamp} />
                            </div>
                             <div className="mt-1">
                                <p className="text-sm text-muted-foreground">{entry.action}</p>
                                {entry.details && (
                                    <p className="text-xs text-muted-foreground/80 mt-1 italic">"{entry.details}"</p>
                                )}
                            </div>

                            {entry.documentName && (
                                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground border p-2 rounded-md bg-muted/50">
                                    <FileText className="w-4 h-4 shrink-0" />
                                    <span>{entry.documentName}</span>
                                </div>
                            )}

                            {entry.statusChange && (
                                <div className="mt-2 flex items-center gap-2 text-sm">
                                    <span className="text-muted-foreground">Status changed to:</span>
                                    <Badge variant={jobStatusVariants[entry.statusChange]}>{entry.statusChange}</Badge>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </ScrollArea>
    );
}

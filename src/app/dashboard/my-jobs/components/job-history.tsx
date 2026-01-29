
'use client';
import { Job, JobUpdate, allUsers } from '@/lib/placeholder-data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { GLOBAL_DATETIME_FORMAT } from '@/lib/utils';
import * as React from 'react';

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
    'Paid': 'success'
};

const ClientFormattedDate = ({ timestamp }: { timestamp: string }) => {
    const [formattedDate, setFormattedDate] = React.useState<string | null>(null);

    React.useEffect(() => {
        // This code runs only on the client, after the component has mounted.
        setFormattedDate(format(new Date(timestamp), GLOBAL_DATETIME_FORMAT));
    }, [timestamp]);

    // On the server and during the initial client render, formattedDate is null.
    // We return a placeholder to prevent the mismatch.
    return (
        <p className="text-xs text-muted-foreground/80 shrink-0">
            {formattedDate || '...'}
        </p>
    );
};


export default function JobActivityLog({ history }: { history?: JobUpdate[] }) {
    if (!history || history.length === 0) {
        return <p className="text-sm text-muted-foreground text-center py-4">No activity log available for this job.</p>
    }
    
    const sortedHistory = [...history].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
        <ScrollArea className="max-h-96">
            <ul className="space-y-6 p-2">
                {sortedHistory.map((entry, index) => {
                    const userDetails = allUsers.find(u => u.name === entry.user);
                    return (
                        <li key={index} className="flex gap-4">
                            <Avatar>
                                <AvatarFallback>{entry.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className="flex-grow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium">{entry.user}</p>
                                        {userDetails && (
                                            <p className="text-xs text-muted-foreground">{userDetails.role}, {userDetails.company}</p>
                                        )}
                                        <p className="text-sm text-muted-foreground mt-1">{entry.action}</p>
                                        {entry.details && (
                                            <p className="text-xs text-muted-foreground/80 mt-1 italic">"{entry.details}"</p>
                                        )}
                                    </div>
                                    <ClientFormattedDate timestamp={entry.timestamp} />
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
                        </li>
                    )
                })}
            </ul>
        </ScrollArea>
    );
}

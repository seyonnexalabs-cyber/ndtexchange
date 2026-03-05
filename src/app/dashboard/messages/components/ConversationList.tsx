'use client';
import * as React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn, safeParseDate } from '@/lib/utils';
import type { Job, PlatformUser } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

interface ConversationListProps {
    jobs: Job[];
    selectedJob: Job | null;
    onSelectJob: (job: Job) => void;
    currentUser: PlatformUser | null;
    role: string;
    isLoading: boolean;
}

const ConversationList = ({ jobs, selectedJob, onSelectJob, currentUser, role, isLoading }: ConversationListProps) => {
    
    // Sort jobs to show most recent activity first (based on a real last message timestamp if available)
    const sortedJobs = React.useMemo(() => {
        return [...jobs].sort((a, b) => {
            // Use safeParseDate to handle different date formats and invalid dates gracefully
            const dateA = safeParseDate(a.postedDate);
            const dateB = safeParseDate(b.postedDate);

            // If dates are invalid, they should not cause a crash. We can sort them to the end.
            if (!dateB) return -1;
            if (!dateA) return 1;

            return dateB.getTime() - dateA.getTime();
        });
    }, [jobs]);

    if (isLoading) {
        return (
             <div className={cn("w-full md:w-[320px] lg:w-[380px] border-r flex flex-col")}>
                 <div className="p-4 border-b">
                    <Skeleton className="h-8 w-3/4" />
                 </div>
                <div className="p-2 space-y-2">
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
                </div>
            </div>
        )
    }

    return (
        <div className={cn(
            "w-full md:w-[320px] lg:w-[380px] border-r flex flex-col",
            selectedJob && "hidden md:flex"
        )}>
             <div className="p-4 border-b">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    Job Conversations
                </h1>
             </div>
            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    {sortedJobs.map(job => {
                        const isSelected = selectedJob?.id === job.id;
                        return (
                            <button
                                key={job.id}
                                onClick={() => onSelectJob(job)}
                                className={cn(
                                    "block w-full text-left p-3 rounded-lg border transition-colors",
                                    isSelected ? "bg-primary/10" : "hover:bg-primary/5"
                                )}
                            >
                                <p className="font-semibold text-sm truncate">{job?.title}</p>
                                <div className="flex justify-between items-start gap-2 text-xs text-muted-foreground">
                                    <p className="font-extrabold truncate">ID: {job?.id}</p>
                                </div>
                            </button>
                        )
                    })}
                     {sortedJobs.length === 0 && (
                        <div className="text-center text-muted-foreground py-10">
                            No active job conversations.
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}

export default ConversationList;

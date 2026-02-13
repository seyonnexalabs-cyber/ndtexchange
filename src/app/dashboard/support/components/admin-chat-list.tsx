'use client';
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';


// Define types locally for this component
type SupportThread = {
    id: string;
    companyId: string;
    companyName: string;
    subject: string;
    status: 'Open' | 'Closed';
    lastMessage?: string;
    lastMessageTimestamp?: any;
};

const ClientFormattedTime = ({ dateString }: { dateString: string }) => {
  const [formattedTime, setFormattedTime] = React.useState<string | null>(null);
  React.useEffect(() => {
    setFormattedTime(format(new Date(dateString), 'p'));
  }, [dateString]);
  return <>{formattedTime || ''}</>;
};

interface AdminChatListProps {
    supportThreadsData: SupportThread[] | null,
    selectedThreadId: string | null,
    setSelectedThreadId: (id: string | null) => void,
    isLoading: boolean,
}

const AdminChatList = ({
    supportThreadsData,
    selectedThreadId,
    setSelectedThreadId,
    isLoading
}: AdminChatListProps) => {

    if(isLoading) {
        return (
            <div className="w-full md:w-[320px] lg:w-[380px] border-r flex flex-col">
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
        <div className="w-full md:w-[320px] lg:w-[380px] border-r flex flex-col">
            <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">Support Inquiries</h2>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    {supportThreadsData?.map(thread => (
                        <button
                            key={thread.id}
                            onClick={() => setSelectedThreadId(thread.id)}
                            className={cn(
                                "block w-full text-left p-3 rounded-lg border transition-colors",
                                selectedThreadId === thread.id ? "bg-primary/10" : "hover:bg-primary/5"
                            )}
                        >
                            <div className="flex justify-between items-start gap-2">
                                <p className="font-semibold text-sm truncate">{thread.companyName}</p>
                                <span className="text-xs text-muted-foreground shrink-0">{thread.lastMessageTimestamp?.toDate ? <ClientFormattedTime dateString={thread.lastMessageTimestamp.toDate().toISOString()} /> : ''}</span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{thread.subject}</p>
                            <p className="text-xs text-muted-foreground mt-1 truncate">{thread.lastMessage}</p>
                        </button>
                    ))}
                    {supportThreadsData?.length === 0 && <p className="p-4 text-center text-muted-foreground">No open support chats.</p>}
                </div>
            </ScrollArea>
        </div>
    );
};

export default AdminChatList;

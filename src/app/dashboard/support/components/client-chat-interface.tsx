
'use client';
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn, safeParseDate } from '@/lib/utils';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle } from 'lucide-react';


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

const ClientFormattedTime = ({ timestamp }: { timestamp: any }) => {
  const [formattedTime, setFormattedTime] = React.useState<string | null>(null);
  React.useEffect(() => {
    const date = safeParseDate(timestamp);
    if(date) {
        setFormattedTime(format(date, 'p'));
    }
  }, [timestamp]);

  if(formattedTime === null) return null;

  return <>{formattedTime}</>;
};

interface ClientChatListProps {
    supportThreadsData: SupportThread[] | null,
    selectedThreadId: string | null,
    setSelectedThreadId: (id: string | null) => void,
    onNewChat: () => void,
    isLoading: boolean,
}

const ClientChatList = ({
    supportThreadsData,
    selectedThreadId,
    setSelectedThreadId,
    onNewChat,
    isLoading,
}: ClientChatListProps) => {

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
             <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold">Support History</h2>
                <Button size="sm" onClick={onNewChat}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Chat
                </Button>
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
                                <p className="font-semibold text-sm truncate">{thread.subject}</p>
                                <span className="text-xs text-muted-foreground shrink-0"><ClientFormattedTime timestamp={thread.lastMessageTimestamp} /></span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 truncate">{thread.lastMessage}</p>
                        </button>
                    ))}
                    {supportThreadsData?.length === 0 && <p className="p-4 text-center text-muted-foreground">No support chats started yet.</p>}
                </div>
            </ScrollArea>
        </div>
    );
};
export default ClientChatList;

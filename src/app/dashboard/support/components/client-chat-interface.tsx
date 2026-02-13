
'use client';
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

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
    if (dateString) {
        const date = new Date(dateString);
        setFormattedTime(format(date, 'p'));
    }
  }, [dateString]);
  return <>{formattedTime || ''}</>;
};

interface ClientChatListProps {
    supportThreadsData: SupportThread[] | null,
    selectedThreadId: string | null,
    setSelectedThreadId: (id: string | null) => void,
}

const ClientChatList = ({
    supportThreadsData,
    selectedThreadId,
    setSelectedThreadId,
}: ClientChatListProps) => {
    return (
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
                            <span className="text-xs text-muted-foreground shrink-0">{thread.lastMessageTimestamp?.toDate ? <ClientFormattedTime dateString={thread.lastMessageTimestamp.toDate().toISOString()} /> : ''}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 truncate">{thread.lastMessage}</p>
                    </button>
                ))}
                {supportThreadsData?.length === 0 && <p className="p-4 text-center text-muted-foreground">No support chats started yet.</p>}
            </div>
        </ScrollArea>
    );
};
export default ClientChatList;

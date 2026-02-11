'use client';
import * as React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Job, PlatformUser } from '@/lib/placeholder-data';
import { serviceProviders } from '@/lib/placeholder-data';

// Component to safely render formatted time on the client to avoid hydration errors
const ClientFormattedTime = ({ dateString }: { dateString: string }) => {
  const [formattedTime, setFormattedTime] = React.useState<string | null>(null);

  React.useEffect(() => {
    // This effect runs only on the client, ensuring the time is formatted in the user's timezone
    setFormattedTime(format(new Date(dateString), 'p'));
  }, [dateString]);

  // Return a placeholder or null during server-side rendering and initial client-side render
  return <>{formattedTime || ''}</>;
};


type Conversation = {
    id: string;
    jobId: string;
    participants: string[];
    lastMessage: string;
    lastMessageTimestamp: string;
    messages: { id: string; text: string; senderId: string; timestamp: string; }[];
    job: Job;
};

interface ConversationListProps {
    conversations: Conversation[];
    selectedConversation: Conversation | null;
    onSelectConversation: (conversation: Conversation) => void;
    currentUser: PlatformUser | undefined;
    getUserDetails: (id: string) => PlatformUser | undefined;
    role: string;
}

const ConversationList = ({ conversations, selectedConversation, onSelectConversation, currentUser, getUserDetails, role }: ConversationListProps) => {
    return (
        <div className={cn(
            "w-full md:w-[320px] lg:w-[380px] border-r flex flex-col",
            selectedConversation && "hidden md:flex" // Hide on mobile when a chat is selected
        )}>
             <div className="p-4 border-b">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    Job Conversations
                </h1>
             </div>
            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    {conversations.map(convo => {
                        const isSelected = selectedConversation?.id === convo.id;
                        const provider = serviceProviders.find(p => p.id === convo.job?.providerId);
                        const lastMessageSender = getUserDetails(convo.messages[convo.messages.length - 1].senderId);
                        const isMyLastMessage = lastMessageSender?.id === currentUser?.id;
                        return (
                            <button
                                key={convo.id}
                                onClick={() => onSelectConversation(convo)}
                                className={cn(
                                    "block w-full text-left p-3 rounded-lg border transition-colors",
                                    isSelected ? "bg-primary/10" : "hover:bg-primary/5"
                                )}
                            >
                                <div className="flex justify-between items-start gap-2">
                                    <p className="font-semibold text-sm truncate">{convo.job?.title}</p>
                                    <span className="text-xs text-muted-foreground shrink-0"><ClientFormattedTime dateString={convo.lastMessageTimestamp} /></span>
                                </div>
                                <div className="flex justify-between items-start gap-2 text-xs text-muted-foreground">
                                    <p className="font-extrabold truncate">ID: {convo.job?.id}</p>
                                    <p className="truncate text-right">
                                        {role === 'client' ? provider?.name : convo.job?.client}
                                    </p>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1 flex">
                                    <p className="truncate">
                                        <span className="font-medium mr-1">{isMyLastMessage ? 'You' : lastMessageSender?.name.split(' ')[0]}:</span>
                                        {convo.lastMessage}
                                    </p>
                                </div>
                            </button>
                        )
                    })}
                     {conversations.length === 0 && (
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

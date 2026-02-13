'use client';
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, Send, MessageSquare } from 'lucide-react';
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
};

type SupportMessage = {
    id: string;
    senderId: string;
    senderName: string;
    isAdmin: boolean;
    timestamp: any;
    text: string;
};

const ClientFormattedTime = ({ timestamp }: { timestamp: any }) => {
  const [formattedTime, setFormattedTime] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (timestamp) {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      setFormattedTime(format(date, 'p'));
    }
  }, [timestamp]);
  return <>{formattedTime || ''}</>;
};

const getAvatarFallback = (userName: string) => {
    return userName?.split(' ').map(n => n[0]).join('') || 'U';
}

interface ChatWindowProps {
    isMobile: boolean;
    currentThread: SupportThread | null;
    messages: SupportMessage[] | null;
    isLoadingMessages: boolean;
    onBack: () => void;
    currentUserId: string | null;
    newMessage: string;
    setNewMessage: (value: string) => void;
    handleSendMessage: () => void;
    isSubmitting: boolean;
}

const ChatWindow = ({
    isMobile,
    currentThread,
    messages,
    isLoadingMessages,
    onBack,
    currentUserId,
    newMessage,
    setNewMessage,
    handleSendMessage,
    isSubmitting
}: ChatWindowProps) => {

    if (!currentThread) {
        return (
            <div className="flex-1 hidden md:flex flex-col items-center justify-center text-center p-8 bg-muted/30">
                <MessageSquare className="w-16 h-16 text-muted-foreground/50" />
                <h2 className="mt-4 text-xl font-semibold">Select a conversation</h2>
                <p className="text-muted-foreground">Choose a support chat from the list to view the conversation.</p>
            </div>
        );
    }

    return (
        <div className={cn(
            "flex-1 flex-col",
            isMobile && !currentThread ? "hidden" : "flex",
            !isMobile && !currentThread && "hidden md:flex"
        )}>
            <div className="flex items-center gap-3 p-4 border-b">
                {isMobile && <Button variant="ghost" size="icon" onClick={onBack}><ChevronLeft /></Button>}
                <div>
                    <p className="font-semibold">{currentThread.companyName}</p>
                    <p className="text-sm text-muted-foreground">{currentThread.subject}</p>
                </div>
            </div>
            <ScrollArea className="flex-1 p-6 bg-muted/30">
                <div className="space-y-6">
                    {isLoadingMessages ? (
                        <div className="space-y-4">
                            <Skeleton className="h-16 w-3/4" />
                            <Skeleton className="h-12 w-1/2 ml-auto" />
                            <Skeleton className="h-20 w-2/3" />
                        </div>
                    ) : (messages || []).map((message, index) => {
                        const myMessage = message.senderId === currentUserId;
                        return (
                            <div key={index} className={cn("flex items-end gap-3", myMessage && "justify-end")}>
                                {!myMessage && (
                                    <Avatar className="h-8 w-8"><AvatarFallback>{getAvatarFallback(message.senderName)}</AvatarFallback></Avatar>
                                )}
                                <div className={cn("max-w-xs rounded-lg p-3", myMessage ? 'bg-primary text-primary-foreground' : 'bg-background border' )}>
                                    {!myMessage && <p className="text-xs font-semibold text-primary mb-1">{message.senderName}</p>}
                                    <p className="text-sm">{message.text}</p>
                                    <p className="text-xs mt-2 opacity-80 text-right">
                                        <ClientFormattedTime timestamp={message.timestamp} />
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                    {!isLoadingMessages && (!messages || messages.length === 0) && (
                        <div className="text-center text-muted-foreground pt-10">No messages in this chat yet.</div>
                    )}
                </div>
            </ScrollArea>
            <div className="p-4 border-t bg-background">
                <div className="flex w-full items-center gap-2">
                    <Input placeholder="Type your message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim() || isSubmitting}>{isSubmitting ? 'Sending...' : <Send className="h-4 w-4" />}</Button>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;

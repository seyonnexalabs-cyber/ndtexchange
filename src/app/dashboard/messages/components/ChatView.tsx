
'use client';
import * as React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Send, MessageSquare } from 'lucide-react';
import { cn, safeParseDate } from '@/lib/utils';
import { format } from 'date-fns';
import type { Job, PlatformUser } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

// Component to safely render formatted time on the client to avoid hydration errors
const ClientFormattedTime = ({ timestamp }: { timestamp: any }) => {
  const [formattedTime, setFormattedTime] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!timestamp) return;
    const date = safeParseDate(timestamp);
    if (date) {
        setFormattedTime(format(date, 'p'));
    }
  }, [timestamp]);

  // Render nothing on the server to prevent mismatch
  if (formattedTime === null) {
      return null;
  }

  return <>{formattedTime}</>;
};

type Message = {
    id: string;
    text: string;
    senderId: string;
    timestamp: any; // Can be Firebase Timestamp or string
};

interface ChatViewProps {
    isMobile: boolean;
    selectedJob: Job | null;
    messages: Message[];
    isLoadingMessages: boolean;
    onBack: () => void;
    currentUser: PlatformUser | null;
    getUserDetails: (id: string) => { id: string; name: string; role: string; } | undefined;
    newMessage: string;
    setNewMessage: (value: string) => void;
    handleSendMessage: () => void;
}

const ChatView = ({ isMobile, selectedJob, messages, isLoadingMessages, onBack, currentUser, getUserDetails, newMessage, setNewMessage, handleSendMessage }: ChatViewProps) => {

    const getAvatarFallback = (userName: string) => {
        return userName.split(' ').map(n => n[0]).join('');
    }

    if (!selectedJob) {
        return (
            <div className="flex-1 hidden md:flex flex-col items-center justify-center text-center p-8 bg-muted/30">
                <MessageSquare className="w-16 h-16 text-muted-foreground/50" />
                <h2 className="mt-4 text-xl font-semibold">Select a conversation</h2>
                <p className="text-muted-foreground">Choose a job conversation from the list to start chatting.</p>
            </div>
        );
    }
    
    return (
        <div className={cn("flex-1 flex-col flex")}>
            <div className="flex items-center gap-3 p-4 border-b">
                {isMobile && <Button variant="ghost" size="icon" onClick={onBack} aria-label="Go back" title="Go back"><ChevronLeft /></Button>}
                <div className="w-full">
                    <p className="font-semibold">{selectedJob.title}</p>
                    <div className="text-sm text-muted-foreground">
                        {selectedJob.client}
                        <div className="flex flex-wrap gap-1 mt-1">
                            {(selectedJob.techniques || []).map(t => <Badge key={t} variant="outline">{t}</Badge>)}
                        </div>
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1 p-6 bg-accent/5">
                <div className="space-y-2">
                    {isLoadingMessages ? (
                        <div className="space-y-4">
                            <Skeleton className="h-16 w-3/4" />
                            <Skeleton className="h-12 w-1/2 ml-auto" />
                            <Skeleton className="h-20 w-2/3" />
                        </div>
                    ) : messages.map((message, index) => {
                        const sender = getUserDetails(message.senderId);
                        const myMessage = sender?.id === currentUser?.id;
                        
                        return (
                            <React.Fragment key={message.id}>
                                <div className={cn("flex items-end gap-3", myMessage && "justify-end")}>
                                    {!myMessage && sender && (
                                        <Avatar className="h-8 w-8 self-end">
                                            <AvatarFallback>{getAvatarFallback(sender.name)}</AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={cn(
                                        "max-w-xs rounded-lg p-3", 
                                        myMessage ? 'bg-primary text-primary-foreground' : 'bg-background border' 
                                    )}>
                                        {!myMessage && <p className="text-xs font-semibold text-primary mb-1">{sender?.name}</p>}
                                        <p className="text-sm">{message.text}</p>
                                        <p className="text-xs mt-2 opacity-80 text-right">
                                            <ClientFormattedTime timestamp={message.timestamp} />
                                        </p>
                                    </div>
                                </div>
                            </React.Fragment>
                        )
                    })}
                    {!isLoadingMessages && messages.length === 0 && (
                        <div className="text-center text-muted-foreground pt-10">No messages in this chat yet.</div>
                    )}
                </div>
            </ScrollArea>

            <div className="p-4 border-t bg-background">
               <div className="flex w-full items-center gap-2">
                    <Input 
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}><Send className="h-4 w-4" /></Button>
               </div>
            </div>
       </div>
    );
};

export default ChatView;

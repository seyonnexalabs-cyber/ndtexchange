'use client';
import * as React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Send, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isSameDay } from 'date-fns';
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

interface ChatViewProps {
    isMobile: boolean;
    selectedConversation: Conversation | null;
    onBack: () => void;
    currentUser: PlatformUser | undefined;
    getUserDetails: (id: string) => PlatformUser | undefined;
    newMessage: string;
    setNewMessage: (value: string) => void;
    handleSendMessage: () => void;
}

const ChatView = ({ isMobile, selectedConversation, onBack, currentUser, getUserDetails, newMessage, setNewMessage, handleSendMessage }: ChatViewProps) => {

    const getAvatarFallback = (userName: string) => {
        return userName.split(' ').map(n => n[0]).join('');
    }

    if (!selectedConversation) {
        return (
            <div className="flex-1 hidden md:flex flex-col items-center justify-center text-center p-8 bg-muted/30">
                <MessageSquare className="w-16 h-16 text-muted-foreground/50" />
                <h2 className="mt-4 text-xl font-semibold">Select a conversation</h2>
                <p className="text-muted-foreground">Choose a job conversation from the list to start chatting.</p>
            </div>
        );
    }
    
    return (
        <div className={cn(
            "flex-1 flex-col flex",
        )}>
            {/* Chat Header */}
            <div className="flex items-center gap-3 p-4 border-b">
                {isMobile && <Button variant="ghost" size="icon" onClick={onBack}><ChevronLeft /></Button>}
                <div className="w-full">
                    <p className="font-semibold">{selectedConversation.job.title}</p>
                    <div className="text-sm text-muted-foreground">
                        {selectedConversation.job.client}
                        {selectedConversation.job.providerId && ` - ${serviceProviders.find(p => p.id === selectedConversation.job.providerId)?.name}`}
                        <Badge variant="outline" className="ml-2">{selectedConversation.job.technique}</Badge>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-6 bg-accent/5">
                <div className="space-y-2">
                    {selectedConversation.messages?.map((message, index) => {
                        const sender = getUserDetails(message.senderId);
                        const myMessage = sender?.id === currentUser?.id;
                        
                        const messageDate = new Date(message.timestamp);
                        const prevMessage = selectedConversation.messages[index - 1];
                        const prevMessageDate = prevMessage ? new Date(prevMessage.timestamp) : null;
                        const showDateSeparator = !prevMessageDate || !isSameDay(messageDate, prevMessageDate);

                        return (
                            <React.Fragment key={message.id}>
                                {showDateSeparator && (
                                    <div className="text-center text-xs text-muted-foreground my-4 font-semibold tracking-wider uppercase">
                                        {format(messageDate, 'MMMM d, yyyy')}
                                    </div>
                                )}
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
                                            <ClientFormattedTime dateString={message.timestamp} />
                                        </p>
                                    </div>
                                </div>
                            </React.Fragment>
                        )
                    })}
                </div>
            </ScrollArea>

            {/* Input */}
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

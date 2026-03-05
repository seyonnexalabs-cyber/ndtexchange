
'use client';
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChevronLeft, Send, MessageSquare } from 'lucide-react';
import { cn, safeParseDate } from '@/lib/utils';
import { format } from 'date-fns';

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
    const date = safeParseDate(timestamp);
    if(date) {
        setFormattedTime(format(date, 'p'));
    }
  }, [timestamp]);
  
  if(formattedTime === null) return null;

  return <>{formattedTime}</>;
};

const getAvatarFallback = (userName: string) => {
    return userName.split(' ').map(n => n[0]).join('');
}

interface AdminChatInterfaceProps {
    isMobile: boolean,
    supportThreadsData: SupportThread[] | null,
    selectedThreadId: string | null,
    setSelectedThreadId: (id: string | null) => void,
    currentThread: SupportThread | null,
    messages: SupportMessage[] | null,
    newMessage: string,
    setNewMessage: (msg: string) => void,
    handleSendMessage: () => void,
    isSubmitting: boolean
}

const AdminChatInterface = ({
    isMobile,
    supportThreadsData,
    selectedThreadId,
    setSelectedThreadId,
    currentThread,
    messages,
    newMessage,
    setNewMessage,
    handleSendMessage,
    isSubmitting
}: AdminChatInterfaceProps) => {
    return (
        <Card className="h-[70vh] flex overflow-hidden">
            <div className={cn(
                "w-full md:w-[320px] lg:w-[380px] border-r flex flex-col",
                isMobile && selectedThreadId && "hidden"
            )}>
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
                                    <span className="text-xs text-muted-foreground shrink-0"><ClientFormattedTime timestamp={thread.lastMessageTimestamp} /></span>
                                </div>
                                <p className="text-xs text-muted-foreground truncate">{thread.subject}</p>
                                <p className="text-xs text-muted-foreground mt-1 truncate">{thread.lastMessage}</p>
                            </button>
                        ))}
                        {supportThreadsData?.length === 0 && <p className="p-4 text-center text-muted-foreground">No open support chats.</p>}
                    </div>
                </ScrollArea>
            </div>
            <div className={cn(
                "flex-1 flex-col",
                isMobile && !selectedThreadId ? "hidden" : "flex",
                !isMobile && !selectedThreadId && "hidden md:flex"
            )}>
                {currentThread ? (
                     <>
                        <div className="flex items-center gap-3 p-4 border-b">
                            {isMobile && <Button variant="ghost" size="icon" onClick={() => setSelectedThreadId(null)}><ChevronLeft /></Button>}
                            <div>
                                <p className="font-semibold">{currentThread.companyName}</p>
                                <p className="text-sm text-muted-foreground">{currentThread.subject}</p>
                            </div>
                        </div>
                         <ScrollArea className="flex-1 p-6 bg-muted/30">
                            <div className="space-y-6">
                                {messages?.map((message, index) => {
                                    const myMessage = message.isAdmin;
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
                            </div>
                        </ScrollArea>
                        <div className="p-4 border-t bg-background">
                            <div className="flex w-full items-center gap-2">
                                <Input placeholder="Type your message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} />
                                <Button onClick={handleSendMessage} disabled={!newMessage.trim() || isSubmitting}>{isSubmitting ? 'Sending...' : <Send className="h-4 w-4" />}</Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 hidden md:flex flex-col items-center justify-center text-center p-8 bg-muted/30">
                        <MessageSquare className="w-16 h-16 text-muted-foreground/50" />
                        <h2 className="mt-4 text-xl font-semibold">Select a conversation</h2>
                        <p className="text-muted-foreground">Choose a support chat from the list to view the conversation.</p>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default AdminChatInterface;

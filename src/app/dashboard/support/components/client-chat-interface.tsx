'use client';
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { PlatformUser } from '@/lib/placeholder-data';


type SupportMessage = {
    id: string;
    senderId: string;
    senderName: string;
    isAdmin: boolean;
    timestamp: any;
    text: string;
};


interface ClientChatInterfaceProps {
    currentUser: PlatformUser | undefined,
    messages: SupportMessage[] | null,
    authUser: any | null,
    newMessage: string,
    setNewMessage: (msg: string) => void,
    handleSendMessage: () => void,
    isSubmitting: boolean
}

const ClientChatInterface = ({
    currentUser,
    messages,
    authUser,
    newMessage,
    setNewMessage,
    handleSendMessage,
    isSubmitting
}: ClientChatInterfaceProps) => {
    return (
        <Card className="flex flex-col h-[70vh]">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><MessageSquare className="text-primary" /> Live Chat Support</CardTitle>
                <CardDescription>
                    You are in the shared support channel for {currentUser?.company}. All messages are visible to your company's admins and our support team.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 p-6 bg-muted/30">
                    <div className="space-y-6">
                        {messages?.map((message, index) => {
                            const myMessage = message.senderId === authUser?.uid;
                            return (
                                <div key={index} className={cn("flex items-end gap-3", myMessage && "justify-end")}>
                                    {!myMessage && (
                                        <Avatar className="h-8 w-8"><AvatarFallback>SA</AvatarFallback></Avatar>
                                    )}
                                    <div className={cn("max-w-xs rounded-lg p-3", myMessage ? 'bg-primary text-primary-foreground' : 'bg-background border' )}>
                                        {!myMessage && <p className="text-xs font-semibold text-primary mb-1">Support Agent</p>}
                                        <p className="text-sm">{message.text}</p>
                                        <p className="text-xs mt-2 opacity-80 text-right">
                                            {message.timestamp?.toDate ? format(message.timestamp.toDate(), 'p') : 'sending...'}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                        {(messages === null || messages?.length === 0) && (
                            <div className="text-center text-muted-foreground">Start the conversation by sending a message.</div>
                        )}
                    </div>
                </ScrollArea>
                <div className="p-4 border-t bg-background">
                    <div className="flex w-full items-center gap-2">
                        <Input placeholder="Type your message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} />
                        <Button onClick={handleSendMessage} disabled={!newMessage.trim() || isSubmitting}>{isSubmitting ? 'Sending...' : <Send className="h-4 w-4" />}</Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
export default ClientChatInterface;

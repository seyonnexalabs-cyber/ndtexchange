
'use client';

import { Job, allUsers, PlatformUser, jobChats as initialJobChats } from '@/lib/placeholder-data';
import { serviceProviders } from '@/lib/service-providers-data';
import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { jobs } from '@/lib/placeholder-data';

export default function MessagesPage() {
    const searchParams = useSearchParams();
    const isMobile = useIsMobile();
    const role = searchParams.get('role') || 'client';
    
    const [jobChatsData, setJobChatsData] = useState(initialJobChats);
    const [jobsData] = useState(jobs);

    const currentUser = useMemo(() => {
        const userMap: { [key: string]: PlatformUser | undefined } = {
            client: allUsers.find(u => u.id === 'user-client-01'),
            inspector: allUsers.find(u => u.id === 'user-tech-05'),
            auditor: allUsers.find(u => u.id === 'user-auditor-01'),
            admin: allUsers.find(u => u.id === 'user-admin-01'),
        };
        return userMap[role] || allUsers.find(u => u.id === 'user-client-01')!;
    }, [role]);

    const conversations = useMemo(() => {
        if (!currentUser) return [];
        return jobChatsData
            .filter(chat => chat.participants.includes(currentUser.id))
            .map(chat => {
                const job = jobsData.find(j => j.id === chat.jobId);
                return { ...chat, job }; // combine chat and job info
            })
            .filter((c): c is typeof c & { job: Job } => !!c.job) // Type guard
            .sort((a,b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime());
    }, [jobChatsData, currentUser, jobsData]);
    
    const [selectedConversation, setSelectedConversation] = useState<typeof conversations[0] | null>(null);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        if (!isMobile && !selectedConversation && conversations.length > 0) {
            setSelectedConversation(conversations[0]);
        }
    }, [isMobile, selectedConversation, conversations]);

    const handleSendMessage = () => {
        if (!newMessage.trim() || !currentUser || !selectedConversation) return;

        const message = {
            id: `MSG-${Date.now()}`,
            senderId: currentUser.id,
            timestamp: new Date().toISOString(),
            text: newMessage.trim(),
        };
        
        const updatedConversation = {
            ...selectedConversation,
            messages: [...(selectedConversation.messages || []), message],
            lastMessage: message.text,
            lastMessageTimestamp: message.timestamp,
        };

        setSelectedConversation(updatedConversation);
        setJobChatsData(prevChats => prevChats.map(chat => chat.id === selectedConversation.id ? updatedConversation : chat));
        setNewMessage('');
    };

    const getUserDetails = (senderId: string) => {
        return allUsers.find(u => u.id === senderId);
    }
    
    const getAvatarFallback = (userName: string) => {
        return userName.split(' ').map(n => n[0]).join('');
    }


    return (
        <Card className="h-[calc(100vh_-_theme(spacing.16)_-_theme(spacing.12))] flex overflow-hidden">
            {/* Conversation List Column */}
            <div className={cn(
                "w-full md:w-[320px] lg:w-[380px] border-r flex flex-col",
                selectedConversation && "hidden md:flex" // Hide on mobile when a chat is selected
            )}>
                 <div className="p-4 border-b">
                    <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                        <MessageSquare className="text-primary" />
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
                                    onClick={() => setSelectedConversation(convo)}
                                    className={cn(
                                        "block w-full text-left p-3 rounded-lg border transition-colors",
                                        isSelected ? "bg-primary/10" : "hover:bg-primary/5"
                                    )}
                                >
                                    <p className="font-semibold text-sm truncate">{convo.job?.title}</p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {role === 'client' ? provider?.name : convo.job?.client}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate mt-1">
                                        <span className="font-medium">{isMyLastMessage ? 'You' : lastMessageSender?.name.split(' ')[0]}:</span> {convo.lastMessage}
                                    </p>
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

            {/* Chat View Column */}
            <div className={cn(
                "flex-1 flex-col",
                selectedConversation ? "flex" : "hidden md:flex" // Show when selected, or on desktop if nothing is selected
            )}>
                {selectedConversation ? (
                   <>
                        {/* Chat Header */}
                        <div className="flex items-center gap-3 p-4 border-b">
                            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedConversation(null)}>
                                <ChevronLeft />
                            </Button>
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
                            <div className="space-y-6">
                                {selectedConversation.messages?.map((message, index) => {
                                    const sender = getUserDetails(message.senderId);
                                    const myMessage = sender?.id === currentUser?.id;
                                    return (
                                        <div key={index} className={cn("flex items-end gap-3", myMessage && "justify-end")}>
                                            {!myMessage && sender && (
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback>{getAvatarFallback(sender.name)}</AvatarFallback>
                                                </Avatar>
                                            )}
                                            <div className={cn("max-w-xs md:max-w-md rounded-lg p-3", myMessage ? 'bg-primary text-primary-foreground' : 'bg-accent/10 border' )}>
                                                <p className="text-sm font-chat">{message.text}</p>
                                                <p className="text-xs mt-2 opacity-80">
                                                    {sender?.name} · {format(new Date(message.timestamp), 'p')}
                                                </p>
                                            </div>
                                        </div>
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
                   </>
                ) : (
                    <div className="flex-1 hidden md:flex flex-col items-center justify-center text-center p-8 bg-muted/30">
                        <MessageSquare className="w-16 h-16 text-muted-foreground/50" />
                        <h2 className="mt-4 text-xl font-semibold">Select a conversation</h2>
                        <p className="text-muted-foreground">Choose a job conversation from the list to start chatting.</p>
                    </div>
                )}
            </div>
        </Card>
    );
};

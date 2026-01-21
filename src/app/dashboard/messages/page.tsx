'use client';

import { jobs, Job, JobMessage, supportThreads, SupportThread, SupportMessage, allUsers, PlatformUser } from '@/lib/placeholder-data';
import { serviceProviders } from '@/lib/service-providers-data';
import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { MessageSquare, Send, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { cn, GLOBAL_DATETIME_FORMAT } from '@/lib/utils';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';

export default function MessagesPage() {
    const searchParams = useSearchParams();
    const isMobile = useIsMobile();
    const role = searchParams.get('role') || 'client';
    
    const conversations = useMemo(() => supportThreads.sort((a,b) => new Date(b.messages[b.messages.length - 1].timestamp).getTime() - new Date(a.messages[a.messages.length - 1].timestamp).getTime()), []);
    
    const [selectedThread, setSelectedThread] = useState<SupportThread | null>(null);

     const currentUser = useMemo(() => {
        const userMap: { [key: string]: PlatformUser | undefined } = {
        client: allUsers.find(u => u.id === 'user-client-01'),
        inspector: allUsers.find(u => u.id === 'user-tech-05'),
        auditor: allUsers.find(u => u.id === 'user-auditor-01'),
        admin: allUsers.find(u => u.id === 'user-admin-01'),
        };
        return userMap[role] || userMap.client;
    }, [role]);

    useEffect(() => {
        if (!isMobile && !selectedThread && conversations.length > 0) {
            const userCompany = currentUser?.company;
            const userThread = conversations.find(c => c.userCompany === userCompany);
            setSelectedThread(userThread || conversations[0]);
        }
    }, [isMobile, selectedThread, conversations, currentUser]);


    const isMyMessage = (message: SupportMessage) => {
        if (!currentUser || !message.userId) return false;
        return message.userId === currentUser.id;
    }

    return (
        <Card className="h-[calc(100vh_-_theme(spacing.16)_-_theme(spacing.12))] flex overflow-hidden">
            {/* Conversation List Column */}
            <div className={cn(
                "w-full md:w-[320px] lg:w-[380px] border-r flex flex-col",
                selectedThread && "hidden md:flex" // Hide on mobile when a chat is selected
            )}>
                 <div className="p-4 border-b">
                    <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                        <MessageSquare />
                        Conversations
                    </h1>
                 </div>
                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1">
                        {conversations.map(thread => {
                            const lastMessage = thread.messages![thread.messages!.length - 1];
                            const isSelected = selectedThread?.id === thread.id;
                            return (
                                <button
                                    key={thread.id}
                                    onClick={() => setSelectedThread(thread)}
                                    className={cn(
                                        "block w-full text-left p-3 rounded-lg border transition-colors",
                                        isSelected ? "bg-primary/10" : "hover:bg-primary/5"
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        <Avatar>
                                            <AvatarFallback>{thread.userCompany.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-grow overflow-hidden min-w-0">
                                            <div className="flex justify-between items-baseline">
                                                <p className="font-semibold text-sm truncate">{thread.userCompany}</p>
                                                <p className="text-xs text-muted-foreground shrink-0 ml-2">{format(new Date(lastMessage.timestamp), 'p')}</p>
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate">{thread.subject}</p>
                                            <p className="text-xs text-muted-foreground truncate mt-1">{isMyMessage(lastMessage) ? 'You' : lastMessage.user}: {lastMessage.message}</p>
                                        </div>
                                    </div>
                                </button>
                            )
                        })}
                         {conversations.length === 0 && (
                            <div className="text-center text-muted-foreground py-10">
                                No active conversations.
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Chat View Column */}
            <div className={cn(
                "flex-1 flex-col",
                selectedThread ? "flex" : "hidden md:flex" // Show when selected, or on desktop if nothing is selected
            )}>
                {selectedThread ? (
                   <>
                        {/* Chat Header */}
                        <div className="flex items-center gap-3 p-4 border-b">
                            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedThread(null)}>
                                <ChevronLeft />
                            </Button>
                             <Avatar>
                                <AvatarFallback>{selectedThread.userCompany.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{selectedThread.userCompany}</p>
                                <p className="text-sm text-muted-foreground">
                                    Support Thread
                                </p>
                            </div>
                        </div>

                        {/* Messages */}
                         <ScrollArea className="flex-1 p-6 bg-accent/5">
                            <div className="space-y-6">
                                {selectedThread.messages?.map((message, index) => {
                                    const myMessage = isMyMessage(message);
                                    return (
                                        <div key={index} className={cn("flex items-end gap-3", myMessage && "justify-end")}>
                                            {!myMessage && (
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback>{message.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                </Avatar>
                                            )}
                                            <div className={cn("max-w-xs md:max-w-md rounded-lg p-3", myMessage ? 'bg-primary text-primary-foreground' : 'bg-background border' )}>
                                                <p className="text-sm">{message.message}</p>
                                                <p className="text-xs mt-2 opacity-80">
                                                    {message.user} · {format(new Date(message.timestamp), 'p')}
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
                                <Input placeholder="Type your message..." />
                                <Button><Send className="h-4 w-4" /></Button>
                           </div>
                        </div>
                   </>
                ) : (
                    <div className="flex-1 hidden md:flex flex-col items-center justify-center text-center p-8 bg-muted/30">
                        <MessageSquare className="w-16 h-16 text-muted-foreground/50" />
                        <h2 className="mt-4 text-xl font-semibold">Select a conversation</h2>
                        <p className="text-muted-foreground">Choose a conversation from the list to start chatting.</p>
                    </div>
                )}
            </div>
        </Card>
    );
};
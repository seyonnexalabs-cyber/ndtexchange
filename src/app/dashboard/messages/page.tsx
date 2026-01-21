'use client';

import { jobs, Job, JobMessage } from '@/lib/placeholder-data';
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

const roleStyles: { [key: string]: string } = {
  client: 'bg-role-client text-role-client-foreground',
  inspector: 'bg-role-inspector text-role-inspector-foreground',
  auditor: 'bg-role-auditor text-role-auditor-foreground',
  admin: 'bg-role-admin text-role-admin-foreground',
};


export default function MessagesPage() {
    const searchParams = useSearchParams();
    const isMobile = useIsMobile();
    const role = searchParams.get('role') || 'client';
    
    const conversations = useMemo(() => jobs.filter(job => job.messages && job.messages.length > 0).sort((a,b) => new Date(b.messages![b.messages!.length - 1].timestamp).getTime() - new Date(a.messages![a.messages!.length - 1].timestamp).getTime()), []);
    
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);

    useEffect(() => {
        // Set a default selection on desktop view if no job is selected
        if (!isMobile && !selectedJob && conversations.length > 0) {
            setSelectedJob(conversations[0]);
        }
    }, [isMobile, selectedJob, conversations]);


    const isMyMessage = (message: JobMessage) => {
        if (!role || !message.role) return false;
        return message.role.toLowerCase() === role;
    }

    return (
        <Card className="h-[calc(100vh_-_theme(spacing.16)_-_theme(spacing.12))] flex overflow-hidden">
            {/* Conversation List Column */}
            <div className={cn(
                "w-full md:w-[320px] lg:w-[380px] border-r flex flex-col",
                selectedJob && "hidden md:flex" // Hide on mobile when a chat is selected
            )}>
                 <div className="p-4 border-b">
                    <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                        <MessageSquare />
                        Conversations
                    </h1>
                 </div>
                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1">
                        {conversations.map(job => {
                            const lastMessage = job.messages![job.messages!.length - 1];
                            const isSelected = selectedJob?.id === job.id;
                            return (
                                <button
                                    key={job.id}
                                    onClick={() => setSelectedJob(job)}
                                    className={cn(
                                        "block w-full text-left p-4 rounded-lg border transition-colors",
                                        isSelected ? "bg-accent" : "hover:bg-muted"
                                    )}
                                >
                                    <div className="flex items-start gap-4">
                                        <Avatar>
                                            <AvatarFallback>{job.client.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-grow overflow-hidden">
                                            <div className="flex justify-between items-baseline">
                                                <p className="font-semibold text-base truncate">{job.title}</p>
                                                <p className="text-sm text-muted-foreground shrink-0 ml-2">{format(new Date(lastMessage.timestamp), 'p')}</p>
                                            </div>
                                            <p className="text-sm text-muted-foreground truncate">{job.client}</p>
                                            <p className="text-sm text-muted-foreground truncate mt-1">{isMyMessage(lastMessage) ? 'You' : lastMessage.user}: {lastMessage.message}</p>
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
                selectedJob ? "flex" : "hidden md:flex" // Show when selected, or on desktop if nothing is selected
            )}>
                {selectedJob ? (
                   <>
                        {/* Chat Header */}
                        <div className="flex items-center gap-3 p-4 border-b">
                            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedJob(null)}>
                                <ChevronLeft />
                            </Button>
                             <Avatar>
                                <AvatarFallback>{selectedJob.client.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{selectedJob.title}</p>
                                <p className="text-sm text-muted-foreground">
                                    {selectedJob?.client} & {serviceProviders.find(p => p.id === selectedJob?.providerId)?.name || 'Provider'}
                                </p>
                            </div>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-6 bg-muted/20">
                            <div className="space-y-6">
                                {selectedJob.messages?.map((message, index) => {
                                    const myMessage = isMyMessage(message);
                                    const messageStyle = roleStyles[message.role.toLowerCase()] || 'bg-background border';
                                    return (
                                        <div key={index} className={cn("flex items-end gap-3", myMessage && "justify-end")}>
                                            {!myMessage && (
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback>{message.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                </Avatar>
                                            )}
                                            <div className={cn("max-w-xs md:max-w-md rounded-lg p-3", messageStyle)}>
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
                    <div className="flex-1 hidden md:flex flex-col items-center justify-center text-center p-8">
                        <MessageSquare className="w-16 h-16 text-muted-foreground/50" />
                        <h2 className="mt-4 text-xl font-semibold">Select a conversation</h2>
                        <p className="text-muted-foreground">Choose a conversation from the list to start chatting.</p>
                    </div>
                )}
            </div>
        </Card>
    );
};

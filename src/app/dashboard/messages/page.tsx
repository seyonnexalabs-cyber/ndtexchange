'use client';

import { jobs, Job, JobMessage } from '@/lib/placeholder-data';
import { serviceProviders } from '@/lib/service-providers-data';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { cn, GLOBAL_DATETIME_FORMAT } from '@/lib/utils';
import { format } from 'date-fns';

export default function MessagesPage() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'client';
    const conversations = useMemo(() => jobs.filter(job => job.messages && job.messages.length > 0).sort((a,b) => new Date(b.messages![b.messages!.length - 1].timestamp).getTime() - new Date(a.messages![a.messages!.length - 1].timestamp).getTime()), []);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);

    const isMyMessage = (message: JobMessage) => {
        if (!role || !message.role) return false;
        return message.role.toLowerCase() === role;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <MessageSquare />
                    Conversations
                </h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Job Conversations</CardTitle>
                    <CardDescription>
                        Recent conversations from your active jobs. Click a conversation to open the chat.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {conversations.map(job => {
                            const lastMessage = job.messages![job.messages!.length - 1];
                            return (
                                <button
                                    key={job.id}
                                    onClick={() => setSelectedJob(job)}
                                    className="block w-full text-left p-4 rounded-lg border hover:bg-accent transition-colors"
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
                </CardContent>
            </Card>

            <Dialog open={!!selectedJob} onOpenChange={(open) => {if (!open) setSelectedJob(null)}}>
                <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0">
                    <DialogHeader className="p-6 pb-4 border-b">
                        <DialogTitle>{selectedJob?.title}</DialogTitle>
                        <DialogDescription>
                            Conversation with {selectedJob?.client} and {serviceProviders.find(p => p.id === selectedJob?.providerId)?.name || 'Provider'}.
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="flex-grow p-6 bg-muted/20">
                        <div className="space-y-6">
                            {selectedJob?.messages?.map((message, index) => {
                                const myMessage = isMyMessage(message);
                                return (
                                    <div key={index} className={cn("flex items-end gap-3", myMessage && "justify-end")}>
                                        {!myMessage && (
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>{message.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div className={cn(
                                            "max-w-xs md:max-w-md rounded-lg p-3",
                                            myMessage ? "bg-primary text-primary-foreground" : "bg-background border"
                                        )}>
                                            <p className="text-sm">{message.message}</p>
                                             <p className={cn(
                                                "text-xs mt-2",
                                                myMessage ? "text-primary-foreground/70" : "text-muted-foreground"
                                             )}>
                                                {message.user} · {format(new Date(message.timestamp), 'p')}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </ScrollArea>
                    <DialogFooter className="p-4 border-t bg-background">
                       <div className="flex w-full items-center gap-2">
                            <Input placeholder="Type your message..." />
                            <Button><Send className="h-4 w-4" /></Button>
                       </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

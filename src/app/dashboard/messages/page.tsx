'use client';

import { jobs as initialJobs, Job, JobMessage, allUsers, PlatformUser } from '@/lib/placeholder-data';
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
import { cn, GLOBAL_DATETIME_FORMAT } from '@/lib/utils';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';

export default function MessagesPage() {
    const searchParams = useSearchParams();
    const isMobile = useIsMobile();
    const role = searchParams.get('role') || 'client';
    
    // Using state to manage jobs data to allow for in-memory message updates
    const [jobsData, setJobsData] = useState(initialJobs);

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
        let relevantJobs: Job[];
        switch(role) {
            case 'client':
                relevantJobs = jobsData.filter(j => j.client === currentUser.company);
                break;
            case 'inspector':
                relevantJobs = jobsData.filter(j => j.providerId && serviceProviders.find(p => p.id === j.providerId)?.name === currentUser.company);
                break;
            case 'auditor':
                 relevantJobs = jobsData.filter(j => j.workflow === 'level3' || j.workflow === 'auto');
                break;
            case 'admin':
                relevantJobs = jobsData;
                break;
            default:
                relevantJobs = [];
        }

        return relevantJobs
            .filter(job => job.messages && job.messages.length > 0)
            .sort((a,b) => 
                new Date(b.messages![b.messages!.length - 1].timestamp).getTime() - 
                new Date(a.messages![a.messages!.length - 1].timestamp).getTime()
            );
    }, [jobsData, role, currentUser.company]);
    
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        if (!isMobile && !selectedJob && conversations.length > 0) {
            setSelectedJob(conversations[0]);
        }
    }, [isMobile, selectedJob, conversations]);

    const handleSendMessage = () => {
        if (!newMessage.trim() || !currentUser || !selectedJob) return;

        const message: JobMessage = {
            user: currentUser.name,
            role: currentUser.role.split(' ')[0] as 'Client' | 'Inspector' | 'Auditor',
            timestamp: new Date().toISOString(),
            message: newMessage.trim(),
        };
        
        // This is an in-memory update for demonstration.
        const updatedJob = {
            ...selectedJob,
            messages: [...(selectedJob.messages || []), message]
        };

        setSelectedJob(updatedJob);
        setJobsData(prevJobs => prevJobs.map(job => job.id === selectedJob.id ? updatedJob : job));
        setNewMessage('');
    };

    const isMyMessage = (message: JobMessage) => {
        if (!currentUser || !message.user) return false;
        return message.user === currentUser.name;
    }
    
    const getAvatarFallback = (userName: string) => {
        const user = allUsers.find(u => u.name === userName);
        return user ? user.name.split(' ').map(n => n[0]).join('') : 'U';
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
                        Job Conversations
                    </h1>
                 </div>
                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1">
                        {conversations.map(job => {
                            const lastMessage = job.messages![job.messages!.length - 1];
                            const isSelected = selectedJob?.id === job.id;
                            const provider = serviceProviders.find(p => p.id === job.providerId);
                            return (
                                <button
                                    key={job.id}
                                    onClick={() => setSelectedJob(job)}
                                    className={cn(
                                        "block w-full text-left p-3 rounded-lg border transition-colors",
                                        isSelected ? "bg-primary/10" : "hover:bg-primary/5"
                                    )}
                                >
                                    <p className="font-semibold text-sm truncate">{job.title}</p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {role === 'client' ? provider?.name : job.client}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate mt-1">
                                        <span className="font-medium">{isMyMessage(lastMessage) ? 'You' : lastMessage.user.split(' ')[0]}:</span> {lastMessage.message}
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
                selectedJob ? "flex" : "hidden md:flex" // Show when selected, or on desktop if nothing is selected
            )}>
                {selectedJob ? (
                   <>
                        {/* Chat Header */}
                        <div className="flex items-center gap-3 p-4 border-b">
                            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedJob(null)}>
                                <ChevronLeft />
                            </Button>
                            <div className="w-full">
                                <p className="font-semibold">{selectedJob.title}</p>
                                <div className="text-sm text-muted-foreground">
                                    {selectedJob.client}
                                    {selectedJob.providerId && ` - ${serviceProviders.find(p => p.id === selectedJob.providerId)?.name}`}
                                    <Badge variant="outline" className="ml-2">{selectedJob.technique}</Badge>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                         <ScrollArea className="flex-1 p-6 bg-accent/5">
                            <div className="space-y-6">
                                {selectedJob.messages?.map((message, index) => {
                                    const myMessage = isMyMessage(message);
                                    return (
                                        <div key={index} className={cn("flex items-end gap-3", myMessage && "justify-end")}>
                                            {!myMessage && (
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback>{getAvatarFallback(message.user)}</AvatarFallback>
                                                </Avatar>
                                            )}
                                            <div className={cn("max-w-xs md:max-w-md rounded-lg p-3", myMessage ? 'bg-primary text-primary-foreground' : 'bg-accent/10 border' )}>
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
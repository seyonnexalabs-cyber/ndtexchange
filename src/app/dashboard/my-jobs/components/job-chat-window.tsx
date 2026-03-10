
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';
import type { Job, PlatformUser } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { useFirebase, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, query, where, orderBy, serverTimestamp, addDoc, doc } from 'firebase/firestore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn, safeParseDate } from '@/lib/utils';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const ClientFormattedTime = ({ timestamp }: { timestamp: any }) => {
    const [formattedTime, setFormattedTime] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!timestamp) return;
        const date = safeParseDate(timestamp);
        if (date) {
            setFormattedTime(format(date, 'p'));
        }
    }, [timestamp]);

    if (formattedTime === null) {
        return null;
    }

    return <>{formattedTime}</>;
};

const getAvatarFallback = (userName?: string) => {
    if (!userName) return '??';
    return userName.split(' ').map(n => n[0]).join('');
};

interface JobChatWindowProps {
    job: Job;
}

export default function JobChatWindow({ job }: JobChatWindowProps) {
    const { firestore } = useFirebase();
    const { user: authUser } = useUser();
    const [newMessage, setNewMessage] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const scrollAreaRef = React.useRef<HTMLDivElement>(null);

    const { data: currentUser } = useDoc<PlatformUser>(
        useMemoFirebase(() => (authUser ? doc(firestore, 'users', authUser.uid) : null), [authUser, firestore])
    );
    
    const participantIds = React.useMemo(() => {
        const ids = new Set<string>();
        if(job.userId) ids.add(job.userId);
        if(job.providerCompanyId) {
            // In a real app, you'd fetch users for this company. For now, this is a limitation.
        }
        return Array.from(ids);
    }, [job]);

    const usersQuery = useMemoFirebase(() => {
        if(!firestore || participantIds.length === 0) return null;
        return query(collection(firestore, 'users'), where('id', 'in', participantIds.slice(0, 10)));
    }, [firestore, participantIds]);

    const { data: participants } = useCollection<PlatformUser>(usersQuery);

    const messagesQuery = useMemoFirebase(() => {
        if (!firestore || !job.id) return null;
        return query(collection(firestore, 'messages'), where('jobId', '==', job.id), orderBy('timestamp', 'asc'));
    }, [firestore, job.id]);

    const { data: messages, isLoading: isLoadingMessages } = useCollection<any>(messagesQuery);
    
    const getUserDetails = (senderId: string) => {
        return participants?.find(p => p.id === senderId);
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !currentUser || !job || !firestore) return;
        setIsSubmitting(true);

        const messageData = {
            jobId: job.id,
            senderId: currentUser.id,
            senderName: currentUser.name,
            text: newMessage.trim(),
            timestamp: serverTimestamp(),
        };

        try {
            await addDoc(collection(firestore, 'messages'), messageData);
            setNewMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    React.useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <MessageSquare className="w-6 h-6 text-primary" />
                    Job Communication
                </CardTitle>
                <CardDescription>Chat with all parties involved in this job.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow p-0">
                <ScrollArea className="h-full p-6 bg-muted/30" ref={scrollAreaRef as any}>
                    <div className="space-y-6">
                        {isLoadingMessages ? (
                            <div className="space-y-4">
                                <Skeleton className="h-16 w-3/4" />
                                <Skeleton className="h-12 w-1/2 ml-auto" />
                                <Skeleton className="h-20 w-2/3" />
                            </div>
                        ) : messages?.map((message) => {
                            const sender = getUserDetails(message.senderId);
                            const myMessage = message.senderId === currentUser?.id;
                            return (
                                <div key={message.id} className={cn("flex items-end gap-3", myMessage && "justify-end")}>
                                    {!myMessage && (
                                        <Avatar className="h-8 w-8 self-end">
                                            <AvatarFallback>{getAvatarFallback(sender?.name)}</AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={cn("max-w-xs rounded-lg p-3", myMessage ? 'bg-primary text-primary-foreground' : 'bg-background border' )}>
                                        {!myMessage && <p className="text-xs font-semibold text-primary mb-1">{sender?.name || 'Unknown User'}</p>}
                                        <p className="text-sm">{message.text}</p>
                                        <p className="text-xs mt-2 opacity-80 text-right"><ClientFormattedTime timestamp={message.timestamp} /></p>
                                    </div>
                                </div>
                            )
                        })}
                         {!isLoadingMessages && messages?.length === 0 && (
                            <div className="text-center text-muted-foreground pt-10">No messages yet.</div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="p-4 border-t bg-background">
                <div className="flex w-full items-center gap-2">
                    <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                        disabled={isSubmitting}
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim() || isSubmitting}>
                        {isSubmitting ? 'Sending...' : <Send className="h-4 w-4" />}
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}

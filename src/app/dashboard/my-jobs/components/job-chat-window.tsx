'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, ChevronUp, ChevronDown } from 'lucide-react';
import { cn, GLOBAL_DATETIME_FORMAT } from '@/lib/utils';
import { format } from 'date-fns';
import { Job, JobMessage, PlatformUser, allUsers } from '@/lib/placeholder-data';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

interface JobChatWindowProps {
    job: Job;
    onSendMessage: (message: string) => void;
}

export default function JobChatWindow({ job, onSendMessage }: JobChatWindowProps) {
    const [isOpen, setIsOpen] = React.useState(true);
    const [newMessage, setNewMessage] = React.useState('');
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'client';

    const currentUser = useMemo(() => {
        const userMap: { [key: string]: PlatformUser | undefined } = {
            client: allUsers.find(u => u.id === 'user-client-01'),
            inspector: allUsers.find(u => u.id === 'user-tech-05'),
            auditor: allUsers.find(u => u.id === 'user-auditor-01'),
            admin: allUsers.find(u => u.id === 'user-admin-01'),
        };
        return userMap[role] || userMap.client!;
    }, [role]);

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;
        onSendMessage(newMessage.trim());
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
        <div className="fixed bottom-4 right-4 z-50">
            <Card className="w-96 shadow-2xl rounded-lg">
                <CardHeader 
                    className="flex flex-row items-center justify-between p-4 cursor-pointer"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <div className="flex items-center gap-3">
                        <MessageSquare className="w-6 h-6 text-primary" />
                        <div>
                            <CardTitle className="text-base font-semibold">Job Communication</CardTitle>
                            <CardDescription className="text-xs">{job.title}</CardDescription>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon">
                        {isOpen ? <ChevronDown className="h-5 w-5 text-primary" /> : <ChevronUp className="h-5 w-5 text-primary" />}
                    </Button>
                </CardHeader>
                
                {isOpen && (
                    <div className="border-t">
                        <CardContent className="p-0">
                            <ScrollArea className="h-80 p-4">
                                <div className="space-y-6">
                                {job.messages && job.messages.length > 0 ? (
                                    job.messages.map((message, index) => {
                                        const myMessage = isMyMessage(message);
                                        return (
                                            <div key={index} className={cn("flex items-end gap-3", myMessage && "justify-end")}>
                                                {!myMessage && (
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback>{getAvatarFallback(message.user)}</AvatarFallback>
                                                    </Avatar>
                                                )}
                                                <div className={cn("max-w-xs rounded-lg p-3", myMessage ? 'bg-primary text-primary-foreground' : 'bg-muted/50 border' )}>
                                                    <p className="text-sm">{message.message}</p>
                                                    <p className="text-xs mt-2 opacity-80">
                                                        {message.user} · {format(new Date(message.timestamp), 'p')}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">No messages yet. Start the conversation!</p>
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
                        </CardContent>
                    </div>
                )}
            </Card>
        </div>
    );
}

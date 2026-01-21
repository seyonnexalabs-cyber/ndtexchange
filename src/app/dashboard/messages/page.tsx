'use client';

import { jobs } from '@/lib/placeholder-data';
import { useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export default function MessagesPage() {
    const searchParams = useSearchParams();
    const conversations = useMemo(() => jobs.filter(job => job.messages && job.messages.length > 0).sort((a,b) => new Date(b.messages![b.messages!.length - 1].timestamp).getTime() - new Date(a.messages![a.messages!.length - 1].timestamp).getTime()), []);
    
    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
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
                        Recent conversations from your active jobs. Click a conversation to view the full job details.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {conversations.map(job => {
                            const lastMessage = job.messages![job.messages!.length - 1];
                            return (
                                <Link
                                    key={job.id}
                                    href={constructUrl(`/dashboard/my-jobs/${job.id}`)}
                                    className="block p-4 rounded-lg border hover:bg-accent transition-colors"
                                >
                                    <div className="flex items-start gap-4">
                                        <Avatar>
                                            <AvatarFallback>{job.client.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-grow overflow-hidden">
                                            <div className="flex justify-between items-baseline">
                                                <p className="font-semibold text-base truncate">{job.title}</p>
                                                <p className="text-sm text-muted-foreground shrink-0 ml-2">{lastMessage.timestamp.split(' ')[1]}</p>
                                            </div>
                                            <p className="text-sm text-muted-foreground truncate">{job.client}</p>
                                            <p className="text-sm text-muted-foreground truncate mt-1">{lastMessage.user}: {lastMessage.message}</p>
                                        </div>
                                    </div>
                                </Link>
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
        </div>
    );
};

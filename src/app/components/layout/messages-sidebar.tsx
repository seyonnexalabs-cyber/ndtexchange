'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { jobs, Job } from '@/lib/placeholder-data';
import { useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MessagesSidebarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const MessagesSidebar = ({ isOpen, onOpenChange }: MessagesSidebarProps) => {
    const searchParams = useSearchParams();
    const conversations = useMemo(() => jobs.filter(job => job.messages && job.messages.length > 0), []);
    
    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:w-[400px] p-0">
                <SheetHeader className="p-6 border-b">
                    <SheetTitle>Conversations</SheetTitle>
                    <SheetDescription>
                        Recent conversations from your active jobs.
                    </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-80px)]">
                    <div className="p-4 space-y-2">
                        {conversations.map(job => {
                            const lastMessage = job.messages![job.messages!.length - 1];
                            return (
                                <Link
                                    key={job.id}
                                    href={constructUrl(`/dashboard/my-jobs/${job.id}`)}
                                    onClick={() => onOpenChange(false)}
                                    className="block p-3 rounded-lg hover:bg-accent"
                                >
                                    <div className="flex items-start gap-3">
                                        <Avatar>
                                            <AvatarFallback>{job.client.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-grow overflow-hidden">
                                            <div className="flex justify-between items-baseline">
                                                <p className="font-semibold text-sm truncate">{job.title}</p>
                                                <p className="text-xs text-muted-foreground shrink-0 ml-2">{lastMessage.timestamp.split(' ')[1]}</p>
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate">{lastMessage.user}: {lastMessage.message}</p>
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
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
};

export default MessagesSidebar;

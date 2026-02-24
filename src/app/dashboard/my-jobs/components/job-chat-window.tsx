
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, ChevronUp, ChevronDown } from 'lucide-react';
import type { Job } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface JobChatWindowProps {
    job: Job;
    onSendMessage: (message: string) => void;
}

export default function JobChatWindow({ job }: JobChatWindowProps) {
    const [newMessage, setNewMessage] = React.useState('');

    const handleSendMessage = () => {
        // onSendMessage(newMessage);
        setNewMessage('');
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <MessageSquare className="w-6 h-6 text-primary" />
                    Job Communication
                </CardTitle>
                <CardDescription>Chat with all parties involved in this job.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-center items-center text-center p-8 bg-muted/30">
                <p className="font-semibold">Feature Updating</p>
                <p className="text-muted-foreground mt-2">
                    This chat window is being updated to use our new real-time messaging system. For now, please use the main Messages page to communicate.
                </p>
            </CardContent>
            <div className="p-4 border-t bg-background">
                <div className="flex w-full items-center gap-2">
                    <Input 
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                        disabled={true}
                    />
                    <Button onClick={handleSendMessage} disabled={true}>
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </Card>
    );
}


'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, ChevronUp, ChevronDown } from 'lucide-react';
import type { Job } from '@/lib/types';

interface JobChatWindowProps {
    job: Job;
    onSendMessage: (message: string) => void;
}

export default function JobChatWindow({ job }: JobChatWindowProps) {
    const [isOpen, setIsOpen] = React.useState(false);

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
                        <CardContent className="p-4 text-center text-sm text-muted-foreground">
                           <p className="font-semibold">Feature Updating</p>
                           <p>This chat window is being updated to use our new real-time messaging system. For now, please use the main Messages page to communicate.</p>
                        </CardContent>
                    </div>
                )}
            </Card>
        </div>
    );
}

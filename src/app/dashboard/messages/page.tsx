'use client';

import * as React from 'react';
import { Job, allUsers, PlatformUser, jobChats as initialJobChats, jobs } from '@/lib/placeholder-data';
import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { useMobile } from '@/hooks/use-mobile';
import ConversationList from './components/ConversationList';
import ChatView from './components/ChatView';

// Define Conversation type in the main page component
type Conversation = {
    id: string;
    jobId: string;
    participants: string[];
    lastMessage: string;
    lastMessageTimestamp: string;
    messages: { id: string; text: string; senderId: string; timestamp: string; }[];
    job: Job;
};

export default function MessagesPage() {
    const searchParams = useSearchParams();
    const isMobile = useMobile();
    const role = searchParams.get('role') || 'client';
    
    const [jobChatsData, setJobChatsData] = useState(initialJobChats);
    const [jobsData] = useState(jobs);

    const currentUser = useMemo((): PlatformUser | undefined => {
        const userMap: { [key: string]: PlatformUser | undefined } = {
            client: allUsers.find(u => u.id === 'nxHzdOkwW6RLPWEgVvVbHyzN8OR2'),
            inspector: allUsers.find(u => u.id === 'NAXP822MG6cWlaCNkaqkYpxDRmQ2'),
            auditor: allUsers.find(u => u.id === 'gpx1kGbkuqQz0Fhmgfhyv4t3B3f2'),
            admin: allUsers.find(u => u.id === 'i947NWP5Hfb3Tpe5P6XcrjODRIJ2'),
        };
        return userMap[role] || allUsers.find(u => u.id === 'user-client-01')!;
    }, [role]);

    const conversations = useMemo((): Conversation[] => {
        if (!currentUser) return [];
        return jobChatsData
            .filter(chat => chat.participants.includes(currentUser.id))
            .map(chat => {
                const job = jobsData.find(j => j.id === chat.jobId);
                return { ...chat, job };
            })
            .filter((c): c is typeof c & { job: Job } => !!c.job) // Type guard
            .sort((a,b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime());
    }, [jobChatsData, currentUser, jobsData]);
    
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        if (!isMobile && !selectedConversation && conversations.length > 0) {
            setSelectedConversation(conversations[0]);
        }
    }, [isMobile, selectedConversation, conversations]);

    const handleSendMessage = () => {
        if (!newMessage.trim() || !currentUser || !selectedConversation) return;

        const message = {
            id: `MSG-${Date.now()}`,
            senderId: currentUser.id,
            timestamp: new Date().toISOString(),
            text: newMessage.trim(),
        };
        
        const updatedConversation = {
            ...selectedConversation,
            messages: [...(selectedConversation.messages || []), message],
            lastMessage: message.text,
            lastMessageTimestamp: message.timestamp,
        };

        setSelectedConversation(updatedConversation);
        setJobChatsData(prevChats => prevChats.map(chat => chat.id === selectedConversation.id ? updatedConversation : chat));
        setNewMessage('');
    };

    const getUserDetails = (senderId: string) => {
        return allUsers.find(u => u.id === senderId);
    }
    
    return (
        <Card className="h-[calc(100vh_-_theme(spacing.16)_-_theme(spacing.12))] flex overflow-hidden">
            <ConversationList
                conversations={conversations}
                selectedConversation={selectedConversation}
                onSelectConversation={setSelectedConversation}
                currentUser={currentUser}
                getUserDetails={getUserDetails}
                role={role}
            />
            <ChatView
                isMobile={isMobile}
                selectedConversation={selectedConversation}
                onBack={() => setSelectedConversation(null)}
                currentUser={currentUser}
                getUserDetails={getUserDetails}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                handleSendMessage={handleSendMessage}
            />
        </Card>
    );
};

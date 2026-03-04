'use client';

import * as React from 'react';
import type { Job, PlatformUser } from '@/lib/types';
import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { useMobile } from '@/hooks/use-mobile';
import ConversationList from './components/ConversationList';
import ChatView from './components/ChatView';
import { useFirebase, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, query, where, orderBy, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { serviceProviders } from '@/lib/seed-data';

type Message = {
    id: string;
    text: string;
    senderId: string;
    timestamp: any;
};

export default function MessagesPage() {
    const searchParams = useSearchParams();
    const isMobile = useMobile();
    const role = searchParams.get('role') || 'client';
    const { toast } = useToast();
    
    const { firestore } = useFirebase();
    const { user: authUser } = useUser();
    
    const { data: currentUser, isLoading: isLoadingProfile } = useDoc<PlatformUser>(
        useMemoFirebase(() => (authUser ? doc(firestore, 'users', authUser.uid) : null), [authUser, firestore])
    );

    const jobsQuery = useMemoFirebase(() => {
        if (!firestore || !currentUser) return null;
        if (role === 'client') {
            return query(collection(firestore, 'jobs'), where('clientId', '==', currentUser.id));
        }
        if (role === 'inspector' && currentUser.providerId) {
            return query(collection(firestore, 'jobs'), where('providerId', '==', currentUser.providerId));
        }
        return null;
    }, [firestore, currentUser, role]);

    const { data: jobs, isLoading: isLoadingJobs } = useCollection<Job>(jobsQuery);
    
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [newMessage, setNewMessage] = useState('');

    const messagesQuery = useMemoFirebase(() => {
        if (!firestore || !selectedJob) return null;
        return query(collection(firestore, 'jobs', selectedJob.id, 'messages'), orderBy('timestamp', 'asc'));
    }, [firestore, selectedJob]);
    
    const { data: messages, isLoading: isLoadingMessages } = useCollection<Message>(messagesQuery);
    
    useEffect(() => {
        if (!isMobile && !selectedJob && jobs && jobs.length > 0) {
            setSelectedJob(jobs[0]);
        }
    }, [isMobile, selectedJob, jobs]);
    
    const handleSendMessage = async () => {
        if (!newMessage.trim() || !currentUser || !selectedJob || !firestore) return;

        const messageData = {
            senderId: currentUser.id,
            text: newMessage.trim(),
            timestamp: serverTimestamp(),
        };
        
        await addDoc(collection(firestore, 'jobs', selectedJob.id, 'messages'), messageData);
        setNewMessage('');
    };

    const getUserDetails = (senderId: string) => {
        // In a real app, you might fetch this from a user context or another query
        const providerUser = serviceProviders.find(p => p.id === senderId);
        if (providerUser) {
            return { id: providerUser.id, name: providerUser.name, role: 'Provider' };
        }
        return { id: senderId, name: 'Unknown User', role: 'User' };
    };

    return (
        <Card className="h-[calc(100vh_-_theme(spacing.16)_-_theme(spacing.12))] flex overflow-hidden">
            <ConversationList
                jobs={jobs || []}
                selectedJob={selectedJob}
                onSelectJob={setSelectedJob}
                currentUser={currentUser}
                role={role}
                isLoading={isLoadingJobs || isLoadingProfile}
            />
            <ChatView
                isMobile={isMobile}
                selectedJob={selectedJob}
                messages={messages || []}
                isLoadingMessages={isLoadingMessages}
                onBack={() => setSelectedJob(null)}
                currentUser={currentUser}
                getUserDetails={getUserDetails}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                handleSendMessage={handleSendMessage}
            />
        </Card>
    );
};

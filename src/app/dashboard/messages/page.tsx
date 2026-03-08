
'use client';

import * as React from 'react';
import type { Job, PlatformUser } from '@/lib/types';
import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import ConversationList from './components/ConversationList';
import ChatView from './components/ChatView';
import { useFirebase, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, query, where, orderBy, doc, addDoc, serverTimestamp, setDoc } from 'firebase/firestore';

type Message = {
    id: string;
    jobId: string;
    text: string;
    senderId: string;
    senderName: string;
    timestamp: any;
};

export default function MessagesPage() {
    const searchParams = useSearchParams();
    const isMobile = useIsMobile();
    const role = searchParams.get('role') || 'client';
    
    const { firestore } = useFirebase();
    const { user: authUser } = useUser();
    
    const { data: currentUser, isLoading: isLoadingProfile } = useDoc<PlatformUser>(
        useMemoFirebase(() => (authUser ? doc(firestore, 'users', authUser.uid) : null), [authUser, firestore])
    );

    const jobsQuery = useMemoFirebase(() => {
        if (!firestore || !currentUser?.companyId) return null;
        if (role === 'client') {
            return query(collection(firestore, 'jobs'), where('clientCompanyId', '==', currentUser.companyId));
        }
        if (role === 'inspector') {
            return query(collection(firestore, 'jobs'), where('providerCompanyId', '==', currentUser.companyId));
        }
        return null;
    }, [firestore, currentUser, role]);

    const { data: jobs, isLoading: isLoadingJobs } = useCollection<Job>(jobsQuery);
    
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [newMessage, setNewMessage] = useState('');

    const messagesQuery = useMemoFirebase(() => {
        if (!firestore || !selectedJob) return null;
        return query(collection(firestore, 'messages'), where('jobId', '==', selectedJob.id), orderBy('timestamp', 'asc'));
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
            jobId: selectedJob.id,
            senderId: currentUser.id,
            senderName: currentUser.name,
            text: newMessage.trim(),
            timestamp: serverTimestamp(),
        };
        
        const messageRef = doc(collection(firestore, 'messages'));
        await setDoc(messageRef, { id: messageRef.id, ...messageData });
        setNewMessage('');
    };

    const getUserDetails = (senderId: string) => {
        // This is a placeholder. In a real app, you'd fetch this from a user context
        // or a dedicated query that fetches all participants in the chat.
        if(currentUser && senderId === currentUser.id) {
            return { id: currentUser.id, name: currentUser.name, role: currentUser.role };
        }
        return { id: senderId, name: 'Other Party', role: 'User' };
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

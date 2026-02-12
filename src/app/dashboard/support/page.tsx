
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { LifeBuoy, MessageSquare, Send, BookOpen } from 'lucide-react';
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from '@/lib/utils';
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClientMaintenanceWorkflow from './components/client-maintenance-workflow';
import InspectorWorkflow from './components/inspector-workflow';
import AuditorWorkflow from './components/auditor-workflow';
import AdminWorkflow from './components/admin-workflow';
import { useFirebase, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, limit, doc, serverTimestamp, addDoc, setDoc, orderBy, getDoc } from 'firebase/firestore';
import { useMobile } from '@/hooks/use-mobile';
import AdminChatInterface from './components/admin-chat-interface';
import ClientChatInterface from './components/client-chat-interface';
import type { PlatformUser } from '@/lib/types';


// Define types for Firestore data
type SupportThread = {
    id: string;
    companyId: string;
    companyName: string;
    subject: string;
    status: 'Open' | 'Closed';
    lastMessage?: string;
    lastMessageTimestamp?: any;
};

type SupportMessage = {
    id: string;
    senderId: string;
    senderName: string;
    isAdmin: boolean;
    timestamp: any;
    text: string;
};

const supportSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters.'),
  category: z.enum(['technical-issue', 'billing-inquiry', 'general-question', 'feature-request']),
  description: z.string().min(20, 'Please provide a detailed description (at least 20 characters).'),
  attachment: z.any()
    .refine((file: File | undefined) => !file || file.size <= MAX_FILE_SIZE_BYTES, `Max file size is ${MAX_FILE_SIZE_MB}MB.`)
    .optional(),
});


export default function SupportPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'client';
  const { firestore } = useFirebase();
  const { user: authUser } = useUser();
  const [currentUser, setCurrentUser] = useState<PlatformUser | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMobile = useMobile();

  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  useEffect(() => {
    if (authUser && firestore) {
        getDoc(doc(firestore, 'users', authUser.uid)).then(docSnap => {
            if (docSnap.exists()) {
                setCurrentUser(docSnap.data() as PlatformUser);
            }
        });
    } else {
        setCurrentUser(null);
    }
  }, [authUser, firestore]);

  const supportChatQuery = useMemoFirebase(() => {
    if (!firestore || !authUser || !currentUser?.companyId) return null;
    if (role === 'admin') {
        return query(collection(firestore, 'supportChats'), orderBy('lastMessageTimestamp', 'desc'));
    }
    return query(collection(firestore, 'supportChats'), where('companyId', '==', currentUser.companyId), limit(1));
  }, [firestore, authUser, role, currentUser?.companyId]);


  const { data: supportThreadsData } = useCollection<SupportThread>(supportChatQuery);
  
  const currentThread = useMemo(() => {
      if (role === 'admin') {
        return supportThreadsData?.find(t => t.id === selectedThreadId) || null;
      }
      return supportThreadsData?.[0] || null;
  }, [supportThreadsData, selectedThreadId, role]);

  const messagesQuery = useMemoFirebase(() => {
    if (!firestore || !currentThread) return null;
    return query(collection(firestore, 'supportChats', currentThread.id, 'messages'), orderBy('timestamp', 'asc'));
  }, [firestore, currentThread]);

  const { data: messages } = useCollection<SupportMessage>(messagesQuery);
  
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !firestore || !authUser) return;
    setIsSubmitting(true);
    
    try {
        let threadId = currentThread?.id;

        if (!threadId && role !== 'admin') {
            const newThreadData = {
                companyId: currentUser.companyId,
                companyName: currentUser.company,
                subject: 'Live Support Chat',
                status: 'Open' as 'Open' | 'Closed',
                lastMessage: newMessage.trim(),
                lastMessageTimestamp: serverTimestamp(),
            };
            const newThreadRef = await addDoc(collection(firestore, 'supportChats'), newThreadData);
            threadId = newThreadRef.id;
        }

        if (threadId) {
            const messagesColRef = collection(firestore, 'supportChats', threadId, 'messages');
            const messageData = {
                senderId: authUser.uid,
                senderName: currentUser.name,
                isAdmin: currentUser.role === 'Admin',
                timestamp: serverTimestamp(),
                text: newMessage.trim(),
            };
            await addDoc(messagesColRef, messageData);
            
            const threadDocRef = doc(firestore, 'supportChats', threadId);
            await setDoc(threadDocRef, {
                lastMessage: newMessage.trim(),
                lastMessageTimestamp: serverTimestamp(),
                status: 'Open',
            }, { merge: true });
        }
        setNewMessage('');
    } catch (e) {
        console.error("Error sending message: ", e);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not send message. Please try again.",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  const roleGuides: { [key: string]: { component: React.ComponentType, title: string, description: string } } = {
        client: {
            component: ClientMaintenanceWorkflow,
            title: 'Client Maintenance Workflow',
            description: 'A guide to how client-side maintenance activities are carried out within the NDT EXCHANGE app.'
        },
        inspector: {
            component: InspectorWorkflow,
            title: 'Provider Workflow Guide',
            description: 'A guide for service providers on managing resources, finding jobs, and completing work on the platform.'
        },
        auditor: {
            component: AuditorWorkflow,
            title: 'Auditor Workflow Guide',
            description: 'An overview of the process for reviewing and approving inspection reports.'
        },
        admin: {
            component: AdminWorkflow,
            title: 'Platform Administration Guide',
            description: 'A summary of key administrative functions and responsibilities.'
        },
    };

  const currentGuide = roleGuides[role];
  
  const form = useForm<z.infer<typeof supportSchema>>({
    resolver: zodResolver(supportSchema),
    defaultValues: {
      subject: '',
      category: 'general-question',
      description: '',
    },
  });

  const onSubmit = (values: z.infer<typeof supportSchema>) => {
    console.log('Support Request Submitted:', values);
    toast({
      title: 'Support Request Submitted',
      description: "We've received your request and will get back to you shortly.",
    });
    form.reset();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <LifeBuoy className="w-8 h-8 text-primary" />
        <div>
            <h1 className="text-2xl font-headline font-semibold">Support Center</h1>
            <p className="text-muted-foreground">
                Get help with the platform, ask questions, and find guides.
            </p>
        </div>
      </div>

       <Tabs defaultValue={currentGuide ? "guides" : "ticket"} className="w-full">
            <TabsList>
                {currentGuide && <TabsTrigger value="guides"><BookOpen className="mr-2 h-4 w-4" /> Workflow Guides</TabsTrigger>}
                <TabsTrigger value="ticket"><Send className="mr-2 h-4 w-4" /> Submit a Ticket</TabsTrigger>
                <TabsTrigger value="chat"><MessageSquare className="mr-2 h-4 w-4" /> Live Chat</TabsTrigger>
            </TabsList>
            {currentGuide && (
                <TabsContent value="guides" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{currentGuide.title}</CardTitle>
                            <CardDescription>{currentGuide.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <currentGuide.component />
                        </CardContent>
                    </Card>
                </TabsContent>
            )}
            <TabsContent value="ticket" className="mt-4">
                <Card>
                    <CardHeader>
                    <CardTitle>Submit a Support Request</CardTitle>
                    <CardDescription>For non-urgent issues, please fill out the form below. Our team will review your request and respond as soon as possible.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Subject</FormLabel>
                                <FormControl>
                                <Input placeholder="e.g., Trouble uploading inspection report" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="technical-issue">Technical Issue</SelectItem>
                                    <SelectItem value="billing-inquiry">Billing Inquiry</SelectItem>
                                    <SelectItem value="general-question">General Question</SelectItem>
                                    <SelectItem value="feature-request">Feature Request</SelectItem>
                                </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                <Textarea
                                    placeholder="Please describe the issue in detail. Include any steps to reproduce it."
                                    className="min-h-[150px]"
                                    {...field}
                                />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="attachment"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Attach a File (Optional)</FormLabel>
                                <FormControl>
                                <Input type="file" accept={ACCEPTED_FILE_TYPES} onChange={(e) => field.onChange(e.target.files?.[0])} />
                                </FormControl>
                                <FormDescription>
                                    Max file size: {MAX_FILE_SIZE_MB}MB.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                            )}
                        />

                        <Button type="submit">Submit Request</Button>
                        </form>
                    </Form>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="chat" className="mt-4">
                 {role === 'admin' 
                 ? <AdminChatInterface 
                    isMobile={isMobile} 
                    supportThreadsData={supportThreadsData}
                    selectedThreadId={selectedThreadId}
                    setSelectedThreadId={setSelectedThreadId}
                    currentThread={currentThread}
                    messages={messages}
                    newMessage={newMessage}
                    setNewMessage={setNewMessage}
                    handleSendMessage={handleSendMessage}
                    isSubmitting={isSubmitting}
                  /> 
                 : <ClientChatInterface 
                    currentUser={currentUser}
                    messages={messages}
                    authUser={authUser}
                    newMessage={newMessage}
                    setNewMessage={setNewMessage}
                    handleSendMessage={handleSendMessage}
                    isSubmitting={isSubmitting}
                 />}
            </TabsContent>
        </Tabs>
    </div>
  );
}

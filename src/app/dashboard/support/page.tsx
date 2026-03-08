

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
import { toast } from 'sonner';
import { LifeBuoy, MessageSquare, Send, BookOpen, PlusCircle } from 'lucide-react';
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB, cn } from '@/lib/utils';
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClientMaintenanceWorkflow from './components/client-maintenance-workflow';
import InspectorWorkflow from './components/inspector-workflow';
import AuditorWorkflow from './components/auditor-workflow';
import AdminWorkflow from './components/admin-workflow';
import { useFirebase, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, limit, doc, serverTimestamp, addDoc, updateDoc, orderBy, getDoc, setDoc } from 'firebase/firestore';
import { useIsMobile } from '@/hooks/use-mobile';
import AdminChatList from './components/admin-chat-list';
import ClientChatList from './components/client-chat-interface';
import ChatWindow from './components/chat-window';
import type { PlatformUser } from '@/lib/types';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from '@/components/ui/dialog';


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

const newThreadSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters long."),
  initialMessage: z.string().min(10, "Please provide an initial message (min. 10 characters)."),
});


export default function SupportPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'client';
  const { firestore } = useFirebase();
  const { user: authUser } = useUser();
  const [currentUser, setCurrentUser] = useState<PlatformUser | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMobile = useIsMobile();

  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [isNewThreadOpen, setIsNewThreadOpen] = useState(false);

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
    if (!firestore || !authUser) return null;
    if (role === 'admin') {
        return query(collection(firestore, 'supportChats'), orderBy('lastMessageTimestamp', 'desc'));
    }
    if (currentUser?.companyId) {
        return query(collection(firestore, 'supportChats'), where('companyId', '==', currentUser.companyId), orderBy('lastMessageTimestamp', 'desc'));
    }
    return null;
  }, [firestore, authUser, role, currentUser?.companyId]);


  const { data: supportThreadsData, isLoading: isLoadingThreads } = useCollection<SupportThread>(supportChatQuery);
  
  const currentThread = useMemo(() => {
      return supportThreadsData?.find(t => t.id === selectedThreadId) || null;
  }, [supportThreadsData, selectedThreadId]);

  const messagesQuery = useMemoFirebase(() => {
    if (!firestore || !selectedThreadId || !currentUser) return null;
    return query(collection(firestore, 'supportMessages'), where('supportChatId', '==', selectedThreadId), orderBy('timestamp', 'asc'));
  }, [firestore, selectedThreadId, currentUser]);

  const { data: messages, isLoading: isLoadingMessages } = useCollection<SupportMessage>(messagesQuery);
  
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !firestore || !authUser || !selectedThreadId) return;
    setIsSubmitting(true);
    
    try {
        const companyIdForPath = role === 'admin' ? currentThread?.companyId : currentUser.companyId;

        if (!companyIdForPath) {
            toast.error("Error", { description: "Cannot determine company for chat." });
            setIsSubmitting(false);
            return;
        }

        const messagesColRef = collection(firestore, 'supportMessages');
        const messageData = {
            supportChatId: selectedThreadId,
            senderId: authUser.uid,
            senderName: currentUser.name,
            isAdmin: role === 'admin',
            timestamp: serverTimestamp(),
            text: newMessage.trim(),
        };
        const messageDocRef = await addDoc(messagesColRef, {});
        await setDoc(doc(firestore, 'supportMessages', messageDocRef.id), { id: messageDocRef.id, ...messageData });
        
        const threadDocRef = doc(firestore, 'supportChats', selectedThreadId);
        await updateDoc(threadDocRef, {
            lastMessage: newMessage.trim(),
            lastMessageTimestamp: serverTimestamp(),
            status: 'Open',
        });
        
        setNewMessage('');
    } catch (e) {
        console.error("Error sending message: ", e);
        toast.error("Error", { description: "Could not send message. Please try again." });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const newThreadForm = useForm<z.infer<typeof newThreadSchema>>({
    resolver: zodResolver(newThreadSchema),
    defaultValues: { subject: '', initialMessage: '' },
  });

  const handleCreateThread = async (values: z.infer<typeof newThreadSchema>) => {
    if (!currentUser || !firestore || !authUser) return;
    setIsSubmitting(true);
    try {
        const newThreadRef = doc(collection(firestore, 'supportChats'));
        const newThreadData = {
            id: newThreadRef.id,
            companyId: currentUser.companyId,
            companyName: currentUser.company,
            subject: values.subject,
            status: 'Open' as 'Open' | 'Closed',
            lastMessage: values.initialMessage,
            lastMessageTimestamp: serverTimestamp(),
            createdAt: serverTimestamp(),
            createdBy: currentUser.id,
        };
        await setDoc(newThreadRef, newThreadData);

        const messagesColRef = collection(firestore, 'supportMessages');
        const messageData = {
            supportChatId: newThreadRef.id,
            senderId: authUser.uid,
            senderName: currentUser.name,
            isAdmin: false,
            timestamp: serverTimestamp(),
            text: values.initialMessage,
        };
        const messageDocRef = await addDoc(messagesColRef, {});
        await setDoc(doc(firestore, 'supportMessages', messageDocRef.id), { id: messageDocRef.id, ...messageData });

        toast.success("Support Thread Created", { description: "Our team will get back to you shortly." });
        setSelectedThreadId(newThreadRef.id);
        setIsNewThreadOpen(false);
        newThreadForm.reset();
    } catch(e) {
        console.error("Error creating thread:", e);
        toast.error('Error', { description: 'Could not create new support thread.' });
    } finally {
        setIsSubmitting(false);
    }
  };

  const roleGuides: { [key: string]: { component: React.ComponentType, title: string, description: string } } = {
        client: {
            component: ClientMaintenanceWorkflow,
            title: 'Client Workflow Guide',
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
    toast.success('Support Request Submitted', {
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
                 <Card className="h-[70vh] flex overflow-hidden">
                    <div className={cn(
                        "w-full md:w-[320px] lg:w-[380px] border-r flex flex-col",
                        isMobile && selectedThreadId && "hidden"
                    )}>
                        {role === 'admin' ? (
                            <AdminChatList
                                isLoading={isLoadingThreads}
                                supportThreadsData={supportThreadsData}
                                selectedThreadId={selectedThreadId}
                                setSelectedThreadId={setSelectedThreadId}
                            />
                        ) : (
                            <ClientChatList
                                isLoading={isLoadingThreads}
                                supportThreadsData={supportThreadsData}
                                selectedThreadId={selectedThreadId}
                                setSelectedThreadId={setSelectedThreadId}
                                onNewChat={() => setIsNewThreadOpen(true)}
                            />
                        )}
                    </div>
                    <ChatWindow
                        isMobile={isMobile}
                        currentThread={currentThread}
                        messages={messages}
                        isLoadingMessages={isLoadingMessages}
                        onBack={() => setSelectedThreadId(null)}
                        currentUserId={authUser?.uid || null}
                        newMessage={newMessage}
                        setNewMessage={setNewMessage}
                        handleSendMessage={handleSendMessage}
                        isSubmitting={isSubmitting}
                    />
                </Card>
            </TabsContent>
        </Tabs>
        
        <Dialog open={isNewThreadOpen} onOpenChange={setIsNewThreadOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Start a New Support Chat</DialogTitle>
                    <DialogDescription>
                        Create a new support thread for your issue. This helps our team track and resolve your request more efficiently.
                    </DialogDescription>
                </DialogHeader>
                 <Form {...newThreadForm}>
                    <form onSubmit={newThreadForm.handleSubmit(handleCreateThread)} className="space-y-4 pt-4">
                        <FormField
                            control={newThreadForm.control}
                            name="subject"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Subject</FormLabel>
                                <FormControl><Input placeholder="e.g., Problem with report generation" {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={newThreadForm.control}
                            name="initialMessage"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>How can we help?</FormLabel>
                                <FormControl><Textarea placeholder="Please describe your issue in detail..." {...field} className="min-h-[120px]" /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsNewThreadOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Start Chat'}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>

    </div>
  );
}

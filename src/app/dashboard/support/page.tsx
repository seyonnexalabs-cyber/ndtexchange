'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { LifeBuoy, MessageSquare, Send, BookOpen, ChevronLeft } from 'lucide-react';
import { ACCEPTED_FILE_TYPES, cn, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from '@/lib/utils';
import { useState, useMemo, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSearchParams } from 'next/navigation';
import { allUsers, PlatformUser } from '@/lib/placeholder-data';
import { format, isSameDay } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClientMaintenanceWorkflow from './components/client-maintenance-workflow';
import InspectorWorkflow from './components/inspector-workflow';
import AuditorWorkflow from './components/auditor-workflow';
import AdminWorkflow from './components/admin-workflow';
import { useFirebase, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit, doc, serverTimestamp, addDoc, setDoc, orderBy } from 'firebase/firestore';


// Define types for Firestore data
type SupportThread = {
    id: string;
    userId: string;
    userName: string;
    userCompany: string;
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

const ClientFormattedTime = ({ dateString }: { dateString: string }) => {
  const [formattedTime, setFormattedTime] = useState<string | null>(null);
  useEffect(() => {
    setFormattedTime(format(new Date(dateString), 'p'));
  }, [dateString]);
  return <>{formattedTime || ''}</>;
};

export default function SupportPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'client';
  const { firestore, user: authUser } = useFirebase();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isMobile } = useMobile();

  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  const currentUser = useMemo(() => {
    const userMap: { [key: string]: PlatformUser | undefined } = {
      client: allUsers.find(u => u.id === 'nxHzdOkwW6RLPWEgVvVbHyzN8OR2'),
      inspector: allUsers.find(u => u.id === 'NAXP822MG6cWlaCNkaqkYpxDRmQ2'),
      auditor: allUsers.find(u => u.id === 'gpx1kGbkuqQz0Fhmgfhyv4t3B3f2'),
      admin: allUsers.find(u => u.id === 'JB5zgSrcKJX3dbNgPJmhlOcrUI62'),
    };
    return userMap[role] || userMap.client;
  }, [role]);

  const supportChatQuery = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    if (role === 'admin') {
      return query(collection(firestore, 'supportChats'), orderBy('lastMessageTimestamp', 'desc'));
    }
    return query(collection(firestore, 'supportChats'), where('userId', '==', authUser.uid), limit(1));
  }, [firestore, authUser, role]);

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
                userId: authUser.uid,
                userName: currentUser.name,
                userCompany: currentUser.company,
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
  
  const getAvatarFallback = (userName: string) => {
    return userName.split(' ').map(n => n[0]).join('');
  }

  const AdminChatInterface = () => (
    <Card className="h-[70vh] flex overflow-hidden">
        <div className={cn(
            "w-full md:w-[320px] lg:w-[380px] border-r flex flex-col",
            isMobile && selectedThreadId && "hidden"
        )}>
            <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">Support Inquiries</h2>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    {supportThreadsData?.map(thread => (
                        <button
                            key={thread.id}
                            onClick={() => setSelectedThreadId(thread.id)}
                            className={cn(
                                "block w-full text-left p-3 rounded-lg border transition-colors",
                                selectedThreadId === thread.id ? "bg-primary/10" : "hover:bg-primary/5"
                            )}
                        >
                             <div className="flex justify-between items-start gap-2">
                                <p className="font-semibold text-sm truncate">{thread.userName}</p>
                                <span className="text-xs text-muted-foreground shrink-0">{thread.lastMessageTimestamp?.toDate ? <ClientFormattedTime dateString={thread.lastMessageTimestamp.toDate().toISOString()} /> : ''}</span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{thread.userCompany}</p>
                            <p className="text-xs text-muted-foreground mt-1 truncate">{thread.lastMessage}</p>
                        </button>
                    ))}
                    {supportThreadsData?.length === 0 && <p className="p-4 text-center text-muted-foreground">No open support chats.</p>}
                </div>
            </ScrollArea>
        </div>
        <div className={cn(
            "flex-1 flex-col",
            isMobile && !selectedThreadId ? "hidden" : "flex",
            !isMobile && !selectedThreadId && "hidden md:flex"
        )}>
            {currentThread ? (
                 <>
                    <div className="flex items-center gap-3 p-4 border-b">
                        {isMobile && <Button variant="ghost" size="icon" onClick={() => setSelectedThreadId(null)}><ChevronLeft /></Button>}
                        <div>
                            <p className="font-semibold">{currentThread.userName}</p>
                            <p className="text-sm text-muted-foreground">{currentThread.userCompany}</p>
                        </div>
                    </div>
                     <ScrollArea className="flex-1 p-6 bg-muted/30">
                        <div className="space-y-6">
                            {messages?.map((message, index) => {
                                const myMessage = message.isAdmin;
                                return (
                                    <div key={index} className={cn("flex items-end gap-3", myMessage && "justify-end")}>
                                        {!myMessage && (
                                            <Avatar className="h-8 w-8"><AvatarFallback>{getAvatarFallback(message.senderName)}</AvatarFallback></Avatar>
                                        )}
                                        <div className={cn("max-w-xs rounded-lg p-3", myMessage ? 'bg-primary text-primary-foreground' : 'bg-background border' )}>
                                            <p className="text-sm">{message.text}</p>
                                            <p className="text-xs mt-2 opacity-80 text-right">
                                                {message.timestamp?.toDate ? format(message.timestamp.toDate(), 'p') : 'sending...'}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </ScrollArea>
                    <div className="p-4 border-t bg-background">
                        <div className="flex w-full items-center gap-2">
                            <Input placeholder="Type your message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} />
                            <Button onClick={handleSendMessage} disabled={!newMessage.trim() || isSubmitting}>{isSubmitting ? 'Sending...' : <Send className="h-4 w-4" />}</Button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 hidden md:flex flex-col items-center justify-center text-center p-8 bg-muted/30">
                    <MessageSquare className="w-16 h-16 text-muted-foreground/50" />
                    <h2 className="mt-4 text-xl font-semibold">Select a conversation</h2>
                    <p className="text-muted-foreground">Choose a support chat from the list to view the conversation.</p>
                </div>
            )}
        </div>
    </Card>
  );

  const ClientChatInterface = () => (
    <Card className="flex flex-col h-[70vh]">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><MessageSquare className="text-primary" /> Live Chat Support</CardTitle>
            <CardDescription>You are now connected with a support agent. Ask your question below.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-6 bg-muted/30">
                <div className="space-y-6">
                    {messages?.map((message, index) => {
                        const myMessage = message.senderId === authUser?.uid;
                        return (
                            <div key={index} className={cn("flex items-end gap-3", myMessage && "justify-end")}>
                                {!myMessage && (
                                    <Avatar className="h-8 w-8"><AvatarFallback>SA</AvatarFallback></Avatar>
                                )}
                                <div className={cn("max-w-xs rounded-lg p-3", myMessage ? 'bg-primary text-primary-foreground' : 'bg-background border' )}>
                                    {!myMessage && <p className="text-xs font-semibold text-primary mb-1">Support Agent</p>}
                                    <p className="text-sm">{message.text}</p>
                                    <p className="text-xs mt-2 opacity-80 text-right">
                                        {message.timestamp?.toDate ? format(message.timestamp.toDate(), 'p') : 'sending...'}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                    {(messages === null || messages?.length === 0) && (
                        <div className="text-center text-muted-foreground">Start the conversation by sending a message.</div>
                    )}
                </div>
            </ScrollArea>
            <div className="p-4 border-t bg-background">
                <div className="flex w-full items-center gap-2">
                    <Input placeholder="Type your message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim() || isSubmitting}>{isSubmitting ? 'Sending...' : <Send className="h-4 w-4" />}</Button>
                </div>
            </div>
        </CardContent>
    </Card>
  );

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
                 {role === 'admin' ? <AdminChatInterface /> : <ClientChatInterface />}
            </TabsContent>
        </Tabs>
    </div>
  );
}

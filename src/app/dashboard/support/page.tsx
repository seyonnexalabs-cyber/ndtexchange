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
import { ACCEPTED_FILE_TYPES, cn, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from '@/lib/utils';
import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSearchParams } from 'next/navigation';
import { allUsers, supportThreads, SupportThread, SupportMessage, PlatformUser } from '@/lib/placeholder-data';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClientMaintenanceWorkflow from './components/client-maintenance-workflow';
import InspectorWorkflow from './components/inspector-workflow';
import AuditorWorkflow from './components/auditor-workflow';
import AdminWorkflow from './components/admin-workflow';


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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'client';
  
  const currentUser = useMemo(() => {
    const userMap: { [key: string]: PlatformUser | undefined } = {
      client: allUsers.find(u => u.id === 'user-client-01'),
      inspector: allUsers.find(u => u.id === 'user-tech-05'),
      auditor: allUsers.find(u => u.id === 'user-auditor-01'),
      admin: allUsers.find(u => u.id === 'user-admin-01'),
    };
    return userMap[role] || userMap.client;
  }, [role]);

  const [currentThread, setCurrentThread] = useState<SupportThread | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const handleStartChat = () => {
    if (!currentUser) return;
    let thread = supportThreads.find(t => t.userCompany === currentUser.company);
    if (!thread) {
      thread = {
        id: `SUPPORT-NEW-${currentUser.company.replace(/\s+/g, '-')}`,
        userId: currentUser.id,
        userName: currentUser.name,
        userCompany: currentUser.company,
        subject: 'General Support',
        status: 'Open',
        messages: [
            { userId: 'user-admin-01', user: 'Admin User', isAdmin: true, timestamp: new Date().toISOString(), message: `Welcome to NDT Exchange Support! How can we help the team at ${currentUser.company} today?` },
        ],
      };
    }
    setCurrentThread(thread);
    setIsChatOpen(true);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentUser || !currentThread) return;

    const message: SupportMessage = {
      userId: currentUser.id,
      user: currentUser.name,
      isAdmin: currentUser.role === 'Admin',
      timestamp: new Date().toISOString(),
      message: newMessage.trim(),
    };
    
    const updatedThread = {
        ...currentThread,
        messages: [...currentThread.messages, message]
    };

    setCurrentThread(updatedThread);
    setNewMessage('');
  };

  const roleGuides: { [key: string]: { component: React.ComponentType, title: string, description: string } } = {
        client: {
            component: ClientMaintenanceWorkflow,
            title: 'Client Maintenance Workflow',
            description: 'A guide to how client-side maintenance activities are carried out within the NDT Exchange app.'
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
                 <Card>
                    <CardHeader>
                        <CardTitle>Live Chat Support</CardTitle>
                        <CardDescription>Need immediate assistance? Our support agents are available to help you in real-time.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handleStartChat}>Start Live Chat</Button>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="sm:max-w-lg h-[70vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="flex items-center gap-2"><MessageSquare className="text-primary" /> Live Chat</DialogTitle>
            <DialogDescription>You are now connected with a support agent.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 p-6 bg-muted/30">
            <div className="space-y-6">
                {currentThread?.messages.map((message, index) => {
                     const myMessage = message.userId === currentUser?.id;
                     return (
                        <div key={index} className={cn("flex items-end gap-3", myMessage && "justify-end")}>
                            {!myMessage && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>{message.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                            )}
                            <div className={cn("max-w-xs rounded-lg p-3", myMessage ? 'bg-primary text-primary-foreground' : 'bg-background border' )}>
                                <p className="text-sm">{message.message}</p>
                                <p className="text-xs mt-2 opacity-80">
                                    {message.user} · {format(new Date(message.timestamp), 'p')}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>
          </ScrollArea>
          <DialogFooter className="p-4 border-t bg-background">
            <div className="flex w-full items-center gap-2">
                <Input 
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}><Send className="h-4 w-4" /></Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

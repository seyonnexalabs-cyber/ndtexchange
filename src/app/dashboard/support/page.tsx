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
import { LifeBuoy, MessageSquare, Send } from 'lucide-react';
import { ACCEPTED_FILE_TYPES, cn } from '@/lib/utils';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

const supportSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters.'),
  category: z.enum(['technical-issue', 'billing-inquiry', 'general-question', 'feature-request']),
  description: z.string().min(20, 'Please provide a detailed description (at least 20 characters).'),
  attachment: z.any().optional(),
});

export default function SupportPage() {
  const { toast } = useToast();
  const [isChatOpen, setIsChatOpen] = useState(false);
  
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

  const mockMessages = [
      { user: 'Support Agent', message: 'Welcome to NDT Exchange Support! My name is Alex. How can I help you today?', isAgent: true },
      { user: 'You', message: "I'm having trouble uploading a document on the job posting page.", isAgent: false },
      { user: 'Support Agent', message: 'I can certainly help with that. Could you please provide the job ID and the name of the file you\'re trying to upload?', isAgent: true },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <LifeBuoy className="w-8 h-8 text-primary" />
        <div>
            <h1 className="text-2xl font-headline font-semibold">Contact Support</h1>
            <p className="text-muted-foreground">
            Have a question or need help? Choose an option below.
            </p>
        </div>
      </div>

       <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3"><MessageSquare /> Live Chat Support</CardTitle>
                <CardDescription>Need immediate assistance? Our support agents are available to help you in real-time.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={() => setIsChatOpen(true)}>Start Live Chat</Button>
            </CardContent>
        </Card>
      
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
                        Max file size: 10MB.
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
      
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="sm:max-w-lg h-[70vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="flex items-center gap-2"><MessageSquare /> Live Chat</DialogTitle>
            <DialogDescription>You are now connected with a support agent.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 p-6 bg-muted/30">
            <div className="space-y-6">
                {mockMessages.map((message, index) => (
                    <div key={index} className={cn("flex items-end gap-3", !message.isAgent && "justify-end")}>
                        {message.isAgent && (
                            <Avatar className="h-8 w-8">
                                <AvatarFallback>S</AvatarFallback>
                            </Avatar>
                        )}
                        <div className={cn("max-w-xs rounded-lg p-3", message.isAgent ? "bg-background border" : "bg-primary text-primary-foreground")}>
                            <p className="text-sm">{message.message}</p>
                            <p className="text-xs mt-2 opacity-80">
                                {message.user}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
          </ScrollArea>
          <DialogFooter className="p-4 border-t bg-background">
            <div className="flex w-full items-center gap-2">
                <Input placeholder="Type your message..." />
                <Button><Send className="h-4 w-4" /></Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

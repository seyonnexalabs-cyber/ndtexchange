'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { LifeBuoy } from 'lucide-react';
import { ACCEPTED_FILE_TYPES } from '@/lib/utils';

const supportSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters.'),
  category: z.enum(['technical-issue', 'billing-inquiry', 'general-question', 'feature-request']),
  description: z.string().min(20, 'Please provide a detailed description (at least 20 characters).'),
  attachment: z.any().optional(),
});

export default function SupportPage() {
  const { toast } = useToast();
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
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <LifeBuoy className="w-8 h-8 text-primary" />
        <div>
            <h1 className="text-2xl font-headline font-semibold">Contact Support</h1>
            <p className="text-muted-foreground">
            Have a question or need help? Fill out the form below.
            </p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Submit a Request</CardTitle>
          <CardDescription>Our support team will review your request and respond as soon as possible.</CardDescription>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit">Submit Request</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

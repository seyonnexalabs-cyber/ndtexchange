'use client';
import * as React from 'react';
import { notFound, useParams, useRouter, useSearchParams } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useFirebase, useDoc, useUser, errorEmitter, FirestorePermissionError, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { Job, PlatformUser } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { CustomDateInput } from '@/components/ui/custom-date-input';
import { cn, safeParseDate } from '@/lib/utils';
import { format } from 'date-fns';

const editJobSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long.'),
  description: z.string().optional(),
  location: z.string().min(3, 'Location is required.'),
  scheduledStartDate: z.date().optional(),
  scheduledEndDate: z.date().optional(),
  internalNotes: z.string().optional(),
}).refine(data => {
    if (data.scheduledEndDate && data.scheduledStartDate && data.scheduledEndDate < data.scheduledStartDate) {
        return false;
    }
    return true;
}, {
    message: 'End date cannot be before start date.',
    path: ['scheduledEndDate'],
});

type EditJobFormValues = z.infer<typeof editJobSchema>;

export default function EditJobPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const searchParams = useSearchParams();
    const { firestore, user: authUser } = useFirebase();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const { data: job, isLoading: isLoadingJob } = useDoc<Job>(
        useMemoFirebase(() => (firestore && id ? doc(firestore, `jobs`, id) : null), [firestore, id])
    );
    
    const { data: userProfile, isLoading: isLoadingProfile } = useDoc<PlatformUser>(
        useMemoFirebase(() => (firestore && authUser ? doc(firestore, 'users', authUser.uid) : null), [firestore, authUser])
    );

    const form = useForm<EditJobFormValues>({
        resolver: zodResolver(editJobSchema),
        defaultValues: {
            title: '',
            description: '',
            location: '',
            internalNotes: '',
        }
    });

    React.useEffect(() => {
        if (job) {
            form.reset({
                title: job.title,
                description: job.description || '',
                location: job.location,
                scheduledStartDate: job.scheduledStartDate ? safeParseDate(job.scheduledStartDate) ?? undefined : undefined,
                scheduledEndDate: job.scheduledEndDate ? safeParseDate(job.scheduledEndDate) ?? undefined : undefined,
                internalNotes: job.internalNotes || '',
            });
        }
    }, [job, form]);

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    };

    const handleFormSubmit = async (values: EditJobFormValues) => {
        if (!firestore || !authUser || !job) return;
        setIsSubmitting(true);

        const dataToSave = {
            ...values,
            scheduledStartDate: values.scheduledStartDate ? format(values.scheduledStartDate, 'yyyy-MM-dd') : null,
            scheduledEndDate: values.scheduledEndDate ? format(values.scheduledEndDate, 'yyyy-MM-dd') : null,
            modifiedAt: serverTimestamp(),
            modifiedBy: authUser.uid,
        };

        const jobRef = doc(firestore, 'jobs', id);
        
        try {
            await updateDoc(jobRef, dataToSave);
            toast.success("Job Updated", { description: `Job "${values.title}" has been successfully updated.` });
            router.push(constructUrl(`/dashboard/my-jobs/${id}`));
        } catch(error) {
             const permissionError = new FirestorePermissionError({
                path: jobRef.path,
                operation: 'update',
                requestResourceData: dataToSave,
            });
            errorEmitter.emit('permission-error', permissionError);
            toast.error("Update Failed", { description: "You might not have permission to edit this job." });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const isLoading = isLoadingJob || isLoadingProfile;
    
    if (isLoading) {
        return (
            <div className="max-w-2xl mx-auto space-y-4">
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-[500px] w-full" />
            </div>
        );
    }
    
    if (!job) {
        notFound();
    }
    
    return (
        <div className="max-w-2xl mx-auto">
            <Link href={constructUrl(`/dashboard/my-jobs/${id}`)} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mb-4")}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Job Details
            </Link>
            <Card>
                <CardHeader>
                    <CardTitle>Edit Job: {job.title}</CardTitle>
                    <CardDescription>Update the details for this job.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Job Title</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
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
                                        <FormControl><Textarea {...field} className="min-h-24" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Location</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="scheduledStartDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Scheduled Start Date</FormLabel>
                                            <FormControl><CustomDateInput {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="scheduledEndDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Scheduled End Date</FormLabel>
                                            <FormControl><CustomDateInput {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                              <FormField
                                control={form.control}
                                name="internalNotes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Internal Notes</FormLabel>
                                        <FormControl><Textarea {...field} className="min-h-24" /></FormControl>
                                        <p className="text-xs text-muted-foreground mt-1">These notes are only visible to users within your company.</p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <CardFooter className="px-0 pt-4 flex justify-end gap-2">
                                <Button type="button" variant="ghost" onClick={() => router.push(constructUrl(`/dashboard/my-jobs/${id}`))}>Cancel</Button>
                                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Changes'}</Button>
                            </CardFooter>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}

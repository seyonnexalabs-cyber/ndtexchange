

'use client';
import * as React from 'react';
import { useMemo, useState, useEffect } from "react";
import { notFound, useSearchParams, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlatformUser, Job, Certification, NDTServiceProvider, NDTTechnique } from "@/lib/types";
import { ChevronLeft, User, Briefcase, Star, HardHat, Edit, AlertTriangle, Trash } from "lucide-react";
import { useMobile } from '@/hooks/use-mobile';
import { format, isToday, differenceInDays } from 'date-fns';
import { GLOBAL_DATE_FORMAT, cn, safeParseDate } from "@/lib/utils";
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFirebase, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, updateDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { CustomDateInput } from '@/components/ui/custom-date-input';


const jobStatusVariants: Record<Job['status'], 'success' | 'default' | 'secondary' | 'destructive' | 'outline'> = {
    'Draft': 'outline', 'Posted': 'secondary', 'Assigned': 'default', 'Scheduled': 'default', 'In Progress': 'default',
    'Report Submitted': 'secondary', 'Under Audit': 'secondary', 'Audit Approved': 'success', 'Client Review': 'secondary',
    'Client Approved': 'success', 'Completed': 'success', 'Paid': 'success', 'Revisions Requested': 'destructive'
};

const technicianStatusVariants: { [key in PlatformUser['workStatus'] & string]: 'success' | 'default' | 'outline' } = {
    'Available': 'success',
    'On Assignment': 'default',
};

const certificationSchema = z.object({
  method: z.string({ required_error: "Please select a method." }),
  level: z.enum(['Level I', 'Level II', 'Level III'], { required_error: "Please select a level." }),
  certificateNumber: z.string().optional(),
  validUntil: z.date().optional(),
});

const technicianSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name is required."),
  workStatus: z.enum(['Available', 'On Assignment']).optional(),
  certifications: z.array(certificationSchema).min(1, "At least one certification is required."),
});

type TechnicianFormValues = z.infer<typeof technicianSchema>;

const TechnicianForm = ({ onCancel, onSubmit, defaultValues, allTechniques }: { onCancel: () => void; onSubmit: (values: TechnicianFormValues) => void; defaultValues?: Partial<TechnicianFormValues>; allTechniques: NDTTechnique[] }) => {
    const form = useForm<TechnicianFormValues>({
        resolver: zodResolver(technicianSchema),
    });

    useEffect(() => {
        if (defaultValues) {
            form.reset({
                ...defaultValues,
                certifications: defaultValues.certifications?.map(c => ({
                    ...c,
                    validUntil: c.validUntil ? safeParseDate(c.validUntil) : undefined,
                }))
            });
        }
    }, [defaultValues, form]);

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "certifications",
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., John Smith" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="workStatus"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Work Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a status" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Available">Available</SelectItem>
                                    <SelectItem value="On Assignment">On Assignment</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <div>
                  <FormLabel>Certifications</FormLabel>
                  <ScrollArea className="h-60 mt-2">
                    <div className="space-y-4 pr-2">
                      {fields.map((item, index) => (
                        <div key={item.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start p-4 border rounded-md relative">
                          <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => remove(index)} disabled={fields.length <= 1}>
                              <Trash className="h-4 w-4" />
                          </Button>
                          <FormField
                            control={form.control}
                            name={`certifications.${index}.method`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Method</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select method..." /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {(allTechniques || []).map(t => <SelectItem key={t.id} value={t.acronym}>{t.title} ({t.acronym})</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`certifications.${index}.level`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Level</FormLabel>
                                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select level..." /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="Level I">Level I</SelectItem>
                                        <SelectItem value="Level II">Level II</SelectItem>
                                        <SelectItem value="Level III">Level III</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                           <FormField
                            control={form.control}
                            name={`certifications.${index}.certificateNumber`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Certificate # (Optional)</FormLabel>
                                <FormControl><Input placeholder="e.g., 123456" {...field} value={field.value || ''}/></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                           <FormField
                            control={form.control}
                            name={`certifications.${index}.validUntil`}
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Valid Until (Optional)</FormLabel>
                                <FormControl><CustomDateInput {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ method: '', level: 'Level II', certificateNumber: '', validUntil: undefined })}
                        className="mt-4"
                      >
                        Add Certification
                      </Button>
                    </div>
                  </ScrollArea>
                  <FormMessage>{form.formState.errors.certifications?.message}</FormMessage>
                </div>
                <DialogFooter className="pt-4">
                    <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                    <Button type="submit">Save Changes</Button>
                </DialogFooter>
            </form>
        </Form>
    );
};


export default function TechnicianDetailPage() {
    const params = useParams();
    const { id } = params;
    const searchParams = useSearchParams();
    const isMobile = useMobile();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const { firestore } = useFirebase();
    const [hasExpiringCert, setHasExpiringCert] = useState(false);
    const [today, setToday] = useState<Date | null>(null);

    useEffect(() => {
        // Set today's date on the client side
        setToday(new Date());
    }, []);

    const technicianRef = useMemoFirebase(() => (firestore && id ? doc(firestore, 'users', id as string) : null), [firestore, id]);
    const { data: technician, isLoading: isLoadingTechnician } = useDoc<PlatformUser>(technicianRef);

    const { data: provider } = useDoc<NDTServiceProvider>(useMemoFirebase(() => (firestore && technician?.companyId ? doc(firestore, 'companies', technician.companyId) : null), [firestore, technician]));

    const jobsQuery = useMemoFirebase(() => (firestore && id ? query(collection(firestore, 'jobs'), where('technicianIds', 'array-contains', id as string)) : null), [firestore, id]);
    const { data: assignedJobs, isLoading: isLoadingJobs } = useCollection<Job>(jobsQuery);
    
    const { data: allTechniques, isLoading: isLoadingTechniques } = useCollection<NDTTechnique>(
        useMemoFirebase(() => firestore ? collection(firestore, 'techniques') : null, [firestore])
    );
    
    useEffect(() => {
        if (technician?.certifications && today) {
            const expiring = technician.certifications.some((cert: Certification) => {
                if (!cert.validUntil) return false;
                const validUntilDate = safeParseDate(cert.validUntil);
                if (!validUntilDate) return false;
                const diff = differenceInDays(validUntilDate, today);
                return diff >= 0 && diff <= 30;
            });
            setHasExpiringCert(expiring);
        }
    }, [technician, today]);

    const completedJobsCount = useMemo(() => assignedJobs?.filter(j => ['Completed', 'Paid'].includes(j.status)).length || 0, [assignedJobs]);
    
    const highestLevel = technician?.certifications?.reduce((highest, cert) => {
        if (cert.level === 'Level III') return 'Level III';
        if (cert.level === 'Level II' && highest !== 'Level III') return 'Level II';
        if (cert.level === 'Level I' && highest !== 'Level III' && highest !== 'Level II') return 'Level I';
        return highest;
    }, 'Level I' as 'Level I' | 'Level II' | 'Level III');


    const constructUrl = (base: string) => {
        const [pathname, baseQuery] = base.split('?');
        const newParams = new URLSearchParams(searchParams.toString());

        if (baseQuery) {
            const baseParams = new URLSearchParams(baseQuery);
            baseParams.forEach((value, key) => {
                newParams.set(key, value);
            });
        }

        const queryString = newParams.toString();
        return queryString ? `${pathname}?${queryString}` : pathname;
    }

    const handleFormSubmit = async (values: TechnicianFormValues) => {
        if (!technician || !firestore) return;

        const updatedCerts: Certification[] = values.certifications.map(cert => ({
            ...cert,
            validUntil: cert.validUntil ? format(cert.validUntil, 'yyyy-MM-dd') : undefined,
        }));
        
        const technicianRef = doc(firestore, 'users', technician.id);
        await updateDoc(technicianRef, {
            name: values.name,
            workStatus: values.workStatus,
            certifications: updatedCerts,
        });

        toast({
            title: "Technician Updated",
            description: `${technician.name}'s profile has been updated.`,
        });
        setIsFormOpen(false);
    };

    const isLoading = isLoadingTechnician || isLoadingJobs || isLoadingTechniques || !id || !today;

    if (isLoading) {
        return (
             <div className="space-y-6">
                <Skeleton className="h-8 w-1/4" />
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-1 space-y-6">
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                    <div className="lg:col-span-2">
                        <Skeleton className="h-96 w-full" />
                    </div>
                </div>
            </div>
        );
    }
    
    if (!technician) {
        notFound();
    }
    
    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                 <Link href={constructUrl("/dashboard/technicians")} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mb-4 sm:mb-0")}>
                    <ChevronLeft className="mr-2 h-4 w-4 text-primary" />
                    Back to Technicians
                </Link>
                 <Button onClick={() => setIsFormOpen(true)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit Technician
                </Button>
            </div>

            {technician.status === 'Disabled' && (
                <Alert variant="destructive" className="mb-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Technician Inactive</AlertTitle>
                    <AlertDescription>
                        This technician is no longer active with the company. Their profile is maintained for historical job records.
                    </AlertDescription>
                </Alert>
            )}
            
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col items-center gap-4 text-center">
                                <Avatar className="h-24 w-24">
                                    <AvatarFallback className="text-4xl">{technician.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h1 className="text-2xl font-headline font-bold">{technician.name}</h1>
                                    <p className="font-bold text-sm text-muted-foreground">{technician.id}</p>
                                    <Badge shape="rounded" variant={highestLevel === 'Level III' ? 'default' : highestLevel === 'Level II' ? 'success' : 'secondary'} className="mt-1">
                                        {highestLevel} Inspector
                                    </Badge>
                                    <p className="text-sm text-muted-foreground mt-1">{provider?.name}</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="text-center">
                             <Badge variant={technician.workStatus ? technicianStatusVariants[technician.workStatus] : 'outline'}>{technician.workStatus || 'N/A'}</Badge>
                             <div className="mt-4 text-sm border-t pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Jobs Completed</span>
                                    <span className="font-semibold">{completedJobsCount}</span>
                                </div>
                             </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Star className="text-primary" /> Certifications</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Method</TableHead>
                                        <TableHead>Level</TableHead>
                                        <TableHead>Cert #</TableHead>
                                        <TableHead>Valid Until</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {technician.certifications?.map((cert, index) => {
                                        const validUntilDate = cert.validUntil ? safeParseDate(cert.validUntil) : null;
                                        return (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <Badge variant="outline" shape="rounded">{cert.method}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge shape="rounded" variant={cert.level === 'Level III' ? 'default' : cert.level === 'Level II' ? 'success' : 'secondary'}>
                                                        {cert.level}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{cert.certificateNumber || 'N/A'}</TableCell>
                                                <TableCell>{validUntilDate ? format(validUntilDate, GLOBAL_DATE_FORMAT) : 'N/A'}</TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                            {hasExpiringCert && (
                                <Alert variant="destructive" className="mt-4 p-2 text-xs flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span>Certification expiring soon</span>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </div>
                 <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Briefcase className="text-primary" /> Job History</CardTitle>
                            <CardDescription>All jobs assigned to {technician.name}.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isMobile ? (
                                <div className="space-y-4">
                                    {assignedJobs?.map(job => {
                                      const jobDate = safeParseDate(job.scheduledStartDate || job.postedDate);
                                      return (
                                        <Card key={job.id} className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-semibold">{job.title}</p>
                                                    <p className="text-xs font-extrabold text-muted-foreground">{job.id}</p>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                        {job.client} &bull; 
                                                        <span>{jobDate ? format(jobDate, GLOBAL_DATE_FORMAT) : 'N/A'}</span>
                                                        {jobDate && today && isToday(jobDate) && <Badge>Today</Badge>}
                                                    </p>
                                                </div>
                                                <Badge variant={jobStatusVariants[job.status]}>{job.status}</Badge>
                                            </div>
                                            <div className="flex justify-end mt-3">
                                                 <Button asChild size="sm" variant="ghost">
                                                    <Link href={constructUrl(`/dashboard/my-jobs/${job.id}`)}>View Job</Link>
                                                </Button>
                                            </div>
                                        </Card>
                                    )})}
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Job ID</TableHead>
                                            <TableHead>Job Title</TableHead>
                                            <TableHead>Client</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {assignedJobs?.map(job => {
                                          const jobDate = safeParseDate(job.scheduledStartDate || job.postedDate);
                                          return (
                                            <TableRow key={job.id}>
                                                <TableCell className="font-bold text-xs">{job.id}</TableCell>
                                                <TableCell className="font-medium">
                                                    <Link href={constructUrl(`/dashboard/my-jobs/${job.id}`)} className="hover:underline">{job.title}</Link>
                                                </TableCell>
                                                <TableCell>{job.client}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span>{jobDate ? format(jobDate, GLOBAL_DATE_FORMAT) : 'N/A'}</span>
                                                        {jobDate && today && isToday(jobDate) && <Badge>Today</Badge>}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={jobStatusVariants[job.status]}>{job.status}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        )})}
                                    </TableBody>
                                </Table>
                            )}
                             {assignedJobs?.length === 0 && (
                                <div className="text-center py-10 text-muted-foreground">
                                    No jobs have been assigned to this technician yet.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                 </div>
            </div>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Technician: {technician.name}</DialogTitle>
                        <DialogDescription>
                            Update the technician's details below.
                        </DialogDescription>
                    </DialogHeader>
                    <TechnicianForm
                        onSubmit={handleFormSubmit}
                        onCancel={() => setIsFormOpen(false)}
                        allTechniques={allTechniques || []}
                        defaultValues={{
                            name: technician.name,
                            workStatus: technician.workStatus,
                            certifications: technician.certifications
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}

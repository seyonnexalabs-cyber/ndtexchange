

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { PlatformUser, Certification, NDTTechnique, Job } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, MoreVertical, Edit, Trash, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo, useEffect } from "react";
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useFirebase, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, doc, query, where, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Skeleton } from "@/components/ui/skeleton";
import { CustomDateInput } from '@/components/ui/custom-date-input';
import { format, differenceInDays } from 'date-fns';
import { useRouter, useSearchParams } from "next/navigation";
import { safeParseDate } from "@/lib/utils";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from 'next/link';

const certificationSchema = z.object({
  method: z.string({ required_error: "Please select a method." }),
  level: z.enum(['Level I', 'Level II', 'Level III'], { required_error: "Please select a level." }),
  certificateNumber: z.string().optional(),
  validUntil: z.date().optional(),
});

const technicianSchema = z.object({
  id: z.string().optional(), // For editing
  name: z.string().min(2, "Name is required."),
  email: z.string().email("A valid email is required to send an invitation.").optional(),
  workStatus: z.enum(['Available', 'On Assignment']).optional(),
  certifications: z.array(certificationSchema).min(1, "At least one certification is required."),
});

type TechnicianFormValues = z.infer<typeof technicianSchema>;

const TechnicianForm = ({ onCancel, onSubmit, defaultValues, isEditing, allTechniques }: { onCancel: () => void; onSubmit: (values: TechnicianFormValues) => void; defaultValues?: Partial<TechnicianFormValues>, isEditing: boolean, allTechniques: NDTTechnique[] }) => {
    const form = useForm<TechnicianFormValues>({
        resolver: zodResolver(technicianSchema),
        defaultValues: defaultValues || {
            name: '',
            email: '',
            certifications: [],
        },
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
                 {!isEditing && (
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl><Input type="email" placeholder="john.smith@example.com" {...field} /></FormControl>
                                <FormDescription>An invitation will be sent to this email.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                 {isEditing && (
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
                )}
                
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
                    <Button type="submit">Save</Button>
                </DialogFooter>
            </form>
        </Form>
    );
};


const statusStyles: { [key in PlatformUser['status']]: 'success' | 'default' | 'secondary' | 'destructive' | 'outline' } = {
    Active: 'success',
    Invited: 'secondary',
    Disabled: 'destructive',
};

const workStatusStyles: { [key in PlatformUser['workStatus'] & string]: 'success' | 'default' | 'outline' } = {
    'Available': 'success',
    'On Assignment': 'default',
};

const TechnicianCard = ({ technician, allTechniques, onEditClick }: { 
    technician: PlatformUser & { jobsThisMonth: number, currentJob?: Job },
    allTechniques: NDTTechnique[],
    onEditClick: (user: PlatformUser) => void;
}) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [hasExpiringCert, setHasExpiringCert] = useState(false);
    
    useEffect(() => {
        if (technician.certifications) {
            const today = new Date();
            const expiring = technician.certifications.some((cert: Certification) => {
                if (!cert.validUntil) return false;
                const validUntilDate = safeParseDate(cert.validUntil);
                if (!validUntilDate) return false;
                const diff = differenceInDays(validUntilDate, today);
                return diff >= 0 && diff <= 30;
            });
            setHasExpiringCert(expiring);
        }
    }, [technician.certifications]);

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const highestLevel = technician.certifications?.reduce((highest: 'Level I' | 'Level II' | 'Level III', cert: Certification) => {
        if (cert.level === 'Level III') return 'Level III';
        if (cert.level === 'Level II' && highest !== 'Level III') return 'Level II';
        if (cert.level === 'Level I' && highest !== 'Level III' && highest !== 'Level II') return 'Level I';
        return highest;
    }, 'Level I' as 'Level I' | 'Level II' | 'Level III');

    return (
         <Card className="flex flex-col">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                            <AvatarFallback>{technician.name.split(' ').map((n:string) => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-lg">{technician.name}</CardTitle>
                            <CardDescription>{highestLevel} Inspector</CardDescription>
                        </div>
                    </div>
                     <Badge variant={technician.workStatus ? workStatusStyles[technician.workStatus] : 'outline'}>{technician.workStatus || 'N/A'}</Badge>
                </div>
                {hasExpiringCert && (
                    <Alert variant="destructive" className="mt-4 p-2 text-xs flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Certification expiring soon</span>
                    </Alert>
                )}
            </CardHeader>
            <CardContent className="space-y-4 flex-grow">
                 <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-muted-foreground text-xs uppercase font-semibold">Current Job</p>
                        {technician.currentJob ? (
                             <Link href={constructUrl(`/dashboard/my-jobs/${technician.currentJob.id}`)} className="font-medium truncate hover:underline">{technician.currentJob?.title || 'N/A'}</Link>
                        ) : <p className="font-medium truncate">{'N/A'}</p>}
                       
                    </div>
                     <div>
                        <p className="text-muted-foreground text-xs uppercase font-semibold">Jobs (MTD)</p>
                        <p className="font-medium">{technician.jobsThisMonth}</p>
                    </div>
                </div>
                 <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-1">
                        {technician.certifications?.map((cert: Certification, index: number) => {
                             const techInfo = allTechniques?.find(t => t.acronym === cert.method);
                             return (
                                <TooltipProvider key={index}>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Badge variant="secondary">{cert.method}</Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{techInfo?.title || cert.method} - {cert.level}</p>
                                    </TooltipContent>
                                </Tooltip>
                                </TooltipProvider>
                            )
                        })}
                    </div>
                </div>
            </CardContent>
             <CardFooter className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={constructUrl(`/dashboard/technicians/${technician.id}`)}>View Details</Link>
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditClick(technician)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardFooter>
        </Card>
    )
}

export default function TechniciansPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role');
    const { toast } = useToast();
    const { firestore, user: authUser } = useFirebase();

    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<PlatformUser | null>(null);
    const [today, setToday] = useState<Date | undefined>(undefined);

    useEffect(() => {
        setToday(new Date());
    }, []);

    const { data: currentUserProfile, isLoading: isLoadingProfile } = useDoc<PlatformUser>(
        useMemoFirebase(() => (authUser ? doc(firestore, 'users', authUser.uid) : null), [authUser, firestore])
    );
    
    const companyTechniciansQuery = useMemoFirebase(() => {
        if (!firestore || !currentUserProfile?.companyId) return null;
        return query(collection(firestore, 'users'), where('companyId', '==', currentUserProfile.companyId));
    }, [firestore, currentUserProfile]);

    const { data: technicians, isLoading: isLoadingTechnicians } = useCollection<PlatformUser>(companyTechniciansQuery);
    
    const companyJobsQuery = useMemoFirebase(() => {
        if (!firestore || !currentUserProfile?.companyId) return null;
        return query(collection(firestore, 'jobs'), where('providerCompanyId', '==', currentUserProfile.companyId));
    }, [firestore, currentUserProfile]);

    const { data: companyJobs, isLoading: isLoadingJobs } = useCollection<Job>(companyJobsQuery);


    const { data: allTechniques, isLoading: isLoadingTechniques } = useCollection<NDTTechnique>(
        useMemoFirebase(() => firestore ? collection(firestore, 'techniques') : null, [firestore])
    );
    
    useEffect(() => {
        if (role && role !== 'inspector') {
            router.replace(`/dashboard?${searchParams.toString()}`);
        }
    }, [role, router, searchParams]);

    const handleFormSubmit = async (values: TechnicianFormValues) => {
        if (!firestore || !currentUserProfile?.companyId) return;

        const certsToSave: Certification[] = values.certifications.map(cert => ({
            ...cert,
            validUntil: cert.validUntil ? format(cert.validUntil, 'yyyy-MM-dd') : undefined,
        }));

        if (editingUser) {
             await updateDoc(doc(firestore, 'users', editingUser.id), {
                name: values.name,
                certifications: certsToSave,
                workStatus: values.workStatus,
            });
            toast({ title: 'Technician Updated', description: `${values.name}'s profile has been updated.` });
            setEditingUser(null);
        } else { 
            const newUserData: Partial<PlatformUser> = {
                name: values.name,
                email: values.email,
                role: 'Inspector',
                companyId: currentUserProfile.companyId,
                company: currentUserProfile.company,
                status: 'Invited',
                certifications: certsToSave,
                createdAt: serverTimestamp(),
            };
            const docRef = await addDoc(collection(firestore, 'users'), newUserData);
            await updateDoc(docRef, {id: docRef.id});
            toast({ title: 'Invitation Sent', description: `An invitation has been sent to ${values.email}.` });
            setIsAddUserOpen(false);
        }
    };

    const techniciansWithStats = useMemo(() => {
        if (!technicians || !companyJobs || !today) return [];

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        return technicians.map(tech => {
            const jobsThisMonth = companyJobs.filter(job => {
                const jobDate = safeParseDate(job.scheduledStartDate || job.postedDate);
                return job.technicianIds?.includes(tech.id) && jobDate && jobDate >= startOfMonth;
            }).length;
            
            const currentJob = companyJobs.find(job => 
                job.technicianIds?.includes(tech.id) && job.status === 'In Progress'
            );

            return { ...tech, jobsThisMonth, currentJob };
        });
    }, [technicians, companyJobs, today]);
    
    const isLoading = isLoadingProfile || isLoadingTechnicians || isLoadingTechniques || isLoadingJobs;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-80 w-full" />)}
                </div>
            </div>
        )
    }

    if (role !== 'inspector') {
        return null;
    }

    return (
        <TooltipProvider>
            <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                        <Users className="text-primary" />
                        Technicians
                    </h1>
                    <Button onClick={() => setIsAddUserOpen(true)}>Add Technician</Button>
                </div>
                
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {techniciansWithStats.map(user => (
                        <TechnicianCard
                            key={user.id}
                            technician={user}
                            allTechniques={allTechniques || []}
                            onEditClick={setEditingUser}
                        />
                    ))}
                    {techniciansWithStats.length === 0 && (
                        <div className="col-span-full text-center p-10 border rounded-lg">
                            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h2 className="mt-4 text-xl font-headline">No Technicians Found</h2>
                            <p className="mt-2 text-muted-foreground">Click "Add Technician" to build your team roster.</p>
                        </div>
                    )}
                </div>

                <Dialog open={isAddUserOpen || !!editingUser} onOpenChange={(open) => {
                    if (!open) {
                        setIsAddUserOpen(false);
                        setEditingUser(null);
                    }
                }}>
                    <DialogContent className="sm:max-w-xl">
                        <DialogHeader>
                            <DialogTitle>{editingUser ? 'Edit Technician' : 'Add New Technician'}</DialogTitle>
                            <DialogDescription>
                                {editingUser ? "Update the technician's details." : 'Invite a new technician to your company. They will receive an email to set up their account.'}
                            </DialogDescription>
                        </DialogHeader>
                        <TechnicianForm
                            onCancel={() => { setIsAddUserOpen(false); setEditingUser(null); }}
                            onSubmit={handleFormSubmit}
                            isEditing={!!editingUser}
                            allTechniques={allTechniques || []}
                            defaultValues={editingUser ? {
                                id: editingUser.id,
                                name: editingUser.name,
                                email: editingUser.email,
                                workStatus: editingUser.workStatus,
                                certifications: editingUser.certifications?.map(c => ({
                                    ...c,
                                    validUntil: c.validUntil ? new Date(c.validUntil) : undefined,
                                })) || [],
                            } : undefined}
                        />
                    </DialogContent>
                </Dialog>
            </div>
        </TooltipProvider>
    );
}

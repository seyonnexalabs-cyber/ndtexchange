
'use client';
import * as React from 'react';
import { useMemo, useState } from "react";
import { notFound, useSearchParams, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { allUsers, jobs, PlatformUser, Job, NDTTechniques, Certification } from "@/lib/placeholder-data";
import { serviceProviders } from "@/lib/service-providers-data";
import { ChevronLeft, User, Briefcase, Star, HardHat, Edit, AlertTriangle } from "lucide-react";
import { useIsMobile } from '@/hooks/use-mobile';
import { format } from 'date-fns';
import { GLOBAL_DATE_FORMAT } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

const jobStatusVariants: Record<Job['status'], 'success' | 'default' | 'secondary' | 'destructive' | 'outline'> = {
    'Draft': 'outline',
    'Posted': 'secondary',
    'Assigned': 'default',
    'Scheduled': 'default',
    'In Progress': 'default',
    'Report Submitted': 'secondary',
    'Under Audit': 'secondary',
    'Audit Approved': 'success',
    'Client Review': 'secondary',
    'Client Approved': 'success',
    'Completed': 'success',
    'Paid': 'success'
};

const technicianStatusVariants: { [key in PlatformUser['workStatus'] & string]: 'success' | 'default' | 'outline' } = {
    'Available': 'success',
    'On Assignment': 'default',
};

const technicianSchema = z.object({
  id: z.string().optional(), // For editing
  name: z.string().min(2, "Name is required."),
  level: z.enum(['Level I', 'Level II', 'Level III'], { required_error: "Please select a level." }),
  certifications: z.array(z.string()).min(1, "At least one certification must be selected."),
  workStatus: z.enum(['Available', 'On Assignment']).optional(),
});

type TechnicianFormValues = z.infer<typeof technicianSchema>;

const TechnicianForm = ({ onCancel, onSubmit, defaultValues, isEditing }: { onCancel: () => void; onSubmit: (values: TechnicianFormValues) => void; defaultValues?: Partial<TechnicianFormValues>, isEditing: boolean }) => {
    const form = useForm<TechnicianFormValues>({
        resolver: zodResolver(technicianSchema),
        defaultValues: defaultValues || {
            name: '',
            level: 'Level I',
            certifications: [],
        },
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
                 {isEditing && (
                    <FormField
                        control={form.control}
                        name="workStatus"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
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
                 <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Certification Level</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a level" />
                                </SelectTrigger>
                                </FormControl>
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
                    name="certifications"
                    render={() => (
                    <FormItem>
                        <FormLabel>NDT Certifications</FormLabel>
                        <FormDescription>The level selected above will be applied to all checked methods.</FormDescription>
                        <ScrollArea className="h-40 w-full rounded-md border p-4">
                        {NDTTechniques.map((item) => (
                            <FormField
                            key={item.id}
                            control={form.control}
                            name="certifications"
                            render={({ field }) => {
                                return (
                                <FormItem
                                    key={item.id}
                                    className="flex flex-row items-start space-x-3 space-y-0 mb-3"
                                >
                                    <FormControl>
                                    <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                        return checked
                                            ? field.onChange([...(field.value || []), item.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                (value) => value !== item.id
                                                )
                                            )
                                        }}
                                    />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                        {item.name} ({item.id})
                                    </FormLabel>
                                </FormItem>
                                )
                            }}
                            />
                        ))}
                        </ScrollArea>
                        <FormMessage />
                    </FormItem>
                    )}
                />
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
    const isMobile = useIsMobile();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    
    const technician = useMemo(() => allUsers.find(t => t.id === id && t.role === 'Inspector'), [id]);
    const assignedJobs = useMemo(() => jobs.filter(j => j.technicianIds?.includes(id as string)), [id]);
    const provider = useMemo(() => serviceProviders.find(p => p.id === technician?.providerId), [technician]);
    const completedJobsCount = useMemo(() => assignedJobs.filter(j => ['Completed', 'Paid'].includes(j.status)).length, [assignedJobs]);

    if (!technician) {
        notFound();
    }
    
    const highestLevel = technician.level;

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

    const handleFormSubmit = (values: TechnicianFormValues) => {
        console.log("Updated Technician:", { ...technician, ...values });
        toast({
            title: "Technician Updated",
            description: `${technician.name}'s profile has been updated.`,
        });
        setIsFormOpen(false);
        router.refresh();
    };
    
    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <Button asChild variant="outline" size="sm" className="mb-4 sm:mb-0">
                    <Link href={constructUrl("/dashboard/technicians")}>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Technicians
                    </Link>
                </Button>
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
                            <CardTitle className="flex items-center gap-2"><Star /> Certifications</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Method</TableHead>
                                        <TableHead>Level</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {technician.certifications?.map((cert, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Badge variant="outline" shape="rounded">{cert.method}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge shape="rounded" variant={cert.level === 'Level III' ? 'default' : cert.level === 'Level II' ? 'success' : 'secondary'}>
                                                    {cert.level}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
                 <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Briefcase /> Job History</CardTitle>
                            <CardDescription>All jobs assigned to {technician.name}.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isMobile ? (
                                <div className="space-y-4">
                                    {assignedJobs.map(job => (
                                        <Card key={job.id} className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold">{job.title}</p>
                                                    <p className="font-bold text-xs text-muted-foreground">{job.id}</p>
                                                </div>
                                                <Badge variant={jobStatusVariants[job.status]}>{job.status}</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">{job.client}</p>
                                            <div className="flex justify-end mt-3">
                                                 <Button asChild size="sm" variant="ghost">
                                                    <Link href={constructUrl(`/dashboard/my-jobs/${job.id}`)}>View Job</Link>
                                                </Button>
                                            </div>
                                        </Card>
                                    ))}
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
                                        {assignedJobs.map(job => (
                                            <TableRow key={job.id}>
                                                <TableCell className="font-bold text-xs">{job.id}</TableCell>
                                                <TableCell className="font-medium">
                                                    <Link href={constructUrl(`/dashboard/my-jobs/${job.id}`)} className="hover:underline">{job.title}</Link>
                                                </TableCell>
                                                <TableCell>{job.client}</TableCell>
                                                <TableCell>{format(new Date(job.scheduledStartDate || job.postedDate), GLOBAL_DATE_FORMAT)}</TableCell>
                                                <TableCell>
                                                    <Badge variant={jobStatusVariants[job.status]}>{job.status}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                             {assignedJobs.length === 0 && (
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
                        defaultValues={{
                            name: technician.name,
                            level: technician.level,
                            certifications: technician.certifications?.map(c => c.method),
                            workStatus: technician.workStatus,
                        }}
                        isEditing={true}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}

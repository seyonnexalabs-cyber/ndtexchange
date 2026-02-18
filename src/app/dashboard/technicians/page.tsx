'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { PlatformUser, Certification } from "@/lib/types";
import { serviceProviders, NDTTechniques, allUsers as seedUsers } from "@/lib/seed-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, MoreVertical, Edit, Trash } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { useFirebase, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, query, where, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Skeleton } from "@/components/ui/skeleton";
import { CustomDateInput } from "@/components/ui/custom-date-input";
import { format } from 'date-fns';

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

const TechnicianForm = ({ onCancel, onSubmit, defaultValues, isEditing }: { onCancel: () => void; onSubmit: (values: TechnicianFormValues) => void; defaultValues?: Partial<TechnicianFormValues>, isEditing: boolean }) => {
    const form = useForm<TechnicianFormValues>({
        resolver: zodResolver(technicianSchema),
        defaultValues: defaultValues || {
            name: '',
            email: '',
            certifications: [],
        },
    });

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
                                        {NDTTechniques.map(t => <SelectItem key={t.id} value={t.id}>{t.title} ({t.id})</SelectItem>)}
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

export default function TechniciansPage() {
    const isMobile = useMobile();
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role');
    const { toast } = useToast();
    const { firestore, user: authUser } = useFirebase();

    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<PlatformUser | null>(null);

    const { data: currentUserProfile, isLoading: isLoadingProfile } = useDoc<PlatformUser>(
        useMemoFirebase(() => (firestore && authUser ? doc(firestore, 'users', authUser.uid) : null), [firestore, authUser])
    );
    
    const companyTechniciansQuery = useMemoFirebase(() => {
        if (!firestore || !currentUserProfile?.companyId) return null;
        return query(collection(firestore, 'users'), where('companyId', '==', currentUserProfile.companyId));
    }, [firestore, currentUserProfile]);

    const { data: technicians, isLoading: isLoadingTechnicians } = useCollection<PlatformUser>(companyTechniciansQuery);
    
    useEffect(() => {
        if (role && role !== 'inspector') {
            router.replace(`/dashboard/technicians?${searchParams.toString()}`);
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
            await addDoc(collection(firestore, 'users'), newUserData);
            toast({ title: 'Invitation Sent', description: `An invitation has been sent to ${values.email}.` });
            setIsAddUserOpen(false);
        }
    };
    
    if (isLoadingProfile || isLoadingTechnicians) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <Skeleton className="h-64 w-full" />
            </div>
        )
    }

    if (role !== 'inspector') {
        return null; // Or a permission denied message
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <Users className="text-primary" />
                    Technicians
                </h1>
                <Button onClick={() => setIsAddUserOpen(true)}>Add Technician</Button>
            </div>
            
            {isMobile ? (
                <div className="space-y-4">
                    {(technicians || []).map(user => (
                        <Card key={user.id}>
                             <CardHeader>
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle>{user.name}</CardTitle>
                                        <CardDescription>{user.email}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Level</span>
                                    <Badge variant="outline">{user.level}</Badge>
                                </div>
                                 <div className="flex justify-between">
                                    <span className="text-muted-foreground">Status</span>
                                    <Badge variant={statusStyles[user.status]}>{user.status}</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Work Status</span>
                                     <Badge variant={user.workStatus ? workStatusStyles[user.workStatus] : 'outline'}>{user.workStatus || 'N/A'}</Badge>
                                </div>
                            </CardContent>
                             <CardFooter className="flex justify-end">
                                <Button variant="ghost" size="sm" onClick={() => setEditingUser(user)}>Edit</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Certifications</TableHead>
                                <TableHead>Account Status</TableHead>
                                <TableHead>Work Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(technicians || []).map(user => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium flex items-center gap-3">
                                        <Avatar>
                                            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        {user.name}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {user.certifications?.map((cert, index) => <Badge key={index} variant="outline">{cert.method} {cert.level}</Badge>)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={statusStyles[user.status]}>{user.status}</Badge>
                                    </TableCell>
                                     <TableCell>
                                        <Badge variant={user.workStatus ? workStatusStyles[user.workStatus] : 'outline'}>{user.workStatus || 'N/A'}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => setEditingUser(user)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}

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
    );
}
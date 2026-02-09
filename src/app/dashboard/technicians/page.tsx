'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { allUsers, jobs, NDTTechniques, PlatformUser, Certification } from "@/lib/placeholder-data";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, MoreVertical, Edit } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

const technicianSchema = z.object({
  id: z.string().optional(), // For editing
  name: z.string().min(2, "Name is required."),
  level: z.enum(['Level I', 'Level II', 'Level III'], { required_error: "Please select a level." }),
  certifications: z.array(z.string()).min(1, "At least one certification must be selected."),
  workStatus: z.enum(['Available', 'On Assignment']).optional(),
  status: z.enum(['Active', 'Disabled']).optional(),
});

type TechnicianFormValues = z.infer<typeof technicianSchema>;

const TechnicianForm = ({ formId, onSubmit, defaultValues, isEditing }: { formId: string, onSubmit: (values: TechnicianFormValues) => void; defaultValues?: Partial<TechnicianFormValues>, isEditing: boolean }) => {
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
            <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
            </form>
        </Form>
    );
};

const technicianStatusVariants: {[key: string]: 'success' | 'default' | 'outline'} = {
    'Available': 'success',
    'On Assignment': 'default',
    'Disabled': 'outline',
}

const DesktopView = ({ constructUrl, technicians, onEditClick }: { constructUrl: (path: string) => string; technicians: (PlatformUser & { completedJobs: number; })[]; onEditClick: (technician: PlatformUser) => void; }) => (
    <Card>
        <CardHeader>
            <CardTitle>Technician Roster</CardTitle>
            <CardDescription>Manage your team of certified inspectors.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Jobs Completed</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Certifications</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {technicians.map(tech => (
                        <TableRow key={tech.id}>
                            <TableCell className="font-medium flex items-center gap-3">
                                <Avatar>
                                <AvatarFallback>{tech.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                {tech.name}
                            </TableCell>
                            <TableCell>{tech.completedJobs}</TableCell>
                            <TableCell>
                                <Badge variant={tech.workStatus ? technicianStatusVariants[tech.workStatus] : 'outline'}>{tech.workStatus || 'N/A'}</Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1">
                                    {tech.certifications?.map((cert, i) => (
                                        <Badge key={i} variant="secondary" shape="rounded">
                                            {cert.method}
                                            <Separator orientation="vertical" className="h-3 mx-1 bg-muted-foreground/30" />
                                            {cert.level}
                                        </Badge>
                                    ))}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem asChild>
                                            <Link href={constructUrl(`/dashboard/technicians/${tech.id}`)}>View Profile</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onEditClick(tech)}>
                                            <Edit className="mr-2 h-4 w-4"/>
                                            Edit
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
);

const MobileView = ({ constructUrl, technicians, onEditClick }: { constructUrl: (path: string) => string; technicians: (PlatformUser & { completedJobs: number; })[]; onEditClick: (technician: PlatformUser) => void; }) => (
    <div className="space-y-4">
        {technicians.map(tech => {
            return (
                <Card key={tech.id}>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarFallback>{tech.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle>{tech.name}</CardTitle>
                                </div>
                            </div>
                            <Badge variant={tech.workStatus ? technicianStatusVariants[tech.workStatus] : 'outline'}>{tech.workStatus || 'N/A'}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between text-sm mb-4">
                            <span className="text-muted-foreground">Jobs Completed</span>
                            <span className="font-bold">{tech.completedJobs}</span>
                        </div>
                        <h4 className="text-sm font-semibold mb-2">Certifications</h4>
                        <div className="flex flex-wrap gap-1">
                            {tech.certifications?.map((cert, i) => (
                                <Badge key={i} variant="secondary" shape="rounded">
                                    {cert.method}
                                    <Separator orientation="vertical" className="h-3 mx-1 bg-muted-foreground/30" />
                                    {cert.level}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    Options
                                    <MoreVertical className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={constructUrl(`/dashboard/technicians/${tech.id}`)}>View Profile</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onEditClick(tech)}>
                                    <Edit className="mr-2 h-4 w-4"/>
                                    Edit
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardFooter>
                </Card>
            )
        })}
    </div>
);


export default function TechniciansPage() {
    const isMobile = useMobile();
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role');
    const { toast } = useToast();

    useEffect(() => {
        if (role && role !== 'inspector') {
            router.replace(`/dashboard?${searchParams.toString()}`);
        }
    }, [role, router, searchParams]);
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTechnician, setEditingTechnician] = useState<PlatformUser | null>(null);
    const [technicianList, setTechnicianList] = useState(() => allUsers.filter(u => u.providerId === 'provider-03' && u.role === 'Inspector'));
    const [statusFilter, setStatusFilter] = useState('all');
    
    const technicianListWithStats = useMemo(() => {
        return technicianList.map(tech => {
            const completedJobs = jobs.filter(job => 
                job.technicianIds?.includes(tech.id) && (job.status === 'Completed' || job.status === 'Paid')
            ).length;
            return { ...tech, completedJobs };
        });
    }, [technicianList]);

    const filteredTechnicians = useMemo(() => {
        return technicianListWithStats.filter(tech => {
            if (tech.status === 'Disabled' && statusFilter !== 'Disabled') return false;
            if (statusFilter === 'all') return tech.status !== 'Disabled';
            if (statusFilter === 'Disabled') return tech.status === 'Disabled';
            return tech.workStatus === statusFilter && tech.status !== 'Disabled';
        });
    }, [technicianListWithStats, statusFilter]);

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const handleAddClick = () => {
        setEditingTechnician(null);
        setIsFormOpen(true);
    };

    const handleEditClick = (technician: PlatformUser) => {
        setEditingTechnician(technician);
        setIsFormOpen(true);
    };
    
    const closeDialog = () => {
        setIsFormOpen(false);
        setEditingTechnician(null);
    }
    
    const handleFormSubmit = (values: TechnicianFormValues) => {
        const isEditing = !!editingTechnician;

        const newCertifications: Certification[] = values.certifications.map(certMethod => ({
            method: certMethod,
            level: values.level,
        }));

        if (isEditing) {
            setTechnicianList(prev => prev.map(tech => 
                tech.id === editingTechnician.id ? { 
                    ...tech, 
                    name: values.name, 
                    certifications: newCertifications, 
                    level: values.level,
                    workStatus: values.workStatus || tech.workStatus,
                    status: values.status || tech.status,
                } : tech
            ));
            toast({
                title: "Technician Updated",
                description: `${values.name}'s profile has been updated.`,
            });
        } else {
             const newTechnician: PlatformUser = {
                id: `user-TECH-${String(technicianList.length + 1).padStart(2, '0')}`,
                name: values.name,
                email: `${values.name.toLowerCase().replace(' ', '.')}@teaminc.com`,
                role: 'Inspector',
                company: 'TEAM, Inc.',
                status: 'Active',
                certifications: newCertifications,
                workStatus: 'Available',
                providerId: 'provider-03', // This would be dynamic in a real app
                level: values.level,
            };
            setTechnicianList(prev => [newTechnician, ...prev]);
            toast({
                title: "Technician Added",
                description: `${values.name} has been added to your roster.`,
            });
        }
        closeDialog();
    };

    if (role && role !== 'inspector') {
        return null;
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <Users className="text-primary" />
                    Technicians
                </h1>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Active</SelectItem>
                            <SelectItem value="Available">Available</SelectItem>
                            <SelectItem value="On Assignment">On Assignment</SelectItem>
                            <SelectItem value="Disabled">Disabled</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={handleAddClick} className="w-full sm:w-auto">Add New Technician</Button>
                </div>
            </div>
            
            {isMobile ? <MobileView constructUrl={constructUrl} technicians={filteredTechnicians} onEditClick={handleEditClick} /> : <DesktopView constructUrl={constructUrl} technicians={filteredTechnicians} onEditClick={handleEditClick} />}

            <Dialog open={isFormOpen} onOpenChange={closeDialog}>
                <DialogContent className="flex flex-col max-h-[90vh] p-0">
                    <DialogHeader className="p-6 pb-4 border-b">
                        <DialogTitle>{editingTechnician ? 'Edit Technician' : 'Add New Technician'}</DialogTitle>
                        <DialogDescription>
                             {editingTechnician
                                ? "Update the technician's details below."
                                : "Enter the details for the new technician to add them to your roster."
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-grow overflow-y-auto px-6">
                        <TechnicianForm
                            formId="technician-form"
                            onSubmit={handleFormSubmit}
                            defaultValues={editingTechnician ? {
                                name: editingTechnician.name,
                                level: editingTechnician.level,
                                certifications: editingTechnician.certifications?.map(c => c.method),
                                workStatus: editingTechnician.workStatus,
                                status: editingTechnician.status,
                            } : undefined}
                            isEditing={!!editingTechnician}
                        />
                    </div>
                    <DialogFooter className="p-6 pt-4 border-t">
                        <Button type="button" variant="ghost" onClick={closeDialog}>Cancel</Button>
                        <Button type="submit" form="technician-form">Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}

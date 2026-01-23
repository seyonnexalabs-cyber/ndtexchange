

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { technicians as initialTechnicians, NDTTechniques, Technician, Certification } from "@/lib/placeholder-data";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, MoreVertical, Edit } from "lucide-react";
import { useIsMobile } from "@/hooks/use-is-mobile";
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const technicianSchema = z.object({
  name: z.string().min(2, "Name is required."),
  level: z.enum(['Level I', 'Level II', 'Level III'], { required_error: "Please select a level." }),
  certifications: z.array(z.string()).min(1, "At least one certification must be selected."),
});

type TechnicianFormValues = z.infer<typeof technicianSchema>;

const TechnicianForm = ({ onCancel, onSubmit, defaultValues }: { onCancel: () => void; onSubmit: (values: TechnicianFormValues) => void; defaultValues?: Partial<TechnicianFormValues> }) => {
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

const DesktopView = ({ constructUrl, technicians, onEditClick }: { constructUrl: (path: string) => string; technicians: Technician[]; onEditClick: (technician: Technician) => void; }) => (
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
                        <TableHead>Certifications</TableHead>
                        <TableHead>Status</TableHead>
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
                            <TableCell>
                                <div className="flex flex-wrap gap-1">
                                    {tech.certifications.map((cert, i) => <Badge key={i} variant="secondary">{cert.method} ({cert.level.replace('Level ', '')})</Badge>)}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant={tech.status === 'Available' ? 'success' : 'default'}>{tech.status}</Badge>
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

const MobileView = ({ constructUrl, technicians, onEditClick }: { constructUrl: (path: string) => string; technicians: Technician[]; onEditClick: (technician: Technician) => void; }) => (
    <div className="space-y-4">
        {technicians.map(tech => {
            const highestLevel = (tech.certifications.length > 0)
                ? (['Level I', 'Level II', 'Level III'] as const)[Math.max(...tech.certifications.map(c => ['Level I', 'Level II', 'Level III'].indexOf(c.level)))]
                : 'N/A';

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
                                    <CardDescription>{highestLevel} Inspector</CardDescription>
                                </div>
                            </div>
                            <Badge variant={tech.status === 'Available' ? 'success' : 'default'}>{tech.status}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <h4 className="text-sm font-semibold mb-2">Certifications</h4>
                        <div className="flex flex-wrap gap-1">
                            {tech.certifications.map((cert, i) => <Badge key={i} variant="secondary">{cert.method} ({cert.level.replace('Level ', '')})</Badge>)}
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
    const isMobile = useIsMobile();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null);
    const [technicianList, setTechnicianList] = useState(initialTechnicians);

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const handleAddClick = () => {
        setEditingTechnician(null);
        setIsFormOpen(true);
    };

    const handleEditClick = (technician: Technician) => {
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
                tech.id === editingTechnician.id ? { ...tech, name: values.name, certifications: newCertifications } : tech
            ));
            toast({
                title: "Technician Updated",
                description: `${values.name}'s profile has been updated.`,
            });
        } else {
             const newTechnician: Technician = {
                id: `TECH-${String(technicianList.length + 1).padStart(2, '0')}`,
                name: values.name,
                certifications: newCertifications,
                status: 'Available',
                providerId: 'provider-03', // This would be dynamic in a real app
            };
            setTechnicianList(prev => [newTechnician, ...prev]);
            toast({
                title: "Technician Added",
                description: `${values.name} has been added to your roster.`,
            });
        }
        closeDialog();
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <Users/>
                    Technicians
                </h1>
                <Button onClick={handleAddClick}>Add New Technician</Button>
            </div>
            
            {isMobile ? <MobileView constructUrl={constructUrl} technicians={technicianList} onEditClick={handleEditClick} /> : <DesktopView constructUrl={constructUrl} technicians={technicianList} onEditClick={handleEditClick} />}

            <Dialog open={isFormOpen} onOpenChange={(open) => {if (!open) closeDialog()}}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingTechnician ? 'Edit Technician' : 'Add New Technician'}</DialogTitle>
                        <DialogDescription>
                             {editingTechnician
                                ? "Update the technician's details below."
                                : "Enter the details for the new technician to add them to your roster."
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <TechnicianForm
                        onSubmit={handleFormSubmit}
                        onCancel={closeDialog}
                        defaultValues={editingTechnician ? {
                            name: editingTechnician.name,
                            level: (['Level I', 'Level II', 'Level III'] as const)[Math.max(...editingTechnician.certifications.map(c => ['Level I', 'Level II', 'Level III'].indexOf(c.level)))],
                            certifications: editingTechnician.certifications.map(c => c.method),
                        } : undefined}
                    />
                </DialogContent>
            </Dialog>

        </div>
    );
}

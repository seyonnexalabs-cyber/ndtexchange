
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { technicians as initialTechnicians, NDTTechniques, Technician } from "@/lib/placeholder-data";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, FileText, Star } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from "react";
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


const technicianSchema = z.object({
  name: z.string().min(2, "Name is required."),
  level: z.enum(['Level I', 'Level II', 'Level III'], { required_error: "Please select a level." }),
  certifications: z.array(z.string()).min(1, "At least one certification must be selected."),
});

type TechnicianFormValues = z.infer<typeof technicianSchema>;

const TechnicianForm = ({ onCancel, onSubmit }: { onCancel: () => void; onSubmit: (values: TechnicianFormValues) => void; }) => {
    const form = useForm<TechnicianFormValues>({
        resolver: zodResolver(technicianSchema),
        defaultValues: {
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
                                            ? field.onChange([...field.value, item.id])
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
                    <Button type="submit">Add Technician</Button>
                </DialogFooter>
            </form>
        </Form>
    );
};

const DesktopView = ({ constructUrl, technicians }: { constructUrl: (path: string) => string; technicians: Technician[] }) => (
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
                        <TableHead>Level</TableHead>
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
                            <TableCell>{tech.level}</TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1">
                                    {tech.certifications.map(cert => <Badge key={cert} variant="secondary">{cert}</Badge>)}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant={tech.status === 'Available' ? 'success' : 'default'}>{tech.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button asChild variant="ghost" size="sm">
                                    <Link href={constructUrl(`/dashboard/technicians/${tech.id}`)}>View Profile</Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
);

const MobileView = ({ constructUrl, technicians }: { constructUrl: (path: string) => string; technicians: Technician[] }) => (
    <div className="space-y-4">
        {technicians.map(tech => (
            <Card key={tech.id}>
                <CardHeader>
                    <div className="flex items-start justify-between">
                         <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarFallback>{tech.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle>{tech.name}</CardTitle>
                                <CardDescription>{tech.level}</CardDescription>
                            </div>
                        </div>
                        <Badge variant={tech.status === 'Available' ? 'success' : 'default'}>{tech.status}</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <h4 className="text-sm font-semibold mb-2">Certifications</h4>
                    <div className="flex flex-wrap gap-1">
                        {tech.certifications.map(cert => <Badge key={cert} variant="secondary">{cert}</Badge>)}
                    </div>
                </CardContent>
                 <CardFooter className="flex justify-end">
                    <Button asChild variant="ghost" size="sm">
                        <Link href={constructUrl(`/dashboard/technicians/${tech.id}`)}>View Profile</Link>
                    </Button>
                </CardFooter>
            </Card>
        ))}
    </div>
);


export default function TechniciansPage() {
    const isMobile = useIsMobile();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [isAddTechnicianOpen, setAddTechnicianOpen] = useState(false);
    const [technicianList, setTechnicianList] = useState(initialTechnicians);

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const handleFormSubmit = (values: TechnicianFormValues) => {
        const newTechnician: Technician = {
            id: `TECH-${String(technicianList.length + 1).padStart(2, '0')}`,
            name: values.name,
            level: values.level,
            certifications: values.certifications as any,
            status: 'Available',
            providerId: 'provider-03', // This would be dynamic in a real app
        };

        setTechnicianList(prev => [newTechnician, ...prev]);

        toast({
            title: "Technician Added",
            description: `${values.name} has been added to your roster.`,
        });
        setAddTechnicianOpen(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <Users/>
                    Technicians
                </h1>
                <Button onClick={() => setAddTechnicianOpen(true)}>Add New Technician</Button>
            </div>
            
            {isMobile ? <MobileView constructUrl={constructUrl} technicians={technicianList} /> : <DesktopView constructUrl={constructUrl} technicians={technicianList} />}

            <Dialog open={isAddTechnicianOpen} onOpenChange={setAddTechnicianOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Technician</DialogTitle>
                        <DialogDescription>
                            Enter the details for the new technician to add them to your roster.
                        </DialogDescription>
                    </DialogHeader>
                    <TechnicianForm
                        onSubmit={handleFormSubmit}
                        onCancel={() => setAddTechnicianOpen(false)}
                    />
                </DialogContent>
            </Dialog>

        </div>
    );
}

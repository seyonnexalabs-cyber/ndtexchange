
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { clientData } from "@/lib/placeholder-data";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, DollarSign, MoreVertical } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";


const clientSchema = z.object({
  name: z.string().min(3, 'Company name must be at least 3 characters.'),
  location: z.string().min(2, "Location is required."),
  contactPerson: z.string().min(2, 'Contact person name is required.'),
  contactEmail: z.string().email('Please enter a valid email address.'),
  contactPhone: z.string().optional(),
});

const ClientForm = ({ onCancel, onSubmit }: { onCancel: () => void, onSubmit: (values: z.infer<typeof clientSchema>) => void }) => {
    const form = useForm<z.infer<typeof clientSchema>>({
        resolver: zodResolver(clientSchema),
        defaultValues: {
            name: '',
            location: '',
            contactPerson: '',
            contactEmail: '',
            contactPhone: '',
        }
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                 <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Company Name</FormLabel>
                                <FormControl><Input placeholder="e.g., Global Energy Corp." {...field} /></FormControl>
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
                                <FormControl><Input placeholder="City, State/Country" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="contactPerson"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Primary Contact Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="contactEmail"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Primary Contact Email</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="e.g., contact@company.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Contact Phone (Optional)</FormLabel>
                            <FormControl>
                                <Input type="tel" placeholder="e.g., (555) 123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <DialogFooter className="pt-4">
                    <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                    <Button type="submit">Create Client</Button>
                </DialogFooter>
            </form>
        </Form>
    );
};


const DesktopView = ({ constructUrl }: { constructUrl: (base: string) => string }) => (
    <Card>
        <CardHeader>
            <CardTitle>Client Accounts</CardTitle>
            <CardDescription>An overview of all client companies on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Company Name</TableHead>
                        <TableHead>Primary Contact</TableHead>
                        <TableHead>Active Jobs</TableHead>
                        <TableHead>Total Spend</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {clientData.map(client => (
                        <TableRow key={client.id}>
                            <TableCell className="font-medium flex items-center gap-3">
                                <Avatar>
                                    <AvatarFallback>{client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                {client.name}
                            </TableCell>
                            <TableCell>
                                <div>{client.contactPerson}</div>
                                <div className="text-xs text-muted-foreground">{client.contactEmail}</div>
                            </TableCell>
                            <TableCell>{client.activeJobs}</TableCell>
                            <TableCell>${client.totalSpend.toLocaleString()}</TableCell>
                            <TableCell className="text-right">
                               <Button asChild variant="outline" size="sm">
                                    <Link href={constructUrl(`/dashboard/clients/${client.id}`)}>View Details</Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
);

const MobileView = ({ constructUrl }: { constructUrl: (base: string) => string }) => (
    <div className="space-y-4">
        {clientData.map(client => (
            <Card key={client.id}>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarFallback>{client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle>{client.name}</CardTitle>
                            <CardDescription>{client.contactPerson}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-2"><Briefcase /> Active Jobs</span>
                        <span className="font-medium">{client.activeJobs}</span>
                    </div>
                     <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-2"><DollarSign /> Total Spend</span>
                        <span className="font-medium">${client.totalSpend.toLocaleString()}</span>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={constructUrl(`/dashboard/clients/${client.id}`)}>View Details</Link>
                    </Button>
                </CardFooter>
            </Card>
        ))}
    </div>
);


export default function ClientsPage() {
    const isMobile = useIsMobile();
    const searchParams = useSearchParams();
    const [isAddClientOpen, setAddClientOpen] = useState(false);
    const { toast } = useToast();

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    };

    const handleFormSubmit = (values: z.infer<typeof clientSchema>) => {
        console.log("New Client Data:", values);
        toast({
            title: "Client Company Created",
            description: `${values.name} has been added. You can now invite users to this company.`,
        });
        setAddClientOpen(false);
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                        <Users/>
                        Client Management
                    </h1>
                </div>
                <Button onClick={() => setAddClientOpen(true)} className="w-full sm:w-auto">Create Client Company</Button>
            </div>
            
            {isMobile ? <MobileView constructUrl={constructUrl} /> : <DesktopView constructUrl={constructUrl} />}

            <Dialog open={isAddClientOpen} onOpenChange={setAddClientOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Create New Client Company</DialogTitle>
                        <DialogDescription>
                            Create a new client company profile. An initial user can be invited from the client's detail page after creation.
                        </DialogDescription>
                    </DialogHeader>
                    <ClientForm
                        onSubmit={handleFormSubmit}
                        onCancel={() => setAddClientOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}

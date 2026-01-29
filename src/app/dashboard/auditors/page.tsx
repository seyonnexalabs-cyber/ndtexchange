
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { auditFirms as initialAuditFirms, auditFirmServices, auditFirmIndustries, AuditFirm } from "@/lib/auditors-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, MapPin } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

const auditorSchema = z.object({
  name: z.string().min(2, "Firm name is required."),
  location: z.string().min(2, "Location is required."),
  contactPerson: z.string().min(2, "Contact person name is required."),
  contactEmail: z.string().email("Please enter a valid email address."),
  contactPhone: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters."),
  services: z.array(z.string()).min(1, "Select at least one service."),
  industries: z.array(z.string()).min(1, "Select at least one industry."),
});

const AuditorForm = ({ onCancel, onSubmit }: { onCancel: () => void; onSubmit: (values: z.infer<typeof auditorSchema>) => void; }) => {
    const form = useForm<z.infer<typeof auditorSchema>>({
        resolver: zodResolver(auditorSchema),
        defaultValues: {
            name: '',
            location: '',
            contactPerson: '',
            contactEmail: '',
            contactPhone: '',
            description: '',
            services: [],
            industries: [],
        },
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
                                <FormLabel>Firm Name</FormLabel>
                                <FormControl><Input placeholder="e.g., NDT Auditors LLC" {...field} /></FormControl>
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
                                <FormControl><Input placeholder="e.g., Alex Chen" {...field} /></FormControl>
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
                                <FormControl><Input type="email" placeholder="e.g., contact@ndtauditors.com" {...field} /></FormControl>
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
                            <FormControl><Input type="tel" placeholder="e.g., (555) 123-4567" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Firm Description</FormLabel>
                            <FormControl><Textarea placeholder="Briefly describe the firm and its services." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="services"
                        render={() => (
                        <FormItem>
                            <FormLabel>Services Offered</FormLabel>
                            <ScrollArea className="h-40 w-full rounded-md border p-4">
                                {auditFirmServices.map((service) => (
                                <FormField
                                    key={service}
                                    control={form.control}
                                    name="services"
                                    render={({ field }) => {
                                    return (
                                        <FormItem key={service} className="flex flex-row items-center space-x-3 space-y-0 mb-3">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(service)}
                                                    onCheckedChange={(checked) => {
                                                        return checked ? field.onChange([...(field.value || []), service]) : field.onChange(field.value?.filter((value) => value !== service));
                                                    }}
                                                />
                                            </FormControl>
                                            <FormLabel className="font-normal text-sm">{service}</FormLabel>
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
                     <FormField
                        control={form.control}
                        name="industries"
                        render={() => (
                        <FormItem>
                            <FormLabel>Industry Focus</FormLabel>
                            <ScrollArea className="h-40 w-full rounded-md border p-4">
                                {auditFirmIndustries.map((industry) => (
                                <FormField
                                    key={industry}
                                    control={form.control}
                                    name="industries"
                                    render={({ field }) => {
                                    return (
                                        <FormItem key={industry} className="flex flex-row items-center space-x-3 space-y-0 mb-3">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(industry)}
                                                    onCheckedChange={(checked) => {
                                                        return checked ? field.onChange([...(field.value || []), industry]) : field.onChange(field.value?.filter((value) => value !== industry));
                                                    }}
                                                />
                                            </FormControl>
                                            <FormLabel className="font-normal text-sm">{industry}</FormLabel>
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
                </div>
                <DialogFooter className="pt-4">
                    <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                    <Button type="submit">Create Audit Firm</Button>
                </DialogFooter>
            </form>
        </Form>
    );
};

const DesktopView = ({ constructUrl, auditFirms }: { constructUrl: (base: string) => string; auditFirms: AuditFirm[] }) => (
    <Card>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Firm Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Services</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {auditFirms.map(firm => (
                    <TableRow key={firm.id}>
                        <TableCell className="font-medium flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarFallback>{firm.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            {firm.name}
                        </TableCell>
                        <TableCell>{firm.location}</TableCell>
                        <TableCell className="max-w-xs truncate">{firm.services.join(', ')}</TableCell>
                        <TableCell className="text-right">
                           <Button asChild variant="outline" size="sm">
                                <Link href={constructUrl(`/dashboard/auditors/${firm.id}`)}>View Details</Link>
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </Card>
);

const MobileView = ({ constructUrl, auditFirms }: { constructUrl: (base: string) => string; auditFirms: AuditFirm[] }) => (
    <div className="space-y-4">
        {auditFirms.map(firm => (
            <Card key={firm.id}>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                            <AvatarFallback className="text-lg">{firm.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle>{firm.name}</CardTitle>
                            <CardDescription className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {firm.location}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                     <h4 className="text-xs font-semibold mb-2">Services</h4>
                    <p className="text-sm text-muted-foreground">{firm.services.join(', ')}</p>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={constructUrl(`/dashboard/auditors/${firm.id}`)}>View Details</Link>
                    </Button>
                </CardFooter>
            </Card>
        ))}
    </div>
);

export default function AuditorsPage() {
    const isMobile = useIsMobile();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [isAddFirmOpen, setIsAddFirmOpen] = useState(false);
    const [firms, setFirms] = useState(initialAuditFirms);

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const handleFormSubmit = (values: z.infer<typeof auditorSchema>) => {
        const newFirm: AuditFirm = {
            id: `auditor-firm-${Date.now()}`,
            ...values,
        };
        setFirms(prev => [...prev, newFirm]);
        console.log("New Audit Firm Data:", newFirm);
        toast({
            title: "Audit Firm Created",
            description: `${values.name} has been added. You can now invite users to this firm.`,
        });
        setIsAddFirmOpen(false);
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                        <Eye/>
                        Auditor Management
                    </h1>
                </div>
                <Button className="w-full sm:w-auto" onClick={() => setIsAddFirmOpen(true)}>Add New Audit Firm</Button>
            </div>
            
            {isMobile ? <MobileView constructUrl={constructUrl} auditFirms={firms} /> : <DesktopView constructUrl={constructUrl} auditFirms={firms} />}

            <Dialog open={isAddFirmOpen} onOpenChange={setIsAddFirmOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create New Audit Firm</DialogTitle>
                        <DialogDescription>
                            Create a new audit firm profile. An initial user can be invited after creation.
                        </DialogDescription>
                    </DialogHeader>
                    <AuditorForm
                        onSubmit={handleFormSubmit}
                        onCancel={() => setIsAddFirmOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}


'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { serviceProviders } from "@/lib/service-providers-data";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ShieldCheck, MapPin, Star, MoreVertical, Edit } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
import { NDTTechniques } from '@/lib/placeholder-data';
import { auditFirmIndustries } from '@/lib/auditors-data';


const providerSchema = z.object({
  name: z.string().min(2, "Company name is required."),
  location: z.string().min(2, "Location is required."),
  contactPerson: z.string().min(2, "Contact person name is required."),
  contactEmail: z.string().email("Please enter a valid email address."),
  contactPhone: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters."),
  techniques: z.array(z.string()).min(1, "Select at least one technique."),
  industries: z.array(z.string()).min(1, "Select at least one industry."),
});

const ProviderForm = ({ onCancel, onSubmit }: { onCancel: () => void; onSubmit: (values: z.infer<typeof providerSchema>) => void; }) => {
    const form = useForm<z.infer<typeof providerSchema>>({
        resolver: zodResolver(providerSchema),
        defaultValues: {
            name: '',
            location: '',
            contactPerson: '',
            contactEmail: '',
            contactPhone: '',
            description: '',
            techniques: [],
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
                                <FormLabel>Company Name</FormLabel>
                                <FormControl><Input placeholder="e.g., Acme Inspection" {...field} /></FormControl>
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
                                <FormControl><Input placeholder="e.g., Jane Smith" {...field} /></FormControl>
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
                                <FormControl><Input type="email" placeholder="e.g., contact@acme.com" {...field} /></FormControl>
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
                            <FormLabel>Company Description</FormLabel>
                            <FormControl><Textarea placeholder="Briefly describe the company and its services." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="techniques"
                        render={() => (
                        <FormItem>
                            <FormLabel>Techniques Offered</FormLabel>
                            <ScrollArea className="h-40 w-full rounded-md border p-4">
                                {NDTTechniques.map((tech) => (
                                <FormField
                                    key={`tech-${tech.id}`}
                                    control={form.control}
                                    name="techniques"
                                    render={({ field }) => {
                                    return (
                                        <FormItem key={tech.id} className="flex flex-row items-center space-x-3 space-y-0 mb-3">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(tech.id)}
                                                    onCheckedChange={(checked) => {
                                                        return checked ? field.onChange([...(field.value || []), tech.id]) : field.onChange(field.value?.filter((value) => value !== tech.id));
                                                    }}
                                                />
                                            </FormControl>
                                            <FormLabel className="font-normal text-sm">{tech.name}</FormLabel>
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
                    <Button type="submit">Create Provider</Button>
                </DialogFooter>
            </form>
        </Form>
    );
};


const StarRating = ({ rating }: { rating: number }) => {
    return (
        <div className="flex items-center">
            {[...Array(Math.floor(rating))].map((_, i) => (
                <Star key={`full-${i}`} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
            {[...Array(5 - Math.floor(rating))].map((_, i) => (
                <Star key={`empty-${i}`} className="w-4 h-4 fill-gray-300 text-gray-300" />
            ))}
            <span className="ml-2 text-xs text-muted-foreground">{rating.toFixed(1)}</span>
        </div>
    );
};


const DesktopView = ({ constructUrl }: { constructUrl: (base: string) => string }) => (
    <Card>
        <CardHeader>
            <CardTitle>Service Providers</CardTitle>
            <CardDescription>An overview of all NDT service provider companies on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Company Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Techniques</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {serviceProviders.map(provider => (
                        <TableRow key={provider.id}>
                            <TableCell className="font-medium flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback>{provider.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                {provider.name}
                            </TableCell>
                            <TableCell>{provider.location}</TableCell>
                            <TableCell><StarRating rating={provider.rating} /></TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1 w-64">
                                    {provider.techniques.slice(0, 4).map(tech => <Badge key={tech} variant="secondary">{tech}</Badge>)}
                                    {provider.techniques.length > 4 && <Badge variant="outline">+{provider.techniques.length - 4}</Badge>}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                               <Button asChild variant="outline" size="sm">
                                    <Link href={constructUrl(`/dashboard/providers/${provider.id}`)}>View Details</Link>
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
        {serviceProviders.map(provider => (
            <Card key={provider.id}>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                            <AvatarFallback className="text-lg">{provider.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle>{provider.name}</CardTitle>
                            <CardDescription className="flex items-center gap-1"><MapPin className="w-3 h-3 text-primary"/> {provider.location}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                     <StarRating rating={provider.rating} />
                     <div>
                        <h4 className="text-xs font-semibold mb-2">Techniques</h4>
                        <div className="flex flex-wrap gap-1.5">
                            {provider.techniques.map(tech => (
                                <Badge key={tech} variant="secondary">{tech}</Badge>
                            ))}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={constructUrl(`/dashboard/providers/${provider.id}`)}>View Details</Link>
                    </Button>
                </CardFooter>
            </Card>
        ))}
    </div>
);


export default function ProvidersPage() {
    const isMobile = useIsMobile();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [isAddProviderOpen, setAddProviderOpen] = useState(false);

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const handleFormSubmit = (values: z.infer<typeof providerSchema>) => {
        console.log("New Provider Data:", values);
        toast({
            title: "Provider Company Created",
            description: `${values.name} has been added. You can now invite users to this company.`,
        });
        setAddProviderOpen(false);
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                        <ShieldCheck className="text-primary" />
                        Provider Management
                    </h1>
                </div>
                <Button className="w-full sm:w-auto" onClick={() => setAddProviderOpen(true)}>Add New Provider</Button>
            </div>
            
            {isMobile ? <MobileView constructUrl={constructUrl}/> : <DesktopView constructUrl={constructUrl}/>}

            <Dialog open={isAddProviderOpen} onOpenChange={setAddProviderOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Service Provider</DialogTitle>
                        <DialogDescription>
                            Create a new provider company profile. An initial user can be invited after creation.
                        </DialogDescription>
                    </DialogHeader>
                    <ProviderForm
                        onSubmit={handleFormSubmit}
                        onCancel={() => setAddProviderOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}

    
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { allUsers, PlatformUser, clientData } from "@/lib/placeholder-data";
import { serviceProviders } from "@/lib/service-providers-data";
import { auditFirms } from "@/lib/auditors-data";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, Filter, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";


const statusStyles: { [key in PlatformUser['status']]: 'success' | 'default' | 'secondary' | 'destructive' | 'outline' } = {
    Active: 'success',
    Invited: 'secondary',
    Disabled: 'destructive',
};

const userSchema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.string().email(),
  company: z.string().min(1, "Please select a company."),
  role: z.string().min(1, "Please select a role."),
});

const AddUserForm = ({ onCancel, onSubmit }: { onCancel: () => void; onSubmit: (values: z.infer<typeof userSchema>) => void; }) => {
    const form = useForm<z.infer<typeof userSchema>>({
        resolver: zodResolver(userSchema),
        defaultValues: { name: '', email: '' },
    });

    const companies = useMemo(() => {
        const clients = clientData.map(c => ({ value: c.name, label: `${c.name} (Client)` }));
        const providers = serviceProviders.map(p => ({ value: p.name, label: `${p.name} (Provider)` }));
        const auditors = auditFirms.map(f => ({ value: f.name, label: `${f.name} (Auditor)` }));
        return [...clients, ...providers, ...auditors];
    }, []);

    const roles = ['Client', 'Inspector', 'Auditor'];

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl><Input type="email" placeholder="john.doe@example.com" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Company</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a company" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {companies.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Role</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <DialogFooter className="pt-4">
                    <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                    <Button type="submit">Send Invitation</Button>
                </DialogFooter>
            </form>
        </Form>
    );
}

const PlatformUsersView = ({ users }: { users: PlatformUser[] }) => {
    const isMobile = useIsMobile();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const searchMatch = !searchQuery ||
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.company.toLowerCase().includes(searchQuery.toLowerCase());
            
            const roleMatch = selectedRoles.length === 0 || selectedRoles.includes(user.role);

            const statusMatch = statusFilter === 'all' || user.status === statusFilter;

            return searchMatch && roleMatch && statusMatch;
        });
    }, [users, searchQuery, selectedRoles, statusFilter]);

    const uniqueRoles = useMemo(() => {
        const roles = new Set(allUsers.map(u => u.role));
        return Array.from(roles);
    }, []);

    const handleRoleChange = (role: string) => {
        setSelectedRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
    };

    const hasActiveFilters = searchQuery || selectedRoles.length > 0 || statusFilter !== 'all';
    
    if (isMobile) {
        return (
            <div className="space-y-4">
                {filteredUsers.map(user => (
                    <Card key={user.id} className={cn(user.role.toLowerCase().includes('admin') && 'bg-accent/10')}>
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
                                <span className="text-muted-foreground">Role</span>
                                <span className="font-medium">{user.role}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Company</span>
                                <span className="font-medium">{user.company}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Status</span>
                                <Badge variant={statusStyles[user.status]}>{user.status}</Badge>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <Button variant="ghost" size="sm">Manage</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <Input 
                    placeholder="Search name, email, company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-grow"
                />
                 <div className="flex gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full sm:w-auto">
                                <Filter className="mr-2 h-4 w-4" />
                                Role ({selectedRoles.length})
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64">
                             <div className="grid gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">Filter by Role</h4>
                                </div>
                                <div className="grid gap-2">
                                    {uniqueRoles.map(role => (
                                        <div key={role} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`role-${role}`}
                                                checked={selectedRoles.includes(role)}
                                                onCheckedChange={() => handleRoleChange(role)}
                                            />
                                            <Label htmlFor={`role-${role}`}>{role}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Invited">Invited</SelectItem>
                            <SelectItem value="Disabled">Disabled</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
            </div>
             {hasActiveFilters && (
                <div className="mb-4 flex items-center flex-wrap gap-2">
                    <span className="text-sm font-medium">Active Filters:</span>
                    {selectedRoles.map(role => (
                        <Badge key={role} variant="secondary">
                            {role}
                            <button onClick={() => handleRoleChange(role)} className="ml-1.5 rounded-full hover:bg-muted-foreground/20 p-0.5">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                    {statusFilter !== 'all' && (
                        <Badge variant="secondary">
                            Status: {statusFilter}
                             <button onClick={() => setStatusFilter('all')} className="ml-1.5 rounded-full hover:bg-muted-foreground/20 p-0.5">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => { setSearchQuery(''); setSelectedRoles([]); setStatusFilter('all'); }}>Clear All</Button>
                </div>
            )}
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Company / Affiliation</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.map(user => (
                            <TableRow key={user.id} className={cn(user.role.toLowerCase().includes('admin') && 'bg-accent/10')}>
                                <TableCell className="font-medium flex items-center gap-3">
                                    <Avatar>
                                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    {user.name}
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell>{user.company}</TableCell>
                                <TableCell>
                                    <Badge variant={statusStyles[user.status]}>{user.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                   <Button variant="ghost" size="sm">Manage</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                         {filteredUsers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                                    No users found matching your filters.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>
        </>
    );
};


export default function UsersPage() {
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [users, setUsers] = useState(allUsers);
    const { toast } = useToast();

    const handleAddUser = (values: z.infer<typeof userSchema>) => {
        const newUser: PlatformUser = {
            id: `user-${Date.now()}`,
            name: values.name,
            email: values.email,
            company: values.company,
            role: values.role,
            status: 'Invited',
        };
        setUsers(prev => [newUser, ...prev]);
        setIsAddUserOpen(false);
        toast({
            title: 'User Invited',
            description: `An invitation email has been sent to ${values.email}.`,
        });
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                        <Users/>
                        User Management
                    </h1>
                </div>
                <Button className="w-full sm:w-auto" onClick={() => setIsAddUserOpen(true)}>Add User</Button>
            </div>
            
            <PlatformUsersView users={users} />

            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invite New User</DialogTitle>
                        <DialogDescription>
                            The user will receive an email to set up their account and password.
                        </DialogDescription>
                    </DialogHeader>
                    <AddUserForm onCancel={() => setIsAddUserOpen(false)} onSubmit={handleAddUser} />
                </DialogContent>
            </Dialog>
        </div>
    );

    
}

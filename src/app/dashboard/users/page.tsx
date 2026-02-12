
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { PlatformUser } from "@/lib/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, Filter, X, MoreVertical, ChevronsUpDown, Check, Edit } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSearch } from "@/app/components/layout/search-provider";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useFirebase, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';


const statusStyles: { [key in PlatformUser['status']]: 'success' | 'default' | 'secondary' | 'destructive' | 'outline' } = {
    Active: 'success',
    Invited: 'secondary',
    Disabled: 'destructive',
};

const userSchema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.string().email(),
  role: z.string({required_error: "Please select a role."}),
  company: z.string({required_error: "Please select a company."}),
});

const editUserSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Name is required."),
  role: z.string({required_error: "Please select a role."}),
  company: z.string({required_error: "Please select a company."}),
});

const AddUserForm = ({ onCancel, onSubmit, allCompanies }: { onCancel: () => void; onSubmit: (values: z.infer<typeof userSchema>) => void; allCompanies: any[] }) => {
    const form = useForm<z.infer<typeof userSchema>>({
        resolver: zodResolver(userSchema),
        defaultValues: { name: '', email: '' },
    });

    const selectedRole = form.watch("role");

    useEffect(() => {
        form.resetField("company");
    }, [selectedRole, form]);

    const companies = useMemo(() => {
        let companiesToShow = allCompanies;
        if (selectedRole === "Client") {
            companiesToShow = allCompanies.filter(c => c.type === 'Client');
        } else if (selectedRole === "Inspector") {
            companiesToShow = allCompanies.filter(c => c.type === 'Provider');
        } else if (selectedRole === "Auditor") {
            companiesToShow = allCompanies.filter(c => c.type === 'Auditor');
        }
        return companiesToShow.map(c => ({ value: c.name, label: c.name }));
    }, [selectedRole, allCompanies]);

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
                 <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Company</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                        "w-full justify-between",
                                        !field.value && "text-muted-foreground"
                                    )}
                                    disabled={!selectedRole}
                                    >
                                    {field.value
                                        ? companies.find(
                                            (company) => company.value === field.value
                                        )?.label
                                        : "Select a company"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <Command>
                                    <CommandInput placeholder="Search company..." />
                                    <CommandEmpty>No company found.</CommandEmpty>
                                    <CommandGroup>
                                    {companies.map((company) => (
                                        <CommandItem
                                        value={company.label}
                                        key={company.value}
                                        onSelect={() => {
                                            form.setValue("company", company.value)
                                        }}
                                        >
                                        <Check
                                            className={cn(
                                            "mr-2 h-4 w-4",
                                            company.value === field.value
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                        />
                                        {company.label}
                                        </CommandItem>
                                    ))}
                                    </CommandGroup>
                                </Command>
                                </PopoverContent>
                            </Popover>
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

const EditUserForm = ({ user, onCancel, onSubmit, allCompanies }: { user: PlatformUser; onCancel: () => void; onSubmit: (values: z.infer<typeof editUserSchema>) => void; allCompanies: any[] }) => {
    const form = useForm<z.infer<typeof editUserSchema>>({
        resolver: zodResolver(editUserSchema),
        defaultValues: {
            id: user.id,
            name: user.name,
            role: user.role,
            company: user.company,
        },
    });

    const selectedRole = form.watch("role");

    useEffect(() => {
        if(user.role !== selectedRole) {
            form.resetField("company");
        }
    }, [selectedRole, form, user.role]);

    const companies = useMemo(() => {
        let companiesToShow = allCompanies;
        if (selectedRole === "Client") {
            companiesToShow = allCompanies.filter(c => c.type === 'Client');
        } else if (selectedRole === "Inspector") {
            companiesToShow = allCompanies.filter(c => c.type === 'Provider');
        } else if (selectedRole === "Auditor") {
            companiesToShow = allCompanies.filter(c => c.type === 'Auditor');
        }
        return companiesToShow.map(c => ({ value: c.name, label: c.name }));
    }, [selectedRole, allCompanies]);

    const roles = ['Client', 'Inspector', 'Auditor'];

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                 <div>
                    <Label>Email Address</Label>
                    <Input value={user.email} disabled />
                </div>
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
                 <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Company</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn( "w-full justify-between", !field.value && "text-muted-foreground" )}
                                    disabled={!selectedRole}
                                    >
                                    {field.value
                                        ? companies.find( (company) => company.value === field.value )?.label
                                        : "Select a company"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <Command>
                                    <CommandInput placeholder="Search company..." />
                                    <CommandEmpty>No company found.</CommandEmpty>
                                    <CommandGroup>
                                    {companies.map((company) => (
                                        <CommandItem
                                        value={company.label}
                                        key={company.value}
                                        onSelect={() => { form.setValue("company", company.value) }}
                                        >
                                        <Check className={cn( "mr-2 h-4 w-4", company.value === field.value ? "opacity-100" : "opacity-0" )} />
                                        {company.label}
                                        </CommandItem>
                                    ))}
                                    </CommandGroup>
                                </Command>
                                </PopoverContent>
                            </Popover>
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
}

const PlatformUsersView = ({ users, companyAdmins, onPromoteUser, onDisableUser, onEditUser, allCompanies }: { users: PlatformUser[], companyAdmins: Set<string>, onPromoteUser: (user: PlatformUser) => void, onDisableUser: (user: PlatformUser) => void, onEditUser: (user: PlatformUser) => void, allCompanies: any[] }) => {
    const isMobile = useMobile();
    const { searchQuery } = useSearch();
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);

    const isCompanyAdmin = (user: PlatformUser) => companyAdmins.has(user.name);

    const uniqueCompanies = useMemo(() => {
        const companies = new Set(users.filter(u => u.company !== 'NDT EXCHANGE').map(u => u.company));
        return Array.from(companies).sort();
    }, [users]);

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const searchMatch = !searchQuery ||
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.company.toLowerCase().includes(searchQuery.toLowerCase());
            
            const roleMatch = selectedRoles.length === 0 || selectedRoles.includes(user.role);
            const companyMatch = selectedCompanies.length === 0 || selectedCompanies.includes(user.company);
            const statusMatch = statusFilter === 'all' || user.status === statusFilter;

            return searchMatch && roleMatch && companyMatch && statusMatch;
        });
    }, [users, searchQuery, selectedRoles, statusFilter, selectedCompanies]);

    const uniqueRoles = useMemo(() => {
        const roles = new Set(users.filter(u => u.company !== 'NDT EXCHANGE').map(u => u.role));
        return Array.from(roles);
    }, [users]);

    const handleRoleChange = (role: string) => {
        setSelectedRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
    };

    const handleCompanyChange = (company: string) => {
        setSelectedCompanies(prev => prev.includes(company) ? prev.filter(c => c !== company) : [...prev, company]);
    };

    const hasActiveFilters = selectedRoles.length > 0 || statusFilter !== 'all' || selectedCompanies.length > 0;
    
    if (isMobile) {
        return (
            <div className="space-y-4">
                {filteredUsers.map(user => (
                    <Card key={user.id} className={cn(isCompanyAdmin(user) && 'bg-accent/10 border-accent')}>
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
                                <span className="font-medium">{user.role}{isCompanyAdmin(user) && ' (Admin)'}</span>
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
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">Manage</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => onEditUser(user)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit User
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onPromoteUser(user)} disabled={isCompanyAdmin(user) || user.status !== 'Active'}>Make Company Admin</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onDisableUser(user)}>Disable User</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:justify-end gap-4 mb-4">
                 <div className="flex gap-2">
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full sm:w-auto">
                                <Filter className="mr-2 h-4 w-4 text-primary" />
                                Company ({selectedCompanies.length})
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64">
                             <div className="grid gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">Filter by Company</h4>
                                </div>
                                <div className="grid gap-2">
                                    {uniqueCompanies.map(company => (
                                        <div key={company} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`company-${company.replace(/\s+/g, '-')}`}
                                                checked={selectedCompanies.includes(company)}
                                                onCheckedChange={() => handleCompanyChange(company)}
                                            />
                                            <Label htmlFor={`company-${company.replace(/\s+/g, '-')}`}>{company}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full sm:w-auto">
                                <Filter className="mr-2 h-4 w-4 text-primary" />
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
                    {selectedCompanies.map(company => (
                        <Badge key={company} variant="secondary">
                            {company}
                            <button onClick={() => handleCompanyChange(company)} className="ml-1.5 rounded-full hover:bg-muted-foreground/20 p-0.5">
                                <X className="h-3 w-3 text-primary" />
                            </button>
                        </Badge>
                    ))}
                    {selectedRoles.map(role => (
                        <Badge key={role} variant="secondary">
                            {role}
                            <button onClick={() => handleRoleChange(role)} className="ml-1.5 rounded-full hover:bg-muted-foreground/20 p-0.5">
                                <X className="h-3 w-3 text-primary" />
                            </button>
                        </Badge>
                    ))}
                    {statusFilter !== 'all' && (
                        <Badge variant="secondary">
                            Status: {statusFilter}
                             <button onClick={() => setStatusFilter('all')} className="ml-1.5 rounded-full hover:bg-muted-foreground/20 p-0.5">
                                <X className="h-3 w-3 text-primary" />
                            </button>
                        </Badge>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => { setSelectedRoles([]); setStatusFilter('all'); setSelectedCompanies([]); }}>Clear All</Button>
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
                            <TableRow key={user.id} className={cn(isCompanyAdmin(user) && 'bg-accent/10')}>
                                <TableCell className="font-medium flex items-center gap-3">
                                    <Avatar>
                                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        {user.name}
                                        {isCompanyAdmin(user) && <Badge variant="outline" className="ml-2 text-xs">Admin</Badge>}
                                    </div>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell>{user.company}</TableCell>
                                <TableCell>
                                    <Badge variant={statusStyles[user.status]}>{user.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                   <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onEditUser(user)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit User
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => onPromoteUser(user)}
                                                disabled={isCompanyAdmin(user) || user.status !== 'Active'}
                                            >
                                                Make Company Admin
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onDisableUser(user)} disabled={user.status === 'Disabled'}>
                                                Disable User
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
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
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role');
    const { toast } = useToast();
    const { firestore, user } = useFirebase();

    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    
    const isReady = firestore && user && role === 'admin';
    
    const { data: users, isLoading: isLoadingUsers } = useCollection<PlatformUser>(useMemoFirebase(() => isReady ? collection(firestore, 'users') : null, [isReady, firestore]));
    const { data: allCompanies, isLoading: isLoadingCompanies } = useCollection<any>(useMemoFirebase(() => isReady ? collection(firestore, 'companies') : null, [isReady, firestore]));

    const [companyAdmins, setCompanyAdmins] = useState<Set<string>>(() => new Set());
    
    useEffect(() => {
        if(allCompanies) {
            const admins = new Set<string>();
            allCompanies.forEach(c => admins.add(c.contactPerson));
            setCompanyAdmins(admins);
        }
    }, [allCompanies]);


    const [userToPromote, setUserToPromote] = useState<PlatformUser | null>(null);
    const [userToDisable, setUserToDisable] = useState<PlatformUser | null>(null);
    const [showAdminDisableError, setShowAdminDisableError] = useState(false);
    const [editingUser, setEditingUser] = useState<PlatformUser | null>(null);

    useEffect(() => {
        if (role && role !== 'admin') {
            router.replace(`/dashboard?${searchParams.toString()}`);
        }
    }, [role, router, searchParams]);

    const handleAddUser = (values: z.infer<typeof userSchema>) => {
        // This will be handled by Firebase Functions in a real app to send an invite
        console.log("Invite User:", values);
        setIsAddUserOpen(false);
        toast({
            title: 'User Invited (Simulation)',
            description: `An invitation email would be sent to ${values.email}.`,
        });
    };

    const handleEditClick = (user: PlatformUser) => {
        setEditingUser(user);
    };

    const handleEditSubmit = (values: z.infer<typeof editUserSchema>) => {
        console.log("Edit User:", values);
        toast({ title: 'User Updated', description: `${values.name}'s profile has been successfully updated.` });
        setEditingUser(null);
    };

    const handleSetCompanyAdmin = (userToMakeAdmin: PlatformUser) => {
        setUserToPromote(userToMakeAdmin);
    };

    const confirmPromotion = () => {
        if (!userToPromote) return;
        setCompanyAdmins(prevAdmins => {
            const newAdmins = new Set(prevAdmins);
            // This is simplified. A real implementation would need to find the old admin to remove them.
            newAdmins.add(userToPromote.name);
            return newAdmins;
        });

        toast({
            title: "Administrator Changed",
            description: `${userToPromote.name} is now the admin for ${userToPromote.company}.`,
        });
        setUserToPromote(null);
    };

    const handleDisableClick = (userToDisable: PlatformUser) => {
        if (companyAdmins.has(userToDisable.name)) {
            setShowAdminDisableError(true);
        } else {
            setUserToDisable(userToDisable);
        }
    };
    
    const confirmDisableUser = () => {
        if (!userToDisable) return;
        // This would update the user's status in the database.
        toast({
            title: "User Disabled",
            description: `${userToDisable.name} has been disabled and can no longer access the platform.`,
        });
        setUserToDisable(null);
    };

    if (role !== 'admin') {
        return null;
    }
    
    if (isLoadingUsers || isLoadingCompanies) {
        return (
            <div>
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <Skeleton className="h-96 w-full" />
            </div>
        )
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                        <Users className="text-primary" />
                        User Management
                    </h1>
                </div>
                <Button className="w-full sm:w-auto" onClick={() => setIsAddUserOpen(true)}>Invite User</Button>
            </div>
            
            <PlatformUsersView
                users={users || []}
                companyAdmins={companyAdmins}
                onPromoteUser={handleSetCompanyAdmin}
                onDisableUser={handleDisableClick}
                onEditUser={handleEditClick}
                allCompanies={allCompanies || []}
            />

            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Invite New User</DialogTitle>
                        <DialogDescription>
                            The user will receive an email to set up their account and password.
                        </DialogDescription>
                    </DialogHeader>
                    <AddUserForm onCancel={() => setIsAddUserOpen(false)} onSubmit={handleAddUser} allCompanies={allCompanies || []} />
                </DialogContent>
            </Dialog>

             <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                            Modify the user's details and company assignment.
                        </DialogDescription>
                    </DialogHeader>
                    {editingUser && (
                        <EditUserForm
                            user={editingUser}
                            onCancel={() => setEditingUser(null)}
                            onSubmit={handleEditSubmit}
                            allCompanies={allCompanies || []}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!userToPromote} onOpenChange={(open) => !open && setUserToPromote(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Admin Change</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to make {userToPromote?.name} the new admin for {userToPromote?.company}? The current admin will lose their administrative rights.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setUserToPromote(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmPromotion}>
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
             <AlertDialog open={!!userToDisable} onOpenChange={(open) => !open && setUserToDisable(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to disable this user?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Disabling {userToDisable?.name} will prevent them from accessing the platform. Their records will be maintained. This action can be reversed later.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setUserToDisable(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDisableUser} className="bg-destructive hover:bg-destructive/90">Disable User</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={showAdminDisableError} onOpenChange={setShowAdminDisableError}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Action Prohibited</AlertDialogTitle>
                        <AlertDialogDescription>
                            You cannot disable a company's sole administrator. Please promote another user from the same company to be the new admin before disabling this account.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setShowAdminDisableError(false)}>OK</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

    

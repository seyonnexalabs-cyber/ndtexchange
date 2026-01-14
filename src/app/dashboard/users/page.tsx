
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { allUsers } from "@/lib/placeholder-data";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, MoreVertical } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";

const statusStyles: { [key: string]: 'default' | 'secondary' | 'destructive' } = {
    Active: 'default',
    Invited: 'secondary',
    Disabled: 'destructive',
};

const PlatformUsersView = () => {
    const isMobile = useIsMobile();
    
    const platformUsers = useMemo(() => {
        return allUsers.filter(user => !user.role.toLowerCase().includes('admin'));
    }, []);

    if (isMobile) {
        return (
            <div className="space-y-4">
                {platformUsers.map(user => (
                    <Card key={user.id}>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={`https://picsum.photos/seed/${user.avatar}/100/100`} />
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
        <Card>
            <CardHeader>
                <CardTitle>Platform Users</CardTitle>
                <CardDescription>An overview of all client, provider, and auditor accounts.</CardDescription>
            </CardHeader>
            <CardContent>
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
                        {platformUsers.map(user => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={`https://picsum.photos/seed/${user.avatar}/100/100`} />
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
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};


export default function UsersPage() {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <Users/>
                    User Management
                </h1>
                <Button>Invite New User</Button>
            </div>
            
            <PlatformUsersView />
        </div>
    );
}

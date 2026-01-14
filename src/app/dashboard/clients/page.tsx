
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
                                    <AvatarImage src={`https://picsum.photos/seed/${client.id}/100/100`} />
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
                            <AvatarImage src={`https://picsum.photos/seed/${client.id}/100/100`} />
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

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <Users/>
                    Client Management
                </h1>
                <Button>Add New Client</Button>
            </div>
            
            {isMobile ? <MobileView constructUrl={constructUrl} /> : <DesktopView constructUrl={constructUrl} />}
        </div>
    );
}

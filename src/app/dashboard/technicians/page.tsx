'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { technicians } from "@/lib/placeholder-data";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, FileText, Star } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const DesktopView = () => (
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
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {technicians.map(tech => (
                        <TableRow key={tech.id}>
                            <TableCell className="font-medium flex items-center gap-3">
                                <Avatar>
                                <AvatarImage src={`https://picsum.photos/seed/${tech.avatar}/100/100`} />
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
                                <Badge variant={tech.status === 'Available' ? 'default' : 'outline'}>{tech.status}</Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
);

const MobileView = () => (
    <div className="space-y-4">
        {technicians.map(tech => (
            <Card key={tech.id}>
                <CardHeader>
                    <div className="flex items-start justify-between">
                         <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={`https://picsum.photos/seed/${tech.avatar}/100/100`} />
                                <AvatarFallback>{tech.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle>{tech.name}</CardTitle>
                                <CardDescription>{tech.level}</CardDescription>
                            </div>
                        </div>
                        <Badge variant={tech.status === 'Available' ? 'default' : 'outline'}>{tech.status}</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <h4 className="text-sm font-semibold mb-2">Certifications</h4>
                    <div className="flex flex-wrap gap-1">
                        {tech.certifications.map(cert => <Badge key={cert} variant="secondary">{cert}</Badge>)}
                    </div>
                </CardContent>
                 <CardFooter className="flex justify-end">
                    <Button variant="ghost" size="sm">View Profile</Button>
                </CardFooter>
            </Card>
        ))}
    </div>
);


export default function TechniciansPage() {
    const isMobile = useIsMobile();

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <Users/>
                    Technicians
                </h1>
                <Button>Add New Technician</Button>
            </div>
            
            {isMobile ? <MobileView /> : <DesktopView />}

        </div>
    );
}

    
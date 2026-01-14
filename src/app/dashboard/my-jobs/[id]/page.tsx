'use client';

import { useState } from 'react';
import { notFound, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { jobs, technicians, inspectorAssets } from '@/lib/placeholder-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Briefcase, MapPin, Calendar, Users, Wrench, ChevronLeft, PlusCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function JobDetailPage({ params }: { params: { id: string } }) {
    const searchParams = useSearchParams();
    const job = jobs.find(j => j.id === params.id);

    // Using state to manage assignments since we don't have a backend
    const [assignedTechIds, setAssignedTechIds] = useState(job?.technicianIds || []);
    const [assignedEquipIds, setAssignedEquipIds] = useState(job?.equipmentIds || []);
    
    const [isTechDialogOpen, setIsTechDialogOpen] = useState(false);
    const [isEquipDialogOpen, setIsEquipDialogOpen] = useState(false);

    const [tempSelectedTechs, setTempSelectedTechs] = useState<string[]>([]);
    const [tempSelectedEquip, setTempSelectedEquip] = useState<string[]>([]);

    if (!job) {
        notFound();
    }
    
    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const assignedTechnicians = technicians.filter(t => assignedTechIds.includes(t.id));
    const assignedEquipment = inspectorAssets.filter(e => assignedEquipIds.includes(e.id));
    
    const openTechDialog = () => {
        setTempSelectedTechs([...assignedTechIds]);
        setIsTechDialogOpen(true);
    };

    const openEquipDialog = () => {
        setTempSelectedEquip([...assignedEquipIds]);
        setIsEquipDialogOpen(true);
    };

    const handleAssignTechs = () => {
        setAssignedTechIds(tempSelectedTechs);
        // In a real app, you'd also update the master `jobs` array or send to a backend
        job.technicianIds = tempSelectedTechs;
        setIsTechDialogOpen(false);
    };
    
    const handleAssignEquip = () => {
        setAssignedEquipIds(tempSelectedEquip);
        job.equipmentIds = tempSelectedEquip;
        setIsEquipDialogOpen(false);
    };

    return (
        <div>
            <Button asChild variant="outline" size="sm" className="mb-4">
                <Link href={constructUrl("/dashboard/my-jobs")}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to My Jobs
                </Link>
            </Button>
            
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-2xl font-headline flex items-center gap-3">
                                        <Briefcase />
                                        {job.title}
                                    </CardTitle>
                                    <CardDescription>for {job.client}</CardDescription>
                                </div>
                                <Badge>{job.technique}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center text-sm text-muted-foreground">
                                <MapPin className="w-4 h-4 mr-2" />
                                <span>{job.location}</span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span>Posted: {job.postedDate}</span>
                            </div>
                             <div className="border-t pt-4">
                                <h3 className="font-semibold text-lg">Job Description</h3>
                                <p className="mt-2 text-muted-foreground">
                                    Full job description will be displayed here, including scope of work, technical requirements, and any client specifications.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                </div>

                <div className="space-y-6">
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2"><Users /> Technicians</CardTitle>
                            <Button variant="outline" size="sm" onClick={openTechDialog}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Manage
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {assignedTechnicians.length > 0 ? (
                                <ul className="space-y-2">
                                    {assignedTechnicians.map(tech => (
                                        <li key={tech.id} className="text-sm text-muted-foreground">{tech.name} - {tech.level}</li>
                                    ))}
                                </ul>
                            ) : <p className="text-sm text-muted-foreground">No technicians assigned.</p>}
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2"><Wrench /> Equipment</CardTitle>
                             <Button variant="outline" size="sm" onClick={openEquipDialog}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Manage
                            </Button>
                        </CardHeader>
                        <CardContent>
                             {assignedEquipment.length > 0 ? (
                                <ul className="space-y-2">
                                    {assignedEquipment.map(equip => (
                                        <li key={equip.id} className="text-sm text-muted-foreground">{equip.name} - {equip.type}</li>
                                    ))}
                                </ul>
                            ) : <p className="text-sm text-muted-foreground">No equipment assigned.</p>}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Technician Assignment Dialog */}
            <Dialog open={isTechDialogOpen} onOpenChange={setIsTechDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Technicians</DialogTitle>
                        <DialogDescription>Select the technicians to assign to this job.</DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-64 p-1">
                        <div className="space-y-2 p-3">
                        {technicians.map(tech => (
                            <div key={tech.id} className="flex items-center space-x-2">
                                <Checkbox 
                                    id={`tech-${tech.id}`} 
                                    checked={tempSelectedTechs.includes(tech.id)}
                                    onCheckedChange={(checked) => {
                                        setTempSelectedTechs(prev => checked ? [...prev, tech.id] : prev.filter(id => id !== tech.id))
                                    }}
                                />
                                <Label htmlFor={`tech-${tech.id}`} className="flex-grow">{tech.name} <span className="text-muted-foreground">({tech.level})</span></Label>
                                <Badge variant={tech.status === 'Available' ? 'default' : 'outline'}>{tech.status}</Badge>
                            </div>
                        ))}
                        </div>
                    </ScrollArea>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsTechDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAssignTechs}>Assign Technicians</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Equipment Assignment Dialog */}
            <Dialog open={isEquipDialogOpen} onOpenChange={setIsEquipDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Equipment</DialogTitle>
                        <DialogDescription>Select the equipment to assign to this job.</DialogDescription>
                    </DialogHeader>
                     <ScrollArea className="max-h-64 p-1">
                        <div className="space-y-2 p-3">
                        {inspectorAssets.map(equip => (
                            <div key={equip.id} className="flex items-center space-x-2">
                                <Checkbox 
                                    id={`equip-${equip.id}`}
                                    checked={tempSelectedEquip.includes(equip.id)}
                                    onCheckedChange={(checked) => {
                                        setTempSelectedEquip(prev => checked ? [...prev, equip.id] : prev.filter(id => id !== equip.id))
                                    }}
                                />
                                <Label htmlFor={`equip-${equip.id}`} className="flex-grow">{equip.name} <span className="text-muted-foreground">({equip.type})</span></Label>
                                <Badge variant={equip.status === 'Calibrated' || equip.status === 'In Service' ? 'default' : 'secondary'}>{equip.status}</Badge>
                            </div>
                        ))}
                        </div>
                    </ScrollArea>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsEquipDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAssignEquip}>Assign Equipment</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}

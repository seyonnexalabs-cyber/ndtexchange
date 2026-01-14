'use client';

import * as React from 'react';
import { useState, useMemo, useEffect } from 'react';
import { notFound, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { jobs, technicians, inspectorAssets } from '@/lib/placeholder-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Briefcase, MapPin, Calendar, Users, Wrench, ChevronLeft, PlusCircle, Upload, FileText, CheckCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Job } from '@/lib/placeholder-data';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


const JobLifecycle = ({ status, workflow, onStatusChange }: { status: Job['status'], workflow: Job['workflow'], onStatusChange: (status: Job['status']) => void }) => {
    const allStatuses: Job['status'][] = [
        'Posted',
        'Assigned',
        'Scheduled',
        'In Progress',
        'Report Submitted',
        ...(workflow === 'level3' || workflow === 'auto' ? ['Under Audit', 'Audit Approved'] as const : []),
        'Client Review',
        'Client Approved',
        'Completed',
        'Paid'
    ];
    const currentStatusIndex = allStatuses.indexOf(status);

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Job Lifecycle</CardTitle>
                <CardDescription>
                    {workflow === 'level3' || workflow === 'auto' ? 'Auditor workflow enabled.' : 'Standard workflow.'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row gap-8">
                    <ul className="space-y-4 relative">
                       {/* Dotted Line */}
                       <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-border -translate-x-1/2 border-l-2 border-dashed border-muted-foreground/30 -z-10" />

                        {allStatuses.map((step, index) => {
                            const isCompleted = index < currentStatusIndex;
                            const isActive = index === currentStatusIndex;

                            return (
                               <li key={step} className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 z-10",
                                        isCompleted ? "bg-primary border-primary text-primary-foreground" : 
                                        isActive ? "bg-accent/20 border-accent text-accent" : 
                                        "bg-muted border-muted-foreground/20 text-muted-foreground",
                                    )}>
                                    {isCompleted ? <CheckCircle className="w-6 h-6" /> : <span className="text-base font-bold">{index + 1}</span>}
                                    </div>
                                    <p className={cn(
                                        "font-medium",
                                        isActive ? "text-foreground" : "text-muted-foreground",
                                    )}>{step}</p>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </CardContent>
            <CardFooter className="flex-col items-start gap-4 border-t pt-6">
                <div className="font-semibold text-sm">Lifecycle Test Control</div>
                <div className="flex items-center gap-4">
                    <Label htmlFor="status-select">Override Status:</Label>
                    <Select onValueChange={(val) => onStatusChange(val as Job['status'])} defaultValue={status}>
                        <SelectTrigger id="status-select" className="w-[200px]">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            {allStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </CardFooter>
        </Card>
    );
};


export default function JobDetailPage({ params }: { params: { id: string } }) {
    const { id } = React.use(params);
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'client';
    
    const job = useMemo(() => jobs.find(j => j.id === id), [id]);

    const [assignedTechIds, setAssignedTechIds] = useState<string[]>([]);
    const [assignedEquipIds, setAssignedEquipIds] = useState<string[]>([]);
    const [currentStatus, setCurrentStatus] = useState<Job['status']>('Posted');
    
    const [isTechDialogOpen, setIsTechDialogOpen] = useState(false);
    const [isEquipDialogOpen, setIsEquipDialogOpen] = useState(false);

    const [tempSelectedTechs, setTempSelectedTechs] = useState<string[]>([]);
    const [tempSelectedEquip, setTempSelectedEquip] = useState<string[]>([]);

    useEffect(() => {
        if (job) {
            setAssignedTechIds(job.technicianIds || []);
            setAssignedEquipIds(job.equipmentIds || []);
            setCurrentStatus(job.status);
        }
    }, [job]);

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

    const isInspector = role === 'inspector';

    return (
        <div>
            <Button asChild variant="outline" size="sm" className="mb-4">
                <Link href={constructUrl("/dashboard/my-jobs")}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to My Jobs
                </Link>
            </Button>

            <JobLifecycle status={currentStatus} workflow={job.workflow} onStatusChange={setCurrentStatus} />
            
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

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">Job Results & Reports</CardTitle>
                             <CardDescription>Upload findings, generate reports, and view final documentation.</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center text-muted-foreground p-10">
                            <FileText className="mx-auto h-12 w-12" />
                            <p className="mt-4">Reporting features are coming soon.</p>
                            <p className="text-xs">You'll be able to generate technique-specific digital reports here.</p>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="outline"><Upload className="mr-2" /> Upload Report</Button>
                            <Button>Generate Digital Report</Button>
                        </CardFooter>
                    </Card>

                </div>

                <div className="space-y-6">
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2"><Users /> Technicians</CardTitle>
                            {isInspector && (
                                <Button variant="outline" size="sm" onClick={openTechDialog}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Manage
                                </Button>
                            )}
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
                             {isInspector && (
                                <Button variant="outline" size="sm" onClick={openEquipDialog}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Manage
                                </Button>
                             )}
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

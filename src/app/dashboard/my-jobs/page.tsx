
'use client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { jobs, technicians, inspectorAssets, clientAssets, NDTTechniques } from "@/lib/placeholder-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, CheckCircle, MapPin, Users, Wrench, Calendar, User, SlidersHorizontal, RadioTower, History, Award, AlarmClock, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { useJobPost } from "./job-post-provider";


const jobSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  location: z.string().min(2, 'Location is required.'),
  technique: z.enum(['UT', 'RT', 'MT', 'PT', 'VT', 'PAUT', 'TOFD', 'ET', 'AE', 'LT', 'IR', 'APR']),
  description: z.string().optional(),
  assets: z.array(z.string()).refine(value => value.some(item => item), {
    message: "You have to select at least one asset.",
  }),
  workflow: z.enum(['standard', 'level3', 'auto']),
  documents: z.any().optional(), // For file uploads
  bidExpiryDate: z.date().optional(),
  scheduledStartDate: z.date().optional(),
  scheduledEndDate: z.date().optional(),
}).refine(data => {
    if (data.scheduledStartDate && data.scheduledEndDate) {
        return data.scheduledEndDate >= data.scheduledStartDate;
    }
    return true;
}, {
    message: "End date cannot be before start date.",
    path: ["scheduledEndDate"],
});


const equipmentIcons = {
    'UT Equipment': <RadioTower className="w-4 h-4 text-muted-foreground" />,
    'PAUT Probe': <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />,
    'Yoke': <Wrench className="w-4 h-4 text-muted-foreground" />,
    'Calibration Block': <Wrench className="w-4 h-4 text-muted-foreground" />,
};

type JobView = 'active' | 'completed' | 'upcoming';

function PostJobDialog() {
    const { isJobPostOpen, setJobPostOpen } = useJobPost();
    const form = useForm<z.infer<typeof jobSchema>>({
        resolver: zodResolver(jobSchema),
        defaultValues: {
            title: '',
            location: '',
            technique: 'UT',
            description: '',
            assets: [],
            workflow: 'standard',
        },
    });

    function onSubmit(values: z.infer<typeof jobSchema>) {
        console.log('New Job Submitted:', values);
        setJobPostOpen(false);
        form.reset();
    }

    return (
        <Dialog open={isJobPostOpen} onOpenChange={setJobPostOpen}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Post a New Job</DialogTitle>
                    <DialogDescription>
                        Fill out the details below to create a new job listing on the marketplace.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Job Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., PAUT on Pressure Vessel Welds" {...field} />
                                        </FormControl>
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
                                        <FormControl>
                                            <Input placeholder="City, State" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="technique"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Required Technique</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a technique" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {NDTTechniques.map(tech => (
                                                    <SelectItem key={tech.id} value={tech.id}>{tech.name} ({tech.id})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="bidExpiryDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                    <FormLabel>Bid Expiry Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                            >
                                            {field.value ? (
                                                format(field.value, "PPP")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                        <CalendarComponent
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) => date < new Date()}
                                            initialFocus
                                        />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="scheduledStartDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                    <FormLabel>Target Start Date (Optional)</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                            >
                                            {field.value ? (
                                                format(field.value, "PPP")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                        <CalendarComponent
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) => date < new Date()}
                                            initialFocus
                                        />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="scheduledEndDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                    <FormLabel>Target End Date (Optional)</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                            >
                                            {field.value ? (
                                                format(field.value, "PPP")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                        <CalendarComponent
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) => date < (form.getValues('scheduledStartDate') || new Date())}
                                            initialFocus
                                        />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        
                        <FormField
                            control={form.control}
                            name="assets"
                            render={() => (
                            <FormItem>
                                <FormLabel>Select Asset(s)</FormLabel>
                                <ScrollArea className="h-32 w-full rounded-md border p-4">
                                    {clientAssets.map((asset) => (
                                    <FormField
                                        key={asset.id}
                                        control={form.control}
                                        name="assets"
                                        render={({ field }) => {
                                        return (
                                            <FormItem
                                            key={asset.id}
                                            className="flex flex-row items-start space-x-3 space-y-0"
                                            >
                                            <FormControl>
                                                <Checkbox
                                                checked={field.value?.includes(asset.id)}
                                                onCheckedChange={(checked) => {
                                                    return checked
                                                    ? field.onChange([...(field.value || []), asset.id])
                                                    : field.onChange(
                                                        field.value?.filter(
                                                            (value) => value !== asset.id
                                                        )
                                                        )
                                                }}
                                                />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                {asset.name} ({asset.location})
                                            </FormLabel>
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
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Job Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Provide a detailed scope of work, requirements, and any specifications." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="documents"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Attach Documents</FormLabel>
                                        <FormControl>
                                            <Input type="file" multiple onChange={(e) => field.onChange(e.target.files)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="workflow"
                                render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Approval Workflow</FormLabel>
                                    <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex flex-col space-y-1"
                                    >
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="standard" />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                            Standard Workflow (Client Approval)
                                        </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="level3" />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                            Level III Approval Required
                                        </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="auto" />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                            Auto-select based on rules
                                        </FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setJobPostOpen(false)}>Cancel</Button>
                            <Button type="submit">Post Job</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}


export default function MyJobsPage() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'client';
    const [view, setView] = useState<JobView>('active');
    const { setJobPostOpen } = useJobPost();

    const { displayedJobs, title, Icon } = useMemo(() => {
        let jobsToShow = [];
        let pageTitle = '';
        let PageIcon: React.ElementType = Briefcase;
        
        let relevantJobs = role === 'inspector' 
            ? jobs.filter(j => ['In Progress', 'Completed', 'Assigned', 'Scheduled', 'Report Submitted', 'Under Audit', 'Audit Approved', 'Paid'].includes(j.status))
            : jobs; 

        switch(view) {
            case 'active':
                jobsToShow = relevantJobs.filter(job => job.status === 'In Progress');
                pageTitle = 'Active Jobs';
                PageIcon = CheckCircle;
                break;
            case 'completed':
                jobsToShow = relevantJobs.filter(job => ['Completed', 'Paid'].includes(job.status));
                pageTitle = 'Completed Jobs';
                PageIcon = History;
                break;
            case 'upcoming':
                jobsToShow = relevantJobs.filter(job => role === 'inspector' ? ['Assigned', 'Scheduled'].includes(job.status) : ['Posted', 'Assigned', 'Scheduled'].includes(job.status));
                pageTitle = role === 'inspector' ? 'Upcoming Jobs' : 'Pending & Upcoming';
                PageIcon = Award;
                break;
        }
        return { displayedJobs: jobsToShow, title: pageTitle, Icon: PageIcon };
    }, [view, role]);

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const getEmptyStateAction = () => {
        if (role === 'client') {
            return (
                <Button className="mt-4" onClick={() => setJobPostOpen(true)}>
                    <PlusCircle className="mr-2" />
                    Post a Job
                </Button>
            );
        }
        if (role === 'inspector' && view !== 'completed') {
             return (
                <Button asChild className="mt-4">
                    <Link href={constructUrl('/dashboard/find-jobs')}>Find a Job</Link>
                </Button>
            );
        }
        return null;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <Briefcase />
                    My Jobs
                </h1>
                <div className="flex gap-2">
                    <Button variant={view === 'active' ? 'default' : 'outline'} onClick={() => setView('active')}>Active</Button>
                    <Button variant={view === 'upcoming' ? 'default' : 'outline'} onClick={() => setView('upcoming')}>
                        {role === 'inspector' ? 'Upcoming' : 'Pending'}
                    </Button>
                    <Button variant={view === 'completed' ? 'default' : 'outline'} onClick={() => setView('completed')}>Completed</Button>
                </div>
            </div>
             {displayedJobs.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    {displayedJobs.map(job => {
                        const assignedTechnicians = technicians.filter(t => job.technicianIds?.includes(t.id));
                        const assignedEquipment = inspectorAssets.filter(e => job.equipmentIds?.includes(e.id));
                        const isOverdue = job.scheduledStartDate && new Date(job.scheduledStartDate) < new Date() && !['Completed', 'Paid'].includes(job.status);

                        return (
                            <Card key={job.id}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="font-headline text-xl">{job.title}</CardTitle>
                                        <div className="flex items-center gap-2">
                                            {isOverdue && <Badge variant="destructive" className="gap-1.5"><AlarmClock className="w-3.5 h-3.5"/> Overdue</Badge>}
                                            <Badge variant={job.status === 'Posted' ? 'secondary' : job.status === 'In Progress' ? 'default' : 'outline'}>{job.status}</Badge>
                                        </div>
                                    </div>
                                    <CardDescription>{job.client} - {job.technique}</CardDescription>
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
                                     {job.bidExpiryDate && (
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <AlarmClock className="w-4 h-4 mr-2" />
                                            <span>Bids Expire: {job.bidExpiryDate}</span>
                                        </div>
                                    )}
                                    {job.scheduledStartDate && (
                                        <div className={cn("flex items-center text-sm", isOverdue ? "text-destructive font-medium" : "text-muted-foreground")}>
                                            <Calendar className="w-4 h-4 mr-2" />
                                            <span>Inspection: {job.scheduledStartDate}{job.scheduledEndDate && job.scheduledEndDate !== job.scheduledStartDate ? ` to ${job.scheduledEndDate}` : ''}</span>
                                        </div>
                                    )}

                                    {(view === 'active' || view === 'upcoming') && (
                                        <>
                                            <div>
                                                <h4 className="font-semibold flex items-center gap-2 mb-2"><Users className="w-4 h-4" /> Assigned Technicians</h4>
                                                {assignedTechnicians.length > 0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {assignedTechnicians.map(tech => (
                                                            <Badge key={tech.id} variant="secondary" className="flex items-center gap-1.5 pl-1.5">
                                                                <User className="w-3 h-3"/>
                                                                {tech.name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                ) : <p className="text-xs text-muted-foreground">No technicians assigned yet.</p>}
                                            </div>

                                             <div>
                                                <h4 className="font-semibold flex items-center gap-2 mb-2"><Wrench className="w-4 h-4"/> Assigned Equipment</h4>
                                                 {assignedEquipment.length > 0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {assignedEquipment.map(equip => (
                                                             <Badge key={equip.id} variant="secondary" className="flex items-center gap-1.5 pl-1.5">
                                                                {equipmentIcons[equip.type as keyof typeof equipmentIcons] || <Wrench className="w-3 h-3"/>}
                                                                {equip.name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                ) : <p className="text-xs text-muted-foreground">No equipment assigned yet.</p>}
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                                <CardFooter>
                                    <Button asChild>
                                        <Link href={constructUrl(`/dashboard/my-jobs/${job.id}`)}>View Job Details</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            ) : (
                 <div className="text-center p-10 border rounded-lg">
                    <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h2 className="mt-4 text-xl font-headline">No {view} jobs</h2>
                    <p className="mt-2 text-muted-foreground">You don't have any jobs currently in this category.</p>
                     {getEmptyStateAction()}
                </div>
            )}
            <PostJobDialog />
        </div>
    );
}

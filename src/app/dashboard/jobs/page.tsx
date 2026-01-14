

'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { jobs, clientAssets } from '@/lib/placeholder-data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, MapPin, Calendar, PlusCircle, Gavel, FileText, Info, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';


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
});

export default function JobsMarketplacePage() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'client';
    const [isPostJobDialogOpen, setIsPostJobDialogOpen] = useState(false);

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
        // In a real app, this would submit to a backend.
        console.log('New Job Submitted:', values);
        // Here we would add the new job to our state. For now, just log and close.
        setIsPostJobDialogOpen(false);
        form.reset();
    }
    
    const openJobs = useMemo(() => jobs.filter(j => j.status === 'Posted'), []);
    const jobsPostedByClient = useMemo(() => jobs.filter(j => j.client === 'Global Energy Corp.'), []);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <Briefcase />
                    Job Marketplace
                </h1>
                {role === 'client' && (
                    <Button onClick={() => setIsPostJobDialogOpen(true)}>
                        <PlusCircle className="mr-2" />
                        Post New Job
                    </Button>
                )}
            </div>

            {role === 'inspector' && (
                <div className="space-y-6">
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Location-Based Visibility</AlertTitle>
                        <AlertDescription>
                            You are currently viewing all open jobs. In a live environment, you would only see jobs matching your registered state and country.
                        </AlertDescription>
                    </Alert>
                    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                        {openJobs.map(job => (
                            <Card key={job.id}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="font-headline text-xl">{job.title}</CardTitle>
                                        <Badge>{job.technique}</Badge>
                                    </div>
                                    <CardDescription>Posted by {job.client}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <MapPin className="w-4 h-4 mr-2" />
                                        <span>{job.location}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        <span>Posted: {job.postedDate}</span>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button>
                                        <Gavel className="mr-2"/>
                                        Place Bid
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                     {openJobs.length === 0 && (
                        <div className="text-center p-10 border rounded-lg">
                            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h2 className="mt-4 text-xl font-headline">No Open Jobs</h2>
                            <p className="mt-2 text-muted-foreground">There are currently no new jobs available for bidding.</p>
                        </div>
                    )}
                </div>
            )}
            
            {role === 'client' && (
                 <div className="space-y-6">
                    <h2 className="text-lg font-semibold">Your Posted Jobs</h2>
                    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                         {jobsPostedByClient.map(job => (
                            <Card key={job.id} className="bg-muted/30">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="font-headline text-xl">{job.title}</CardTitle>
                                        <Badge variant={job.status === 'Posted' ? 'secondary' : job.status === 'In Progress' ? 'default' : 'outline'}>{job.status}</Badge>
                                    </div>
                                    <CardDescription>{job.technique} Inspection</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <MapPin className="w-4 h-4 mr-2" />
                                        <span>{job.location}</span>
                                    </div>
                                     <div className="flex items-center text-sm text-muted-foreground">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        <span>Posted: {job.postedDate}</span>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button variant="outline">
                                        <FileText className="mr-2"/>
                                        View Bids (3)
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                     {jobsPostedByClient.length === 0 && (
                        <div className="text-center p-10 border rounded-lg">
                            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h2 className="mt-4 text-xl font-headline">No Jobs Posted</h2>
                            <p className="mt-2 text-muted-foreground">You haven't posted any jobs yet. Get started by posting a new job.</p>
                        </div>
                    )}
                </div>
            )}

            <Dialog open={isPostJobDialogOpen} onOpenChange={setIsPostJobDialogOpen}>
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
                                                    <SelectItem value="UT">UT - Ultrasonic Testing</SelectItem>
                                                    <SelectItem value="PAUT">PAUT - Phased Array UT</SelectItem>
                                                    <SelectItem value="TOFD">TOFD - Time-of-Flight Diffraction</SelectItem>
                                                    <SelectItem value="MT">MT - Magnetic Particle Testing</SelectItem>
                                                    <SelectItem value="PT">PT - Penetrant Testing</SelectItem>
                                                    <SelectItem value="RT">RT - Radiographic Testing</SelectItem>
                                                    <SelectItem value="VT">VT - Visual Testing</SelectItem>
                                                    <SelectItem value="ET">ET - Electromagnetic Testing</SelectItem>
                                                    <SelectItem value="AE">AE - Acoustic Emission</SelectItem>
                                                    <SelectItem value="LT">LT - Leak Testing</SelectItem>
                                                    <SelectItem value="IR">IR - Infrared/Thermal Testing</SelectItem>
                                                    <SelectItem value="APR">APR - Acoustic Pulse Reflectometry</SelectItem>
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
                                <Button type="button" variant="ghost" onClick={() => setIsPostJobDialogOpen(false)}>Cancel</Button>
                                <Button type="submit">Post Job</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

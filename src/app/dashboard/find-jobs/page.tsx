'use client';

import { useState, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { jobs, NDTTechniques, Job, JobDocument } from '@/lib/placeholder-data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, MapPin, Calendar, Gavel, Filter, Search as SearchIcon, DollarSign, X, FileText, Upload, Info, AlarmClock, Maximize } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useSearch } from '@/app/components/layout/search-provider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format, isToday } from 'date-fns';
import { GLOBAL_DATE_FORMAT, ACCEPTED_FILE_TYPES } from '@/lib/utils';
import UniformDocumentViewer from '@/app/dashboard/components/uniform-document-viewer';

const bidSchema = z.object({
  amount: z.coerce.number().positive("Bid amount must be positive."),
  comments: z.string().optional(),
  quote: z.any().optional(), // For file upload
  proposedTechnique: z.string(),
  proposalJustification: z.string().optional(),
});

export default function FindJobsPage() {
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [selectedTechniques, setSelectedTechniques] = useState<string[]>([]);
    const [locationFilter, setLocationFilter] = useState('');
    const { searchQuery } = useSearch();
    const [isViewerOpen, setIsViewerOpen] = useState(false);

    const form = useForm<z.infer<typeof bidSchema>>({
        resolver: zodResolver(bidSchema),
        defaultValues: {
            amount: 0,
            comments: '',
            proposalJustification: '',
        },
    });

    const proposedTechnique = useWatch({
      control: form.control,
      name: 'proposedTechnique',
    });

    const filteredJobs = useMemo(() => {
        const openJobs = jobs.filter(j => j.status === 'Posted' || (j.status === 'Posted' && j.bidExpiryDate && new Date(j.bidExpiryDate) < new Date()));
        
        return openJobs.filter(job => {
            const searchMatch = !searchQuery || 
                job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.client.toLowerCase().includes(searchQuery.toLowerCase());

            const techniqueMatch = selectedTechniques.length === 0 || selectedTechniques.includes(job.technique);
            const locationMatch = !locationFilter || job.location.toLowerCase().includes(locationFilter.toLowerCase());

            return searchMatch && techniqueMatch && locationMatch;
        });
    }, [searchQuery, selectedTechniques, locationFilter]);

    const handleOpenDialog = (job: Job) => {
        form.reset({
            amount: 0,
            comments: '',
            proposedTechnique: job.technique,
            proposalJustification: '',
        });
        setSelectedJob(job);
    };
    
    function onBidSubmit(values: z.infer<typeof bidSchema>) {
        console.log('New Bid Submitted:', { jobId: selectedJob?.id, ...values });
        handleCloseDialog();
    }

    const handleCloseDialog = () => {
        setSelectedJob(null);
        form.reset();
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <SearchIcon className="text-primary" />
                    Find Jobs
                </h1>
                <div className="flex items-center gap-2">
                    <Input 
                        placeholder="Filter by location..." 
                        className="w-48"
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                    />
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Filter className="text-primary" />
                                Technique ({selectedTechniques.length})
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">Filter by Technique</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Select the techniques you are certified for.
                                    </p>
                                </div>
                                <div className="grid gap-2 max-h-60 overflow-y-auto p-1">
                                    {NDTTechniques.map(tech => (
                                        <div key={tech.id} className="flex items-center space-x-2">
                                                <Checkbox 
                                                id={`tech-${tech.id}`} 
                                                checked={selectedTechniques.includes(tech.id)}
                                                onCheckedChange={(checked) => {
                                                    setSelectedTechniques(prev => checked ? [...prev, tech.id] : prev.filter(t => t !== tech.id))
                                                }}
                                                />
                                            <Label htmlFor={`tech-${tech.id}`}>{tech.name} ({tech.id})</Label>
                                        </div>
                                    ))}
                                </div>
                                 <Button variant="ghost" size="sm" onClick={() => setSelectedTechniques([])} disabled={selectedTechniques.length === 0}>Clear Filters</Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {selectedTechniques.length > 0 && (
                <div className="mb-4 flex items-center flex-wrap gap-2">
                    <span className="text-sm font-medium">Active Technique Filters:</span>
                    {selectedTechniques.map(techId => (
                        <Badge key={techId} variant="secondary">
                            {NDTTechniques.find(t => t.id === techId)?.name}
                            <button onClick={() => setSelectedTechniques(p => p.filter(t => t !== techId))} className="ml-1.5 rounded-full hover:bg-muted-foreground/20 p-0.5">
                                <X className="h-3 w-3 text-primary" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
            
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {filteredJobs.map(job => {
                    const isExpired = job.bidExpiryDate && new Date(job.bidExpiryDate) < new Date();
                    return (
                    <Card key={job.id} className={isExpired ? 'bg-muted/50' : ''}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="font-headline text-xl">{job.title}</CardTitle>
                                    <p className="text-xs font-extrabold text-muted-foreground">{job.id}</p>
                                </div>
                                {isExpired ? (
                                    <Badge variant="destructive">Bidding Expired</Badge>
                                ) : (
                                    <Badge>{job.technique}</Badge>
                                )}
                            </div>
                            <CardDescription>Posted by {job.client}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center text-sm text-muted-foreground">
                                <MapPin className="w-4 h-4 mr-2 text-primary" />
                                <span>{job.location}</span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4 mr-2 text-primary" />
                                <span>Posted: {format(new Date(job.postedDate), GLOBAL_DATE_FORMAT)}</span>
                                {isToday(new Date(job.postedDate)) && <Badge className="ml-2">Today</Badge>}
                            </div>
                            {job.scheduledStartDate && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                                    <span>Target: {format(new Date(job.scheduledStartDate), GLOBAL_DATE_FORMAT)}{job.scheduledEndDate && job.scheduledEndDate !== job.scheduledStartDate ? ` to ${format(new Date(job.scheduledEndDate), GLOBAL_DATE_FORMAT)}` : ''}</span>
                                    {isToday(new Date(job.scheduledStartDate)) && <Badge className="ml-2">Today</Badge>}
                                </div>
                            )}
                            {job.bidExpiryDate && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <AlarmClock className="w-4 h-4 mr-2 text-primary" />
                                    <span>Bids Expire: {format(new Date(job.bidExpiryDate), GLOBAL_DATE_FORMAT)}</span>
                                    {isToday(new Date(job.bidExpiryDate)) && <Badge className="ml-2">Today</Badge>}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button onClick={() => handleOpenDialog(job)} disabled={isExpired}>
                                <Gavel className="mr-2"/>
                                {isExpired ? 'Bidding Closed' : 'Place Bid'}
                            </Button>
                        </CardFooter>
                    </Card>
                )})}
            </div>

            {filteredJobs.length === 0 && (
                <div className="text-center p-10 border rounded-lg">
                    <Briefcase className="mx-auto h-12 w-12 text-primary" />
                    <h2 className="mt-4 text-xl font-headline">No Open Jobs</h2>
                    <p className="mt-2 text-muted-foreground">There are currently no new jobs matching your filters.</p>
                </div>
            )}

            <Dialog open={!!selectedJob} onOpenChange={(open) => !open && handleCloseDialog()}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Place Bid on: {selectedJob?.title}</DialogTitle>
                        <DialogDescription>
                            Job ID: <span className="font-extrabold text-foreground">{selectedJob?.id}</span> <br/>
                            Review the job details and attached documents, then submit your bid and quotation.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 pt-4">
                        <div className="space-y-4">
                             <h3 className="font-semibold text-lg">Job Documents</h3>
                             <div className="space-y-2">
                                {selectedJob?.documents && selectedJob.documents.length > 0 ? (
                                    <Button variant="outline" className="w-full" onClick={() => setIsViewerOpen(true)}>
                                        <Maximize className="mr-2 h-4 w-4 text-primary" />
                                        View All Job Documents ({selectedJob.documents.length})
                                    </Button>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">No documents were attached to this job.</p>
                                )}
                             </div>
                        </div>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onBidSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Your Bid Amount ($USD)</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                                                    <Input type="number" placeholder="5000.00" className="pl-8" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="proposedTechnique"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Proposed Technique</FormLabel>
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
                                 {proposedTechnique !== selectedJob?.technique && (
                                    <FormField
                                        control={form.control}
                                        name="proposalJustification"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Justification for Change</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Explain why this technique is a better choice for this job..." {...field} />
                                                </FormControl>
                                                 <Alert variant="destructive" className="p-2 text-sm flex items-center gap-2">
                                                    <Info className="h-4 w-4"/>
                                                    <AlertDescription>Client must approve technique changes.</AlertDescription>
                                                 </Alert>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                 )}

                                 <FormField
                                    control={form.control}
                                    name="comments"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Comments (Optional)</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Add any notes or conditions for your bid..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="quote"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Upload Quotation / Documents</FormLabel>
                                            <FormControl>
                                                <Input type="file" multiple accept={ACCEPTED_FILE_TYPES} onChange={e => field.onChange(e.target.files)} />
                                            </FormControl>
                                            <FormDescription>
                                                You can upload multiple files. Max 10MB per file.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter className="pt-4 flex-col sm:flex-row sm:space-x-2">
                                    <Button type="button" variant="ghost" onClick={handleCloseDialog}>Cancel</Button>
                                    <Button type="submit">
                                        <Gavel className="mr-2"/>
                                        Submit Bid
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </div>
                </DialogContent>
            </Dialog>
            
            {selectedJob && (
                 <UniformDocumentViewer 
                    isOpen={isViewerOpen}
                    onOpenChange={setIsViewerOpen}
                    documents={selectedJob.documents?.map(d => ({...d, source: 'Client'})) || []}
                    title={`Documents for ${selectedJob.title}`}
                    description="Securely view all documents associated with this job."
                />
            )}
        </div>
    );
}

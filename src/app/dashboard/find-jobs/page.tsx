'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { jobs, NDTTechniques, Job } from '@/lib/placeholder-data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, MapPin, Calendar, Gavel, Filter, Search as SearchIcon, DollarSign, X, Sparkles, FileDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useSearch } from '@/app/components/layout/search-provider';
import { analyzeJobForBid, BidAnalysisOutput } from '@/ai/flows/bid-analyzer-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const bidSchema = z.object({
  amount: z.coerce.number().positive("Bid amount must be positive."),
  comments: z.string().optional(),
});

export default function FindJobsPage() {
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [selectedTechniques, setSelectedTechniques] = useState<string[]>([]);
    const [locationFilter, setLocationFilter] = useState('');
    const { searchQuery } = useSearch();

    const [analysisResult, setAnalysisResult] = useState<BidAnalysisOutput | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const form = useForm<z.infer<typeof bidSchema>>({
        resolver: zodResolver(bidSchema),
        defaultValues: {
            amount: 0,
            comments: '',
        },
    });

    const filteredJobs = useMemo(() => {
        const openJobs = jobs.filter(j => j.status === 'Posted');
        
        return openJobs.filter(job => {
            const searchMatch = !searchQuery || 
                job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.client.toLowerCase().includes(searchQuery.toLowerCase());

            const techniqueMatch = selectedTechniques.length === 0 || selectedTechniques.includes(job.technique);
            const locationMatch = !locationFilter || job.location.toLowerCase().includes(locationFilter.toLowerCase());

            return searchMatch && techniqueMatch && locationMatch;
        });
    }, [searchQuery, selectedTechniques, locationFilter]);
    
    function onBidSubmit(values: z.infer<typeof bidSchema>) {
        console.log('New Bid Submitted:', { jobId: selectedJob?.id, ...values });
        handleCloseDialog();
    }

    const handleAnalyze = async () => {
        if (!selectedJob) return;
        setIsAnalyzing(true);
        setAnalysisResult(null);
        try {
            const result = await analyzeJobForBid({
                title: selectedJob.title,
                technique: selectedJob.technique,
                location: selectedJob.location,
                // A mock description for now. In a real app this would come from the job data.
                description: `Looking for a certified inspector for ${selectedJob.title}. Asset IDs: ${selectedJob.assetIds?.join(', ')}. The job requires strict adherence to safety protocols and reporting standards.`
            });
            setAnalysisResult(result);
        } catch (error) {
            console.error("Error analyzing job:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };
    
    const handleUseSuggestion = () => {
        if (analysisResult) {
            form.setValue('amount', analysisResult.suggestedBid);
        }
    };

    const handleCloseDialog = () => {
        setSelectedJob(null);
        setAnalysisResult(null);
        setIsAnalyzing(false);
        form.reset();
    };

    const handleDownloadQuote = () => {
        // Placeholder for future PDF generation functionality
        console.log("Generating and downloading quotation PDF...");
        const quoteContent = `
            Quotation for: ${selectedJob?.title}
            Client: ${selectedJob?.client}
            
            AI Bid Analysis:
            Suggested Amount: $${analysisResult?.suggestedBid.toLocaleString()}
            Rationale: ${analysisResult?.rationale}

            Our Bid: $${form.getValues('amount').toLocaleString()}
            Comments: ${form.getValues('comments')}
        `;
        alert("PDF generation is not yet implemented. Quote content logged to console.");
        console.log(quoteContent);
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <SearchIcon />
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
                                <Filter />
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
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
            
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {filteredJobs.map(job => (
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
                            <Button onClick={() => setSelectedJob(job)}>
                                <Gavel className="mr-2"/>
                                Place Bid
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {filteredJobs.length === 0 && (
                <div className="text-center p-10 border rounded-lg">
                    <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h2 className="mt-4 text-xl font-headline">No Open Jobs</h2>
                    <p className="mt-2 text-muted-foreground">There are currently no new jobs matching your filters.</p>
                </div>
            )}

            <Dialog open={!!selectedJob} onOpenChange={(open) => !open && handleCloseDialog()}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Place Bid on: {selectedJob?.title}</DialogTitle>
                        <DialogDescription>
                            Review the job details, use the AI assistant to analyze the scope, and submit your bid.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid md:grid-cols-2 gap-6 pt-4">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">AI Bid Assistant</h3>
                            <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full">
                                <Sparkles className="mr-2" />
                                {isAnalyzing ? 'Analyzing...' : 'Analyze Job & Suggest Bid'}
                            </Button>
                             {isAnalyzing && (
                                <div className="text-sm text-muted-foreground flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                                    <span>AI is analyzing the job scope...</span>
                                </div>
                            )}
                            {analysisResult && (
                                <Alert>
                                    <Sparkles className="h-4 w-4" />
                                    <AlertTitle>AI Bid Suggestion</AlertTitle>
                                    <AlertDescription className="space-y-3">
                                        <div className="text-2xl font-bold text-foreground">${analysisResult.suggestedBid.toLocaleString()}</div>
                                        <p className="text-xs">{analysisResult.rationale}</p>
                                        <Button size="sm" onClick={handleUseSuggestion} className="w-full">Use this Amount</Button>
                                    </AlertDescription>
                                </Alert>
                            )}
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
                                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input type="number" placeholder="5000.00" className="pl-8" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
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
                                <DialogFooter className="pt-4 flex-col sm:flex-col sm:space-x-0 gap-2">
                                     <Button type="submit">
                                        <Gavel className="mr-2"/>
                                        Submit Bid
                                    </Button>
                                    <Button type="button" variant="outline" onClick={handleDownloadQuote}>
                                        <FileDown className="mr-2"/>
                                        Download Quote
                                    </Button>
                                    <Button type="button" variant="ghost" onClick={handleCloseDialog}>Cancel</Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

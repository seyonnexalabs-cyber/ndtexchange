

'use client';

import { useState, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { jobs as initialJobs, NDTTechniques, Job } from '@/lib/placeholder-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gavel, Calendar, DollarSign, Building, MoreVertical, Edit, Trash2, Info, FileText } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Bid } from '@/lib/placeholder-data';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { format } from 'date-fns';
import { GLOBAL_DATE_FORMAT } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';

const bidSchema = z.object({
  amount: z.coerce.number().positive("Bid amount must be positive."),
  comments: z.string().optional(),
  quote: z.any().optional(), // For file upload
  proposedTechnique: z.string(),
  proposalJustification: z.string().optional(),
});


const statusStyles: { [key in Bid['status']]: 'success' | 'default' | 'secondary' | 'destructive' | 'outline' } = {
    Submitted: 'secondary',
    Awarded: 'success',
    Rejected: 'destructive',
    Withdrawn: 'outline',
};

type MappedBid = Bid & { job: Job };

const BidsList = ({ bids, onEdit, onWithdraw, constructUrl }: { bids: MappedBid[], onEdit: (bid: MappedBid) => void, onWithdraw: (bid: MappedBid) => void, constructUrl: (path: string) => string }) => {
    const isMobile = useIsMobile();

    if (bids.length === 0) {
        return (
            <div className="text-center p-10 border rounded-lg">
                <Gavel className="mx-auto h-12 w-12 text-muted-foreground" />
                <h2 className="mt-4 text-xl font-headline">No Bids Found</h2>
                <p className="mt-2 text-muted-foreground">There are no bids in this category.</p>
            </div>
        );
    }
    
    if (isMobile) {
        return (
            <div className="space-y-4">
                {bids.map(bid => (
                    <Card key={bid.id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg font-semibold leading-tight">{bid.job?.title}</CardTitle>
                                <Badge variant={statusStyles[bid.status]}>{bid.status}</Badge>
                            </div>
                            <p className="font-extrabold text-xs text-muted-foreground">{bid.job?.id}</p>
                             <CardDescription className="flex items-center pt-1"><Building className="w-4 h-4 mr-2"/> {bid.job?.client}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center"><DollarSign className="w-4 h-4 mr-2"/>Bid Amount</span>
                                <span className="font-medium">${bid.amount.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center"><Calendar className="w-4 h-4 mr-2"/>Date Submitted</span>
                                <span className="font-medium">{format(new Date(bid.submittedDate), GLOBAL_DATE_FORMAT)}</span>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" asChild>
                                <Link href={constructUrl(`/dashboard/my-jobs/${bid.jobId}`)}>View Job</Link>
                            </Button>
                             {bid.status === 'Submitted' && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEdit(bid)}><Edit className="mr-2 h-4 w-4" /> Edit Bid</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onWithdraw(bid)}><Trash2 className="mr-2 h-4 w-4" /> Withdraw Bid</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Job ID</TableHead>
                        <TableHead>Job Title</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Bid Amount</TableHead>
                        <TableHead>Date Submitted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {bids.map(bid => (
                        <TableRow key={bid.id}>
                            <TableCell className="font-extrabold text-xs">{bid.job?.id}</TableCell>
                            <TableCell className="font-medium">{bid.job?.title}</TableCell>
                            <TableCell>{bid.job?.client}</TableCell>
                            <TableCell>${bid.amount.toLocaleString()}</TableCell>
                            <TableCell>{format(new Date(bid.submittedDate), GLOBAL_DATE_FORMAT)}</TableCell>
                            <TableCell>
                                <Badge variant={statusStyles[bid.status]}>{bid.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                {bid.status === 'Submitted' ? (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onEdit(bid)}><Edit className="mr-2 h-4 w-4" /> Edit Bid</DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={constructUrl(`/dashboard/my-jobs/${bid.jobId}`)}>View Job Details</Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onWithdraw(bid)}><Trash2 className="mr-2 h-4 w-4" /> Withdraw Bid</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                ) : (
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={constructUrl(`/dashboard/my-jobs/${bid.jobId}`)}>{bid.status === 'Awarded' ? 'View Job' : 'View Details'}</Link>
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
};


export default function MyBidsPage() {
    const [editingBid, setEditingBid] = useState<MappedBid | null>(null);
    const [withdrawingBid, setWithdrawingBid] = useState<MappedBid | null>(null);
    const [jobs, setJobs] = useState(initialJobs);
    const searchParams = useSearchParams();

    const form = useForm<z.infer<typeof bidSchema>>({
        resolver: zodResolver(bidSchema),
    });

    const proposedTechnique = useWatch({
      control: form.control,
      name: 'proposedTechnique',
    });

    const constructUrl = (base: string) => {
        const [pathname, baseQuery] = base.split('?');
        const newParams = new URLSearchParams(searchParams.toString());

        if (baseQuery) {
            const baseParams = new URLSearchParams(baseQuery);
            baseParams.forEach((value, key) => {
                newParams.set(key, value);
            });
        }

        const queryString = newParams.toString();
        return queryString ? `${pathname}?${queryString}` : pathname;
    }

    const myBids = useMemo(() => {
        // This is a client-side simulation. In a real app, you'd fetch this data.
        return jobs
            .flatMap(job => (job.bids || []).map(bid => ({ ...bid, job })))
            .filter((bid): bid is MappedBid => !!bid.job)
            .filter(bid => bid.providerId === 'provider-03');
    }, [jobs]);

    const handleEditClick = (bid: MappedBid) => {
        setEditingBid(bid);
        form.reset({
            amount: bid.amount,
            comments: bid.job?.documents?.find(d => d.name.startsWith('bid-comment'))?.url || '', // This is a mock
            proposedTechnique: bid.proposedTechnique || bid.job?.technique,
            proposalJustification: bid.proposalJustification || '',
        });
    };

    const handleWithdrawClick = (bid: MappedBid) => {
        setWithdrawingBid(bid);
    };

    const handleConfirmWithdraw = () => {
        if (!withdrawingBid) return;
        setJobs(prevJobs => prevJobs.map(job => {
            if (job.id === withdrawingBid.jobId) {
                return {
                    ...job,
                    bids: job.bids?.map(b => b.id === withdrawingBid.id ? { ...b, status: 'Withdrawn' } : b)
                };
            }
            return job;
        }));
        setWithdrawingBid(null);
    };

    function onBidSubmit(values: z.infer<typeof bidSchema>) {
        if (!editingBid) return;
        console.log('Updated Bid Submitted:', { bidId: editingBid.id, ...values });
        // API call to update the bid
        setEditingBid(null);
    }
    
    const activeBids = myBids.filter(bid => bid.status === 'Submitted');
    const awardedBids = myBids.filter(bid => bid.status === 'Awarded');
    const archivedBids = myBids.filter(bid => ['Rejected', 'Withdrawn'].includes(bid.status));

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <Gavel />
                    My Bids
                </h1>
                <Button asChild>
                   <Link href={constructUrl("/dashboard/find-jobs")}>Find New Jobs</Link>
                </Button>
            </div>

            <Tabs defaultValue="active">
                <TabsList className="mb-4">
                    <TabsTrigger value="active">Active ({activeBids.length})</TabsTrigger>
                    <TabsTrigger value="awarded">Awarded ({awardedBids.length})</TabsTrigger>
                    <TabsTrigger value="archived">Archived ({archivedBids.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="active">
                    <BidsList bids={activeBids} onEdit={handleEditClick} onWithdraw={handleWithdrawClick} constructUrl={constructUrl} />
                </TabsContent>
                <TabsContent value="awarded">
                    <BidsList bids={awardedBids} onEdit={handleEditClick} onWithdraw={handleWithdrawClick} constructUrl={constructUrl} />
                </TabsContent>
                <TabsContent value="archived">
                    <BidsList bids={archivedBids} onEdit={handleEditClick} onWithdraw={handleWithdrawClick} constructUrl={constructUrl} />
                </TabsContent>
            </Tabs>

            <Dialog open={!!editingBid} onOpenChange={(open) => !open && setEditingBid(null)}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Edit Bid for: {editingBid?.job?.title}</DialogTitle>
                        <DialogDescription>
                            Update your bid amount, comments, or proposed technique.
                        </DialogDescription>
                    </DialogHeader>
                     <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 pt-4">
                        <div className="space-y-4">
                             <h3 className="font-semibold text-lg">Job Documents</h3>
                             <div className="space-y-2">
                                {editingBid?.job?.documents && editingBid.job.documents.length > 0 ? (
                                    editingBid.job.documents.map((doc, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-sm font-medium">{doc.name}</span>
                                            </div>
                                            <Button variant="ghost" size="sm" asChild>
                                                <a href={doc.url} download>Download</a>
                                            </Button>
                                        </div>
                                    ))
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
                                 {proposedTechnique !== editingBid?.job?.technique && (
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
                                <DialogFooter className="pt-4 flex-col sm:flex-row sm:space-x-2">
                                    <Button type="button" variant="ghost" onClick={() => setEditingBid(null)}>Cancel</Button>
                                    <Button type="submit">
                                        <Gavel className="mr-2"/>
                                        Save Changes
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!withdrawingBid} onOpenChange={(open) => !open && setWithdrawingBid(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to withdraw your bid?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. You will have to submit a new bid if you change your mind, provided the bidding period has not expired.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setWithdrawingBid(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmWithdraw} className="bg-destructive hover:bg-destructive/90">Withdraw Bid</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

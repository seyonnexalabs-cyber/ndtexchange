

'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Gavel, Calendar, DollarSign, Building, MoreVertical, Edit, Trash2, Info, FileText, Star, Check } from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { format, isToday } from 'date-fns';
import { GLOBAL_DATE_FORMAT, safeParseDate } from '@/lib/utils';
import { useSearchParams, useRouter } from 'next/navigation';
import { useFirebase, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, collectionGroup, query, where, doc, updateDoc, orderBy, getDocs } from 'firebase/firestore';
import type { Job, Bid, NDTTechnique, PlatformUser } from "@/lib/types";
import { Skeleton } from '@/components/ui/skeleton';

const bidSchema = z.object({
  amount: z.coerce.number().positive("Bid amount must be a positive number."),
  comments: z.string().optional(),
  quote: z.any().optional(), // For file upload
  proposedTechnique: z.string(),
  proposalJustification: z.string().optional(),
});


const statusConfig: { [key in Bid['status']]: { variant: 'success' | 'default' | 'secondary' | 'destructive' | 'outline', icon?: React.ReactNode, label: string } } = {
    Submitted: { variant: 'secondary', label: 'Submitted' },
    Shortlisted: { variant: 'default', icon: <Star className="h-3.5 w-3.5" />, label: 'Shortlisted' },
    Awarded: { variant: 'success', icon: <Check className="h-3.5 w-3.5" />, label: 'Awarded' },
    Rejected: { variant: 'destructive', label: 'Rejected' },
    Withdrawn: { variant: 'outline', label: 'Withdrawn' },
    'Not Selected': { variant: 'destructive', label: 'Not Selected' },
};


const BidsList = ({ bids, onEdit, onWithdraw, constructUrl }: { bids: Bid[], onEdit: (bid: Bid) => void, onWithdraw: (bid: Bid) => void, constructUrl: (path: string) => string }) => {
    const isMobile = useMobile();

    if (bids.length === 0) {
        return (
            <div className="text-center p-10 border rounded-lg">
                <Gavel className="mx-auto h-12 w-12 text-muted-foreground" />
                <h2 className="mt-4 text-xl font-headline">No Bids Found</h2>
                <p className="mt-2 text-muted-foreground">You have not placed any bids yet. Find jobs in the marketplace to get started.</p>
                 <Button asChild className="mt-4">
                   <Link href={constructUrl("/dashboard/find-jobs")}>Find Jobs</Link>
                </Button>
            </div>
        );
    }
    
    if (isMobile) {
        return (
            <div className="space-y-4">
                {bids.map(bid => {
                    return (
                    <Card key={bid.id} className="flex flex-col">
                        <CardHeader>
                             <div className="flex justify-between items-start gap-4">
                                <CardTitle className="text-lg font-semibold leading-tight">{bid.jobTitle}</CardTitle>
                                <Badge variant={statusConfig[bid.status].variant} className="gap-1 shrink-0">
                                    {statusConfig[bid.status].icon}
                                    {statusConfig[bid.status].label}
                                </Badge>
                            </div>
                            <CardDescription>
                                For <span className="font-semibold text-foreground">{bid.client}</span> &bull; Job ID: <span className="font-semibold text-foreground">{bid.jobId}</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 flex-grow pt-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center"><DollarSign className="w-4 h-4 mr-2"/>Your Bid</span>
                                <span className="font-medium">${bid.amount.toLocaleString()}</span>
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
                )})}
            </div>
        )
    }

    return (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Job</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Your Bid</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {bids.map(bid => {
                        const submittedDate = safeParseDate(bid.submittedDate);
                        return (
                        <TableRow key={bid.id}>
                            <TableCell>
                                <div className="font-medium">{bid.jobTitle}</div>
                                <div className="text-xs text-muted-foreground">{bid.client} &bull; {bid.location}</div>
                            </TableCell>
                            <TableCell>
                                <Badge variant={statusConfig[bid.status].variant} className="gap-1">
                                    {statusConfig[bid.status].icon}
                                    {statusConfig[bid.status].label}
                                </Badge>
                            </TableCell>
                            <TableCell>${bid.amount.toLocaleString()}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                  <span>{submittedDate ? format(submittedDate, GLOBAL_DATE_FORMAT) : 'N/A'}</span>
                                  {submittedDate && isToday(submittedDate) && <Badge>Today</Badge>}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                {bid.status === 'Submitted' || bid.status === 'Shortlisted' ? (
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
                    )})}
                </TableBody>
            </Table>
        </Card>
    );
};


export default function MyBidsPage() {
    const [editingBid, setEditingBid] = useState<Bid | null>(null);
    const [withdrawingBid, setWithdrawingBid] = useState<Bid | null>(null);
    const searchParams = useSearchParams();
    const router = useRouter();
    const role = searchParams.get('role');
    const { firestore, user } = useFirebase();

    const [myBids, setMyBids] = useState<Bid[]>([]);
    const [isLoadingBids, setIsLoadingBids] = useState(true);

    const { data: userProfile, isLoading: isLoadingProfile } = useDoc<PlatformUser>(
        useMemoFirebase(() => (firestore && user ? doc(firestore, 'users', user.uid) : null), [firestore, user])
    );
    
    useEffect(() => {
        if (role && role !== 'inspector') {
            router.replace(`/dashboard?${searchParams.toString()}`);
        }
    }, [role, router, searchParams]);

    useEffect(() => {
        if (!firestore || !user) {
            setIsLoadingBids(false);
            return;
        }

        const fetchBids = async () => {
            setIsLoadingBids(true);
            try {
                const q = query(collectionGroup(firestore, 'bids'), where('inspectorId', '==', user.uid));
                const querySnapshot = await getDocs(q);
                const bidsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bid));
                 setMyBids(bidsData);
            } catch (error) {
                console.error("Error fetching bids:", error);
                // The useCollection hook would handle the contextual error,
                // but since we are fetching manually, we log it here.
            } finally {
                setIsLoadingBids(false);
            }
        };

        fetchBids();
    }, [firestore, user]);
    
    const sortedBids = useMemo(() => {
        return [...myBids].sort((a, b) => {
            const dateA = safeParseDate(a.submittedDate);
            const dateB = safeParseDate(b.submittedDate);
            if (!dateA || !dateB) return 0;
            return dateB.getTime() - dateA.getTime();
        });
    }, [myBids]);

    const { data: ndtTechniques, isLoading: isLoadingTechniques } = useCollection<NDTTechnique>(
        useMemoFirebase(() => firestore ? collection(firestore, 'techniques') : null, [firestore])
    );

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

    const handleEditClick = (bid: Bid) => {
        setEditingBid(bid);
        form.reset({
            amount: bid.amount,
            comments: bid.comments || '',
            proposedTechnique: bid.proposedTechnique || undefined,
            proposalJustification: bid.proposalJustification || '',
        });
    };

    const handleWithdrawClick = (bid: Bid) => {
        setWithdrawingBid(bid);
    };

    const handleConfirmWithdraw = async () => {
        if (!withdrawingBid || !firestore) return;
        const bidRef = doc(firestore, 'jobs', withdrawingBid.jobId, 'bids', withdrawingBid.id);
        await updateDoc(bidRef, { status: 'Withdrawn' });
        setMyBids(prev => prev.map(b => b.id === withdrawingBid.id ? { ...b, status: 'Withdrawn' } : b));
        setWithdrawingBid(null);
    };

    async function onBidSubmit(values: z.infer<typeof bidSchema>) {
        if (!editingBid || !firestore) return;
        const bidRef = doc(firestore, 'jobs', editingBid.jobId, 'bids', editingBid.id);
        await updateDoc(bidRef, values);
        setMyBids(prev => prev.map(b => b.id === editingBid.id ? { ...b, ...values } : b));
        setEditingBid(null);
    }
    
    const stats = useMemo(() => {
        if (!myBids) return { activeBids: 0, shortlistedBids: 0, awardedBids: 0, revenueYTD: 0 };
        const activeBids = myBids.filter(b => b.status === 'Submitted').length;
        const shortlistedBids = myBids.filter(b => b.status === 'Shortlisted').length;
        const awardedBids = myBids.filter(b => b.status === 'Awarded').length;
        const revenueYTD = myBids.filter(b => b.status === 'Awarded').reduce((acc, b) => acc + b.amount, 0);
        return { activeBids, shortlistedBids, awardedBids, revenueYTD };
    }, [myBids]);

    const isLoading = isLoadingBids || isLoadingTechniques || isLoadingProfile;

    if (isLoading) {
        return (
            <div>
                <Skeleton className="h-8 w-1/4 mb-6" />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
                </div>
                <Skeleton className="h-64 w-full" />
            </div>
        )
    }
    
    if (role && role !== 'inspector') {
        return null;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <Gavel className="text-primary" />
                    My Bids
                </h1>
                <Button asChild>
                   <Link href={constructUrl("/dashboard/find-jobs")}>Find New Jobs</Link>
                </Button>
            </div>
            
            <div className="mb-6">
                <h2 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider mb-2">YOUR BID ACTIVITY DASHBOARD</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                     <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>ACTIVE BIDS</CardDescription>
                            <CardTitle className="text-4xl text-primary">{stats.activeBids}</CardTitle>
                        </CardHeader>
                    </Card>
                     <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>SHORTLISTED</CardDescription>
                            <CardTitle className="text-4xl text-primary">{stats.shortlistedBids}</CardTitle>
                        </CardHeader>
                    </Card>
                     <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>AWARDED</CardDescription>
                            <CardTitle className="text-4xl text-primary">{stats.awardedBids}</CardTitle>
                        </CardHeader>
                    </Card>
                     <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>REVENUE (YTD)</CardDescription>
                            <CardTitle className="text-4xl text-primary">${stats.revenueYTD.toLocaleString()}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>
            </div>

            <BidsList bids={sortedBids} onEdit={handleEditClick} onWithdraw={handleWithdrawClick} constructUrl={constructUrl} />

            <Dialog open={!!editingBid} onOpenChange={(open) => !open && setEditingBid(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Bid for: {editingBid?.jobTitle}</DialogTitle>
                        <DialogDescription>
                            Update your bid amount, comments, or proposed technique.
                        </DialogDescription>
                    </DialogHeader>
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
                            <DialogFooter className="pt-4 flex-col sm:flex-row sm:space-x-2">
                                <Button type="button" variant="ghost" onClick={() => setEditingBid(null)}>Cancel</Button>
                                <Button type="submit">
                                    <Gavel className="mr-2"/>
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
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

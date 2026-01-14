
'use client';

import { useState, useMemo } from 'react';
import { jobs, bids } from '@/lib/placeholder-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gavel, Calendar, DollarSign, Building, Briefcase } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Bid, Job } from '@/lib/placeholder-data';

const statusStyles = {
    Submitted: 'secondary',
    Awarded: 'default',
    Rejected: 'destructive',
    Withdrawn: 'outline',
};

type MappedBid = Bid & { job: Job | undefined };

const BidsList = ({ bids }: { bids: MappedBid[] }) => {
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
                                <Badge variant={statusStyles[bid.status] as any}>{bid.status}</Badge>
                            </div>
                             <CardDescription className="flex items-center pt-1"><Building className="w-4 h-4 mr-2"/> {bid.job?.client}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center"><DollarSign className="w-4 h-4 mr-2"/>Bid Amount</span>
                                <span className="font-medium">${bid.amount.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center"><Calendar className="w-4 h-4 mr-2"/>Date Submitted</span>
                                <span className="font-medium">{bid.submittedDate}</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" size="sm" className="w-full">View Job</Button>
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
                        <TableHead>Job Title</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Bid Amount</TableHead>
                        <TableHead>Date Submitted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {bids.map(bid => (
                        <TableRow key={bid.id}>
                            <TableCell className="font-medium">{bid.job?.title}</TableCell>
                            <TableCell>{bid.job?.client}</TableCell>
                            <TableCell>${bid.amount.toLocaleString()}</TableCell>
                            <TableCell>{bid.submittedDate}</TableCell>
                            <TableCell>
                                <Badge variant={statusStyles[bid.status] as any}>{bid.status}</Badge>
                            </TableCell>
                             <TableCell>
                                <Button variant="outline" size="sm">
                                    {bid.status === 'Awarded' ? 'View Job' : 'View Bid'}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
};


export default function MyBidsPage() {
    // Assuming 'inspector-provider' is the ID for the current user's company
    const myBids = useMemo(() => {
        return bids
            .filter(bid => bid.providerId === 'inspector-provider')
            .map(bid => ({
                ...bid,
                job: jobs.find(job => job.id === bid.jobId),
            }));
    }, []);

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
                   <a href="/dashboard/find-jobs?role=inspector">Find New Jobs</a>
                </Button>
            </div>

            <Tabs defaultValue="active">
                <TabsList className="mb-4">
                    <TabsTrigger value="active">Active ({activeBids.length})</TabsTrigger>
                    <TabsTrigger value="awarded">Awarded ({awardedBids.length})</TabsTrigger>
                    <TabsTrigger value="archived">Archived ({archivedBids.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="active">
                    <BidsList bids={activeBids} />
                </TabsContent>
                <TabsContent value="awarded">
                    <BidsList bids={awardedBids} />
                </TabsContent>
                <TabsContent value="archived">
                    <BidsList bids={archivedBids} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

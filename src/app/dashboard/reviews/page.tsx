

'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { reviews, jobs, clientData } from "@/lib/placeholder-data";
import { serviceProviders } from "@/lib/service-providers-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Check, X, MoreVertical } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { Review } from '@/lib/placeholder-data';
import { format } from 'date-fns';
import { GLOBAL_DATE_FORMAT } from '@/lib/utils';

const StarRating = ({ rating }: { rating: number }) => {
    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={`w-4 h-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-300 text-gray-300'}`}
                />
            ))}
        </div>
    );
};

const statusStyles: { [key in Review['status']]: 'success' | 'default' | 'secondary' | 'destructive' | 'outline' } = {
    Pending: 'secondary',
    Approved: 'success',
    Rejected: 'destructive',
};

const ReviewsList = ({ reviews, onApprove, onReject }: { reviews: any[], onApprove: (id: string) => void, onReject: (id: string) => void }) => {
    const isMobile = useIsMobile();

    if (reviews.length === 0) {
        return <div className="text-center p-10 text-muted-foreground">No reviews in this category.</div>;
    }
    
    if (isMobile) {
        return (
            <div className="space-y-4">
                {reviews.map(review => (
                    <Card key={review.id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-base">{review.job?.title}</CardTitle>
                                    <p className="text-xs font-mono font-semibold text-muted-foreground">{review.job?.id}</p>
                                </div>
                                <Badge variant={statusStyles[review.status]}>{review.status}</Badge>
                            </div>
                            <CardDescription>
                                For {review.provider?.name} by {review.client?.name}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <StarRating rating={review.rating} />
                            <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
                            <p className="text-xs text-muted-foreground mt-2">{format(new Date(review.date), GLOBAL_DATE_FORMAT)}</p>
                        </CardContent>
                        {review.status === 'Pending' && (
                            <CardFooter className="flex justify-end gap-2">
                                <Button size="sm" variant="outline" onClick={() => onReject(review.id)}><X className="mr-2 h-4 w-4" /> Reject</Button>
                                <Button size="sm" onClick={() => onApprove(review.id)}><Check className="mr-2 h-4 w-4" /> Approve</Button>
                            </CardFooter>
                        )}
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
                        <TableHead>Client</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Job</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Comment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {reviews.map(review => (
                        <TableRow key={review.id}>
                            <TableCell className="font-mono text-xs font-medium">{review.job?.id}</TableCell>
                            <TableCell>{review.client?.name}</TableCell>
                            <TableCell>{review.provider?.name}</TableCell>
                            <TableCell><Link className="underline" href={`/dashboard/my-jobs/${review.jobId}?role=admin`}>{review.job?.title}</Link></TableCell>
                            <TableCell><StarRating rating={review.rating} /></TableCell>
                            <TableCell className="max-w-xs truncate">{review.comment}</TableCell>
                            <TableCell><Badge variant={statusStyles[review.status]}>{review.status}</Badge></TableCell>
                            <TableCell className="text-right">
                                {review.status === 'Pending' && (
                                    <div className="flex gap-2 justify-end">
                                        <Button size="sm" variant="outline" onClick={() => onReject(review.id)}>Reject</Button>
                                        <Button size="sm" onClick={() => onApprove(review.id)}>Approve</Button>
                                    </div>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    )
};


export default function ReviewsPage() {
    const [reviewList, setReviewList] = useState(reviews);

    const handleApprove = (id: string) => {
        setReviewList(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
    };

    const handleReject = (id: string) => {
        setReviewList(prev => prev.map(r => r.id === id ? { ...r, status: 'Rejected' } : r));
    };

    const mappedReviews = useMemo(() => {
        return reviewList.map(review => ({
            ...review,
            job: jobs.find(j => j.id === review.jobId),
            provider: serviceProviders.find(p => p.id === review.providerId),
            client: clientData.find(c => c.id === review.clientId)
        }));
    }, [reviewList]);

    const pendingReviews = mappedReviews.filter(r => r.status === 'Pending');
    const approvedReviews = mappedReviews.filter(r => r.status === 'Approved');
    const rejectedReviews = mappedReviews.filter(r => r.status === 'Rejected');

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                        <Star/>
                        Reviews & Ratings
                    </h1>
                </div>
            </div>

            <Tabs defaultValue="pending">
                <TabsList className="mb-4">
                    <TabsTrigger value="pending">Pending ({pendingReviews.length})</TabsTrigger>
                    <TabsTrigger value="approved">Approved ({approvedReviews.length})</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected ({rejectedReviews.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="pending">
                    <ReviewsList reviews={pendingReviews} onApprove={handleApprove} onReject={handleReject} />
                </TabsContent>
                <TabsContent value="approved">
                    <ReviewsList reviews={approvedReviews} onApprove={handleApprove} onReject={handleReject} />
                </TabsContent>
                 <TabsContent value="rejected">
                    <ReviewsList reviews={rejectedReviews} onApprove={handleApprove} onReject={handleReject} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

    

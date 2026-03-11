
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Check, X } from "lucide-react";
import { format } from 'date-fns';
import { GLOBAL_DATE_FORMAT, safeParseDate } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFirebase, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, query, orderBy, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import type { Review, Job, Client, NDTServiceProvider } from '@/lib/types';


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

const ClientFormattedDate = ({ date }: { date: Date | null }) => {
    const [formatted, setFormatted] = useState<string | null>(null);
    useEffect(() => {
        if (date) {
            setFormatted(format(date, GLOBAL_DATE_FORMAT));
        }
    }, [date]);
    if (!formatted) return null;
    return <span className="text-xs text-muted-foreground mt-2">{formatted}</span>;
};

const statusStyles: { [key in Review['status']]: 'success' | 'default' | 'secondary' | 'destructive' | 'outline' } = {
    Pending: 'secondary',
    Approved: 'success',
    Rejected: 'destructive',
};

const ReviewsList = ({ reviews, onApprove, onReject }: { reviews: any[], onApprove: (id: string) => void, onReject: (id: string) => void }) => {

    if (reviews.length === 0) {
        return <div className="text-center p-10 text-muted-foreground">No reviews in this category.</div>;
    }
    
    return (
        <div className="grid md:grid-cols-2 gap-6">
            {reviews.map(review => {
                const reviewDate = safeParseDate(review.date);
                return (
                <Card key={review.id}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-base">{review.job?.title || review.productName}</CardTitle>
                                <p className="text-xs font-extrabold text-muted-foreground">{review.job?.id || review.productId}</p>
                            </div>
                            <Badge variant={statusStyles[review.status as keyof typeof statusStyles]}>{review.status}</Badge>
                        </div>
                        <CardDescription>
                            For {review.provider?.name || review.productName} by {review.client?.name || review.userName}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <StarRating rating={review.rating} />
                        <p className="text-sm text-muted-foreground mt-2 bg-muted/50 p-3 rounded-md border">{review.comment}</p>
                        <ClientFormattedDate date={reviewDate} />
                    </CardContent>
                    {review.status === 'Pending' && (
                        <CardFooter className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => onReject(review.id)}><X className="mr-2 h-4 w-4" /> Reject</Button>
                            <Button size="sm" onClick={() => onApprove(review.id)}><Check className="mr-2 h-4 w-4" /> Approve</Button>
                        </CardFooter>
                    )}
                </Card>
            )})}
        </div>
    )
};


export default function ReviewsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role');
    const { firestore, user } = useFirebase();

    const isReady = firestore && user && role === 'admin';

    useEffect(() => {
        if (role && role !== 'admin') {
            router.replace(`/dashboard?${searchParams.toString()}`);
        }
    }, [role, router, searchParams]);

    const reviewsQuery = useMemoFirebase(() => {
        if (!isReady) return null;
        return query(collection(firestore, 'reviews'), orderBy('date', 'desc'));
    }, [isReady, firestore]);
    const { data: reviewList } = useCollection<Review>(reviewsQuery);
    
    const { data: allJobs } = useCollection<Job>(useMemoFirebase(() => isReady ? collection(firestore, 'jobs') : null, [isReady, firestore]));
    const { data: allCompanies } = useCollection<any>(useMemoFirebase(() => isReady ? collection(firestore, 'companies') : null, [isReady, firestore]));

    const handleApprove = async (id: string) => {
        if (!firestore) return;
        const reviewRef = doc(firestore, 'reviews', id);
        try {
            await setDoc(reviewRef, { status: 'Approved' }, { merge: true });
            toast.success('Review Approved');
        } catch (error) {
            console.error("Error approving review:", error);
            toast.error('Error', { description: 'Could not approve review.' });
        }
    };

    const handleReject = async (id: string) => {
        if (!firestore) return;
        const reviewRef = doc(firestore, 'reviews', id);
        try {
            await setDoc(reviewRef, { status: 'Rejected' }, { merge: true });
            toast.success('Review Rejected');
        } catch (error) {
            console.error("Error rejecting review:", error);
            toast.error('Error', { description: 'Could not reject review.' });
        }
    };

    const mappedReviews = useMemo(() => {
        if (!reviewList || !allJobs || !allCompanies) return [];
        return reviewList.map(review => ({
            ...review,
            job: allJobs.find(j => j.id === review.jobId),
            provider: allCompanies.find(p => p.id === review.providerId),
            client: allCompanies.find(c => c.id === review.clientId)
        }));
    }, [reviewList, allJobs, allCompanies]);

    const pendingReviews = mappedReviews.filter(r => r.status === 'Pending');
    const approvedReviews = mappedReviews.filter(r => r.status === 'Approved');
    const rejectedReviews = mappedReviews.filter(r => r.status === 'Rejected');

    if (role !== 'admin') {
        return null;
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                        <Star className="text-primary" />
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

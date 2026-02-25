
'use client';
import * as React from 'react';
import { useMemo, useState } from "react";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Star, ExternalLink, Wrench, Send, Award } from "lucide-react";
import { useFirebase, useDoc, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { doc, collection, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import type { Product, Manufacturer, NDTTechnique, Review, PlatformUser, ReviewReply } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { GLOBAL_DATE_FORMAT, GLOBAL_DATETIME_FORMAT } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const StarRating = ({ rating, reviewCount, size = "md" }: { rating: number, reviewCount?: number, size?: 'sm' | 'md' }) => {
    const starSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center">
                {reviewCount !== undefined && <span className="text-lg font-bold mr-1">{rating.toFixed(1)}</span>}
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`${starSize} ${i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-300 text-gray-300'}`}
                    />
                ))}
            </div>
            {reviewCount !== undefined && <span className="text-sm text-muted-foreground">({reviewCount} reviews)</span>}
        </div>
    );
};

const NewReviewForm = ({ productId, productName, user, onSubmit }: { productId: string, productName: string, user: PlatformUser | null, onSubmit: (data: { rating: number, comment: string }) => void }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const { toast } = useToast();

    const handleSubmit = () => {
        if (rating === 0) {
            toast({ variant: 'destructive', title: "Rating required", description: "Please select a star rating." });
            return;
        }
        onSubmit({ rating, comment });
        setRating(0);
        setComment("");
    };

    if (!user) {
        return (
            <Card className="bg-muted/50">
                <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">You must be logged in to leave a review.</p>
                    <Button asChild className="mt-4">
                        <Link href="/login">Log In or Sign Up</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Write a review for {productName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <p className="font-medium mb-2">Your Rating</p>
                    <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, index) => {
                            const ratingValue = index + 1;
                            return (
                                <button
                                    key={ratingValue}
                                    type="button"
                                    onClick={() => setRating(ratingValue)}
                                    onMouseEnter={() => setHoverRating(ratingValue)}
                                    onMouseLeave={() => setHoverRating(0)}
                                >
                                    <Star className={`w-6 h-6 transition-colors ${ratingValue <= (hoverRating || rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-300 text-gray-300'}`} />
                                </button>
                            )
                        })}
                    </div>
                </div>
                 <div>
                    <p className="font-medium mb-2">Your Review</p>
                    <Textarea 
                        placeholder="Share your experience with this product..."
                        className="min-h-[120px]"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSubmit}><Send className="mr-2 h-4 w-4"/> Submit Review</Button>
            </CardFooter>
        </Card>
    );
};


const createReferralUrl = (url: string) => {
    try {
        const referralUrl = new URL(url);
        referralUrl.searchParams.set('utm_source', 'ndt_exchange');
        referralUrl.searchParams.set('utm_medium', 'referral');
        referralUrl.searchParams.set('utm_campaign', 'product_directory');
        return referralUrl.toString();
    } catch (error) {
        console.error("Invalid URL:", url);
        return url;
    }
};

export default function PublicProductProfilePage() {
    const params = useParams();
    const { id } = params;
    const { firestore, auth } = useFirebase();
    const { user: authUser } = useUser();
    const { toast } = useToast();

    const [api, setApi] = React.useState<CarouselApi>()
    const [current, setCurrent] = React.useState(0)
    const [count, setCount] = React.useState(0)

    const productRef = useMemoFirebase(() => (firestore && id ? doc(firestore, 'products', id as string) : null), [firestore, id]);
    const { data: product, isLoading: isLoadingProduct } = useDoc<Product>(productRef);

    const manufacturerRef = useMemoFirebase(() => (firestore && product?.manufacturerId ? doc(firestore, 'manufacturers', product.manufacturerId) : null), [firestore, product]);
    const { data: manufacturer, isLoading: isLoadingManufacturer } = useDoc<Manufacturer>(manufacturerRef);
    
    const { data: ndtTechniques, isLoading: isLoadingTechniques } = useCollection<NDTTechnique>(useMemoFirebase(() => firestore ? collection(firestore, 'techniques') : null, [firestore]));
    
    const reviewsQuery = useMemoFirebase(() => (firestore && id ? query(collection(firestore, 'reviews'), where('productId', '==', id), where('status', '==', 'Approved')) : null), [firestore, id]);
    const { data: reviewsData, isLoading: isLoadingReviews } = useCollection<Review>(reviewsQuery);
    
    const { data: allUsers, isLoading: isLoadingUsers } = useCollection<PlatformUser>(useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]));

    const { data: currentUserProfile } = useDoc<PlatformUser>(useMemoFirebase(() => (firestore && authUser ? doc(firestore, 'users', authUser.uid) : null), [firestore, authUser]));


    React.useEffect(() => {
        if (!api) return;
        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap() + 1);
        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1)
        });
    }, [api]);
    
    const productReviews = useMemo(() => {
        if (!reviewsData || !allUsers) return [];
        return reviewsData.map(review => {
            const user = allUsers.find(u => u.id === review.clientId);
            return {
                ...review,
                userName: user ? user.name : 'Anonymous User',
                userCompany: user ? user.company : 'N/A',
            };
        });
    }, [reviewsData, allUsers]);

    const { avgRating, reviewCount } = useMemo(() => {
        if (!productReviews || productReviews.length === 0) return { avgRating: 0, reviewCount: 0 };
        const totalRating = productReviews.reduce((acc, r) => acc + r.rating, 0);
        return {
            avgRating: totalRating / productReviews.length,
            reviewCount: productReviews.length
        };
    }, [productReviews]);

    const handleReviewSubmit = async (data: { rating: number, comment: string }) => {
        if (!firestore || !authUser || !currentUserProfile || !product) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to submit a review.' });
            return;
        }

        const newReview = {
            productId: product.id,
            productName: product.name,
            clientId: authUser.uid,
            rating: data.rating,
            comment: data.comment,
            date: serverTimestamp(),
            status: 'Pending',
        };

        try {
            await addDoc(collection(firestore, 'reviews'), newReview);
            toast({
                title: 'Review Submitted!',
                description: 'Thank you for your feedback. Your review is pending approval.'
            });
        } catch (error) {
            console.error('Error submitting review:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to submit your review.' });
        }
    };


    const isLoading = isLoadingProduct || isLoadingManufacturer || isLoadingTechniques || isLoadingReviews || isLoadingUsers;

    if (!id) {
        notFound();
    }

    if (isLoading) {
        return (
             <div className="bg-background">
                <PublicHeader />
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="space-y-6">
                        <Skeleton className="h-8 w-1/4 mb-6" />
                        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                            <Skeleton className="md:col-span-1 h-80 w-full" />
                            <div className="md:col-span-2 space-y-4">
                                <Skeleton className="h-10 w-3/4" />
                                <Skeleton className="h-6 w-1/2" />
                                <Skeleton className="h-12 w-48" />
                                <Skeleton className="h-24 w-full" />
                            </div>
                        </div>
                    </div>
                </div>
                <PublicFooter />
            </div>
        );
    }
    
    if (!product) {
        notFound();
    }

    return (
        <div className="bg-background">
            <PublicHeader />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                    <Button asChild variant="outline" size="sm" className="mb-4 sm:mb-0">
                        <Link href="/ecosystem?tab=products">
                            <ChevronLeft className="mr-2 h-4 w-4 text-primary" />
                            Back to Product Catalog
                        </Link>
                    </Button>
                </div>

                <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                    <div className="md:col-span-1">
                        <Card className="overflow-hidden">
                            <Carousel setApi={setApi} className="w-full">
                                <CarouselContent>
                                    {product.imageUrls && product.imageUrls.length > 0 ? (
                                        product.imageUrls.map((url, index) => (
                                            <CarouselItem key={index}>
                                                <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                                                    <Image src={url} alt={`${product.name} image ${index + 1}`} fill className="object-contain p-4" />
                                                </div>
                                            </CarouselItem>
                                        ))
                                    ) : (
                                        <CarouselItem>
                                            <div className="relative aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center h-full">
                                                <Wrench className="w-24 h-24 text-muted-foreground/30"/>
                                            </div>
                                        </CarouselItem>
                                    )}
                                </CarouselContent>
                                {product.imageUrls && product.imageUrls.length > 1 && (
                                    <>
                                        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
                                        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
                                    </>
                                )}
                            </Carousel>
                             {count > 1 && (
                                <div className="py-2 text-center text-sm text-muted-foreground">
                                    Image {current} of {count}
                                </div>
                            )}
                        </Card>
                    </div>

                     <div className="md:col-span-2">
                        {product.isAwardWinning && <Badge className="mb-2"><Award className="mr-2 h-4 w-4"/>Award-Winning Product</Badge>}
                        <h1 className="text-3xl lg:text-4xl font-headline font-bold">{product.name}</h1>
                        <p className="mt-2 text-lg text-primary font-semibold">by {manufacturer?.name || product.manufacturerName}</p>
                        
                        <div className="flex items-center gap-4 mt-4">
                             <StarRating rating={avgRating} reviewCount={reviewCount} />
                        </div>

                         <div className="mt-6 flex flex-wrap gap-2">
                            {product.techniques.map(tech => (
                                <Badge key={tech} variant="secondary">{ndtTechniques?.find(t => t.acronym === tech)?.title || tech}</Badge>
                            ))}
                        </div>

                        {manufacturer?.contactEmail && (
                             <Button asChild size="lg" className="mt-8">
                                <a href={`mailto:${manufacturer.contactEmail}?subject=Inquiry about ${product.name}`}>
                                    Contact Manufacturer
                                </a>
                            </Button>
                        )}
                        
                        <div className="mt-8 border-t pt-6">
                            <h2 className="text-xl font-semibold">Description</h2>
                            <p className="mt-4 text-muted-foreground whitespace-pre-wrap">
                                {product.description || 'No description available for this product.'}
                            </p>
                        </div>

                        {product.awards && product.awards.length > 0 && (
                            <div className="mt-8 border-t pt-6">
                                <h2 className="text-xl font-semibold">Awards & Recognitions</h2>
                                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {product.awards.map(award => (
                                        <div key={award.name} className="text-center">
                                            <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                                                <Image src={award.imageUrl || ''} alt={award.name} fill className="object-contain p-2"/>
                                            </div>
                                            <p className="text-sm font-semibold mt-2">{award.name}</p>
                                            <p className="text-xs text-muted-foreground">{award.year}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                 <div className="mt-12 border-t pt-8">
                    <h2 className="text-2xl font-headline font-bold mb-6">Customer Reviews</h2>
                    <div className="grid md:grid-cols-2 gap-8 items-start">
                        <div className="space-y-6">
                            <h3 className="font-semibold text-lg">What others are saying</h3>
                            {productReviews.length > 0 ? (
                                productReviews.map(review => (
                                    <Card key={review.id}>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarFallback>{review.userName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold">{review.userName}</p>
                                                        <p className="text-xs text-muted-foreground">{review.userCompany}</p>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{review.date?.toDate ? format(review.date.toDate(), GLOBAL_DATE_FORMAT) : 'N/A'}</p>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <StarRating rating={review.rating} size="sm" />
                                            <p className="mt-2 text-sm text-muted-foreground italic">"{review.comment}"</p>
                                            {review.reply && (
                                                <div className="mt-4 ml-8 p-4 bg-muted/50 rounded-lg border">
                                                    <p className="text-sm font-semibold flex items-center gap-2">
                                                        <Avatar className="h-6 w-6"><AvatarFallback className="text-xs">{review.reply.authorName.split(' ').map(n=>n[0]).join('')}</AvatarFallback></Avatar>
                                                        Reply from {review.reply.authorName}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground pl-8">{review.reply.timestamp?.toDate ? format(review.reply.timestamp.toDate(), GLOBAL_DATETIME_FORMAT) : ''}</p>
                                                    <p className="mt-2 text-sm text-muted-foreground italic pl-8">"{review.reply.text}"</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <p className="text-muted-foreground">No reviews for this product yet. Be the first!</p>
                            )}
                        </div>
                        <div className="sticky top-24">
                            <NewReviewForm
                                productId={product.id}
                                productName={product.name}
                                user={currentUserProfile}
                                onSubmit={handleReviewSubmit}
                            />
                        </div>
                    </div>
                </div>

            </main>
            <PublicFooter />
        </div>
    );
}

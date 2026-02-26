
'use client';
import * as React from 'react';
import { useMemo, useState } from "react";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Star, ExternalLink, Wrench, Send, Award, Maximize, ChevronRight } from "lucide-react";
import { useFirebase, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import type { Product, Manufacturer, NDTTechnique, Review, ReviewReply } from '@/lib/types';
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
import { GLOBAL_DATE_FORMAT, GLOBAL_DATETIME_FORMAT, cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const reviewSchema = z.object({
  userName: z.string().min(2, "Please enter your name."),
  userEmail: z.string().email("Please enter a valid email address."),
  rating: z.number().min(1, "Please select a rating."),
  comment: z.string().optional(),
});

const NewReviewForm = ({ onSubmit }: { onSubmit: (data: z.infer<typeof reviewSchema>) => void }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);

    const form = useForm<z.infer<typeof reviewSchema>>({
        resolver: zodResolver(reviewSchema),
        defaultValues: {
            userName: '',
            userEmail: '',
            rating: 0,
            comment: '',
        },
    });

    React.useEffect(() => {
        form.setValue('rating', rating);
    }, [rating, form]);

    const handleSubmit = (values: z.infer<typeof reviewSchema>) => {
        if (values.rating === 0) {
            form.setError('rating', { type: 'manual', message: 'Please select a star rating.' });
            return;
        }
        onSubmit(values);
        form.reset();
        setRating(0);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Write a review</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} id="review-form" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="userName" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl><Input placeholder="Your Name" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="userEmail" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl><Input type="email" placeholder="your@email.com" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        
                        <FormField control={form.control} name="rating" render={() => (
                            <FormItem>
                                <FormLabel>Your Rating</FormLabel>
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, index) => {
                                        const ratingValue = index + 1;
                                        return (
                                            <button
                                                key={ratingValue}
                                                type="button"
                                                onClick={() => {
                                                    setRating(ratingValue);
                                                    form.setValue('rating', ratingValue);
                                                    form.clearErrors('rating');
                                                }}
                                                onMouseEnter={() => setHoverRating(ratingValue)}
                                                onMouseLeave={() => setHoverRating(0)}
                                            >
                                                <Star className={`w-6 h-6 transition-colors ${ratingValue <= (hoverRating || rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-300 text-gray-300'}`} />
                                            </button>
                                        );
                                    })}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="comment" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Your Review</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Share your experience with this product..." className="min-h-[120px]" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </form>
                </Form>
            </CardContent>
            <CardFooter>
                <Button type="submit" form="review-form"><Send className="mr-2 h-4 w-4"/> Submit Review</Button>
            </CardFooter>
        </Card>
    );
};


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
    const { firestore } = useFirebase();
    const { toast } = useToast();

    const [api, setApi] = React.useState<CarouselApi>();
    const [current, setCurrent] = React.useState(0);
    const [isImageViewerOpen, setIsImageViewerOpen] = React.useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = React.useState<string | null>(null);
    const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);

    const productRef = useMemoFirebase(() => (firestore && id ? doc(firestore, 'products', id as string) : null), [firestore, id]);
    const { data: product, isLoading: isLoadingProduct } = useDoc<Product>(productRef);

    const manufacturerRef = useMemoFirebase(() => (firestore && product?.manufacturerId ? doc(firestore, 'manufacturers', product.manufacturerId) : null), [firestore, product]);
    const { data: manufacturer, isLoading: isLoadingManufacturer } = useDoc<Manufacturer>(manufacturerRef);
    
    const { data: ndtTechniques, isLoading: isLoadingTechniques } = useCollection<NDTTechnique>(useMemoFirebase(() => firestore ? collection(firestore, 'techniques') : null, [firestore]));
    
    const reviewsQuery = useMemoFirebase(() => (firestore && id ? query(collection(firestore, 'reviews'), where('productId', '==', id), where('status', '==', 'Approved')) : null), [firestore, id]);
    const { data: reviewsData, isLoading: isLoadingReviews } = useCollection<Review>(reviewsQuery);
    
    React.useEffect(() => {
        if (!api) return;

        setCurrent(api.selectedScrollSnap());
        api.on("select", () => {
            setCurrent(api.selectedScrollSnap());
        });
    }, [api]);
    
    const productReviews = useMemo(() => {
        if (!reviewsData) return [];
        return reviewsData;
    }, [reviewsData]);


    const { avgRating, reviewCount } = useMemo(() => {
        if (!productReviews || productReviews.length === 0) return { avgRating: 0, reviewCount: 0 };
        const totalRating = productReviews.reduce((acc, r) => acc + r.rating, 0);
        return {
            avgRating: totalRating / productReviews.length,
            reviewCount: productReviews.length
        };
    }, [productReviews]);
    
    const handleImageClick = (url: string, index: number) => {
        setSelectedImageUrl(url);
        setSelectedImageIndex(index);
        setIsImageViewerOpen(true);
    };

    const handlePrevImage = () => {
        if (!product?.imageUrls) return;
        const newIndex = Math.max(0, selectedImageIndex - 1);
        setSelectedImageIndex(newIndex);
        setSelectedImageUrl(product.imageUrls[newIndex]);
    };

    const handleNextImage = () => {
        if (!product?.imageUrls) return;
        const newIndex = Math.min(product.imageUrls.length - 1, selectedImageIndex + 1);
        setSelectedImageIndex(newIndex);
        setSelectedImageUrl(product.imageUrls[newIndex]);
    };


    const handleReviewSubmit = async (data: z.infer<typeof reviewSchema>) => {
        if (!firestore || !product) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not submit review. Please try again.' });
            return;
        }

        const reviewsRef = collection(firestore, 'reviews');
        const q = query(reviewsRef, where('productId', '==', product.id), where('userEmail', '==', data.userEmail));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            toast({
                variant: "destructive",
                title: "Already Reviewed",
                description: "This email address has already been used to review this product.",
            });
            return;
        }

        const newReview = {
            productId: product.id,
            productName: product.name,
            userEmail: data.userEmail,
            userName: data.userName,
            rating: data.rating,
            comment: data.comment || '',
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


    const isLoading = isLoadingProduct || isLoadingManufacturer || isLoadingTechniques || isLoadingReviews;

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
    
    const canGoPrev = selectedImageIndex > 0;
    const canGoNext = product && product.imageUrls && selectedImageIndex < product.imageUrls.length - 1;

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
                    <div className="md:col-span-1 space-y-4">
                        <Card className="overflow-hidden">
                            <Carousel setApi={setApi} className="w-full">
                                <CarouselContent>
                                    {product.imageUrls && product.imageUrls.length > 0 ? (
                                        product.imageUrls.map((url, index) => (
                                            <CarouselItem key={index}>
                                                <button 
                                                    type="button"
                                                    className="relative aspect-square bg-muted rounded-lg overflow-hidden block w-full group"
                                                    onClick={() => handleImageClick(url, index)}
                                                >
                                                    <Image src={url} alt={`${product.name} image ${index + 1}`} fill className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"/>
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                                        <Maximize className="w-10 h-10 text-white" />
                                                    </div>
                                                </button>
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
                        </Card>
                        {product.imageUrls && product.imageUrls.length > 1 && (
                            <div className="grid grid-cols-5 gap-2">
                                {product.imageUrls.map((url, index) => (
                                    <button
                                        key={index}
                                        onClick={() => api?.scrollTo(index)}
                                        className={cn(
                                            "relative aspect-square rounded-md overflow-hidden border-2 transition-all",
                                            current === index ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                                        )}
                                        aria-label={`Go to image ${index + 1}`}
                                    >
                                        <Image src={url} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
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
                            <div className="mt-8">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Awards & Recognitions</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                            {product.awards.map(award => (
                                                <div key={award.name} className="text-center">
                                                    <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                                                        {award.imageUrl ? (
                                                            <Image src={award.imageUrl} alt={award.name} fill className="object-contain p-2"/>
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center bg-secondary">
                                                                <Award className="h-8 w-8 text-muted-foreground" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-sm font-semibold mt-2">{award.name}</p>
                                                    <p className="text-xs text-muted-foreground">{award.year}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
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
                                                        <StarRating rating={review.rating} size="sm" />
                                                    </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{review.date?.toDate ? format(review.date.toDate(), GLOBAL_DATE_FORMAT) : 'N/A'}</p>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
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
                           <NewReviewForm onSubmit={handleReviewSubmit} />
                        </div>
                    </div>
                </div>
                 <Dialog open={isImageViewerOpen} onOpenChange={setIsImageViewerOpen}>
                    <DialogContent className="max-w-7xl w-full h-[95vh] bg-transparent border-none shadow-none p-0 flex items-center justify-center">
                        {selectedImageUrl && (
                             <div className="relative w-full h-full flex items-center justify-center">
                                <Image
                                    src={selectedImageUrl}
                                    alt="Full screen product image"
                                    fill
                                    className="object-contain"
                                />
                                {product.imageUrls && product.imageUrls.length > 1 && (
                                    <>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/20 hover:bg-black/40 text-white hover:text-white disabled:opacity-20 disabled:hover:bg-black/20"
                                            onClick={handlePrevImage}
                                            disabled={!canGoPrev}
                                        >
                                            <ChevronLeft className="h-8 w-8" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/20 hover:bg-black/40 text-white hover:text-white disabled:opacity-20 disabled:hover:bg-black/20"
                                            onClick={handleNextImage}
                                            disabled={!canGoNext}
                                        >
                                            <ChevronRight className="h-8 w-8" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </main>
            <PublicFooter />
        </div>
    );
}

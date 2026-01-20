'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { clientAssets, NDTTechniques } from "@/lib/placeholder-data";
import { cn, GLOBAL_DATE_FORMAT, ACCEPTED_FILE_TYPES } from '@/lib/utils';
import { Calendar as CalendarIcon, PlusCircle, ChevronLeft } from "lucide-react";
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';


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
  scheduledStartDate: z.date().optional(),
  scheduledEndDate: z.date().optional(),
}).refine(data => {
    if (data.scheduledStartDate && data.scheduledEndDate) {
        return data.scheduledEndDate >= data.scheduledStartDate;
    }
    return true;
}, {
    message: "End date cannot be before start date.",
    path: ["scheduledEndDate"],
});

export default function PostJobPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

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
        console.log('New Job Submitted:', values);
        toast({
            title: 'Job Posted Successfully',
            description: `${values.title} is now live on the marketplace.`,
        });
        router.push(constructUrl('/dashboard/my-jobs'));
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                     <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                        <PlusCircle />
                        Post a New Job
                    </h1>
                    <p className="text-muted-foreground mt-1">Fill out the details to create a new job listing on the marketplace.</p>
                </div>
                <Button asChild variant="outline">
                    <Link href={constructUrl('/dashboard/my-jobs')}>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to My Jobs
                    </Link>
                </Button>
            </div>
            
            <Card>
                <CardContent className="pt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
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
                                                    {NDTTechniques.map(tech => (
                                                        <SelectItem key={tech.id} value={tech.id}>{tech.name} ({tech.id})</SelectItem>
                                                    ))}
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
                                                    format(field.value, GLOBAL_DATE_FORMAT)
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                            <CalendarComponent
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                                initialFocus
                                            />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="scheduledStartDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                        <FormLabel>Target Start Date (Optional)</FormLabel>
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
                                                    format(field.value, GLOBAL_DATE_FORMAT)
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                            <CalendarComponent
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                                initialFocus
                                            />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="scheduledEndDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                        <FormLabel>Target End Date (Optional)</FormLabel>
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
                                                    format(field.value, GLOBAL_DATE_FORMAT)
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                            <CalendarComponent
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) => date < (form.getValues('scheduledStartDate') || new Date(new Date().setHours(0, 0, 0, 0)))}
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
                                    <ScrollArea className="h-60 w-full rounded-md border p-4">
                                        {clientAssets.map((asset, index) => (
                                        <FormField
                                            key={asset.id}
                                            control={form.control}
                                            name="assets"
                                            render={({ field }) => {
                                            const image = PlaceHolderImages.find(p => p.id === `asset${index + 1}`);
                                            return (
                                                <FormItem
                                                key={asset.id}
                                                className="flex flex-row items-center space-x-3 space-y-0 mb-3"
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
                                                <FormLabel className="font-normal flex items-center gap-3 w-full cursor-pointer">
                                                    {image && (
                                                        <div className="relative w-16 h-12 rounded-md overflow-hidden shrink-0">
                                                            <Image
                                                                src={image.imageUrl}
                                                                alt={asset.name}
                                                                fill
                                                                sizes="64px"
                                                                className="object-cover"
                                                                data-ai-hint={image.imageHint}
                                                            />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-semibold leading-tight">{asset.name}</p>
                                                        <p className="text-xs text-muted-foreground">{asset.location}</p>
                                                    </div>
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
                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="documents"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Attach Documents</FormLabel>
                                            <FormControl>
                                                <Input type="file" multiple accept={ACCEPTED_FILE_TYPES} onChange={(e) => field.onChange(e.target.files)} />
                                            </FormControl>
                                            <FormDescription>
                                                You can upload multiple files. Max 10MB per file.
                                            </FormDescription>
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

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
                                <Button type="submit">Post Job</Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

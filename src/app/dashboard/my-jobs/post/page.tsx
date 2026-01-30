
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
import { clientAssets, NDTTechniques } from "@/lib/placeholder-data";
import { ACCEPTED_FILE_TYPES } from '@/lib/utils';
import { PlusCircle, ChevronLeft, FileText, X } from "lucide-react";
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import * as React from 'react';
import { CustomDateInput } from '@/components/ui/custom-date-input';

const baseSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  location: z.string().min(2, 'Location is required.'),
  technique: z.enum(['UT', 'PAUT', 'TOFD', 'RT', 'CR', 'DR', 'CT', 'MT', 'PT', 'VT', 'RVI', 'ET', 'ACFM', 'RFT', 'MFL', 'AE', 'LT', 'IR', 'APR', 'GWT']),
  description: z.string().optional(),
  workflow: z.enum(['standard', 'level3', 'auto']),
  documents: z.any().optional(), // For file uploads
  bidExpiryDate: z.date().optional(),
  scheduledStartDate: z.date().optional(),
  scheduledEndDate: z.date().optional(),
});


export default function PostJobPage() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'client';
    const router = useRouter();
    const { toast } = useToast();
    
    const [documentFiles, setDocumentFiles] = React.useState<File[]>([]);
    const documentsInputRef = React.useRef<HTMLInputElement>(null);

    const jobSchema = React.useMemo(() => {
      let schema = baseSchema;
      if (role === 'client') {
        schema = schema.extend({
          assets: z.array(z.string()).refine(value => value.some(item => item), {
            message: "You have to select at least one asset.",
          }),
        });
      } else { // inspector
        schema = schema.extend({
          clientName: z.string().min(2, "Client Name is required."),
          assetDescription: z.string().min(10, "Asset Description must be at least 10 characters."),
        });
      }

      return schema.refine(data => {
        if (data.scheduledStartDate && data.scheduledEndDate) {
            return data.scheduledEndDate >= data.scheduledStartDate;
        }
        return true;
      }, {
          message: "End date cannot be before start date.",
          path: ["scheduledEndDate"],
      });
    }, [role]);

    const form = useForm<z.infer<typeof jobSchema>>({
        resolver: zodResolver(jobSchema),
        defaultValues: {
            title: '',
            location: '',
            technique: 'UT',
            description: '',
            assets: [],
            clientName: '',
            assetDescription: '',
            workflow: 'standard',
        },
    });

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const handleDocumentSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const newFilesArray = Array.from(files);
            const updatedFiles = [...documentFiles, ...newFilesArray];
            setDocumentFiles(updatedFiles);
            form.setValue('documents', updatedFiles);
            if (documentsInputRef.current) {
                documentsInputRef.current.value = '';
            }
        }
    };

    const handleRemoveDocument = (indexToRemove: number) => {
        const updatedFiles = documentFiles.filter((_, index) => index !== indexToRemove);
        setDocumentFiles(updatedFiles);
        form.setValue('documents', updatedFiles);
    };

    function onSubmit(values: z.infer<typeof jobSchema>) {
        console.log('New Job Submitted:', { ...values, isInternal: role === 'inspector' });
        toast({
            title: 'Job Created Successfully',
            description: `${values.title} is now ready to be managed.`,
        });
        router.push(constructUrl('/dashboard/my-jobs'));
    }

    const isClient = role === 'client';
    const isInspector = role === 'inspector';

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                     <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                        <PlusCircle />
                        {isClient ? 'Post a New Job' : 'Create Internal Job'}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {isClient 
                            ? 'Fill out the details to create a new job listing on the marketplace.'
                            : 'Create a job for your own records and internal assignments.'
                        }
                    </p>
                </div>
                <Button asChild variant="outline" className="w-full sm:w-auto">
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
                                {isInspector && (
                                    <FormField
                                        control={form.control}
                                        name="clientName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Client Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter your client's company name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
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
                                {isClient && (
                                  <FormField
                                      control={form.control}
                                      name="bidExpiryDate"
                                      render={({ field }) => (
                                          <FormItem className="flex flex-col">
                                          <FormLabel>Bid Expiry Date</FormLabel>
                                           <FormControl>
                                            <CustomDateInput {...field} />
                                          </FormControl>
                                          <FormMessage />
                                          </FormItem>
                                      )}
                                  />
                                )}
                                <FormField
                                    control={form.control}
                                    name="scheduledStartDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                        <FormLabel>Target Start Date (Optional)</FormLabel>
                                        <FormControl>
                                            <CustomDateInput {...field} />
                                        </FormControl>
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
                                         <FormControl>
                                            <CustomDateInput {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            
                            {isClient && (
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
                                                                  alt={image.description}
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
                            )}

                            {isInspector && (
                              <FormField
                                  control={form.control}
                                  name="assetDescription"
                                  render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>Asset Description</FormLabel>
                                          <FormControl>
                                              <Textarea placeholder="Describe the asset(s) to be inspected, e.g., '10-inch diameter carbon steel pipe rack, approx. 200 feet long'." {...field} />
                                          </FormControl>
                                          <FormMessage />
                                      </FormItem>
                                  )}
                              />
                            )}
                            
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
                                    render={() => (
                                        <FormItem>
                                            <FormLabel>Attach Documents</FormLabel>
                                            <Button type="button" variant="outline" className="w-full" onClick={() => documentsInputRef.current?.click()}>
                                                Select Files to Attach
                                            </Button>
                                            <FormControl>
                                                <Input
                                                    ref={documentsInputRef}
                                                    type="file"
                                                    multiple
                                                    accept={ACCEPTED_FILE_TYPES}
                                                    className="hidden"
                                                    onChange={handleDocumentSelection}
                                                />
                                            </FormControl>
                                            {documentFiles.length > 0 && (
                                                <div className="mt-2 space-y-2">
                                                     <p className="text-xs font-medium text-muted-foreground">{documentFiles.length} file(s) attached:</p>
                                                     <ScrollArea className="max-h-24 rounded-md border p-2">
                                                        {documentFiles.map((file, index) => (
                                                            <div key={`${file.name}-${index}`} className="flex items-center justify-between text-sm p-1 hover:bg-muted rounded">
                                                                <div className="flex items-center gap-2 truncate">
                                                                    <FileText className="h-4 w-4 shrink-0" />
                                                                    <span className="truncate">{file.name}</span>
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6 shrink-0"
                                                                    onClick={() => handleRemoveDocument(index)}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </ScrollArea>
                                                </div>
                                            )}
                                            <FormDescription>
                                                You can upload multiple files. Max 10MB per file.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {isClient && (
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
                                )}
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
                                <Button type="submit">{isClient ? 'Post Job' : 'Create Job'}</Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

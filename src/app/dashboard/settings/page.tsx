
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { toast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { GLOBAL_DATE_FORMAT, cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { MultiSelect, type MultiSelectOption } from '@/components/ui/multi-select';
import { useFirebase, useUser, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where, updateDoc } from 'firebase/firestore';
import type { PlatformUser, Subscription, NDTTechnique } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from '@/app/components/layout/mode-provider';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
});

const companyProfileSchema = z.object({
  name: z.string().min(3, 'Company name must be at least 3 characters.'),
  address: z.string().optional(),
  description: z.string().optional(),
  techniques: z.array(z.string()).optional(),
  industries: z.array(z.string()).optional(),
});

const CompanyProfileSettings = ({ companyDetails, isReadOnly = false, role, techniqueOptions, industryOptions, isLoading, onSave }: { 
    companyDetails: any, 
    isReadOnly?: boolean, 
    role: string,
    techniqueOptions: MultiSelectOption[],
    industryOptions: MultiSelectOption[],
    isLoading: boolean,
    onSave: (data: z.infer<typeof companyProfileSchema>) => Promise<void>
}) => {
  const form = useForm<z.infer<typeof companyProfileSchema>>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      name: companyDetails?.name || '',
      address: companyDetails?.address || '',
      description: companyDetails?.description || '',
      techniques: companyDetails?.techniques || [],
      industries: companyDetails?.industries || [],
    },
  });
  
  useEffect(() => {
    if (companyDetails) {
        form.reset({
            name: companyDetails.name,
            address: companyDetails.address || '',
            description: companyDetails.description || '',
            techniques: companyDetails.techniques || [],
            industries: companyDetails.industries || [],
        });
    }
  }, [companyDetails, form]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Profile</CardTitle>
        <CardDescription>Manage your organization's details.</CardDescription>
      </CardHeader>
      <CardContent>
         {isLoading ? (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                {role === 'inspector' && <Skeleton className="h-24 w-full" />}
            </div>
         ) : (
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                        <Input {...field} disabled={isReadOnly}/>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                        <Input {...field} disabled={isReadOnly} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                {role === 'inspector' && (
                    <>
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Company Description</FormLabel>
                            <FormControl>
                            <Textarea
                                placeholder="Provide a brief summary of your company's services, history, and expertise. This will be visible on your public profile."
                                className="min-h-[120px]"
                                {...field}
                                disabled={isReadOnly}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="techniques"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Techniques Offered</FormLabel>
                            <MultiSelect
                                options={techniqueOptions}
                                selected={field.value || []}
                                onChange={field.onChange}
                                placeholder="Select techniques..."
                                disabled={isReadOnly}
                            />
                            <FormDescription>The NDT methods your company is certified to perform.</FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="industries"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Industries Served</FormLabel>
                            <MultiSelect
                                options={industryOptions}
                                selected={field.value || []}
                                onChange={field.onChange}
                                placeholder="Select industries..."
                                disabled={isReadOnly}
                            />
                            <FormDescription>The primary industries you provide services for.</FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    </>
                )}
                {!isReadOnly && <Button type="submit">Save Changes</Button>}
            </form>
            </Form>
         )}
      </CardContent>
    </Card>
  );
};

const TeamManagementSettings = ({ user }: { user: any }) => {
    const searchParams = useSearchParams();
    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Team Management</CardTitle>
                <CardDescription>Your current plan includes a single user seat.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-lg border p-4 space-y-4">
                    <div>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-sm text-muted-foreground">{user.role}</p>
                        <Badge variant="outline" className="mt-2">Primary Contact &amp; Account Admin</Badge>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
                <div className="space-y-2">
                    <p className="font-semibold">Need to add more team members?</p>
                    <p className="text-sm text-muted-foreground">Upgrade your plan to invite colleagues and manage user roles.</p>
                    <Button asChild className="mt-2">
                        <Link href={constructUrl("/dashboard/billing")}>View Subscription Plans</Link>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
};

const PlatformAdminTeamSettings = ({ allUsers, isLoading }: { allUsers: PlatformUser[], isLoading: boolean }) => {
    const platformAdmins = allUsers.filter(u => u.role === 'Admin');

    const statusStyles: { [key in PlatformUser['status']]: 'success' | 'default' | 'secondary' | 'destructive' | 'outline' } = {
        Active: 'success',
        Invited: 'secondary',
        Disabled: 'destructive',
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Platform Administrators</CardTitle>
                <CardDescription>A list of users with platform-wide administrative privileges.</CardDescription>
            </CardHeader>
            <CardContent>
                 {isLoading ? <Skeleton className="h-40" /> : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {platformAdmins.map(admin => (
                                <TableRow key={admin.id}>
                                    <TableCell className="font-medium flex items-center gap-3">
                                        <Avatar>
                                            <AvatarFallback>{admin.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        {admin.name}
                                    </TableCell>
                                    <TableCell>{admin.email}</TableCell>
                                    <TableCell><Badge variant={statusStyles[admin.status]}>{admin.status}</Badge></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
            <CardFooter>
                <p className="text-xs text-muted-foreground">To add or remove platform administrators, please use the main User Management page.</p>
            </CardFooter>
        </Card>
    );
};


const allNotificationSettings = {
    client: {
        email: [
            { id: 'email-job-updates', label: 'Job Status Updates', description: 'Get notified when a job you posted is awarded, scheduled, or completed.' , defaultChecked: true},
            { id: 'email-new-bids', label: 'New Bids Received', description: 'Receive an email every time a provider places a bid on your job.' , defaultChecked: true},
            { id: 'email-report-submissions', label: 'Report Submissions', description: 'Get an email when an inspector submits a report for your review.' , defaultChecked: true},
            { id: 'email-messages-client', label: 'Direct Messages', description: 'Receive notifications for new messages from providers.' , defaultChecked: false},
        ],
        push: [
            { id: 'push-job-updates', label: 'Job Status Updates', description: 'Get a push notification when a job you posted is updated.', defaultChecked: true },
            { id: 'push-new-bids', label: 'New Bids Received', description: 'Get a push notification when a provider places a bid on your job.', defaultChecked: true },
            { id: 'push-messages-client', label: 'Direct Messages', description: 'Receive push notifications for new messages.', defaultChecked: true },
        ],
    },
    inspector: {
        email: [
            { id: 'email-new-jobs', label: 'New Job Opportunities', description: 'Get notified about new jobs that match your certified techniques.' , defaultChecked: true},
            { id: 'email-bid-status', label: 'Bid Status Updates', description: 'Receive an email when your bid is awarded or rejected.' , defaultChecked: true},
            { id: 'email-job-assignments', label: 'Job Assignments', description: 'Get notified when you are assigned to a scheduled job.' , defaultChecked: true},
            { id: 'email-messages-inspector', label: 'Direct Messages', description: 'Receive notifications for new messages from clients.' , defaultChecked: false},
        ],
        push: [
            { id: 'push-new-jobs', label: 'New Job Opportunities', description: 'Get a push notification for new jobs that match your techniques.', defaultChecked: true },
            { id: 'push-bid-status', label: 'Bid Status Updates', description: 'Get a push notification when your bid is awarded or rejected.', defaultChecked: true },
            { id: 'push-messages-inspector', label: 'Direct Messages', description: 'Receive push notifications for new messages.', defaultChecked: true },
        ],
    },
    admin: {
        email: [
            { id: 'email-new-users', label: 'New User Signups', description: 'Get notified when a new client or provider joins the platform.' , defaultChecked: true},
            { id: 'email-new-reviews', label: 'New Reviews for Moderation', description: 'Receive an email when a new review is submitted and needs approval.' , defaultChecked: true},
            { id: 'email-platform-alerts', label: 'Platform Health Alerts', description: 'Important system-level notifications.' , defaultChecked: true},
        ],
        push: [
            { id: 'push-new-users', label: 'New User Signups', description: 'Get a push notification when a new user joins.', defaultChecked: false },
            { id: 'push-new-reviews', label: 'New Reviews for Moderation', description: 'Get a push notification when a review needs approval.', defaultChecked: true },
        ]
    },
    auditor: {
        email: [
            { id: 'email-audit-queue', label: 'New Reports for Audit', description: 'Get notified when a report is submitted and requires your audit.' , defaultChecked: true},
            { id: 'email-audit-approved', label: 'Audit Status Changes', description: 'Receive a notification when a client approves or rejects a report you audited.' , defaultChecked: false},
        ],
        push: [
            { id: 'push-audit-queue', label: 'New Reports for Audit', description: 'Get a push notification when a report requires your audit.', defaultChecked: true },
        ]
    }
};

const notificationSchema = z.record(z.string(), z.boolean());
type NotificationFormValues = z.infer<typeof notificationSchema>;

const NotificationSettings = ({ role, onSave, defaultValues }: { role: string; onSave: (data: NotificationFormValues) => void; defaultValues: any; }) => {
    const { email: emailSettings, push: pushSettings } = allNotificationSettings[role as keyof typeof allNotificationSettings] || { email: [], push: [] };
    
    const form = useForm<NotificationFormValues>({
        resolver: zodResolver(notificationSchema),
        defaultValues: useMemo(() => {
            const defaults: NotificationFormValues = {};
            [...emailSettings, ...pushSettings].forEach(setting => {
                defaults[setting.id] = defaultValues?.[setting.id] ?? setting.defaultChecked;
            });
            return defaults;
        }, [defaultValues, emailSettings, pushSettings])
    });

    useEffect(() => {
        const defaults: NotificationFormValues = {};
        [...emailSettings, ...pushSettings].forEach(setting => {
            defaults[setting.id] = defaultValues?.[setting.id] ?? setting.defaultChecked;
        });
        form.reset(defaults);
    }, [defaultValues, emailSettings, pushSettings, form]);

  return (
    <Form {...form}>
    <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>Manage how you receive email notifications for important platform events.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {emailSettings.map(setting => (
                    <FormField
                        key={setting.id}
                        control={form.control}
                        name={setting.id}
                        render={({ field }) => (
                             <FormItem className="flex items-start justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">{setting.label}</FormLabel>
                                    <FormDescription>{setting.description}</FormDescription>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} className="mt-1" />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                ))}
                {emailSettings.length === 0 && <p className="text-muted-foreground">No specific email notifications for this role.</p>}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Push Notifications</CardTitle>
                <CardDescription>Manage browser and mobile app notifications for real-time alerts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {pushSettings.map(setting => (
                     <FormField
                        key={setting.id}
                        control={form.control}
                        name={setting.id}
                        render={({ field }) => (
                             <FormItem className="flex items-start justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">{setting.label}</FormLabel>
                                    <FormDescription>{setting.description}</FormDescription>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} className="mt-1" />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                ))}
                {pushSettings.length === 0 && <p className="text-muted-foreground">No specific push notifications for this role.</p>}
            </CardContent>
        </Card>
        <div className="flex justify-end">
            <Button type="submit">Save Notification Settings</Button>
        </div>
    </form>
    </Form>
  );
};


const SubscriptionSettings = ({ subscription }: { subscription?: Subscription }) => {
    const searchParams = useSearchParams();
    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    if (!subscription) {
        return (
            <Card>
                 <CardHeader>
                    <CardTitle>Subscription &amp; Billing</CardTitle>
                 </CardHeader>
                <CardContent>
                    <Skeleton className="h-40" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Subscription &amp; Billing</CardTitle>
                <CardDescription>
                    Manage your subscription plan and billing details.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 {subscription.status === 'Trialing' && subscription.endDate && (
                    <Alert className="border-amber-500/50 text-amber-900 bg-amber-500/10 [&>svg]:text-amber-600">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Your free trial is ending soon!</AlertTitle>
                        <AlertDescription>
                            You have {Math.max(0, new Date(subscription.endDate).getDate() - new Date().getDate())} days left. Please contact us to upgrade to a paid plan and avoid any interruption in service.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="rounded-lg border p-4 space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-semibold">Current Plan</p>
                            <p className="text-2xl font-bold">{subscription.plan}</p>
                        </div>
                        <Badge variant={subscription.status === 'Active' ? 'success' : 'default'}>{subscription.status}</Badge>
                    </div>
                    {subscription.endDate && (
                        <div>
                            <div className="flex justify-between text-sm text-muted-foreground mb-1">
                                <span>{subscription.status === 'Trialing' ? 'Trial ends' : 'Plan renews'} on {format(new Date(subscription.endDate), GLOBAL_DATE_FORMAT)}</span>
                            </div>
                            <Progress value={50} />
                        </div>
                    )}
                </div>
                
                <Separator />

                <div className="space-y-4">
                    <h4 className="font-semibold">Usage this billing cycle</h4>
                    <div>
                        <div className="flex justify-between text-sm text-muted-foreground mb-1">
                            <span>Data Storage</span>
                            <span>{subscription.dataUsageGB} GB / {subscription.dataLimitGB} GB used</span>
                        </div>
                        <Progress value={(subscription.dataUsageGB / subscription.dataLimitGB) * 100} />
                    </div>
                    <div>
                        <div className="flex justify-between text-sm text-muted-foreground mb-1">
                            <span>Team Members</span>
                            <span>{subscription.userCount} / {subscription.userLimit} users</span>
                        </div>
                        <Progress value={(subscription.userCount / subscription.userLimit) * 100} />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="gap-2">
                 <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Link href={constructUrl("/dashboard/billing")}>Manage Subscription</Link>
                </Button>
                <Button variant="outline">View Billing History</Button>
            </CardFooter>
        </Card>
    );
};

const BrandingSettings = ({ companyName, role }: { companyName: string, role: string }) => {
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [brandColor, setBrandColor] = useState('#3B82F6');
    const [isLogoDragging, setIsLogoDragging] = useState(false);
    const [isThumbnailDragging, setIsThumbnailDragging] = useState(false);
    const logoFileInputRef = useRef<HTMLInputElement>(null);
    const thumbnailFileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (
        file: File | null,
        setPreview: React.Dispatch<React.SetStateAction<string | null>>,
        maxSizeMB: number,
        allowedTypes: string[]
    ) => {
        if (file) {
            if (!allowedTypes.includes(file.type)) {
                toast({ variant: 'destructive', title: 'Invalid File Type', description: `Please upload one of: ${allowedTypes.join(', ')}` });
                return;
            }
            if (file.size > maxSizeMB * 1024 * 1024) {
                toast({ variant: 'destructive', title: 'File Too Large', description: `Image must be smaller than ${maxSizeMB}MB.` });
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const createDragHandlers = (setIsDragging: React.Dispatch<React.SetStateAction<boolean>>, handleFile: (file: File | null) => void) => ({
        handleDragEnter: (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); },
        handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); },
        handleDragOver: (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); },
        handleDrop: (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleFile(e.dataTransfer.files[0]);
                e.dataTransfer.clearData();
            }
        },
    });

    const logoDragHandlers = createDragHandlers(setIsLogoDragging, (file) => handleFileUpload(file, setLogoPreview, 2, ['image/png', 'image/jpeg', 'image/svg+xml']));
    const thumbnailDragHandlers = createDragHandlers(setIsThumbnailDragging, (file) => handleFileUpload(file, setThumbnailPreview, 1, ['image/png', 'image/jpeg']));

    const handleSaveBranding = () => {
        toast({ title: 'Branding Saved', description: 'Your company branding has been updated.' });
    };

    const isCustomer = role === 'customer';
    const clientLogo = isCustomer ? logoPreview : 'https://placehold.co/120x40/f0f0f0/999999/png?text=Customer+Logo';
    const providerLogo = !isCustomer ? logoPreview : 'https://placehold.co/200x80/FF6600/FFFFFF/png?text=TEAM';

    return (
        <Card>
            <CardHeader>
                <CardTitle>Company Branding</CardTitle>
                <CardDescription>Manage your logo, thumbnail, and brand color. These assets will appear on reports and listings.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-12 items-start">
                <div className="space-y-6">
                    <div>
                        <Label htmlFor="logo-upload">Company Logo</Label>
                        <div
                            {...logoDragHandlers}
                            onClick={() => logoFileInputRef.current?.click()}
                            className={cn(
                                "relative mt-2 w-full aspect-video rounded-md border-2 border-dashed flex items-center justify-center text-center text-muted-foreground cursor-pointer transition-colors",
                                isLogoDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-muted/50"
                            )}
                        >
                            {logoPreview ? (
                                <>
                                    <Image src={logoPreview} alt="Company Logo Preview" fill className="object-contain rounded-md p-4" />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-md">
                                        <p className="text-white font-semibold">Click or drag to replace logo</p>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                                    <p>Click or drag &amp; drop logo</p>
                                    <p className="text-xs">PNG, JPG, or SVG up to 2MB</p>
                                </div>
                            )}
                            <Input ref={logoFileInputRef} id="logo-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/svg+xml" onChange={(e) => handleFileUpload(e.target.files?.[0] || null, setLogoPreview, 2, ['image/png', 'image/jpeg', 'image/svg+xml'])} />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="thumbnail-upload">Company Thumbnail</Label>
                        <div
                            {...thumbnailDragHandlers}
                            onClick={() => thumbnailFileInputRef.current?.click()}
                            className={cn(
                                "relative mt-2 w-40 h-40 rounded-full border-2 border-dashed flex items-center justify-center text-center text-muted-foreground cursor-pointer transition-colors",
                                isThumbnailDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-muted/50"
                            )}
                        >
                            {thumbnailPreview ? (
                                <>
                                    <Image src={thumbnailPreview} alt="Company Thumbnail Preview" fill className="object-cover rounded-full" />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-full">
                                        <p className="text-white font-semibold text-xs text-center">Replace</p>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <p className="text-xs">Upload Thumbnail</p>
                                    <p className="text-xs">(Square)</p>
                                </div>
                            )}
                            <Input ref={thumbnailFileInputRef} id="thumbnail-upload" type="file" className="hidden" accept="image/png, image/jpeg" onChange={(e) => handleFileUpload(e.target.files?.[0] || null, setThumbnailPreview, 1, ['image/png', 'image/jpeg'])} />
                        </div>
                        <FormDescription className="mt-2">Used for smaller icons and avatars. A square image (1:1 ratio) works best.</FormDescription>
                    </div>

                    {role === 'customer' && (
                        <div>
                            <Label htmlFor="brand-color">Brand Color</Label>
                            <div className="mt-2 flex items-center gap-2">
                                <Input id="brand-color" type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="w-12 h-10 p-1" />
                                <Input value={brandColor} onChange={(e) => setBrandColor(e.target.value)} placeholder="#3B82F6" />
                            </div>
                        </div>
                    )}
                </div>
                <div>
                    <Label>Report Preview</Label>
                    <div className="mt-2 rounded-lg border p-4 shadow-md">
                        <div className="flex justify-between items-center pb-4 border-b-2" style={{ borderColor: brandColor }}>
                            <div className="w-1/4 flex justify-start">
                                {clientLogo ? <Image src={clientLogo} alt="Customer Logo" width={120} height={40} className="object-contain h-10" /> : <div className="h-10 w-full" />}
                            </div>
                            <div className="w-1/2 text-center">
                                <h3 className="font-bold text-lg" style={{ color: brandColor }}>INSPECTION REPORT</h3>
                                <p className="text-xs text-muted-foreground">Report #2024-123</p>
                            </div>
                            <div className="w-1/4 flex justify-end">
                                {providerLogo ? <Image src={providerLogo} alt="Provider Logo" width={120} height={40} className="object-contain h-10" /> : <div className="h-10 w-full" />}
                            </div>
                        </div>
                        <div className="pt-4 text-sm text-muted-foreground space-y-2">
                            <div className="grid grid-cols-2 gap-4">
                                <p><strong>Asset:</strong> Storage Tank T-101</p>
                                <p><strong>Date:</strong> {format(new Date(), 'dd-MMM-yyyy')}</p>
                                <p><strong>Job ID:</strong> JOB-001</p>
                                <p><strong>Technique:</strong> UT</p>
                            </div>
                            <p className="pt-4">Report summary and findings will appear here...</p>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSaveBranding}>Save Branding</Button>
            </CardFooter>
        </Card>
    );
};

const AppearanceSettings = () => {
    const { theme, setTheme } = useTheme();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of the application.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label className="text-base">Dark Mode</Label>
                        <p className="text-sm text-muted-foreground">
                            Enable dark mode for the entire application.
                        </p>
                    </div>
                    <Switch
                        checked={theme === 'dark'}
                        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                    />
                </div>
            </CardContent>
             <CardFooter>
                <p className="text-xs text-muted-foreground">
                    Role-based themes are applied automatically and cannot be changed here.
                </p>
            </CardFooter>
        </Card>
    )
}

export default function SettingsPage() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'customer';
    const { firestore, auth } = useFirebase();
    const { user: authUser, isUserLoading } = useUser();
    
    const { data: currentUserProfile, isLoading: isLoadingProfile } = useDoc<PlatformUser>(
        useMemoFirebase(() => (firestore && authUser ? doc(firestore, 'users', authUser.uid) : null), [firestore, authUser])
    );
    
    const { data: companyDetails, isLoading: isLoadingCompany } = useDoc<any>(
        useMemoFirebase(() => (firestore && currentUserProfile?.companyId ? doc(firestore, 'companies', currentUserProfile.companyId) : null), [firestore, currentUserProfile])
    );

    const { data: subscriptions, isLoading: isLoadingSubs } = useCollection<Subscription>(
        useMemoFirebase(() => (firestore && currentUserProfile?.companyId ? query(collection(firestore, 'subscriptions'), where('companyId', '==', currentUserProfile.companyId)) : null), [firestore, currentUserProfile])
    );
    const subscription = subscriptions?.[0];

    const { data: allUsers, isLoading: isLoadingUsers } = useCollection<PlatformUser>(
        useMemoFirebase(() => (role === 'admin' && firestore ? collection(firestore, 'users') : null), [firestore, role])
    );

    const { data: allNdtTechniques, isLoading: isLoadingTechniques } = useCollection<NDTTechnique>(
        useMemoFirebase(() => (firestore ? collection(firestore, 'techniques') : null), [firestore])
    );

    const { data: allCompanies, isLoading: isLoadingAllCompanies } = useCollection<any>(
        useMemoFirebase(() => (firestore ? collection(firestore, 'companies') : null), [firestore])
    );
    
    const industryOptions = useMemo(() => {
        if (!allCompanies) return [];
        const industries = new Set(allCompanies.flatMap(c => c.industries || []));
        return Array.from(industries).sort().map(i => ({ value: i, label: i }));
    }, [allCompanies]);

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: currentUserProfile?.name || '',
            email: currentUserProfile?.email || '',
        },
    });
    
    useEffect(() => {
        if (currentUserProfile) {
            form.reset({
                name: currentUserProfile.name,
                email: currentUserProfile.email,
            })
        }
    }, [currentUserProfile, form]);

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const onSubmit = async (data: z.infer<typeof profileSchema>) => {
        if (!firestore || !authUser) return;
        
        try {
            await updateDoc(doc(firestore, 'users', authUser.uid), {
                name: data.name,
                email: data.email
            });
            toast({
                title: 'Profile Updated',
                description: 'Your profile information has been saved.',
            });
        } catch (error) {
            console.error("Error updating profile:", error);
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: 'Could not save your profile changes.'
            });
        }
    };
    
    const onCompanyProfileSave = async (data: z.infer<typeof companyProfileSchema>) => {
        if (!firestore || !currentUserProfile?.companyId) return;

        try {
            await updateDoc(doc(firestore, 'companies', currentUserProfile.companyId), {
                name: data.name,
                address: data.address,
                description: data.description,
                techniques: data.techniques,
                industries: data.industries,
            });
            toast({
              title: 'Company Profile Updated',
              description: 'Your company information has been saved.',
            });
        } catch (error) {
            console.error("Error updating company profile:", error);
             toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: 'Could not save company profile changes.'
            });
        }
    };

    const onNotificationSave = async (data: NotificationFormValues) => {
        if (!firestore || !authUser) return;
        try {
            await updateDoc(doc(firestore, 'users', authUser.uid), {
                notificationSettings: data
            });
            toast({ title: 'Notification Settings Saved' });
        } catch (error) {
            console.error("Error saving notification settings:", error);
            toast({
                variant: 'destructive',
                title: 'Save Failed',
                description: 'Could not save your notification preferences.'
            });
        }
    };

    const isLoading = isUserLoading || isLoadingProfile || isLoadingCompany || isLoadingSubs;
    const isSubscriptionActive = subscription?.status === 'Active';

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        )
    }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-headline font-semibold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings, profile, and preferences.
        </p>
      </div>
      <Separator />

      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          {(role === 'customer' || role === 'inspector') && <TabsTrigger value="branding">Branding</TabsTrigger>}
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="terms">Terms &amp; Conditions</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your photo and personal details here.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24">
                        <AvatarFallback className="text-4xl font-bold font-headline">{currentUserProfile?.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                     <div className="flex flex-col gap-2">
                        <Button type="button">Change Photo</Button>
                        <Button type="button" variant="ghost">Remove</Button>
                     </div>
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <Button type="submit" disabled={isUserLoading}>Save Changes</Button>
              </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="company">
             <CompanyProfileSettings 
                companyDetails={companyDetails}
                isReadOnly={role === 'admin' || !isSubscriptionActive}
                role={role}
                techniqueOptions={allNdtTechniques?.map(t => ({ value: t.acronym, label: `${t.title} (${t.acronym})` })) || []}
                industryOptions={industryOptions}
                isLoading={isLoadingCompany || isLoadingTechniques || isLoadingAllCompanies}
                onSave={onCompanyProfileSave}
            />
        </TabsContent>
        <TabsContent value="branding">
            <BrandingSettings companyName={currentUserProfile?.company || ''} role={role} />
        </TabsContent>
        <TabsContent value="team">
              {role === 'admin' ? (
                <PlatformAdminTeamSettings allUsers={allUsers || []} isLoading={isLoadingUsers} />
              ) : isSubscriptionActive ? (
                <TeamManagementSettings user={currentUserProfile} />
              ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Team Management</CardTitle>
                        <CardDescription>Invite colleagues, manage roles, and collaborate with your team.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center p-8 border-2 border-dashed rounded-lg bg-muted/30">
                            <p className="text-lg font-semibold">This is a premium feature</p>
                            <p className="text-muted-foreground mt-2">Upgrade your plan to add colleagues and manage user roles.</p>
                            <Button asChild className="mt-4">
                                <Link href={constructUrl("/dashboard/billing")}>View Subscription Plans</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
              )}
          </TabsContent>
        <TabsContent value="subscription">
            <SubscriptionSettings subscription={subscription} />
        </TabsContent>
        <TabsContent value="notifications">
            <NotificationSettings 
                role={role}
                onSave={onNotificationSave}
                defaultValues={currentUserProfile?.notificationSettings || {}}
            />
        </TabsContent>
        <TabsContent value="appearance">
            <AppearanceSettings />
        </TabsContent>
        <TabsContent value="terms">
            <Card>
                <CardHeader>
                    <CardTitle>Terms and Conditions</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[60vh] pr-6">
                        <div className="space-y-6 text-muted-foreground">
                            <p>
                              Welcome to NDT EXCHANGE. These terms and conditions outline the rules and regulations for the use of NDT EXCHANGE's Website, located at ndt-exchange.com.
                            </p>
                            <p>
                              By accessing this website we assume you accept these terms and conditions. Do not continue to use NDT EXCHANGE if you do not agree to take all of the terms and conditions stated on this page.
                            </p>
                            
                            <h2 className="text-2xl font-headline text-foreground pt-4">1. Definitions</h2>
                            <p>
                              The following terminology applies to these Terms and Conditions, Privacy Statement and Disclaimer Notice and all Agreements: "Customer", "You" and "Your" refers to you, the person log on this website and compliant to the Company’s terms and conditions. "The Company", "Ourselves", "We", "Our" and "Us", refers to our Company. "Party", "Parties", or "Us", refers to both the Customer and ourselves.
                            </p>

                            <h2 className="text-2xl font-headline text-foreground pt-4">2. License to Use Website</h2>
                            <p>
                              Unless otherwise stated, NDT EXCHANGE and/or its licensors own the intellectual property rights for all material on NDT EXCHANGE. All intellectual property rights are reserved. You may access this from NDT EXCHANGE for your own personal use subjected to restrictions set in these terms and conditions.
                            </p>
                            <p>You must not:</p>
                            <ul className="list-disc list-inside space-y-2 pl-4">
                            <li>Republish material from NDT EXCHANGE</li>
                            <li>Sell, rent or sub-license material from NDT EXCHANGE</li>
                            <li>Reproduce, duplicate or copy material from NDT EXCHANGE</li>
                            <li>Redistribute content from NDT EXCHANGE</li>
                            </ul>

                            <h2 className="text-2xl font-headline text-foreground pt-4">3. User Content</h2>
                            <p>
                              In these Terms and Conditions, “Your User Content” shall mean any audio, video, text, images or other material you choose to display on this Website. By displaying Your User Content, you grant NDT EXCHANGE a non-exclusive, worldwide, irrevocable, royalty-free, sublicensable license to use, reproduce, adapt, publish, translate and distribute it in any and all media.
                            </p>

                            <h2 className="text-2xl font-headline text-foreground pt-4">4. Role of the Platform & Disclaimer of Services</h2>
                            <p>
                                NDT EXCHANGE acts as a neutral digital platform to connect asset owners (Customers) with NDT service providers. We are not a party to the actual service agreement between the Customer and the Provider. Our role is strictly limited to providing the technology to facilitate this connection.
                            </p>
                            <p>
                                Therefore, we make no representations or warranties regarding the quality, accuracy, safety, or legality of the services provided or the reports generated by users on the platform. The responsibility for the inspection work, its results, and its conclusions lies solely with the service provider and the Customer who engages them. Users are solely responsible for vetting and selecting appropriate counterparts.
                            </p>
                            
                            <h2 className="text-2xl font-headline text-foreground pt-4">5. Limitation of Liability</h2>
                            <p>
                              In no event shall NDT EXCHANGE, nor any of its officers, directors and employees, be held liable for anything arising out of or in any way connected with your use of this Website whether such liability is under contract. NDT EXCHANGE, including its officers, directors and employees shall not be held liable for any indirect, consequential or special liability arising out of or in any way related to your use of this Website.
                            </p>

                            <h2 className="text-2xl font-headline text-foreground pt-4">6. Financial Transactions</h2>
                            <p>
                              NDT EXCHANGE provides a platform to connect asset owners (Customers) with NDT service providers. While our platform facilitates this connection and the management of job workflows, we are not a party to any financial agreements or transactions between Customers and providers.
                            </p>
                            <p>
                              All payments for services rendered are to be handled directly between the Customer and the service provider. NDT EXCHANGE does not process payments, handle invoices, or take a commission on jobs unless explicitly stated in a separate agreement. We are not responsible for any disputes related to payments, invoicing, or financial terms agreed upon between users of the platform.
                            </p>
                            
                            <h2 className="text-2xl font-headline text-foreground pt-4">7. Governing Law & Jurisdiction</h2>
                            <p>
                              These Terms will be governed by and interpreted in accordance with the laws of the State/Country, and you submit to the non-exclusive jurisdiction of the state and federal courts located in State/Country for the resolution of any disputes.
                            </p>
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

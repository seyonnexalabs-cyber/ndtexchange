
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
import { allUsers, clientData, serviceProviders, auditFirms, subscriptions, PlatformUser } from '@/lib/placeholder-data';
import { NDTTechniques, auditFirmIndustries } from '@/lib/seed-data';
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
import { MultiSelect } from '@/components/ui/multi-select';


const userDetails = {
    client: { name: 'John Doe', role: 'Project Manager', email: 'john.d@globalenergy.corp', company: 'Global Energy Corp.', address: '123 Energy Corridor, Houston, TX 77079' },
    inspector: { name: 'Maria Garcia', role: 'Level II Inspector', email: 'maria.garcia@teaminc.com', company: 'TEAM, Inc.', address: '1 Fluor Daniel Dr, Sugar Land, TX 77478' },
    admin: { name: 'Admin User', role: 'Platform Admin', email: 'admin@ndtexchange.com', company: 'NDT EXCHANGE', address: '123 Main St, Palo Alto, CA' },
    auditor: { name: 'Alex Chen', role: 'Compliance Auditor', email: 'alex.c@ndtauditors.gov', company: 'NDT Auditors LLC', address: '456 Gov Ave, Washington, D.C.' },
};

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
});

const companyProfileSchema = z.object({
  companyName: z.string().min(3, 'Company name must be at least 3 characters.'),
  companyAddress: z.string().optional(),
  description: z.string().optional(),
  techniques: z.array(z.string()).optional(),
  industries: z.array(z.string()).optional(),
});

const CompanyProfileSettings = ({ companyDetails, isReadOnly = false, role }: { companyDetails: any, isReadOnly?: boolean, role: string }) => {
  const form = useForm<z.infer<typeof companyProfileSchema>>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      companyName: companyDetails?.name || '',
      companyAddress: (companyDetails as any)?.address || '',
      description: companyDetails?.description || '',
      techniques: companyDetails?.techniques || [],
      industries: companyDetails?.industries || [],
    },
  });

  const onProfileSubmit = (data: z.infer<typeof companyProfileSchema>) => {
    toast({
      title: 'Company Profile Updated',
      description: 'Your company information has been saved.',
    });
    console.log(data);
  };
  
  const techniqueOptions = useMemo(() => NDTTechniques.map(t => ({ value: t.id, label: `${t.name} (${t.id})` })), []);
  const industryOptions = useMemo(() => auditFirmIndustries.map(i => ({ value: i, label: i })), []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Profile</CardTitle>
        <CardDescription>Manage your organization's details.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="companyName"
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
              name="companyAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isReadOnly}/>
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
      </CardContent>
    </Card>
  );
};

const TeamManagementSettings = ({ user }: { user: { name: string, email: string, role: string } }) => {
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

const PlatformAdminTeamSettings = () => {
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
            </CardContent>
            <CardFooter>
                <p className="text-xs text-muted-foreground">To add or remove platform administrators, please use the main User Management page.</p>
            </CardFooter>
        </Card>
    );
};


const NotificationSettings = ({ role }: { role: string }) => {
  const clientEmailSettings = [
    { id: 'email-job-updates', label: 'Job Status Updates', description: 'Get notified when a job you posted is awarded, scheduled, or completed.' , defaultChecked: true},
    { id: 'email-new-bids', label: 'New Bids Received', description: 'Receive an email every time a provider places a bid on your job.' , defaultChecked: true},
    { id: 'email-report-submissions', label: 'Report Submissions', description: 'Get an email when an inspector submits a report for your review.' , defaultChecked: true},
    { id: 'email-messages-client', label: 'Direct Messages', description: 'Receive notifications for new messages from providers.' , defaultChecked: false},
  ];

  const inspectorEmailSettings = [
    { id: 'email-new-jobs', label: 'New Job Opportunities', description: 'Get notified about new jobs that match your certified techniques.' , defaultChecked: true},
    { id: 'email-bid-status', label: 'Bid Status Updates', description: 'Receive an email when your bid is awarded or rejected.' , defaultChecked: true},
    { id: 'email-job-assignments', label: 'Job Assignments', description: 'Get notified when you are assigned to a scheduled job.' , defaultChecked: true},
    { id: 'email-messages-inspector', label: 'Direct Messages', description: 'Receive notifications for new messages from clients.' , defaultChecked: false},
  ];

  const adminEmailSettings = [
    { id: 'email-new-users', label: 'New User Signups', description: 'Get notified when a new client or provider joins the platform.' , defaultChecked: true},
    { id: 'email-new-reviews', label: 'New Reviews for Moderation', description: 'Receive an email when a new review is submitted and needs approval.' , defaultChecked: true},
    { id: 'email-platform-alerts', label: 'Platform Health Alerts', description: 'Important system-level notifications.' , defaultChecked: true},
  ];
  
  const auditorEmailSettings = [
    { id: 'email-audit-queue', label: 'New Reports for Audit', description: 'Get notified when a report is submitted and requires your audit.' , defaultChecked: true},
    { id: 'email-audit-approved', label: 'Audit Status Changes', description: 'Receive a notification when a client approves or rejects a report you audited.' , defaultChecked: false},
  ];

  const clientPushSettings = [
    { id: 'push-job-updates', label: 'Job Status Updates', description: 'Get a push notification when a job you posted is updated.', defaultChecked: true },
    { id: 'push-new-bids', label: 'New Bids Received', description: 'Get a push notification when a provider places a bid on your job.', defaultChecked: true },
    { id: 'push-messages-client', label: 'Direct Messages', description: 'Receive push notifications for new messages.', defaultChecked: true },
  ];

  const inspectorPushSettings = [
      { id: 'push-new-jobs', label: 'New Job Opportunities', description: 'Get a push notification for new jobs that match your techniques.', defaultChecked: true },
      { id: 'push-bid-status', label: 'Bid Status Updates', description: 'Get a push notification when your bid is awarded or rejected.', defaultChecked: true },
      { id: 'push-messages-inspector', label: 'Direct Messages', description: 'Receive push notifications for new messages.', defaultChecked: true },
  ];

  const adminPushSettings = [
      { id: 'push-new-users', label: 'New User Signups', description: 'Get a push notification when a new user joins.', defaultChecked: false },
      { id: 'push-new-reviews', label: 'New Reviews for Moderation', description: 'Get a push notification when a review needs approval.', defaultChecked: true },
  ];

  const auditorPushSettings = [
      { id: 'push-audit-queue', label: 'New Reports for Audit', description: 'Get a push notification when a report requires your audit.', defaultChecked: true },
  ];

  let emailSettings, pushSettings;
  switch (role) {
    case 'client':
      emailSettings = clientEmailSettings;
      pushSettings = clientPushSettings;
      break;
    case 'inspector':
      emailSettings = inspectorEmailSettings;
      pushSettings = inspectorPushSettings;
      break;
    case 'admin':
      emailSettings = adminEmailSettings;
      pushSettings = adminPushSettings;
      break;
    case 'auditor':
      emailSettings = auditorEmailSettings;
      pushSettings = auditorPushSettings;
      break;
    default:
      emailSettings = [];
      pushSettings = [];
  }

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>Manage how you receive email notifications for important platform events.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-start justify-between rounded-lg border bg-card p-4 shadow-sm">
                    <div className="space-y-0.5">
                        <Label htmlFor="master-email-notifications" className="text-base font-semibold">Enable All Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">A master switch to control all email alerts from the platform.</p>
                    </div>
                    <Switch id="master-email-notifications" defaultChecked={true} className="mt-1" />
                </div>
                <Separator />
                {emailSettings.map(setting => (
                    <div key={setting.id} className="flex items-start justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor={setting.id} className="text-base">{setting.label}</Label>
                            <p className="text-sm text-muted-foreground">{setting.description}</p>
                        </div>
                        <Switch id={setting.id} defaultChecked={setting.defaultChecked} className="mt-1" />
                    </div>
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
                <div className="flex items-start justify-between rounded-lg border bg-card p-4 shadow-sm">
                    <div className="space-y-0.5">
                        <Label htmlFor="master-push-notifications" className="text-base font-semibold">Enable All Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">A master switch to control all push alerts.</p>
                    </div>
                    <Switch id="master-push-notifications" defaultChecked={true} className="mt-1" />
                </div>
                <Separator />
                {pushSettings.map(setting => (
                    <div key={setting.id} className="flex items-start justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor={setting.id} className="text-base">{setting.label}</Label>
                            <p className="text-sm text-muted-foreground">{setting.description}</p>
                        </div>
                        <Switch id={setting.id} defaultChecked={setting.defaultChecked} className="mt-1" />
                    </div>
                ))}
                {pushSettings.length === 0 && <p className="text-muted-foreground">No specific push notifications for this role.</p>}
            </CardContent>
        </Card>
    </div>
  );
};


const SubscriptionSettings = () => {
    const [trialDetails, setTrialDetails] = useState({
        endDate: new Date(),
        progress: 0,
        daysRemaining: 0,
    });
    const [usageDetails] = useState({
        storage: 1.2,
        storageLimit: 5,
        users: 3,
        userLimit: 5,
    });
    const searchParams = useSearchParams();
    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    useEffect(() => {
        // Use a fixed start date for consistent demonstration
        const trialStartDate = new Date();
        trialStartDate.setDate(trialStartDate.getDate() - 25); // Set to 25 days ago to show the alert
        
        const endDate = new Date(trialStartDate);
        endDate.setDate(endDate.getDate() + 30);
        
        const today = new Date();
        const daysElapsed = Math.max(0, Math.floor((today.getTime() - trialStartDate.getTime()) / (1000 * 3600 * 24)));
        const progress = Math.min((daysElapsed / 30) * 100, 100);
        const daysRemaining = Math.max(0, 30 - daysElapsed);

        setTrialDetails({
            endDate,
            progress,
            daysRemaining,
        });
    }, []);

    const storageProgress = (usageDetails.storage / usageDetails.storageLimit) * 100;
    const userProgress = (usageDetails.users / usageDetails.userLimit) * 100;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Subscription &amp; Billing</CardTitle>
                <CardDescription>
                    Manage your subscription plan and billing details.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 {trialDetails.daysRemaining < 10 && (
                    <Alert className="border-amber-500/50 text-amber-900 bg-amber-500/10 [&>svg]:text-amber-600">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Your free trial is ending soon!</AlertTitle>
                        <AlertDescription>
                            You have {trialDetails.daysRemaining} days left. Please contact us to upgrade to a paid plan and avoid any interruption in service.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="rounded-lg border p-4 space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-semibold">Current Plan</p>
                            <p className="text-2xl font-bold">Free Trial</p>
                        </div>
                        <Badge variant="success">Active</Badge>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm text-muted-foreground mb-1">
                            <span>Trial ends on {format(trialDetails.endDate, GLOBAL_DATE_FORMAT)}</span>
                            <span>{trialDetails.daysRemaining} days remaining</span>
                        </div>
                        <Progress value={trialDetails.progress} />
                    </div>
                </div>
                
                <Separator />

                <div className="space-y-4">
                    <h4 className="font-semibold">Usage this billing cycle</h4>
                    <div>
                        <div className="flex justify-between text-sm text-muted-foreground mb-1">
                            <span>Data Storage</span>
                            <span>{usageDetails.storage} GB / {usageDetails.storageLimit} GB used</span>
                        </div>
                        <Progress value={storageProgress} />
                        <p className="text-xs text-muted-foreground mt-1">
                            Your data storage includes all asset documents, job files, and final inspection reports.
                        </p>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm text-muted-foreground mb-1">
                            <span>Team Members</span>
                            <span>{usageDetails.users} / {usageDetails.userLimit} users</span>
                        </div>
                        <Progress value={userProgress} />
                        <p className="text-xs text-muted-foreground mt-1">
                            Your plan includes up to {usageDetails.userLimit} users. Contact us to add more.
                        </p>
                    </div>
                </div>

                <div className="text-sm text-muted-foreground">
                    <p>
                        Your 30-day free trial gives you full access to all platform features. Your subscription covers platform hosting costs, while data storage and user count are key components of our usage-based pricing. The Client (asset owner) is responsible for the data storage costs for all documents related to their jobs.
                    </p>
                     <p className="mt-2 font-semibold">
                       Note: NDT EXCHANGE does not process payments directly through the platform. Our team will work with you to handle invoicing and payment.
                    </p>
                </div>
            </CardContent>
            <CardFooter className="gap-2">
                 <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Link href={constructUrl("/dashboard/billing")}>Upgrade to a Paid Plan</Link>
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

    const isClient = role === 'client';
    const clientLogo = isClient ? logoPreview : 'https://placehold.co/120x40/f0f0f0/999999/png?text=Client+Logo';
    const providerLogo = !isClient ? logoPreview : 'https://placehold.co/200x80/FF6600/FFFFFF/png?text=TEAM';

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

                    {role === 'client' && (
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
                                {clientLogo ? <Image src={clientLogo} alt="Client Logo" width={120} height={40} className="object-contain h-10" /> : <div className="h-10 w-full" />}
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


export default function SettingsPage() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'client';
    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }
    
    const currentUser = useMemo(() => {
        return userDetails[role as keyof typeof userDetails] || userDetails.client;
    }, [role]);

    const companyDetails = useMemo(() => {
        if (role === 'client') return clientData.find(c => c.name === currentUser.company);
        if (role === 'inspector') return serviceProviders.find(p => p.name === currentUser.company);
        if (role === 'auditor') return auditFirms.find(a => a.name === currentUser.company);
        return null;
    }, [role, currentUser.company]);

    const subscription = useMemo(() => {
        return subscriptions.find(s => s.companyName === currentUser.company);
    }, [currentUser.company]);

    const isSubscriptionActive = subscription?.status === 'Active';

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: currentUser.name,
            email: currentUser.email,
        },
    });

    const onSubmit = (data: z.infer<typeof profileSchema>) => {
        toast({
            title: 'Profile Updated',
            description: 'Your profile information has been saved.',
        });
        console.log(data);
    };

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
          {(role === 'client' || role === 'inspector') && <TabsTrigger value="branding">Branding</TabsTrigger>}
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
                        <AvatarFallback className="text-4xl font-bold font-headline">{currentUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
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
                 <Button type="submit">Save Changes</Button>
              </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="company">
             <CompanyProfileSettings 
                companyDetails={companyDetails}
                isReadOnly={role === 'admin'}
                role={role}
            />
        </TabsContent>
        <TabsContent value="branding">
            <BrandingSettings companyName={currentUser.company} role={role} />
        </TabsContent>
        <TabsContent value="team">
              {role === 'admin' ? (
                <PlatformAdminTeamSettings />
              ) : isSubscriptionActive ? (
                <TeamManagementSettings user={currentUser} />
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
            <SubscriptionSettings />
        </TabsContent>
        <TabsContent value="notifications">
            <NotificationSettings role={role} />
        </TabsContent>
        <TabsContent value="appearance">
             <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize the look and feel of the application.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">The theme is automatically selected based on your user role. More appearance settings are coming soon.</p>
                </CardContent>
            </Card>
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
                            The following terminology applies to these Terms and Conditions, Privacy Statement and Disclaimer Notice and all Agreements: "Client", "You" and "Your" refers to you, the person log on this website and compliant to the Company’s terms and conditions. "The Company", "Ourselves", "We", "Our" and "Us", refers to our Company. "Party", "Parties", or "Us", refers to both the Client and ourselves.
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
                                NDT EXCHANGE acts as a neutral digital platform to connect asset owners (Clients) with NDT service providers. We are not a party to the actual service agreement between the Client and the Provider. Our role is strictly limited to providing the technology to facilitate this connection.
                            </p>
                            <p>
                                Therefore, we make no representations or warranties regarding the quality, accuracy, safety, or legality of the services provided or the reports generated by users on the platform. The responsibility for the inspection work, its results, and its conclusions lies solely with the service provider and the Client who engages them. Users are solely responsible for vetting and selecting appropriate counterparts.
                            </p>
                            
                            <h2 className="text-2xl font-headline text-foreground pt-4">5. Limitation of Liability</h2>
                            <p>
                            In no event shall NDT EXCHANGE, nor any of its officers, directors and employees, be held liable for anything arising out of or in any way connected with your use of this Website whether such liability is under contract. NDT EXCHANGE, including its officers, directors and employees shall not be held liable for any indirect, consequential or special liability arising out of or in any way related to your use of this Website.
                            </p>

                            <h2 className="text-2xl font-headline text-foreground pt-4">6. Financial Transactions</h2>
                            <p>
                              NDT EXCHANGE provides a platform to connect asset owners (Clients) with NDT service providers. While our platform facilitates this connection and the management of job workflows, we are not a party to any financial agreements or transactions between Clients and providers.
                            </p>
                            <p>
                              All payments for services rendered are to be handled directly between the Client and the service provider. NDT EXCHANGE does not process payments, handle invoices, or take a commission on jobs unless explicitly stated in a separate agreement. We are not responsible for any disputes related to payments, invoicing, or financial terms agreed upon between users of the platform.
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

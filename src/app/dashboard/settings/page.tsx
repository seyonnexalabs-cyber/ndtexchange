
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
import { useMemo, useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { allUsers } from '@/lib/placeholder-data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';


const userDetails = {
    client: { name: 'John Doe', role: 'Project Manager', email: 'john.d@globalenergy.corp', company: 'Global Energy Corp.', address: '123 Energy Corridor, Houston, TX 77079' },
    inspector: { name: 'Jane Smith', role: 'Level II Inspector', email: 'jane.s@acmeinspection.com', company: 'TEAM, Inc.', address: '1 Fluor Daniel Dr, Sugar Land, TX 77478' },
    admin: { name: 'Admin User', role: 'Platform Admin', email: 'admin@ndtexchange.com', company: 'NDT Exchange', address: '123 Main St, Palo Alto, CA' },
    auditor: { name: 'Alex Chen', role: 'Compliance Auditor', email: 'alex.c@ndtauditors.gov', company: 'NDT Auditors LLC', address: '456 Gov Ave, Washington, D.C.' },
};

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
});

const companyProfileSchema = z.object({
  companyName: z.string().min(3, 'Company name must be at least 3 characters.'),
  companyAddress: z.string().optional(),
});


const CompanyProfileSettings = ({ companyName, companyAddress, isReadOnly = false }: { companyName: string, companyAddress?: string, isReadOnly?: boolean }) => {
  const form = useForm<z.infer<typeof companyProfileSchema>>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      companyName: companyName,
      companyAddress: companyAddress || '',
    },
  });

  const onProfileSubmit = (data: z.infer<typeof companyProfileSchema>) => {
    toast({
      title: 'Company Profile Updated',
      description: 'Your company information has been saved.',
    });
    console.log(data);
  };

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
            {!isReadOnly && <Button type="submit">Save Changes</Button>}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

const TeamManagementSettings = ({ companyName }: { companyName: string }) => {
    const teamMembers = allUsers.filter(user => user.company === companyName);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Team Management</CardTitle>
                    <CardDescription>Manage users who have access to your company's account.</CardDescription>
                </div>
                <Button>Invite Member</Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {teamMembers.map(user => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback className="text-lg font-bold font-headline">{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    {user.name}
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Badge variant={user.status === 'Active' ? 'default' : 'secondary'}>{user.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                   <Button variant="ghost" size="sm">Manage</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};


const AdminTeamManagement = () => {
    const adminUsers = allUsers.filter(user => user.role.toLowerCase().includes('admin'));

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Admin Team Management</CardTitle>
                    <CardDescription>Manage users with administrative privileges on the platform.</CardDescription>
                </div>
                <Button>Invite Admin</Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {adminUsers.map(user => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback className="text-lg font-bold font-headline">{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    {user.name}
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Badge variant={user.status === 'Active' ? 'default' : 'secondary'}>{user.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                   <Button variant="ghost" size="sm">Manage</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
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

    useEffect(() => {
        // Use a fixed start date for consistent demonstration
        const trialStartDate = new Date('2024-07-01');
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

    return (
        <Card>
            <CardHeader>
                <CardTitle>Subscription & Billing</CardTitle>
                <CardDescription>
                    Manage your subscription plan and billing details.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                            <span>Trial ends on {format(trialDetails.endDate, "PPP")}</span>
                            <span>{trialDetails.daysRemaining} days remaining</span>
                        </div>
                        <Progress value={trialDetails.progress} />
                    </div>
                </div>
                <div className="text-sm text-muted-foreground">
                    <p>
                        Your 30-day free trial gives you full access to all platform features. After the trial period ends, you will be prompted to choose a paid plan to continue using the service. You can add a payment method at any time.
                    </p>
                </div>
            </CardContent>
            <CardFooter className="gap-2">
                <Button>Manage Subscription</Button>
                <Button variant="outline">View Billing History</Button>
            </CardFooter>
        </Card>
    );
};


export default function SettingsPage() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'client';
    
    const currentUser = useMemo(() => {
        const details = userDetails[role as keyof typeof userDetails] || userDetails.client;
        const address = (userDetails[role as keyof typeof userDetails] as any)?.address || '';
        return { ...details, address };
    }, [role]);

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
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
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
                companyName={currentUser.company} 
                companyAddress={currentUser.address} 
                isReadOnly={role === 'admin'}
            />
        </TabsContent>
        <TabsContent value="team">
            {role === 'admin' ? 
                <AdminTeamManagement /> : 
                <TeamManagementSettings companyName={currentUser.company} />
            }
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
      </Tabs>
    </div>
  );
}

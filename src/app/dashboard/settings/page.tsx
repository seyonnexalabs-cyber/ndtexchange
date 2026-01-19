'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { allUsers } from '@/lib/placeholder-data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';


const userDetails = {
    client: { name: 'John Doe', role: 'Project Manager', email: 'john.d@globalenergy.corp', avatar: 'user-avatar-client', fallback: 'JD', company: 'Global Energy Corp.' },
    inspector: { name: 'Jane Smith', role: 'Level II Inspector', email: 'jane.s@acmeinspection.com', avatar: 'user-avatar-inspector', fallback: 'JS', company: 'TEAM, Inc.' },
    admin: { name: 'Admin User', role: 'Platform Admin', email: 'admin@ndtexchange.com', avatar: 'user-avatar-admin', fallback: 'AU', company: 'NDT Exchange' },
    auditor: { name: 'Alex Chen', role: 'Compliance Auditor', email: 'alex.c@ndtauditors.gov', avatar: 'user-avatar-auditor', fallback: 'AC', company: 'NDT Auditors LLC' },
};

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
});

const companyProfileSchema = z.object({
  companyName: z.string().min(3, 'Company name must be at least 3 characters.'),
  companyAddress: z.string().optional(),
});


const ClientCompanyProfile = ({ companyName }: { companyName: string }) => {
  const form = useForm<z.infer<typeof companyProfileSchema>>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      companyName: companyName,
      companyAddress: '123 Energy Corridor, Houston, TX 77079', // Placeholder
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
                    <Input {...field} />
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
                    <Input {...field} />
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
  );
};

const ClientTeamManagement = ({ companyName }: { companyName: string }) => {
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
                                    <Avatar>
                                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
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
                                    <Avatar>
                                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
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
  const clientSettings = [
    { id: 'email-job-updates', label: 'Job Status Updates', description: 'Get notified when a job you posted is awarded, scheduled, or completed.' , defaultChecked: true},
    { id: 'email-new-bids', label: 'New Bids Received', description: 'Receive an email every time a provider places a bid on your job.' , defaultChecked: true},
    { id: 'email-report-submissions', label: 'Report Submissions', description: 'Get an email when an inspector submits a report for your review.' , defaultChecked: true},
    { id: 'email-messages-client', label: 'Direct Messages', description: 'Receive notifications for new messages from providers.' , defaultChecked: false},
  ];

  const inspectorSettings = [
    { id: 'email-new-jobs', label: 'New Job Opportunities', description: 'Get notified about new jobs that match your certified techniques.' , defaultChecked: true},
    { id: 'email-bid-status', label: 'Bid Status Updates', description: 'Receive an email when your bid is awarded or rejected.' , defaultChecked: true},
    { id: 'email-job-assignments', label: 'Job Assignments', description: 'Get notified when you are assigned to a scheduled job.' , defaultChecked: true},
    { id: 'email-messages-inspector', label: 'Direct Messages', description: 'Receive notifications for new messages from clients.' , defaultChecked: true},
  ];

  const adminSettings = [
    { id: 'email-new-users', label: 'New User Signups', description: 'Get notified when a new client or provider joins the platform.' , defaultChecked: true},
    { id: 'email-new-reviews', label: 'New Reviews for Moderation', description: 'Receive an email when a new review is submitted and needs approval.' , defaultChecked: true},
    { id: 'email-platform-alerts', label: 'Platform Health Alerts', description: 'Important system-level notifications.' , defaultChecked: true},
  ];
  
  const auditorSettings = [
    { id: 'email-audit-queue', label: 'New Reports for Audit', description: 'Get notified when a report is submitted and requires your audit.' , defaultChecked: true},
    { id: 'email-audit-approved', label: 'Audit Status Changes', description: 'Receive a notification when a client approves or rejects a report you audited.' , defaultChecked: false},
  ];

  let settings;
  switch (role) {
    case 'client':
      settings = clientSettings;
      break;
    case 'inspector':
      settings = inspectorSettings;
      break;
    case 'admin':
      settings = adminSettings;
      break;
    case 'auditor':
      settings = auditorSettings;
      break;
    default:
      settings = [];
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Email Notifications</CardTitle>
            <CardDescription>Manage how you receive email notifications for important platform events.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
             {settings.map(setting => (
                <div key={setting.id} className="flex items-start justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label htmlFor={setting.id} className="text-base">{setting.label}</Label>
                        <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                    <Switch id={setting.id} defaultChecked={setting.defaultChecked} className="mt-1" />
                </div>
             ))}
             {settings.length === 0 && <p className="text-muted-foreground">No specific email notifications for this role.</p>}
        </CardContent>
    </Card>
  );
};


export default function SettingsPage() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'client';
    
    const currentUser = useMemo(() => {
        return userDetails[role as keyof typeof userDetails] || userDetails.client;
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
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          {role === 'admin' && <TabsTrigger value="team">Team Management</TabsTrigger>}
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
                    <Avatar className="h-20 w-20">
                        <AvatarFallback>{currentUser.fallback}</AvatarFallback>
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
             {role === 'client' ? (
                <div className="space-y-6">
                    <ClientCompanyProfile companyName={currentUser.company} />
                    <ClientTeamManagement companyName={currentUser.company} />
                </div>
                ) : (
                <Card>
                    <CardHeader>
                    <CardTitle>Company Profile</CardTitle>
                    <CardDescription>Details about your affiliated company.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg font-semibold">{currentUser.company}</p>
                        <p className="text-muted-foreground">Company profile settings are managed by your account administrator.</p>
                    </CardContent>
                </Card>
            )}
        </TabsContent>
        <TabsContent value="notifications">
            <NotificationSettings role={role} />
        </TabsContent>
        {role === 'admin' && (
            <TabsContent value="team">
                <AdminTeamManagement />
            </TabsContent>
        )}
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

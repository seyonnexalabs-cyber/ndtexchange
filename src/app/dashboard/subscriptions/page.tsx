'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { subscriptions, Subscription, clientData } from "@/lib/placeholder-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Users, Database, MoreVertical, Mail } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import Link from 'next/link';

const statusStyles: { [key in Subscription['status']]: 'success' | 'default' | 'secondary' | 'destructive' | 'outline' } = {
    Active: 'success',
    Trialing: 'default',
    'Past Due': 'destructive',
    Canceled: 'outline',
    'Payment Failed': 'destructive',
};

const planUserLimits = {
    'Client': 10,
    'Provider': 50,
    'Enterprise': 200,
    'Free Trial': 5,
};

const planStorageLimits = {
    'Client': 20,
    'Provider': 100,
    'Enterprise': 500,
    'Free Trial': 5,
};

const getContactEmailForSubscription = (subscription: Subscription) => {
    const client = clientData.find(c => c.id === subscription.companyId);
    return client?.contactEmail || '';
};

const DesktopView = () => (
    <Card>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Data Usage</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {subscriptions.map(sub => {
                    const userLimit = planUserLimits[sub.plan];
                    const storageLimit = planStorageLimits[sub.plan];
                    const contactEmail = getContactEmailForSubscription(sub);

                    return (
                        <TableRow key={sub.id}>
                            <TableCell className="font-medium">{sub.companyName}</TableCell>
                            <TableCell>{sub.plan}</TableCell>
                            <TableCell><Badge variant={statusStyles[sub.status]}>{sub.status}</Badge></TableCell>
                            <TableCell>{sub.startDate}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <span>{sub.userCount} / {userLimit}</span>
                                    <Progress value={(sub.userCount / userLimit) * 100} className="w-20 h-2"/>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <span>{sub.dataUsageGB} / {storageLimit} GB</span>
                                    <Progress value={(sub.dataUsageGB / storageLimit) * 100} className="w-20 h-2"/>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                {sub.status === 'Payment Failed' && contactEmail ? (
                                    <Button asChild variant="destructive">
                                        <Link href={`mailto:${contactEmail}?subject=Action Required: Subscription Payment Failed for NDT Exchange&body=Dear ${sub.companyName} team,%0D%0A%0D%0AOur records indicate that the recent subscription payment for your NDT Exchange account has failed. To avoid any service interruption, please contact us to resolve this issue.%0D%0A%0D%0AThank you,%0D%0AThe NDT Exchange Team`}>
                                            <Mail className="mr-2 h-4 w-4" />
                                            Contact User
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button variant="ghost" size="sm">Manage</Button>
                                )}
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    </Card>
);

const MobileView = () => (
    <div className="space-y-4">
        {subscriptions.map(sub => {
            const userLimit = planUserLimits[sub.plan];
            const storageLimit = planStorageLimits[sub.plan];
            const contactEmail = getContactEmailForSubscription(sub);

            return (
                <Card key={sub.id}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <CardTitle>{sub.companyName}</CardTitle>
                            <Badge variant={statusStyles[sub.status]}>{sub.status}</Badge>
                        </div>
                        <CardDescription>{sub.plan} Plan - Started: {sub.startDate}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground flex items-center gap-1"><Users className="w-4 h-4" /> Users</span>
                                <span>{sub.userCount} / {userLimit}</span>
                            </div>
                            <Progress value={(sub.userCount / userLimit) * 100} className="h-2"/>
                        </div>
                         <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground flex items-center gap-1"><Database className="w-4 h-4" /> Data</span>
                                <span>{sub.dataUsageGB} / {storageLimit} GB</span>
                            </div>
                            <Progress value={(sub.dataUsageGB / storageLimit) * 100} className="h-2"/>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                         {sub.status === 'Payment Failed' && contactEmail ? (
                            <Button asChild variant="destructive" size="sm">
                                <Link href={`mailto:${contactEmail}?subject=Action Required: Subscription Payment Failed for NDT Exchange&body=Dear ${sub.companyName} team,%0D%0A%0D%0AOur records indicate that the recent subscription payment for your NDT Exchange account has failed. To avoid any service interruption, please contact us to resolve this issue.%0D%0A%0D%0AThank you,%0D%0AThe NDT Exchange Team`}>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Contact User
                                </Link>
                            </Button>
                        ) : (
                            <Button variant="ghost" size="sm">Manage Subscription</Button>
                        )}
                    </CardFooter>
                </Card>
            )
        })}
    </div>
);


export default function SubscriptionsPage() {
    const isMobile = useIsMobile();

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <DollarSign/>
                    Subscription Management
                </h1>
                <Button>Create Subscription</Button>
            </div>
            
            {isMobile ? <MobileView /> : <DesktopView />}

        </div>
    );
}

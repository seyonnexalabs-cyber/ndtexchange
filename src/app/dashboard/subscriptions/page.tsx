
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { subscriptions, Subscription, clientData, payments, Payment } from "@/lib/placeholder-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Users, Database, Mail } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from "react";

const subscriptionStatusStyles: { [key in Subscription['status']]: 'success' | 'default' | 'secondary' | 'destructive' | 'outline' } = {
    Active: 'success',
    Trialing: 'default',
    'Past Due': 'destructive',
    Canceled: 'outline',
    'Payment Failed': 'destructive',
};

const paymentStatusStyles: { [key in Payment['status']]: 'success' | 'destructive' } = {
    Succeeded: 'success',
    Failed: 'destructive',
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

const SubscriptionsDesktopView = () => (
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
                    const showContactButton = (sub.status === 'Payment Failed' || sub.status === 'Past Due') && contactEmail;

                    return (
                        <TableRow key={sub.id}>
                            <TableCell className="font-medium">{sub.companyName}</TableCell>
                            <TableCell>{sub.plan}</TableCell>
                            <TableCell><Badge variant={subscriptionStatusStyles[sub.status]}>{sub.status}</Badge></TableCell>
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
                                {showContactButton ? (
                                    <Button asChild variant="destructive">
                                        <Link href={`mailto:${contactEmail}?subject=Action Required: Subscription Payment for NDT Exchange&body=Dear ${sub.companyName} team,%0D%0A%0D%0AOur records indicate that your NDT Exchange subscription payment is currently ${sub.status.toLowerCase()}. To avoid any service interruption, please contact us to resolve this issue.%0D%0A%0D%0AThank you,%0D%0AThe NDT Exchange Team`}>
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

const SubscriptionsMobileView = () => (
    <div className="space-y-4">
        {subscriptions.map(sub => {
            const userLimit = planUserLimits[sub.plan];
            const storageLimit = planStorageLimits[sub.plan];
            const contactEmail = getContactEmailForSubscription(sub);
            const showContactButton = (sub.status === 'Payment Failed' || sub.status === 'Past Due') && contactEmail;

            return (
                <Card key={sub.id}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <CardTitle>{sub.companyName}</CardTitle>
                            <Badge variant={subscriptionStatusStyles[sub.status]}>{sub.status}</Badge>
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
                         {showContactButton ? (
                            <Button asChild variant="destructive" size="sm">
                                <Link href={`mailto:${contactEmail}?subject=Action Required: Subscription Payment for NDT Exchange&body=Dear ${sub.companyName} team,%0D%0A%0D%0AOur records indicate that your NDT Exchange subscription payment is currently ${sub.status.toLowerCase()}. To avoid any service interruption, please contact us to resolve this issue.%0D%0A%0D%0AThank you,%0D%0AThe NDT Exchange Team`}>
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

const PaymentHistoryDesktopView = () => (
    <Card>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Subscription ID</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {payments.map(payment => (
                    <TableRow key={payment.id}>
                        <TableCell>{payment.date}</TableCell>
                        <TableCell className="font-medium">{payment.companyName}</TableCell>
                        <TableCell>${payment.amount.toLocaleString()}</TableCell>
                        <TableCell><Badge variant={paymentStatusStyles[payment.status]}>{payment.status}</Badge></TableCell>
                        <TableCell className="font-mono text-xs">{payment.subscriptionId}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </Card>
);

const PaymentHistoryMobileView = () => (
    <div className="space-y-4">
        {payments.map(payment => (
            <Card key={payment.id}>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <CardTitle>{payment.companyName}</CardTitle>
                        <Badge variant={paymentStatusStyles[payment.status]}>{payment.status}</Badge>
                    </div>
                    <CardDescription>Payment on {payment.date}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">${payment.amount.toLocaleString()}</p>
                </CardContent>
            </Card>
        ))}
    </div>
);

export default function SubscriptionsPage() {
    const isMobile = useIsMobile();
    const [activeTab, setActiveTab] = useState("subscriptions");

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <DollarSign/>
                    Subscription Management
                </h1>
                {activeTab === 'subscriptions' && <Button>Create Subscription</Button>}
            </div>
            
            <Tabs defaultValue="subscriptions" onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
                    <TabsTrigger value="payment-history">Payment History</TabsTrigger>
                </TabsList>
                <TabsContent value="subscriptions">
                     {isMobile ? <SubscriptionsMobileView /> : <SubscriptionsDesktopView />}
                </TabsContent>
                <TabsContent value="payment-history">
                    {isMobile ? <PaymentHistoryMobileView /> : <PaymentHistoryDesktopView />}
                </TabsContent>
            </Tabs>

        </div>
    );
}

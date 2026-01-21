'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ShieldCheck, Building, HardHat, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

type UserType = 'client' | 'inspector' | 'auditor';
type InspectorPlan = 'operations' | 'marketplace';

export default function LoginPage() {
  const [userType, setUserType] = useState<UserType>('client');
  const [inspectorPlan, setInspectorPlan] = useState<InspectorPlan>('marketplace');
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    document.body.classList.remove('client-theme', 'inspector-theme', 'admin-theme', 'auditor-theme');
    const newTheme = `${userType}-theme`;
    document.body.classList.add(newTheme);
  }, [userType]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (agreedToTerms) {
      const params = new URLSearchParams();
      params.set('role', userType);
      if (userType === 'inspector') {
        params.set('plan', inspectorPlan);
      }
      router.push(`/dashboard?${params.toString()}`);
    }
  };

  const getTitle = () => {
    switch (userType) {
      case 'client':
        return 'Client Company Login';
      case 'inspector':
        return 'Service Provider Login';
      case 'auditor':
        return 'Audit Firm Login';
      default:
        return 'Login';
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background transition-all p-4">
      <div className={cn(
        "w-full max-w-md space-y-6 opacity-0 transition-opacity duration-500",
        isMounted && "opacity-100"
      )}>
        <div className="space-y-2 text-center">
            <div className="flex items-center justify-center gap-2 text-primary">
                <ShieldCheck className="w-10 h-10" />
                <h1 className="text-3xl font-headline font-bold">
                    NDT Exchange
                </h1>
            </div>
            <p className="text-muted-foreground">Select your role and sign in to your account</p>
        </div>
      
        <Card className="animate-in fade-in-0 zoom-in-95" style={{animationDuration: '500ms'}}>
            <CardHeader>
                <CardTitle className="text-2xl font-headline text-center">{getTitle()}</CardTitle>
            </CardHeader>
            <form onSubmit={handleLogin}>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                <Label>I am a...</Label>
                <RadioGroup
                    defaultValue="client"
                    className="grid grid-cols-3 gap-2"
                    onValueChange={(value: UserType) => setUserType(value)}
                >
                    <div>
                    <RadioGroupItem value="client" id="client" className="peer sr-only" />
                    <Label
                        htmlFor="client"
                        className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary text-xs h-full cursor-pointer transition-transform hover:scale-105"
                    >
                        <Building className="h-5 w-5" />
                        Client Company
                    </Label>
                    </div>
                    <div>
                    <RadioGroupItem value="inspector" id="inspector" className="peer sr-only" />
                    <Label
                        htmlFor="inspector"
                        className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary text-xs h-full cursor-pointer transition-transform hover:scale-105"
                    >
                        <HardHat className="h-5 w-5" />
                        Service Provider
                    </Label>
                    </div>
                    <div>
                    <RadioGroupItem value="auditor" id="auditor" className="peer sr-only" />
                    <Label
                        htmlFor="auditor"
                        className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary text-xs h-full cursor-pointer transition-transform hover:scale-105"
                    >
                        <Eye className="h-5 w-5" />
                        Audit Firm
                    </Label>
                    </div>
                </RadioGroup>
                </div>
                 {userType === 'inspector' && (
                    <div className="space-y-2 pt-2 animate-in fade-in-0 duration-300">
                        <Label>Select Your Plan</Label>
                        <RadioGroup
                            defaultValue={inspectorPlan}
                            className="grid grid-cols-2 gap-2"
                            onValueChange={(value: InspectorPlan) => setInspectorPlan(value)}
                        >
                            <div>
                                <RadioGroupItem value="operations" id="operations" className="peer sr-only" />
                                <Label
                                    htmlFor="operations"
                                    className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary text-xs h-full cursor-pointer"
                                >
                                    Operations Only
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="marketplace" id="marketplace" className="peer sr-only" />
                                <Label
                                    htmlFor="marketplace"
                                    className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary text-xs h-full cursor-pointer"
                                >
                                    Marketplace Access
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>
                )}
                <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" required />
                </div>
                <div className="space-y-2">
                <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link href="#" className="ml-auto inline-block text-sm underline">
                        Forgot your password?
                    </Link>
                </div>
                <Input id="password" type="password" required />
                </div>
                 <div className="flex items-start space-x-2">
                    <Checkbox id="terms" checked={agreedToTerms} onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)} className="mt-1" />
                    <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground">
                        I agree to the{' '}
                        <Link href="/terms" className="underline hover:text-primary">
                        Terms & Conditions
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="underline hover:text-primary">
                        Privacy Policy
                        </Link>
                        .
                    </Label>
                </div>
                <Button type="submit" className="w-full" disabled={!agreedToTerms}>
                    Sign In
                </Button>
                <div className="mt-4 text-center text-sm">
                    <span className="text-muted-foreground">
                        New users must be invited.
                    </span>
                    <Button variant="link" asChild className="p-1">
                        <Link href="/contact">
                            Contact Us
                        </Link>
                    </Button>
                </div>
            </CardContent>
            </form>
        </Card>
        <footer className="text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} NDT Exchange. All Rights Reserved.</p>
            <div className="flex gap-4 justify-center mt-2">
                <Link href="/terms" className="hover:text-foreground">Terms</Link>
                <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            </div>
        </footer>
      </div>
    </div>
  );
}

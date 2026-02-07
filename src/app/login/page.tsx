
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
    const params = new URLSearchParams();
    params.set('role', userType);
    if (userType === 'inspector') {
      params.set('plan', inspectorPlan);
    }
    router.push(`/dashboard?${params.toString()}`);
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
            <Link href="/" className="flex items-center justify-center gap-2 text-primary">
                <ShieldCheck className="w-10 h-10" />
                <h1 className="text-3xl font-headline font-bold">
                    NDT Exchange
                </h1>
            </Link>
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
                            className="grid grid-cols-2 gap-4"
                            onValueChange={(value: InspectorPlan) => setInspectorPlan(value)}
                        >
                            <div>
                                <RadioGroupItem value="operations" id="operations" className="peer sr-only" />
                                <Label
                                    htmlFor="operations"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary text-sm h-full cursor-pointer transition-transform hover:scale-105"
                                >
                                    <span className="font-bold text-center">Operations Only</span>
                                    <span className="text-xs text-center text-muted-foreground mt-2">Manage your team and equipment for internal jobs.</span>
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="marketplace" id="marketplace" className="peer sr-only" />
                                <Label
                                    htmlFor="marketplace"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary text-sm h-full cursor-pointer transition-transform hover:scale-105"
                                >
                                    <span className="font-bold text-center">Marketplace Access</span>
                                    <span className="text-xs text-center text-muted-foreground mt-2">Find and bid on public jobs from asset owners.</span>
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
                <Button type="submit" className="w-full">
                    Sign In
                </Button>
                <div className="mt-4 text-center text-sm">
                    <span className="text-muted-foreground">
                        Don't have an account?{' '}
                    </span>
                    <Button variant="link" asChild className="p-1">
                        <Link href="/signup">
                            Create an account
                        </Link>
                    </Button>
                </div>
            </CardContent>
            </form>
        </Card>
        <footer className="text-center text-sm text-muted-foreground">
            <Button variant="link" asChild>
                <Link href="/">Back to Homepage</Link>
            </Button>
        </footer>
      </div>
    </div>
  );
}

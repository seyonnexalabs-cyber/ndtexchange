'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type UserType = 'client' | 'inspector' | 'admin' | 'auditor';

export default function LoginPage() {
  const [userType, setUserType] = useState<UserType>('client');
  const [theme, setTheme] = useState('client-theme');
  const router = useRouter();

  useEffect(() => {
    document.body.classList.remove('client-theme', 'inspector-theme', 'admin-theme', 'auditor-theme');
    const newTheme = `${userType}-theme`;
    document.body.classList.add(newTheme);
    setTheme(newTheme);
  }, [userType]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/dashboard?role=${userType}`);
  };

  const getTitle = () => {
    switch (userType) {
      case 'client':
        return 'Client Portal';
      case 'inspector':
        return 'Inspector Hub';
      case 'admin':
        return 'Platform Administration';
      case 'auditor':
        return 'Auditor Console';
    }
  };

  return (
    <div className={`flex min-h-screen flex-col items-center justify-center bg-background transition-colors duration-300`}>
      <div className="absolute top-8 left-8 flex items-center gap-2 text-primary">
          <ShieldCheck className="w-8 h-8" />
          <h1 className="text-2xl font-headline font-bold">
              NDT Exchange
          </h1>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-center">{getTitle()}</CardTitle>
          <CardDescription className="text-center">Select your role and sign in to continue</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Select Role</Label>
              <RadioGroup
                defaultValue="client"
                className="grid grid-cols-4 gap-2"
                onValueChange={(value: UserType) => setUserType(value)}
              >
                <div>
                  <RadioGroupItem value="client" id="client" className="peer sr-only" />
                  <Label
                    htmlFor="client"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary text-xs h-full"
                  >
                    Client
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="inspector" id="inspector" className="peer sr-only" />
                  <Label
                    htmlFor="inspector"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary text-xs h-full"
                  >
                    Inspector
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="admin" id="admin" className="peer sr-only" />
                  <Label
                    htmlFor="admin"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary text-xs h-full"
                  >
                    Admin
                  </Label>
                </div>
                 <div>
                  <RadioGroupItem value="auditor" id="auditor" className="peer sr-only" />
                  <Label
                    htmlFor="auditor"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary text-xs h-full"
                  >
                    Auditor
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full">Sign In</Button>
            <div className="text-sm">
                Don&apos;t have an account?{' '}
                <Button variant="link" className="p-0 h-auto" asChild>
                    <Link href="#">Sign up</Link>
                </Button>
            </div>
            <Button variant="link" size="sm" className="text-muted-foreground !mt-0">
              Forgot your password?
            </Button>
          </CardFooter>
        </form>
      </Card>
       <footer className="absolute bottom-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} NDT Exchange. All Rights Reserved.</p>
        </footer>
    </div>
  );
}

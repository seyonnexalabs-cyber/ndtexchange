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
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type UserType = 'client' | 'inspector' | 'auditor';

export default function LoginPage() {
  const [userType, setUserType] = useState<UserType>('client');
  const router = useRouter();
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero');

  useEffect(() => {
    document.body.classList.remove('client-theme', 'inspector-theme', 'admin-theme', 'auditor-theme');
    const newTheme = `${userType}-theme`;
    document.body.classList.add(newTheme);
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
      case 'auditor':
        return 'Auditor Console';
      default:
        return 'Login';
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto w-[400px] space-y-6">
            <div className="space-y-2 text-center">
                <div className="flex items-center justify-center gap-2 text-primary">
                    <ShieldCheck className="w-10 h-10" />
                    <h1 className="text-3xl font-headline font-bold">
                        NDT Exchange
                    </h1>
                </div>
                <p className="text-muted-foreground">Select your role and sign in to your account</p>
            </div>
          
            <Card className="border-0 shadow-none sm:border sm:shadow-sm">
                 <CardHeader>
                    <CardTitle className="text-2xl font-headline text-center">{getTitle()}</CardTitle>
                </CardHeader>
                <form onSubmit={handleLogin}>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                    <Label>Select Role</Label>
                    <RadioGroup
                        defaultValue="client"
                        className="grid grid-cols-3 gap-2"
                        onValueChange={(value: UserType) => setUserType(value)}
                    >
                        <div>
                        <RadioGroupItem value="client" id="client" className="peer sr-only" />
                        <Label
                            htmlFor="client"
                            className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary text-xs h-full"
                        >
                            <Building className="h-5 w-5" />
                            Client
                        </Label>
                        </div>
                        <div>
                        <RadioGroupItem value="inspector" id="inspector" className="peer sr-only" />
                        <Label
                            htmlFor="inspector"
                            className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary text-xs h-full"
                        >
                            <HardHat className="h-5 w-5" />
                            Inspector
                        </Label>
                        </div>
                        <div>
                        <RadioGroupItem value="auditor" id="auditor" className="peer sr-only" />
                        <Label
                            htmlFor="auditor"
                            className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary text-xs h-full"
                        >
                            <Eye className="h-5 w-5" />
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
                    <div className="mt-4 text-center text-sm text-muted-foreground">
                        New users must be invited.
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
      <div className="hidden lg:block relative">
        {heroImage && (
            <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                data-ai-hint={heroImage.imageHint}
                fill
                className="object-cover"
                priority
            />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-10 left-10 text-white max-w-md">
            <h2 className="text-3xl font-bold">A Single Source of Truth</h2>
            <p className="mt-2 text-lg">Centralize your asset data, inspection reports, and compliance documentation in one secure, accessible platform.</p>
        </div>
      </div>
    </div>
  );
}

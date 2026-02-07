'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ShieldCheck, Building, HardHat, Eye } from 'lucide-react';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useIsMobile } from '@/hooks/use-mobile';

type UserType = 'client' | 'inspector' | 'auditor';
type InspectorPlan = 'operations' | 'marketplace';

export default function LoginPage() {
  const [userType, setUserType] = useState<UserType>('client');
  const [inspectorPlan, setInspectorPlan] = useState<InspectorPlan>('marketplace');
  const router = useRouter();
  const isMobile = useIsMobile();

  useEffect(() => {
    document.body.classList.remove('client-theme', 'inspector-theme', 'admin-theme', 'auditor-theme');
    document.body.classList.add(`${userType}-theme`);
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

  const heroImage = PlaceHolderImages.find(p => p.id === 'hero');

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="hidden bg-muted lg:block relative">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt="An industrial setting with a focus on metal structures, implying inspection and engineering."
            fill
            className="h-full w-full object-cover"
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-primary/40" />
        <div className="absolute bottom-10 left-10 text-primary-foreground">
          <h2 className="text-4xl font-bold font-headline">The Digital Marketplace for Asset Integrity</h2>
          <p className="mt-4 text-lg max-w-xl">Connecting asset owners with certified NDT professionals to ensure operational continuity and grow businesses.</p>
        </div>
      </div>
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-md gap-6">
          <div className="grid gap-2 text-center">
            <Link href="/" className="flex items-center justify-center gap-2 text-primary">
                <ShieldCheck className="w-8 h-8" />
                <h1 className="text-3xl font-headline font-bold">
                    NDT Exchange
                </h1>
            </Link>
            <p className="text-muted-foreground">
              Select your role and sign in to continue
            </p>
          </div>
          <form onSubmit={handleLogin} className="grid gap-6">
            <div className="grid gap-2">
              <Label>I am a...</Label>
              <RadioGroup
                  defaultValue="client"
                  className="grid grid-cols-3 gap-4"
                  onValueChange={(value: UserType) => setUserType(value)}
              >
                  <div>
                      <RadioGroupItem value="client" id="client" className="peer sr-only" />
                      <Label htmlFor="client" className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary text-xs h-full cursor-pointer transition-transform hover:scale-105">
                          <Building className="h-5 w-5" />
                          Client
                      </Label>
                  </div>
                  <div>
                      <RadioGroupItem value="inspector" id="inspector" className="peer sr-only" />
                      <Label htmlFor="inspector" className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary text-xs h-full cursor-pointer transition-transform hover:scale-105">
                          <HardHat className="h-5 w-5" />
                          Provider
                      </Label>
                  </div>
                  <div>
                      <RadioGroupItem value="auditor" id="auditor" className="peer sr-only" />
                      <Label htmlFor="auditor" className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary text-xs h-full cursor-pointer transition-transform hover:scale-105">
                          <Eye className="h-5 w-5" />
                          Auditor
                      </Label>
                  </div>
              </RadioGroup>
            </div>

            {userType === 'inspector' && (
                <div className="grid gap-2 animate-in fade-in-0 duration-300">
                    <Label>Select Your Plan</Label>
                    <RadioGroup
                        defaultValue={inspectorPlan}
                        className="grid grid-cols-2 gap-4"
                        onValueChange={(value: InspectorPlan) => setInspectorPlan(value)}
                    >
                        <div>
                            <RadioGroupItem value="operations" id="operations" className="peer sr-only" />
                            <Label htmlFor="operations" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary text-sm h-full cursor-pointer">
                                <span className="font-bold text-center">Operations Only</span>
                                <span className="text-xs text-center text-muted-foreground mt-2">Manage team & equipment</span>
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem value="marketplace" id="marketplace" className="peer sr-only" />
                            <Label htmlFor="marketplace" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary text-sm h-full cursor-pointer">
                                <span className="font-bold text-center">Marketplace Access</span>
                                <span className="text-xs text-center text-muted-foreground mt-2">Find & bid on public jobs</span>
                            </Label>
                        </div>
                    </RadioGroup>
                </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="#"
                  className="ml-auto inline-block text-sm underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
            {!isMobile && (
              <div className="text-center">
                  <Button variant="link" size="sm" asChild>
                      <Link href="/">Return to Homepage</Link>
                  </Button>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}

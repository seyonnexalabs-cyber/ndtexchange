
'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogoIcon } from '@/components/ui/icons';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useFirebase, useUser } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';

type UserType = 'client' | 'inspector' | 'auditor' | 'admin';

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
  role: z.enum(["client", "inspector", "auditor"]).optional(),
});

export default function LoginPage() {
  const router = useRouter();
  const { auth, firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (isUserLoading || !firestore || !user) return;

    const fetchUserRoleAndRedirect = async () => {
      let userData;
      try {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          userData = userDoc.data();
        } else {
           console.warn("User document not found for logged in user:", user.uid);
            toast({
              variant: 'destructive',
              title: 'Login Error',
              description: 'User profile not found. Please contact support.',
            });
            if (auth) auth.signOut();
            setIsAuthenticating(false);
            return;
        }

        if (userData) {
          const role = (userData.role as string).toLowerCase() as UserType;
          const params = new URLSearchParams();
          params.set('role', role);

          if (role === 'inspector' && (userData as any).plan === 'operations') {
              params.set('plan', 'operations');
          }

          router.push(`/dashboard?${params.toString()}`);
        } else {
          toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: 'User profile not found. Please contact support.',
          });
          setIsAuthenticating(false);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
         if (error instanceof Error && 'code' in error && (error as any).code.includes('permission-denied')) {
           toast({
              variant: 'destructive',
              title: 'Permission Denied',
              description: 'You do not have permission to access user profiles. Check your Firestore rules.',
          });
        } else {
          toast({
              variant: 'destructive',
              title: 'Login Error',
              description: 'Could not retrieve user profile.',
          });
        }
        setIsAuthenticating(false);
      }
    };

    fetchUserRoleAndRedirect();
  }, [user, isUserLoading, router, firestore, auth]);


  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    if (!auth) {
      toast({ variant: 'destructive', title: 'Login Failed', description: 'Authentication service not available.' });
      return;
    }
    setIsAuthenticating(true);

    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      // On success, the onAuthStateChanged listener in the FirebaseProvider
      // will update the user state, and the useEffect hook in this component
      // will handle the redirection.
    } catch (error: any) {
      // Provide a clear error message for failed login attempts.
      let description = "Invalid email or password. Please try again.";
      if (error.code === 'auth/too-many-requests') {
        description = "Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.";
      }
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: description,
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const devLogins = [
    { name: 'Client', email: 'john.d@globalenergy.corp', password: 'password123' },
    { name: 'Inspector', email: 'maria.garcia@teaminc.com', password: 'password123' },
    { name: 'Auditor', email: 'alex.c@ndtauditors.gov', password: 'password123' },
    { name: 'Admin', email: 'admin@ndtexchange.com', password: 'password123' },
    { name: 'Seyon', email: 'seyonnexalabs@gmail.com', password: 'password123' },
  ].filter(Boolean);

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="hidden lg:block relative bg-primary">
          <div className="absolute inset-0 z-0 opacity-10">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern 
                  id="honeycomb" 
                  x="0" 
                  y="0" 
                  width="56" 
                  height="97" 
                  patternUnits="userSpaceOnUse"
                  patternTransform="scale(1.5)"
                >
                  <path 
                    d="M28 0 L56 16.16 V48.5 L28 64.66 L0 48.5 V16.16 Z" 
                    fill="none" 
                    stroke="hsl(var(--primary-foreground))" 
                    strokeWidth="1"
                  />
                  <circle cx="28" cy="0" r="3" fill="hsl(var(--primary-foreground))" />
                  <circle cx="56" cy="16.16" r="3" fill="hsl(var(--primary-foreground))" />
                  <circle cx="56" cy="48.5" r="5" fill="hsl(var(--primary-foreground))" />
                  <circle cx="28" cy="64.66" r="3" fill="hsl(var(--primary-foreground))" />
                  <circle cx="0" cy="48.5" r="3" fill="hsl(var(--primary-foreground))" />
                  <circle cx="0" cy="16.16" r="6" fill="hsl(var(--primary-foreground))" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#honeycomb)" />
            </svg>
          </div>
          <div className="relative z-10 flex h-full flex-col justify-end p-10 text-primary-foreground">
            <h2 className="text-4xl font-bold font-headline">The Digital Marketplace for Asset Integrity</h2>
            <p className="mt-4 text-lg max-w-xl text-primary-foreground/80">Connecting asset owners with certified NDT professionals to ensure operational continuity and grow businesses.</p>
          </div>
        </div>
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-md gap-6">
          <div className="grid gap-2 text-center">
            <Link href="/" className="flex items-center justify-center gap-3">
              <LogoIcon className="h-14 w-auto text-primary" />
            </Link>
            <p className="text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="email">Email</Label>
                    <FormControl>
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      <Link
                        href="#"
                        className="ml-auto inline-block text-sm underline"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                    <div className="relative">
                        <FormControl>
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            className="pr-10"
                            {...field}
                        />
                        </FormControl>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:bg-transparent"
                            onClick={() => setShowPassword((prev) => !prev)}
                        >
                            {showPassword ? <EyeOff /> : <Eye />}
                            <span className="sr-only">
                                {showPassword ? 'Hide password' : 'Show password'}
                            </span>
                        </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isAuthenticating || isUserLoading}>
                {isAuthenticating || isUserLoading ? "Signing in..." : "Login"}
              </Button>
            </form>
          </Form>
           {process.env.NODE_ENV === 'development' && (
              <Card className="mt-6 border-dashed">
                <CardHeader>
                  <CardTitle className="text-base text-center">Quick Logins (Dev Only)</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-2">
                  {devLogins.map(devUser => (
                    <Button
                      key={devUser!.name}
                      variant="outline"
                      onClick={() => {
                        if (devUser?.email && devUser?.password) {
                          onSubmit({ email: devUser.email, password: devUser.password });
                        } else {
                          toast({
                            variant: "destructive",
                            title: "Developer Login Failed",
                            description: "Could not find credentials for this dev user.",
                          });
                        }
                      }}
                      disabled={isAuthenticating || isUserLoading}
                    >
                      {devUser!.name}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            )}
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

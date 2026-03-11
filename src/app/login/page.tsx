
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
import { doc, getDoc, setDoc, serverTimestamp, collection, writeBatch } from 'firebase/firestore';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { allUsers } from '@/lib/seed-data';
import type { PlatformUser } from '@/lib/types';
import HoneycombHero from '@/components/ui/honeycomb-hero';

type UserType = 'client' | 'inspector' | 'auditor' | 'admin' | 'manufacturer';

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
        let userDoc = await getDoc(userDocRef);

        if (!userDoc.exists() && process.env.NODE_ENV === 'development') {
          const seedUser = allUsers.find(u => u.email === user.email);

          if (seedUser) {
            // Found a matching dev user, use their data
            const { password, ...userDataToSave } = seedUser;
            const userProfileData = {
              ...userDataToSave,
              id: user.uid,
              createdAt: serverTimestamp(),
            };
            await setDoc(userDocRef, userProfileData);
            toast.info("Dev Profile Created", { description: `A profile for ${user.email} was created from seed data.` });
          } else {
            // No seed user found, create a generic one to unblock development
            const batch = writeBatch(firestore);

            const newCompanyName = `${user.email?.split('@')[0]}'s Company`;
            const companyRef = doc(collection(firestore, "companies"));
            
            const newCompanyData = {
                id: companyRef.id,
                name: newCompanyName,
                type: 'Client',
                contactPerson: user.displayName || user.email?.split('@')[0] || 'New User',
                contactEmail: user.email,
            };
            batch.set(companyRef, newCompanyData);

            const userProfileData: Partial<PlatformUser> = {
              id: user.uid,
              name: user.displayName || user.email?.split('@')[0] || 'New User',
              email: user.email!,
              role: 'Client',
              companyId: companyRef.id,
              company: newCompanyName,
              status: 'Active',
              createdAt: serverTimestamp(),
            };
            batch.set(userDocRef, userProfileData);

            await batch.commit();

            toast.info("Generic Profile Created", { description: `A placeholder profile and company were created for ${user.email}.` });
          }
          
          userDoc = await getDoc(userDocRef); // Re-fetch the document
        }

        if (userDoc.exists()) {
          userData = userDoc.data();
        } else {
            toast.error('Login Error', {
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
          toast.error('Login Failed', {
            description: 'User profile not found. Please contact support.',
          });
          setIsAuthenticating(false);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
         if (error instanceof Error && 'code' in error && (error as any).code.includes('permission-denied')) {
           toast.error('Permission Denied', {
              description: 'You do not have permission to access user profiles. Check your Firestore rules.',
          });
        } else {
          toast.error('Login Error', {
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
      toast.error('Login Failed', { description: 'Authentication service not available.' });
      return;
    }
    setIsAuthenticating(true);

    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      // On success, the onAuthStateChanged listener in the FirebaseProvider
      // will update the user state, and the useEffect hook in this component
      // will handle the redirection and profile creation if needed.
    } catch (error: any) {
      let description = "Invalid email or password. Please try again.";
      if (error.code === 'auth/too-many-requests') {
        description = "Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.";
      }
      toast.error('Login Failed', {
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
    { name: 'Manufacturer', email: 'oem.user@evident.com', password: 'password123' },
    { name: 'Admin', email: 'admin@ndtexchange.com', password: 'password123' },
    { name: 'Seyon', email: 'seyonnexalabs@gmail.com', password: 'password123' },
  ].filter(Boolean);

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="hidden lg:block">
        <HoneycombHero
          className="h-full py-0 md:py-0"
          contentContainerClassName="h-full flex flex-col justify-end items-start text-left p-10 max-w-full"
        >
          <div className="max-w-xl">
            <h2 className="text-4xl font-bold font-headline text-primary-foreground">The Digital Marketplace for Asset Integrity</h2>
            <p className="mt-4 text-lg max-w-xl text-primary-foreground/80">Connecting asset owners with certified NDT professionals to ensure operational continuity and grow businesses.</p>
          </div>
        </HoneycombHero>
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
                          toast.error("Developer Login Failed", {
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

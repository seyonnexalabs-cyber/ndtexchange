'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogoIcon } from '@/app/components/icons';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useFirebase, useUser } from '@/firebase';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { initiateEmailSignIn } from '@/firebase/non-blocking-login';
import { allUsers } from '@/lib/placeholder-data';
import { Eye, EyeOff } from 'lucide-react';

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
    if (isUserLoading || !firestore) return;

    if (user) {
      const fetchUserRoleAndRedirect = async () => {
        let userData;
        try {
          // First, try to get the user document with the Firebase Auth UID.
          // This is the standard and most secure way.
          const userDocRef = doc(firestore, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            userData = userDoc.data();
          } else {
            // If not found (which can happen in dev with seeded data),
            // fall back to looking up by email. This is less secure and should
            // only be a dev-time convenience.
            console.warn("User document not found with UID. Falling back to email lookup for development environment.");
            const usersRef = collection(firestore, "users");
            const q = query(usersRef, where("email", "==", user.email), limit(1));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
              const userDocFromEmail = querySnapshot.docs[0];
              userData = userDocFromEmail.data();
              console.log("Found user by email:", userData);
            }
          }

          if (userData) {
            const role = (userData.role as string).toLowerCase() as UserType;
            const params = new URLSearchParams();
            params.set('role', role);
            router.push(`/dashboard?${params.toString()}`);
          } else {
            // If user exists in Auth but not in Firestore (even after fallback)
            toast({
              variant: 'destructive',
              title: 'Login Failed',
              description: 'User profile not found. Please contact support.',
            });
            setIsAuthenticating(false);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          toast({
            variant: 'destructive',
            title: 'Login Error',
            description: 'Could not retrieve user profile.',
          });
          setIsAuthenticating(false);
        }
      };

      fetchUserRoleAndRedirect();
    } else {
      // If user is null and we are not loading, an authentication attempt might have just failed.
      if (isAuthenticating) {
        toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: 'Invalid email or password. Please try again.',
        });
        setIsAuthenticating(false);
      }
    }
  }, [user, isUserLoading, router, firestore, isAuthenticating]);


  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    setIsAuthenticating(true);
    initiateEmailSignIn(auth, data.email, data.password);
  };

  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-login');

  const devLogins = [
    allUsers.find(u => u.id === 'nxHzdOkwW6RLPWEgVvVbHyzN8OR2'), // client
    allUsers.find(u => u.id === 'NAXP822MG6cWlaCNkaqkYpxDRmQ2'), // inspector
    allUsers.find(u => u.id === 'gpx1kGbkuqQz0Fhmgfhyv4t3B3f2'), // auditor
    allUsers.find(u => u.id === 'JB5zgSrcKJX3dbNgPJmhlOcrUI62'), // admin
  ].filter(Boolean);

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="hidden bg-muted lg:block relative">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="h-full w-full object-cover"
            data-ai-hint={heroImage.imageHint}
            priority
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
                      key={devUser!.id}
                      variant="outline"
                      onClick={() => {
                        if (auth && devUser?.email && devUser?.password) {
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
                      {devUser!.role}
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

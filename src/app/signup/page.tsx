'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LogoIcon } from '@/app/components/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection } from 'firebase/firestore';
import type { PlatformUser } from '@/lib/placeholder-data';


const companySignupSchema = z.object({
  companyName: z.string().min(2, "Company name is required."),
  companyType: z.enum(["client", "inspector", "auditor"], { required_error: 'Please select a company type.' }),
  fullName: z.string().min(2, "Your full name is required."),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters."),
  agreedToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions.",
  }),
});

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { auth, firestore } = useFirebase();
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const form = useForm<z.infer<typeof companySignupSchema>>({
    resolver: zodResolver(companySignupSchema),
    defaultValues: {
      fullName: '',
      companyName: '',
      email: '',
      password: '',
      agreedToTerms: false,
    },
  });

  const onSubmit = async (data: z.infer<typeof companySignupSchema>) => {
    setIsSubmitting(true);
    if (!auth || !firestore) {
      toast({
        variant: "destructive",
        title: "Signup Error",
        description: "Firebase service is not available. Please try again later.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
        // 1. Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        const user = userCredential.user;

        // 2. Create Company document
        const companyRef = doc(collection(firestore, "companies")); // Creates a doc with a new auto-generated ID
        await setDoc(companyRef, {
            id: companyRef.id,
            name: data.companyName,
            type: data.companyType.charAt(0).toUpperCase() + data.companyType.slice(1),
            contactPerson: data.fullName,
            contactEmail: data.email,
        });

        // 3. Create User document
        const userRole = data.companyType.charAt(0).toUpperCase() + data.companyType.slice(1);
        const userDocRef = doc(firestore, "users", user.uid);
        
        const userProfile: Partial<PlatformUser> = {
            id: user.uid,
            name: data.fullName,
            email: data.email,
            role: userRole,
            companyId: companyRef.id, // Link user to the new company
            company: data.companyName,
            status: 'Active',
        };
        
        // Add provider-specific field if it's an inspector company
        if (data.companyType === 'inspector') {
            userProfile.providerId = companyRef.id;
        }

        await setDoc(userDocRef, userProfile);

        toast({
            title: "Account Created!",
            description: "Welcome to NDT EXCHANGE. Your company is onboarded, and you can now log in.",
        });
        router.push(`/login`);

    } catch (error: any) {
        let description = 'An unexpected error occurred. Please try again.';
        if (error.code === 'auth/email-already-in-use') {
            description = 'This email address is already in use. Please log in or use a different email.';
        }
        toast({
            variant: "destructive",
            title: "Signup Failed",
            description,
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background transition-all p-4">
      <div className={cn(
        "w-full max-w-md space-y-6 opacity-0 transition-opacity duration-500",
        isMounted && "opacity-100"
      )}>
        <div className="space-y-2 text-center">
            <Link href="/" className="flex items-center justify-center">
                <LogoIcon className="h-14 w-auto text-primary" />
            </Link>
            <p className="text-muted-foreground">Onboard your company to start your 14-day free trial.</p>
        </div>
      
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-headline text-center">Onboard Your Company</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="companyName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Company Name</FormLabel>
                                    <FormControl><Input placeholder="Your Company Inc." {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="companyType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Company Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select your company type" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="client">Client / Asset Owner</SelectItem>
                                            <SelectItem value="inspector">NDT Provider / Inspector</SelectItem>
                                            <SelectItem value="auditor">Auditor / Level-III</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Your Full Name</FormLabel>
                                    <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                                    <FormDescription>You will be the administrator for this company account.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Your Work Email</FormLabel>
                                    <FormControl><Input type="email" placeholder="you@company.com" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl><Input type="password" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                          control={form.control}
                          name="agreedToTerms"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md py-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-normal text-muted-foreground">
                                    I agree to the{' '}
                                    <Link href="/terms" className="underline hover:text-primary" target="_blank">
                                    Terms & Conditions
                                    </Link>{' '}
                                    and{' '}
                                    <Link href="/privacy" className="underline hover:text-primary" target="_blank">
                                    Privacy Policy
                                    </Link>
                                    .
                                </FormLabel>
                                <FormMessage />
                              </div>
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Creating Account..." : "Create Company Account"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
        <footer className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Button variant="link" asChild className="p-1">
                <Link href="/login">
                    Sign In
                </Link>
            </Button>
        </footer>
      </div>
    </div>
  );
}

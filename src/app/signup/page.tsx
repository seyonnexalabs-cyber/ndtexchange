
'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Snowflake } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NDTTechniques } from '@/lib/placeholder-data';
import { useFirebase, setDocumentNonBlocking } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc } from 'firebase/firestore';


const signupSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  companyName: z.string().min(2, "Company name is required."),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters."),
  role: z.enum(["client", "inspector", "auditor"], { required_error: 'Please select your primary role.' }),
  agreedToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions.",
  }),
  level: z.enum(["Level I", "Level II", "Level III"]).optional(),
  certifications: z.array(z.string()).optional(),
}).superRefine((data, ctx) => {
    if (data.role === 'inspector' || data.role === 'auditor') {
        if (!data.level) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['level'],
                message: 'Certification level is required for this role.',
            });
        }
        if (!data.certifications || data.certifications.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['certifications'],
                message: 'Please select at least one certification.',
            });
        }
    }
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
  
  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      companyName: '',
      email: '',
      password: '',
      agreedToTerms: false,
    },
  });

  const role = form.watch('role');

  const onSubmit = async (data: z.infer<typeof signupSchema>) => {
    setIsSubmitting(true);
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        const user = userCredential.user;

        const userProfile = {
            id: user.uid,
            name: data.fullName,
            email: data.email,
            company: data.companyName,
            role: data.role.charAt(0).toUpperCase() + data.role.slice(1),
            status: 'Active',
            certifications: data.certifications?.map(c => ({ method: c, level: data.level! })) || [],
            workStatus: 'Available',
            providerId: data.role === 'inspector' ? 'provider-temp-id' : undefined, // Placeholder
            level: data.level,
        };

        const userDocRef = doc(firestore, "users", user.uid);
        await setDocumentNonBlocking(userDocRef, userProfile, { merge: false });

        toast({
            title: "Account Created!",
            description: "Welcome to NDT Exchange. You can now log in.",
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
                <Snowflake className="h-14 w-auto text-indigo-500" />
            </Link>
            <p className="text-muted-foreground">Create your account to start your 14-day free trial.</p>
        </div>
      
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-headline text-center">Sign Up</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
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
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Your Role</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select your primary role" /></SelectTrigger></FormControl>
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

                        {(role === 'inspector' || role === 'auditor') && (
                            <>
                                <FormField
                                control={form.control}
                                name="level"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Certification Level</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select your highest certification level" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                        <SelectItem value="Level I">Level I</SelectItem>
                                        <SelectItem value="Level II">Level II</SelectItem>
                                        <SelectItem value="Level III">Level III</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <FormField
                                control={form.control}
                                name="certifications"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>NDT Certifications</FormLabel>
                                        <p className="text-sm text-muted-foreground">The level selected above will be applied to all checked methods.</p>
                                        <ScrollArea className="h-40 w-full rounded-md border p-4">
                                            {NDTTechniques.map((item) => (
                                            <FormField
                                                key={item.id}
                                                control={form.control}
                                                name="certifications"
                                                render={({ field }) => {
                                                return (
                                                    <FormItem
                                                    key={item.id}
                                                    className="flex flex-row items-center space-x-3 space-y-0 mb-3"
                                                    >
                                                    <FormControl>
                                                        <Checkbox
                                                        checked={field.value?.includes(item.id)}
                                                        onCheckedChange={(checked) => {
                                                            return checked
                                                            ? field.onChange([...(field.value || []), item.id])
                                                            : field.onChange(
                                                                field.value?.filter(
                                                                    (value) => value !== item.id
                                                                )
                                                                )
                                                        }}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        {item.name} ({item.id})
                                                    </FormLabel>
                                                    </FormItem>
                                                )
                                                }}
                                            />
                                            ))}
                                        </ScrollArea>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                />
                            </>
                        )}
                        
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
                            {isSubmitting ? "Creating Account..." : "Create Account"}
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

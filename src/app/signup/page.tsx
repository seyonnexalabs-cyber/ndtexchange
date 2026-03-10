
'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LogoIcon } from '@/components/ui/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection } from 'firebase/firestore';
import type { PlatformUser, Client, NDTServiceProvider, AuditFirm } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { countries } from '@/lib/countries';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';


const companySignupSchema = z.object({
  companyName: z.string().min(2, "Company name is required."),
  companyType: z.enum(["client", "inspector", "auditor", "manufacturer"], { required_error: 'Please select a company type.' }),
  fullName: z.string().min(2, "Your full name is required."),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters."),
  agreedToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions.",
  }),
  country: z.string({ required_error: "Please select your country." }),
  currency: z.enum(["USD", "EUR", "INR", "GBP"], { required_error: "Please select a currency." }),
});

export default function SignupPage() {
  const router = useRouter();
  const { auth, firestore } = useFirebase();
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [selectedCompany, setSelectedCompany] = useState<{ name: string; type: "client" | "inspector" | "auditor" | "manufacturer"; } | null>(null);
  const [suggestions, setSuggestions] = useState<{ name: string; type: "client" | "inspector" | "auditor" | "manufacturer"; }[]>([]);
  const companyInputRef = useRef<HTMLInputElement | null>(null);
  const suggestionsRef = useRef<HTMLDivElement | null>(null);

  const companiesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'companies') : null, [firestore]);
  const { data: companiesFromDb } = useCollection<Client | NDTServiceProvider | AuditFirm>(companiesQuery);

  useEffect(() => {
    setIsMounted(true);
    
    const handleClickOutside = (event: MouseEvent) => {
        if (
            companyInputRef.current && !companyInputRef.current.contains(event.target as Node) &&
            suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)
        ) {
            setSuggestions([]);
        }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const allCompanies = useMemo(() => {
    if (!companiesFromDb) return [];
    return companiesFromDb
      .filter(c => c && c.type)
      .map(c => ({
        name: c.name,
        type: c.type.toLowerCase() as "client" | "inspector" | "auditor" | "manufacturer"
    }));
  }, [companiesFromDb]);

  const form = useForm<z.infer<typeof companySignupSchema>>({
    resolver: zodResolver(companySignupSchema),
    defaultValues: {
      fullName: '',
      companyName: '',
      email: '',
      password: '',
      agreedToTerms: false,
      currency: 'USD',
    },
  });

  const onSubmit = async (data: z.infer<typeof companySignupSchema>) => {
    if (selectedCompany) {
      toast.error("Cannot Create Account", {
          description: "The selected company is already registered.",
      });
      return;
    }

    setIsSubmitting(true);
    if (!auth || !firestore) {
      toast.error("Signup Error", {
        description: "Firebase service is not available. Please try again later.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        const user = userCredential.user;

        const companyRef = doc(collection(firestore, "companies"));
        await setDoc(companyRef, {
            id: companyRef.id,
            name: data.companyName,
            type: data.companyType.charAt(0).toUpperCase() + data.companyType.slice(1),
            contactPerson: data.fullName,
            contactEmail: data.email,
            country: data.country,
            currency: data.currency,
        });

        const userRole = data.companyType.charAt(0).toUpperCase() + data.companyType.slice(1);
        const userDocRef = doc(firestore, "users", user.uid);
        
        const userProfile: Partial<PlatformUser> = {
            id: user.uid,
            name: data.fullName,
            email: data.email,
            role: userRole,
            companyId: companyRef.id,
            company: data.companyName,
            status: 'Active',
        };
        
        if (data.companyType === 'inspector') {
            userProfile.providerId = companyRef.id;
        }

        await setDoc(userDocRef, userProfile);

        toast.success("Account Created!", {
            description: "Welcome to NDT EXCHANGE. Your company is onboarded, and you can now log in.",
        });
        router.push(`/login`);

    } catch (error: any) {
        let description = 'An unexpected error occurred. Please try again.';
        if (error.code === 'auth/email-already-in-use') {
            description = 'This email address is already in use. Please log in or use a different email.';
        }
        toast.error("Signup Failed", {
            description,
        });
    } finally {
        setIsSubmitting(false);
    }
  };

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
                                render={({ field }) => {
                                    const { ref, ...fieldProps } = field;
                                    return (
                                    <FormItem>
                                        <FormLabel>Company Name</FormLabel>
                                        <div className="relative">
                                            <FormControl>
                                                <Input
                                                    ref={(node) => {
                                                        companyInputRef.current = node;
                                                        if (typeof field.ref === 'function') {
                                                            field.ref(node);
                                                        }
                                                    }}
                                                    placeholder="Start typing your company name..."
                                                    {...fieldProps}
                                                    onChange={(e) => {
                                                        field.onChange(e);
                                                        const search = e.target.value;
                                                        if (selectedCompany) setSelectedCompany(null);
                                                        
                                                        if (search.length >= 2) {
                                                            const filtered = allCompanies.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
                                                            setSuggestions(filtered);
                                                        } else {
                                                            setSuggestions([]);
                                                        }
                                                    }}
                                                />
                                            </FormControl>
                                            {suggestions.length > 0 && (
                                                <div ref={suggestionsRef} className="absolute z-10 w-full bg-popover text-popover-foreground shadow-md rounded-md border mt-1">
                                                    {suggestions.map((company) => (
                                                        <button
                                                            key={company.name}
                                                            type="button"
                                                            className="w-full text-left p-2 rounded-sm text-sm hover:bg-accent"
                                                            onMouseDown={(e) => {
                                                                e.preventDefault();
                                                                form.setValue("companyName", company.name);
                                                                form.setValue("companyType", company.type);
                                                                setSelectedCompany(company);
                                                                setSuggestions([]);
                                                            }}
                                                        >
                                                            {company.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <FormDescription>
                                            If your company is already registered, please contact your administrator for an invitation.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                );
                            }}
                            />

                             {selectedCompany && (
                                <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Company Already Registered</AlertTitle>
                                    <AlertDescription>
                                        <strong>{selectedCompany.name}</strong> is already on NDT EXCHANGE. You cannot create a duplicate company. If you work for this company, please contact your administrator to receive an invitation.
                                    </AlertDescription>
                                </Alert>
                            )}
                            
                            <FormField
                                control={form.control}
                                name="companyType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Company Type</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={!!selectedCompany}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select your company type" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="client">Client / Asset Owner</SelectItem>
                                                <SelectItem value="inspector">NDT Provider / Inspector</SelectItem>
                                                <SelectItem value="auditor">Auditor / Level-III</SelectItem>
                                                <SelectItem value="manufacturer">Manufacturer / OEM</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                  control={form.control}
                                  name="country"
                                  render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>Country</FormLabel>
                                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!selectedCompany}>
                                              <FormControl><SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger></FormControl>
                                              <SelectContent>
                                                  {countries.map(c => <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>)}
                                              </SelectContent>
                                          </Select>
                                          <FormMessage />
                                      </FormItem>
                                  )}
                              />
                              <FormField
                                  control={form.control}
                                  name="currency"
                                  render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>Currency</FormLabel>
                                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!selectedCompany}>
                                              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                              <SelectContent>
                                                  <SelectItem value="USD">USD ($)</SelectItem>
                                                  <SelectItem value="EUR">EUR (€)</SelectItem>
                                                  <SelectItem value="INR">INR (₹)</SelectItem>
                                                  <SelectItem value="GBP">GBP (£)</SelectItem>
                                              </SelectContent>
                                          </Select>
                                          <FormMessage />
                                      </FormItem>
                                  )}
                              />
                            </div>
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Your Full Name</FormLabel>
                                        <FormControl><Input placeholder="John Doe" {...field} disabled={!!selectedCompany} /></FormControl>
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
                                        <FormControl><Input type="email" placeholder="you@company.com" {...field} disabled={!!selectedCompany} /></FormControl>
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
                                        <div className="relative">
                                            <FormControl>
                                                <Input
                                                type={showPassword ? 'text' : 'password'}
                                                className="pr-10"
                                                {...field}
                                                disabled={!!selectedCompany}
                                                />
                                            </FormControl>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:bg-transparent"
                                                onClick={() => setShowPassword((prev) => !prev)}
                                                disabled={!!selectedCompany}
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
                            <FormField
                            control={form.control}
                            name="agreedToTerms"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md py-2">
                                <FormControl>
                                    <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={!!selectedCompany}
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
                            <Button type="submit" className="w-full" disabled={isSubmitting || !!selectedCompany}>
                                {isSubmitting ? "Creating Account..." : "Create Company Account"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
            <div className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Button variant="link" asChild className="p-1">
                    <Link href="/login">
                        Sign In
                    </Link>
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}

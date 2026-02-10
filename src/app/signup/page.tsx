
'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
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
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { clientData } from '@/lib/placeholder-data';
import { serviceProviders } from '@/lib/service-providers-data';
import { auditFirms } from '@/lib/auditors-data';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';


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
  
  const [selectedCompany, setSelectedCompany] = useState<{ name: string; type: "client" | "inspector" | "auditor"; } | null>(null);
  const [suggestions, setSuggestions] = useState<{ name: string; type: "client" | "inspector" | "auditor"; }[]>([]);
  const [isSuggestionsOpen, setSuggestionsOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const allCompanies = useMemo(() => [
      ...clientData.map(c => ({ name: c.name, type: 'client' as const })),
      ...serviceProviders.map(p => ({ name: p.name, type: 'inspector' as const })),
      ...auditFirms.map(a => ({ name: a.name, type: 'auditor' as const }))
  ], []);

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
    if (selectedCompany) {
      toast({
          variant: "destructive",
          title: "Cannot Create Account",
          description: "The selected company is already registered.",
      });
      return;
    }

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
  
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-signup');

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="hidden bg-muted lg:block relative">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt="A modern doorway, symbolizing a new opportunity."
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
                                        <Popover open={isSuggestionsOpen} onOpenChange={setSuggestionsOpen}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Start typing your company name..."
                                                        {...field}
                                                        onChange={(e) => {
                                                            field.onChange(e);
                                                            const search = e.target.value;
                                                            if (selectedCompany) setSelectedCompany(null);
                                                            
                                                            if (search.length >= 2) {
                                                                const filtered = allCompanies.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
                                                                setSuggestions(filtered);
                                                                setSuggestionsOpen(filtered.length > 0);
                                                            } else {
                                                                setSuggestions([]);
                                                                setSuggestionsOpen(false);
                                                            }
                                                        }}
                                                    />
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent 
                                                className="w-[--radix-popover-trigger-width] p-0" 
                                                onOpenAutoFocus={(e) => e.preventDefault()}
                                            >
                                                <Command>
                                                    <CommandList>
                                                        <CommandEmpty>No existing company found. You can create a new one.</CommandEmpty>
                                                        <CommandGroup>
                                                            {suggestions.map((company) => (
                                                            <CommandItem
                                                                key={company.name}
                                                                onSelect={() => {
                                                                    form.setValue("companyName", company.name);
                                                                    form.setValue("companyType", company.type);
                                                                    setSelectedCompany(company);
                                                                    setSuggestionsOpen(false);
                                                                }}
                                                            >
                                                                {company.name}
                                                            </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <FormDescription>
                                            If your company is already registered, please contact your administrator for an invitation.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
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
                                        <FormControl><Input type="password" {...field} disabled={!!selectedCompany} /></FormControl>
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

'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck } from 'lucide-react';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useIsMobile } from '@/hooks/use-mobile';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type UserType = 'client' | 'inspector' | 'auditor';

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
  role: z.enum(["client", "inspector", "auditor"]).optional(),
});

export default function LoginPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', role: 'client' },
  });

  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    // In a real app, this would involve an API call to an authentication service.
    let role: UserType;
    
    // Dev mode allows role selection, otherwise determine from email
    if (process.env.NODE_ENV === 'development' && data.role) {
      role = data.role;
    } else {
      // For this prototype, we'll determine the role based on the email address.
      role = 'client'; // Default to client

      if (data.email.includes('inspector') || data.email.includes('teaminc')) {
          role = 'inspector';
      } else if (data.email.includes('auditor')) {
          role = 'auditor';
      }
    }

    if (data.email.includes('admin')) {
        // Redirect admins to the dedicated admin login
        router.push('/admin');
        return;
    }

    const params = new URLSearchParams();
    params.set('role', role);
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
                    <FormControl>
                      <Input id="password" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {process.env.NODE_ENV === 'development' && (
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role (Dev Mode)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role to login as" />
                          </SelectTrigger>
                        </FormControl>
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
              )}
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </Form>
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

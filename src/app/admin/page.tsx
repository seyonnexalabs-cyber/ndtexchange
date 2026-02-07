'use client';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useIsMobile } from '@/hooks/use-mobile';

export default function AdminLoginPage() {
  const router = useRouter();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Apply admin theme
    document.body.classList.remove('client-theme', 'inspector-theme', 'auditor-theme');
    document.body.classList.add('admin-theme');
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/dashboard?role=admin`);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background transition-colors duration-300">
      <div className="absolute top-8 left-8 flex items-center gap-2 text-primary">
          <ShieldCheck className="w-8 h-8" />
          <h1 className="text-2xl font-headline font-bold">
              NDT Exchange
          </h1>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-center flex items-center justify-center gap-2"><Shield className="text-primary" /> Platform Administration</CardTitle>
          <CardDescription className="text-center">Admin access only</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="admin@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full">Sign In</Button>
            {!isMobile && (
                <Button variant="link" size="sm" className="text-muted-foreground !mt-2" asChild>
                    <Link href="/">Return to Homepage</Link>
                </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

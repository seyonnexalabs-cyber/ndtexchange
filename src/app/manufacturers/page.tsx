'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This page has been renamed to /ecosystem.
// It now serves as a redirect to maintain URL consistency.
export default function ManufacturersRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace(`/ecosystem?tab=manufacturers`);
    }, [router]);

    return (
        <div className="text-center p-10">
            <h1 className="text-2xl font-headline">Redirecting...</h1>
            <p className="mt-4 text-muted-foreground">The manufacturers directory has been moved to our new Ecosystem hub. You are being redirected.</p>
        </div>
    );
}

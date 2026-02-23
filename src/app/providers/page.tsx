'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

// This page has been consolidated into the new /manufacturers hub.
// It now serves as a redirect to maintain URL consistency during the transition.
export default function ProvidersRedirectPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', 'providers');
        router.replace(`/manufacturers?${params.toString()}`);
    }, [router, searchParams]);

    return (
        <div className="text-center p-10">
            <h1 className="text-2xl font-headline">Redirecting...</h1>
            <p className="mt-4 text-muted-foreground">The providers directory has been moved. You are being redirected.</p>
        </div>
    );
}

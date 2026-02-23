'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

// This page has been consolidated into the new /ecosystem hub.
// It now serves as a redirect to maintain URL consistency during the transition.
export default function AuditorsRedirectPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', 'auditors');
        router.replace(`/ecosystem?${params.toString()}`);
    }, [router, searchParams]);

    return (
        <div className="text-center p-10">
            <h1 className="text-2xl font-headline">Redirecting...</h1>
            <p className="mt-4 text-muted-foreground">The auditors directory has been moved to our new Ecosystem hub. You are being redirected.</p>
        </div>
    );
}

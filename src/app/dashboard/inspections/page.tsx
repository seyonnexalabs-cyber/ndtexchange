'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

// This page is being consolidated into the main /dashboard/reports page.
// It now serves as a redirect to maintain URL consistency during the transition.
export default function InspectionsRedirectPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        router.replace(`/dashboard/reports?${params.toString()}`);
    }, [router, searchParams]);

    return (
        <div className="text-center p-10">
            <h1 className="text-2xl font-headline">Redirecting...</h1>
            <p className="mt-4 text-muted-foreground">The inspections page has been merged with reports. You are being redirected.</p>
        </div>
    );
}

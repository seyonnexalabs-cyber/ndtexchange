'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This page is now deprecated in favor of the consolidated My Projects page.
// It will redirect users to the correct location.
export default function DeprecatedJobsMarketplacePage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to the new unified "My Projects" page
        router.replace('/dashboard/my-jobs');
    }, [router]);

    return (
        <div className="text-center p-10">
            <h1 className="text-2xl font-headline">Redirecting...</h1>
            <p className="mt-4 text-muted-foreground">The project marketplace has been moved. You are being redirected.</p>
        </div>
    );
}

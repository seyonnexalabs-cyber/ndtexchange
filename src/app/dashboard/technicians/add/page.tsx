
'use client';

// This page is now deprecated. Adding a technician is handled via a dialog
// on the main /dashboard/technicians page.
// This file can be safely deleted in the future.

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DeprecatedAddTechnicianPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/dashboard/technicians');
    }, [router]);

    return (
        <div className="text-center p-10">
            <h1 className="text-2xl font-headline">Redirecting...</h1>
            <p className="mt-4 text-muted-foreground">This page has been moved. You are being redirected.</p>
        </div>
    );
}

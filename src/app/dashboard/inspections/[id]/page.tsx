'use client';

import { useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';

// This page is deprecated and redirects to the new reports page.
export default function DeprecatedInspectionDetailPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const id = params.id as string;

    useEffect(() => {
        const newPath = `/dashboard/reports/${id}`;
        
        const newParams = new URLSearchParams();
        const role = searchParams.get('role');
        const plan = searchParams.get('plan');
        if (role) newParams.set('role', role);
        if (plan) newParams.set('plan', plan);

        const queryString = newParams.toString();
        router.replace(queryString ? `${newPath}?${queryString}` : newPath);
    }, [id, router, searchParams]);

    return (
        <div className="text-center p-10">
            <h1 className="text-2xl font-headline">Redirecting...</h1>
            <p className="mt-4 text-muted-foreground">You are being redirected to the new report page.</p>
        </div>
    );
}

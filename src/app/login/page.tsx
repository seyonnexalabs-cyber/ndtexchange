
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This page is now redundant as the login page is the root of the application.
// This component will redirect any users visiting /login to the homepage.
export default function LoginPageRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/');
    }, [router]);

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background">
            <p>Redirecting...</p>
        </div>
    );
}

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminDashboardRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('role', 'admin');
    router.replace(`/dashboard?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Redirecting to the admin dashboard...</p>
    </div>
  );
}

'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const role = searchParams.get('role');

  useEffect(() => {
    document.body.classList.remove('client-theme', 'inspector-theme', 'admin-theme', 'auditor-theme');
    if (role) {
      document.body.classList.add(`${role}-theme`);
    } else {
      document.body.classList.add('client-theme'); // Default theme
    }
  }, [role]);

  return <>{children}</>;
}

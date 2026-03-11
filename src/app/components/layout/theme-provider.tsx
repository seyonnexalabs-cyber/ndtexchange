'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';

type RoleType = 'client' | 'inspector' | 'auditor' | 'admin' | 'manufacturer';
const themeRoles: RoleType[] = ['client', 'inspector', 'auditor', 'admin', 'manufacturer'];

const normalizeRole = (value: string | null | undefined): RoleType | undefined => {
  if (!value) return undefined;
  const normalized = value.toLowerCase().trim();
  if (themeRoles.includes(normalized as RoleType)) {
    return normalized as RoleType;
  }
  if (normalized === 'provider') return 'inspector';
  if (normalized === 'customer') return 'client';
  return undefined;
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const [resolvedRole, setResolvedRole] = useState<RoleType>('client');
  const roleFromQuery = normalizeRole(searchParams.get('role'));

  const { firestore, user } = useFirebase();

  const userDocRef = useMemo(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userProfile } = useDoc<{ role?: string }>(userDocRef);

  // Resolve role from query, authenticated user profile, localStorage, or default.
  useEffect(() => {
    if (roleFromQuery) {
      setResolvedRole(roleFromQuery);
      return;
    }

    const roleFromProfile = normalizeRole(userProfile?.role ?? null);
    if (roleFromProfile) {
      setResolvedRole(roleFromProfile);
      return;
    }

    const storedRole = typeof window !== 'undefined' ? localStorage.getItem('role-theme') : null;
    const normalizedStoredRole = normalizeRole(storedRole);
    if (normalizedStoredRole) {
      setResolvedRole(normalizedStoredRole);
      return;
    }

    setResolvedRole('client');
  }, [roleFromQuery, userProfile]);

  useEffect(() => {
    const themeClass = `${resolvedRole}-theme`;
    const allRoleClasses = ['client-theme', 'inspector-theme', 'auditor-theme', 'admin-theme', 'manufacturer-theme'];

    document.body.classList.remove(...allRoleClasses);
    document.body.classList.add(themeClass);

    if (typeof window !== 'undefined') {
      localStorage.setItem('role-theme', resolvedRole);
    }
  }, [resolvedRole]);

  return <>{children}</>;
}

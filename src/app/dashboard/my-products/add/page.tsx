// This page has been replaced by the dynamic route /dashboard/my-products/[id]/page.tsx
// This file can be safely deleted.
import { redirect } from 'next/navigation';

export default function DeprecatedAddProductPage() {
    redirect('/dashboard/my-products');
    return null;
}

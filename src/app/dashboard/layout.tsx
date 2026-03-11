
'use client';

import AppSidebar from '@/components/layout/sidebar';
import AppHeader from '@/app/components/layout/header';
import { SearchProvider } from '@/app/components/layout/search-provider';
import { QRScannerProvider } from '@/app/components/layout/qr-scanner-provider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SearchProvider>
      <QRScannerProvider>
        <div className="grid h-screen w-full overflow-hidden md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r bg-background md:block">
              <AppSidebar />
            </div>
            <div className="flex flex-col overflow-hidden">
              <AppHeader />
              <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                {children}
              </main>
            </div>
        </div>
      </QRScannerProvider>
    </SearchProvider>
  );
}


'use client';

import AppSidebar from '@/app/components/layout/sidebar';
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
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r bg-card md:block">
              <AppSidebar />
            </div>
            <div className="flex flex-col">
              <AppHeader />
              <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6 overflow-auto">
                {children}
              </main>
            </div>
        </div>
      </QRScannerProvider>
    </SearchProvider>
  );
}

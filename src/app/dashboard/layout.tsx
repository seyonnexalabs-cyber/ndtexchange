import type { Metadata } from 'next';
import AppSidebar from '@/app/components/layout/sidebar';
import AppHeader from '@/app/components/layout/header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SearchProvider } from '@/app/components/layout/search-provider';
import { JobPostProvider } from '@/app/dashboard/my-jobs/job-post-provider';
import { QRScannerProvider } from '@/app/components/layout/qr-scanner-provider';

export const metadata: Metadata = {
  title: 'Dashboard | NDT Exchange',
  description: 'Manage your NDT operations.',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SearchProvider>
      <JobPostProvider>
        <QRScannerProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <AppHeader />
              <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>
        </QRScannerProvider>
      </JobPostProvider>
    </SearchProvider>
  );
}

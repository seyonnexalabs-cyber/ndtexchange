import AppSidebar from '@/app/components/layout/sidebar';
import AppHeader from '@/app/components/layout/header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
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
        <SidebarProvider defaultOpen={false}>
          <AppSidebar />
          <SidebarInset>
            <AppHeader />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </QRScannerProvider>
    </SearchProvider>
  );
}

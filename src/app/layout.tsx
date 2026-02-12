
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from 'react';
import { ThemeProvider } from '@/app/components/layout/theme-provider';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import CookieConsent from '@/app/components/cookie-consent';


export const metadata: Metadata = {
  title: {
    default: 'NDT EXCHANGE | The Digital Marketplace for Asset Integrity',
    template: '%s | NDT EXCHANGE',
  },
  description: 'NDT EXCHANGE is a purpose-built digital ecosystem connecting asset owners with certified NDT professionals. Streamline procurement, manage assets, and grow your NDT business.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="application-name" content="NDT EXCHANGE" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="NDT EXCHANGE" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#3B82F6" />
        <link rel="manifest" href="/manifest.json" crossOrigin="use-credentials" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <Suspense fallback={<div>Loading...</div>}>
          <FirebaseClientProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </FirebaseClientProvider>
        </Suspense>
        <Toaster />
        <CookieConsent />
      </body>
    </html>
  );
}

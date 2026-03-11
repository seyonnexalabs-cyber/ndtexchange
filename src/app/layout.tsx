
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/sonner";
import { Suspense } from 'react';
import { ThemeProvider } from '@/app/components/layout/theme-provider';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import CookieConsent from '@/app/components/cookie-consent';
import { ModeProvider } from '@/app/components/layout/mode-provider';
import { Inter, Audiowide } from 'next/font/google';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal'],
  variable: '--font-body',
});

const audiowide = Audiowide({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-headline',
});


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
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${audiowide.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="NDT EXCHANGE" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="NDT EXCHANGE" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#3B82F6" />
      </head>
      <body className="font-body antialiased text-sm">
        <Suspense fallback={<div>Loading...</div>}>
          <FirebaseClientProvider>
            <ModeProvider>
              <ThemeProvider>
                {children}
              </ThemeProvider>
              <Toaster richColors />
            </ModeProvider>
            <FirebaseErrorListener />
          </FirebaseClientProvider>
        </Suspense>
        <CookieConsent />
      </body>
    </html>
  );
}

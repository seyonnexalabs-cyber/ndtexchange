'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Cookie } from 'lucide-react';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // This effect runs once on the client to indicate the component has mounted.
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // This effect runs only after the component has mounted on the client.
    if (isMounted) {
      try {
        const consent = localStorage.getItem('cookie_consent');
        if (consent !== 'true') {
          setShowBanner(true);
        }
      } catch (e) {
        console.error("Could not access localStorage:", e);
      }
    }
  }, [isMounted]);

  const acceptConsent = () => {
    try {
      localStorage.setItem('cookie_consent', 'true');
      setShowBanner(false);
    } catch (e) {
      console.error("Could not set localStorage:", e);
    }
  };

  // By checking for isMounted, we ensure this component renders nothing on the server
  // and on the initial client render, preventing any hydration mismatch.
  if (!isMounted || !showBanner) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 print-hidden">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-lg border bg-card text-card-foreground shadow-lg p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <Cookie className="h-8 w-8 text-primary shrink-0 mt-1 hidden sm:block" />
            <div>
                <h3 className="font-semibold">We Value Your Privacy</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                    Read our{' '}
                    <Link href="/privacy" className="underline hover:text-primary">
                    Privacy Policy
                    </Link>
                    .
                </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0 w-full md:w-auto">
            <Button className="flex-1" onClick={acceptConsent}>Accept All</Button>
            <Button variant="outline" className="flex-1" onClick={acceptConsent}>Decline</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

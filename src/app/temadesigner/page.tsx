'use client';
import PublicHeader from '@/app/components/layout/public-header';
import TemaDesigner from '@/app/components/temadesigner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function TemaDesignerTrialPage() {
  return (
    <div className={cn("flex flex-col h-screen", 'screenshot-protection')}>
      <PublicHeader />
      <main className="flex-grow flex flex-col relative">
        <div className="p-4 bg-background border-b z-10">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>You're Using the Trial Version</AlertTitle>
            <AlertDescription>
              This is a feature-limited trial of the TEMA Designer. To save your designs, attach them to jobs, and export to CSV, JSON, or DXF, please <Link href="/signup" className="underline font-semibold hover:text-primary">sign up for a free account</Link>.
            </AlertDescription>
          </Alert>
        </div>
        <div className="flex-grow h-0 z-10"> {/* h-0 is a flexbox trick to make it fill height */}
          <TemaDesigner isTrial={true} />
        </div>
      </main>
    </div>
  );
}


'use client';
import PublicHeader from '@/app/components/layout/public-header';
import TankDesigner from '@/app/components/tank-designer';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function TankDesignerTrialPage() {
  return (
    <div className={cn("flex flex-col h-screen", 'screenshot-protection')}>
      <PublicHeader />
      <main className="flex-grow flex flex-col relative p-4 lg:p-6 bg-muted/30">
        <div className="mb-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>You're Using the Trial Version</AlertTitle>
            <AlertDescription>
              This trial version is for exploring the Storage Tank Designer. To save your designs and attach them to jobs, please <Link href="/signup" className="underline font-semibold hover:text-primary">sign up for a free account</Link>.
            </AlertDescription>
          </Alert>
        </div>
        <div className="flex-grow h-0">
          <TankDesigner isTrial={true} />
        </div>
      </main>
    </div>
  );
}

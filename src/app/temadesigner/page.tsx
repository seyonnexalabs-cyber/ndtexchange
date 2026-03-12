
'use client';
import PublicHeader from '@/app/components/layout/public-header';
import TemaDesigner from '@/app/components/temadesigner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TemaDesignerTrialPage() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className={cn("flex flex-col h-screen")}>
        <PublicHeader />
        <main className="flex-grow flex flex-col items-center justify-center p-4 lg:p-6 bg-muted/30">
           <Card className="max-w-md text-center">
             <CardHeader>
               <CardTitle className="flex flex-col items-center gap-4">
                 <Smartphone className="w-12 h-12 text-primary" />
                 <span>Designer View Unavailable</span>
               </CardTitle>
             </CardHeader>
             <CardContent>
                <p className="text-muted-foreground">
                    The designer tools are optimized for larger screens. Please switch to a tablet or desktop computer for the best experience.
                </p>
             </CardContent>
           </Card>
        </main>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-screen", 'screenshot-protection')}>
      <PublicHeader />
      <main className="flex-grow flex flex-col relative">
        <div className="p-4 bg-background border-b z-10">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>You're Using the Trial Version</AlertTitle>
            <AlertDescription>
              This trial version is perfect for mapping out tubesheet layouts for **heat exchangers, boilers, condensers, and air coolers**. To save your designs, attach them to jobs, and export to CSV, JSON, or DXF, please <Link href="/signup" className="underline font-semibold hover:text-primary">sign up for a free account</Link>.
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

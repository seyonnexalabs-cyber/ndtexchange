"use client";
import NDTSetupBuilder from '@/app/components/ndt-setup-builder';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NDTSetupBuilderDashboardPage() {
  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <div className={cn("flex flex-col h-screen")}> 
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
  return <NDTSetupBuilder isTrial={false} />;
}

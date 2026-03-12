
'use client';
import TemaDesigner from '@/app/components/temadesigner';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone } from 'lucide-react';

export default function TemaDesignerDashboardPage() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="flex h-full items-center justify-center">
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
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh_-_theme(spacing.16)_-_theme(spacing.12))]">
        <TemaDesigner />
    </div>
  );
}

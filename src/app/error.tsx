'use client'; 

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-destructive">
            <AlertTriangle className="w-6 h-6" />
            Application Error
          </CardTitle>
          <CardDescription>
            Something went wrong. We've logged the error and our team will look into it.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="font-semibold mb-2">Error Details:</p>
            <ScrollArea className="h-64 rounded-md border bg-background p-4">
                <pre className="text-sm whitespace-pre-wrap font-mono">
                    <code>{error.message}</code>
                </pre>
            </ScrollArea>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={() => reset()}>
            Try again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, Settings2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function CustomReportBuilderPage() {
    const searchParams = useSearchParams();
    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    return (
        <div className="space-y-6">
            <Button asChild variant="outline" size="sm">
                <Link href={constructUrl("/dashboard/reports")}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Reports
                </Link>
            </Button>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                        <Settings2 />
                        Custom Report Builder
                    </h1>
                    <p className="text-muted-foreground mt-1">Create your own report by selecting custom data points.</p>
                </div>
            </div>
            <div className="text-center p-10 border rounded-lg">
                <h2 className="text-xl font-headline">Coming Soon</h2>
                <p className="mt-2 text-muted-foreground">This feature is currently under development.</p>
            </div>
        </div>
    );
}

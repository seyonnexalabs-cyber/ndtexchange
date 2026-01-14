'use client';
import { assets } from "@/lib/placeholder-data";
import { notFound, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AssetDetailPage({ params }: { params: { id: string } }) {
    const asset = assets.find(a => a.id === params.id);
    const searchParams = useSearchParams();

    if (!asset) {
        notFound();
    }
    
    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-headline">Asset Details for {asset.name}</h1>
                <Button asChild variant="outline">
                    <Link href={constructUrl("/dashboard/assets")}>Back to Assets</Link>
                </Button>
            </div>
            <div className="text-center p-10 border rounded-lg bg-card">
                <p className="mt-4 text-muted-foreground">More details coming soon...</p>
            </div>
        </div>
    );
}

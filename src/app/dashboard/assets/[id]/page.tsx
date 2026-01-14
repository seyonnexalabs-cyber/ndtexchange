import { assets } from "@/lib/placeholder-data";
import { notFound } from "next/navigation";

export default function AssetDetailPage({ params }: { params: { id: string } }) {
    const asset = assets.find(a => a.id === params.id);

    if (!asset) {
        notFound();
    }

    return (
        <div className="text-center p-10">
            <h1 className="text-2xl font-headline">Asset Details for {asset.name}</h1>
            <p className="mt-4 text-muted-foreground">More details coming soon...</p>
        </div>
    );
}

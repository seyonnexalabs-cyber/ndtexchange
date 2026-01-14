'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { assets } from "@/lib/placeholder-data";
import { Badge } from "@/components/ui/badge";
import { MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { TankIcon, PipeIcon, CraneIcon, WeldIcon } from "@/app/components/icons";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

const assetIcons = {
    'Tank': <TankIcon className="w-6 h-6 text-muted-foreground" />,
    'Piping': <PipeIcon className="w-6 h-6 text-muted-foreground" />,
    'Crane': <CraneIcon className="w-6 h-6 text-muted-foreground" />,
    'Vessel': <TankIcon className="w-6 h-6 text-muted-foreground" />,
    'Weld Joint': <WeldIcon className="w-6 h-6 text-muted-foreground" />,
};

export default function AssetsPage() {
    const searchParams = useSearchParams();

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const assetsByLocation = useMemo(() => {
        return assets.reduce((acc, asset) => {
            if (!acc[asset.location]) {
                acc[asset.location] = [];
            }
            acc[asset.location].push(asset);
            return acc;
        }, {} as Record<string, typeof assets>);
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-headline font-semibold">Asset Management</h1>
                <Button>Add New Asset</Button>
            </div>

            <div className="space-y-8">
                {Object.entries(assetsByLocation).map(([location, locationAssets]) => (
                    <div key={location}>
                        <h2 className="text-xl font-semibold mb-4">{location}</h2>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {locationAssets.map((asset, index) => {
                                // A bit contrived for placeholder data, but ensures a variety of images
                                const imageIndex = assets.findIndex(a => a.id === asset.id);
                                const image = PlaceHolderImages.find(p => p.id === `asset${imageIndex + 1}`);
                                return (
                                    <Card key={asset.id} className="flex flex-col">
                                        <CardHeader className="p-0">
                                            <div className="relative h-48 w-full">
                                                {image && (
                                                    <Image src={image.imageUrl} alt={asset.name} fill className="object-cover rounded-t-lg" data-ai-hint={image.imageHint}/>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-4 flex-grow">
                                            <div className="flex items-start justify-between">
                                                {assetIcons[asset.type]}
                                                <Badge variant={
                                                    asset.status === 'Operational' ? 'default' :
                                                    asset.status === 'Requires Inspection' ? 'destructive' :
                                                    asset.status === 'Under Repair' ? 'secondary' : 'outline'
                                                }>{asset.status}</Badge>
                                            </div>
                                            <CardTitle className="mt-2 font-semibold text-lg">{asset.name}</CardTitle>
                                            <CardDescription>{asset.id}</CardDescription>
                                        </CardContent>
                                        <CardFooter className="p-4 pt-0 flex justify-between items-center text-sm text-muted-foreground">
                                            <span>Next: {asset.nextInspection}</span>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild><Link href={constructUrl(`/dashboard/assets/${asset.id}`)}>View Details</Link></DropdownMenuItem>
                                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </CardFooter>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

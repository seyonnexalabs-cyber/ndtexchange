'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { clientAssets, inspectorAssets, technicians } from "@/lib/placeholder-data";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, HardHat, User, SlidersHorizontal, RadioTower, Building } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { TankIcon, PipeIcon, CraneIcon, WeldIcon } from "@/app/components/icons";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const assetIcons = {
    'Tank': <TankIcon className="w-6 h-6 text-muted-foreground" />,
    'Piping': <PipeIcon className="w-6 h-6 text-muted-foreground" />,
    'Crane': <CraneIcon className="w-6 h-6 text-muted-foreground" />,
    'Vessel': <TankIcon className="w-6 h-6 text-muted-foreground" />,
    'Weld Joint': <WeldIcon className="w-6 h-6 text-muted-foreground" />,
};

const inspectorAssetIcons = {
    'UTM-1000': <RadioTower className="w-6 h-6 text-muted-foreground" />,
    'PA-Probe-5MHz': <SlidersHorizontal className="w-6 h-6 text-muted-foreground" />,
};

const ClientAssetsView = () => {
    const searchParams = useSearchParams();

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const assetsByLocation = useMemo(() => {
        return clientAssets.reduce((acc, asset) => {
            if (!acc[asset.location]) {
                acc[asset.location] = [];
            }
            acc[asset.location].push(asset);
            return acc;
        }, {} as Record<string, typeof clientAssets>);
    }, []);

    return (
        <div className="space-y-8">
            {Object.entries(assetsByLocation).map(([location, locationAssets]) => (
                <div key={location}>
                    <h2 className="text-xl font-semibold mb-4">{location}</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {locationAssets.map((asset) => {
                            const imageIndex = clientAssets.findIndex(a => a.id === asset.id);
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
    );
}

const InspectorAssetsView = () => {
    return (
        <Tabs defaultValue="equipment">
            <TabsList className="mb-4">
                <TabsTrigger value="equipment">Equipment</TabsTrigger>
                <TabsTrigger value="technicians">Technicians</TabsTrigger>
            </TabsList>
            <TabsContent value="equipment">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {inspectorAssets.map(asset => (
                        <Card key={asset.id}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-semibold">{asset.name}</CardTitle>
                                {inspectorAssetIcons[asset.id as keyof typeof inspectorAssetIcons] || <RadioTower className="w-6 h-6 text-muted-foreground" />}
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{asset.type}</p>
                                <Badge variant={asset.status === 'Calibrated' ? 'default' : 'secondary'} className="mt-2">{asset.status}</Badge>
                            </CardContent>
                            <CardFooter className="text-sm text-muted-foreground">
                                Cal Due: {asset.nextCalibration}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </TabsContent>
            <TabsContent value="technicians">
                <Card>
                    <CardHeader>
                        <CardTitle>Technician Roster</CardTitle>
                        <CardDescription>Manage your team of certified inspectors.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Level</TableHead>
                                    <TableHead>Certifications</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {technicians.map(tech => (
                                    <TableRow key={tech.id}>
                                        <TableCell className="font-medium flex items-center gap-3">
                                             <Avatar>
                                                <AvatarImage src={`https://picsum.photos/seed/${tech.avatar}/100/100`} />
                                                <AvatarFallback>{tech.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                            </Avatar>
                                            {tech.name}
                                        </TableCell>
                                        <TableCell>{tech.level}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                {tech.certifications.map(cert => <Badge key={cert} variant="secondary">{cert}</Badge>)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={tech.status === 'Available' ? 'default' : 'outline'}>{tech.status}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
};


export default function AssetsPage() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role');

    const isInspector = role === 'inspector';

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    {isInspector ? <HardHat/> : <Building/>}
                    {isInspector ? "My Resources" : "Asset Management"}
                </h1>
                <Button>Add New {isInspector ? 'Resource' : 'Asset'}</Button>
            </div>
            {isInspector ? <InspectorAssetsView /> : <ClientAssetsView />}
        </div>
    );
}

'use client';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { inspectorAssets } from "@/lib/placeholder-data";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, SlidersHorizontal, RadioTower, QrCode, Wrench } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const equipmentIcons = {
    'UTM-1000': <RadioTower className="w-6 h-6 text-muted-foreground" />,
    'PA-Probe-5MHz': <SlidersHorizontal className="w-6 h-6 text-muted-foreground" />,
};

export default function EquipmentPage() {
    const [qrCodeData, setQrCodeData] = useState<{ id: string, name: string } | null>(null);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <Wrench/>
                    Equipment
                </h1>
                 <div className="flex gap-2">
                     <Button variant="outline">
                        <QrCode className="mr-2 h-4 w-4"/>
                        Scan QR
                    </Button>
                    <Button>Add New Equipment</Button>
                </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {inspectorAssets.map(asset => (
                    <Card key={asset.id}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-semibold">{asset.name}</CardTitle>
                            {equipmentIcons[asset.id as keyof typeof equipmentIcons] || <RadioTower className="w-6 h-6 text-muted-foreground" />}
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{asset.type}</p>
                            <Badge variant={asset.status === 'Calibrated' ? 'default' : 'secondary'} className="mt-2">{asset.status}</Badge>
                        </CardContent>
                        <CardFooter className="flex justify-between items-center text-sm text-muted-foreground">
                            <span>Cal Due: {asset.nextCalibration}</span>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setQrCodeData({ id: asset.id, name: asset.name })}>Show QR Code</DropdownMenuItem>
                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardFooter>
                    </Card>
                ))}
            </div>
             <Dialog open={!!qrCodeData} onOpenChange={(open) => !open && setQrCodeData(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>QR Code for {qrCodeData?.name}</DialogTitle>
                        <DialogDescription>
                           Scan this code to quickly access equipment details.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center justify-center p-4">
                        {qrCodeData && (
                            <Image 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeData.id)}`}
                                alt={`QR Code for ${qrCodeData.name}`}
                                width={200}
                                height={200}
                            />
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={() => setQrCodeData(null)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

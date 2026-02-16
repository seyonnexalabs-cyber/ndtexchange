'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function TechniciansPage() {
    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <Users className="text-primary" />
                    Technicians
                </h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Feature Update in Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">The technician roster is being updated for improved performance and security. This page will be available again shortly.</p>
                </CardContent>
            </Card>
        </div>
    );
}

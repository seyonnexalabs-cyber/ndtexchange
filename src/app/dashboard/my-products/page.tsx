'use client';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wrench } from "lucide-react";

export default function MyProductsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <Wrench className="text-primary"/>
                    My Products
                </CardTitle>
                <CardDescription>
                    This page is under construction. Here you will be able to manage your company's product listings in the NDT EXCHANGE ecosystem.
                </CardDescription>
            </CardHeader>
        </Card>
    );
}

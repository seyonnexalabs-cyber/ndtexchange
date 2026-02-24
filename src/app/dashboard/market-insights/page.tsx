'use client';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart } from "lucide-react";

export default function MarketInsightsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <BarChart className="text-primary"/>
                    Market Insights
                </CardTitle>
                <CardDescription>
                    This page is under construction. Here you will find analytics on how your products are being viewed and specified in jobs across the platform.
                </CardDescription>
            </CardHeader>
        </Card>
    );
}

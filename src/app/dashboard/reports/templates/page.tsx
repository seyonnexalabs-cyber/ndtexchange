
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, PlusCircle } from "lucide-react";
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { NDTTechnique } from '@/lib/types';
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function ReportTemplatesPage() {
    const { firestore } = useFirebase();
    const techniquesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'techniques') : null, [firestore]);
    const { data: ndtTechniques, isLoading: isLoadingTechniques } = useCollection<NDTTechnique>(techniquesQuery);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                        <FileText className="text-primary"/>
                        Report Templates
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage your company's standard report templates.</p>
                </div>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Template
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Default Templates</CardTitle>
                    <CardDescription>
                        These are the system-provided default templates for each NDT technique. You can view them as a starting point for your own custom templates.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {isLoadingTechniques ? (
                            [...Array(6)].map((_, i) => <Skeleton key={i} className="h-32" />)
                        ) : (
                            (ndtTechniques || []).map(tech => (
                                <Card key={tech.id} className="p-4 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-semibold">{tech.title} Report</h3>
                                        <Badge variant="outline" className="mt-1">{tech.acronym}</Badge>
                                    </div>
                                    <Button variant="outline" size="sm">View</Button>
                                </Card>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

             <Card className="border-dashed">
                <CardHeader>
                    <CardTitle>Your Custom Templates</CardTitle>
                    <CardDescription>
                        Custom templates you create will appear here.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="text-center p-10">
                        <p className="text-muted-foreground">You haven't created any custom templates yet.</p>
                        <Button className="mt-4">Create Your First Template</Button>
                   </div>
                </CardContent>
            </Card>
        </div>
    );
}

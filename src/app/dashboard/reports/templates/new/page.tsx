'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, FileText, Settings, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { NDTTechnique } from '@/lib/types';
import {
  PlateProvider,
  createPlugins,
} from '@udecode/plate-common';
import { createParagraphPlugin } from '@udecode/plate-paragraph';
import { createBlockquotePlugin } from '@udecode/plate-block-quote';
import { createCodeBlockPlugin } from '@udecode/plate-code-block';
import { createHeadingPlugin } from '@udecode/plate-heading';
import { createBoldPlugin, createItalicPlugin, createUnderlinePlugin } from '@udecode/plate-basic-marks';
import { Skeleton } from '@/components/ui/skeleton';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Editor } from '@/components/ui/editor';
import { FixedToolbar } from '@/components/plate-ui/fixed-toolbar';
import { FixedToolbarButtons } from '@/components/plate-ui/fixed-toolbar-buttons';
import { FloatingToolbar } from '@/components/plate-ui/floating-toolbar';
import { FloatingToolbarButtons } from '@/components/plate-ui/floating-toolbar-buttons';

export default function NewReportTemplatePage() {
    const searchParams = useSearchParams();
    const { firestore } = useFirebase();
    const [isClient, setIsClient] = React.useState(false);

    React.useEffect(() => {
        setIsClient(true);
    }, []);

    const techniquesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'techniques') : null, [firestore]);
    const { data: ndtTechniques } = useCollection<NDTTechnique>(techniquesQuery);

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    };
    
    // Plate.js plugins
    const plugins = createPlugins([
        createParagraphPlugin(),
        createBlockquotePlugin(),
        createCodeBlockPlugin(),
        createHeadingPlugin(),
        createBoldPlugin(),
        createItalicPlugin(),
        createUnderlinePlugin(),
    ]);

    return (
        <div className="space-y-6">
            <Link href={constructUrl('/dashboard/reports/templates')} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Templates
            </Link>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                        <FileText className="text-primary" />
                        Create New Report Template
                    </h1>
                    <p className="text-muted-foreground mt-1">Design a new report template for your company.</p>
                </div>
                <Button>
                    <Save className="mr-2 h-4 w-4" />
                    Save Template
                </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Template Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="template-name">Template Name</Label>
                                <Input id="template-name" placeholder="e.g., Standard UT Report" />
                            </div>
                            <div>
                                <Label htmlFor="template-technique">NDT Technique</Label>
                                <Select>
                                    <SelectTrigger id="template-technique">
                                        <SelectValue placeholder="Select a technique" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(ndtTechniques || []).map(tech => (
                                            <SelectItem key={tech.id} value={tech.acronym}>{tech.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="template-description">Description</Label>
                                <Textarea id="template-description" placeholder="A brief description of this template." />
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Settings className="text-primary" /> Template Editor</CardTitle>
                        </CardHeader>
                        <CardContent>
                           {isClient ? (
                                <TooltipProvider>
                                  <PlateProvider plugins={plugins}>
                                    <div className="rounded-md border">
                                      <FixedToolbar>
                                        <FixedToolbarButtons />
                                      </FixedToolbar>
                                      <Editor className="px-6 py-8" />
                                      <FloatingToolbar>
                                        <FloatingToolbarButtons />
                                      </FloatingToolbar>
                                    </div>
                                  </PlateProvider>
                                </TooltipProvider>
                           ) : (
                                <Skeleton className="h-[400px] w-full" />
                           )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

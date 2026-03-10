
'use client';

import * as React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Save } from 'lucide-react';
import { toast } from 'sonner';

// Simplified schema for the form
const tankDesignerSchema = z.object({
  name: z.string().min(3, "Design name is required."),
  diameter: z.coerce.number().positive("Diameter must be positive."),
  shellCourses: z.coerce.number().int().positive("Must be a whole number."),
  floorPlates: z.coerce.number().int().positive("Must be a whole number."),
});

type TankDesignerFormValues = z.infer<typeof tankDesignerSchema>;

const FloorPlanView = () => {
    return (
        <div>
            <p className="text-muted-foreground mb-4">
                This is an interactive map of the tank floor. Click on plates to enter corrosion data or MFL scan results.
            </p>
            <div className="aspect-square w-full max-w-lg mx-auto bg-muted/50 rounded-full border-2 border-dashed flex items-center justify-center">
                <p className="text-muted-foreground">Tank Floor Map Placeholder</p>
            </div>
        </div>
    );
};

const ShellCoursesView = () => {
    const form = useFormContext<TankDesignerFormValues>();
    const shellCourses = form.watch('shellCourses');
    
    return (
        <div>
            <p className="text-muted-foreground mb-4">
                Enter the minimum and maximum thickness readings for each shell course. The view below represents the tank shell unrolled into a flat plate.
            </p>
            <div className="border rounded-md p-4 space-y-4">
                 {shellCourses > 0 && Array.from({ length: shellCourses }).map((_, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center border-b pb-4 last:border-b-0 last:pb-0">
                        <div className="font-semibold md:col-span-1">Course {index + 1}</div>
                        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                             <FormField
                                name={`shellReadings.${index}.min`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Min Thickness (in)</FormLabel>
                                        <FormControl><Input type="number" step="0.001" placeholder="e.g., 0.235" {...field} /></FormControl>
                                    </FormItem>
                                )}
                            />
                             <FormField
                                name={`shellReadings.${index}.max`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Max Thickness (in)</FormLabel>
                                        <FormControl><Input type="number" step="0.001" placeholder="e.g., 0.251" {...field} /></FormControl>
                                    </FormItem>
                                )}
                            />
                             <FormField
                                name={`shellReadings.${index}.avg`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Avg Thickness (in)</FormLabel>
                                        <FormControl><Input type="number" step="0.001" placeholder="e.g., 0.246" {...field} /></FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                ))}
                {(!shellCourses || shellCourses === 0) && <p className="text-muted-foreground text-center py-8">Enter the number of shell courses in the configuration panel to begin.</p>}
            </div>
        </div>
    );
};


const AnnularRingView = () => {
    return (
        <div>
            <p className="text-muted-foreground mb-4">
                Log thickness readings for the annular ring at critical clock positions.
            </p>
            <div className="aspect-square w-full max-w-lg mx-auto bg-muted/50 rounded-full border-2 border-dashed flex items-center justify-center">
                 <p className="text-muted-foreground">Annular Ring View Placeholder</p>
            </div>
        </div>
    );
};


export default function TankDesignerPage() {
    const form = useForm<TankDesignerFormValues>({
        resolver: zodResolver(tankDesignerSchema),
        defaultValues: {
            name: "New Tank Design",
            diameter: 40,
            shellCourses: 5,
            floorPlates: 8,
        },
    });

    const onSubmit = (values: TankDesignerFormValues) => {
        console.log(values);
        toast.success("Design Saved (Simulation)", {
            description: "In a real application, this would save the tank design to the database.",
        });
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                                <Database className="text-primary" />
                                Storage Tank Designer
                            </h1>
                            <p className="text-muted-foreground mt-1">Visualize inspection data for API 650/653 storage tanks.</p>
                        </div>
                         <Button type="submit">
                            <Save className="mr-2 h-4 w-4" />
                            Save Design
                        </Button>
                    </div>

                    <div className="grid lg:grid-cols-4 gap-8 items-start">
                        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Configuration</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                     <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Design Name</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="diameter"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Diameter (ft)</FormLabel>
                                                <FormControl><Input type="number" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="shellCourses"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Shell Courses</FormLabel>
                                                <FormControl><Input type="number" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={form.control}
                                        name="floorPlates"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Floor Plates</FormLabel>
                                                <FormControl><Input type="number" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                        <div className="lg:col-span-3">
                             <Tabs defaultValue="floor">
                                <TabsList>
                                    <TabsTrigger value="floor">Floor Plan</TabsTrigger>
                                    <TabsTrigger value="shell">Shell Courses</TabsTrigger>
                                    <TabsTrigger value="annular">Annular Ring</TabsTrigger>
                                </TabsList>
                                <TabsContent value="floor" className="mt-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Floor Scan Mapping</CardTitle>
                                            <CardDescription>Visualize MFL or UT floor scan data.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <FloorPlanView />
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="shell" className="mt-4">
                                     <Card>
                                        <CardHeader>
                                            <CardTitle>Shell Course Mapping</CardTitle>
                                            <CardDescription>Record wall thickness readings for each course.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <ShellCoursesView />
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="annular" className="mt-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Annular Plate Mapping</CardTitle>
                                            <CardDescription>Inspect the critical corrosion zone at the shell-to-floor junction.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <AnnularRingView />
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}

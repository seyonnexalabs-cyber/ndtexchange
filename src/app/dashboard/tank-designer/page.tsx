
'use client';

import * as React from 'react';
import { useForm, FormProvider, useFormContext, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Save } from 'lucide-react';
import { toast } from 'sonner';

// Updated schema to include shellReadings and annularReadings
const tankDesignerSchema = z.object({
  name: z.string().min(3, "Design name is required."),
  diameter: z.coerce.number().positive({ message: "Diameter must be a positive number." }),
  shellCourses: z.coerce.number().int().positive({ message: "Must be a whole number." }),
  floorPlates: z.coerce.number().int().positive({ message: "Must be a whole number." }),
  shellReadings: z.array(z.object({
    min: z.coerce.number().optional(),
    max: z.coerce.number().optional(),
    avg: z.coerce.number().optional(),
  })).optional(),
   annularReadings: z.array(z.object({
      position: z.string(),
      thickness: z.coerce.number().optional()
  })).optional(),
});

type TankDesignerFormValues = z.infer<typeof tankDesignerSchema>;

const FloorPlanView = () => {
    const { watch } = useFormContext<TankDesignerFormValues>();
    const floorPlates = watch('floorPlates');
    const diameter = watch('diameter');
    const [hoveredPlate, setHoveredPlate] = React.useState<number | null>(null);

    const radius = 250; // SVG radius
    const angleStep = 360 / (floorPlates > 0 ? floorPlates : 1);

    const getWedgePath = (index: number) => {
        const startAngle = angleStep * index - 90;
        const endAngle = angleStep * (index + 1) - 90;
        const start = {
            x: radius + radius * Math.cos(startAngle * Math.PI / 180),
            y: radius + radius * Math.sin(startAngle * Math.PI / 180),
        };
        const end = {
            x: radius + radius * Math.cos(endAngle * Math.PI / 180),
            y: radius + radius * Math.sin(endAngle * Math.PI / 180),
        };
        const largeArcFlag = angleStep > 180 ? 1 : 0;
        return `M ${radius},${radius} L ${start.x},${start.y} A ${radius},${radius} 0 ${largeArcFlag} 1 ${end.x},${end.y} Z`;
    };

    return (
        <div>
            <p className="text-muted-foreground mb-4">
                An interactive map of the tank floor, generated from your configuration.
            </p>
            <div className="aspect-square w-full max-w-lg mx-auto">
                <svg viewBox="0 0 500 500">
                    <circle cx="250" cy="250" r="250" fill="hsl(var(--muted))" />
                    {floorPlates > 0 && Array.from({ length: floorPlates }).map((_, index) => (
                        <path
                            key={index}
                            d={getWedgePath(index)}
                            fill={hoveredPlate === index ? 'hsl(var(--primary) / 0.2)' : 'hsl(var(--muted))'}
                            stroke="hsl(var(--border))"
                            strokeWidth="2"
                            className="cursor-pointer transition-all"
                            onMouseEnter={() => setHoveredPlate(index)}
                            onMouseLeave={() => setHoveredPlate(null)}
                            onClick={() => toast.info(`Plate ${index + 1} clicked`, { description: "Data entry for this plate would appear here."})}
                        />
                    ))}
                    <text x="250" y="250" textAnchor="middle" dy=".3em" className="text-2xl font-bold fill-muted-foreground select-none pointer-events-none">
                        ø{diameter}'
                    </text>
                </svg>
            </div>
        </div>
    );
};

const ShellCoursesView = () => {
    const { control, watch } = useFormContext<TankDesignerFormValues>();
    const shellCourses = watch('shellCourses');
    
    return (
        <div>
            <p className="text-muted-foreground mb-4">
                Enter the minimum, maximum, and average thickness readings for each shell course. The view below represents the tank shell unrolled into a flat plate.
            </p>
            <div className="border rounded-md p-4 space-y-4">
                 {shellCourses > 0 && Array.from({ length: shellCourses }).map((_, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center border-b pb-4 last:border-b-0 last:pb-0">
                        <div className="font-semibold md:col-span-1">Course {index + 1}</div>
                        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                             <FormField
                                control={control}
                                name={`shellReadings.${index}.min`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Min Thickness (in)</FormLabel>
                                        <FormControl><Input type="number" step="0.001" placeholder="e.g., 0.235" {...field} /></FormControl>
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={control}
                                name={`shellReadings.${index}.max`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Max Thickness (in)</FormLabel>
                                        <FormControl><Input type="number" step="0.001" placeholder="e.g., 0.251" {...field} /></FormControl>
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={control}
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
    const { control } = useFormContext<TankDesignerFormValues>();
    const { fields } = useFieldArray({
        control,
        name: "annularReadings"
    });
    
    // Positions for inputs
    const positions = [
        { label: "12 o'clock", top: '0%', left: '50%', transform: 'translate(-50%, -50%)' },
        { label: "3 o'clock", top: '50%', left: '100%', transform: 'translate(-50%, -50%)' },
        { label: "6 o'clock", top: '100%', left: '50%', transform: 'translate(-50%, -50%)' },
        { label: "9 o'clock", top: '50%', left: '0%', transform: 'translate(-50%, -50%)' },
    ];
    
    const annularWidth = 50; // SVG units

    return (
        <div>
            <p className="text-muted-foreground mb-4">
                Log thickness readings for the annular ring at critical clock positions.
            </p>
            <div className="relative w-full max-w-lg mx-auto aspect-square">
                 <svg viewBox="0 0 500 500" className="w-full h-full">
                    <circle cx="250" cy="250" r="250" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1" />
                    <circle cx="250" cy="250" r={250 - annularWidth} fill="hsl(var(--muted))" />
                </svg>
                {fields.map((field, index) => {
                    const position = positions.find(p => p.label === field.position);
                    if (!position) return null;
                    return (
                        <div key={field.id} className="absolute" style={{ top: position.top, left: position.left, transform: position.transform }}>
                             <FormField
                                control={control}
                                name={`annularReadings.${index}.thickness`}
                                render={({ field }) => (
                                    <FormItem className="w-40">
                                        <FormLabel className="text-xs text-center block">{position.label}</FormLabel>
                                        <FormControl><Input type="number" step="0.001" placeholder="Thickness (in)" {...field} className="text-center" /></FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    );
                })}
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
            annularReadings: [
                { position: "12 o'clock", thickness: undefined },
                { position: "3 o'clock", thickness: undefined },
                { position: "6 o'clock", thickness: undefined },
                { position: "9 o'clock", thickness: undefined },
            ]
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

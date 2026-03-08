
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Factory, MoreVertical, Edit } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, setDoc, updateDoc } from 'firebase/firestore';
import { Manufacturer, NDTTechnique } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect, type MultiSelectOption } from "@/components/ui/multi-select";

const manufacturerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Company name is required."),
  url: z.string().url({ message: "Please enter a valid URL." }),
  logoUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  description: z.string().optional(),
  techniqueIds: z.array(z.string()).min(1, "At least one technique must be selected."),
});

type ManufacturerFormValues = z.infer<typeof manufacturerSchema>;

const ManufacturerForm = ({ 
    formId,
    onSubmit, 
    defaultValues,
    allTechniques
}: { 
    formId: string, 
    onSubmit: (values: ManufacturerFormValues) => void,
    defaultValues?: Partial<ManufacturerFormValues>,
    allTechniques: NDTTechnique[]
}) => {
    const form = useForm<ManufacturerFormValues>({
        resolver: zodResolver(manufacturerSchema),
        defaultValues,
    });
    
    const techniqueOptions: MultiSelectOption[] = useMemo(() => 
        allTechniques.map(t => ({ value: t.acronym, label: `${t.title} (${t.acronym})` })), 
        [allTechniques]
    );

    return (
        <Form {...form}>
            <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl><Input placeholder="e.g., Olympus" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Website URL</FormLabel>
                            <FormControl><Input placeholder="https://www.example.com" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="logoUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Logo URL (Optional)</FormLabel>
                            <FormControl><Input placeholder="https://www.example.com/logo.png" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl><Textarea placeholder="A brief description of the company." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="techniqueIds"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Specialized Techniques</FormLabel>
                            <MultiSelect
                                options={techniqueOptions}
                                selected={field.value || []}
                                onChange={field.onChange}
                                placeholder="Select techniques..."
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    );
};

export default function ManufacturersPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role');
    const { toast } = useToast();
    const { firestore } = useFirebase();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingManufacturer, setEditingManufacturer] = useState<Manufacturer | null>(null);

    const manufacturersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'manufacturers') : null, [firestore]);
    const { data: manufacturers, isLoading: isLoadingManufacturers } = useCollection<Manufacturer>(manufacturersQuery);

    const techniquesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'techniques') : null, [firestore]);
    const { data: allTechniques, isLoading: isLoadingTechniques } = useCollection<NDTTechnique>(techniquesQuery);

    useEffect(() => {
        if (role && role !== 'admin') {
            router.replace(`/dashboard?${searchParams.toString()}`);
        }
    }, [role, router, searchParams]);
    
    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    };

    const handleAddClick = () => {
        setEditingManufacturer(null);
        setIsFormOpen(true);
    };

    const handleEditClick = (manufacturer: Manufacturer) => {
        setEditingManufacturer(manufacturer);
        setIsFormOpen(true);
    };

    const closeDialog = () => {
        setIsFormOpen(false);
        setEditingManufacturer(null);
    };

    const handleFormSubmit = async (values: ManufacturerFormValues) => {
        if (!firestore) return;
        
        const isEditing = !!editingManufacturer;
        const dataToSave: Omit<Manufacturer, 'id'> = {
            name: values.name,
            url: values.url,
            logoUrl: values.logoUrl,
            description: values.description,
            techniqueIds: values.techniqueIds,
        };

        if (isEditing && editingManufacturer) {
            const manuRef = doc(firestore, 'manufacturers', editingManufacturer.id);
            await updateDoc(manuRef, dataToSave);
            toast({ title: "Manufacturer Updated", description: `${values.name} has been updated.` });
        } else {
            const newManuRef = doc(collection(firestore, 'manufacturers'));
            await setDoc(newManuRef, { id: newManuRef.id, ...dataToSave });
            toast({ title: "Manufacturer Added", description: `${values.name} has been added to the directory.` });
        }
        closeDialog();
    };

    if (role !== 'admin') {
        return null;
    }

    const isLoading = isLoadingManufacturers || isLoadingTechniques;
    
    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <Factory className="text-primary"/>
                    Manufacturer Management
                </h1>
                <Button onClick={handleAddClick} className="w-full sm:w-auto">Add New Manufacturer</Button>
            </div>
            
             <Card>
                <CardHeader>
                    <CardTitle>Manufacturer Directory</CardTitle>
                    <CardDescription>Manage all NDT equipment manufacturers on the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Company Name</TableHead>
                                <TableHead>Website</TableHead>
                                <TableHead>Techniques</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && [...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell>
                                </TableRow>
                            ))}
                            {!isLoading && manufacturers?.map(manu => (
                                <TableRow key={manu.id}>
                                    <TableCell className="font-medium flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            {manu.logoUrl && <AvatarImage src={manu.logoUrl} alt={manu.name} />}
                                            <AvatarFallback>{manu.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        {manu.name}
                                    </TableCell>
                                    <TableCell><a href={manu.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{manu.url}</a></TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {manu.techniqueIds.map(techId => <Badge key={techId} variant="secondary">{techId}</Badge>)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                       <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEditClick(manu)}>
                                                    <Edit className="mr-2 h-4 w-4"/>
                                                    Edit
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                     {!isLoading && manufacturers?.length === 0 && (
                        <div className="text-center p-10 text-muted-foreground">No manufacturers found.</div>
                    )}
                </CardContent>
            </Card>

             <Dialog open={isFormOpen} onOpenChange={closeDialog}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingManufacturer ? 'Edit Manufacturer' : 'Add New Manufacturer'}</DialogTitle>
                        <DialogDescription>
                            {editingManufacturer ? 'Update the details for this manufacturer.' : 'Enter the details for a new OEM to add them to the directory.'}
                        </DialogDescription>
                    </DialogHeader>
                     <ManufacturerForm
                        formId="manufacturer-form"
                        onSubmit={handleFormSubmit}
                        defaultValues={editingManufacturer || { techniqueIds: [] }}
                        allTechniques={allTechniques || []}
                    />
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={closeDialog}>Cancel</Button>
                        <Button type="submit" form="manufacturer-form">{editingManufacturer ? 'Save Changes' : 'Add Manufacturer'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}

    
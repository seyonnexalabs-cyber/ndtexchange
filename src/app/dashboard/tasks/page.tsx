
'use client'

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { columns } from "./components/columns"
import { DataTable } from "./components/data-table"
import { useFirebase, useCollection, useMemoFirebase, useUser } from "@/firebase"
import { collection, query, serverTimestamp, addDoc, updateDoc, where } from "firebase/firestore"
import { Task, createTaskSchema } from "./data/schema"
import { labels, priorities, statuses } from "@/lib/seed-data"

import { useMobile } from "@/hooks/use-mobile"
import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, ClipboardList } from "lucide-react"
import { DataTableRowActions } from "./components/data-table-row-actions"
import { DataTableToolbar } from "./components/data-table-toolbar"
import { Skeleton } from "@/components/ui/skeleton"

export default function TasksPage() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const isMobile = useMobile();
  const [isNewTaskOpen, setIsNewTaskOpen] = React.useState(false);

  const tasksQuery = useMemoFirebase(
    () => (firestore && user ? query(collection(firestore, `tasks`), where('userId', '==', user.uid)) : null),
    [firestore, user]
  );
  const { data: tasks, isLoading } = useCollection<Task>(tasksQuery);
  
  const form = useForm<z.infer<typeof createTaskSchema>>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      label: "bug",
      priority: "medium",
    },
  });

  async function onSubmit(values: z.infer<typeof createTaskSchema>) {
    if (!user || !firestore) {
        toast({ variant: "destructive", title: "Error", description: "Not authenticated. Cannot create task." });
        return;
    }
    try {
        const tasksCollection = collection(firestore, `tasks`);
        const docRef = await addDoc(tasksCollection, {
            ...values,
            status: "todo",
            type: "One-Time",
            userId: user.uid,
            createdAt: serverTimestamp(),
        });

        // Add the id to the document after creation
        await updateDoc(docRef, { id: docRef.id });

        toast({ title: "Task created successfully!" });
        setIsNewTaskOpen(false);
        form.reset();
    } catch (error) {
        console.error("Error creating task:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not create the task." });
    }
  }

  const tasksData = tasks || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2"><ClipboardList className="h-6 w-6 text-primary"/> My Tasks</h2>
          <p className="text-muted-foreground">
            A personal space to track your to-do items and reminders.
          </p>
        </div>
        {isMobile && (
            <Button onClick={() => setIsNewTaskOpen(true)} size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> New
            </Button>
        )}
      </div>
      {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
      ) : isMobile ? (
         <div className="space-y-4">
            {tasksData.map((task) => {
                 const status = statuses.find((s) => s.value === task.status);
                 const priority = priorities.find((p) => p.value === task.priority);
                 const label = labels.find((l) => l.value === task.label);
                 return (
                    <Card key={task.id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="pr-4">{task.title}</CardTitle>
                                <DataTableRowActions row={{ original: task } as any} />
                            </div>
                            <CardDescription>TASK-{task.id.substring(0, 7)}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between text-sm">
                            {status && (
                                <div className="flex items-center gap-2">
                                    <status.icon className="h-4 w-4 text-muted-foreground" />
                                    <span>{status.label}</span>
                                </div>
                            )}
                            {priority && (
                                <div className="flex items-center gap-2">
                                    <priority.icon className="h-4 w-4 text-muted-foreground" />
                                    <span>{priority.label}</span>
                                </div>
                            )}
                             {label && (
                                <Badge variant="outline">{label.label}</Badge>
                             )}
                        </CardContent>
                    </Card>
                 )
            })}
             {tasksData.length === 0 && (
                <div className="text-center p-10 border rounded-lg">
                    <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h2 className="mt-4 text-xl font-headline">No tasks yet</h2>
                    <p className="mt-2 text-muted-foreground">Click "New" to create your first task.</p>
                </div>
            )}
         </div>
      ) : (
        <DataTable data={tasksData} columns={columns} onNewTaskClick={() => setIsNewTaskOpen(true)} />
      )}
      
       <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                    Fill out the details below to add a new task to your list.
                </DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Follow up with Global Energy Corp." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="label"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Label</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {labels.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="priority"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Priority</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {priorities.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                     <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setIsNewTaskOpen(false)}>Cancel</Button>
                        <Button type="submit">Create Task</Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

'use client'

import { columns } from "./components/columns"
import { DataTable } from "./components/data-table"
import { useFirebase, useCollection, useMemoFirebase, useUser } from "@/firebase"
import { collection, query } from "firebase/firestore"
import { Task } from "./data/schema"

export default function TasksPage() {
  const { firestore, user } = useFirebase();

  // For demo purposes, we'll create a few tasks if they don't exist.
  // In a real app, users would create their own tasks.
  const tasksQuery = useMemoFirebase(
    () => (firestore && user ? query(collection(firestore, `users/${user.uid}/tasks`)) : null),
    [firestore, user]
  );
  const { data: tasks, isLoading } = useCollection<Task>(tasksQuery);
  
  const formattedTasks = tasks?.map(task => ({
      id: task.id.substring(0, 7), // Shorten ID for display
      title: task.title,
      status: task.status,
      label: task.label,
      priority: task.priority,
  })) || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
          <p className="text-muted-foreground">
            Here&apos;s a list of your tasks!
          </p>
        </div>
      </div>
      {isLoading ? (
          <div>Loading tasks...</div>
      ) : (
        <DataTable data={formattedTasks} columns={columns} />
      )}
    </div>
  )
}

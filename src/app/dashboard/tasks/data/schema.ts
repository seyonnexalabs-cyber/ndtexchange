"use client"

import { z } from "zod"

// This schema is for validating the shape of data from Firestore
// and for the DataTable component's type inference.
export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
  label: z.string(),
  priority: z.string(),
  type: z.string(),
})

export type Task = z.infer<typeof taskSchema>

// This new schema is for form validation when creating a new task.
export const createTaskSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  label: z.string({ required_error: "Please select a label." }),
  priority: z.string({ required_error: "Please select a priority." }),
})

import { z } from "zod";

export const taskSchema = z.object({
	id: z.string(),
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	completed: z.boolean(),
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime().optional(),
});

export const createTaskSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	completed: z.boolean(),
});

export const updateTaskSchema = z.object({
	id: z.string(),
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	completed: z.boolean(),
	updatedAt: z.string().datetime().optional(),
});

export type Task = z.infer<typeof taskSchema>;
export type CreateTask = z.infer<typeof createTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;

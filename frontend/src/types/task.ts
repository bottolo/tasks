import { z } from "zod";

export const taskSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string().optional(),
	completed: z.boolean().default(false),
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime().optional(),
});

export const createTaskSchema = taskSchema
	.omit({ id: true, createdAt: true, updatedAt: true })
	.extend({
		completed: z.boolean(),
	});

export type Task = z.infer<typeof taskSchema>;
export type CreateTask = z.infer<typeof createTaskSchema>;

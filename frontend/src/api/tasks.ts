import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "../lib/queryClient.ts";
import type { Task } from "../types/task.ts";

export interface UseGetTasksParams {
	search?: string;
	completed?: boolean;
}

// Trying to figure out why railway is not working with the environment variables.
const BASE_URL = "https://fiscotasks-production.up.railway.app";
// const BASE_URL = "http://localhost:3000";

export const useGetTasks = (params?: UseGetTasksParams) => {
	return useQuery<Task[]>({
		queryKey: ["tasks", params],
		queryFn: async () => {
			const url = new URL(`${BASE_URL}/tasks`);

			if (params?.search) {
				url.searchParams.append("search", params.search);
			}

			if (params?.completed !== undefined) {
				url.searchParams.append("completed", params.completed.toString());
			}

			const response = await fetch(url.toString());
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return response.json();
		},
		refetchOnWindowFocus: false,
		staleTime: 5 * 60 * 1000,
	});
};

export const useGetTaskById = (id: string) => {
	return useQuery<Task | null>({
		queryKey: ["task", id],
		queryFn: async () => {
			const response = await fetch(`${BASE_URL}/tasks/${id}`);
			if (!response.ok) {
				if (response.status === 404) {
					return null;
				}
				throw new Error("Network response was not ok");
			}
			return response.json();
		},
		refetchOnWindowFocus: false,
		staleTime: 5 * 60 * 1000,
		enabled: !!id,
	});
};

export const useCreateTask = () => {
	return useMutation({
		mutationKey: ["createTask"],
		mutationFn: async (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
			const response = await fetch(`${BASE_URL}/tasks`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(task),
			});
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return response.json();
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["tasks"] });
			toast.success("Task created successfully.");
		},
		onError: (error) => {
			console.error("Error creating task:", error);
			toast.error(`Error: ${error.message}` || "Failed to create task.");
		},
	});
};

export const useUpdateTask = () => {
	return useMutation({
		mutationKey: ["updateTask"],
		mutationFn: async (task: Omit<Task, "createdAt">) => {
			const response = await fetch(`${BASE_URL}/tasks/${task.id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(task),
			});
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return response.json();
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["tasks"] });
			await queryClient.invalidateQueries({ queryKey: ["task"] });
			toast.success("Task updated successfully.");
		},
		onError: (error) => {
			toast.error(`Error: ${error.message}` || "Failed to update task.");
		},
	});
};

export const useUpdateTasks = () => {
	return useMutation({
		mutationKey: ["updateTasks"],
		mutationFn: async (tasks: Omit<Task, "createdAt">[]) => {
			const response = await fetch(`${BASE_URL}/tasks`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ tasks }),
			});
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return response.json();
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["tasks"] });
			toast.success("Tasks updated successfully.");
		},
		onError: (error) => {
			toast.error(`Error: ${error.message}` || "Failed to update tasks.");
		},
	});
};

export const useDeleteTask = () => {
	return useMutation({
		mutationKey: ["deleteTask"],
		mutationFn: async (id: string) => {
			const response = await fetch(`${BASE_URL}/tasks/${id}`, {
				method: "DELETE",
			});
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return id;
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["tasks"] });
			toast.success("Task deleted.");
		},
		onError: (error) => {
			console.error("Error deleting task:", error);
			toast.error(`Error: ${error.message}` || "Failed to delete task.");
		},
	});
};

export const useDeleteTasks = () => {
	return useMutation({
		mutationKey: ["deleteTasks"],
		mutationFn: async (ids: string[]) => {
			const response = await fetch(`${BASE_URL}/tasks`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ ids }),
			});
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return ids;
		},
		onSuccess: async (data) => {
			await queryClient.invalidateQueries({ queryKey: ["tasks"] });
			toast.success(
				`Deleted ${data.length} task${data.length > 1 ? "s" : ""}.`,
			);
		},
		onError: (error) => {
			console.error("Error deleting tasks:", error);
			toast.error(`Error: ${error.message}` || "Failed to delete tasks.");
		},
	});
};

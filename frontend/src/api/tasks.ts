import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "../lib/queryClient.ts";
import type { Task } from "../types/task.ts";

export interface UseGetTasksParams {
	search?: string;
	completed?: boolean;
}

export const useGetTasks = (params?: UseGetTasksParams) => {
	return useQuery<Task[]>({
		queryKey: ["tasks", params],
		queryFn: async () => {
			const url = new URL("http://localhost:3000/tasks");

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
			const response = await fetch(`http://localhost:3000/tasks/${id}`);
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
			const response = await fetch("http://localhost:3000/tasks", {
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
			const response = await fetch(`http://localhost:3000/tasks/${task.id}`, {
				method: "PUT",
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

export const useDeleteTask = () => {
	return useMutation({
		mutationKey: ["deleteTask"],
		mutationFn: async (id: string) => {
			const response = await fetch(`http://localhost:3000/tasks/${id}`, {
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

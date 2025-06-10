import { Button } from "@/components/ui/button.tsx";
import {
	Dialog,
	DialogContent,
	DialogTrigger,
} from "@/components/ui/dialog.tsx";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useCreateTask, useDeleteTask, useGetTasks } from "../api/tasks.ts";
import { Card } from "../components/ui/card.tsx";
import { type CreateTask, type Task, createTaskSchema } from "../types/task.ts";

export const Root = () => {
	const { data: tasks } = useGetTasks();
	const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask();
	const { mutate: createTask, isPedning: isCreating } = useCreateTask();

	const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);

	const form = useForm<CreateTask>({
		resolver: zodResolver(createTaskSchema),
		defaultValues: {
			title: "",
			description: "",
			completed: false,
		},
	});

	const onSubmit = (data: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
		createTask(data, {
			onSuccess: () => {
				form.reset();
			},
		});
	};

	return (
		<div className="flex flex-col h-full gap-4">
			<div className={"flex flex-row justify-between"}>
				<div className={"flex flex-row gap-2"}>
					<Button>Select All</Button>
					<Button variant={"destructive"}>Delete</Button>
				</div>

				<Dialog>
					<DialogTrigger>
						<Button>+ New Task</Button>
					</DialogTrigger>
					<DialogContent>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="flex flex-col gap-4"
							>
								<FormField
									control={form.control}
									name="title"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Title</FormLabel>
											<FormControl>
												<input type="text" {...field} className="input" />
											</FormControl>
											<FormDescription>The title of the task.</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="description"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Description</FormLabel>
											<FormControl>
												<textarea rows={3} {...field} className="input" />
											</FormControl>
											<FormDescription>
												A brief description of the task.
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="completed"
									render={({ field }) => (
										<FormItem className="flex items-center">
											<input
												type="checkbox"
												className="checkbox"
												onChange={(e) => field.onChange(e.target.checked)}
												defaultChecked={field.value}
											/>
											<FormLabel className="ml-2">Task Completed</FormLabel>
										</FormItem>
									)}
								/>

								<Button type="submit" disabled={isCreating}>
									{isCreating ? (
										<Loader2Icon className={"animate-spin"} />
									) : (
										"Create Task"
									)}
								</Button>
							</form>
						</Form>
					</DialogContent>
				</Dialog>
			</div>
			{tasks?.map((task: Task, index) => (
				<Card
					className={"flex flex-row justify-between items-center"}
					key={index}
				>
					<div className={"flex flex-row gap-4"}>
						<input
							type={"checkbox"}
							className={"cursor-pointer mb-auto"}
							readOnly
						/>
						<div>
							<h3 className="text-lg font-semibold">{task.title}</h3>
							<p className="text-sm opacity-70">{task.description}</p>
							<div>{task?.completed ? "Completed" : "Incomplete"}</div>
						</div>
					</div>

					<div className={"flex flex-row gap-2"}>
						<Button onClick={() => deleteTask(task.id)}>
							{isDeleting ? "Deleting..." : "Delete"}
						</Button>
						<Button>Update</Button>
					</div>
				</Card>
			))}
		</div>
	);
};

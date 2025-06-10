import { Button } from "@/components/ui/button.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
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
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	ListCheckIcon,
	Loader2Icon,
	PencilIcon,
	PlusIcon,
	Trash2Icon,
} from "lucide-react";
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
				<div className={"flex flex-row"}>
					<Button
						className={"rounded-r-none"}
						onClick={() => setSelectedTasks(tasks || [])}
					>
						<ListCheckIcon /> Select All
					</Button>
					<Button
						className={"rounded-l-none"}
						disabled={selectedTasks.length === 0}
						variant={"destructive"}
					>
						<Trash2Icon />
					</Button>
				</div>

				<Dialog>
					<DialogTrigger>
						<Button>
							<PlusIcon /> Add Task
						</Button>
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
												<Input type="text" {...field} className="input" />
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
												<Textarea rows={3} {...field} className="input" />
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
											<Checkbox
												checked={field.value}
												onCheckedChange={(checked) => field.onChange(checked)}
												className="h-4 w-4"
											/>
											<FormLabel className="ml-2">Task Completed</FormLabel>
										</FormItem>
									)}
								/>

								<Button type="submit" disabled={isCreating}>
									<PlusIcon />
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
			{tasks?.map((task: Task) => (
				<Card
					className={"flex flex-row justify-between items-center px-4"}
					key={task?.id}
				>
					<div className={"flex flex-row gap-4 items-center"}>
						<Checkbox
							checked={selectedTasks.includes(task)}
							onCheckedChange={(checked) => {
								if (checked) {
									setSelectedTasks((prev) => [...prev, task]);
								} else {
									setSelectedTasks((prev) =>
										prev.filter((t) => t.id !== task.id),
									);
								}
							}}
							className="h-4 w-4"
						/>
						<div>
							<h3 className="text-lg font-semibold">{task.title}</h3>
							<p className="text-sm opacity-70">{task.description}</p>
							<div>{task?.completed ? "Completed" : "Incomplete"}</div>
						</div>
					</div>

					<div className={"flex flex-row"}>
						{" "}
						<Button className={"rounded-r-none"}>
							<PencilIcon />
						</Button>
						<Button
							className={"rounded-l-none"}
							variant={"destructive"}
							onClick={() => deleteTask(task.id)}
						>
							{isDeleting ? (
								<Loader2Icon className={"animate-spin"} />
							) : (
								<Trash2Icon />
							)}
						</Button>
					</div>
				</Card>
			))}
		</div>
	);
};

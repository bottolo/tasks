import { useGetTaskById, useUpdateTask } from "@/api/tasks.ts";
import { Button } from "@/components/ui/button.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { type UpdateTask, updateTaskSchema } from "@/types/task.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, Loader2Icon, SaveIcon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";

export const EditTaskRoute = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	const { data: task } = useGetTaskById(id);
	const { mutate: updateTask, isPending: isUpdating } = useUpdateTask();

	const updateTaskForm = useForm<UpdateTask>({
		resolver: zodResolver(updateTaskSchema),
		defaultValues: {
			id: "",
			title: "",
			description: "",
			completed: false,
			updatedAt: new Date().toISOString(),
		},
	});

	useEffect(() => {
		if (task) {
			updateTaskForm.reset({
				id: String(task.id),
				title: task.title,
				description: task.description ?? "",
				completed: task.completed,
				updatedAt: new Date().toISOString(),
			});
		}
	}, [task]);

	const onUpdateSubmit = (data: UpdateTask) => {
		updateTask(data, {
			onSuccess: () => {
				navigate("/");
			},
			onError: (error) => {
				console.error("Failed to update task:", error);
			},
		});
	};

	return (
		<>
			<div className="flex items-center gap-2 mb-4">
				<Button
					variant="outline"
					onClick={() => navigate("/")}
					className="flex items-center gap-2"
					size={"sm"}
				>
					<ArrowLeftIcon className="h-4 w-4" />
					Return
				</Button>
				<Button
					form={"update-task-form"}
					type="submit"
					disabled={isUpdating}
					className="flex items-center gap-2"
					size={"sm"}
				>
					{isUpdating ? (
						<Loader2Icon className="animate-spin" />
					) : (
						<>
							<SaveIcon />
							Save
						</>
					)}
				</Button>
			</div>

			<Form {...updateTaskForm}>
				<form
					id={"update-task-form"}
					onSubmit={updateTaskForm.handleSubmit(onUpdateSubmit, (errors) =>
						console.log("Form validation errors:", errors),
					)}
					className="flex flex-col gap-6"
				>
					<FormField
						control={updateTaskForm.control}
						name="title"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Title</FormLabel>
								<FormControl>
									<Input
										type="text"
										{...field}
										placeholder="Enter task title"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={updateTaskForm.control}
						name="description"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Description</FormLabel>
								<FormControl>
									<Textarea
										rows={4}
										{...field}
										placeholder="Enter task description (optional)"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={updateTaskForm.control}
						name="completed"
						render={({ field }) => (
							<FormItem className="flex flex-row items-start space-x-3 space-y-0">
								<FormControl>
									<Checkbox
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								</FormControl>
								<FormLabel className="cursor-pointer">Task Completed</FormLabel>
							</FormItem>
						)}
					/>
				</form>
			</Form>
		</>
	);
};

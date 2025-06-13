import { useCreateTask } from "@/api/tasks.ts";
import { Button } from "@/components/ui/button.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { type CreateTask, type Task, createTaskSchema } from "@/types/task.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, Loader2Icon, SaveIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

export const CreateTaskRoute = () => {
	const navigate = useNavigate();
	const { mutate: createTask, isPending: isCreating } = useCreateTask();
	const createTaskForm = useForm<CreateTask>({
		resolver: zodResolver(createTaskSchema),
		defaultValues: {
			title: "",
			description: "",
			completed: false,
		},
	});

	const onCreateSubmit = (
		data: Omit<Task, "id" | "createdAt" | "updatedAt">,
	) => {
		createTask(data, {
			onSuccess: () => {
				createTaskForm.reset();
				navigate("/");
			},
		});
	};

	return (
		<div className={"flex flex-col gap-2"}>
			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					onClick={() => navigate(-1)}
					className="flex items-center gap-2"
				>
					<ArrowLeftIcon className="h-4 w-4" />
					Return
				</Button>
				<Button
					form={"create-task-form"}
					type="submit"
					disabled={isCreating}
					className="flex items-center gap-2"
				>
					{isCreating ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
					Save
				</Button>
			</div>
			<Form {...createTaskForm}>
				<form
					id={"create-task-form"}
					onSubmit={createTaskForm.handleSubmit(onCreateSubmit)}
					className="flex flex-col gap-4"
				>
					<FormField
						control={createTaskForm.control}
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
						control={createTaskForm.control}
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
						control={createTaskForm.control}
						name="completed"
						render={({ field }) => (
							<FormItem className="flex items-center">
								<Checkbox
									checked={field.value}
									onCheckedChange={(checked) => field.onChange(checked)}
									className="h-5 w-5"
								/>
								<FormLabel className="ml-2">Task Completed</FormLabel>
							</FormItem>
						)}
					/>
				</form>
			</Form>
		</div>
	);
};

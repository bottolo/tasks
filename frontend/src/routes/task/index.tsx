import { useGetTaskById } from "@/api/tasks.ts";
import { Button } from "@/components/ui/button.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { ArrowLeftIcon, Loader2Icon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { PiPencilSimpleLine } from "react-icons/pi";
import { Link, useNavigate, useParams } from "react-router";

export const IndexTaskRoute = () => {
	const { id } = useParams<{ id: string }>();
	const { data: task, isLoading } = useGetTaskById(id || "");
	const navigate = useNavigate();

	const taskForm = useForm({
		defaultValues: {
			title: "",
			description: "",
			completed: false,
		},
	});

	useEffect(() => {
		if (task) {
			taskForm.reset({
				title: task.title,
				description: task.description ?? "",
				completed: task.completed,
			});
		}
	}, [task, taskForm]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<Loader2Icon className="animate-spin text-gray-500" />
			</div>
		);
	}

	if (!task) {
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
				</div>
				<div className="flex items-center justify-center h-64">
					<p className="text-gray-600">Task not found.</p>
				</div>
			</div>
		);
	}

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
				<Link to={"edit"} state={{ id: task?.id }}>
					<Button className="flex items-center gap-2">
						<PiPencilSimpleLine />
						Edit Task
					</Button>
				</Link>
			</div>

			<Form {...taskForm}>
				<div className="flex flex-col gap-4">
					<FormField
						control={taskForm.control}
						name="title"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Title</FormLabel>
								<FormControl>
									<Input
										type="text"
										{...field}
										className="input bg-muted"
										readOnly
									/>
								</FormControl>
							</FormItem>
						)}
					/>

					<FormField
						control={taskForm.control}
						name="description"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Description</FormLabel>
								<FormControl>
									<Textarea
										rows={3}
										{...field}
										className="input bg-muted resize-none"
										readOnly
										placeholder={
											!field.value ? "No description available." : undefined
										}
									/>
								</FormControl>
							</FormItem>
						)}
					/>

					<FormField
						control={taskForm.control}
						name="completed"
						render={({ field }) => (
							<FormItem className="flex items-center space-x-3">
								<Checkbox
									checked={field.value}
									className="h-5 w-5 pointer-events-none"
									disabled
								/>
								<div className="flex items-center gap-2">
									<FormLabel className="cursor-default">
										Task Completed
									</FormLabel>
								</div>
							</FormItem>
						)}
					/>
				</div>
			</Form>
		</div>
	);
};

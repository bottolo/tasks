import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { cn } from "@/lib/cn.ts";
import {
	EllipsisVerticalIcon,
	EyeIcon,
	ListCheckIcon,
	ListXIcon,
	Loader2Icon,
	PencilIcon,
	PlusIcon,
	Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { useDeleteTask, useGetTasks } from "../api/tasks.ts";
import { Card } from "../components/ui/card.tsx";
import type { Task } from "../types/task.ts";

export const RootRoute = () => {
	const { data: tasks, isLoading: isLoadingTasks } = useGetTasks();
	const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask();

	const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
	const [deletingTaskId, setDeletingTaskId] = useState<string | undefined>(
		undefined,
	);

	const handleDeleteTask = (taskId: string) => {
		setDeletingTaskId(taskId);
		deleteTask(taskId);
	};

	const handleDeleteSelected = () => {
		selectedTasks.map((task: Task) => {
			deleteTask(task.id);
		});
		setSelectedTasks([]);
	};

	if (isLoadingTasks) {
		return (
			<div className="flex my-auto items-center justify-center h-screen">
				<Loader2Icon className="animate-spin h-6 w-6" />
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full gap-4">
			<div className={"flex flex-row justify-between"}>
				<div className={"flex flex-row gap-2"}>
					{selectedTasks.length > 0 ? (
						<Button onClick={() => setSelectedTasks([])} size={"sm"}>
							<ListXIcon /> Deselect All
						</Button>
					) : (
						<Button onClick={() => setSelectedTasks(tasks || [])} size={"sm"}>
							<ListCheckIcon /> Select All
						</Button>
					)}

					<Button
						className={
							selectedTasks?.length === 0 ? "opacity-0 cursor-default" : ""
						}
						onClick={handleDeleteSelected}
						variant={"destructive"}
						size={"sm"}
					>
						<Trash2Icon /> Delete Selected
					</Button>
				</div>

				<Link to={"create"}>
					<Button size={"sm"}>
						<PlusIcon />
						Create Task
					</Button>
				</Link>
			</div>

			<ScrollArea className="flex-1 h-1/2">
				<div className={"grid md:grid-cols-3 gap-4"}>
					{tasks?.map((task: Task) => (
						<Card
							className={cn(
								"relative flex flex-row items-center justify-between py-12 rounded-md transition-colors ease-in-out duration-200",
								selectedTasks.includes(task) && "bg-muted",
							)}
							key={task?.id}
						>
							{isDeleting && deletingTaskId === task.id && (
								<div className="absolute inset-0 bg-gray-200 backdrop-blur-lg opacity-50 flex items-center justify-center rounded-md transition-all ease-in-out">
									<Loader2Icon className="animate-spin h-6 w-6" />
								</div>
							)}
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
								className="absolute top-1 left-1 h-4 w-4"
							/>
							<div className={"flex flex-row gap-4 items-center pl-4"}>
								<div>
									<h3 className="text-lg font-semibold">{task.title}</h3>
									<p className="text-sm opacity-70">
										{task.description ?? "No description available."}
									</p>
								</div>
							</div>

							<DropdownMenu>
								<DropdownMenuTrigger className={"absolute top-1 right-1"}>
									<Button variant={"ghost"} className={"h-6 w-6"}>
										<EllipsisVerticalIcon />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent side={"bottom"} align={"end"}>
									<DropdownMenuLabel>Actions</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<Link to={`${task.id}`} state={{ id: task.id }}>
										<DropdownMenuItem>
											<EyeIcon />
											Details
										</DropdownMenuItem>
									</Link>

									<Link to={`${task.id}/edit`} state={{ id: task.id }}>
										<DropdownMenuItem>
											<PencilIcon />
											Edit
										</DropdownMenuItem>
									</Link>
									<DropdownMenuItem onClick={() => handleDeleteTask(task.id)}>
										<Trash2Icon />
										Delete
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>

							<Badge
								className={"absolute bottom-2 right-2"}
								variant={task?.completed ? "default" : "secondary"}
							>
								{task?.completed ? "Completed" : "Incomplete"}
							</Badge>
						</Card>
					))}
				</div>
			</ScrollArea>
		</div>
	);
};

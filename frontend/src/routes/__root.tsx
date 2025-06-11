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
import { Input } from "@/components/ui/input.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select.tsx";
import { cn } from "@/lib/cn.ts";
import _ from "lodash";
import {
	EllipsisVerticalIcon,
	EyeIcon,
	ListCheckIcon,
	ListXIcon,
	Loader2Icon,
	MenuIcon,
	PencilIcon,
	SearchIcon,
	Trash2Icon,
	XIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { useDeleteTask, useGetTasks } from "../api/tasks.ts";
import { Card } from "../components/ui/card.tsx";
import type { Task } from "../types/task.ts";

export const RootRoute = () => {
	const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
	const [deletingTaskId, setDeletingTaskId] = useState<string | undefined>(
		undefined,
	);
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
	const [completedFilter, setCompletedFilter] = useState<string>("all");

	const debouncedSetSearch = useCallback(
		_.debounce((value: string) => {
			setDebouncedSearchTerm(value);
		}, 300),
		[],
	);

	useEffect(() => {
		debouncedSetSearch(searchTerm);
		return () => {
			debouncedSetSearch.cancel();
		};
	}, [searchTerm, debouncedSetSearch]);

	const queryParams = {
		search: debouncedSearchTerm || undefined,
		completed:
			completedFilter === "completed"
				? true
				: completedFilter === "incomplete"
					? false
					: undefined,
	};

	const { data: tasks, isLoading: isLoadingTasks } = useGetTasks(queryParams);
	const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask();

	const handleDeleteTask = (taskId: string) => {
		setDeletingTaskId(taskId);
		deleteTask(taskId);
	};

	const handleDeleteSelected = () => {
		selectedTasks.map((task) => {
			deleteTask(task.id);
		});
		setSelectedTasks([]);
	};

	const clearSearch = () => {
		setSearchTerm("");
		setDebouncedSearchTerm("");
	};

	useEffect(() => {
		setSelectedTasks([]);
	}, [tasks]);

	if (isLoadingTasks) {
		return (
			<div className="flex my-auto items-center justify-center h-screen">
				<Loader2Icon className="animate-spin h-6 w-6" />
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full gap-4">
			<div className="flex flex-col gap-4">
				<div className="flex flex-row gap-2 items-center">
					<div className="relative flex-1">
						<SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search tasks..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10 pr-10 h-8"
						/>
						{searchTerm && (
							<Button
								onClick={clearSearch}
								variant="ghost"
								size="sm"
								className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
							>
								<XIcon className="h-4 w-4" />
							</Button>
						)}
					</div>
					<Select value={completedFilter} onValueChange={setCompletedFilter}>
						<SelectTrigger size={"sm"} className="w-40">
							<SelectValue placeholder="Filter by status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Tasks</SelectItem>
							<SelectItem value="completed">Completed</SelectItem>
							<SelectItem value="incomplete">Incomplete</SelectItem>
						</SelectContent>
					</Select>
					<div className="flex flex-row-reverse gap-2">
						<DropdownMenu>
							<DropdownMenuTrigger className="self-end">
								<Button variant="outline" size="sm">
									<MenuIcon />
									Actions
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent side="bottom" align="start">
								<DropdownMenuLabel>Task Management</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={() => setSelectedTasks([])}>
									<ListXIcon />
									Deselect All
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setSelectedTasks(tasks || [])}>
									<ListCheckIcon />
									Select All
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() =>
										selectedTasks?.map((task) => handleDeleteTask(task.id))
									}
								>
									<Trash2Icon />
									Delete All
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
						<Button
							className={
								selectedTasks?.length === 0 ? "opacity-0 cursor-default" : ""
							}
							onClick={handleDeleteSelected}
							variant="destructive"
							size="sm"
						>
							<Trash2Icon /> Delete Selected
						</Button>
					</div>
				</div>
			</div>

			{/* Results Info */}
			{(debouncedSearchTerm || completedFilter !== "all") && (
				<div className="text-sm text-muted-foreground">
					{tasks?.length === 0 ? (
						"No tasks found"
					) : (
						<>
							Found {tasks?.length} task{tasks?.length !== 1 ? "s" : ""}
							{debouncedSearchTerm && ` matching "${debouncedSearchTerm}"`}
							{completedFilter !== "all" && ` with status: ${completedFilter}`}
						</>
					)}
				</div>
			)}

			<ScrollArea className="flex-1 h-1/2">
				<div className="grid md:grid-cols-3 gap-4">
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
							<div className="flex flex-row gap-4 items-center pl-4">
								<div>
									<h3 className="text-lg font-semibold">{task.title}</h3>
									<p className="text-sm opacity-70">
										{task.description ?? "No description available."}
									</p>
								</div>
							</div>

							<DropdownMenu>
								<DropdownMenuTrigger className="absolute top-1 right-1">
									<Button variant="ghost" className="h-6 w-6">
										<EllipsisVerticalIcon />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent side="bottom" align="end">
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
								className="absolute bottom-2 right-2"
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

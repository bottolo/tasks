import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination.tsx";
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
import { Loader2Icon, SearchIcon, XIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	PiCheckCircle,
	PiCheckCircleFill,
	PiDot,
	PiDotsThreeVertical,
	PiListChecks,
	PiListPlus,
	PiPencilSimpleLine,
	PiPlus,
	PiSpinner,
	PiSpinnerGap,
	PiTextAlignLeft,
	PiTrash,
	PiX,
} from "react-icons/pi";
import { Link } from "react-router";
import {
	useDeleteTask,
	useDeleteTasks,
	useGetTasks,
	useUpdateTask,
	useUpdateTasks,
} from "../api/tasks.ts";
import type { Task } from "../types/task.ts";

const ITEMS_PER_PAGE = 9;

export const RootRoute = () => {
	const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(
		new Set(),
	);
	const [deletingTaskId, setDeletingTaskId] = useState<string | undefined>(
		undefined,
	);
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
	const [completedFilter, setCompletedFilter] = useState<string>("all");
	const [currentPage, setCurrentPage] = useState(1);

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
	const { mutate: deleteTask, isPending: isDeletingTask } = useDeleteTask();
	const { mutate: updateTask } = useUpdateTask();
	const { mutate: updateTasks, isPending: isUpdatingTasks } = useUpdateTasks();
	const { mutate: deleteTasks, isPending: isDeletingTasks } = useDeleteTasks();

	const debouncedSetSearch = useCallback(
		_.debounce((value: string) => {
			setDebouncedSearchTerm(value);
		}, 300),
		[],
	);

	const handleDeleteTask = (taskId: string) => {
		setDeletingTaskId(taskId);
		deleteTask(taskId);
	};

	const clearSearch = () => {
		setSearchTerm("");
		setDebouncedSearchTerm("");
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	const handleSelectAllVisible = () => {
		setSelectedTaskIds((prev) => {
			const newSet = new Set(prev);
			_.forEach(paginatedTasks, (task) => newSet.add(task.id));
			return newSet;
		});
	};

	const handleSelectAll = () => {
		setSelectedTaskIds(new Set(_.map(tasks, "id")));
	};

	const handleToggleTaskSelection = (task: Task, checked: boolean) => {
		if (checked) {
			setSelectedTaskIds((prev) => new Set([...prev, task.id]));
		} else {
			setSelectedTaskIds((prev) => {
				const newSet = new Set(prev);
				newSet.delete(task.id);
				return newSet;
			});
		}
	};

	const handleMarkSelectedAsCompleted = () => {
		const updatedTasks = _.map(selectedTasks, (task) =>
			_.assign({}, task, { completed: true }),
		);
		updateTasks(updatedTasks);
	};

	const handleMarkSelectedAsInProgress = () => {
		const updatedTasks = _.map(selectedTasks, (task) =>
			_.assign({}, task, { completed: false }),
		);
		updateTasks(updatedTasks);
	};

	const handleDeleteSelected = () => {
		deleteTasks(Array.from(selectedTaskIds));
	};

	const handleDeselectAll = () => {
		setSelectedTaskIds(new Set());
	};

	const selectedTasks = useMemo(
		() =>
			tasks ? _.filter(tasks, (task) => selectedTaskIds.has(task.id)) : [],
		[tasks, selectedTaskIds],
	);

	const { paginatedTasks, totalPages, startIndex, endIndex } = useMemo(() => {
		if (!tasks || tasks.length === 0) {
			return {
				paginatedTasks: [],
				totalPages: 0,
				startIndex: 0,
				endIndex: 0,
			};
		}

		const sortedTasks = _.orderBy(tasks, ["id"], ["asc"]);
		const chunks = _.chunk(sortedTasks, ITEMS_PER_PAGE);
		const total = chunks.length;
		const currentTasks = chunks[currentPage - 1] || [];
		const start = (currentPage - 1) * ITEMS_PER_PAGE + 1;
		const end = Math.min(currentPage * ITEMS_PER_PAGE, sortedTasks.length);

		return {
			paginatedTasks: currentTasks,
			totalPages: total,
			startIndex: start,
			endIndex: end,
		};
	}, [tasks, currentPage]);

	useEffect(() => {
		debouncedSetSearch(searchTerm);
		return () => {
			debouncedSetSearch.cancel();
		};
	}, [searchTerm, debouncedSetSearch]);

	useEffect(() => {
		setCurrentPage(1);
	}, [debouncedSearchTerm, completedFilter]);

	useEffect(() => {
		setSelectedTaskIds(new Set());
	}, [tasks]);

	return (
		<div className="flex flex-col h-full gap-2">
			<div className="flex flex-col gap-4">
				<div className="relative flex-1 md:hidden block">
					<SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search tasks..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10 pr-10"
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
				<div className="flex flex-row gap-2 items-center">
					<div className="relative flex-1 hidden md:block">
						<SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search tasks..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10 pr-10"
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
						<SelectTrigger className="w-40 md:mr-8">
							<SelectValue placeholder="Filter by status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">
								<PiDot />
								All Tasks
							</SelectItem>
							<SelectItem value="completed">
								<PiCheckCircle />
								Completed
							</SelectItem>
							<SelectItem value="incomplete">
								<PiSpinnerGap />
								In progress
							</SelectItem>
						</SelectContent>
					</Select>
					<div className="flex flex-row gap-2">
						<Link to="/create">
							<Button>
								<PiPlus />
								Add Task
							</Button>
						</Link>
						<Button
							disabled={selectedTaskIds.size === 0 || isDeletingTask}
							onClick={handleDeleteSelected}
							variant="destructive"
						>
							{isDeletingTasks ? (
								<PiSpinner className="animate-spin" />
							) : (
								<PiTrash />
							)}
							Delete Selected
						</Button>

						<DropdownMenu>
							<DropdownMenuTrigger className="self-end">
								<Button variant="outline">
									<PiDotsThreeVertical className={"scale-125"} />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className={"w-[200px]"}
								side="bottom"
								align="end"
							>
								<DropdownMenuItem
									onClick={handleMarkSelectedAsCompleted}
									disabled={selectedTaskIds.size === 0 || isUpdatingTasks}
								>
									<PiCheckCircle />
									Mark Selected as Completed
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={handleMarkSelectedAsInProgress}
									disabled={selectedTaskIds.size === 0 || isUpdatingTasks}
								>
									<PiSpinnerGap />
									Mark Selected as In Progress
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={handleDeselectAll}>
									<PiX />
									Deselect All
								</DropdownMenuItem>
								<DropdownMenuItem onClick={handleSelectAllVisible}>
									<PiListPlus />
									Select Visible
								</DropdownMenuItem>
								<DropdownMenuItem onClick={handleSelectAll}>
									<PiListChecks />
									Select All ({tasks?.length || 0})
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</div>

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

			{tasks && tasks.length > 0 && (
				<div className="flex justify-between items-center text-sm text-muted-foreground">
					<span>
						Showing {startIndex}-{endIndex} of {tasks.length} tasks
					</span>
					<div className={"flex flex-row gap-1"}>
						{selectedTaskIds.size > 0 && (
							<span>
								Selected {selectedTaskIds.size} task
								{selectedTaskIds.size !== 1 ? "s" : ""},
							</span>
						)}
						<span>
							Page {currentPage} of {totalPages}
						</span>
					</div>
				</div>
			)}
			{isLoadingTasks ? (
				<div className="flex my-auto items-center justify-center h-screen">
					<PiSpinner className="animate-spin" size={24} />
				</div>
			) : (
				<ScrollArea className={cn("flex-1 h-1/2")}>
					<div className="grid md:grid-cols-3 gap-4">
						{paginatedTasks.map((task: Task) => (
							<Card
								className={cn(
									"relative flex flex-col py-4 px-4 rounded-md transition-colors ease-in-out duration-200 min-h-[150px]",
									selectedTaskIds.has(task.id) && "bg-muted",
								)}
								key={task?.id}
							>
								{isDeletingTask && deletingTaskId === task.id && (
									<div className="absolute inset-0 bg-gray-200 backdrop-blur-lg opacity-50 flex items-center justify-center rounded-md transition-all ease-in-out">
										<Loader2Icon className="animate-spin h-6 w-6" />
									</div>
								)}

								<div className="flex justify-between items-center">
									<Checkbox
										checked={selectedTaskIds.has(task.id)}
										onCheckedChange={(checked) =>
											handleToggleTaskSelection(task, !!checked)
										}
										className="h-5 w-5"
									/>

									<DropdownMenu>
										<DropdownMenuTrigger
											className={
												"hover:bg-stone-200 transition-colors ease-in-out duration-50 rounded-md"
											}
										>
											<PiDotsThreeVertical
												className={"cursor-pointer"}
												size={24}
											/>
										</DropdownMenuTrigger>
										<DropdownMenuContent
											className={"w-[200px]"}
											side="bottom"
											align="end"
										>
											<DropdownMenuItem
												onClick={() =>
													updateTask(_.assign({}, task, { completed: true }))
												}
											>
												<PiCheckCircle />
												Mark as Completed
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() =>
													updateTask(_.assign({}, task, { completed: false }))
												}
											>
												<PiSpinnerGap />
												Mark as In Progress
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<Link to={`${task.id}`} state={{ id: task.id }}>
												<DropdownMenuItem>
													<PiTextAlignLeft />
													Details
												</DropdownMenuItem>
											</Link>

											<Link to={`${task.id}/edit`} state={{ id: task.id }}>
												<DropdownMenuItem>
													<PiPencilSimpleLine />
													Edit
												</DropdownMenuItem>
											</Link>
											<DropdownMenuItem
												onClick={() => handleDeleteTask(task.id)}
											>
												<PiTrash color={"red"} />
												<span className={"text-red-500"}>Delete</span>
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>

								<div className="flex-1">
									<h3 className="text-2xl font-semibold mb-2">{task.title}</h3>
									<p className="text-md opacity-70">
										{task.description ?? "No description available."}
									</p>
								</div>

								<div className="flex justify-between items-center">
									<span className="text-md text-muted-foreground">
										FT-{task.id}
									</span>
									<Badge
										variant={task?.completed ? "default" : "secondary"}
										className={
											"h-7 text-md gap-2 font-light hover:scale-101 transition-transform ease-in-out duration-200"
										}
									>
										{task?.completed ? (
											<PiCheckCircleFill className={"scale-125"} />
										) : (
											<PiSpinnerGap className={"scale-125 "} />
										)}
										{task?.completed ? "Completed" : "In progress"}
									</Badge>
								</div>
							</Card>
						))}
					</div>
				</ScrollArea>
			)}

			{totalPages > 1 && (
				<Pagination>
					<PaginationContent className={"w-full flex flex-row justify-between"}>
						<PaginationItem>
							<PaginationPrevious
								onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
								className={
									currentPage === 1
										? "pointer-events-none opacity-50"
										: "cursor-pointer"
								}
							/>
						</PaginationItem>
						<div className={"flex flex-row gap-4"}>
							{currentPage > 2 && (
								<PaginationItem>
									<PaginationLink
										onClick={() => handlePageChange(1)}
										className="cursor-pointer"
									>
										1
									</PaginationLink>
								</PaginationItem>
							)}

							{currentPage > 3 && (
								<PaginationItem>
									<PaginationEllipsis />
								</PaginationItem>
							)}

							{currentPage > 1 && (
								<PaginationItem>
									<PaginationLink
										onClick={() => handlePageChange(currentPage - 1)}
										className="cursor-pointer"
									>
										{currentPage - 1}
									</PaginationLink>
								</PaginationItem>
							)}

							<PaginationItem>
								<PaginationLink className="bg-primary text-primary-foreground pointer-events-none">
									{currentPage}
								</PaginationLink>
							</PaginationItem>

							{currentPage < totalPages && (
								<PaginationItem>
									<PaginationLink
										onClick={() => handlePageChange(currentPage + 1)}
										className="cursor-pointer"
									>
										{currentPage + 1}
									</PaginationLink>
								</PaginationItem>
							)}

							{currentPage < totalPages - 2 && (
								<PaginationItem>
									<PaginationEllipsis />
								</PaginationItem>
							)}

							{currentPage < totalPages - 1 && (
								<PaginationItem>
									<PaginationLink
										onClick={() => handlePageChange(totalPages)}
										className="cursor-pointer"
									>
										{totalPages}
									</PaginationLink>
								</PaginationItem>
							)}
						</div>

						<PaginationItem>
							<PaginationNext
								onClick={() =>
									handlePageChange(Math.min(totalPages, currentPage + 1))
								}
								className={
									currentPage === totalPages
										? "pointer-events-none opacity-50"
										: "cursor-pointer"
								}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			)}
		</div>
	);
};

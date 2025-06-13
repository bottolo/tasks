import { TaskCard } from "@/components/task-card.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
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
import _ from "lodash";
import { Loader2Icon, SearchIcon, XIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	PiCheckCircle,
	PiDot,
	PiDotsThreeVertical,
	PiListChecks,
	PiListPlus,
	PiPlus,
	PiSpinnerGap,
	PiTrash,
	PiX,
} from "react-icons/pi";
import { Link } from "react-router";
import { useDeleteTask, useGetTasks } from "../api/tasks.ts";
import type { Task } from "../types/task.ts";

const ITEMS_PER_PAGE = 9;

export const RootRoute = () => {
	const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
	const [deletingTaskId, setDeletingTaskId] = useState<string | undefined>(
		undefined,
	);
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
	const [completedFilter, setCompletedFilter] = useState<string>("all");
	const [currentPage, setCurrentPage] = useState(1);

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

	const { paginatedTasks, totalPages, startIndex, endIndex } = useMemo(() => {
		if (!tasks || tasks.length === 0) {
			return {
				paginatedTasks: [],
				totalPages: 0,
				startIndex: 0,
				endIndex: 0,
			};
		}

		const chunks = _.chunk(tasks, ITEMS_PER_PAGE);
		const total = chunks.length;
		const currentTasks = chunks[currentPage - 1] || [];
		const start = (currentPage - 1) * ITEMS_PER_PAGE + 1;
		const end = Math.min(currentPage * ITEMS_PER_PAGE, tasks.length);

		return {
			paginatedTasks: currentTasks,
			totalPages: total,
			startIndex: start,
			endIndex: end,
		};
	}, [tasks, currentPage]);

	useEffect(() => {
		setCurrentPage(1);
	}, [debouncedSearchTerm, completedFilter]);

	useEffect(() => {
		setSelectedTasks([]);
	}, [tasks]);

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

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	const handleSelectAllVisible = () => {
		setSelectedTasks((prev) => {
			const currentIds = new Set(prev.map((t) => t.id));
			const newTasks = paginatedTasks.filter(
				(task) => !currentIds.has(task.id),
			);
			return [...prev, ...newTasks];
		});
	};

	const handleSelectAll = () => {
		setSelectedTasks(tasks || []);
	};

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
								Incomplete
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
							disabled={selectedTasks.length === 0 || isDeleting}
							onClick={handleDeleteSelected}
							variant="destructive"
						>
							<PiTrash />
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
								<DropdownMenuItem onClick={() => setSelectedTasks([])}>
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
								<DropdownMenuItem
									onClick={() =>
										selectedTasks?.map((task) => handleDeleteTask(task.id))
									}
								>
									<PiTrash color={"red"} />
									<span className={"text-red-500"}>Delete Selected</span>
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
					<span>
						Page {currentPage} of {totalPages}
					</span>
				</div>
			)}

			{isLoadingTasks ? (
				<div className="flex my-auto items-center justify-center h-screen">
					<Loader2Icon className="animate-spin h-6 w-6" />
				</div>
			) : (
				<ScrollArea className="flex-1 h-1/2">
					<div className="grid md:grid-cols-3 gap-4">
						{paginatedTasks.map((task: Task) => (
							<TaskCard
								key={task.id}
								task={task}
								selectedTasks={selectedTasks}
								setSelectedTasks={setSelectedTasks}
								isDeleting={isDeleting}
								deletingTaskId={deletingTaskId}
								handleDeleteTask={handleDeleteTask}
							/>
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

import { Badge } from "@/components/ui/badge.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { cn } from "@/lib/cn.ts";
import { Loader2Icon } from "lucide-react";
import {
	PiCheckCircle,
	PiCheckCircleFill,
	PiDotsThreeVertical,
	PiPencilSimpleLine,
	PiSpinnerGap,
	PiTextAlignLeft,
	PiTrash,
} from "react-icons/pi";
import { Link } from "react-router";
import { Card } from "../components/ui/card.tsx";
import type { Task } from "../types/task.ts";

interface TaskCardProps {
	task: Task;
	selectedTasks: Task[];
	setSelectedTasks: React.Dispatch<React.SetStateAction<Task[]>>;
	isDeleting: boolean;
	deletingTaskId: string | undefined;
	handleDeleteTask: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
	task,
	selectedTasks,
	setSelectedTasks,
	isDeleting,
	deletingTaskId,
	handleDeleteTask,
}) => {
	return (
		<Card
			className={cn(
				"relative flex flex-col py-4 px-4 rounded-md transition-colors ease-in-out duration-200 min-h-[150px]",
				selectedTasks.includes(task) && "bg-muted",
			)}
			key={task?.id}
		>
			{isDeleting && deletingTaskId === task.id && (
				<div className="absolute inset-0 bg-gray-200 backdrop-blur-lg opacity-50 flex items-center justify-center rounded-md transition-all ease-in-out">
					<Loader2Icon className="animate-spin h-6 w-6" />
				</div>
			)}

			<div className="flex justify-between items-center">
				<Checkbox
					checked={selectedTasks.includes(task)}
					onCheckedChange={(checked) => {
						if (checked) {
							setSelectedTasks((prev) => [...prev, task]);
						} else {
							setSelectedTasks((prev) => prev.filter((t) => t.id !== task.id));
						}
					}}
					className="h-5 w-5"
				/>

				<DropdownMenu>
					<DropdownMenuTrigger
						className={
							"hover:bg-stone-200 transition-colors ease-in-out duration-50 rounded-md"
						}
					>
						<PiDotsThreeVertical className={"cursor-pointer"} size={24} />
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className={"w-[170px]"}
						side="bottom"
						align="end"
					>
						<DropdownMenuItem>
							<PiCheckCircle />
							Complete Task
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
						<DropdownMenuItem onClick={() => handleDeleteTask(task.id)}>
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
				<span className="text-md text-muted-foreground">FT-{task.id}</span>
				<Badge
					variant={task?.completed ? "default" : "secondary"}
					className={"h-7 text-md gap-2 font-light"}
				>
					{task?.completed ? (
						<PiCheckCircleFill className={"scale-125"} />
					) : (
						<PiSpinnerGap className={"scale-125"} />
					)}
					{task?.completed ? "Completed" : "In progress"}
				</Badge>
			</div>
		</Card>
	);
};

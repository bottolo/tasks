import { Button } from "@/components/ui/button.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import {
	ListCheckIcon,
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
	const { data: tasks } = useGetTasks();
	const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask();

	const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);

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

				<Link to={"create"}>
					<Button>
						{" "}
						<PlusIcon />
						Add Task
					</Button>
				</Link>
			</div>

			{tasks?.map((task: Task) => (
				<Card className={"flex flex-col gap-4 px-4 py-4"} key={task?.id}>
					<div className={"flex flex-row justify-between items-center"}>
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
							<Link to={`${task.id}/edit`} state={{ id: task.id }}>
								<Button className={"rounded-r-none"} variant="outline">
									<PencilIcon /> Edit
								</Button>
							</Link>
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
					</div>
				</Card>
			))}
		</div>
	);
};

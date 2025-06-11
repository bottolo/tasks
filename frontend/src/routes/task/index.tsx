import { useGetTaskById } from "@/api/tasks.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { Card } from "@/components/ui/card.tsx";
import { Loader2Icon } from "lucide-react";
import { useParams } from "react-router";

export const IndexTaskRoute = () => {
	const { id } = useParams<{ id: string }>();
	const { data: task, isLoading } = useGetTaskById(id);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<Loader2Icon className="animate-spin text-gray-500" />
			</div>
		);
	}

	return (
		<Card className="flex flex-col items-center justify-center">
			{task ? (
				<div className={"px-4"}>
					<div className={"flex flex-row items-center gap-2"}>
						<h2 className="text-xl font-semibold">{task.title}</h2>-
						<Badge>{task.completed ? "Completed" : "Incomplete"}</Badge>
					</div>
					<p className="mt-2 text-gray-600">{task.description}</p>
				</div>
			) : (
				<p className="text-gray-600">Task not found.</p>
			)}
		</Card>
	);
};

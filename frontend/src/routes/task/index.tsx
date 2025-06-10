import { useGetTaskById } from "@/api/tasks.ts";
import { useParams } from "react-router";

export const IndexTaskRoute = () => {
	const { id } = useParams<{ id: string }>();
	const { data: task, isLoading } = useGetTaskById(id);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<Loader2Icon className="animate-spin h-8 w-8 text-gray-500" />
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center justify-center h-screen">
			<h1 className="text-2xl font-bold mb-4">Task Details</h1>
			{task ? (
				<div className="bg-white shadow-md rounded-lg p-6 max-w-md w-full">
					<h2 className="text-xl font-semibold">{task.title}</h2>
					<p className="mt-2 text-gray-600">{task.description}</p>
					<p className="mt-4 text-sm text-gray-500">
						Status: {task.completed ? "Completed" : "Incomplete"}
					</p>
				</div>
			) : (
				<p className="text-gray-600">Task not found.</p>
			)}
		</div>
	);
};

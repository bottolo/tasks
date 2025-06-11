import { useNavigationStore } from "@/stores/navigation-store.ts";
import type { LoaderFunctionArgs } from "react-router";

/**
 * Very basic breadcrumb and header loaders. For the purpose of this project I'd stick to this simplified approach.
 */
export const homeLoader = () => {
	useNavigationStore.getState().setBreadcrumbs([{ label: "Home", href: "/" }]);
	useNavigationStore.getState().setHeader({
		title: "Just a simple task manager.",
		subtitle:
			"Feel free to test creation, update, deletion and bulk selection. Take your time.",
	});
	return null;
};

export const createTaskLoader = () => {
	const store = useNavigationStore.getState();
	store.setBreadcrumbs([
		{ label: "Home", href: "/" },
		{ label: "Create Task", isActive: true },
	]);
	store.setHeader({
		title: "Create a new task.",
		subtitle:
			"Fill in the details to create a new task. Description is optional.",
	});
	return null;
};

export const editTaskLoader = ({ params }: LoaderFunctionArgs) => {
	const store = useNavigationStore.getState();
	store.setBreadcrumbs([
		{ label: "Home", href: "/" },
		{ label: `Task #${params.id}`, href: `/${params.id}` },
		{ label: `Edit Task #${params.id}`, isActive: true },
	]);
	store.setHeader({
		title: `Editing Task #${params.id}`,
		subtitle: "Update the task details below.",
	});
	return null;
};

export const viewTaskLoader = ({ params }: LoaderFunctionArgs) => {
	const store = useNavigationStore.getState();
	store.setBreadcrumbs([
		{ label: "Home", href: "/" },
		{ label: `Task #${params.id}`, isActive: true },
	]);
	store.setHeader({
		title: `Task #${params.id}`,
		subtitle: "View the details of the task.",
	});
	return null;
};

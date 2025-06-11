import { create } from "zustand";

export interface BreadcrumbItem {
	label: string;
	href?: string;
	isActive?: boolean;
}

interface NavigationState {
	header: {
		title: string;
		subtitle: string;
	};
	setHeader: (header: { title: string; subtitle: string }) => void;
	breadcrumbs: BreadcrumbItem[];
	setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
	clearBreadcrumbs: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
	header: {
		title: "Welcome to a simple task manager.",
		subtitle:
			"Feel free to test creation, update, deletion and bulk selection. Take your time.",
	},
	setHeader: (header: { title: string; subtitle: string }) => set({ header }),
	breadcrumbs: [],
	setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
	clearBreadcrumbs: () => set({ breadcrumbs: [] }),
}));

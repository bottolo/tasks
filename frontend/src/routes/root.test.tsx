import {
	useDeleteTask,
	useDeleteTasks,
	useGetTasks,
	useUpdateTask,
	useUpdateTasks,
} from "@/api/tasks.ts";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RootRoute } from "./__root";

vi.mock("@/api/tasks.ts", () => ({
	useGetTasks: vi.fn(),
	useDeleteTask: vi.fn(),
	useUpdateTask: vi.fn(),
	useUpdateTasks: vi.fn(),
	useDeleteTasks: vi.fn(),
}));

vi.mock("react-router", async () => {
	const actual = await vi.importActual("react-router");
	return {
		...actual,
		Link: ({ children, to }: any) => (
			<a href={to} data-testid="link">
				{children}
			</a>
		),
	};
});

vi.mock("react-icons/pi", () => ({
	PiCheckCircle: () => <span>CheckCircle</span>,
	PiCheckCircleFill: () => <span>CheckCircleFill</span>,
	PiDot: () => <span>Dot</span>,
	PiDotsThreeVertical: () => <span>DotsVertical</span>,
	PiListChecks: () => <span>ListChecks</span>,
	PiListPlus: () => <span>ListPlus</span>,
	PiPencilSimpleLine: () => <span>PencilLine</span>,
	PiPlus: () => <span>Plus</span>,
	PiSpinner: () => <span>Spinner</span>,
	PiSpinnerGap: () => <span>SpinnerGap</span>,
	PiTextAlignLeft: () => <span>TextAlign</span>,
	PiTrash: () => <span>Trash</span>,
	PiX: () => <span>X</span>,
}));

vi.mock("lodash", () => ({
	default: {
		debounce: (fn: any) => {
			const debouncedFn = (...args: any[]) => fn(...args);
			debouncedFn.cancel = vi.fn();
			return debouncedFn;
		},
		forEach: (arr: any[], fn: any) => arr.forEach(fn),
		map: (arr: any[], key: string) =>
			arr.map((item) => (typeof key === "string" ? item[key] : key(item))),
		filter: (arr: any[], fn: any) => arr.filter(fn),
		assign: (target: any, ...sources: any[]) =>
			Object.assign(target, ...sources),
		orderBy: (arr: any[], keys: string[], orders: string[]) => [...arr].sort(),
		chunk: (arr: any[], size: number) => {
			const chunks = [];
			for (let i = 0; i < arr.length; i += size) {
				chunks.push(arr.slice(i, i + size));
			}
			return chunks;
		},
	},
}));

vi.mock("@/components/ui/badge.tsx", () => ({
	Badge: ({ children, variant }: any) => (
		<span data-variant={variant} data-testid="badge">
			{children}
		</span>
	),
}));

vi.mock("@/components/ui/button.tsx", () => ({
	Button: ({ children, onClick, disabled, variant }: any) => (
		<button
			onClick={onClick}
			disabled={disabled}
			data-variant={variant}
			data-testid="button"
		>
			{children}
		</button>
	),
}));

vi.mock("@/components/ui/card.tsx", () => ({
	Card: ({ children, className }: any) => (
		<div className={className} data-testid="task-card">
			{children}
		</div>
	),
}));

vi.mock("@/components/ui/checkbox.tsx", () => ({
	Checkbox: ({ checked, onCheckedChange }: any) => (
		<input
			type="checkbox"
			checked={checked}
			onChange={(e) => onCheckedChange?.(e.target.checked)}
			data-testid="task-checkbox"
		/>
	),
}));

vi.mock("@/components/ui/input.tsx", () => ({
	Input: (props: any) => <input {...props} data-testid="search-input" />,
}));

vi.mock("@/components/ui/select.tsx", () => ({
	Select: ({ children, value, onValueChange }: any) => (
		<div data-testid="filter-select" data-value={value}>
			<button onClick={() => onValueChange?.("completed")}>{children}</button>
		</div>
	),
	SelectContent: ({ children }: any) => <div>{children}</div>,
	SelectItem: ({ children, value }: any) => (
		<div data-value={value}>{children}</div>
	),
	SelectTrigger: ({ children }: any) => <div>{children}</div>,
	SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}));

vi.mock("@/components/ui/dropdown-menu.tsx", () => ({
	DropdownMenu: ({ children }: any) => <div>{children}</div>,
	DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
	DropdownMenuItem: ({ children, onClick }: any) => (
		<button onClick={onClick} data-testid="dropdown-item">
			{children}
		</button>
	),
	DropdownMenuSeparator: () => <div />,
	DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/ui/scroll-area.tsx", () => ({
	ScrollArea: ({ children }: any) => (
		<div data-testid="scroll-area">{children}</div>
	),
}));

vi.mock("@/components/ui/pagination.tsx", () => ({
	Pagination: ({ children }: any) => (
		<div data-testid="pagination">{children}</div>
	),
	PaginationContent: ({ children }: any) => <div>{children}</div>,
	PaginationEllipsis: () => <span>...</span>,
	PaginationItem: ({ children }: any) => <div>{children}</div>,
	PaginationLink: ({ children, onClick }: any) => (
		<button onClick={onClick} data-testid="page-link">
			{children}
		</button>
	),
	PaginationNext: ({ onClick }: any) => (
		<button onClick={onClick} data-testid="page-next">
			Next
		</button>
	),
	PaginationPrevious: ({ onClick }: any) => (
		<button onClick={onClick} data-testid="page-prev">
			Previous
		</button>
	),
}));

/**
 * Tests for RootRoute component
 *
 * Tests the main task list component that handles:
 * - Task display with pagination
 * - Search and filtering functionality
 * - Task selection and bulk operations
 * - Individual task actions
 * - Loading and empty states
 */

describe("RootRoute", () => {
	const mockTasks = [
		{
			id: "1",
			title: "Test Task 1",
			description: "Description 1",
			completed: false,
			createdAt: "2023-01-01T00:00:00.000Z",
			updatedAt: "2023-01-01T00:00:00.000Z",
		},
		{
			id: "2",
			title: "Test Task 2",
			description: "Description 2",
			completed: true,
			createdAt: "2023-01-02T00:00:00.000Z",
			updatedAt: "2023-01-02T00:00:00.000Z",
		},
		{
			id: "3",
			title: "Another Task",
			description: "",
			completed: false,
			createdAt: "2023-01-03T00:00:00.000Z",
			updatedAt: "2023-01-03T00:00:00.000Z",
		},
	];

	const mockDeleteTask = vi.fn();
	const mockUpdateTask = vi.fn();
	const mockUpdateTasks = vi.fn();
	const mockDeleteTasks = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		vi.mocked(useGetTasks).mockReturnValue({
			data: mockTasks,
			isLoading: false,
		});

		vi.mocked(useDeleteTask).mockReturnValue({
			mutate: mockDeleteTask,
			isPending: false,
		});

		vi.mocked(useUpdateTask).mockReturnValue({
			mutate: mockUpdateTask,
			isPending: false,
		});

		vi.mocked(useUpdateTasks).mockReturnValue({
			mutate: mockUpdateTasks,
			isPending: false,
		});

		vi.mocked(useDeleteTasks).mockReturnValue({
			mutate: mockDeleteTasks,
			isPending: false,
		});
	});

	it("renders task list when tasks are loaded", () => {
		render(
			<MemoryRouter>
				<RootRoute />
			</MemoryRouter>,
		);

		expect(screen.getAllByTestId("task-card")).toHaveLength(3);
		expect(screen.getByText("Test Task 1")).toBeInTheDocument();
		expect(screen.getByText("Test Task 2")).toBeInTheDocument();
		expect(screen.getByText("Another Task")).toBeInTheDocument();
	});

	it("shows loading state while fetching tasks", () => {
		vi.mocked(useGetTasks).mockReturnValue({
			data: undefined,
			isLoading: true,
		});

		render(
			<MemoryRouter>
				<RootRoute />
			</MemoryRouter>,
		);

		expect(screen.getByText("Spinner")).toBeInTheDocument();
	});

	it("displays search input", () => {
		render(
			<MemoryRouter>
				<RootRoute />
			</MemoryRouter>,
		);

		const searchInput = screen.getAllByTestId("search-input")[0];
		expect(searchInput).toBeInTheDocument();
		expect(searchInput).toHaveAttribute("placeholder", "Search tasks...");
	});

	it("allows task search", async () => {
		render(
			<MemoryRouter>
				<RootRoute />
			</MemoryRouter>,
		);

		const searchInput = screen.getAllByTestId("search-input")[0];
		fireEvent.change(searchInput, { target: { value: "Test Task" } });

		expect(searchInput.value).toBe("Test Task");

		await waitFor(() => {
			expect(useGetTasks).toHaveBeenCalledWith({
				search: "Test Task",
				completed: undefined,
			});
		});
	});

	it("displays filter dropdown", () => {
		render(
			<MemoryRouter>
				<RootRoute />
			</MemoryRouter>,
		);

		const filterSelect = screen.getByTestId("filter-select");
		expect(filterSelect).toBeInTheDocument();
		expect(filterSelect).toHaveAttribute("data-value", "all");
	});

	it("shows task status badges", () => {
		render(
			<MemoryRouter>
				<RootRoute />
			</MemoryRouter>,
		);

		const badges = screen.getAllByTestId("badge");
		expect(badges).toHaveLength(3);

		expect(screen.getByText("CheckCircleFill")).toBeInTheDocument(); // Completed task
		expect(screen.getAllByText("SpinnerGap").length).toBeGreaterThan(0);
	});

	it("allows task selection", () => {
		render(
			<MemoryRouter>
				<RootRoute />
			</MemoryRouter>,
		);

		const checkboxes = screen.getAllByTestId("task-checkbox");
		expect(checkboxes).toHaveLength(3);

		fireEvent.click(checkboxes[0]);
		expect(checkboxes[0]).toBeChecked();
	});

	it("displays pagination info when tasks are present", () => {
		render(
			<MemoryRouter>
				<RootRoute />
			</MemoryRouter>,
		);

		expect(screen.getByText(/Showing 1-3 of 3 tasks/)).toBeInTheDocument();
		expect(screen.getByText(/Page 1 of 1/)).toBeInTheDocument();
	});

	it("shows Add Task button", () => {
		render(
			<MemoryRouter>
				<RootRoute />
			</MemoryRouter>,
		);

		expect(screen.getByText("Add Task")).toBeInTheDocument();
		expect(screen.getByText("Plus")).toBeInTheDocument();
	});

	it("displays Delete Selected button", () => {
		render(
			<MemoryRouter>
				<RootRoute />
			</MemoryRouter>,
		);

		expect(screen.getByText("Delete Selected")).toBeInTheDocument();
		expect(screen.getAllByText("Trash").length).toBeGreaterThan(0);
	});

	it("shows dropdown menu actions", () => {
		render(
			<MemoryRouter>
				<RootRoute />
			</MemoryRouter>,
		);

		expect(screen.getAllByText("DotsVertical")).toHaveLength(4); // 3 task cards + 1 bulk actions
	});

	it("displays task titles and descriptions", () => {
		render(
			<MemoryRouter>
				<RootRoute />
			</MemoryRouter>,
		);

		expect(screen.getByText("Test Task 1")).toBeInTheDocument();
		expect(screen.getByText("Description 1")).toBeInTheDocument();
		expect(screen.getByText("Test Task 2")).toBeInTheDocument();
		expect(screen.getByText("Description 2")).toBeInTheDocument();
		expect(screen.getByText("Another Task")).toBeInTheDocument();
	});

	it("shows task IDs with FT prefix", () => {
		render(
			<MemoryRouter>
				<RootRoute />
			</MemoryRouter>,
		);

		expect(screen.getByText("FT-1")).toBeInTheDocument();
		expect(screen.getByText("FT-2")).toBeInTheDocument();
		expect(screen.getByText("FT-3")).toBeInTheDocument();
	});

	it("handles empty task list", () => {
		vi.mocked(useGetTasks).mockReturnValue({
			data: [],
			isLoading: false,
		});

		render(
			<MemoryRouter>
				<RootRoute />
			</MemoryRouter>,
		);

		expect(screen.queryByTestId("task-card")).not.toBeInTheDocument();
	});

	it("calls useGetTasks with correct initial parameters", () => {
		render(
			<MemoryRouter>
				<RootRoute />
			</MemoryRouter>,
		);

		expect(useGetTasks).toHaveBeenCalledWith({
			search: undefined,
			completed: undefined,
		});
	});

	it("displays correct completion status text", () => {
		render(
			<MemoryRouter>
				<RootRoute />
			</MemoryRouter>,
		);

		expect(screen.getAllByText("Completed").length).toBeGreaterThanOrEqual(1);
		expect(screen.getAllByText("In progress").length).toBeGreaterThanOrEqual(1);
	});
});

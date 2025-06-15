import { useGetTaskById, useUpdateTask } from "@/api/tasks.ts";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EditTaskRoute } from "./edit";

//FIXME: Buttons from shadcn/ui don't accept data-testid. I could mock the buttons but it's not very elegant.
vi.mock("@/api/tasks.ts", () => ({
	useGetTaskById: vi.fn(),
	useUpdateTask: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
	const actual = await vi.importActual("react-router");
	return {
		...actual,
		useNavigate: () => mockNavigate,
		useParams: () => ({ id: "test-task-id" }),
	};
});

vi.mock("@/components/ui/button.tsx", () => ({
	Button: ({ children, onClick, disabled, type, form }: any) => (
		<button onClick={onClick} disabled={disabled} type={type} form={form}>
			{children}
		</button>
	),
}));

vi.mock("@/components/ui/input.tsx", () => ({
	Input: (props: any) => <input {...props} data-testid="title-input" />,
}));

vi.mock("@/components/ui/textarea.tsx", () => ({
	Textarea: (props: any) => (
		<textarea {...props} data-testid="description-textarea" />
	),
}));

vi.mock("@/components/ui/checkbox.tsx", () => ({
	Checkbox: ({ checked, onCheckedChange, ...props }: any) => (
		<input
			type="checkbox"
			checked={checked}
			onChange={(e) => onCheckedChange?.(e.target.checked)}
			data-testid="completed-checkbox"
			{...props}
		/>
	),
}));

vi.mock("@/components/ui/form.tsx", () => ({
	Form: ({ children }: any) => <div>{children}</div>,
	FormControl: ({ children }: any) => <div>{children}</div>,
	FormField: ({ render, name, control }: any) => {
		const field = {
			value:
				name === "title"
					? "Test Task"
					: name === "description"
						? "Test Description"
						: name === "completed"
							? true
							: "",
			onChange: vi.fn(),
		};
		return render({ field });
	},
	FormItem: ({ children }: any) => <div>{children}</div>,
	FormLabel: ({ children }: any) => <label>{children}</label>,
	FormMessage: () => <span />,
}));

vi.mock("@/types/task.ts", () => ({
	updateTaskSchema: {},
}));

vi.mock("@hookform/resolvers/zod", () => ({
	zodResolver: vi.fn(),
}));

/**
 * Tests for EditTaskRoute component
 *
 * Tests the task editing form component that handles:
 * - Loading existing task data
 * - Form rendering with pre-populated values
 * - Form submission and API integration
 */

describe("EditTaskRoute", () => {
	const mockUpdateTask = vi.fn();
	const mockTaskData = {
		id: "test-task-id",
		title: "Test Task",
		description: "Test Description",
		completed: true,
		createdAt: "2023-01-01T00:00:00.000Z",
		updatedAt: "2023-01-01T00:00:00.000Z",
	};

	beforeEach(() => {
		vi.clearAllMocks();

		vi.mocked(useGetTaskById).mockReturnValue({
			data: mockTaskData,
			isLoading: false,
			error: null,
		});

		vi.mocked(useUpdateTask).mockReturnValue({
			mutate: mockUpdateTask,
			isPending: false,
		});
	});

	it("renders the edit task form", () => {
		render(
			<MemoryRouter>
				<EditTaskRoute />
			</MemoryRouter>,
		);

		expect(screen.getByTestId("title-input")).toBeInTheDocument();
		expect(screen.getByTestId("description-textarea")).toBeInTheDocument();
		expect(screen.getByTestId("completed-checkbox")).toBeInTheDocument();

		expect(screen.getByText("Title")).toBeInTheDocument();
		expect(screen.getByText("Description")).toBeInTheDocument();
		expect(screen.getByText("Task Completed")).toBeInTheDocument();
	});

	it("populates form with existing task data", async () => {
		render(
			<MemoryRouter>
				<EditTaskRoute />
			</MemoryRouter>,
		);

		await waitFor(() => {
			const titleInput = screen.getByTestId("title-input") as HTMLInputElement;
			const descriptionTextarea = screen.getByTestId(
				"description-textarea",
			) as HTMLTextAreaElement;
			const completedCheckbox = screen.getByTestId(
				"completed-checkbox",
			) as HTMLInputElement;

			expect(titleInput.value).toBe("Test Task");
			expect(descriptionTextarea.value).toBe("Test Description");
			expect(completedCheckbox.checked).toBe(true);
		});
	});

	it("calls useGetTaskById with correct ID", () => {
		render(
			<MemoryRouter>
				<EditTaskRoute />
			</MemoryRouter>,
		);

		expect(useGetTaskById).toHaveBeenCalledWith("test-task-id");
	});

	it("handles loading state when task data is not available", () => {
		vi.mocked(useGetTaskById).mockReturnValue({
			data: undefined,
			isLoading: true,
			error: null,
		});

		render(
			<MemoryRouter>
				<EditTaskRoute />
			</MemoryRouter>,
		);

		expect(screen.getByTestId("title-input")).toBeInTheDocument();
		expect(screen.getByTestId("description-textarea")).toBeInTheDocument();
		expect(screen.getByTestId("completed-checkbox")).toBeInTheDocument();
	});

	it("renders form with placeholders", () => {
		render(
			<MemoryRouter>
				<EditTaskRoute />
			</MemoryRouter>,
		);

		const titleInput = screen.getByPlaceholderText("Enter task title");
		const descriptionTextarea = screen.getByPlaceholderText(
			"Enter task description (optional)",
		);

		expect(titleInput).toBeInTheDocument();
		expect(descriptionTextarea).toBeInTheDocument();
	});
});

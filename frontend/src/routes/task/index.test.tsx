import { useGetTaskById } from "@/api/tasks.ts";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { IndexTaskRoute } from "./index";

vi.mock("@/api/tasks.ts", () => ({
	useGetTaskById: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
	const actual = await vi.importActual("react-router");
	return {
		...actual,
		useNavigate: () => mockNavigate,
		useParams: () => ({ id: "test-task-id" }),
		Link: ({ children, to }: any) => <a href={to}>{children}</a>,
	};
});

vi.mock("react-icons/pi", () => ({
	PiPencilSimpleLine: () => <span>Edit Icon</span>,
}));

vi.mock("@/components/ui/button.tsx", () => ({
	Button: ({ children, onClick, disabled, variant }: any) => (
		<button onClick={onClick} disabled={disabled} data-variant={variant}>
			{children}
		</button>
	),
}));

vi.mock("@/components/ui/input.tsx", () => ({
	Input: (props: any) => (
		<input
			{...props}
			data-testid="title-input"
			data-readonly={props.readOnly}
		/>
	),
}));

vi.mock("@/components/ui/textarea.tsx", () => ({
	Textarea: (props: any) => (
		<textarea
			{...props}
			data-testid="description-textarea"
			data-readonly={props.readOnly}
		/>
	),
}));

vi.mock("@/components/ui/checkbox.tsx", () => ({
	Checkbox: ({ checked, disabled, ...props }: any) => (
		<input
			type="checkbox"
			checked={checked}
			disabled={disabled}
			data-testid="completed-checkbox"
			data-disabled={disabled}
			{...props}
		/>
	),
}));

vi.mock("@/components/ui/form.tsx", () => ({
	Form: ({ children }: any) => <div>{children}</div>,
	FormControl: ({ children }: any) => <div>{children}</div>,
	FormField: ({ render, name }: any) => {
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
}));

/**
 * Tests for IndexTaskRoute component
 *
 * Tests the task view component that handles:
 * - Loading states while fetching task data
 * - Displaying task data in read-only form
 * - Handling task not found scenarios
 * - Navigation controls (return and edit buttons)
 */

describe("IndexTaskRoute", () => {
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
	});

	it("shows loading state while fetching task", () => {
		vi.mocked(useGetTaskById).mockReturnValue({
			data: undefined,
			isLoading: true,
			error: null,
		});

		render(
			<MemoryRouter>
				<IndexTaskRoute />
			</MemoryRouter>,
		);

		const loadingElement = document.querySelector(".animate-spin");
		expect(loadingElement).toBeInTheDocument();
	});

	it("shows task not found message when task doesn't exist", () => {
		vi.mocked(useGetTaskById).mockReturnValue({
			data: null,
			isLoading: false,
			error: null,
		});

		render(
			<MemoryRouter>
				<IndexTaskRoute />
			</MemoryRouter>,
		);

		expect(screen.getByText("Task not found.")).toBeInTheDocument();
		expect(screen.getByText("Return")).toBeInTheDocument();
	});

	it("renders task view with read-only form when task exists", () => {
		vi.mocked(useGetTaskById).mockReturnValue({
			data: mockTaskData,
			isLoading: false,
			error: null,
		});

		render(
			<MemoryRouter>
				<IndexTaskRoute />
			</MemoryRouter>,
		);

		const titleInput = screen.getByTestId("title-input");
		const descriptionTextarea = screen.getByTestId("description-textarea");
		const completedCheckbox = screen.getByTestId("completed-checkbox");

		expect(titleInput).toBeInTheDocument();
		expect(titleInput).toHaveAttribute("data-readonly", "true");

		expect(descriptionTextarea).toBeInTheDocument();
		expect(descriptionTextarea).toHaveAttribute("data-readonly", "true");

		expect(completedCheckbox).toBeInTheDocument();
		expect(completedCheckbox).toHaveAttribute("data-disabled", "true");

		expect(screen.getByText("Title")).toBeInTheDocument();
		expect(screen.getByText("Description")).toBeInTheDocument();
		expect(screen.getByText("Task Completed")).toBeInTheDocument();
	});

	it("displays navigation buttons when task exists", () => {
		vi.mocked(useGetTaskById).mockReturnValue({
			data: mockTaskData,
			isLoading: false,
			error: null,
		});

		render(
			<MemoryRouter>
				<IndexTaskRoute />
			</MemoryRouter>,
		);

		expect(screen.getByText("Return")).toBeInTheDocument();
		expect(screen.getByText("Edit Task")).toBeInTheDocument();
		expect(screen.getByText("Edit Icon")).toBeInTheDocument();
	});

	it("calls useGetTaskById with correct ID", () => {
		vi.mocked(useGetTaskById).mockReturnValue({
			data: mockTaskData,
			isLoading: false,
			error: null,
		});

		render(
			<MemoryRouter>
				<IndexTaskRoute />
			</MemoryRouter>,
		);

		expect(useGetTaskById).toHaveBeenCalledWith("test-task-id");
	});

	it("displays form with populated task data", () => {
		vi.mocked(useGetTaskById).mockReturnValue({
			data: mockTaskData,
			isLoading: false,
			error: null,
		});

		render(
			<MemoryRouter>
				<IndexTaskRoute />
			</MemoryRouter>,
		);

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

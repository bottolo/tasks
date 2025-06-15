import { useCreateTask } from "@/api/tasks.ts";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateTaskRoute } from "./create";

//FIXME: Buttons from shadcn/ui don't accept data-testid. I could mock the buttons but it's not very elegant.
vi.mock("@/api/tasks.ts", () => ({
	useCreateTask: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
	const actual = await vi.importActual("react-router");
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

vi.mock("@/components/ui/button.tsx", () => ({
	Button: ({ children, onClick, disabled, type, form, ...props }: any) => (
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
	FormDescription: ({ children }: any) => <p>{children}</p>,
	FormField: ({ render, name }: any) => {
		const field = { value: "", onChange: vi.fn() };
		return render({ field });
	},
	FormItem: ({ children }: any) => <div>{children}</div>,
	FormLabel: ({ children }: any) => <label>{children}</label>,
	FormMessage: () => <span />,
}));

vi.mock("@/types/task.ts", () => ({
	createTaskSchema: {},
}));

vi.mock("@hookform/resolvers/zod", () => ({
	zodResolver: vi.fn(),
}));

/**
 * Tests for CreateTaskRoute component
 *
 * Tests the task creation form component that handles:
 * - Form rendering with title, description, and completion status
 * - Form submission and API integration
 */

describe("CreateTaskRoute", () => {
	const mockCreateTask = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(useCreateTask).mockReturnValue({
			mutate: mockCreateTask,
			isPending: false,
		});
	});

	it("renders the create task form", () => {
		render(
			<MemoryRouter>
				<CreateTaskRoute />
			</MemoryRouter>,
		);

		expect(screen.getByTestId("title-input")).toBeInTheDocument();
		expect(screen.getByTestId("description-textarea")).toBeInTheDocument();
		expect(screen.getByTestId("completed-checkbox")).toBeInTheDocument();

		expect(screen.getByText("Title")).toBeInTheDocument();
		expect(screen.getByText("Description")).toBeInTheDocument();
		expect(screen.getByText("Task Completed")).toBeInTheDocument();
	});

	it("displays form descriptions", () => {
		render(
			<MemoryRouter>
				<CreateTaskRoute />
			</MemoryRouter>,
		);

		expect(screen.getByText("The title of the task.")).toBeInTheDocument();
		expect(
			screen.getByText("A brief description of the task."),
		).toBeInTheDocument();
	});
});

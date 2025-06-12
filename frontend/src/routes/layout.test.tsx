/**
 * Tests for RootLayout component
 *
 * Tests the main layout component that handles:
 * - Header rendering with dynamic title/subtitle from navigation store
 * - Conditional breadcrumb rendering based on navigation state
 * - Basic layout structure (header, content area, footer)
 */

import { useNavigationStore } from "@/stores/navigation-store.ts";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RootLayout } from "./layout";

vi.mock("@/stores/navigation-store.ts", () => ({
	useNavigationStore: vi.fn(),
}));

vi.mock("sonner", () => ({
	Toaster: () => <div data-testid="toaster" />,
}));

vi.mock("@/components/ui/breadcrumb.tsx", () => ({
	Breadcrumb: ({ children }: { children: React.ReactNode }) => (
		<nav data-testid="breadcrumb">{children}</nav>
	),
	BreadcrumbList: ({ children }: { children: React.ReactNode }) => (
		<ol>{children}</ol>
	),
	BreadcrumbItem: ({ children }: { children: React.ReactNode }) => (
		<li>{children}</li>
	),
	BreadcrumbLink: ({ children }: { children: React.ReactNode }) => (
		<span>{children}</span>
	),
	BreadcrumbPage: ({ children }: { children: React.ReactNode }) => (
		<span>{children}</span>
	),
	BreadcrumbSeparator: () => <span>/</span>,
}));

describe("RootLayout", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders header with title and subtitle", () => {
		vi.mocked(useNavigationStore).mockReturnValueOnce([]).mockReturnValueOnce({
			title: "My App",
			subtitle: "Welcome to the app",
		});

		render(
			<MemoryRouter>
				<RootLayout />
			</MemoryRouter>,
		);

		expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
			"My App",
		);
		expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
			"Welcome to the app",
		);
	});

	it("renders footer", () => {
		vi.mocked(useNavigationStore)
			.mockReturnValueOnce([]) // breadcrumbs
			.mockReturnValueOnce(null); // header

		render(
			<MemoryRouter>
				<RootLayout />
			</MemoryRouter>,
		);

		expect(screen.getByText("There's no ©opyright!")).toBeInTheDocument();
	});

	it("does not render breadcrumbs when array is empty", () => {
		vi.mocked(useNavigationStore)
			.mockReturnValueOnce([]) // empty breadcrumbs
			.mockReturnValueOnce(null); // header

		render(
			<MemoryRouter>
				<RootLayout />
			</MemoryRouter>,
		);

		expect(screen.queryByTestId("breadcrumb")).not.toBeInTheDocument();
	});

	it("renders breadcrumbs when they exist", () => {
		const breadcrumbs = [
			{ label: "Home", href: "/", isActive: false },
			{ label: "Products", href: "/products", isActive: false },
			{ label: "Current Page", href: null, isActive: true },
		];

		vi.mocked(useNavigationStore)
			.mockReturnValueOnce(breadcrumbs) // breadcrumbs with data
			.mockReturnValueOnce(null); // header

		render(
			<MemoryRouter>
				<RootLayout />
			</MemoryRouter>,
		);

		expect(screen.getByTestId("breadcrumb")).toBeInTheDocument();
		expect(screen.getByText("Home")).toBeInTheDocument();
		expect(screen.getByText("Products")).toBeInTheDocument();
		expect(screen.getByText("Current Page")).toBeInTheDocument();
	});

	it("renders toaster component", () => {
		vi.mocked(useNavigationStore)
			.mockReturnValueOnce([]) // breadcrumbs
			.mockReturnValueOnce(null); // header

		render(
			<MemoryRouter>
				<RootLayout />
			</MemoryRouter>,
		);

		expect(screen.getByTestId("toaster")).toBeInTheDocument();
	});
});

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { IndexTaskRoute } from "@/routes/task";
import { CreateTaskRoute } from "@/routes/task/create.tsx";
import { EditTaskRoute } from "@/routes/task/edit.tsx";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createBrowserRouter } from "react-router";
import { queryClient } from "./lib/queryClient.ts";
import { RootRoute } from "./routes/__root.tsx";
import { RootLayout } from "./routes/layout.tsx";

const router = createBrowserRouter([
	{
		Component: RootLayout,
		children: [
			{
				path: "/",
				Component: RootRoute,
			},
			{
				path: "/create",
				Component: CreateTaskRoute,
			},
			{
				path: "/:id/edit",
				Component: EditTaskRoute,
			},
			{
				path: "/:id",
				Component: IndexTaskRoute,
			},
		],
	},
]);

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
		</QueryClientProvider>
	</StrictMode>,
);

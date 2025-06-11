import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb.tsx";
import { useNavigationStore } from "@/stores/navigation-store.ts";
import { Fragment } from "react";
import { Link, Outlet } from "react-router";
import { Toaster } from "sonner";

export const RootLayout = () => {
	const breadcrumbs = useNavigationStore((state) => state.breadcrumbs);
	const header = useNavigationStore((state) => state.header);

	return (
		<main className="flex flex-col h-screen w-screen gap-4 max-w-[1034px] mx-auto p-4">
			<header>
				<h1 className={"font-semibold text-5xl"}> {header?.title}</h1>
				<h2 className={"opacity-70 text-xl"}>{header?.subtitle}</h2>
			</header>

			{breadcrumbs.length > 0 && (
				<Breadcrumb>
					<BreadcrumbList>
						{breadcrumbs.map((breadcrumb, index) => (
							<Fragment key={breadcrumb?.label}>
								<BreadcrumbItem>
									{breadcrumb.isActive || !breadcrumb.href ? (
										<BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
									) : (
										<BreadcrumbLink>
											<Link to={breadcrumb.href}>{breadcrumb.label}</Link>
										</BreadcrumbLink>
									)}
								</BreadcrumbItem>
								{index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
							</Fragment>
						))}
					</BreadcrumbList>
				</Breadcrumb>
			)}

			<div className="flex-1 h-1/2 pb-1">
				<Outlet />
			</div>

			<footer>©...?</footer>
			<Toaster />
		</main>
	);
};

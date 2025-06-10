import { Outlet } from "react-router";

export const RootLayout = () => {
	return (
		<main className="flex flex-col justify-between h-screen w-screen gap-8 max-w-[1034px] mx-auto p-4">
			<header>
				<h1 className={"font-semibold text-4xl"}> Tasks Manager</h1>
				<h2 className={"opacity-70"}>Just an example for an application.</h2>
			</header>

			<div className={"mb-auto"}>
				<Outlet />
			</div>

			<footer>©...?</footer>
		</main>
	);
};

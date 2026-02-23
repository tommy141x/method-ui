import { Link, useLocation } from "@tanstack/solid-router";
import { createSignal, Show } from "solid-js";
import IconGithub from "~icons/lucide/github";
import IconMenu from "~icons/lucide/menu";
import IconX from "~icons/lucide/x";
import { Badge } from "./badge";
import { Button } from "./button";
import { CommandSearch } from "./command-search";
import { Separator } from "./separator";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
	const [mobileMenuOpen, setMobileMenuOpen] = createSignal(false);
	const location = useLocation();

	const isActive = (href: string) => location().pathname === href;
	const isActivePrefix = (prefix: string) =>
		location().pathname.startsWith(prefix);

	const navLinks = [
		{ label: "Docs", to: "/docs" as const, params: undefined },
		{
			label: "Components",
			to: "/components/$component" as const,
			params: { component: "button" },
		},
		{ label: "Blocks", to: "/blocks" as const, params: undefined },
	];

	return (
		<header class="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
			<div class="container mx-auto px-4 h-14 flex items-center gap-4">
				{/* Logo */}
				<Link
					to="/"
					class="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity"
				>
					<div class="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
						<span class="text-primary-foreground text-xs font-bold leading-none">
							M
						</span>
					</div>
					<span class="font-semibold text-sm tracking-tight">Method UI</span>
					<Badge
						variant="secondary"
						class="text-[10px] px-1.5 py-0 h-4 hidden sm:flex"
					>
						beta
					</Badge>
				</Link>

				<Separator orientation="vertical" class="h-5 hidden md:block" />

				{/* Desktop nav links */}
				<nav class="hidden md:flex items-center gap-1">
					{navLinks.map((link) => (
						<Link
							to={link.to}
							params={link.params}
							class={`text-sm px-3 py-1.5 rounded-md transition-colors ${
								isActive(location().pathname) ||
								(
									link.to !== "/docs" &&
										isActivePrefix(
											link.to.split("/")[1]
												? `/${link.to.split("/")[1]}`
												: link.to,
										)
								)
									? "text-foreground bg-accent"
									: "text-muted-foreground hover:text-foreground hover:bg-accent/50"
							}`}
						>
							{link.label}
						</Link>
					))}
				</nav>

				{/* Spacer */}
				<div class="flex-1" />

				{/* Search */}
				<CommandSearch />

				{/* Right actions */}
				<div class="flex items-center gap-1">
					<a
						href="https://github.com/tgstudios/method"
						target="_blank"
						rel="noopener noreferrer"
					>
						<Button
							variant="ghost"
							size="icon"
							class="h-9 w-9"
							aria-label="GitHub"
						>
							<IconGithub class="h-4 w-4" />
						</Button>
					</a>
					<ThemeToggle />

					{/* Mobile menu toggle */}
					<Button
						variant="ghost"
						size="icon"
						class="md:hidden h-9 w-9"
						onClick={() => setMobileMenuOpen((v) => !v)}
						aria-label="Toggle menu"
					>
						<Show
							when={mobileMenuOpen()}
							fallback={<IconMenu class="h-4 w-4" />}
						>
							<IconX class="h-4 w-4" />
						</Show>
					</Button>
				</div>
			</div>

			{/* Mobile menu */}
			<Show when={mobileMenuOpen()}>
				<div class="md:hidden border-t border-border bg-background">
					<nav class="container mx-auto px-4 py-3 flex flex-col gap-1">
						{navLinks.map((link) => (
							<Link
								to={link.to}
								params={link.params}
								class={`text-sm px-3 py-2.5 rounded-md transition-colors ${
									isActive(location().pathname) ||
									isActivePrefix(`/${link.to.split("/")[1]}`)
										? "text-foreground bg-accent font-medium"
										: "text-muted-foreground hover:text-foreground hover:bg-accent/50"
								}`}
								onClick={() => setMobileMenuOpen(false)}
							>
								{link.label}
							</Link>
						))}
						<div class="pt-2 mt-1 border-t border-border">
							<a
								href="https://github.com/tgstudios/method"
								target="_blank"
								rel="noopener noreferrer"
								class="flex items-center gap-2 text-sm px-3 py-2.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
							>
								<IconGithub class="h-4 w-4" />
								GitHub
							</a>
						</div>
					</nav>
				</div>
			</Show>
		</header>
	);
}

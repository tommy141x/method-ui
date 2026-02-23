import metadataJson from "@lib/registry.json";
import { Link, useLocation } from "@tanstack/solid-router";
import { createSignal, For, type JSX, Show } from "solid-js";
import IconBookOpen from "~icons/lucide/book-open";
import IconChevronRight from "~icons/lucide/chevron-right";
import IconDownload from "~icons/lucide/download";
import IconPalette from "~icons/lucide/palette";
import IconRocket from "~icons/lucide/rocket";
import { Badge } from "./badge";
import { Navbar } from "./navbar";
import { Separator } from "./separator";

const componentMetadata = metadataJson.componentMetadata;

const componentModules = import.meta.glob("../../../components/*.tsx", {
	eager: true,
}) as Record<string, { meta?: { hidden?: boolean; category?: string } }>;

interface ComponentEntry {
	name: string;
	displayName: string;
	description: string;
	exampleCount: number;
	category: string;
}

const allComponents: ComponentEntry[] = Object.entries(componentMetadata)
	.map(([fileName, metadata]) => {
		const modulePath = `../../../components/${fileName}.tsx`;
		const module = componentModules[modulePath];
		const runtimeMeta = module?.meta ?? {};

		if (runtimeMeta.hidden) return null;

		return {
			name: fileName,
			displayName: metadata.name,
			description: metadata.description,
			exampleCount: metadata.examples?.length ?? 0,
			category: runtimeMeta.category ?? "General",
		};
	})
	.filter((c): c is ComponentEntry => c !== null)
	.sort((a, b) => a.displayName.localeCompare(b.displayName));

// Group by category — fall back to a flat "Components" group
const groupedComponents = allComponents.reduce<
	Record<string, ComponentEntry[]>
>((acc, comp) => {
	const cat = comp.category;
	if (!acc[cat]) acc[cat] = [];
	acc[cat].push(comp);
	return acc;
}, {});

const docsSections = [
	{ name: "Introduction", href: "/docs", Icon: IconBookOpen },
	{ name: "Installation", href: "/docs/installation", Icon: IconDownload },
	{ name: "Getting Started", href: "/docs/getting-started", Icon: IconRocket },
	{ name: "Theming", href: "/docs/theming", Icon: IconPalette },
];

interface DocsLayoutProps {
	children?: JSX.Element;
}

export function DocsLayout(props: DocsLayoutProps) {
	const location = useLocation();
	const [filter, setFilter] = createSignal("");

	const isActive = (href: string) => location().pathname === href;

	const filteredComponents = () => {
		const q = filter().toLowerCase().trim();
		if (!q) return allComponents;
		return allComponents.filter(
			(c) =>
				c.displayName.toLowerCase().includes(q) ||
				c.description?.toLowerCase().includes(q) ||
				c.name.toLowerCase().includes(q),
		);
	};

	const isFiltering = () => filter().trim().length > 0;

	return (
		<>
			<Navbar />

			<div class="flex min-h-[calc(100vh-56px)]">
				{/* ── Sidebar ── */}
				<aside
					class="hidden md:flex flex-col sticky top-14 h-[calc(100vh-56px)] w-60 shrink-0 border-r border-border bg-background overflow-hidden"
					style={{ "scrollbar-width": "none" }}
				>
					{/* Top fade */}
					<div class="pointer-events-none absolute top-14 left-0 right-0 h-8 bg-linear-to-b from-background to-transparent z-10" />

					<div
						class="flex-1 overflow-y-auto py-4 px-3"
						style={{ "scrollbar-width": "none" }}
					>
						{/* Docs section */}
						<div class="mb-5">
							<p class="mb-1.5 px-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
								Docs
							</p>
							<div class="space-y-0.5">
								<For each={docsSections}>
									{(section) => (
										<Link to={section.href}>
											<button
												type="button"
												class={`w-full flex items-center gap-2.5 px-2 py-1.5 text-sm rounded-md transition-colors ${
													isActive(section.href)
														? "bg-accent text-accent-foreground font-medium"
														: "text-muted-foreground hover:text-foreground hover:bg-accent/50"
												}`}
											>
												<section.Icon class="h-3.5 w-3.5 shrink-0" />
												{section.name}
											</button>
										</Link>
									)}
								</For>
							</div>
						</div>

						<Separator class="mb-4" />

						{/* Component filter input */}
						<div class="mb-3 px-1">
							<input
								type="text"
								placeholder="Filter components..."
								value={filter()}
								onInput={(e) => setFilter(e.currentTarget.value)}
								class="w-full rounded-md border border-input bg-transparent px-2.5 py-1.5 text-xs placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring transition-shadow"
							/>
						</div>

						{/* Components header */}
						<div class="mb-2 px-2 flex items-center justify-between">
							<p class="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
								Components
							</p>
							<Badge variant="secondary" class="text-[10px] px-1.5 h-4">
								{allComponents.length}
							</Badge>
						</div>

						{/* Flat filtered list */}
						<Show when={isFiltering()}>
							<div class="space-y-0.5">
								<Show
									when={filteredComponents().length > 0}
									fallback={
										<p class="px-2 py-3 text-xs text-muted-foreground">
											No components match "{filter()}"
										</p>
									}
								>
									<For each={filteredComponents()}>
										{(comp) => (
											<SidebarComponentLink
												name={comp.name}
												displayName={comp.displayName}
												exampleCount={comp.exampleCount}
												isActive={isActive(`/components/${comp.name}`)}
											/>
										)}
									</For>
								</Show>
							</div>
						</Show>

						{/* Grouped list (no filter) */}
						<Show when={!isFiltering()}>
							<Show
								when={Object.keys(groupedComponents).length > 1}
								fallback={
									<div class="space-y-0.5">
										<For each={allComponents}>
											{(comp) => (
												<SidebarComponentLink
													name={comp.name}
													displayName={comp.displayName}
													exampleCount={comp.exampleCount}
													isActive={isActive(`/components/${comp.name}`)}
												/>
											)}
										</For>
									</div>
								}
							>
								<For each={Object.entries(groupedComponents)}>
									{([category, comps]) => (
										<SidebarGroup
											category={category}
											components={comps}
											isActive={isActive}
										/>
									)}
								</For>
							</Show>
						</Show>
					</div>

					{/* Bottom fade */}
					<div class="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-linear-to-t from-background to-transparent z-10" />
				</aside>

				{/* ── Main content ── */}
				<div class="flex-1 flex flex-col min-w-0">
					<main class="flex-1">
						<div class="mx-auto px-6 py-8 max-w-4xl w-full">
							{props.children}
						</div>
					</main>

					<footer class="border-t border-border py-6 mt-4">
						<div class="mx-auto px-6 max-w-4xl text-center text-xs text-muted-foreground">
							Built with SolidJS, Ark UI & UnoCSS
						</div>
					</footer>
				</div>
			</div>
		</>
	);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SidebarComponentLink(props: {
	name: string;
	displayName: string;
	exampleCount: number;
	isActive: boolean;
}) {
	return (
		<Link to="/components/$component" params={{ component: props.name }}>
			<button
				type="button"
				class={`w-full flex items-center justify-between gap-2 px-2 py-1.5 text-sm rounded-md transition-colors ${
					props.isActive
						? "bg-accent text-accent-foreground font-medium"
						: "text-muted-foreground hover:text-foreground hover:bg-accent/50"
				}`}
			>
				<span class="truncate">{props.displayName}</span>
				<Show when={props.exampleCount > 0}>
					<Badge
						variant={props.isActive ? "secondary" : "outline"}
						class="text-[10px] px-1.5 h-4 shrink-0 font-normal"
					>
						{props.exampleCount}
					</Badge>
				</Show>
			</button>
		</Link>
	);
}

function SidebarGroup(props: {
	category: string;
	components: ComponentEntry[];
	isActive: (href: string) => boolean;
}) {
	const hasActive = () =>
		props.components.some((c) => props.isActive(`/components/${c.name}`));
	const [open, setOpen] = createSignal(hasActive());

	return (
		<div class="mb-1">
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				class="w-full flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors rounded"
			>
				<span>{props.category}</span>
				<IconChevronRight
					class={`h-3 w-3 transition-transform ${open() ? "rotate-90" : ""}`}
				/>
			</button>
			<Show when={open()}>
				<div class="mt-0.5 space-y-0.5">
					<For each={props.components}>
						{(comp) => (
							<SidebarComponentLink
								name={comp.name}
								displayName={comp.displayName}
								exampleCount={comp.exampleCount}
								isActive={props.isActive(`/components/${comp.name}`)}
							/>
						)}
					</For>
				</div>
			</Show>
		</div>
	);
}

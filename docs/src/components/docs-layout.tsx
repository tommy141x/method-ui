import metadataJson from "@lib/registry.json";
import { A, useLocation } from "@solidjs/router";
import { For, type JSX } from "solid-js";
import { Badge } from "./badge";
import { Navbar } from "./navbar";

const componentMetadata = metadataJson.componentMetadata;

// Dynamically import all components to check for hidden flag
const componentModules = import.meta.glob("../../../components/*.tsx", {
	eager: true,
}) as Record<string, { meta?: { hidden?: boolean } }>;

// Build simplified component list, filtering out hidden components
const components = Object.entries(componentMetadata)
	.map(([fileName, metadata]) => {
		// Check if component is hidden in runtime meta
		const modulePath = `../../../components/${fileName}.tsx`;
		const module = componentModules[modulePath];
		const runtimeMeta = module?.meta || {};

		if (runtimeMeta.hidden) {
			return null;
		}

		return {
			name: fileName,
			displayName: metadata.name,
			description: metadata.description,
			exampleCount: metadata.examples?.length || 0,
		};
	})
	.filter((c): c is NonNullable<typeof c> => c !== null);

const docsSections = [
	{ name: "Introduction", href: "/docs", iconClass: "i-lucide-book-open" },
	{
		name: "Installation",
		href: "/docs/installation",
		iconClass: "i-lucide-download",
	},
	{
		name: "Getting Started",
		href: "/docs/getting-started",
		iconClass: "i-lucide-rocket",
	},
	{ name: "Theming", href: "/docs/theming", iconClass: "i-lucide-palette" },
];

interface DocsLayoutProps {
	children?: JSX.Element;
}

export function DocsLayout(props: DocsLayoutProps) {
	const location = useLocation();

	const isActive = (href: string) => {
		return location.pathname === href;
	};

	return (
		<>
			<Navbar />

			<div class="flex">
				{/* Sidebar */}
				<aside
					class="fixed top-[60px] left-0 h-[calc(100vh-60px)] w-64 bg-background overflow-y-auto relative"
					style={{
						"scrollbar-width": "none",
						"-ms-overflow-style": "none",
					}}
				>
					{/* Top gradient fade */}
					<div class="sticky top-0 h-12 bg-gradient-to-b from-background via-background/80 to-transparent pointer-events-none z-10" />

					<div class="p-4 pt-0">
						{/* Docs Section */}
						<div class="mb-6">
							<div class="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
								Documentation
							</div>
							<div class="space-y-1">
								<For each={docsSections}>
									{(section) => (
										<A href={section.href}>
											<button
												type="button"
												class={`w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md ${
													isActive(section.href)
														? "bg-accent text-accent-foreground font-medium"
														: "text-foreground hover:bg-accent/50"
												}`}
											>
												<div class={`${section.iconClass} h-4 w-4`} />
												<span>{section.name}</span>
											</button>
										</A>
									)}
								</For>
							</div>
						</div>

						{/* Component List */}
						<div>
							<div class="mb-2 px-2 flex items-center gap-2">
								<span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
									Components
								</span>
								<Badge variant="secondary" class="text-xs">
									{components.length}
								</Badge>
							</div>
							<div class="space-y-1">
								<For each={components}>
									{(component) => (
										<A href={`/components/${component.name}`}>
											<button
												type="button"
												class={`w-full flex items-center justify-between gap-2 px-2 py-2 text-sm rounded-md ${
													isActive(`/components/${component.name}`)
														? "bg-accent text-accent-foreground font-medium"
														: "text-foreground hover:bg-accent/50"
												}`}
											>
												<span class="truncate">{component.displayName}</span>
												{component.exampleCount > 0 && (
													<Badge variant="outline" class="text-xs shrink-0">
														{component.exampleCount}
													</Badge>
												)}
											</button>
										</A>
									)}
								</For>
							</div>
						</div>
					</div>

					{/* Bottom gradient fade */}
					<div class="sticky bottom-0 h-12 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none z-10" />
				</aside>

				{/* Main Content */}
				<main class="ml-64 flex-1 min-h-[calc(100vh-60px)]">
					<div class="container mx-auto px-4 py-6 max-w-6xl">{props.children}</div>

					{/* Footer */}
					<footer class="border-t border-border mt-12 py-8">
						<div class="container mx-auto px-4 text-center text-sm text-muted-foreground">
							<p>
								Built with <span class="text-red-500">♥</span> using SolidJS, Ark UI, and UnoCSS
							</p>
						</div>
					</footer>
				</main>
			</div>
		</>
	);
}

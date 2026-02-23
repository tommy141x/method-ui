import metadataJson from "@lib/registry.json";
import { useNavigate } from "@tanstack/solid-router";
import { createSignal, For, onCleanup, onMount } from "solid-js";
import IconBookOpen from "~icons/lucide/book-open";
import IconBox from "~icons/lucide/box";
import IconDownload from "~icons/lucide/download";
import IconPalette from "~icons/lucide/palette";
import IconRocket from "~icons/lucide/rocket";
import IconSearch from "~icons/lucide/search";
import { Badge } from "./badge";
import { Button } from "./button";
import {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	CommandShortcut,
} from "./command";

const componentMetadata = metadataJson.componentMetadata;

// Auto-discover components from registry, filtering out hidden ones
const componentModules = import.meta.glob("../../../components/*.tsx", {
	eager: true,
}) as Record<string, { meta?: { hidden?: boolean } }>;

const registryComponents = Object.entries(componentMetadata)
	.map(([fileName, metadata]) => {
		const modulePath = `../../../components/${fileName}.tsx`;
		const module = componentModules[modulePath];
		const runtimeMeta = module?.meta ?? {};
		if (runtimeMeta.hidden) return null;
		return {
			name: fileName,
			label: metadata.name,
			description: metadata.description,
			href: `/components/${fileName}`,
		};
	})
	.filter((c): c is NonNullable<typeof c> => c !== null)
	.sort((a, b) => a.label.localeCompare(b.label));

// Static docs pages
const docPages = [
	{
		label: "Introduction",
		href: "/docs",
		description: "What is Method UI?",
		keywords: ["intro", "overview", "about"],
		Icon: IconBookOpen,
	},
	{
		label: "Installation",
		href: "/docs/installation",
		description: "Set up Method UI in your project",
		keywords: ["install", "setup", "cli", "init", "npm", "bun", "pnpm"],
		Icon: IconDownload,
	},
	{
		label: "Getting Started",
		href: "/docs/getting-started",
		description: "Quick start guide and usage patterns",
		keywords: ["quickstart", "guide", "usage", "start", "example"],
		Icon: IconRocket,
	},
	{
		label: "Theming",
		href: "/docs/theming",
		description: "Customize colors, fonts, and themes",
		keywords: [
			"theme",
			"color",
			"dark",
			"light",
			"css",
			"variables",
			"customize",
		],
		Icon: IconPalette,
	},
];

export function CommandSearch() {
	const [open, setOpen] = createSignal(false);
	const navigate = useNavigate();

	const isMac =
		typeof navigator !== "undefined"
			? /Mac|iPod|iPhone|iPad/.test(navigator.platform)
			: false;

	onMount(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				setOpen((v) => !v);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		onCleanup(() => window.removeEventListener("keydown", handleKeyDown));
	});

	const handleSelect = (href: string) => {
		setOpen(false);
		navigate({ to: href as "/" });
	};

	return (
		<>
			{/* Wide search button shown on md+ */}
			<Button
				variant="outline"
				class="hidden md:flex items-center gap-2 text-sm text-muted-foreground h-9 px-3 w-[220px] justify-between"
				onClick={() => setOpen(true)}
				aria-label="Search documentation"
			>
				<span class="flex items-center gap-2">
					<IconSearch class="h-3.5 w-3.5" />
					<span>Search docs...</span>
				</span>
				<kbd class="pointer-events-none hidden h-5 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
					{isMac ? "⌘" : "Ctrl"}&nbsp;K
				</kbd>
			</Button>

			{/* Icon-only button on mobile */}
			<Button
				variant="outline"
				size="icon"
				class="flex md:hidden h-9 w-9"
				onClick={() => setOpen(true)}
				aria-label="Search"
			>
				<IconSearch class="h-4 w-4" />
			</Button>

			<CommandDialog open={open()} onOpenChange={setOpen}>
				<Command loop>
					<CommandInput placeholder="Search docs and components..." />

					<CommandList>
						<CommandEmpty>No results found.</CommandEmpty>

						{/* Documentation pages */}
						<CommandGroup heading="Documentation">
							<For each={docPages}>
								{(page) => (
									<CommandItem
										value={page.label}
										keywords={[...page.keywords, page.description]}
										onSelect={() => handleSelect(page.href)}
									>
										<page.Icon class="h-4 w-4 text-muted-foreground shrink-0" />
										<div class="flex flex-col min-w-0">
											<span class="font-medium">{page.label}</span>
											<span class="text-xs text-muted-foreground truncate">
												{page.description}
											</span>
										</div>
									</CommandItem>
								)}
							</For>
						</CommandGroup>

						<CommandSeparator />

						{/* Components — auto-discovered from registry.json */}
						<CommandGroup heading={`Components (${registryComponents.length})`}>
							<For each={registryComponents}>
								{(comp) => (
									<CommandItem
										value={comp.label}
										keywords={[comp.name, comp.description ?? ""]}
										onSelect={() => handleSelect(comp.href)}
									>
										<IconBox class="h-4 w-4 text-muted-foreground shrink-0" />
										<div class="flex flex-col min-w-0 flex-1">
											<span class="font-medium">{comp.label}</span>
											{comp.description && (
												<span class="text-xs text-muted-foreground truncate">
													{comp.description}
												</span>
											)}
										</div>
										<CommandShortcut>Component</CommandShortcut>
									</CommandItem>
								)}
							</For>
						</CommandGroup>
					</CommandList>

					{/* Footer hint bar */}
					<div class="flex items-center justify-between border-t border-border px-3 py-2 text-xs text-muted-foreground">
						<span class="flex items-center gap-3">
							<span class="flex items-center gap-1">
								<kbd class="rounded border border-border bg-muted px-1 font-mono">
									↑↓
								</kbd>
								navigate
							</span>
							<span class="flex items-center gap-1">
								<kbd class="rounded border border-border bg-muted px-1 font-mono">
									↵
								</kbd>
								open
							</span>
							<span class="flex items-center gap-1">
								<kbd class="rounded border border-border bg-muted px-1 font-mono">
									esc
								</kbd>
								close
							</span>
						</span>
						<Badge variant="secondary" class="text-xs">
							{registryComponents.length} components
						</Badge>
					</div>
				</Command>
			</CommandDialog>
		</>
	);
}

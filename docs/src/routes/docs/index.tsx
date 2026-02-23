import { createFileRoute, Link } from "@tanstack/solid-router";
import IconArrowRight from "~icons/lucide/arrow-right";
import IconBox from "~icons/lucide/box";
import IconCode from "~icons/lucide/code";
import IconGithub from "~icons/lucide/github";
import IconLayers from "~icons/lucide/layers";
import IconPalette from "~icons/lucide/palette";
import IconShield from "~icons/lucide/shield";
import IconTerminal from "~icons/lucide/terminal";
import IconZap from "~icons/lucide/zap";
import { Badge } from "../../components/badge";
import { Button } from "../../components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../../components/card";
import { DocsLayout } from "../../components/docs-layout";
import { Separator } from "../../components/separator";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "../../components/tooltip";

export const Route = createFileRoute("/docs/")({
	component: DocsIndex,
});

function DocsIndex() {
	return (
		<DocsLayout>
			<div class="max-w-3xl space-y-10">
				{/* Header */}
				<div>
					<Badge variant="secondary" class="mb-4 text-xs">
						Introduction
					</Badge>
					<h1 class="text-3xl font-bold tracking-tight mb-3">Method UI</h1>
					<p class="text-muted-foreground text-base leading-relaxed">
						A modern component library for SolidJS. Copy components into your
						project, own the code, and build without constraints.
					</p>
				</div>

				<Separator />

				{/* What is it */}
				<div class="space-y-4">
					<h2 class="text-xl font-semibold">What is Method UI?</h2>
					<p class="text-sm text-muted-foreground leading-relaxed">
						Method UI is a collection of accessible, production-ready components
						built specifically for{" "}
						<a
							href="https://solidjs.com"
							target="_blank"
							rel="noopener noreferrer"
							class="text-foreground underline underline-offset-4"
						>
							SolidJS
						</a>
						. Instead of being a traditional npm package you depend on, Method
						UI uses a CLI to copy component source files directly into your
						project. You get full ownership and control — no fighting the
						library, no waiting for updates, no surprise breaking changes.
					</p>
					<p class="text-sm text-muted-foreground leading-relaxed">
						Components are built on{" "}
						<a
							href="https://ark-ui.com"
							target="_blank"
							rel="noopener noreferrer"
							class="text-foreground underline underline-offset-4"
						>
							Ark UI
						</a>{" "}
						for accessibility and styled with{" "}
						<a
							href="https://unocss.dev"
							target="_blank"
							rel="noopener noreferrer"
							class="text-foreground underline underline-offset-4"
						>
							UnoCSS
						</a>{" "}
						with CSS variables for theming. Every component is written in
						TypeScript and designed to compose cleanly.
					</p>
				</div>

				{/* Live demo — actual components in the docs */}
				<div class="space-y-4">
					<h2 class="text-xl font-semibold">See it in action</h2>
					<p class="text-sm text-muted-foreground">
						These are real Method UI components, live in the documentation.
					</p>

					<Card>
						<CardHeader class="pb-3">
							<CardTitle class="text-sm font-medium text-muted-foreground">
								Buttons
							</CardTitle>
						</CardHeader>
						<CardContent class="flex flex-wrap gap-2">
							<Button size="sm">Default</Button>
							<Button size="sm" variant="secondary">
								Secondary
							</Button>
							<Button size="sm" variant="outline">
								Outline
							</Button>
							<Button size="sm" variant="ghost">
								Ghost
							</Button>
							<Button size="sm" variant="destructive">
								Destructive
							</Button>
						</CardContent>
					</Card>

					<Card>
						<CardHeader class="pb-3">
							<CardTitle class="text-sm font-medium text-muted-foreground">
								Badges &amp; Tooltips
							</CardTitle>
						</CardHeader>
						<CardContent class="flex flex-wrap items-center gap-3">
							<Badge>Default</Badge>
							<Badge variant="secondary">Secondary</Badge>
							<Badge variant="outline">Outline</Badge>
							<Badge variant="destructive">Destructive</Badge>
							<Separator orientation="vertical" class="h-5 hidden sm:block" />
							<Tooltip>
								<TooltipTrigger>
									<Button size="sm" variant="outline">
										Hover for tooltip
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									Built with Ark UI — fully accessible
								</TooltipContent>
							</Tooltip>
						</CardContent>
					</Card>

					<div class="text-right">
						<Link to="/components/$component" params={{ component: "button" }}>
							<Button
								variant="link"
								class="text-xs gap-1 text-muted-foreground"
							>
								Browse all components
								<IconArrowRight class="h-3 w-3" />
							</Button>
						</Link>
					</div>
				</div>

				<Separator />

				{/* Key principles */}
				<div class="space-y-4">
					<h2 class="text-xl font-semibold">Key principles</h2>
					<div class="grid sm:grid-cols-2 gap-3">
						{[
							{
								icon: IconBox,
								title: "You own the code",
								description:
									"Components are copied into your project via the CLI. Modify them freely — they're yours.",
							},
							{
								icon: IconShield,
								title: "Accessible by default",
								description:
									"Built on Ark UI with WAI-ARIA compliance, keyboard navigation, and screen reader support.",
							},
							{
								icon: IconPalette,
								title: "Themeable",
								description:
									"CSS variables drive every token. Dark mode, light mode, custom palettes — all first-class.",
							},
							{
								icon: IconZap,
								title: "SolidJS native",
								description:
									"Fine-grained reactivity, no virtual DOM, no adapters. Solid all the way down.",
							},
							{
								icon: IconLayers,
								title: "Composable",
								description:
									"Primitive-first APIs that mix and nest naturally. No fighting the library's opinions.",
							},
							{
								icon: IconCode,
								title: "TypeScript first",
								description:
									"Full type definitions on every component, prop, and variant. IDE autocomplete works great.",
							},
						].map((item) => (
							<div class="flex gap-3 rounded-lg border border-border bg-card p-4">
								<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
									<item.icon class="h-4 w-4 text-muted-foreground" />
								</div>
								<div>
									<p class="text-sm font-medium mb-0.5">{item.title}</p>
									<p class="text-xs text-muted-foreground leading-relaxed">
										{item.description}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>

				<Separator />

				{/* Tech stack */}
				<div class="space-y-4">
					<h2 class="text-xl font-semibold">Built with</h2>
					<div class="grid sm:grid-cols-3 gap-3">
						{[
							{
								name: "SolidJS",
								description: "Fine-grained reactive UI framework",
								href: "https://solidjs.com",
							},
							{
								name: "Ark UI",
								description: "Headless, accessible component primitives",
								href: "https://ark-ui.com",
							},
							{
								name: "UnoCSS",
								description: "Instant on-demand atomic CSS engine",
								href: "https://unocss.dev",
							},
							{
								name: "class-variance-authority",
								description: "Type-safe variant management",
								href: "https://cva.style",
							},
							{
								name: "Motion One",
								description: "Web Animations API wrapper",
								href: "https://motion.dev",
							},
							{
								name: "unplugin-icons",
								description: "Any icon set, on demand",
								href: "https://github.com/unplugin/unplugin-icons",
							},
						].map((tech) => (
							<a
								href={tech.href}
								target="_blank"
								rel="noopener noreferrer"
								class="group rounded-lg border border-border bg-card p-3.5 transition-colors hover:bg-accent/30 hover:border-primary/30"
							>
								<p class="text-sm font-medium mb-0.5 group-hover:text-foreground transition-colors">
									{tech.name}
								</p>
								<p class="text-xs text-muted-foreground">{tech.description}</p>
							</a>
						))}
					</div>
				</div>

				<Separator />

				{/* CLI quick glance */}
				<div class="space-y-4">
					<h2 class="text-xl font-semibold">The CLI</h2>
					<p class="text-sm text-muted-foreground leading-relaxed">
						Method UI ships a CLI with four commands that cover the full
						component lifecycle in your project.
					</p>
					<div class="space-y-2">
						{[
							{
								cmd: "bunx method@latest init",
								description: "Set up Method UI in a new project.",
							},
							{
								cmd: "bunx method@latest add button",
								description:
									"Copy a component (and its dependencies) into your project.",
							},
							{
								cmd: "bunx method@latest update",
								description: "Pull the latest version of installed components.",
							},
							{
								cmd: "bunx method@latest remove button",
								description: "Remove a component from your project.",
							},
						].map((row) => (
							<div class="flex flex-col sm:flex-row sm:items-center gap-2 rounded-lg border border-border bg-card p-3.5">
								<div class="flex items-center gap-2 shrink-0">
									<IconTerminal class="h-3.5 w-3.5 text-muted-foreground shrink-0" />
									<code class="font-mono text-xs text-foreground whitespace-nowrap">
										{row.cmd}
									</code>
								</div>
								<span class="hidden sm:block text-muted-foreground/40 shrink-0">
									—
								</span>
								<p class="text-xs text-muted-foreground">{row.description}</p>
							</div>
						))}
					</div>
				</div>

				<Separator />

				{/* Next steps */}
				<div class="space-y-4">
					<h2 class="text-xl font-semibold">Next steps</h2>
					<div class="grid sm:grid-cols-2 gap-3">
						<Link to="/docs/installation">
							<Card class="h-full hover:bg-accent/30 hover:border-primary/30 transition-colors cursor-pointer">
								<CardHeader class="pb-2">
									<CardTitle class="text-sm">Installation →</CardTitle>
									<CardDescription class="text-xs">
										Install peer dependencies, run the CLI initializer, and add
										your first component.
									</CardDescription>
								</CardHeader>
							</Card>
						</Link>
						<Link to="/docs/getting-started">
							<Card class="h-full hover:bg-accent/30 hover:border-primary/30 transition-colors cursor-pointer">
								<CardHeader class="pb-2">
									<CardTitle class="text-sm">Getting Started →</CardTitle>
									<CardDescription class="text-xs">
										Learn the component API, variants, composition patterns, and
										TypeScript usage.
									</CardDescription>
								</CardHeader>
							</Card>
						</Link>
						<Link to="/docs/theming">
							<Card class="h-full hover:bg-accent/30 hover:border-primary/30 transition-colors cursor-pointer">
								<CardHeader class="pb-2">
									<CardTitle class="text-sm">Theming →</CardTitle>
									<CardDescription class="text-xs">
										Swap palettes, build custom themes, and control CSS
										variables at runtime.
									</CardDescription>
								</CardHeader>
							</Card>
						</Link>
						<Link to="/components/$component" params={{ component: "button" }}>
							<Card class="h-full hover:bg-accent/30 hover:border-primary/30 transition-colors cursor-pointer">
								<CardHeader class="pb-2">
									<CardTitle class="text-sm">Components →</CardTitle>
									<CardDescription class="text-xs">
										Browse the full component library with live examples, props
										tables, and install commands.
									</CardDescription>
								</CardHeader>
							</Card>
						</Link>
					</div>

					<div class="flex items-center gap-3 pt-2">
						<a
							href="https://github.com/tgstudios/method"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Button variant="outline" class="gap-2 h-9">
								<IconGithub class="h-4 w-4" />
								GitHub
							</Button>
						</a>
						<Link to="/docs/installation">
							<Button class="gap-2 h-9">
								Get started
								<IconArrowRight class="h-4 w-4" />
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</DocsLayout>
	);
}

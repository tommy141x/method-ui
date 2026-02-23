import { createFileRoute, Link } from "@tanstack/solid-router";
import { createSignal, For, Show } from "solid-js";
import IconArrowRight from "~icons/lucide/arrow-right";
import IconBox from "~icons/lucide/box";
import IconCheck from "~icons/lucide/check";
import IconCopy from "~icons/lucide/copy";
import IconGithub from "~icons/lucide/github";
import IconLayers from "~icons/lucide/layers";
import IconPalette from "~icons/lucide/palette";
import IconShield from "~icons/lucide/shield";
import IconTerminal from "~icons/lucide/terminal";
import IconZap from "~icons/lucide/zap";
import { Badge } from "../components/badge";
import { Button } from "../components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../components/card";
import { Navbar } from "../components/navbar";
import { Separator } from "../components/separator";
import {
	Tabs,
	TabsContent,
	TabsIndicator,
	TabsList,
	TabsTrigger,
} from "../components/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/tooltip";

export const Route = createFileRoute("/")({
	component: Home,
});

// ─── Install Command ──────────────────────────────────────────────────────────
function InstallCommand() {
	const [copied, setCopied] = createSignal(false);
	const [activeTab, setActiveTab] = createSignal("bun");

	const commands: Record<string, string> = {
		bun: "bunx method@latest init",
		npm: "npx method@latest init",
		pnpm: "pnpm dlx method@latest init",
		yarn: "yarn dlx method@latest init",
	};

	const copy = () => {
		navigator.clipboard.writeText(commands[activeTab()]);
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	};

	return (
		<div class="w-full max-w-lg mx-auto">
			<Tabs
				value={activeTab()}
				onValueChange={(e) => setActiveTab(e.value)}
				class="gap-0 overflow-hidden rounded-lg border border-border bg-card"
			>
				<div class="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/50">
					<TabsList class="h-7 gap-0.5 bg-transparent p-0">
						<TabsIndicator />
						{(["bun", "npm", "pnpm", "yarn"] as const).map((pm) => (
							<TabsTrigger
								value={pm}
								class="h-7 px-2.5 text-xs rounded-sm data-[selected]:bg-background data-[selected]:shadow-sm"
							>
								{pm}
							</TabsTrigger>
						))}
					</TabsList>
					<Tooltip>
						<TooltipTrigger>
							<Button
								variant="ghost"
								size="icon"
								class="h-7 w-7"
								onClick={copy}
								aria-label="Copy command"
							>
								<Show
									when={copied()}
									fallback={<IconCopy class="h-3.5 w-3.5" />}
								>
									<IconCheck class="h-3.5 w-3.5 text-green-500" />
								</Show>
							</Button>
						</TooltipTrigger>
						<TooltipContent>Copy to clipboard</TooltipContent>
					</Tooltip>
				</div>
				{(["bun", "npm", "pnpm", "yarn"] as const).map((pm) => (
					<TabsContent value={pm} class="mt-0! p-0">
						<div class="flex items-center gap-2 px-4 py-3 font-mono text-sm">
							<IconTerminal class="h-3.5 w-3.5 text-muted-foreground shrink-0" />
							<span class="text-foreground">{commands[pm]}</span>
						</div>
					</TabsContent>
				))}
			</Tabs>
		</div>
	);
}

// ─── Component Showcase ───────────────────────────────────────────────────────
function ComponentShowcase() {
	const [_checked, _setChecked] = createSignal(true);
	const [_switchOn, _setSwitchOn] = createSignal(true);
	const [_sliderVal, _setSliderVal] = createSignal(60);

	return (
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{/* Buttons */}
			<Card class="col-span-1">
				<CardHeader class="pb-3">
					<CardTitle class="text-sm font-medium text-muted-foreground">
						Button
					</CardTitle>
				</CardHeader>
				<CardContent class="flex flex-wrap gap-2">
					<Button size="sm">Default</Button>
					<Button size="sm" variant="outline">
						Outline
					</Button>
					<Button size="sm" variant="secondary">
						Secondary
					</Button>
					<Button size="sm" variant="ghost">
						Ghost
					</Button>
					<Button size="sm" variant="destructive">
						Destructive
					</Button>
				</CardContent>
			</Card>

			{/* Badges */}
			<Card class="col-span-1">
				<CardHeader class="pb-3">
					<CardTitle class="text-sm font-medium text-muted-foreground">
						Badge
					</CardTitle>
				</CardHeader>
				<CardContent class="flex flex-wrap gap-2 items-center">
					<Badge>Default</Badge>
					<Badge variant="secondary">Secondary</Badge>
					<Badge variant="outline">Outline</Badge>
					<Badge variant="destructive">Destructive</Badge>
				</CardContent>
			</Card>

			{/* Card within card */}
			<Card class="col-span-1">
				<CardHeader class="pb-3">
					<CardTitle class="text-sm font-medium text-muted-foreground">
						Card
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Card class="border-dashed">
						<CardHeader class="py-3 px-4">
							<CardTitle class="text-sm">Nested card</CardTitle>
							<CardDescription class="text-xs">
								With description
							</CardDescription>
						</CardHeader>
					</Card>
				</CardContent>
			</Card>

			{/* Tooltips */}
			<Card class="col-span-1">
				<CardHeader class="pb-3">
					<CardTitle class="text-sm font-medium text-muted-foreground">
						Tooltip
					</CardTitle>
				</CardHeader>
				<CardContent class="flex gap-2 flex-wrap">
					<Tooltip>
						<TooltipTrigger>
							<Button size="sm" variant="outline">
								Hover me
							</Button>
						</TooltipTrigger>
						<TooltipContent>This is a tooltip!</TooltipContent>
					</Tooltip>
					<Tooltip>
						<TooltipTrigger>
							<Button size="sm" variant="ghost">
								And me
							</Button>
						</TooltipTrigger>
						<TooltipContent>Another tooltip</TooltipContent>
					</Tooltip>
				</CardContent>
			</Card>

			{/* Tabs */}
			<Card class="col-span-1 sm:col-span-2 lg:col-span-2">
				<CardHeader class="pb-3">
					<CardTitle class="text-sm font-medium text-muted-foreground">
						Tabs
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="preview" class="w-full">
						<TabsList>
							<TabsIndicator />
							<TabsTrigger value="preview">Preview</TabsTrigger>
							<TabsTrigger value="code">Code</TabsTrigger>
							<TabsTrigger value="props">Props</TabsTrigger>
						</TabsList>
						<TabsContent value="preview">
							<div class="text-sm text-muted-foreground py-2">
								Live component preview renders here.
							</div>
						</TabsContent>
						<TabsContent value="code">
							<div class="font-mono text-xs text-muted-foreground py-2 bg-muted rounded px-3">
								{"<Button>Click me</Button>"}
							</div>
						</TabsContent>
						<TabsContent value="props">
							<div class="text-sm text-muted-foreground py-2">
								Props documentation.
							</div>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard(props: {
	icon: typeof IconZap;
	title: string;
	description: string;
}) {
	return (
		<div class="group relative flex flex-col gap-3 rounded-lg border border-border bg-card p-5 transition-colors hover:bg-accent/30 hover:border-primary/30">
			<div class="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-muted text-foreground">
				<props.icon class="h-4.5 w-4.5" />
			</div>
			<div>
				<h3 class="font-semibold text-sm mb-1">{props.title}</h3>
				<p class="text-sm text-muted-foreground leading-relaxed">
					{props.description}
				</p>
			</div>
		</div>
	);
}

// ─── Stats ────────────────────────────────────────────────────────────────────
const stats = [
	{ value: "60+", label: "Components" },
	{ value: "100%", label: "TypeScript" },
	{ value: "ARIA", label: "Accessible" },
	{ value: "SSR", label: "Compatible" },
];

// ─── Features ─────────────────────────────────────────────────────────────────
const features = [
	{
		icon: IconBox,
		title: "Copy & paste",
		description:
			"No package to install. Browse a component, run one CLI command, and own the code in your project.",
	},
	{
		icon: IconPalette,
		title: "Fully themeable",
		description:
			"CSS variables power every token. Swap colors, radii, and fonts globally or per-component.",
	},
	{
		icon: IconShield,
		title: "Accessible by default",
		description:
			"Built on Ark UI with WAI-ARIA compliance, keyboard navigation, and screen reader support baked in.",
	},
	{
		icon: IconZap,
		title: "Blazing fast",
		description:
			"Powered by SolidJS fine-grained reactivity. No virtual DOM — only the exact nodes that change update.",
	},
	{
		icon: IconLayers,
		title: "Composable API",
		description:
			"Primitive-first design. Mix, extend, and compose components without fighting the library.",
	},
	{
		icon: IconTerminal,
		title: "First-class CLI",
		description:
			"init, add, update, remove — a dedicated CLI manages your component registry end-to-end.",
	},
];

// ─── Home ─────────────────────────────────────────────────────────────────────
function Home() {
	return (
		<div class="min-h-screen bg-background text-foreground">
			<Navbar />

			{/* ── Hero ── */}
			<section class="relative overflow-hidden border-b border-border">
				{/* Background grid */}
				<div
					class="pointer-events-none absolute inset-0 opacity-[0.03]"
					style={{
						"background-image":
							"linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
						"background-size": "40px 40px",
					}}
				/>
				{/* Radial glow */}
				<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
					<div class="h-[500px] w-[800px] rounded-full bg-primary/5 blur-3xl" />
				</div>

				<div class="relative container mx-auto px-4 pt-20 pb-16 md:pt-28 md:pb-24">
					<div class="max-w-3xl mx-auto text-center space-y-6">
						<div class="flex items-center justify-center gap-2 mb-2">
							<Badge variant="secondary" class="gap-1.5 px-3 py-1 text-xs">
								<span class="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
								Now in beta — built with SolidJS & Ark UI
							</Badge>
						</div>

						<h1 class="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]">
							The component library
							<br />
							<span class="text-muted-foreground">built for</span>{" "}
							<span class="relative inline-block">
								<span class="relative z-10">SolidJS</span>
								<span
									class="absolute inset-x-0 bottom-1 h-3 -z-0 rounded"
									style={{
										background:
											"linear-gradient(90deg, hsl(var(--primary)/0.3), hsl(var(--primary)/0.1))",
									}}
								/>
							</span>
						</h1>

						<p class="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
							Method UI is a collection of accessible, customizable components
							you copy into your project. Powered by{" "}
							<span class="text-foreground font-medium">Ark UI</span> and styled
							with <span class="text-foreground font-medium">UnoCSS</span>. You
							own every line.
						</p>

						<div class="flex flex-wrap items-center justify-center gap-3 pt-2">
							<Link to="/docs/installation">
								<Button size="lg" class="gap-2 h-11 px-6">
									Get Started
									<IconArrowRight class="h-4 w-4" />
								</Button>
							</Link>
							<Link
								to="/components/$component"
								params={{ component: "button" }}
							>
								<Button size="lg" variant="outline" class="gap-2 h-11 px-6">
									<IconBox class="h-4 w-4" />
									Browse Components
								</Button>
							</Link>
							<a
								href="https://github.com/tgstudios/method"
								target="_blank"
								rel="noopener noreferrer"
							>
								<Button size="lg" variant="ghost" class="gap-2 h-11 px-6">
									<IconGithub class="h-4 w-4" />
									GitHub
								</Button>
							</a>
						</div>
					</div>

					{/* Stats row */}
					<div class="mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-16">
						<For each={stats}>
							{(stat, i) => (
								<>
									<div class="text-center">
										<div class="text-2xl font-bold tracking-tight">
											{stat.value}
										</div>
										<div class="text-xs text-muted-foreground mt-0.5 uppercase tracking-wider">
											{stat.label}
										</div>
									</div>
									<Show when={i() < stats.length - 1}>
										<Separator
											orientation="vertical"
											class="h-8 hidden md:block"
										/>
									</Show>
								</>
							)}
						</For>
					</div>
				</div>
			</section>

			{/* ── Install command ── */}
			<section class="py-12 border-b border-border bg-muted/20">
				<div class="container mx-auto px-4">
					<div class="max-w-lg mx-auto text-center mb-6">
						<p class="text-sm text-muted-foreground">
							One command to set up. Then add components one by one.
						</p>
					</div>
					<InstallCommand />
					<div class="mt-4 text-center">
						<Link to="/docs/installation">
							<Button
								variant="link"
								class="text-xs text-muted-foreground gap-1"
							>
								View full installation guide
								<IconArrowRight class="h-3 w-3" />
							</Button>
						</Link>
					</div>
				</div>
			</section>

			{/* ── Live component showcase ── */}
			<section class="py-20 border-b border-border">
				<div class="container mx-auto px-4">
					<div class="max-w-6xl mx-auto">
						<div class="mb-10">
							<Badge variant="outline" class="mb-3 text-xs">
								Live preview
							</Badge>
							<h2 class="text-2xl md:text-3xl font-bold mb-3">
								Real components, right here
							</h2>
							<p class="text-muted-foreground max-w-xl">
								Everything you see below is a live Method UI component running
								in the docs. No screenshots, no mocks.
							</p>
						</div>
						<ComponentShowcase />
						<div class="mt-8 flex justify-center">
							<Link
								to="/components/$component"
								params={{ component: "button" }}
							>
								<Button variant="outline" class="gap-2">
									Explore all components
									<IconArrowRight class="h-4 w-4" />
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* ── Features ── */}
			<section class="py-20 border-b border-border">
				<div class="container mx-auto px-4">
					<div class="max-w-6xl mx-auto">
						<div class="mb-10">
							<Badge variant="outline" class="mb-3 text-xs">
								Why Method UI
							</Badge>
							<h2 class="text-2xl md:text-3xl font-bold mb-3">
								Everything you need, nothing you don't
							</h2>
							<p class="text-muted-foreground max-w-xl">
								Designed for teams who want complete ownership of their UI
								without sacrificing quality or accessibility.
							</p>
						</div>
						<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
							<For each={features}>
								{(feature) => (
									<FeatureCard
										icon={feature.icon}
										title={feature.title}
										description={feature.description}
									/>
								)}
							</For>
						</div>
					</div>
				</div>
			</section>

			{/* ── How it works ── */}
			<section class="py-20 border-b border-border bg-muted/10">
				<div class="container mx-auto px-4">
					<div class="max-w-3xl mx-auto">
						<div class="text-center mb-12">
							<Badge variant="outline" class="mb-3 text-xs">
								Workflow
							</Badge>
							<h2 class="text-2xl md:text-3xl font-bold mb-3">
								Up and running in minutes
							</h2>
							<p class="text-muted-foreground">
								A simple workflow designed around how you actually build.
							</p>
						</div>

						<div class="space-y-4">
							{[
								{
									step: "01",
									title: "Initialize your project",
									description:
										"Run the init command to create a method.json config and install peer dependencies.",
									code: "bunx method@latest init",
								},
								{
									step: "02",
									title: "Add components",
									description:
										"Pick any component from the library and add it directly into your project's source.",
									code: "bunx method@latest add button card dialog",
								},
								{
									step: "03",
									title: "Import and use",
									description:
										"The component lives in your codebase. Customize it however you like — you own it.",
									code: 'import { Button } from "@/components/button"',
								},
							].map((item) => (
								<div class="flex gap-4 rounded-lg border border-border bg-card p-5">
									<div class="shrink-0 flex h-8 w-8 items-center justify-center rounded-md bg-muted font-mono text-xs font-bold text-muted-foreground">
										{item.step}
									</div>
									<div class="min-w-0 flex-1">
										<h3 class="font-semibold text-sm mb-1">{item.title}</h3>
										<p class="text-xs text-muted-foreground mb-3">
											{item.description}
										</p>
										<div class="flex items-center gap-2 rounded-md bg-muted px-3 py-2 font-mono text-xs">
											<IconTerminal class="h-3 w-3 text-muted-foreground shrink-0" />
											<span>{item.code}</span>
										</div>
									</div>
								</div>
							))}
						</div>

						<div class="mt-8 flex justify-center">
							<Link to="/docs/getting-started">
								<Button class="gap-2">
									Read the full guide
									<IconArrowRight class="h-4 w-4" />
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* ── CTA ── */}
			<section class="py-20">
				<div class="container mx-auto px-4">
					<div class="max-w-2xl mx-auto text-center space-y-6">
						<h2 class="text-2xl md:text-3xl font-bold">
							Start building something great
						</h2>
						<p class="text-muted-foreground">
							Method UI is open source, free to use, and designed to grow with
							your project. No lock-in, no surprises.
						</p>
						<div class="flex flex-wrap items-center justify-center gap-3">
							<Link to="/docs/installation">
								<Button size="lg" class="gap-2 h-11 px-6">
									Get started free
									<IconArrowRight class="h-4 w-4" />
								</Button>
							</Link>
							<a
								href="https://github.com/tgstudios/method"
								target="_blank"
								rel="noopener noreferrer"
							>
								<Button size="lg" variant="outline" class="gap-2 h-11 px-6">
									<IconGithub class="h-4 w-4" />
									Star on GitHub
								</Button>
							</a>
						</div>
					</div>
				</div>
			</section>

			{/* ── Footer ── */}
			<footer class="border-t border-border py-8">
				<div class="container mx-auto px-4">
					<div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
						<div class="flex items-center gap-2">
							<div class="h-5 w-5 rounded bg-primary flex items-center justify-center">
								<span class="text-primary-foreground text-[9px] font-bold">
									M
								</span>
							</div>
							<span class="font-medium text-foreground">Method UI</span>
							<span>— built with SolidJS, Ark UI & UnoCSS</span>
						</div>
						<div class="flex items-center gap-4">
							<Link to="/docs" class="hover:text-foreground transition-colors">
								Docs
							</Link>
							<Link
								to="/components/$component"
								params={{ component: "button" }}
								class="hover:text-foreground transition-colors"
							>
								Components
							</Link>
							<a
								href="https://github.com/tgstudios/method"
								target="_blank"
								rel="noopener noreferrer"
								class="hover:text-foreground transition-colors"
							>
								GitHub
							</a>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}

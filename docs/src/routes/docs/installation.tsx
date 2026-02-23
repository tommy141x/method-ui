import { createFileRoute, Link } from "@tanstack/solid-router";
import { createSignal, Show } from "solid-js";
import IconCheck from "~icons/lucide/check";
import IconCopy from "~icons/lucide/copy";
import IconTerminal from "~icons/lucide/terminal";
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
	Tabs,
	TabsContent,
	TabsIndicator,
	TabsList,
	TabsTrigger,
} from "../../components/tabs";

export const Route = createFileRoute("/docs/installation")({
	component: Installation,
});

// ─── Tiny inline code-block with copy ────────────────────────────────────────
function CodeBlock(props: { code: string; lang?: string; filename?: string }) {
	const [copied, setCopied] = createSignal(false);

	const copy = () => {
		navigator.clipboard.writeText(props.code);
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	};

	return (
		<div class="rounded-lg border border-border bg-muted/50 overflow-hidden text-sm">
			<Show when={props.filename}>
				<div class="flex items-center justify-between px-4 py-2 border-b border-border bg-muted">
					<span class="text-xs text-muted-foreground font-mono">
						{props.filename}
					</span>
					<Button
						variant="ghost"
						size="icon"
						class="h-6 w-6"
						onClick={copy}
						aria-label="Copy"
					>
						<Show when={copied()} fallback={<IconCopy class="h-3 w-3" />}>
							<IconCheck class="h-3 w-3 text-green-500" />
						</Show>
					</Button>
				</div>
			</Show>
			<div class="relative group">
				<Show when={!props.filename}>
					<Button
						variant="ghost"
						size="icon"
						class="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
						onClick={copy}
						aria-label="Copy"
					>
						<Show when={copied()} fallback={<IconCopy class="h-3 w-3" />}>
							<IconCheck class="h-3 w-3 text-green-500" />
						</Show>
					</Button>
				</Show>
				<pre class="p-4 overflow-x-auto leading-relaxed">
					<code class="font-mono text-foreground">{props.code}</code>
				</pre>
			</div>
		</div>
	);
}

// ─── Step header ─────────────────────────────────────────────────────────────
function Step(props: { n: number; title: string; children: JSX.Element }) {
	return (
		<div class="relative pl-10">
			{/* Step number bubble */}
			<div class="absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-muted text-xs font-bold text-muted-foreground select-none">
				{props.n}
			</div>
			<h3 class="text-base font-semibold mb-3 leading-7">{props.title}</h3>
			<div class="space-y-3">{props.children}</div>
		</div>
	);
}

import type { JSX } from "solid-js";

// ─── CLI command tabs ─────────────────────────────────────────────────────────
function PmTabs(props: { commands: Record<string, string> }) {
	const [active, setActive] = createSignal("bun");

	return (
		<Tabs
			value={active()}
			onValueChange={(e) => setActive(e.value)}
			class="gap-0 overflow-hidden rounded-lg border border-border bg-card"
		>
			<div class="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/50">
				<TabsList class="h-7 gap-0.5 bg-transparent p-0">
					<TabsIndicator />
					{Object.keys(props.commands).map((pm) => (
						<TabsTrigger
							value={pm}
							class="h-7 px-2.5 text-xs rounded-sm data-[selected]:bg-background data-[selected]:shadow-sm"
						>
							{pm}
						</TabsTrigger>
					))}
				</TabsList>
			</div>
			{Object.entries(props.commands).map(([pm, cmd]) => (
				<TabsContent value={pm} class="mt-0! p-0">
					<div class="flex items-center gap-2 px-4 py-3 font-mono text-sm">
						<IconTerminal class="h-3.5 w-3.5 text-muted-foreground shrink-0" />
						<span>{cmd}</span>
					</div>
				</TabsContent>
			))}
		</Tabs>
	);
}

// ─── Page ─────────────────────────────────────────────────────────────────────
function Installation() {
	return (
		<DocsLayout>
			<div class="max-w-3xl space-y-10">
				{/* Header */}
				<div>
					<Badge variant="secondary" class="mb-4 text-xs">
						Setup
					</Badge>
					<h1 class="text-3xl font-bold tracking-tight mb-3">Installation</h1>
					<p class="text-muted-foreground text-base leading-relaxed">
						Method UI uses a CLI to copy components directly into your project.
						There is no runtime package to install — you own every file.
					</p>
				</div>

				<Separator />

				{/* Prerequisites */}
				<div>
					<h2 class="text-xl font-semibold mb-4">Prerequisites</h2>
					<Card>
						<CardContent class="pt-5 space-y-3">
							<p class="text-sm text-muted-foreground">
								Before running the CLI, make sure your environment has:
							</p>
							<ul class="space-y-2">
								{[
									"Node.js 18+ or Bun 1.0+",
									"A SolidJS project (Vite, TanStack Start, or similar)",
									"UnoCSS configured in your Vite setup",
									"Basic familiarity with TypeScript",
								].map((item) => (
									<li class="flex items-start gap-2.5 text-sm">
										<IconCheck class="h-4 w-4 text-primary shrink-0 mt-0.5" />
										<span>{item}</span>
									</li>
								))}
							</ul>
						</CardContent>
					</Card>
				</div>

				<Separator />

				{/* Steps */}
				<div>
					<h2 class="text-xl font-semibold mb-6">Setup steps</h2>

					<div class="space-y-10">
						{/* Step 1 */}
						<Step n={1} title="Install peer dependencies">
							<p class="text-sm text-muted-foreground">
								Method UI components are built on{" "}
								<a
									href="https://ark-ui.com"
									target="_blank"
									rel="noopener noreferrer"
									class="text-foreground underline underline-offset-4"
								>
									Ark UI
								</a>{" "}
								and rely on a handful of small utilities. Install them once,
								then every component you add can use them.
							</p>
							<PmTabs
								commands={{
									bun: "bun add @ark-ui/solid solid-motionone clsx unocss-merge class-variance-authority",
									npm: "npm install @ark-ui/solid solid-motionone clsx unocss-merge class-variance-authority",
									pnpm: "pnpm add @ark-ui/solid solid-motionone clsx unocss-merge class-variance-authority",
									yarn: "yarn add @ark-ui/solid solid-motionone clsx unocss-merge class-variance-authority",
								}}
							/>
							<p class="text-xs text-muted-foreground">
								Icon libraries (e.g.{" "}
								<code class="font-mono bg-muted px-1 rounded">
									unplugin-icons
								</code>{" "}
								with{" "}
								<code class="font-mono bg-muted px-1 rounded">
									@iconify/json
								</code>
								) are optional but recommended — the CLI will prompt you during
								init.
							</p>
						</Step>

						{/* Step 2 */}
						<Step n={2} title="Run the CLI initializer">
							<p class="text-sm text-muted-foreground">
								The{" "}
								<code class="font-mono bg-muted px-1 rounded text-xs">
									init
								</code>{" "}
								command creates a{" "}
								<code class="font-mono bg-muted px-1 rounded text-xs">
									method.json
								</code>{" "}
								config file at your project root and sets up the component
								directory.
							</p>
							<PmTabs
								commands={{
									bun: "bunx method@latest init",
									npm: "npx method@latest init",
									pnpm: "pnpm dlx method@latest init",
									yarn: "yarn dlx method@latest init",
								}}
							/>
							<p class="text-sm text-muted-foreground">
								The CLI will ask you a few questions:
							</p>
							<ul class="space-y-1.5">
								{[
									"Where to place components (default: src/components)",
									"Whether to use TypeScript",
									"Which icon library to use",
								].map((q) => (
									<li class="flex items-start gap-2 text-sm text-muted-foreground">
										<span class="text-primary mt-0.5">›</span>
										{q}
									</li>
								))}
							</ul>
							<Card class="border-dashed">
								<CardHeader class="py-3 px-4">
									<CardTitle class="text-xs font-mono">method.json</CardTitle>
									<CardDescription class="text-xs">
										Generated config file — commit this to version control.
									</CardDescription>
								</CardHeader>
								<CardContent class="pt-0 px-4 pb-4">
									<CodeBlock
										code={`{
  "componentsPath": "src/components",
  "typescript": true,
  "iconLibrary": "lucide"
}`}
									/>
								</CardContent>
							</Card>
						</Step>

						{/* Step 3 */}
						<Step n={3} title="Configure global CSS">
							<p class="text-sm text-muted-foreground">
								Method UI is styled with{" "}
								<a
									href="https://unocss.dev"
									target="_blank"
									rel="noopener noreferrer"
									class="text-foreground underline underline-offset-4"
								>
									UnoCSS
								</a>{" "}
								and CSS variables. Add the design tokens to your global CSS
								file.
							</p>
							<CodeBlock
								filename="src/global.css"
								code={`@import "@unocss/reset/tailwind.css";

@layer base {
  :root {
    /* Base (dark) theme */
    --background: 223.8 0% 3.9%;
    --foreground: 223.8 0% 98%;
    --card: 223.8 0% 9%;
    --card-foreground: 223.8 0% 98%;
    --popover: 223.8 0% 14.9%;
    --popover-foreground: 223.8 0% 98%;
    --primary: 223.8 0% 89.8%;
    --primary-foreground: 223.8 0% 9%;
    --secondary: 223.8 0% 14.9%;
    --secondary-foreground: 223.8 0% 98%;
    --muted: 223.8 0% 14.9%;
    --muted-foreground: 223.8 0% 63%;
    --accent: 223.8 0% 25%;
    --accent-foreground: 223.8 0% 98%;
    --destructive: 358.8 101.8% 69.8%;
    --destructive-foreground: 223.8 0% 98%;
    --border: 223.8 0% 15.5%;
    --input: 223.8 0% 20.4%;
    --ring: 223.8 0% 45.2%;
    --radius: 0.5rem;
  }

  .light {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
  }
}`}
							/>
						</Step>

						{/* Step 4 */}
						<Step n={4} title="Configure UnoCSS theme tokens">
							<p class="text-sm text-muted-foreground">
								Wire up the CSS variables as UnoCSS color tokens so every
								component can reference them with utility classes like{" "}
								<code class="font-mono bg-muted px-1 rounded text-xs">
									bg-primary
								</code>{" "}
								or{" "}
								<code class="font-mono bg-muted px-1 rounded text-xs">
									text-muted-foreground
								</code>
								.
							</p>
							<CodeBlock
								filename="uno.config.ts"
								code={`import { defineConfig, presetWind4 } from "unocss";

export default defineConfig({
  presets: [presetWind4()],
  theme: {
    colors: {
      background: "hsl(var(--background))",
      foreground: "hsl(var(--foreground))",
      border: "hsl(var(--border))",
      input: "hsl(var(--input))",
      ring: "hsl(var(--ring))",
      primary: {
        DEFAULT: "hsl(var(--primary))",
        foreground: "hsl(var(--primary-foreground))",
      },
      secondary: {
        DEFAULT: "hsl(var(--secondary))",
        foreground: "hsl(var(--secondary-foreground))",
      },
      destructive: {
        DEFAULT: "hsl(var(--destructive))",
        foreground: "hsl(var(--destructive-foreground))",
      },
      muted: {
        DEFAULT: "hsl(var(--muted))",
        foreground: "hsl(var(--muted-foreground))",
      },
      accent: {
        DEFAULT: "hsl(var(--accent))",
        foreground: "hsl(var(--accent-foreground))",
      },
      card: {
        DEFAULT: "hsl(var(--card))",
        foreground: "hsl(var(--card-foreground))",
      },
      popover: {
        DEFAULT: "hsl(var(--popover))",
        foreground: "hsl(var(--popover-foreground))",
      },
    },
    borderRadius: {
      lg: "var(--radius)",
      md: "calc(var(--radius) - 2px)",
      sm: "calc(var(--radius) - 4px)",
    },
  },
});`}
							/>
						</Step>

						{/* Step 5 */}
						<Step n={5} title="Add your first component">
							<p class="text-sm text-muted-foreground">
								Use the{" "}
								<code class="font-mono bg-muted px-1 rounded text-xs">add</code>{" "}
								command to copy a component into your project. Dependencies are
								resolved and co-installed automatically.
							</p>
							<PmTabs
								commands={{
									bun: "bunx method@latest add button",
									npm: "npx method@latest add button",
									pnpm: "pnpm dlx method@latest add button",
									yarn: "yarn dlx method@latest add button",
								}}
							/>
							<p class="text-sm text-muted-foreground">
								You can add multiple components in one go:
							</p>
							<PmTabs
								commands={{
									bun: "bunx method@latest add button card dialog toast",
									npm: "npx method@latest add button card dialog toast",
									pnpm: "pnpm dlx method@latest add button card dialog toast",
									yarn: "yarn dlx method@latest add button card dialog toast",
								}}
							/>
							<p class="text-xs text-muted-foreground">
								Components land in the path you configured during{" "}
								<code class="font-mono bg-muted px-1 rounded">init</code>{" "}
								(default:{" "}
								<code class="font-mono bg-muted px-1 rounded">
									src/components
								</code>
								). Open the file, read it, change it — it's yours.
							</p>
						</Step>
					</div>
				</div>

				<Separator />

				{/* CLI reference */}
				<div>
					<h2 class="text-xl font-semibold mb-4">CLI reference</h2>
					<div class="space-y-4">
						{[
							{
								cmd: "method init",
								desc: "Initialise Method UI in a project. Creates method.json, prompts for config, and installs peer deps.",
							},
							{
								cmd: "method add [components...]",
								desc: "Copy one or more components (and their dependencies) into your project.",
							},
							{
								cmd: "method update [components...]",
								desc: "Pull the latest version of components from the registry into your project.",
							},
							{
								cmd: "method remove <component>",
								desc: "Delete a component file from your project.",
							},
						].map((row) => (
							<div class="rounded-lg border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-start gap-3">
								<code class="shrink-0 font-mono text-xs bg-muted px-2.5 py-1 rounded-md text-foreground whitespace-nowrap">
									{row.cmd}
								</code>
								<p class="text-sm text-muted-foreground leading-relaxed">
									{row.desc}
								</p>
							</div>
						))}
					</div>
				</div>

				<Separator />

				{/* Next steps */}
				<div>
					<h2 class="text-xl font-semibold mb-4">Next steps</h2>
					<div class="grid sm:grid-cols-2 gap-3">
						<Link to="/docs/getting-started">
							<Card class="h-full hover:bg-accent/30 hover:border-primary/30 transition-colors cursor-pointer">
								<CardHeader class="pb-2">
									<CardTitle class="text-sm">Getting Started →</CardTitle>
									<CardDescription class="text-xs">
										Learn the component patterns and how to use variants, props,
										and composition.
									</CardDescription>
								</CardHeader>
							</Card>
						</Link>
						<Link to="/docs/theming">
							<Card class="h-full hover:bg-accent/30 hover:border-primary/30 transition-colors cursor-pointer">
								<CardHeader class="pb-2">
									<CardTitle class="text-sm">Theming →</CardTitle>
									<CardDescription class="text-xs">
										Customise the design tokens, switch themes at runtime, and
										build your own palette.
									</CardDescription>
								</CardHeader>
							</Card>
						</Link>
					</div>
				</div>
			</div>
		</DocsLayout>
	);
}

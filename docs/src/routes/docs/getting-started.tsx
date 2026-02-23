import { createFileRoute, Link } from "@tanstack/solid-router";
import { createSignal } from "solid-js";
import IconArrowRight from "~icons/lucide/arrow-right";
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
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "../../components/tooltip";

export const Route = createFileRoute("/docs/getting-started")({
	component: GettingStarted,
});

// ─── Inline code block with copy ─────────────────────────────────────────────
function CodeBlock(props: { code: string; filename?: string }) {
	const [copied, setCopied] = createSignal(false);
	const copy = () => {
		navigator.clipboard.writeText(props.code);
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	};

	return (
		<div class="rounded-lg border border-border bg-muted/50 overflow-hidden text-sm font-mono">
			{props.filename && (
				<div class="flex items-center justify-between px-4 py-2 border-b border-border bg-muted">
					<span class="text-xs text-muted-foreground">{props.filename}</span>
					<Button
						variant="ghost"
						size="icon"
						class="h-6 w-6"
						onClick={copy}
						aria-label="Copy"
					>
						{copied() ? (
							<IconCheck class="h-3 w-3 text-green-500" />
						) : (
							<IconCopy class="h-3 w-3" />
						)}
					</Button>
				</div>
			)}
			<div class="relative group">
				{!props.filename && (
					<Button
						variant="ghost"
						size="icon"
						class="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
						onClick={copy}
						aria-label="Copy"
					>
						{copied() ? (
							<IconCheck class="h-3 w-3 text-green-500" />
						) : (
							<IconCopy class="h-3 w-3" />
						)}
					</Button>
				)}
				<pre class="p-4 overflow-x-auto leading-relaxed text-foreground">
					<code>{props.code}</code>
				</pre>
			</div>
		</div>
	);
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHeading(props: { n: string; title: string }) {
	return (
		<div class="flex items-center gap-3 mb-5">
			<span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold select-none">
				{props.n}
			</span>
			<h2 class="text-xl font-semibold">{props.title}</h2>
		</div>
	);
}

// ─── Page ─────────────────────────────────────────────────────────────────────
function GettingStarted() {
	return (
		<DocsLayout>
			<div class="max-w-3xl space-y-12">
				{/* Header */}
				<div>
					<Badge variant="secondary" class="mb-4 text-xs">
						Guide
					</Badge>
					<h1 class="text-3xl font-bold tracking-tight mb-3">
						Getting Started
					</h1>
					<p class="text-muted-foreground text-base leading-relaxed">
						A quick walkthrough of the Method UI workflow — from installing your
						first component to customising variants and composing layouts.
					</p>
				</div>

				<Separator />

				{/* 1. Add a component */}
				<div>
					<SectionHeading n="1" title="Add your first component" />
					<div class="space-y-4">
						<p class="text-sm text-muted-foreground leading-relaxed">
							Use the CLI to copy any component into your project. The file
							lands in whatever path you set during{" "}
							<code class="font-mono bg-muted px-1 rounded text-xs">init</code>{" "}
							— typically{" "}
							<code class="font-mono bg-muted px-1 rounded text-xs">
								src/components
							</code>
							.
						</p>
						<div class="rounded-lg border border-border bg-card overflow-hidden">
							<div class="flex items-center gap-2 px-4 py-3 font-mono text-sm">
								<IconTerminal class="h-3.5 w-3.5 text-muted-foreground shrink-0" />
								<span>bunx method@latest add button</span>
							</div>
						</div>
						<p class="text-sm text-muted-foreground">
							Dependencies are resolved and installed automatically. You can add
							several at once:
						</p>
						<div class="rounded-lg border border-border bg-card overflow-hidden">
							<div class="flex items-center gap-2 px-4 py-3 font-mono text-sm">
								<IconTerminal class="h-3.5 w-3.5 text-muted-foreground shrink-0" />
								<span>bunx method@latest add button card dialog toast</span>
							</div>
						</div>
					</div>
				</div>

				<Separator />

				{/* 2. Import and render */}
				<div>
					<SectionHeading n="2" title="Import and render" />
					<div class="space-y-4">
						<p class="text-sm text-muted-foreground leading-relaxed">
							Components are regular TypeScript files in your project. Import
							them like anything else — no magic, no wrappers.
						</p>

						<CodeBlock
							filename="src/routes/index.tsx"
							code={`import { Button } from "@/components/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/card";

export default function App() {
  return (
    <Card class="max-w-sm">
      <CardHeader>
        <CardTitle>Hello, Method UI</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  );
}`}
						/>

						{/* Live preview */}
						<Card>
							<CardHeader class="pb-3">
								<CardTitle class="text-sm font-medium text-muted-foreground">
									Live preview
								</CardTitle>
							</CardHeader>
							<CardContent>
								<Card class="max-w-sm border-dashed">
									<CardHeader>
										<CardTitle class="text-base">Hello, Method UI</CardTitle>
									</CardHeader>
									<CardContent>
										<Button>Click me</Button>
									</CardContent>
								</Card>
							</CardContent>
						</Card>
					</div>
				</div>

				<Separator />

				{/* 3. Variants */}
				<div>
					<SectionHeading n="3" title="Using variants" />
					<div class="space-y-4">
						<p class="text-sm text-muted-foreground leading-relaxed">
							Most components expose a{" "}
							<code class="font-mono bg-muted px-1 rounded text-xs">
								variant
							</code>{" "}
							and a{" "}
							<code class="font-mono bg-muted px-1 rounded text-xs">size</code>{" "}
							prop, powered by{" "}
							<code class="font-mono bg-muted px-1 rounded text-xs">
								class-variance-authority
							</code>
							. Variants are just strings — your IDE will autocomplete them.
						</p>

						<Tabs defaultValue="preview" class="w-full">
							<TabsList>
								<TabsIndicator />
								<TabsTrigger value="preview">Preview</TabsTrigger>
								<TabsTrigger value="code">Code</TabsTrigger>
							</TabsList>

							<TabsContent value="preview">
								<Card>
									<CardHeader class="pb-3">
										<CardTitle class="text-xs font-medium text-muted-foreground uppercase tracking-wider">
											Variants
										</CardTitle>
									</CardHeader>
									<CardContent class="flex flex-wrap gap-2">
										<Button variant="default" size="sm">
											Default
										</Button>
										<Button variant="secondary" size="sm">
											Secondary
										</Button>
										<Button variant="outline" size="sm">
											Outline
										</Button>
										<Button variant="ghost" size="sm">
											Ghost
										</Button>
										<Button variant="destructive" size="sm">
											Destructive
										</Button>
										<Button variant="link" size="sm">
											Link
										</Button>
									</CardContent>
									<CardContent class="flex flex-wrap items-center gap-2">
										<div class="text-xs text-muted-foreground w-full mb-1 uppercase tracking-wider font-medium">
											Sizes
										</div>
										<Button size="sm">Small</Button>
										<Button size="default">Default</Button>
										<Button size="lg">Large</Button>
										<Button size="icon" variant="outline">
											<IconCheck class="h-4 w-4" />
										</Button>
									</CardContent>
								</Card>
							</TabsContent>

							<TabsContent value="code">
								<CodeBlock
									code={`// Variants
<Button variant="default">Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><CheckIcon /></Button>`}
								/>
							</TabsContent>
						</Tabs>

						{/* Badge variants too */}
						<Tabs defaultValue="preview" class="w-full">
							<TabsList>
								<TabsIndicator />
								<TabsTrigger value="preview">Badge — Preview</TabsTrigger>
								<TabsTrigger value="code">Code</TabsTrigger>
							</TabsList>
							<TabsContent value="preview">
								<Card>
									<CardContent class="pt-4 flex flex-wrap gap-2">
										<Badge>Default</Badge>
										<Badge variant="secondary">Secondary</Badge>
										<Badge variant="outline">Outline</Badge>
										<Badge variant="destructive">Destructive</Badge>
									</CardContent>
								</Card>
							</TabsContent>
							<TabsContent value="code">
								<CodeBlock
									code={`<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Destructive</Badge>`}
								/>
							</TabsContent>
						</Tabs>
					</div>
				</div>

				<Separator />

				{/* 4. Composing components */}
				<div>
					<SectionHeading n="4" title="Composing components" />
					<div class="space-y-4">
						<p class="text-sm text-muted-foreground leading-relaxed">
							Method UI components are designed to nest and compose. Here's a
							realistic card with a badge, description, tooltip, and action
							button.
						</p>

						<Tabs defaultValue="preview" class="w-full">
							<TabsList>
								<TabsIndicator />
								<TabsTrigger value="preview">Preview</TabsTrigger>
								<TabsTrigger value="code">Code</TabsTrigger>
							</TabsList>

							<TabsContent value="preview">
								<div class="flex justify-center p-6 border border-border rounded-lg bg-muted/20">
									<Card class="w-full max-w-sm">
										<CardHeader>
											<div class="flex items-start justify-between gap-2">
												<div class="space-y-1">
													<CardTitle>New release</CardTitle>
													<CardDescription>
														Method UI v0.2 is now available.
													</CardDescription>
												</div>
												<Badge variant="secondary">v0.2</Badge>
											</div>
										</CardHeader>
										<CardContent class="flex items-center justify-between">
											<p class="text-xs text-muted-foreground">
												60+ components updated
											</p>
											<Tooltip>
												<TooltipTrigger>
													<Button size="sm" variant="outline">
														View changelog
													</Button>
												</TooltipTrigger>
												<TooltipContent>
													Opens the full release notes
												</TooltipContent>
											</Tooltip>
										</CardContent>
									</Card>
								</div>
							</TabsContent>

							<TabsContent value="code">
								<CodeBlock
									code={`import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/tooltip";

export function ReleaseCard() {
  return (
    <Card class="w-full max-w-sm">
      <CardHeader>
        <div class="flex items-start justify-between gap-2">
          <div class="space-y-1">
            <CardTitle>New release</CardTitle>
            <CardDescription>Method UI v0.2 is now available.</CardDescription>
          </div>
          <Badge variant="secondary">v0.2</Badge>
        </div>
      </CardHeader>
      <CardContent class="flex items-center justify-between">
        <p class="text-xs text-muted-foreground">60+ components updated</p>
        <Tooltip>
          <TooltipTrigger>
            <Button size="sm" variant="outline">View changelog</Button>
          </TooltipTrigger>
          <TooltipContent>Opens the full release notes</TooltipContent>
        </Tooltip>
      </CardContent>
    </Card>
  );
}`}
								/>
							</TabsContent>
						</Tabs>
					</div>
				</div>

				<Separator />

				{/* 5. Customising */}
				<div>
					<SectionHeading n="5" title="Customising a component" />
					<div class="space-y-4">
						<p class="text-sm text-muted-foreground leading-relaxed">
							Because the component file lives in your project, you can edit it
							directly. Every component accepts a{" "}
							<code class="font-mono bg-muted px-1 rounded text-xs">class</code>{" "}
							prop for one-off overrides via UnoCSS utilities.
						</p>

						<Tabs defaultValue="preview" class="w-full">
							<TabsList>
								<TabsIndicator />
								<TabsTrigger value="preview">Preview</TabsTrigger>
								<TabsTrigger value="code">Code</TabsTrigger>
							</TabsList>
							<TabsContent value="preview">
								<div class="flex flex-wrap gap-3 p-4 border border-border rounded-lg bg-muted/20">
									{/* Wider */}
									<Button class="w-full sm:w-auto px-12">Wide button</Button>
									{/* Custom colour via CSS variable override */}
									<Button
										variant="outline"
										class="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
									>
										Custom colour
									</Button>
									{/* Rounded pill */}
									<Button variant="secondary" class="rounded-full px-6">
										Pill shape
									</Button>
								</div>
							</TabsContent>
							<TabsContent value="code">
								<CodeBlock
									code={`// Extra-wide with a class override
<Button class="px-12">Wide button</Button>

// Custom border/text colour
<Button
  variant="outline"
  class="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
>
  Custom colour
</Button>

// Pill shape
<Button variant="secondary" class="rounded-full px-6">
  Pill shape
</Button>`}
								/>
							</TabsContent>
						</Tabs>

						<p class="text-sm text-muted-foreground leading-relaxed">
							For deeper changes — new variants, different defaults, extra props
							— just open the component file and edit the{" "}
							<code class="font-mono bg-muted px-1 rounded text-xs">cva()</code>{" "}
							definition. Nobody will stop you.
						</p>

						<CodeBlock
							filename="src/components/button.tsx"
							code={`// Add a new "brand" variant directly in the file:
const buttonVariants = cva("...", {
  variants: {
    variant: {
      // ...existing variants
      brand: "bg-violet-600 text-white hover:bg-violet-700",
    },
  },
});`}
						/>
					</div>
				</div>

				<Separator />

				{/* 6. TypeScript */}
				<div>
					<SectionHeading n="6" title="TypeScript usage" />
					<div class="space-y-4">
						<p class="text-sm text-muted-foreground leading-relaxed">
							All components export their prop types. You can import and extend
							them to build wrappers or higher-order components with full type
							safety.
						</p>
						<CodeBlock
							code={`import { Button } from "@/components/button";
import type { ButtonProps } from "@/components/button";

// Extend ButtonProps to add your own props
interface MyButtonProps extends ButtonProps {
  label: string;
  isLoading?: boolean;
}

export function MyButton(props: MyButtonProps) {
  return (
    <Button
      {...props}
      loading={props.isLoading}
      loadingText="Please wait…"
    >
      {props.label}
    </Button>
  );
}`}
						/>
					</div>
				</div>

				<Separator />

				{/* 7. Updating */}
				<div>
					<SectionHeading n="7" title="Keeping components up to date" />
					<div class="space-y-4">
						<p class="text-sm text-muted-foreground leading-relaxed">
							Run{" "}
							<code class="font-mono bg-muted px-1 rounded text-xs">
								update
							</code>{" "}
							to pull the latest version of any component from the registry. The
							CLI will warn you before overwriting any local changes.
						</p>
						<div class="rounded-lg border border-border bg-card overflow-hidden">
							<div class="flex items-center gap-2 px-4 py-3 font-mono text-sm">
								<IconTerminal class="h-3.5 w-3.5 text-muted-foreground shrink-0" />
								<span>bunx method@latest update button card</span>
							</div>
						</div>
						<div class="rounded-lg border border-border bg-card overflow-hidden">
							<div class="flex items-center gap-2 px-4 py-3 font-mono text-sm">
								<IconTerminal class="h-3.5 w-3.5 text-muted-foreground shrink-0" />
								<span class="text-muted-foreground">
									# Update all installed components
								</span>
							</div>
							<div class="flex items-center gap-2 px-4 py-3 font-mono text-sm border-t border-border">
								<IconTerminal class="h-3.5 w-3.5 text-muted-foreground shrink-0" />
								<span>bunx method@latest update</span>
							</div>
						</div>
					</div>
				</div>

				<Separator />

				{/* Next steps */}
				<div class="space-y-4">
					<h2 class="text-xl font-semibold">What's next?</h2>
					<div class="grid sm:grid-cols-2 gap-3">
						<Link to="/docs/theming">
							<Card class="h-full hover:bg-accent/30 hover:border-primary/30 transition-colors cursor-pointer">
								<CardHeader class="pb-2">
									<CardTitle class="text-sm">Theming →</CardTitle>
									<CardDescription class="text-xs">
										Switch dark / light mode, build custom palettes, and
										override CSS variables at runtime.
									</CardDescription>
								</CardHeader>
							</Card>
						</Link>
						<Link to="/components/$component" params={{ component: "button" }}>
							<Card class="h-full hover:bg-accent/30 hover:border-primary/30 transition-colors cursor-pointer">
								<CardHeader class="pb-2">
									<CardTitle class="text-sm">Components →</CardTitle>
									<CardDescription class="text-xs">
										Browse all 60+ components with live examples, props tables,
										and one-click install commands.
									</CardDescription>
								</CardHeader>
							</Card>
						</Link>
					</div>

					<div class="flex items-center gap-3 pt-1">
						<Link to="/docs/theming">
							<Button variant="outline" class="gap-2 h-9">
								Theming guide
								<IconArrowRight class="h-4 w-4" />
							</Button>
						</Link>
						<Link to="/components/$component" params={{ component: "button" }}>
							<Button class="gap-2 h-9">
								Browse components
								<IconArrowRight class="h-4 w-4" />
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</DocsLayout>
	);
}

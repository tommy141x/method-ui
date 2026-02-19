import type { Component, JSX } from "solid-js";
import { createSignal, Show, splitProps } from "solid-js";
import { cn } from "../lib/cn";
import { icon } from "../lib/icon";
import type { ComponentMeta } from "../lib/meta";
import { Button } from "./button";
import { Tabs, TabsContent, TabsIndicator, TabsList, TabsTrigger } from "./tabs";

export interface SnippetProps {
	children?: JSX.Element;
	class?: string;
	value?: string;
	defaultValue?: string;
	onValueChange?: (details: { value: string }) => void;
}

export const Snippet: Component<SnippetProps> = (props) => {
	const [local, others] = splitProps(props, ["children", "class"]);

	return (
		<Tabs class={cn("group w-full gap-0 overflow-hidden rounded-md", local.class)} {...others}>
			{local.children}
		</Tabs>
	);
};

export interface SnippetHeaderProps extends JSX.HTMLAttributes<HTMLDivElement> {
	children?: JSX.Element;
	class?: string;
}

export const SnippetHeader: Component<SnippetHeaderProps> = (props) => {
	const [local, others] = splitProps(props, ["children", "class"]);

	return (
		<div
			class={cn("flex flex-row items-center justify-between bg-card p-1", local.class)}
			{...others}
		>
			{local.children}
		</div>
	);
};

export interface SnippetCopyButtonProps {
	value: string;
	onCopy?: () => void;
	onError?: (error: Error) => void;
	timeout?: number;
	children?: JSX.Element;
	class?: string;
}

export const SnippetCopyButton: Component<SnippetCopyButtonProps> = (props) => {
	const [local, others] = splitProps(props, [
		"value",
		"onCopy",
		"onError",
		"timeout",
		"children",
		"class",
	]);

	const [isCopied, setIsCopied] = createSignal(false);
	const timeout = () => local.timeout ?? 2000;

	const copyToClipboard = () => {
		if (typeof window === "undefined" || !navigator.clipboard.writeText || !local.value) {
			return;
		}

		navigator.clipboard.writeText(local.value).then(
			() => {
				setIsCopied(true);
				local.onCopy?.();

				setTimeout(() => setIsCopied(false), timeout());
			},
			(error) => {
				local.onError?.(error);
			}
		);
	};

	return (
		<Button
			class={cn(local.class)}
			onClick={copyToClipboard}
			size="icon"
			variant="ghost"
			{...others}
		>
			<Show
				when={local.children}
				fallback={
					<Show when={isCopied()} fallback={<div class={icon("copy")} />}>
						<div class={icon("check")} />
					</Show>
				}
			>
				{local.children}
			</Show>
		</Button>
	);
};

export interface SnippetTabsListProps {
	children?: JSX.Element;
	class?: string;
	variant?: "default" | "underline";
}

export const SnippetTabsList: Component<SnippetTabsListProps> = (props) => {
	return <TabsList {...props} />;
};

export interface SnippetTabsTriggerProps {
	value: string;
	children?: JSX.Element;
	disabled?: boolean;
	class?: string;
	variant?: "default" | "underline";
}

export const SnippetTabsTrigger: Component<SnippetTabsTriggerProps> = (props) => {
	const [local, others] = splitProps(props, ["class"]);

	return <TabsTrigger class={cn("gap-1.5", local.class)} {...others} />;
};

export interface SnippetTabsContentProps {
	value: string;
	children?: JSX.Element;
	class?: string;
}

export const SnippetTabsContent: Component<SnippetTabsContentProps> = (props) => {
	const [local, others] = splitProps(props, ["children", "class"]);

	return (
		<TabsContent class={cn("!mt-0 bg-muted p-4 text-sm", local.class)} {...others}>
			<pre class="overflow-x-auto">{local.children}</pre>
		</TabsContent>
	);
};

export const SnippetIndicator = TabsIndicator;

export interface SnippetContentProps extends JSX.HTMLAttributes<HTMLDivElement> {
	children?: JSX.Element;
	class?: string;
}

export const SnippetContent: Component<SnippetContentProps> = (props) => {
	const [local, others] = splitProps(props, ["children", "class"]);

	return (
		<div class={cn("bg-muted p-4 text-sm", local.class)} {...others}>
			<pre class="overflow-x-auto m-0">{local.children}</pre>
		</div>
	);
};

export const meta: ComponentMeta<SnippetProps> = {
	name: "Snippet",
	description:
		"A code snippet component with syntax highlighting, copy functionality, and tab support for multiple code examples. Perfect for documentation and showcasing code.",
	apiReference: "",
	examples: [
		{
			title: "Basic",
			description: "Simple code snippet with copy button",
			code: () => {
				const code = "npm install method-ui";
				return (
					<div class="group w-full gap-0 overflow-hidden rounded-md max-w-2xl">
						<SnippetHeader>
							<span class="text-sm font-medium px-2">Install</span>
							<SnippetCopyButton value={code} />
						</SnippetHeader>
						<SnippetContent>{code}</SnippetContent>
					</div>
				);
			},
		},
		{
			title: "Multiple Tabs",
			description: "Code snippet with multiple language examples",
			code: () => (
				<Snippet defaultValue="npm" class="max-w-2xl">
					<SnippetHeader>
						<SnippetTabsList>
							<SnippetIndicator />
							<SnippetTabsTrigger value="npm">npm</SnippetTabsTrigger>
							<SnippetTabsTrigger value="yarn">yarn</SnippetTabsTrigger>
							<SnippetTabsTrigger value="pnpm">pnpm</SnippetTabsTrigger>
							<SnippetTabsTrigger value="bun">bun</SnippetTabsTrigger>
						</SnippetTabsList>
						<SnippetCopyButton value="npm install @method-ui/core" />
					</SnippetHeader>
					<SnippetTabsContent value="npm">npm install @method-ui/core</SnippetTabsContent>
					<SnippetTabsContent value="yarn">yarn add @method-ui/core</SnippetTabsContent>
					<SnippetTabsContent value="pnpm">pnpm add @method-ui/core</SnippetTabsContent>
					<SnippetTabsContent value="bun">bun add @method-ui/core</SnippetTabsContent>
				</Snippet>
			),
		},
		{
			title: "Code Example",
			description: "Snippet with actual code content",
			code: () => {
				const codeExample = `import { Button } from "@method-ui/core";

export default function App() {
  return (
    <Button onClick={() => alert("Hello!")}>
      Click me
    </Button>
  );
}`;

				return (
					<Snippet defaultValue="tsx" class="max-w-2xl">
						<SnippetHeader>
							<SnippetTabsList>
								<SnippetIndicator />
								<SnippetTabsTrigger value="tsx">
									<div class="h-4 w-4 i-lucide-file-code" />
									App.tsx
								</SnippetTabsTrigger>
							</SnippetTabsList>
							<SnippetCopyButton value={codeExample} />
						</SnippetHeader>
						<SnippetTabsContent value="tsx">{codeExample}</SnippetTabsContent>
					</Snippet>
				);
			},
		},
		{
			title: "Multiple Files",
			description: "Snippet showing multiple file examples",
			code: () => {
				const componentCode = `export function Hello() {
  return <h1>Hello World!</h1>;
}`;

				const styleCode = `.container {
  display: flex;
  align-items: center;
  justify-content: center;
}`;

				const configCode = `export default {
  name: "my-app",
  version: "1.0.0"
};`;

				return (
					<Snippet defaultValue="component" class="max-w-2xl">
						<SnippetHeader>
							<SnippetTabsList>
								<SnippetIndicator />
								<SnippetTabsTrigger value="component">
									<div class="h-4 w-4 i-lucide-file-code" />
									Component.tsx
								</SnippetTabsTrigger>
								<SnippetTabsTrigger value="styles">
									<div class="h-4 w-4 i-lucide-palette" />
									styles.css
								</SnippetTabsTrigger>
								<SnippetTabsTrigger value="config">
									<div class="h-4 w-4 i-lucide-settings" />
									config.ts
								</SnippetTabsTrigger>
							</SnippetTabsList>
							<SnippetCopyButton value={componentCode} />
						</SnippetHeader>
						<SnippetTabsContent value="component">{componentCode}</SnippetTabsContent>
						<SnippetTabsContent value="styles">{styleCode}</SnippetTabsContent>
						<SnippetTabsContent value="config">{configCode}</SnippetTabsContent>
					</Snippet>
				);
			},
		},
	],
};

export default Snippet;

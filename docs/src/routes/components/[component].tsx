import metadataJson from "@lib/registry.json";
import { Meta, Title } from "@solidjs/meta";
import { useParams } from "@solidjs/router";
import {
	createEffect,
	createSignal,
	For,
	Index,
	type JSX,
	onCleanup,
	onMount,
	Show,
} from "solid-js";
import IconBox from "~icons/lucide/box";
import IconCheck from "~icons/lucide/check";
import IconCode from "~icons/lucide/code";
import IconCopy from "~icons/lucide/copy";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "../../components/accordion";
import { Badge } from "../../components/badge";
import { Button } from "../../components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/card";
import { DocsLayout } from "../../components/docs-layout";
import { Tabs, TabsContent, TabsIndicator, TabsList, TabsTrigger } from "../../components/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../components/tooltip";

const componentMetadata = metadataJson.componentMetadata;

/**
 * Remove excess indentation from source code
 */
function dedent(code: string): string {
	const lines = code.split("\n");

	// Remove leading/trailing empty lines
	while (lines.length > 0 && lines[0].trim() === "") {
		lines.shift();
	}
	while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
		lines.pop();
	}

	if (lines.length === 0) return "";

	// Find minimum indentation
	const nonEmptyLines = lines.filter((line) => line.trim().length > 0);
	if (nonEmptyLines.length === 0) return code;

	const minIndent = Math.min(
		...nonEmptyLines.map((line) => {
			const match = line.match(/^\s*/);
			return match ? match[0].length : 0;
		})
	);

	// Remove minimum indentation from all lines
	return lines.map((line) => line.slice(minIndent)).join("\n");
}

// Dynamically import all components
const componentModules = import.meta.glob("../../../../components/*.tsx", {
	eager: true,
}) as Record<string, Record<string, unknown>>;

interface ComponentProp {
	name: string;
	type: string;
	description?: string;
	defaultValue?: string;
	required?: boolean;
}

interface ComponentVariant {
	name: string;
	values?: string[];
	defaultValue?: string;
}

interface ComponentExample {
	title: string;
	description?: string;
	code?: () => JSX.Element;
	source?: string;
}

interface ComponentDependencies {
	components?: string[];
}

interface ComponentMeta {
	name: string;
	description?: string;
	apiReference?: string;
	props?: ComponentProp[];
	variants?: ComponentVariant[];
	examples?: ComponentExample[];
	dependencies?: ComponentDependencies;
}

interface ComponentInfo {
	name: string;
	meta: ComponentMeta;
	Component: (props: Record<string, unknown>) => unknown;
}

// Build component registry from generated metadata and imports
const components: ComponentInfo[] = Object.entries(componentMetadata)
	.map(([fileName, metadata]) => {
		// Find the matching component module
		const modulePath = `../../../../components/${fileName}.tsx`;
		const module = componentModules[modulePath];

		if (!module) {
			console.warn(`Could not find module for ${fileName}`);
			return null;
		}

		// Get the component export (usually PascalCase)
		const componentName = metadata.name;
		const Component = module[componentName] || module.default;

		if (!Component) {
			console.warn(`Could not find component export for ${componentName}`);
			return null;
		}

		// Merge runtime meta with generated metadata
		const runtimeMeta = (module.meta || {}) as Record<string, unknown>;

		// Skip hidden components
		if ((runtimeMeta as { hidden?: boolean }).hidden) {
			return null;
		}

		const runtimeExamples = (runtimeMeta.examples as ComponentExample[] | undefined) ?? [];

		// Merge runtime examples (code functions) with generated sources
		const mergedExamples = (
			((metadata as Record<string, unknown>).examples as Record<string, unknown>[] | undefined) ??
			[]
		).map((generatedExample: Record<string, unknown>, index: number) => {
			const runtimeExample = runtimeExamples[index];
			return {
				...generatedExample,
				code: runtimeExample?.code,
				source: generatedExample?.source
					? dedent(generatedExample.source as string)
					: runtimeExample?.source,
			};
		});

		// Generate default API reference link based on component name
		const defaultApiReference = `https://ark-ui.com/docs/components/${fileName}#api-reference`;
		const apiReference =
			"apiReference" in runtimeMeta ? (runtimeMeta.apiReference as string) : defaultApiReference;

		return {
			name: fileName,
			meta: {
				name: (metadata as Record<string, unknown>).name as string,
				description:
					((metadata as Record<string, unknown>).description as string | undefined) ||
					(runtimeMeta.description as string | undefined),
				apiReference: apiReference,
				props: (metadata as Record<string, unknown>).props as ComponentProp[] | undefined,
				variants: (metadata as Record<string, unknown>).variants as ComponentVariant[] | undefined,
				examples: mergedExamples as ComponentExample[],
				dependencies: (metadata as Record<string, unknown>).dependencies as
					| ComponentDependencies
					| undefined,
			},
			Component: Component as (props: Record<string, unknown>) => unknown,
		};
	})
	.filter(Boolean) as unknown as ComponentInfo[];

// Wrapper component to render examples with proper disposal
function ExampleRenderer(props: { code: () => JSX.Element }) {
	let disposeRef: (() => void) | undefined;

	onCleanup(() => {
		if (disposeRef) {
			disposeRef();
		}
	});

	return <>{props.code()}</>;
}

export default function ComponentPage() {
	const params = useParams();
	const [showCode, setShowCode] = createSignal<Record<number, boolean>>({});
	const [selectedTab, setSelectedTab] = createSignal("0");
	const [copied, setCopied] = createSignal(false);

	const currentComponent = () => {
		return components.find((c) => c.name === params.component);
	};

	const componentName = () => currentComponent()?.meta.name || "Component";
	const componentDescription = () =>
		currentComponent()?.meta.description || `${componentName()} component for SolidJS`;

	const toggleCode = (index: number) => {
		setShowCode((prev) => ({ ...prev, [index]: !prev[index] }));
	};

	// Force tab selection after mount to trigger indicator positioning
	onMount(() => {
		setTimeout(() => {
			setSelectedTab("0");
		}, 0);
	});

	// Reset tab when component changes
	createEffect(() => {
		params.component;
		setSelectedTab("0");
		setShowCode({});
		setTimeout(() => {
			setSelectedTab("0");
		}, 0);
	});

	return (
		<DocsLayout>
			<Title>{componentName()} - Method UI Components</Title>
			<Meta name="description" content={componentDescription()} />

			<Show
				when={currentComponent()}
				fallback={
					<Card>
						<CardContent class="py-12 text-center">
							<IconBox class="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
							<h2 class="text-xl font-semibold mb-2">Component Not Found</h2>
							<p class="text-muted-foreground">
								The component "{params.component}" does not exist.
							</p>
						</CardContent>
					</Card>
				}
			>
				{(componentInfo) => (
					<div class="space-y-6">
						{/* Component Header */}
						<div>
							<div class="flex items-start justify-between mb-4">
								<div class="flex-1">
									<h1 class="text-4xl font-bold text-foreground mb-2">
										{componentInfo().meta.name}
									</h1>
									<p class="text-lg text-muted-foreground">{componentInfo().meta.description}</p>
									<Show
										when={
											componentInfo().meta.apiReference && componentInfo().meta.apiReference !== ""
										}
									>
										<a
											href={componentInfo().meta.apiReference}
											target="_blank"
											rel="noopener noreferrer"
											class="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-2"
										>
											API Reference
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="12"
												height="12"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
												aria-label="External link"
												role="img"
											>
												<title>External link</title>
												<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
												<polyline points="15 3 21 3 21 9" />
												<line x1="10" y1="14" x2="21" y2="3" />
											</svg>
										</a>
									</Show>
								</div>
								<div class="flex gap-2 flex-wrap justify-end">
									<Show when={(componentInfo().meta.variants?.length ?? 0) > 0}>
										<Badge variant="secondary">
											{componentInfo().meta.variants?.length} Variant
											{componentInfo().meta.variants?.length !== 1 ? "s" : ""}
										</Badge>
									</Show>
									<Show when={(componentInfo().meta.examples?.length ?? 0) > 0}>
										<Badge variant="secondary">
											{componentInfo().meta.examples?.length} Example
											{componentInfo().meta.examples?.length !== 1 ? "s" : ""}
										</Badge>
									</Show>
								</div>
							</div>

							{/* Install Command */}
							<Card class="mb-6">
								<CardContent class="pt-6">
									<p class="text-sm text-muted-foreground mb-2">Install this component</p>
									<div class="flex items-center justify-between gap-2 bg-muted px-3 py-2 rounded">
										<code class="text-sm font-mono flex-1">
											bunx method@latest add {componentInfo().name}
										</code>
										<Tooltip>
											<TooltipTrigger>
												<Button
													variant="ghost"
													size="sm"
													class="h-auto p-2 hover:bg-foreground/10"
													onClick={() => {
														navigator.clipboard.writeText(
															`bunx method@latest add ${componentInfo().name}`
														);
														setCopied(true);
														setTimeout(() => setCopied(false), 1000);
													}}
												>
													<Show when={copied()} fallback={<IconCopy class="h-4 w-4" />}>
														<IconCheck class="h-4 w-4" />
													</Show>
												</Button>
											</TooltipTrigger>
											<TooltipContent>Copy install command</TooltipContent>
										</Tooltip>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Examples Section */}
						<Show when={(componentInfo().meta.examples?.length ?? 0) > 0}>
							<div>
								<h2 class="text-2xl font-semibold mb-4">Examples</h2>
								<Tabs value={selectedTab()} onValueChange={(e) => setSelectedTab(e.value)}>
									<TabsList>
										<Index each={componentInfo().meta.examples ?? []}>
											{(example, index) => (
												<TabsTrigger value={index.toString()}>{example().title}</TabsTrigger>
											)}
										</Index>
										<TabsIndicator />
									</TabsList>

									<Index each={componentInfo().meta.examples ?? []}>
										{(example, index) => (
											<TabsContent value={index.toString()}>
												<Card>
													<CardHeader>
														<div class="flex items-center justify-between">
															<div>
																<CardTitle>{example().title}</CardTitle>
																<Show when={example().description}>
																	<CardDescription class="mt-2">
																		{example().description}
																	</CardDescription>
																</Show>
															</div>
															<Button size="sm" variant="outline" onClick={() => toggleCode(index)}>
																<IconCode class="h-4 w-4 mr-2" />
																{showCode()[index] ? "Hide" : "Show"} Code
															</Button>
														</div>
													</CardHeader>
													<CardContent>
														{/* Example Preview */}
														<div class="border border-border rounded-lg p-8 bg-background flex items-center justify-center min-h-32 mb-4">
															{typeof example().code === "function" ? (
																<ExampleRenderer code={example().code as () => JSX.Element} />
															) : null}
														</div>

														{/* Code Display */}
														<Show when={showCode()[index]}>
															<div class="border border-border rounded-lg bg-muted/50 overflow-hidden">
																<div class="flex items-center justify-between px-4 py-2 border-b border-border bg-muted">
																	<span class="text-xs font-medium text-muted-foreground">
																		TypeScript
																	</span>
																	<Tooltip>
																		<TooltipTrigger>
																			<Button
																				size="sm"
																				variant="ghost"
																				onClick={() => {
																					navigator.clipboard.writeText(
																						example().source ||
																							(typeof example().code === "function"
																								? (example().code as () => JSX.Element).toString()
																								: "")
																					);
																				}}
																			>
																				<IconCopy class="h-3 w-3" />
																			</Button>
																		</TooltipTrigger>
																		<TooltipContent>Copy code</TooltipContent>
																	</Tooltip>
																</div>
																<pre class="p-4 text-sm overflow-x-auto">
																	<code class="language-tsx text-foreground">
																		{example().source ||
																			(typeof example().code === "function"
																				? (example().code as () => JSX.Element).toString()
																				: "")}
																	</code>
																</pre>
															</div>
														</Show>
													</CardContent>
												</Card>
											</TabsContent>
										)}
									</Index>
								</Tabs>
							</div>
						</Show>

						{/* Component Details */}
						<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{/* Component Dependencies */}
							<Show when={(componentInfo().meta.dependencies?.components?.length ?? 0) > 0}>
								<Card>
									<CardHeader>
										<CardTitle class="text-lg">Dependencies</CardTitle>
										<CardDescription>These components are automatically installed</CardDescription>
									</CardHeader>
									<CardContent>
										<div class="flex flex-wrap gap-2">
											<For each={componentInfo().meta.dependencies?.components ?? []}>
												{(dep) => (
													<Badge variant="secondary" class="font-mono">
														{dep}
													</Badge>
												)}
											</For>
										</div>
									</CardContent>
								</Card>
							</Show>

							{/* Variants Info */}
							<Show
								when={
									componentInfo().meta.variants && (componentInfo().meta.variants?.length ?? 0) > 0
								}
							>
								<Card>
									<CardHeader>
										<CardTitle class="text-lg">Variants</CardTitle>
										<CardDescription>Available style variants for this component</CardDescription>
									</CardHeader>
									<CardContent>
										<div class="space-y-3">
											<For each={componentInfo().meta.variants ?? []}>
												{(variant) => (
													<div class="space-y-1">
														<div class="flex items-center gap-2">
															<span class="font-mono text-sm font-medium">{variant.name}</span>
															<Show when={variant.defaultValue}>
																<Badge variant="secondary" class="text-xs">
																	default: {variant.defaultValue}
																</Badge>
															</Show>
														</div>
														<div class="flex flex-wrap gap-1.5">
															<For each={variant.values}>
																{(value) => (
																	<Badge variant="outline" class="text-xs font-mono font-normal">
																		{value}
																	</Badge>
																)}
															</For>
														</div>
													</div>
												)}
											</For>
										</div>
									</CardContent>
								</Card>
							</Show>
						</div>

						{/* Props Table */}
						<Show
							when={componentInfo().meta.props && (componentInfo().meta.props?.length ?? 0) > 0}
						>
							<Accordion collapsible defaultValue={["props"]}>
								<AccordionItem value="props">
									<Card>
										<CardHeader class="pb-3">
											<AccordionTrigger class="hover:no-underline">
												<div class="flex items-center justify-between w-full pr-4">
													<div>
														<CardTitle class="text-lg">Props</CardTitle>
														<CardDescription class="mt-1">
															Component API reference and prop types
														</CardDescription>
													</div>
													<Badge variant="secondary" class="ml-4">
														{componentInfo().meta.props?.length}
													</Badge>
												</div>
											</AccordionTrigger>
										</CardHeader>
										<AccordionContent>
											<CardContent class="pt-0">
												<div class="overflow-x-auto">
													<table class="w-full text-sm">
														<thead>
															<tr class="border-b border-border">
																<th class="text-left py-3 px-4 font-semibold text-foreground">
																	Prop
																</th>
																<th class="text-left py-3 px-4 font-semibold text-foreground">
																	Type
																</th>
																<th class="text-left py-3 px-4 font-semibold text-foreground">
																	Default
																</th>
																<th class="text-left py-3 px-4 font-semibold text-foreground">
																	Description
																</th>
															</tr>
														</thead>
														<tbody>
															<For each={componentInfo().meta.props ?? []}>
																{(prop) => (
																	<tr class="border-b border-border/50 hover:bg-muted/50 transition-colors">
																		<td class="py-3 px-4">
																			<code class="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
																				{prop.name}
																			</code>
																			<Show when={prop.required}>
																				<Badge variant="destructive" class="ml-2 text-xs">
																					required
																				</Badge>
																			</Show>
																		</td>
																		<td class="py-3 px-4">
																			<code class="text-xs font-mono text-muted-foreground">
																				{prop.type}
																			</code>
																		</td>
																		<td class="py-3 px-4">
																			<Show
																				when={prop.defaultValue}
																				fallback={<span class="text-muted-foreground">-</span>}
																			>
																				<code class="text-xs font-mono text-muted-foreground">
																					{prop.defaultValue}
																				</code>
																			</Show>
																		</td>
																		<td class="py-3 px-4 text-muted-foreground">
																			{prop.description || "-"}
																		</td>
																	</tr>
																)}
															</For>
														</tbody>
													</table>
												</div>
											</CardContent>
										</AccordionContent>
									</Card>
								</AccordionItem>
							</Accordion>
						</Show>
					</div>
				)}
			</Show>
		</DocsLayout>
	);
}

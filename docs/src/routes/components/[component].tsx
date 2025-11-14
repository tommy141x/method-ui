import {
  For,
  Index,
  createSignal,
  Show,
  createEffect,
  onMount,
  onCleanup,
  type JSX,
} from "solid-js";
import { useParams } from "@solidjs/router";
import { Title, Meta } from "@solidjs/meta";
import metadataJson from "@lib/registry.json";
import { Navbar } from "../../components/navbar";
import { DocsSidebar } from "../../components/docs-sidebar";
import { Button } from "../../components/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/card";
import { Badge } from "../../components/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsIndicator,
} from "../../components/tabs";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../../components/tooltip";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../../components/accordion";
import { cn } from "@lib/cn";

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
    }),
  );

  // Remove minimum indentation from all lines
  return lines.map((line) => line.slice(minIndent)).join("\n");
}

// Dynamically import all components
const componentModules = import.meta.glob("../../../../components/*.tsx", {
  eager: true,
}) as Record<string, any>;

interface ComponentInfo {
  name: string;
  meta: any;
  Component: any;
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
    const runtimeMeta = module.meta || {};

    // Skip hidden components
    if (runtimeMeta.hidden) {
      return null;
    }

    // Merge runtime examples (code functions) with generated sources
    const mergedExamples = (metadata.examples || []).map(
      (generatedExample: any, index: number) => {
        const runtimeExample = runtimeMeta.examples?.[index];
        return {
          ...generatedExample,
          code: runtimeExample?.code,
          source: generatedExample?.source
            ? dedent(generatedExample.source)
            : runtimeExample?.source,
        };
      },
    );

    // Generate default API reference link based on component name
    const defaultApiReference = `https://ark-ui.com/docs/components/${fileName}#api-reference`;
    const apiReference = runtimeMeta.hasOwnProperty("apiReference")
      ? runtimeMeta.apiReference
      : defaultApiReference;

    return {
      name: fileName,
      meta: {
        name: metadata.name,
        description: metadata.description || runtimeMeta.description,
        apiReference: apiReference,
        props: metadata.props,
        variants: metadata.variants,
        examples: mergedExamples,
        dependencies: metadata.dependencies,
      },
      Component,
    };
  })
  .filter(Boolean) as ComponentInfo[];

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
    currentComponent()?.meta.description ||
    `${componentName()} component for SolidJS`;

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
    <div class="min-h-screen bg-background">
      <Title>{componentName()} - Method UI Components</Title>
      <Meta name="description" content={componentDescription()} />

      <Navbar />

      <div class="container mx-auto px-4 py-6">
        <div class="flex gap-6">
          <DocsSidebar />

          {/* Main Content */}
          <main class="flex-1 min-w-0">
            <Show
              when={currentComponent()}
              fallback={
                <Card>
                  <CardContent class="py-12 text-center">
                    <div
                      class={cn(
                        "h-12 w-12 mx-auto mb-4 text-muted-foreground",
                        "i-lucide-box",
                      )}
                    />
                    <h2 class="text-xl font-semibold mb-2">
                      Component Not Found
                    </h2>
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
                        <p class="text-lg text-muted-foreground">
                          {componentInfo().meta.description}
                        </p>
                        <Show
                          when={
                            componentInfo().meta.apiReference &&
                            componentInfo().meta.apiReference !== ""
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
                            >
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          </a>
                        </Show>
                      </div>
                      <div class="flex gap-2 flex-wrap justify-end">
                        <Show
                          when={
                            componentInfo().meta.variants &&
                            componentInfo().meta.variants.length > 0
                          }
                        >
                          <Badge variant="secondary">
                            {componentInfo().meta.variants.length} Variant
                            {componentInfo().meta.variants.length !== 1
                              ? "s"
                              : ""}
                          </Badge>
                        </Show>
                        <Show when={componentInfo().meta.examples.length > 0}>
                          <Badge variant="secondary">
                            {componentInfo().meta.examples.length} Example
                            {componentInfo().meta.examples.length !== 1
                              ? "s"
                              : ""}
                          </Badge>
                        </Show>
                      </div>
                    </div>

                    {/* Install Command */}
                    <Card class="mb-6">
                      <CardContent class="pt-6">
                        <p class="text-sm text-muted-foreground mb-2">
                          Install this component
                        </p>
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
                                    `bunx method@latest add ${componentInfo().name}`,
                                  );
                                  setCopied(true);
                                  setTimeout(() => setCopied(false), 1000);
                                }}
                              >
                                <div
                                  class={cn(
                                    "h-4 w-4",
                                    copied()
                                      ? "i-lucide-check"
                                      : "i-lucide-copy",
                                  )}
                                />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              Copy install command
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Examples Section */}
                  <Show when={componentInfo().meta.examples.length > 0}>
                    <div>
                      <h2 class="text-2xl font-semibold mb-4">Examples</h2>
                      <Tabs
                        value={selectedTab()}
                        onValueChange={(e) => setSelectedTab(e.value)}
                      >
                        <TabsList class="mb-4">
                          <Index each={componentInfo().meta.examples}>
                            {(example, index) => (
                              <TabsTrigger value={index.toString()}>
                                {example().title}
                              </TabsTrigger>
                            )}
                          </Index>
                          <TabsIndicator />
                        </TabsList>

                        <Index each={componentInfo().meta.examples}>
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
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => toggleCode(index)}
                                    >
                                      <div
                                        class={cn(
                                          "h-4 w-4 mr-2",
                                          "i-lucide-code",
                                        )}
                                      />
                                      {showCode()[index] ? "Hide" : "Show"} Code
                                    </Button>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  {/* Example Preview */}
                                  <div class="border border-border rounded-lg p-8 bg-background flex items-center justify-center min-h-32 mb-4">
                                    {typeof example().code === "function" ? (
                                      <ExampleRenderer code={example().code} />
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
                                                    (typeof example().code ===
                                                    "function"
                                                      ? example().code.toString()
                                                      : ""),
                                                );
                                              }}
                                            >
                                              <div
                                                class={cn(
                                                  "h-3 w-3",
                                                  "i-lucide-copy",
                                                )}
                                              />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            Copy code
                                          </TooltipContent>
                                        </Tooltip>
                                      </div>
                                      <pre class="p-4 text-sm overflow-x-auto">
                                        <code class="language-tsx text-foreground">
                                          {example().source ||
                                            (typeof example().code ===
                                            "function"
                                              ? example().code.toString()
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
                    <Show
                      when={
                        componentInfo().meta.dependencies?.components?.length >
                        0
                      }
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle class="text-lg">Dependencies</CardTitle>
                          <CardDescription>
                            These components are automatically installed
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div class="flex flex-wrap gap-2">
                            <For
                              each={
                                componentInfo().meta.dependencies.components
                              }
                            >
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
                        componentInfo().meta.variants &&
                        componentInfo().meta.variants.length > 0
                      }
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle class="text-lg">Variants</CardTitle>
                          <CardDescription>
                            Available style variants for this component
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div class="space-y-3">
                            <For each={componentInfo().meta.variants}>
                              {(variant) => (
                                <div class="space-y-1">
                                  <div class="flex items-center gap-2">
                                    <span class="font-mono text-sm font-medium">
                                      {variant.name}
                                    </span>
                                    <Show when={variant.defaultValue}>
                                      <Badge
                                        variant="secondary"
                                        class="text-xs"
                                      >
                                        default: {variant.defaultValue}
                                      </Badge>
                                    </Show>
                                  </div>
                                  <div class="flex flex-wrap gap-1.5">
                                    <For each={variant.values}>
                                      {(value) => (
                                        <Badge
                                          variant="outline"
                                          class="text-xs font-mono font-normal"
                                        >
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
                    when={
                      componentInfo().meta.props &&
                      componentInfo().meta.props.length > 0
                    }
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
                                  {componentInfo().meta.props.length}
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
                                    <For each={componentInfo().meta.props}>
                                      {(prop) => (
                                        <tr class="border-b border-border/50 hover:bg-muted/50 transition-colors">
                                          <td class="py-3 px-4">
                                            <code class="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                                              {prop.name}
                                            </code>
                                            <Show when={prop.required}>
                                              <Badge
                                                variant="destructive"
                                                class="ml-2 text-xs"
                                              >
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
                                              fallback={
                                                <span class="text-muted-foreground">
                                                  -
                                                </span>
                                              }
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
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer class="border-t border-border mt-12">
        <div class="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>
            Built with <span class="text-red-500">♥</span> using SolidJS, Ark
            UI, and UnoCSS
          </p>
        </div>
      </footer>
    </div>
  );
}

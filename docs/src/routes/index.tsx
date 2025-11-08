import {
  Component,
  For,
  Index,
  createSignal,
  Show,
  createEffect,
  onMount,
} from "solid-js";
import { useSearchParams } from "@solidjs/router";
import metadataJson from "@lib/registry.json";
import { ThemeToggle } from "../components/theme-toggle";
import { Button } from "../components/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/card";
import { Badge } from "../components/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsIndicator,
} from "../components/tabs";
import { Input } from "../components/input";
import { cn } from "@lib/cn";
import { icon } from "@lib/icon";

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
const componentModules = import.meta.glob("../../../components/*.tsx", {
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
    const modulePath = `../../../components/${fileName}.tsx`;
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

    return {
      name: fileName,
      meta: {
        name: metadata.name,
        description: metadata.description || runtimeMeta.description,
        props: metadata.props,
        variants: metadata.variants,
        examples: mergedExamples,
        dependencies: metadata.dependencies,
      },
      Component,
    };
  })
  .filter(Boolean) as ComponentInfo[];

const ComponentShowcase: Component<{ componentInfo: ComponentInfo }> = (
  props,
) => {
  const [showCode, setShowCode] = createSignal<Record<number, boolean>>({});
  const [selectedTab, setSelectedTab] = createSignal("0");

  const meta = () => props.componentInfo.meta;

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
    props.componentInfo.name; // track changes
    setSelectedTab("0");
    setTimeout(() => {
      setSelectedTab("0");
    }, 0);
  });

  return (
    <div class="space-y-6">
      {/* Component Header */}
      <div>
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h1 class="text-4xl font-bold text-foreground mb-2">
              {meta().name}
            </h1>
            <p class="text-lg text-muted-foreground">{meta().description}</p>
          </div>
          <div class="flex gap-2 flex-wrap justify-end">
            <Show when={meta().variants && meta().variants.length > 0}>
              <Badge variant="secondary">
                {meta().variants.length} Variant
                {meta().variants.length !== 1 ? "s" : ""}
              </Badge>
            </Show>
            <Show when={meta().examples.length > 0}>
              <Badge variant="secondary">
                {meta().examples.length} Example
                {meta().examples.length !== 1 ? "s" : ""}
              </Badge>
            </Show>
          </div>
        </div>

        {/* Install Command */}
        <Card class="mb-6">
          <CardContent class="pt-6">
            <div class="flex items-center justify-between gap-4">
              <div class="flex-1">
                <p class="text-sm text-muted-foreground mb-2">
                  Install this component
                </p>
                <code class="text-sm bg-muted px-3 py-2 rounded font-mono block">
                  bunx method@latest add {props.componentInfo.name}
                </code>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `bunx method@latest add ${props.componentInfo.name}`,
                  );
                }}
              >
                <div class={cn("h-4 w-4", icon("copy"))} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Examples Section */}
      <Show when={meta().examples.length > 0}>
        <div>
          <h2 class="text-2xl font-semibold mb-4">Examples</h2>
          <Tabs
            value={selectedTab()}
            onValueChange={(e) => setSelectedTab(e.value)}
          >
            <TabsList class="mb-4">
              <Index each={meta().examples}>
                {(example, index) => (
                  <TabsTrigger value={index.toString()}>
                    {example().title}
                  </TabsTrigger>
                )}
              </Index>
              <TabsIndicator />
            </TabsList>

            <Index each={meta().examples}>
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
                          <div class={cn("h-4 w-4 mr-2", icon("code"))} />
                          {showCode()[index] ? "Hide" : "Show"} Code
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Example Preview */}
                      <div class="border border-border rounded-lg p-8 bg-background flex items-center justify-center min-h-32 mb-4">
                        {example().code()}
                      </div>

                      {/* Code Display */}
                      <Show when={showCode()[index]}>
                        <div class="border border-border rounded-lg bg-muted/50 overflow-hidden">
                          <div class="flex items-center justify-between px-4 py-2 border-b border-border bg-muted">
                            <span class="text-xs font-medium text-muted-foreground">
                              TypeScript
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  example().source || example().code.toString(),
                                );
                              }}
                            >
                              <div class={cn("h-3 w-3", icon("copy"))} />
                            </Button>
                          </div>
                          <pre class="p-4 text-sm overflow-x-auto">
                            <code class="language-tsx text-foreground">
                              {example().source || example().code.toString()}
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
        <Show when={meta().dependencies?.components?.length > 0}>
          <Card>
            <CardHeader>
              <CardTitle class="text-lg">Dependencies</CardTitle>
              <CardDescription>
                These components are automatically installed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div class="flex flex-wrap gap-2">
                <For each={meta().dependencies.components}>
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
        <Show when={meta().variants && meta().variants.length > 0}>
          <Card>
            <CardHeader>
              <CardTitle class="text-lg">Variants</CardTitle>
              <CardDescription>
                Available style variants for this component
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div class="space-y-3">
                <For each={meta().variants}>
                  {(variant) => (
                    <div class="space-y-1">
                      <div class="flex items-center gap-2">
                        <span class="font-mono text-sm font-medium">
                          {variant.name}
                        </span>
                        <Show when={variant.defaultValue}>
                          <Badge variant="secondary" class="text-xs">
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
      <Show when={meta().props && meta().props.length > 0}>
        <Card>
          <CardHeader>
            <CardTitle class="text-lg">Props</CardTitle>
            <CardDescription>
              Component API reference and prop types
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                  <For each={meta().props}>
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
                            fallback={
                              <span class="text-muted-foreground">-</span>
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
        </Card>
      </Show>
    </div>
  );
};

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedComponent, setSelectedComponent] = createSignal<string | null>(
    searchParams.component ||
      (components.length > 0 ? components[0].name : null),
  );
  const [searchQuery, setSearchQuery] = createSignal("");
  const [sidebarOpen, setSidebarOpen] = createSignal(true);

  // Sync URL with selected component
  createEffect(() => {
    const component = selectedComponent();
    if (component) {
      setSearchParams({ component });
    }
  });

  // Sync selected component with URL on mount and changes
  createEffect(() => {
    const urlComponent = searchParams.component;
    if (urlComponent && components.some((c) => c.name === urlComponent)) {
      setSelectedComponent(urlComponent);
    }
  });

  const filteredComponents = () => {
    const query = searchQuery().toLowerCase();
    if (!query) return components;
    return components.filter(
      (c) =>
        c.meta.name.toLowerCase().includes(query) ||
        c.meta.description?.toLowerCase().includes(query),
    );
  };

  const currentComponent = () => {
    return components.find((c) => c.name === selectedComponent());
  };

  return (
    <div class="min-h-screen bg-background">
      {/* Top Navigation */}
      <header class="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div class="container mx-auto px-4 h-16 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              class="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen())}
            >
              <div class={cn("h-5 w-5", icon(sidebarOpen() ? "x" : "menu"))} />
            </Button>
            <div>
              <h1 class="text-xl font-bold">Method UI</h1>
              <p class="text-xs text-muted-foreground hidden sm:block">
                Component library for SolidJS
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Badge variant="secondary" class="hidden sm:inline-flex">
              {components.length} Components
            </Badge>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div class="container mx-auto px-4 py-6">
        <div class="flex gap-6">
          {/* Sidebar */}
          <aside
            class={cn(
              "w-64 shrink-0 space-y-4 transition-all duration-300",
              sidebarOpen() ? "block" : "hidden lg:block",
            )}
          >
            {/* Search */}
            <div class="sticky top-20">
              <Input
                type="search"
                placeholder="Search components..."
                value={searchQuery()}
                onInput={(e) => setSearchQuery(e.currentTarget.value)}
                class="mb-4"
              />

              {/* Component List */}
              <Card>
                <CardHeader class="pb-3">
                  <CardTitle class="text-sm font-medium">Components</CardTitle>
                </CardHeader>
                <CardContent class="space-y-1 max-h-[calc(100vh-16rem)] overflow-y-auto">
                  <For each={filteredComponents()}>
                    {(component) => (
                      <Button
                        variant={
                          selectedComponent() === component.name
                            ? "secondary"
                            : "ghost"
                        }
                        class="w-full justify-start"
                        onClick={() => {
                          setSelectedComponent(component.name);
                          if (window.innerWidth < 1024) {
                            setSidebarOpen(false);
                          }
                        }}
                      >
                        <div class="flex items-center gap-2 w-full">
                          <span class="text-sm">{component.meta.name}</span>
                          <Show when={component.meta.examples.length > 0}>
                            <Badge
                              variant="outline"
                              class="ml-auto text-xs font-normal"
                            >
                              {component.meta.examples.length}
                            </Badge>
                          </Show>
                        </div>
                      </Button>
                    )}
                  </For>
                  <Show when={filteredComponents().length === 0}>
                    <div class="text-center py-8 text-muted-foreground text-sm">
                      No components found
                    </div>
                  </Show>
                </CardContent>
              </Card>

              {/* Info Card */}
              <Card class="mt-4">
                <CardContent class="pt-6 space-y-3">
                  <div class="flex items-start gap-2">
                    <div
                      class={cn(
                        "h-4 w-4 mt-0.5 text-green-500",
                        icon("check-circle"),
                      )}
                    />
                    <div>
                      <p class="text-xs font-medium">SSR Ready</p>
                      <p class="text-xs text-muted-foreground">
                        Full server-side rendering support
                      </p>
                    </div>
                  </div>
                  <div class="flex items-start gap-2">
                    <div
                      class={cn("h-4 w-4 mt-0.5 text-blue-500", icon("zap"))}
                    />
                    <div>
                      <p class="text-xs font-medium">Built with Ark UI</p>
                      <p class="text-xs text-muted-foreground">
                        Accessible & customizable primitives
                      </p>
                    </div>
                  </div>
                  <div class="flex items-start gap-2">
                    <div
                      class={cn(
                        "h-4 w-4 mt-0.5 text-purple-500",
                        icon("sparkles"),
                      )}
                    />
                    <div>
                      <p class="text-xs font-medium">UnoCSS Powered</p>
                      <p class="text-xs text-muted-foreground">
                        Instant on-demand atomic CSS
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>

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
                        icon("box"),
                      )}
                    />
                    <h2 class="text-xl font-semibold mb-2">
                      No Component Selected
                    </h2>
                    <p class="text-muted-foreground">
                      Select a component from the sidebar to view its
                      documentation
                    </p>
                  </CardContent>
                </Card>
              }
            >
              <ComponentShowcase componentInfo={currentComponent()!} />
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
          <p class="mt-2">
            Components auto-discovered from{" "}
            <code class="px-1.5 py-0.5 bg-muted rounded text-xs">
              ../components
            </code>
          </p>
        </div>
      </footer>
    </div>
  );
}

import { Component, For, createSignal, Show } from "solid-js";
import metadataJson from "@lib/registry.json";
import { ThemeToggle } from "../components/theme-toggle";

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
    const mergedExamples = (runtimeMeta.examples || []).map(
      (example: any, index: number) => {
        const generatedExample = metadata.examples[index];
        return {
          ...example,
          source: generatedExample?.source
            ? dedent(generatedExample.source)
            : example.source,
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
      },
      Component,
    };
  })
  .filter(Boolean) as ComponentInfo[];

const ComponentShowcase: Component<{ componentInfo: ComponentInfo }> = (
  props,
) => {
  const [selectedExample, setSelectedExample] = createSignal(0);
  const [showCode, setShowCode] = createSignal(false);

  const meta = () => props.componentInfo.meta;
  const currentExample = () => {
    const examples = meta().examples;
    if (!examples || examples.length === 0) return null;
    return examples[selectedExample()];
  };

  return (
    <div class="border border-border rounded-lg p-6 mb-8 bg-background">
      {/* Component Header */}
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-2xl font-semibold text-foreground">{meta().name}</h2>
          <p class="text-muted-foreground">{meta().description}</p>
        </div>
        <div class="flex gap-2">
          <Show when={meta().variants && meta().variants.length > 0}>
            <span class="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded text-xs">
              {meta().variants.length} Variant
              {meta().variants.length !== 1 ? "s" : ""}
            </span>
          </Show>
        </div>
      </div>

      {/* Examples Navigation */}
      <Show when={meta().examples.length > 0}>
        <div class="mb-6">
          <div class="flex items-center gap-2 mb-4">
            <h3 class="font-medium text-foreground">Examples</h3>
            <div class="flex gap-1 flex-wrap">
              <For each={meta().examples}>
                {(example, index) => (
                  <button
                    onClick={() => setSelectedExample(index())}
                    class={`px-3 py-1 text-xs rounded transition-colors ${
                      selectedExample() === index()
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {example.title}
                  </button>
                )}
              </For>
            </div>
          </div>

          {/* Current Example */}
          <Show when={currentExample()}>
            <div class="border border-border rounded-lg overflow-hidden">
              {/* Example Header */}
              <div class="bg-muted/50 px-4 py-3 border-b border-border">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-sm font-medium text-foreground">
                      {currentExample().title}
                    </div>
                    <Show when={currentExample().description}>
                      <div class="text-xs text-muted-foreground mt-1">
                        {currentExample().description}
                      </div>
                    </Show>
                  </div>
                  <button
                    onClick={() => setShowCode(!showCode())}
                    class="text-xs px-3 py-1.5 rounded bg-background border border-border hover:bg-muted transition-colors"
                  >
                    {showCode() ? "Hide Code" : "Show Code"}
                  </button>
                </div>
              </div>

              {/* Example Preview */}
              <div class="p-8 bg-background flex items-center justify-center min-h-32">
                {currentExample().code()}
              </div>

              {/* Code Display */}
              <Show when={showCode()}>
                <div class="border-t border-border bg-gray-50 dark:bg-gray-900">
                  <pre class="p-4 text-sm overflow-x-auto">
                    <code class="language-tsx text-gray-800 dark:text-gray-200">
                      {currentExample().source ||
                        currentExample().code.toString()}
                    </code>
                  </pre>
                </div>
              </Show>
            </div>
          </Show>
        </div>
      </Show>

      {/* Component Info */}
      <Show
        when={
          (meta().variants && meta().variants.length > 0) ||
          (meta().props && meta().props.length > 0)
        }
      >
        <div class="grid grid-cols-1 gap-4 mt-6 pt-4 border-t border-border">
          {/* Variants Info */}
          <Show when={meta().variants && meta().variants.length > 0}>
            <div class="bg-muted/50 rounded-lg p-4">
              <h4 class="font-medium mb-3 text-foreground">Variants</h4>
              <div class="space-y-2">
                <For each={meta().variants}>
                  {(variant) => (
                    <div class="text-sm">
                      <span class="font-mono text-foreground">
                        {variant.name}
                      </span>
                      <span class="text-muted-foreground mx-2">→</span>
                      <span class="font-mono text-xs text-muted-foreground">
                        {variant.values.join(" | ")}
                      </span>
                      <Show when={variant.defaultValue}>
                        <span class="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                          default: {variant.defaultValue}
                        </span>
                      </Show>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </Show>

          {/* Props Info */}
          <Show when={meta().props && meta().props.length > 0}>
            <div class="bg-muted/50 rounded-lg p-4">
              <h4 class="font-medium mb-3 text-foreground">Props</h4>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-border">
                      <th class="text-left py-2 px-3 font-medium text-foreground">
                        Name
                      </th>
                      <th class="text-left py-2 px-3 font-medium text-foreground">
                        Type
                      </th>
                      <th class="text-left py-2 px-3 font-medium text-foreground">
                        Default
                      </th>
                      <th class="text-left py-2 px-3 font-medium text-foreground">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={meta().props}>
                      {(prop) => (
                        <tr class="border-b border-border/50">
                          <td class="py-2 px-3 font-mono text-xs text-foreground">
                            {prop.name}
                            <Show when={prop.required}>
                              <span class="text-red-500 ml-1">*</span>
                            </Show>
                          </td>
                          <td class="py-2 px-3 font-mono text-xs text-muted-foreground">
                            {prop.type}
                          </td>
                          <td class="py-2 px-3 font-mono text-xs text-muted-foreground">
                            {prop.defaultValue || "-"}
                          </td>
                          <td class="py-2 px-3 text-xs text-muted-foreground">
                            {prop.description || "-"}
                          </td>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </div>
            </div>
          </Show>
        </div>
      </Show>
    </div>
  );
};

export default function Home() {
  return (
    <div class="min-h-screen bg-background text-foreground">
      <ThemeToggle />
      <div class="container mx-auto px-4 py-8">
        {/* Header */}
        <div class="mb-12">
          <h1 class="text-4xl font-bold mb-3">Method UI</h1>
          <p class="text-lg text-muted-foreground mb-4">
            Component library for SolidJS with UnoCSS and Ark UI
          </p>
          <div class="flex gap-3">
            <span class="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-sm font-medium">
              ✓ SSR Ready
            </span>
            <span class="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-sm font-medium">
              {components.length} Components
            </span>
            <span class="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded text-sm font-medium">
              Auto-Generated Docs
            </span>
          </div>
        </div>

        {/* Component Showcases */}
        <For each={components}>
          {(componentInfo) => (
            <ComponentShowcase componentInfo={componentInfo} />
          )}
        </For>

        {/* Footer */}
        <div class="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>
            Components auto-discovered from{" "}
            <code class="px-1 py-0.5 bg-muted rounded">../components</code>
          </p>
          <p class="mt-2">
            Props and variants extracted at build time with{" "}
            <code class="px-1 py-0.5 bg-muted rounded">
              bun run generate:metadata
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}

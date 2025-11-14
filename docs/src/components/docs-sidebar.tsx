import { A, useLocation } from "@solidjs/router";
import { Button } from "./button";
import { Card, CardHeader, CardTitle, CardContent } from "./card";
import { Badge } from "./badge";
import { For } from "solid-js";
import { cn } from "@lib/cn";
import metadataJson from "@lib/registry.json";

const componentMetadata = metadataJson.componentMetadata;

// Dynamically import all components to check for hidden flag
const componentModules = import.meta.glob("../../../components/*.tsx", {
  eager: true,
}) as Record<string, any>;

// Build simplified component list, filtering out hidden components
const components = Object.entries(componentMetadata)
  .map(([fileName, metadata]) => {
    // Check if component is hidden in runtime meta
    const modulePath = `../../../components/${fileName}.tsx`;
    const module = componentModules[modulePath];
    const runtimeMeta = module?.meta || {};

    if (runtimeMeta.hidden) {
      return null;
    }

    return {
      name: fileName,
      displayName: metadata.name,
      description: metadata.description,
      exampleCount: metadata.examples?.length || 0,
    };
  })
  .filter((c): c is NonNullable<typeof c> => c !== null);

const docsSections = [
  { name: "Introduction", href: "/docs", iconClass: "i-lucide-book-open" },
  {
    name: "Installation",
    href: "/docs/installation",
    iconClass: "i-lucide-download",
  },
  {
    name: "Getting Started",
    href: "/docs/getting-started",
    iconClass: "i-lucide-rocket",
  },
  { name: "Theming", href: "/docs/theming", iconClass: "i-lucide-palette" },
];

export function DocsSidebar() {
  const location = useLocation();

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <aside class="w-64 shrink-0 space-y-4 hidden lg:block">
      <div class="sticky top-20">
        {/* Docs Section */}
        <Card class="mb-4">
          <CardHeader class="pb-3">
            <CardTitle class="text-sm font-medium">Documentation</CardTitle>
          </CardHeader>
          <CardContent class="space-y-1">
            <For each={docsSections}>
              {(section) => (
                <A href={section.href}>
                  <Button
                    variant={isActive(section.href) ? "secondary" : "ghost"}
                    class="w-full justify-start text-sm"
                  >
                    <div
                      class={cn("h-4 w-4 mr-2 shrink-0", section.iconClass)}
                    />
                    <span class="truncate">{section.name}</span>
                  </Button>
                </A>
              )}
            </For>
          </CardContent>
        </Card>

        {/* Component List */}
        <Card>
          <CardHeader class="pb-3">
            <CardTitle class="text-sm font-medium">
              Components
              <Badge variant="secondary" class="ml-2">
                {components.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-1 max-h-[calc(100vh-28rem)] overflow-y-auto">
            <For each={components}>
              {(component) => (
                <A href={`/components/${component.name}`}>
                  <Button
                    variant={
                      isActive(`/components/${component.name}`)
                        ? "secondary"
                        : "ghost"
                    }
                    class="w-full justify-start"
                  >
                    <div class="flex items-center gap-2 w-full min-w-0">
                      <span class="text-sm truncate">
                        {component.displayName}
                      </span>
                      {component.exampleCount > 0 && (
                        <Badge
                          variant="outline"
                          class="ml-auto text-xs font-normal shrink-0"
                        >
                          {component.exampleCount}
                        </Badge>
                      )}
                    </div>
                  </Button>
                </A>
              )}
            </For>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}

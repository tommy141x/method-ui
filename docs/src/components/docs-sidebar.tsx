import { A, useLocation } from "@solidjs/router";
import { Button } from "./button";
import { Card, CardHeader, CardTitle, CardContent } from "./card";
import { Badge } from "./badge";
import { For } from "solid-js";
import { cn } from "@lib/cn";
import metadataJson from "@lib/registry.json";

const componentMetadata = metadataJson.componentMetadata;

// Build simplified component list
const components = Object.entries(componentMetadata).map(
  ([fileName, metadata]) => ({
    name: fileName,
    displayName: metadata.name,
    description: metadata.description,
    exampleCount: metadata.examples?.length || 0,
  }),
);

const docsSections = [
  { name: "Introduction", href: "/docs", icon: "book-open" },
  { name: "Installation", href: "/docs/installation", icon: "download" },
  { name: "Getting Started", href: "/docs/getting-started", icon: "rocket" },
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
                      class={cn("h-4 w-4 mr-2", `i-lucide-${section.icon}`)}
                    />
                    {section.name}
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
                    <div class="flex items-center gap-2 w-full">
                      <span class="text-sm">{component.displayName}</span>
                      {component.exampleCount > 0 && (
                        <Badge
                          variant="outline"
                          class="ml-auto text-xs font-normal"
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

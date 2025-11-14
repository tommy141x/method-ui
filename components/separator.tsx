import type { JSX, Component } from "solid-js";
import { splitProps } from "solid-js";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { ComponentMeta } from "../lib/meta";

const separatorVariants = cva("shrink-0 bg-border", {
  variants: {
    orientation: {
      horizontal: "h-px w-full",
      vertical: "h-full w-px",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
  },
});

interface SeparatorProps extends VariantProps<typeof separatorVariants> {
  class?: string;
  decorative?: boolean;
}

export const Separator: Component<SeparatorProps> = (props) => {
  const [local, others] = splitProps(props, [
    "class",
    "orientation",
    "decorative",
  ]);

  return (
    <div
      role={local.decorative ? "none" : "separator"}
      aria-orientation={
        local.decorative ? undefined : local.orientation || "horizontal"
      }
      class={cn(
        separatorVariants({ orientation: local.orientation }),
        local.class,
      )}
      {...others}
    />
  );
};

export const meta: ComponentMeta<SeparatorProps> = {
  name: "Separator",
  description:
    "A separator component for visually dividing content. Can be horizontal or vertical.",
  variants: separatorVariants,
  examples: [
    {
      title: "Horizontal",
      description: "Default horizontal separator",
      code: () => (
        <div class="w-full">
          <div class="space-y-1">
            <h4 class="text-sm font-medium leading-none">Method UI</h4>
            <p class="text-sm text-muted-foreground">
              Beautiful components for SolidJS
            </p>
          </div>
          <Separator class="my-4" />
          <div class="flex h-5 items-center space-x-4 text-sm">
            <div>Blog</div>
            <Separator orientation="vertical" />
            <div>Docs</div>
            <Separator orientation="vertical" />
            <div>Source</div>
          </div>
        </div>
      ),
    },
    {
      title: "Vertical",
      description: "Vertical separator for inline content",
      code: () => (
        <div class="flex h-5 items-center space-x-4 text-sm">
          <div>Home</div>
          <Separator orientation="vertical" />
          <div>About</div>
          <Separator orientation="vertical" />
          <div>Contact</div>
        </div>
      ),
    },
    {
      title: "With Content",
      description: "Separators dividing sections of content",
      code: () => (
        <div class="space-y-4">
          <div>
            <h3 class="text-lg font-semibold">Section 1</h3>
            <p class="text-sm text-muted-foreground">
              This is the first section of content.
            </p>
          </div>
          <Separator />
          <div>
            <h3 class="text-lg font-semibold">Section 2</h3>
            <p class="text-sm text-muted-foreground">
              This is the second section of content.
            </p>
          </div>
          <Separator />
          <div>
            <h3 class="text-lg font-semibold">Section 3</h3>
            <p class="text-sm text-muted-foreground">
              This is the third section of content.
            </p>
          </div>
        </div>
      ),
    },
  ],
};

export default Separator;

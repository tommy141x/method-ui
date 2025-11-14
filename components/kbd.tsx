import type { JSX, Component } from "solid-js";
import { splitProps, mergeProps } from "solid-js";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { ComponentMeta } from "../lib/meta";

const kbdVariants = cva(
  "pointer-events-none inline-flex select-none items-center justify-center gap-1 rounded border border-border bg-muted font-mono font-medium opacity-100 text-muted-foreground",
  {
    variants: {
      size: {
        sm: "!text-[9px] min-h-4 min-w-4 px-1 py-0",
        default: "!text-[10px] min-h-5 min-w-5 px-1.5 py-0.5",
        lg: "!text-xs min-h-6 min-w-6 px-2 py-1",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

interface KbdProps extends VariantProps<typeof kbdVariants> {
  children?: JSX.Element;
  class?: string;
}

export const Kbd: Component<KbdProps> = (props) => {
  const [local, others] = splitProps(props, ["children", "class", "size"]);

  return (
    <kbd
      class={cn(kbdVariants({ size: local.size || "default" }), local.class)}
      {...others}
    >
      {local.children}
    </kbd>
  );
};

interface KbdGroupProps {
  children?: JSX.Element;
  class?: string;
}

export const KbdGroup: Component<KbdGroupProps> = (props) => {
  const [local, others] = splitProps(props, ["children", "class"]);

  return (
    <div class={cn("inline-flex items-center gap-1", local.class)} {...others}>
      {local.children}
    </div>
  );
};

export const meta: ComponentMeta<KbdProps> = {
  name: "Kbd",
  description:
    "A keyboard shortcut component for displaying key combinations. Use Kbd for individual keys or KbdGroup to combine multiple keys.",
  variants: kbdVariants,
  examples: [
    {
      title: "Sizes",
      description: "Different keyboard shortcut sizes",
      code: () => (
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted-foreground w-16">Small:</span>
            <Kbd size="sm">⌘</Kbd>
            <Kbd size="sm">K</Kbd>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted-foreground w-16">Default:</span>
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted-foreground w-16">Large:</span>
            <Kbd size="lg">⌘</Kbd>
            <Kbd size="lg">K</Kbd>
          </div>
        </div>
      ),
    },
    {
      title: "Single Keys",
      description: "Individual keyboard keys",
      code: () => (
        <div class="flex gap-2">
          <Kbd>⌘</Kbd>
          <Kbd>⇧</Kbd>
          <Kbd>⌥</Kbd>
          <Kbd>⌃</Kbd>
          <Kbd>Enter</Kbd>
          <Kbd>Esc</Kbd>
        </div>
      ),
    },
    {
      title: "Key Combinations",
      description: "Multiple keys combined with KbdGroup",
      code: () => (
        <div class="flex flex-col gap-2">
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <span class="text-muted-foreground">+</span>
            <Kbd>K</Kbd>
          </KbdGroup>
          <KbdGroup>
            <Kbd>Ctrl</Kbd>
            <span class="text-muted-foreground">+</span>
            <Kbd>Shift</Kbd>
            <span class="text-muted-foreground">+</span>
            <Kbd>P</Kbd>
          </KbdGroup>
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <span class="text-muted-foreground">+</span>
            <Kbd>B</Kbd>
          </KbdGroup>
        </div>
      ),
    },
    {
      title: "With Text",
      description: "Keyboard shortcuts in context",
      code: () => (
        <div class="flex flex-col gap-2">
          <div class="text-sm flex items-center gap-1">
            <span>Press</span>
            <KbdGroup>
              <Kbd>⌘</Kbd>
              <span class="text-muted-foreground">+</span>
              <Kbd>K</Kbd>
            </KbdGroup>
            <span>to open the command menu</span>
          </div>
          <div class="text-sm flex items-center gap-1">
            <span>Press</span>
            <Kbd>Esc</Kbd>
            <span>to close</span>
          </div>
          <div class="text-sm flex items-center gap-1">
            <span>Use</span>
            <KbdGroup>
              <Kbd>Ctrl</Kbd>
              <span class="text-muted-foreground">+</span>
              <Kbd>C</Kbd>
            </KbdGroup>
            <span>to copy</span>
          </div>
        </div>
      ),
    },
    {
      title: "Arrow Keys",
      description: "Navigation keys",
      code: () => (
        <div class="flex gap-2">
          <Kbd>↑</Kbd>
          <Kbd>→</Kbd>
          <Kbd>↓</Kbd>
          <Kbd>←</Kbd>
        </div>
      ),
    },
  ],
};

export default Kbd;

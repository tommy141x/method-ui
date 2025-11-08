import { Tabs as ArkTabs } from "@ark-ui/solid";
import type { JSX, Component } from "solid-js";
import { splitProps, createSignal, onMount } from "solid-js";
import { Motion } from "solid-motionone";
import { cva, type VariantProps } from "class-variance-authority";
// Variants for tab triggers

import type { ClassValue } from "clsx";
import clsx from "clsx";
import { unoMerge } from "unocss-merge";

// Hardcoded cn function - makes this component completely self-contained
function cn(...classLists: ClassValue[]) {
  return unoMerge(clsx(classLists));
}

const tabTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 text-sm font-medium ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative",
  {
    variants: {
      variant: {
        default:
          "text-muted-foreground hover:text-foreground data-[selected]:text-foreground data-[selected]:font-semibold rounded-md relative z-10",
        underline:
          "text-muted-foreground hover:text-foreground rounded-none data-[selected]:text-primary data-[selected]:font-semibold relative",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const tabListVariants = cva("inline-flex items-center relative", {
  variants: {
    variant: {
      default: "gap-1 rounded-lg bg-muted p-1",
      underline: "border-b border-border gap-4 bg-transparent p-0",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

// Main Tabs component
type TabsProps = {
  children?: JSX.Element;
  value?: string;
  defaultValue?: string;
  onValueChange?: (details: { value: string }) => void;
  orientation?: "horizontal" | "vertical";
  activationMode?: "manual" | "automatic";
  disabled?: boolean;
  loopFocus?: boolean;
  class?: string;
  lazyMount?: boolean;
  unmountOnExit?: boolean;
};

export const Tabs: Component<TabsProps> = (props) => {
  const [local, others] = splitProps(props, ["children", "class"]);

  return (
    <ArkTabs.Root class={cn("w-full", local.class)} {...others}>
      {local.children}
    </ArkTabs.Root>
  );
};

// Tab List
type TabsListProps = {
  children?: JSX.Element;
  class?: string;
  variant?: "default" | "underline";
};

export const TabsList: Component<TabsListProps> = (props) => {
  const [local, variantProps, others] = splitProps(
    props,
    ["children", "class"],
    ["variant"],
  );

  return (
    <ArkTabs.List
      class={cn(
        tabListVariants({ variant: variantProps.variant }),
        local.class,
      )}
      {...others}
    >
      {local.children}
    </ArkTabs.List>
  );
};

// Tab Trigger
type TabsTriggerProps = {
  value: string;
  children?: JSX.Element;
  disabled?: boolean;
  class?: string;
  variant?: "default" | "underline";
};

export const TabsTrigger: Component<TabsTriggerProps> = (props) => {
  const [local, variantProps, others] = splitProps(
    props,
    ["children", "class"],
    ["variant"],
  );

  return (
    <ArkTabs.Trigger
      class={cn(
        tabTriggerVariants({ variant: variantProps.variant }),
        local.class,
      )}
      {...others}
    >
      {local.children}
    </ArkTabs.Trigger>
  );
};

// Tab Content
type TabsContentProps = {
  value: string;
  children?: JSX.Element;
  class?: string;
};

export const TabsContent: Component<TabsContentProps> = (props) => {
  const [local, others] = splitProps(props, ["children", "class"]);

  return (
    <ArkTabs.Content
      class={cn(
        "mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "data-[selected]:animate-in data-[selected]:fade-in-0 data-[selected]:slide-in-from-left-2 duration-300",
        local.class,
      )}
      {...others}
    >
      {local.children}
    </ArkTabs.Content>
  );
};

// Tab Indicator
type TabsIndicatorProps = {
  class?: string;
};

export const TabsIndicator: Component<TabsIndicatorProps> = (props) => {
  const [local, others] = splitProps(props, ["class"]);

  return (
    <ArkTabs.Indicator
      class={cn("absolute bg-background shadow-sm rounded-md z-0", local.class)}
      style={{
        left: "var(--left)",
        top: "var(--top)",
        width: "var(--width)",
        height: "var(--height)",
        transition: "all 250ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      {...others}
    />
  );
};

// Composable exports
export const TabsRoot = Tabs;

// Metadata for documentation

export default Tabs;

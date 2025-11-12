import { Tabs as ArkTabs } from "@ark-ui/solid";
import type { JSX, Component } from "solid-js";
import { splitProps, createSignal, onMount } from "solid-js";
import { Motion } from "solid-motionone";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { ComponentMeta } from "../lib/meta";

// Variants for tab triggers
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
  const [mounted, setMounted] = createSignal(false);

  onMount(() => {
    // Enable transitions after mount
    requestAnimationFrame(() => {
      setMounted(true);
    });
  });

  return (
    <ArkTabs.Indicator
      class={cn("absolute bg-background shadow-sm rounded-md", local.class)}
      style={{
        left: "var(--left)",
        top: "var(--top)",
        width: "var(--width)",
        height: "var(--height)",
        transition: mounted()
          ? "all 250ms cubic-bezier(0.16, 1, 0.3, 1)"
          : "none",
      }}
      {...others}
    />
  );
};

// Composable exports
export const TabsRoot = Tabs;

// Metadata for documentation
// Import components for examples only - won't count as dependencies
// since they're imported right before the meta export
import { Card, CardHeader, CardTitle, CardContent } from "./card";
import { Badge } from "./badge";

export const meta: ComponentMeta<TabsProps> = {
  name: "Tabs",
  description:
    "A tabs component that allows users to switch between different views. Supports multiple variants and smooth animations.",
  variants: tabTriggerVariants,
  examples: [
    {
      title: "Default Variant",
      description: "Pill-style tabs with muted background",
      code: () => (
        <Tabs defaultValue="react">
          <TabsList>
            <TabsIndicator />
            <TabsTrigger value="react">React</TabsTrigger>
            <TabsTrigger value="solid">Solid</TabsTrigger>
            <TabsTrigger value="vue">Vue</TabsTrigger>
          </TabsList>
          <TabsContent value="react">
            <Card>
              <CardHeader>
                <CardTitle>React</CardTitle>
              </CardHeader>
              <CardContent>
                <p class="text-sm text-muted-foreground">
                  React is a JavaScript library for building user interfaces.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="solid">
            <Card>
              <CardHeader>
                <CardTitle>Solid</CardTitle>
              </CardHeader>
              <CardContent>
                <p class="text-sm text-muted-foreground">
                  SolidJS is a reactive JavaScript library for building fast
                  UIs.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="vue">
            <Card>
              <CardHeader>
                <CardTitle>Vue</CardTitle>
              </CardHeader>
              <CardContent>
                <p class="text-sm text-muted-foreground">
                  Vue is a progressive framework for building user interfaces.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ),
    },
    {
      title: "Underline Variant",
      description: "Tabs with underline indicator",
      code: () => (
        <Tabs defaultValue="account">
          <TabsList variant="underline">
            <TabsIndicator class="!h-[2px] !bottom-0 !top-auto bg-primary rounded-none shadow-none" />
            <TabsTrigger value="account" variant="underline">
              Account
            </TabsTrigger>
            <TabsTrigger value="password" variant="underline">
              Password
            </TabsTrigger>
            <TabsTrigger value="notifications" variant="underline">
              Notifications
            </TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            <div class="p-4">
              <h3 class="font-semibold mb-2">Account Settings</h3>
              <p class="text-sm text-muted-foreground">
                Manage your account settings and preferences.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="password">
            <div class="p-4">
              <h3 class="font-semibold mb-2">Password</h3>
              <p class="text-sm text-muted-foreground">
                Change your password and security settings.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="notifications">
            <div class="p-4">
              <h3 class="font-semibold mb-2">Notifications</h3>
              <p class="text-sm text-muted-foreground">
                Configure how you receive notifications.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      ),
    },

    {
      title: "Disabled Tab",
      description: "Tabs with disabled state",
      code: () => (
        <Tabs defaultValue="available">
          <TabsList>
            <TabsIndicator />
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="coming-soon" disabled>
              Coming Soon
            </TabsTrigger>
            <TabsTrigger value="enabled">Enabled</TabsTrigger>
          </TabsList>
          <TabsContent value="available">
            <div class="p-4 border border-border rounded-md">
              <p class="text-sm text-muted-foreground">
                This tab is currently available.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="coming-soon">
            <div class="p-4 border border-border rounded-md">
              <p class="text-sm text-muted-foreground">
                This feature is coming soon.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="enabled">
            <div class="p-4 border border-border rounded-md">
              <p class="text-sm text-muted-foreground">
                This tab is enabled and ready to use.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      ),
    },
  ],
};

export default Tabs;

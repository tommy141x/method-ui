import type { JSX, Component } from "solid-js";
import { splitProps } from "solid-js";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import { icon } from "../lib/icon";
import type { ComponentMeta } from "../lib/meta";

const cardVariants = cva("rounded-lg text-card-foreground", {
  variants: {
    variant: {
      default: "bg-card shadow-sm",
      elevated: "bg-card shadow-xl",
      outlined: "bg-card border-2 border-border shadow-none",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface CardProps {
  children?: JSX.Element;
  variant?: VariantProps<typeof cardVariants>["variant"];
  class?: string;
}

export const Card: Component<CardProps> = (props) => {
  const [local, variantProps, others] = splitProps(
    props,
    ["children", "class"],
    ["variant"],
  );

  return (
    <div
      class={cn(cardVariants({ variant: variantProps.variant }), local.class)}
      {...others}
    >
      {local.children}
    </div>
  );
};

export interface CardTitleProps {
  children?: JSX.Element;
  class?: string;
}

export const CardTitle: Component<CardTitleProps> = (props) => {
  const [local, others] = splitProps(props, ["children", "class"]);

  return (
    <h3
      class={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        local.class,
      )}
      {...others}
    >
      {local.children}
    </h3>
  );
};

export interface CardDescriptionProps {
  children?: JSX.Element;
  class?: string;
}

export const CardDescription: Component<CardDescriptionProps> = (props) => {
  const [local, others] = splitProps(props, ["children", "class"]);

  return (
    <p class={cn("text-sm text-muted-foreground", local.class)} {...others}>
      {local.children}
    </p>
  );
};

export interface CardContentProps {
  children?: JSX.Element;
  class?: string;
}

export const CardContent: Component<CardContentProps> = (props) => {
  const [local, others] = splitProps(props, ["children", "class"]);

  return (
    <div class={cn("p-6 pt-0", local.class)} {...others}>
      {local.children}
    </div>
  );
};

export interface CardHeaderProps {
  children?: JSX.Element;
  class?: string;
}

export const CardHeader: Component<CardHeaderProps> = (props) => {
  const [local, others] = splitProps(props, ["children", "class"]);

  return (
    <div class={cn("flex flex-col space-y-1.5 p-6", local.class)} {...others}>
      {local.children}
    </div>
  );
};

export interface CardFooterProps {
  children?: JSX.Element;
  class?: string;
}

export const CardFooter: Component<CardFooterProps> = (props) => {
  const [local, others] = splitProps(props, ["children", "class"]);

  return (
    <div class={cn("flex items-center p-6 pt-0", local.class)} {...others}>
      {local.children}
    </div>
  );
};

// Import components for examples only - these won't be counted as dependencies
// since they're imported after the component definitions but used only in examples
import { Button } from "./button";
import { Input } from "./input";
import { Badge } from "./badge";

export const meta: ComponentMeta<CardProps> = {
  name: "Card",
  description:
    "A versatile card component for displaying content. Use Card alone or compose with CardHeader, CardTitle, CardDescription, CardContent, and CardFooter.",
  apiReference: "",
  variants: cardVariants,
  examples: [
    {
      title: "Basic",
      description: "Simple card with content",
      code: () => (
        <Card class="w-[350px]">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description goes here</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This is the card content area where you can put anything.</p>
            <Badge variant="secondary" class="mt-2">
              Featured
            </Badge>
          </CardContent>
        </Card>
      ),
    },
    {
      title: "With Footer",
      description: "Card with header, content, and footer",
      code: () => (
        <Card class="w-[350px]">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>You have 3 unread messages.</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="flex flex-col gap-2">
              <div class="flex items-center gap-2">
                <div class={cn("h-4 w-4", icon("bell"))} />
                <span class="text-sm">New message from Alice</span>
              </div>
              <div class="flex items-center gap-2">
                <div class={cn("h-4 w-4", icon("bell"))} />
                <span class="text-sm">Bob commented on your post</span>
              </div>
              <div class="flex items-center gap-2">
                <div class={cn("h-4 w-4", icon("bell"))} />
                <span class="text-sm">Your report is ready</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <button class="text-sm text-primary hover:underline">
              Mark all as read
            </button>
          </CardFooter>
        </Card>
      ),
    },
    {
      title: "Variants",
      description: "Different card variants",
      code: () => (
        <div class="flex flex-col gap-4 w-full">
          <Card variant="default" class="w-[300px]">
            <CardHeader>
              <CardTitle class="text-lg">Default Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-sm">Standard card with default styling.</p>
            </CardContent>
          </Card>
          <Card variant="elevated" class="w-[300px]">
            <CardHeader>
              <CardTitle class="text-lg">Elevated Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-sm">Card with enhanced shadow.</p>
            </CardContent>
          </Card>
          <Card variant="outlined" class="w-[300px]">
            <CardHeader>
              <CardTitle class="text-lg">Outlined Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-sm">Card with prominent border.</p>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      title: "Flexible Layout",
      description: "Card without sub-components",
      code: () => (
        <Card class="w-[350px] p-6">
          <h3 class="text-xl font-bold mb-2">Custom Layout</h3>
          <p class="text-sm text-muted-foreground mb-4">
            You don't have to use the sub-components. Just put whatever you want
            inside the Card.
          </p>
          <div class="flex gap-2">
            <Button>Action</Button>
            <Button variant="outline">Cancel</Button>
          </div>
        </Card>
      ),
    },
    {
      title: "With Form",
      description: "Card containing a form",
      code: () => (
        <Card class="w-[350px]">
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>
              Enter your details to create a new account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form class="flex flex-col gap-4">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium" for="name">
                  Name
                </label>
                <Input id="name" type="text" placeholder="John Doe" />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium" for="email">
                  Email
                </label>
                <Input id="email" type="email" placeholder="john@example.com" />
              </div>
            </form>
          </CardContent>
          <CardFooter class="flex gap-2">
            <Button class="flex-1">Create</Button>
            <Button variant="outline" class="flex-1">
              Cancel
            </Button>
          </CardFooter>
        </Card>
      ),
    },
    {
      title: "Stats Card",
      description: "Card displaying statistics",
      code: () => (
        <div class="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader class="pb-2">
              <CardDescription>Total Users</CardDescription>
              <CardTitle class="text-3xl">1,234</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="text-xs text-muted-foreground flex items-center gap-1">
                <div
                  class={cn("h-3 w-3 text-green-500", icon("trending-up"))}
                />
                <span>+20.1% from last month</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader class="pb-2">
              <CardDescription>Revenue</CardDescription>
              <CardTitle class="text-3xl">$12,345</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="text-xs text-muted-foreground flex items-center gap-1">
                <div
                  class={cn("h-3 w-3 text-green-500", icon("trending-up"))}
                />
                <span>+15.2% from last month</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader class="pb-2">
              <CardDescription>Active Now</CardDescription>
              <CardTitle class="text-3xl">573</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="text-xs text-muted-foreground flex items-center gap-1">
                <div
                  class={cn("h-3 w-3 text-red-500", icon("trending-down"))}
                />
                <span>-5.3% from last hour</span>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
  ],
};

export default Card;

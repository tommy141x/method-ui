import type { JSX, Component } from "solid-js";
import { splitProps, mergeProps, createSignal } from "solid-js";
import { cva } from "class-variance-authority";
import { Toggle } from "@ark-ui/solid/toggle";

import { cn } from "../lib/cn";
import { icon } from "../lib/icon";
import type { ComponentMeta } from "../lib/meta";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 data-[pressed]:bg-primary/80",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 data-[pressed]:bg-destructive/80",
        outline:
          "border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground data-[pressed]:bg-accent",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 data-[pressed]:bg-secondary/70",
        ghost:
          "text-foreground hover:bg-accent hover:text-accent-foreground data-[pressed]:bg-accent",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-11 px-8",
        icon: "size-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  class?: string | undefined;
  children?: JSX.Element;
  toggle?: boolean;
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
};

const Button: Component<ButtonProps> = (props) => {
  const merged = mergeProps(
    { variant: "default" as const, size: "default" as const, toggle: false },
    props,
  );

  const [local, toggleProps, others] = splitProps(
    merged,
    ["variant", "size", "class", "toggle"],
    ["pressed", "defaultPressed", "onPressedChange"],
  );

  if (local.toggle) {
    return (
      <Toggle.Root
        pressed={toggleProps.pressed}
        defaultPressed={toggleProps.defaultPressed}
        onPressedChange={toggleProps.onPressedChange}
        class={cn(
          buttonVariants({ variant: local.variant, size: local.size }),
          local.class,
        )}
        {...others}
      />
    );
  }

  return (
    <button
      class={cn(
        buttonVariants({ variant: local.variant, size: local.size }),
        local.class,
      )}
      {...others}
    />
  );
};

export const meta: ComponentMeta<ButtonProps> = {
  name: "Button",
  description:
    "A versatile button component with multiple variants and sizes. Supports toggle mode for stateful buttons.",
  apiReference: "",
  variants: buttonVariants,
  examples: [
    {
      title: "Button Variants",
      description: "Different button styles",
      code: () => (
        <div class="flex gap-2">
          <Button variant="default">Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      ),
    },
    {
      title: "Button Sizes",
      description: "Different button sizes",
      code: () => (
        <div class="flex gap-2 items-center">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">⭐</Button>
        </div>
      ),
    },
    {
      title: "Toggle Button",
      description: "Button with toggle state",
      code: () => {
        const [pressed, setPressed] = createSignal(false);
        return (
          <div class="flex flex-col gap-2">
            <Button
              toggle
              pressed={pressed()}
              onPressedChange={setPressed}
              variant="outline"
            >
              {pressed() ? "Pressed" : "Not Pressed"}
            </Button>
            <p class="text-sm text-muted-foreground">
              State: {pressed() ? "On" : "Off"}
            </p>
          </div>
        );
      },
    },
    {
      title: "Toggle Group",
      description: "Multiple toggle buttons styled as a group",
      code: () => {
        const [selected, setSelected] = createSignal("center");
        return (
          <div class="flex">
            <Button
              toggle
              pressed={selected() === "left"}
              onPressedChange={(pressed) => pressed && setSelected("left")}
              variant="outline"
              size="icon"
              class="!rounded-l-md !rounded-r-none"
            >
              <div class={cn("h-4 w-4", icon("align-left"))} />
            </Button>
            <Button
              toggle
              pressed={selected() === "center"}
              onPressedChange={(pressed) => pressed && setSelected("center")}
              variant="outline"
              size="icon"
              class="rounded-none border-l-0"
            >
              <div class={cn("h-4 w-4", icon("align-center"))} />
            </Button>
            <Button
              toggle
              pressed={selected() === "right"}
              onPressedChange={(pressed) => pressed && setSelected("right")}
              variant="outline"
              size="icon"
              class="!rounded-r-md !rounded-l-none border-l-0"
            >
              <div class={cn("h-4 w-4", icon("align-right"))} />
            </Button>
          </div>
        );
      },
    },
  ],
};

export { Button, buttonVariants };
export type { ButtonProps };

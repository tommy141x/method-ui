/** @jsxImportSource solid-js */
import { JSX, splitProps } from "solid-js";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../src/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends JSX.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export function Button(props: ButtonProps) {
  const [local, others] = splitProps(props, [
    "class",
    "variant",
    "size",
    "loading",
    "disabled",
    "children",
  ]);

  return (
    <button
      class={cn(
        buttonVariants({ variant: local.variant, size: local.size }),
        local.class,
      )}
      disabled={local.disabled || local.loading}
      {...others}
    >
      {local.loading && (
        <div class="i-lucide-loader-2 mr-2 h-4 w-4 animate-spin" />
      )}
      {local.children}
    </button>
  );
}

export function IconButton(props: ButtonProps & { icon: string }) {
  const [local, others] = splitProps(props, ["icon", "children"]);

  return (
    <Button size="icon" {...others}>
      <div class={cn("h-4 w-4", local.icon)} />
      <span class="sr-only">{local.children}</span>
    </Button>
  );
}

export function ButtonWithIcon(
  props: ButtonProps & { icon?: string; iconPosition?: "left" | "right" },
) {
  const [local, others] = splitProps(props, [
    "icon",
    "iconPosition",
    "children",
  ]);
  const position = local.iconPosition || "left";

  return (
    <Button {...others}>
      {local.icon && position === "left" && (
        <div class={cn("h-4 w-4 mr-2", local.icon)} />
      )}
      {local.children}
      {local.icon && position === "right" && (
        <div class={cn("h-4 w-4 ml-2", local.icon)} />
      )}
    </Button>
  );
}

/** @jsxImportSource solid-js */
import { JSX, splitProps } from "solid-js";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../src/utils/cn";

const inputVariants = cva(
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        default: "h-10 px-3 text-sm",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-4 text-base",
      },
      variant: {
        default: "border-input",
        destructive: "border-destructive focus-visible:ring-destructive",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  },
);

export interface InputProps
  extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {}

export function Input(props: InputProps) {
  const [local, others] = splitProps(props, [
    "class",
    "size",
    "variant",
    "type",
  ]);

  return (
    <input
      type={local.type || "text"}
      class={cn(
        inputVariants({ size: local.size, variant: local.variant }),
        local.class,
      )}
      {...others}
    />
  );
}

export interface InputWithLabelProps extends InputProps {
  label?: string;
  id?: string;
  error?: string;
  hint?: string;
}

export function InputWithLabel(props: InputWithLabelProps) {
  const [local, others] = splitProps(props, [
    "label",
    "id",
    "error",
    "hint",
    "class",
  ]);

  const inputId =
    local.id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div class={cn("grid w-full max-w-sm items-center gap-1.5", local.class)}>
      {local.label && (
        <label
          for={inputId}
          class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {local.label}
        </label>
      )}
      <Input
        id={inputId}
        variant={local.error ? "destructive" : "default"}
        {...others}
      />
      {local.hint && !local.error && (
        <p class="text-xs text-muted-foreground">{local.hint}</p>
      )}
      {local.error && <p class="text-xs text-destructive">{local.error}</p>}
    </div>
  );
}

export interface InputWithIconProps extends InputProps {
  icon?: string;
  iconPosition?: "left" | "right";
}

export function InputWithIcon(props: InputWithIconProps) {
  const [local, others] = splitProps(props, ["icon", "iconPosition", "class"]);

  const position = local.iconPosition || "left";

  return (
    <div class="relative">
      {local.icon && position === "left" && (
        <div
          class={cn(
            "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
            local.icon,
          )}
        />
      )}
      <Input
        class={cn(
          local.icon && position === "left" && "pl-10",
          local.icon && position === "right" && "pr-10",
          local.class,
        )}
        {...others}
      />
      {local.icon && position === "right" && (
        <div
          class={cn(
            "absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
            local.icon,
          )}
        />
      )}
    </div>
  );
}

import { Field } from "@ark-ui/solid";
import { type JSX, splitProps } from "solid-js";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { ComponentMeta } from "../lib/meta";

const inputVariants = cva(
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-out hover:border-ring/50 focus-visible:border-ring",
  {
    variants: {
      size: {
        default: "h-10 px-3 text-sm",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-4 text-base",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

// Root component wraps Field.Root
interface InputRootProps {
  children?: JSX.Element;
  invalid?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  class?: string;
}

export const InputRoot = (props: InputRootProps) => {
  const [local, others] = splitProps(props, ["class", "children"]);

  return (
    <Field.Root class={cn("space-y-2", local.class)} {...others}>
      {local.children}
    </Field.Root>
  );
};

// Label component
interface InputLabelProps {
  children?: JSX.Element;
  class?: string;
}

export const InputLabel = (props: InputLabelProps) => {
  const [local, others] = splitProps(props, ["class"]);

  return (
    <Field.Label
      class={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 transition-colors duration-150",
        local.class,
      )}
      {...others}
    />
  );
};

// Input component (the actual input element)
type InputProps = JSX.InputHTMLAttributes<HTMLInputElement> &
  VariantProps<typeof inputVariants> & {
    class?: string;
  };

export const Input = (props: InputProps) => {
  const [local, others] = splitProps(props, ["class", "size"]);

  return (
    <Field.Input
      class={cn(inputVariants({ size: local.size }), local.class)}
      {...others}
    />
  );
};

// Textarea component
interface TextareaProps
  extends JSX.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof inputVariants> {
  class?: string;
  autoresize?: boolean;
}

export const Textarea = (props: TextareaProps) => {
  const [local, others] = splitProps(props, ["class", "size", "autoresize"]);

  return (
    <Field.Textarea
      autoresize={local.autoresize}
      class={cn(
        inputVariants({ size: local.size }),
        "min-h-20 resize-none",
        local.class,
      )}
      {...others}
    />
  );
};

// Helper text component
interface InputHelperTextProps {
  children?: JSX.Element;
  class?: string;
}

export const InputHelperText = (props: InputHelperTextProps) => {
  const [local, others] = splitProps(props, ["class"]);

  return (
    <Field.HelperText
      class={cn(
        "text-xs text-muted-foreground transition-colors duration-150",
        local.class,
      )}
      {...others}
    />
  );
};

// Error text component
interface InputErrorTextProps {
  children?: JSX.Element;
  class?: string;
}

export const InputErrorText = (props: InputErrorTextProps) => {
  const [local, others] = splitProps(props, ["class"]);

  return (
    <Field.ErrorText
      class={cn(
        "text-xs text-destructive transition-all duration-200 animate-in fade-in slide-in-from-top-1",
        local.class,
      )}
      {...others}
    />
  );
};

// Required indicator
interface InputRequiredIndicatorProps {
  children?: JSX.Element;
  class?: string;
}

export const InputRequiredIndicator = (props: InputRequiredIndicatorProps) => {
  const [local, others] = splitProps(props, ["class", "children"]);

  return (
    <Field.RequiredIndicator
      class={cn(
        "text-destructive ml-1 transition-colors duration-150",
        local.class,
      )}
      {...others}
    >
      {local.children || "*"}
    </Field.RequiredIndicator>
  );
};

export const meta: ComponentMeta<InputRootProps> = {
  name: "Input",
  description:
    "A composable form input component built with Ark UI Field. Components: InputRoot (wrapper), InputLabel, Input, Textarea, Select, InputHelperText, InputErrorText, InputRequiredIndicator. Use Input alone for simple cases, or compose with InputRoot for full control over labels, errors, and helper text.",
  variants: inputVariants,
  examples: [
    {
      title: "Simple Input",
      description: "A standalone input without Field wrapper",
      code: () => <Input placeholder="Enter text..." />,
    },
    {
      title: "Input with Label",
      description: "Complete form field with label and helper text",
      code: () => (
        <InputRoot>
          <InputLabel>Email</InputLabel>
          <Input type="email" placeholder="Enter your email" />
          <InputHelperText>We'll never share your email</InputHelperText>
        </InputRoot>
      ),
    },
    {
      title: "Input with Error",
      description: "Input with error state and required indicator",
      code: () => (
        <InputRoot invalid required>
          <InputLabel>
            Password
            <InputRequiredIndicator />
          </InputLabel>
          <Input type="password" placeholder="Enter password" />
          <InputErrorText>Password is required</InputErrorText>
        </InputRoot>
      ),
    },
    {
      title: "Textarea",
      description: "Multi-line text input with autoresize",
      code: () => (
        <InputRoot>
          <InputLabel>Message</InputLabel>
          <Textarea autoresize placeholder="Enter your message..." />
          <InputHelperText>This textarea will grow as you type</InputHelperText>
        </InputRoot>
      ),
    },
    {
      title: "Input Sizes",
      description: "Different input sizes",
      code: () => (
        <div class="space-y-4">
          <Input placeholder="Small input" size="sm" />
          <Input placeholder="Default input" size="default" />
          <Input placeholder="Large input" size="lg" />
        </div>
      ),
    },
  ],
};

export default Input;

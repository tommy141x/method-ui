import type { JSX, Component } from "solid-js";
import { splitProps } from "solid-js";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { ComponentMeta } from "../lib/meta";

const alertVariants = cva("relative w-full rounded-lg border p-4", {
  variants: {
    variant: {
      default: "bg-card text-card-foreground border-border",
      destructive:
        "border-destructive/50 bg-destructive/10 text-destructive dark:border-destructive/50 dark:bg-destructive/10",
      success:
        "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400 dark:border-green-500/50 dark:bg-green-500/10",
      warning:
        "border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 dark:border-yellow-500/50 dark:bg-yellow-500/10",
      info: "border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-400 dark:border-blue-500/50 dark:bg-blue-500/10",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface AlertProps {
  children?: JSX.Element;
  variant?: VariantProps<typeof alertVariants>["variant"];
  class?: string;
}

export const Alert: Component<AlertProps> = (props) => {
  const [local, variantProps, others] = splitProps(
    props,
    ["children", "class"],
    ["variant"],
  );

  return (
    <div
      role="alert"
      class={cn(alertVariants({ variant: variantProps.variant }), local.class)}
      {...others}
    >
      <div class="flex gap-3 items-start">{local.children}</div>
    </div>
  );
};

export interface AlertTitleProps {
  children?: JSX.Element;
  class?: string;
}

export const AlertTitle: Component<AlertTitleProps> = (props) => {
  const [local, others] = splitProps(props, ["children", "class"]);

  return (
    <h5
      class={cn("font-semibold leading-tight tracking-tight", local.class)}
      {...others}
    >
      {local.children}
    </h5>
  );
};

export interface AlertDescriptionProps {
  children?: JSX.Element;
  class?: string;
}

export const AlertDescription: Component<AlertDescriptionProps> = (props) => {
  const [local, others] = splitProps(props, ["children", "class"]);

  return (
    <div
      class={cn("text-sm opacity-90 [&_p]:leading-relaxed mt-1", local.class)}
      {...others}
    >
      {local.children}
    </div>
  );
};

export const meta: ComponentMeta<AlertProps> = {
  name: "Alert",
  description:
    "An alert component for displaying important messages with optional icons, titles, and descriptions. Supports multiple variants for different message types.",
  apiReference: "",
  variants: alertVariants,
  examples: [
    {
      title: "Basic",
      description: "Simple alerts with title and description",
      code: () => (
        <div class="flex flex-col gap-4">
          <Alert>
            <div>
              <AlertTitle>Heads up!</AlertTitle>
              <AlertDescription>
                You can add components to your app using the cli.
              </AlertDescription>
            </div>
          </Alert>
          <Alert variant="info">
            <div>
              <AlertTitle>Information</AlertTitle>
              <AlertDescription>
                A new version of the app is available.
              </AlertDescription>
            </div>
          </Alert>
        </div>
      ),
    },
    {
      title: "Variants",
      description: "Different alert variants for various message types",
      code: () => (
        <div class="flex flex-col gap-4">
          <Alert variant="destructive">
            <div>
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Your session has expired. Please log in again.
              </AlertDescription>
            </div>
          </Alert>
          <Alert variant="success">
            <div>
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                Your changes have been saved successfully.
              </AlertDescription>
            </div>
          </Alert>
          <Alert variant="warning">
            <div>
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Your storage is almost full. Consider upgrading your plan.
              </AlertDescription>
            </div>
          </Alert>
        </div>
      ),
    },
    {
      title: "With Icons",
      description: "Alerts with icons positioned to the left",
      code: () => (
        <div class="flex flex-col gap-4">
          <Alert>
            <div class="h-5 w-5 i-lucide-terminal shrink-0" />
            <div>
              <AlertTitle>Heads up!</AlertTitle>
              <AlertDescription>
                You can add components to your app using the cli.
              </AlertDescription>
            </div>
          </Alert>
          <Alert variant="destructive">
            <div class="h-5 w-5 i-lucide-alert-circle shrink-0" />
            <div>
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Your session has expired. Please log in again.
              </AlertDescription>
            </div>
          </Alert>
          <Alert variant="success">
            <div class="h-5 w-5 i-lucide-check-circle shrink-0" />
            <div>
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                Your changes have been saved successfully.
              </AlertDescription>
            </div>
          </Alert>
          <Alert variant="warning">
            <div class="h-5 w-5 i-lucide-alert-triangle shrink-0" />
            <div>
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Your storage is almost full. Consider upgrading your plan.
              </AlertDescription>
            </div>
          </Alert>
        </div>
      ),
    },
    {
      title: "Title Only",
      description: "Alert with just a title",
      code: () => (
        <div class="flex flex-col gap-4">
          <Alert>
            <div class="h-5 w-5 i-lucide-bell shrink-0" />
            <div>
              <AlertTitle>You have 3 unread notifications</AlertTitle>
            </div>
          </Alert>
          <Alert variant="success">
            <div class="h-5 w-5 i-lucide-check-circle shrink-0" />
            <div>
              <AlertTitle>Payment successful</AlertTitle>
            </div>
          </Alert>
        </div>
      ),
    },
  ],
};

export default Alert;

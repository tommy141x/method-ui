/**
 * Toaster Component - Toast notification system using Ark UI
 *
 * SETUP INSTRUCTIONS:
 *
 * 1. Create a toaster instance in your app:
 *
 *    import { createToaster } from "./components/toaster";
 *
 *    const toaster = createToaster({
 *      placement: "bottom-end",
 *      overlap: true,
 *      gap: 16,
 *    });
 *
 * 2. Add the Toaster component to your app root:
 *
 *    import { Toaster } from "./components/toaster";
 *
 *    export default function App() {
 *      return (
 *        <>
 *          <Toaster toaster={toaster} />
 *          {/* Your app content *\/}
 *        </>
 *      );
 *    }
 *
 * 3. Use toast notifications anywhere in your app:
 *
 *    toaster.create({
 *      title: "Success!",
 *      description: "Your changes have been saved.",
 *      type: "success",
 *    });
 *
 *    // Or use convenience methods:
 *    toaster.success({ title: "Success!", description: "Done!" });
 *    toaster.error({ title: "Error", description: "Something went wrong" });
 *    toaster.warning({ title: "Warning", description: "Be careful" });
 *    toaster.info({ title: "Info", description: "FYI" });
 *
 * FEATURES:
 * - Multiple toast types (success, error, warning, info, loading)
 * - Customizable duration and position
 * - Promise-based toasts for async operations
 * - Action and cancel buttons
 * - Dismiss toasts programmatically
 * - Stacking and overlap animations
 * - Pause on hover
 * - Maximum visible toasts with queueing
 * - Dark mode support
 */

import type { JSX, Component } from "solid-js";
import { splitProps, Show, For } from "solid-js";
import {
  Toast as ArkToast,
  Toaster as ArkToaster,
  createToaster as arkCreateToaster,
} from "@ark-ui/solid/toast";
import type {
  CreateToasterProps,
  CreateToasterReturn,
  ToasterProps as ArkToasterProps,
} from "@ark-ui/solid/toast";
import { cn } from "../lib/cn";
import { icon } from "../lib/icon";
import type { ComponentMeta } from "../lib/meta";

// Re-export createToaster from Ark UI with proper types
export const createToaster = (props: CreateToasterProps) => {
  return arkCreateToaster(props);
};

export type ToasterInstance = CreateToasterReturn;

// Toast component props
export interface ToastProps {
  /**
   * The toaster instance created with createToaster
   */
  toaster: CreateToasterReturn;
  /**
   * Additional CSS classes
   */
  class?: string;
  /**
   * The document's text/writing direction
   */
  dir?: "ltr" | "rtl";
  /**
   * A root node to correctly resolve document in custom environments (e.g., iframes, Electron)
   */
  getRootNode?: () => Node | ShadowRoot | Document;
}

// Toast type icons
const ToastIcon: Component<{ type?: string }> = (props) => {
  return (
    <Show when={props.type}>
      <div class="shrink-0 mt-0.5">
        <Show when={props.type === "success"}>
          <div
            class={cn(
              "h-5 w-5 text-green-600 dark:text-green-400",
              icon("circle-check"),
            )}
          />
        </Show>
        <Show when={props.type === "error"}>
          <div class={cn("h-5 w-5 text-destructive", icon("circle-x"))} />
        </Show>
        <Show when={props.type === "warning"}>
          <div
            class={cn(
              "h-5 w-5 text-yellow-600 dark:text-yellow-400",
              icon("triangle-alert"),
            )}
          />
        </Show>
        <Show when={props.type === "info"}>
          <div class={cn("h-5 w-5 text-primary", icon("info"))} />
        </Show>
        <Show when={props.type === "loading"}>
          <div
            class={cn(
              "h-5 w-5 animate-spin text-primary",
              icon("loader-circle"),
            )}
          />
        </Show>
      </div>
    </Show>
  );
};

// Main Toast component
export const Toast: Component<ToastProps> = (props) => {
  const [local, others] = splitProps(props, ["toaster", "class"]);

  return (
    <>
      <style>
        {`
          /* Toast group positioning */
          [data-scope="toast"][data-part="group"] {
            position: fixed;
            z-index: 9999;
            pointer-events: none;
          }

          /* Toast animations and positioning */
          [data-scope="toast"][data-part="root"] {
            pointer-events: auto;
            position: relative;
            width: 356px;
            max-width: calc(100vw - 32px);
            translate: var(--x) var(--y);
            scale: var(--scale);
            z-index: var(--z-index);
            height: var(--height);
            opacity: var(--opacity);
            will-change: translate, opacity, scale;
            transition:
              translate 400ms,
              scale 400ms,
              opacity 400ms,
              height 400ms;
            transition-timing-function: cubic-bezier(0.21, 1.02, 0.73, 1);
          }

          [data-scope="toast"][data-part="root"][data-state="closed"] {
            transition:
              translate 400ms,
              scale 400ms,
              opacity 200ms;
            transition-timing-function: cubic-bezier(0.06, 0.71, 0.55, 1);
          }

          /* Mobile responsive */
          @media (max-width: 640px) {
            [data-scope="toast"][data-part="group"] {
              width: 100%;
              left: 0 !important;
              right: 0 !important;
            }

            [data-scope="toast"][data-part="root"] {
              width: calc(100% - var(--gap) * 2);
              margin: 0 auto;
            }
          }
        `}
      </style>
      <ArkToaster toaster={local.toaster} {...others}>
        {(toast) => (
          <ArkToast.Root
            class={cn(
              "group relative flex w-full items-start gap-3 border border-border bg-background p-4 shadow-lg",
              "data-[type=success]:border-green-600/50 dark:data-[type=success]:border-green-400/50",
              "data-[type=error]:border-destructive/50",
              "data-[type=warning]:border-yellow-600/50 dark:data-[type=warning]:border-yellow-400/50",
              "data-[type=info]:border-primary/50",
              "data-[type=loading]:border-primary/50",
              local.class,
            )}
            style={{
              "border-radius": "var(--radius)",
            }}
          >
            <ToastIcon type={toast().type} />

            <div class="flex-1 space-y-1">
              <ArkToast.Title class="text-sm font-semibold text-foreground">
                {toast().title}
              </ArkToast.Title>
              <Show when={toast().description}>
                <ArkToast.Description class="text-sm text-muted-foreground">
                  {toast().description}
                </ArkToast.Description>
              </Show>

              <Show when={toast().action}>
                <div class="flex gap-2 mt-3">
                  <ArkToast.ActionTrigger class="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                    {toast().action!.label}
                  </ArkToast.ActionTrigger>
                </div>
              </Show>
            </div>

            <Show when={toast().type !== "loading"}>
              <ArkToast.CloseTrigger class="absolute right-2 top-2 rounded-sm p-1 opacity-0 transition-opacity group-hover:opacity-70 hover:opacity-100">
                <div class={cn("h-4 w-4", icon("x"))} />
              </ArkToast.CloseTrigger>
            </Show>
          </ArkToast.Root>
        )}
      </ArkToaster>
    </>
  );
};

// Import components for examples
import { Button } from "./button";

export const meta: ComponentMeta<ToastProps> = {
  name: "Toast",
  description:
    "A toast notification system built on Ark UI. Features stacking, gestures, promise handling, and full customization.",
  examples: [
    {
      title: "Setup",
      description: "Create toaster instances for different positions",
      code: () => {
        const toasterBottomRight = createToaster({
          placement: "bottom-end",
          overlap: true,
          gap: 16,
        });

        const toasterBottom = createToaster({
          placement: "bottom",
          overlap: true,
          gap: 16,
        });

        const toasterTopRight = createToaster({
          placement: "top-end",
          overlap: true,
          gap: 16,
        });

        const toasterTop = createToaster({
          placement: "top",
          overlap: true,
          gap: 16,
        });

        const toasterBottomLeft = createToaster({
          placement: "bottom-start",
          overlap: true,
          gap: 16,
        });

        return (
          <>
            <Toast toaster={toasterBottomRight} />
            <Toast toaster={toasterBottom} />
            <Toast toaster={toasterTopRight} />
            <Toast toaster={toasterTop} />
            <Toast toaster={toasterBottomLeft} />
            <div class="space-y-4">
              <p class="text-sm text-muted-foreground mb-2">
                Multiple toaster instances for different positions!
              </p>
              <div class="flex flex-wrap gap-2">
                <Button
                  onClick={() =>
                    toasterBottomRight.create({
                      title: "Bottom Right",
                      description: "Default position (bottom-right)",
                      type: "info",
                    })
                  }
                >
                  Bottom Right
                </Button>
                <Button
                  onClick={() =>
                    toasterBottom.create({
                      title: "Bottom Center",
                      description: "Centered at the bottom",
                      type: "success",
                    })
                  }
                >
                  Bottom Center
                </Button>
                <Button
                  onClick={() =>
                    toasterTopRight.create({
                      title: "Top Right",
                      description: "Top right position",
                      type: "warning",
                    })
                  }
                >
                  Top Right
                </Button>
                <Button
                  onClick={() =>
                    toasterTop.create({
                      title: "Top Center",
                      description: "Centered at the top",
                      type: "error",
                    })
                  }
                >
                  Top Center
                </Button>
                <Button
                  onClick={() =>
                    toasterBottomLeft.create({
                      title: "Bottom Left",
                      description: "Bottom left position",
                    })
                  }
                >
                  Bottom Left
                </Button>
              </div>
            </div>
          </>
        );
      },
    },
    {
      title: "Promise & Update Toasts",
      description: "Handle async operations and update toasts dynamically",
      code: () => {
        const toaster = createToaster({
          placement: "bottom-end",
          overlap: true,
          gap: 16,
        });

        const uploadFile = () => {
          return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
              Math.random() > 0.5
                ? resolve()
                : reject(new Error("Upload failed"));
            }, 2000);
          });
        };

        let toastId: string | undefined;

        return (
          <>
            <Toast toaster={toaster} />
            <div class="flex gap-2">
              <Button
                onClick={() =>
                  toaster.promise(uploadFile, {
                    loading: {
                      title: "Uploading...",
                      description: "Please wait while we process your request.",
                    },
                    success: {
                      title: "Success!",
                      description:
                        "Your request has been processed successfully.",
                    },
                    error: {
                      title: "Failed",
                      description: "Something went wrong. Please try again.",
                    },
                  })
                }
              >
                Promise Toast
              </Button>
              <Button
                onClick={() => {
                  toastId = toaster.create({
                    title: "Loading",
                    description: "Processing your request...",
                    type: "loading",
                    duration: Infinity,
                  });
                }}
              >
                Create
              </Button>
              <Button
                onClick={() => {
                  if (toastId) {
                    toaster.update(toastId, {
                      title: "Success!",
                      description: "Your request has been processed.",
                      type: "success",
                      duration: 3000,
                    });
                  }
                }}
              >
                Update
              </Button>
            </div>
          </>
        );
      },
    },
    {
      title: "Duration & Limits",
      description: "Control duration and maximum visible toasts",

      code: () => {
        const toaster = createToaster({
          placement: "bottom-end",
          overlap: true,
          gap: 16,
          max: 3,
        });

        return (
          <>
            <Toast toaster={toaster} />
            <div class="space-y-3">
              <div class="flex flex-wrap gap-2">
                <Button
                  onClick={() =>
                    toaster.create({
                      title: "Quick toast",
                      description: "Disappears in 1 second",
                      duration: 1000,
                    })
                  }
                >
                  1s
                </Button>
                <Button
                  onClick={() =>
                    toaster.create({
                      title: "Long toast",
                      description: "Stays for 10 seconds",
                      duration: 10000,
                    })
                  }
                >
                  10s
                </Button>
                <Button
                  onClick={() =>
                    toaster.create({
                      title: "Persistent",
                      description: "Stays until dismissed",
                      duration: Infinity,
                    })
                  }
                >
                  ∞
                </Button>
              </div>
              <div class="flex flex-wrap gap-2">
                <Button
                  onClick={() =>
                    toaster.create({
                      title: `Toast ${Date.now()}`,
                      description: "Max 3 visible at once",
                      type: "info",
                    })
                  }
                >
                  Add Toast
                </Button>
                <Button
                  onClick={() => {
                    for (let i = 1; i <= 5; i++) {
                      toaster.create({
                        title: `Toast ${i}`,
                        description: `Toast number ${i}`,
                        type: "info",
                      });
                    }
                  }}
                >
                  Add 5 Toasts
                </Button>
              </div>
            </div>
          </>
        );
      },
    },
  ],
};

export default Toast;

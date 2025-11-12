import { Tooltip as ArkTooltip } from "@ark-ui/solid/tooltip";
import { type JSX, splitProps, Show } from "solid-js";

import { Motion, Presence } from "solid-motionone";
import { cn } from "../lib/cn";
import type { ComponentMeta } from "../lib/meta";

interface TooltipProps {
  children?: JSX.Element;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (details: { open: boolean }) => void;
  openDelay?: number;
  closeDelay?: number;
  positioning?: any;
  disabled?: boolean;
  interactive?: boolean;
  closeOnClick?: boolean;
  closeOnEscape?: boolean;
  closeOnPointerDown?: boolean;
  closeOnScroll?: boolean;
  "aria-label"?: string;
}

export const Tooltip = (props: TooltipProps) => {
  return <ArkTooltip.Root {...props}>{props.children}</ArkTooltip.Root>;
};

interface TooltipTriggerProps {
  children?: JSX.Element;
  class?: string;
}

export const TooltipTrigger = (props: TooltipTriggerProps) => {
  const [local, others] = splitProps(props, ["class"]);

  return <ArkTooltip.Trigger class={cn(local.class)} {...others} />;
};

interface TooltipContentProps {
  children?: JSX.Element;
  class?: string;
  showArrow?: boolean;
}

export const TooltipContent = (props: TooltipContentProps) => {
  const [local, others] = splitProps(props, ["children", "class", "showArrow"]);

  return (
    <ArkTooltip.Context>
      {(context) => (
        <ArkTooltip.Positioner>
          <Presence>
            <Show when={context().open}>
              <Motion.div
                animate={{ opacity: [0, 1], scale: [0.96, 1] }}
                exit={{ opacity: [1, 0], scale: [1, 0.96] }}
                transition={{ duration: 0.15, easing: "ease-out" }}
              >
                <ArkTooltip.Content
                  class={cn(
                    "z-50 rounded-md bg-secondary text-secondary-foreground px-3 py-1.5 text-xs shadow-md",
                    local.class,
                  )}
                  {...others}
                >
                  {local.showArrow !== false && (
                    <ArkTooltip.Arrow class="--arrow-size-[8px] --arrow-background-[var(--colors-secondary)]">
                      <ArkTooltip.ArrowTip />
                    </ArkTooltip.Arrow>
                  )}
                  {local.children}
                </ArkTooltip.Content>
              </Motion.div>
            </Show>
          </Presence>
        </ArkTooltip.Positioner>
      )}
    </ArkTooltip.Context>
  );
};

// Import components for examples only - won't count as dependencies
// since they're imported right before the meta export
import { Button } from "./button";
import { Badge } from "./badge";

export const meta: ComponentMeta<TooltipProps> = {
  name: "Tooltip",
  description:
    "A tooltip that provides additional information on hover. Features smooth animations, customizable delays, and flexible positioning.",
  examples: [
    {
      title: "Basic Tooltip",
      description: "A simple tooltip with default settings",
      code: () => (
        <Tooltip>
          <TooltipTrigger>
            <Button variant="outline">Hover me</Button>
          </TooltipTrigger>
          <TooltipContent>I am a tooltip!</TooltipContent>
        </Tooltip>
      ),
    },
    {
      title: "On Buttons",
      description: "Tooltips on interactive button elements",
      code: () => (
        <div class="flex gap-4 items-center">
          <Tooltip>
            <TooltipTrigger>
              <Button variant="default">
                <div class="h-4 w-4 i-lucide-save" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save changes</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger>
              <Button variant="outline">
                <div class="h-4 w-4 i-lucide-trash" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete item</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger>
              <Button variant="ghost">
                <div class="h-4 w-4 i-lucide-info" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>More information</TooltipContent>
          </Tooltip>
        </div>
      ),
    },
    {
      title: "On Badges",
      description: "Tooltips providing context for status badges",
      code: () => (
        <div class="flex gap-4 items-center flex-wrap">
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="default">
                <div class="h-3 w-3 i-lucide-check-circle mr-1" />
                Active
              </Badge>
            </TooltipTrigger>
            <TooltipContent>Service is running normally</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger>
              <Badge variant="secondary">
                <div class="h-3 w-3 i-lucide-clock mr-1" />
                Pending
              </Badge>
            </TooltipTrigger>
            <TooltipContent>Awaiting approval</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger>
              <Badge variant="destructive">
                <div class="h-3 w-3 i-lucide-alert-circle mr-1" />
                Error
              </Badge>
            </TooltipTrigger>
            <TooltipContent>Service encountered an error</TooltipContent>
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Rich Content",
      description: "Tooltip with formatted content",
      code: () => (
        <Tooltip interactive>
          <TooltipTrigger>
            <Button variant="outline">
              <div class="h-4 w-4 i-lucide-help-circle mr-2" />
              Hover for more info
            </Button>
          </TooltipTrigger>
          <TooltipContent class="max-w-xs">
            <div class="space-y-1">
              <p class="font-semibold">Pro Tip</p>
              <p class="text-xs">
                You can hover over this tooltip and interact with its content.
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      ),
    },
  ],
};

export default Tooltip;

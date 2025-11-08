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
            <span class="underline decoration-dotted underline-offset-4">
              Hover me
            </span>
          </TooltipTrigger>
          <TooltipContent>I am a tooltip!</TooltipContent>
        </Tooltip>
      ),
    },
    {
      title: "Positioning",
      description: "Tooltips positioned on different sides",
      code: () => (
        <div class="flex gap-8 items-center justify-center flex-wrap">
          <Tooltip positioning={{ placement: "left" }}>
            <TooltipTrigger>
              <span class="underline decoration-dotted underline-offset-4">
                Left
              </span>
            </TooltipTrigger>
            <TooltipContent>Tooltip on left</TooltipContent>
          </Tooltip>

          <Tooltip positioning={{ placement: "top" }}>
            <TooltipTrigger>
              <span class="underline decoration-dotted underline-offset-4">
                Top
              </span>
            </TooltipTrigger>
            <TooltipContent>Tooltip on top</TooltipContent>
          </Tooltip>

          <Tooltip positioning={{ placement: "bottom" }}>
            <TooltipTrigger>
              <span class="underline decoration-dotted underline-offset-4">
                Bottom
              </span>
            </TooltipTrigger>
            <TooltipContent>Tooltip on bottom</TooltipContent>
          </Tooltip>

          <Tooltip positioning={{ placement: "right" }}>
            <TooltipTrigger>
              <span class="underline decoration-dotted underline-offset-4">
                Right
              </span>
            </TooltipTrigger>
            <TooltipContent>Tooltip on right</TooltipContent>
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
            <span class="underline decoration-dotted underline-offset-4">
              Hover for more info
            </span>
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

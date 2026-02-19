import { HoverCard as ArkHoverCard } from "@ark-ui/solid/hover-card";
import type { PositioningOptions } from "@zag-js/popper";
import { type JSX, Show, splitProps } from "solid-js";
import { Motion, Presence } from "solid-motionone";
import { cn } from "../lib/cn";
import type { ComponentMeta } from "../lib/meta";

interface HoverCardProps {
  children?: JSX.Element;
  open?: boolean;
  onOpenChange?: (details: { open: boolean }) => void;
  openDelay?: number;
  closeDelay?: number;
  positioning?: PositioningOptions;
  disabled?: boolean;
}

export const HoverCard = (props: HoverCardProps) => {
  return <ArkHoverCard.Root {...props}>{props.children}</ArkHoverCard.Root>;
};

interface HoverCardTriggerProps {
  children?: JSX.Element;
  class?: string;
}

export const HoverCardTrigger = (props: HoverCardTriggerProps) => {
  const [local, others] = splitProps(props, ["class"]);

  return (
    <ArkHoverCard.Trigger
      class={cn(
        "cursor-help underline decoration-dotted underline-offset-4",
        local.class,
      )}
      {...others}
    />
  );
};

interface HoverCardContentProps {
  children?: JSX.Element;
  class?: string;
  showArrow?: boolean;
}

export const HoverCardContent = (props: HoverCardContentProps) => {
  const [local, others] = splitProps(props, ["children", "class", "showArrow"]);

  return (
    <ArkHoverCard.Context>
      {(context) => (
        <ArkHoverCard.Positioner>
          <Presence>
            <Show when={context().open}>
              <Motion.div
                animate={{ opacity: [0, 1], scale: [0.96, 1] }}
                exit={{ opacity: [1, 0], scale: [1, 0.96] }}
                transition={{ duration: 0.2, easing: "ease-in-out" }}
              >
                <ArkHoverCard.Content
                  class={cn(
                    "z-50 w-64 rounded-md border border-border bg-background p-4 shadow-md outline-none",
                    local.class,
                  )}
                  {...others}
                >
                  {local.showArrow !== false && (
                    <ArkHoverCard.Arrow class="--arrow-size-[12px] --arrow-background-[var(--colors-background)]">
                      <ArkHoverCard.ArrowTip class="border-t border-l border-border" />
                    </ArkHoverCard.Arrow>
                  )}
                  {local.children}
                </ArkHoverCard.Content>
              </Motion.div>
            </Show>
          </Presence>
        </ArkHoverCard.Positioner>
      )}
    </ArkHoverCard.Context>
  );
};

import { Badge } from "./badge";
// Import components for examples only - won't count as dependencies
// since they're imported right before the meta export
import { Button } from "./button";

export const meta: ComponentMeta<HoverCardProps> = {
  name: "HoverCard",
  description:
    "A card that appears when hovering over an element. Features smooth animations and customizable positioning.",
  examples: [
    {
      title: "Basic Hover Card",
      description: "A simple hover card with content",
      code: () => (
        <HoverCard>
          <HoverCardTrigger>
            <Button variant="outline">Hover over me</Button>
          </HoverCardTrigger>
          <HoverCardContent>
            <div>
              <h4 class="font-semibold mb-2">Hover Card</h4>
              <p class="text-sm text-muted-foreground">
                This is a hover card with some helpful information.
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
      ),
    },
    {
      title: "With Badge",
      description: "Hover card triggered by a badge",
      code: () => (
        <HoverCard>
          <HoverCardTrigger>
            <Badge variant="secondary">
              <div class="h-3 w-3 i-lucide-info mr-1" />
              Info
            </Badge>
          </HoverCardTrigger>
          <HoverCardContent>
            <div class="space-y-2">
              <h4 class="font-semibold">Additional Information</h4>
              <p class="text-sm text-muted-foreground">
                Hover cards are perfect for providing contextual information
                without cluttering the UI.
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
      ),
    },
    {
      title: "Custom Positioning",
      description: "Hover card with custom placement and no arrow",
      code: () => (
        <HoverCard positioning={{ placement: "right", gutter: 16 }}>
          <HoverCardTrigger>
            <Button variant="ghost">Hover for right placement</Button>
          </HoverCardTrigger>
          <HoverCardContent showArrow={false}>
            <div>
              <h4 class="font-semibold mb-2">Right Positioned</h4>
              <p class="text-sm text-muted-foreground">
                This hover card appears to the right with custom spacing.
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
      ),
    },
  ],
};

export default HoverCard;

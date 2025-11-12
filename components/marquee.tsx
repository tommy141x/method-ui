import { Marquee as ArkMarquee } from "@ark-ui/solid";
import { type JSX, splitProps, For, Show } from "solid-js";
import { cn } from "../lib/cn";
import type { ComponentMeta } from "../lib/meta";

// Simple Marquee component
interface MarqueeProps {
  children?: JSX.Element;
  autoFill?: boolean;
  pauseOnInteraction?: boolean;
  reverse?: boolean;
  speed?: number;
  class?: string;
  showEdges?: boolean;
}

export const Marquee = (props: MarqueeProps) => {
  const [local, others] = splitProps(props, ["children", "class", "showEdges"]);

  return (
    <ArkMarquee.Root
      class={cn("relative w-full overflow-hidden", local.class)}
      autoFill={props.autoFill !== false}
      reverse={props.reverse}
      speed={props.speed}
      pauseOnInteraction={props.pauseOnInteraction}
    >
      <style>
        {`
          @keyframes marqueeX {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(var(--marquee-translate));
            }
          }

          @keyframes marqueeY {
            from {
              transform: translateY(0);
            }
            to {
              transform: translateY(var(--marquee-translate));
            }
          }

          [data-scope="marquee"][data-part="content"][data-orientation="horizontal"] {
            animation-name: marqueeX;
            animation-duration: var(--marquee-duration);
            animation-timing-function: linear;
            animation-iteration-count: infinite;
          }

          [data-scope="marquee"][data-part="content"][data-orientation="vertical"] {
            animation-name: marqueeY;
            animation-duration: var(--marquee-duration);
            animation-timing-function: linear;
            animation-iteration-count: infinite;
          }

          [data-scope="marquee"][data-state="paused"] [data-part="content"] {
            animation-play-state: paused;
          }

          [data-scope="marquee"][data-part="content"][data-reverse] {
            animation-direction: reverse;
          }
        `}
      </style>
      <Show when={local.showEdges !== false}>
        <ArkMarquee.Edge
          side="start"
          class="pointer-events-none absolute z-10 h-full w-24 left-0 bg-gradient-to-r from-background to-transparent"
        />
      </Show>
      <ArkMarquee.Viewport class="w-full overflow-hidden">
        <ArkMarquee.Content class="flex items-center">
          {local.children}
        </ArkMarquee.Content>
      </ArkMarquee.Viewport>
      <Show when={local.showEdges !== false}>
        <ArkMarquee.Edge
          side="end"
          class="pointer-events-none absolute z-10 h-full w-24 right-0 bg-gradient-to-l from-background to-transparent"
        />
      </Show>
    </ArkMarquee.Root>
  );
};

export const MarqueeItem = (props: {
  children?: JSX.Element;
  class?: string;
  style?: JSX.CSSProperties | string;
}) => {
  const [local, others] = splitProps(props, ["class"]);
  return (
    <ArkMarquee.Item class={cn("flex-shrink-0", local.class)} {...others} />
  );
};

// Advanced composable API exports
export const MarqueeRoot = ArkMarquee.Root;
export const MarqueeViewport = ArkMarquee.Viewport;
export const MarqueeContent = ArkMarquee.Content;
export const MarqueeEdge = ArkMarquee.Edge;
export const MarqueeContext = ArkMarquee.Context;
export const MarqueeRootProvider = ArkMarquee.RootProvider;

export const meta: ComponentMeta<MarqueeProps> = {
  name: "Marquee",
  description:
    "A marquee component for creating smooth, scrolling content with GPU-accelerated animations. Supports horizontal/vertical scrolling, auto-fill, pause on hover, and more.",
  examples: [
    {
      title: "Basic",
      description: "A simple horizontal marquee with edge gradients",
      code: () => {
        const items = ["React", "Solid", "Vue", "Svelte"];

        return (
          <Marquee>
            <For each={items}>
              {(item) => (
                <MarqueeItem style={{ padding: "0 2rem" }}>
                  <div class="rounded-lg border border-border bg-card px-8 py-4 text-lg font-medium">
                    {item}
                  </div>
                </MarqueeItem>
              )}
            </For>
          </Marquee>
        );
      },
    },
    {
      title: "Reverse Direction",
      description: "Scrolls in the opposite direction",
      code: () => {
        const items = ["React", "Solid", "Vue", "Svelte", "Angular", "Qwik"];

        return (
          <div class="space-y-8 w-full overflow-hidden">
            <div class="w-full overflow-hidden">
              <h4 class="text-sm font-medium mb-2">Normal Direction</h4>
              <Marquee>
                <For each={items}>
                  {(item) => (
                    <MarqueeItem style={{ padding: "0 2rem" }}>
                      <div class="px-6 py-3 rounded-md bg-primary text-primary-foreground">
                        {item}
                      </div>
                    </MarqueeItem>
                  )}
                </For>
              </Marquee>
            </div>

            <div class="w-full overflow-hidden">
              <h4 class="text-sm font-medium mb-2">Reverse Direction</h4>
              <Marquee reverse>
                <For each={items}>
                  {(item) => (
                    <MarqueeItem style={{ padding: "0 2rem" }}>
                      <div class="px-6 py-3 rounded-md bg-secondary text-secondary-foreground">
                        {item}
                      </div>
                    </MarqueeItem>
                  )}
                </For>
              </Marquee>
            </div>
          </div>
        );
      },
    },
    {
      title: "Custom Speed",
      description: "Control animation speed in pixels per second",
      code: () => {
        const items = ["React", "Solid", "Vue", "Svelte"];

        return (
          <div class="space-y-8 w-full overflow-hidden">
            <div class="w-full overflow-hidden">
              <h4 class="text-sm font-medium mb-2">Slow (25px/s)</h4>
              <Marquee speed={25}>
                <For each={items}>
                  {(item) => (
                    <MarqueeItem style={{ padding: "0 2rem" }}>
                      <div class="rounded-lg border border-border bg-card px-8 py-4 text-lg font-medium">
                        {item}
                      </div>
                    </MarqueeItem>
                  )}
                </For>
              </Marquee>
            </div>

            <div class="w-full overflow-hidden">
              <h4 class="text-sm font-medium mb-2">Fast (200px/s)</h4>
              <Marquee speed={200}>
                <For each={items}>
                  {(item) => (
                    <MarqueeItem style={{ padding: "0 2rem" }}>
                      <div class="rounded-lg border border-border bg-card px-8 py-4 text-lg font-medium">
                        {item}
                      </div>
                    </MarqueeItem>
                  )}
                </For>
              </Marquee>
            </div>
          </div>
        );
      },
    },
  ],
};

export default Marquee;

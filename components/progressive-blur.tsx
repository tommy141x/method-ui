import type { JSX, Component } from "solid-js";
import { splitProps, For } from "solid-js";
import { cn } from "../lib/cn";
import type { ComponentMeta } from "../lib/meta";

export interface ProgressiveBlurProps
  extends JSX.HTMLAttributes<HTMLDivElement> {
  class?: string;
  height?: string;
  position?: "top" | "bottom" | "both";
  blurLevels?: number[];
  children?: JSX.Element;
}

export const ProgressiveBlur: Component<ProgressiveBlurProps> = (props) => {
  const [local, others] = splitProps(props, [
    "class",
    "height",
    "position",
    "blurLevels",
    "children",
  ]);

  const height = () => local.height ?? "30%";
  const position = () => local.position ?? "bottom";
  const blurLevels = () => local.blurLevels ?? [0.5, 1, 2, 4, 8, 16, 32, 64];

  const divElements = () => Array(blurLevels().length - 2).fill(null);

  const getMaskGradient = (blurIndex: number) => {
    const startPercent = blurIndex * 12.5;
    const midPercent = (blurIndex + 1) * 12.5;
    const endPercent = (blurIndex + 2) * 12.5;

    switch (position()) {
      case "bottom":
        return `linear-gradient(to bottom, transparent ${startPercent}%, black ${midPercent}%, black ${endPercent}%, transparent ${endPercent + 12.5}%)`;
      case "top":
        return `linear-gradient(to top, transparent ${startPercent}%, black ${midPercent}%, black ${endPercent}%, transparent ${endPercent + 12.5}%)`;
      default:
        return `linear-gradient(transparent 0%, black 5%, black 95%, transparent 100%)`;
    }
  };

  const getFirstLayerMask = () => {
    switch (position()) {
      case "bottom":
        return `linear-gradient(to bottom, transparent 0%, black 12.5%, black 25%, transparent 37.5%)`;
      case "top":
        return `linear-gradient(to top, transparent 0%, black 12.5%, black 25%, transparent 37.5%)`;
      default:
        return `linear-gradient(transparent 0%, black 5%, black 95%, transparent 100%)`;
    }
  };

  const getLastLayerMask = () => {
    switch (position()) {
      case "bottom":
        return `linear-gradient(to bottom, transparent 87.5%, black 100%)`;
      case "top":
        return `linear-gradient(to top, transparent 87.5%, black 100%)`;
      default:
        return `linear-gradient(transparent 0%, black 5%, black 95%, transparent 100%)`;
    }
  };

  return (
    <div
      class={cn(
        "pointer-events-none absolute z-10 inset-x-0",
        local.class,
        position() === "top"
          ? "top-0"
          : position() === "bottom"
            ? "bottom-0"
            : "inset-y-0",
      )}
      style={{
        height: position() === "both" ? "100%" : height(),
      }}
      {...others}
    >
      <div
        class="absolute inset-0"
        style={{
          "z-index": "1",
          "backdrop-filter": `blur(${blurLevels()[0]}px)`,
          "-webkit-backdrop-filter": `blur(${blurLevels()[0]}px)`,
          "mask-image": getFirstLayerMask(),
          "-webkit-mask-image": getFirstLayerMask(),
        }}
      />

      <For each={divElements()}>
        {(_, index) => {
          const blurIndex = index() + 1;
          const maskGradient = getMaskGradient(blurIndex);

          return (
            <div
              class="absolute inset-0"
              style={{
                "z-index": `${index() + 2}`,
                "backdrop-filter": `blur(${blurLevels()[blurIndex]}px)`,
                "-webkit-backdrop-filter": `blur(${blurLevels()[blurIndex]}px)`,
                "mask-image": maskGradient,
                "-webkit-mask-image": maskGradient,
              }}
            />
          );
        }}
      </For>

      <div
        class="absolute inset-0"
        style={{
          "z-index": `${blurLevels().length}`,
          "backdrop-filter": `blur(${blurLevels()[blurLevels().length - 1]}px)`,
          "-webkit-backdrop-filter": `blur(${blurLevels()[blurLevels().length - 1]}px)`,
          "mask-image": getLastLayerMask(),
          "-webkit-mask-image": getLastLayerMask(),
        }}
      />

      {local.children}
    </div>
  );
};

export const meta: ComponentMeta<ProgressiveBlurProps> = {
  name: "Progressive Blur",
  description:
    "A progressive blur effect overlay that creates a smooth gradient blur transition. Perfect for fading content at the edges of scrollable areas or creating depth effects.",
  apiReference: "",
  examples: [
    {
      title: "Bottom Fade",
      description: "Blur effect fading from bottom",
      code: () => (
        <div class="relative h-96 overflow-hidden rounded-lg border bg-card">
          <div class="p-6 space-y-4">
            <h3 class="text-xl font-bold">Scrollable Content</h3>
            <p class="text-muted-foreground">
              This content has a progressive blur effect at the bottom, creating
              a smooth fade that indicates more content below.
            </p>
            <div class="space-y-2">
              {Array.from({ length: 20 }).map((_, i) => (
                <div class="p-3 rounded bg-muted">Item {i + 1}</div>
              ))}
            </div>
          </div>
          <ProgressiveBlur position="bottom" height="40%" />
        </div>
      ),
    },
    {
      title: "Top Fade",
      description: "Blur effect fading from top",
      code: () => (
        <div class="relative h-96 overflow-hidden rounded-lg border bg-card">
          <div class="p-6 space-y-4">
            <div class="space-y-2">
              {Array.from({ length: 20 }).map((_, i) => (
                <div class="p-3 rounded bg-muted">Item {i + 1}</div>
              ))}
            </div>
          </div>
          <ProgressiveBlur position="top" height="30%" />
        </div>
      ),
    },

    {
      title: "Custom Height",
      description: "Control the blur area height",
      code: () => (
        <div class="grid grid-cols-2 gap-4">
          <div class="relative h-64 overflow-hidden rounded-lg border bg-card">
            <div class="p-4 space-y-2">
              <h4 class="font-semibold mb-2">Small (20%)</h4>
              {Array.from({ length: 15 }).map((_, i) => (
                <div class="p-2 rounded bg-muted text-sm">Item {i + 1}</div>
              ))}
            </div>
            <ProgressiveBlur position="bottom" height="20%" />
          </div>
          <div class="relative h-64 overflow-hidden rounded-lg border bg-card">
            <div class="p-4 space-y-2">
              <h4 class="font-semibold mb-2">Large (50%)</h4>
              {Array.from({ length: 15 }).map((_, i) => (
                <div class="p-2 rounded bg-muted text-sm">Item {i + 1}</div>
              ))}
            </div>
            <ProgressiveBlur position="bottom" height="50%" />
          </div>
        </div>
      ),
    },
  ],
};

export default ProgressiveBlur;

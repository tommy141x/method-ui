import type { JSX, Component } from "solid-js";
import { createSignal, onCleanup, onMount } from "solid-js";
import { Progress as ArkProgress } from "@ark-ui/solid/progress";
import { cn } from "../lib/cn";
import type { ComponentMeta } from "../lib/meta";
import { cva, type VariantProps } from "class-variance-authority";

const progressVariants = cva("relative flex flex-col gap-3 w-full", {
  variants: {
    variant: {
      linear: "",
      circular: "",
    },
  },
  defaultVariants: {
    variant: "linear",
  },
});

type ProgressProps = {
  value?: number | null;
  defaultValue?: number | null;
  min?: number;
  max?: number;
  onValueChange?: (details: { value: number | null }) => void;
  id?: string;
  class?: string;
  label?: JSX.Element;
  showValue?: boolean;
  size?: number;
  thickness?: number;
  orientation?: "horizontal" | "vertical";
  translations?: {
    value?: (details: { value: number | null; max: number }) => string;
  };
} & VariantProps<typeof progressVariants>;

export const Progress: Component<ProgressProps> = (props) => {
  const variant = props.variant || "linear";
  const size = props.size || 120;
  const thickness = props.thickness || 12;
  const height = props.thickness || 8;

  return (
    <ArkProgress.Root
      value={props.value}
      defaultValue={props.defaultValue}
      min={props.min}
      max={props.max}
      onValueChange={props.onValueChange}
      orientation={props.orientation}
      translations={props.translations as any}
      id={props.id}
      class={cn(progressVariants({ variant }), props.class)}
      style={{
        "--size": `${size}px`,
        "--thickness": `${thickness}px`,
        "--height": `${height}px`,
      }}
    >
      {(props.label || props.showValue) && (
        <div class="flex items-center justify-between">
          {props.label && (
            <ArkProgress.Label class="text-sm font-medium leading-none">
              {props.label}
            </ArkProgress.Label>
          )}
          {props.showValue && (
            <ArkProgress.ValueText class="text-sm text-muted-foreground" />
          )}
        </div>
      )}
      {variant === "circular" ? (
        <div class="flex items-center justify-center">
          <div class="relative">
            <ArkProgress.Circle
              style={{
                width: "var(--size)",
                height: "var(--size)",
              }}
            >
              <ArkProgress.CircleTrack
                class="text-secondary"
                style={{
                  "--radius": `calc(var(--size) / 2 - var(--thickness) / 2)`,
                }}
                cx={`calc(var(--size) / 2)`}
                cy={`calc(var(--size) / 2)`}
                r="var(--radius)"
                fill="transparent"
                stroke="currentColor"
                stroke-width="var(--thickness)"
              />
              <ArkProgress.CircleRange
                class="text-primary"
                style={{
                  "--radius": `calc(var(--size) / 2 - var(--thickness) / 2)`,
                  "--circumference": "calc(2 * 3.14159 * var(--radius))",
                }}
                cx={`calc(var(--size) / 2)`}
                cy={`calc(var(--size) / 2)`}
                r="var(--radius)"
                fill="transparent"
                stroke="currentColor"
                stroke-width="var(--thickness)"
                stroke-linecap="round"
                stroke-dasharray="var(--circumference)"
                stroke-dashoffset="calc(var(--circumference) * (100 - var(--percent, 0)) / 100)"
                transform="rotate(-90deg)"
                transform-origin="center"
              />
            </ArkProgress.Circle>
            <ArkProgress.Context>
              {(context) => (
                <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div class="text-2xl font-bold text-primary">
                    {context().value !== null
                      ? `${Math.round(context().value ?? 0)}%`
                      : "..."}
                  </div>
                </div>
              )}
            </ArkProgress.Context>
          </div>
        </div>
      ) : (
        <ArkProgress.Context>
          {(context) => (
            <ArkProgress.Track
              class="relative w-full overflow-hidden rounded-full bg-secondary"
              style={{
                height: "var(--height)",
              }}
            >
              <ArkProgress.Range
                class="h-full bg-primary"
                style={{
                  width: `${context().percent}%`,
                }}
              />
            </ArkProgress.Track>
          )}
        </ArkProgress.Context>
      )}
    </ArkProgress.Root>
  );
};

export const meta: ComponentMeta<ProgressProps> = {
  name: "Progress",
  description:
    "A progress component for displaying completion status with linear and circular variants. Built on Ark UI Progress - all Ark UI Progress props are supported.",
  apiReference:
    "https://ark-ui.com/docs/components/progress-linear#api-reference",
  variants: progressVariants,
  examples: [
    {
      title: "Linear (Default)",
      description: "A linear progress bar with smooth animation",
      code: () => {
        const [progress, setProgress] = createSignal(0);

        onMount(() => {
          const interval = setInterval(() => {
            setProgress((prev) => {
              if (prev >= 100) return 0;
              return prev + 0.5;
            });
          }, 30);

          onCleanup(() => clearInterval(interval));
        });

        return (
          <Progress
            id="progress-linear"
            label="Loading"
            value={progress()}
            variant="linear"
          />
        );
      },
    },
    {
      title: "Circular",
      description: "A circular progress indicator with smooth animation",
      code: () => {
        const [progress, setProgress] = createSignal(0);

        onMount(() => {
          const interval = setInterval(() => {
            setProgress((prev) => {
              if (prev >= 100) return 0;
              return prev + 0.5;
            });
          }, 30);

          onCleanup(() => clearInterval(interval));
        });

        return (
          <Progress
            id="progress-circular"
            label="Loading"
            value={progress()}
            variant="circular"
          />
        );
      },
    },
    {
      title: "Custom Sizes",
      description: "Progress indicators with different sizes",
      code: () => {
        return (
          <div class="flex flex-col gap-6">
            <div class="flex flex-col gap-2">
              <div class="text-sm font-medium">Linear Variants</div>
              <Progress
                id="progress-linear-thin"
                label="Thin"
                value={45}
                variant="linear"
                thickness={4}
              />
              <Progress
                id="progress-linear-medium"
                label="Medium"
                value={65}
                variant="linear"
                thickness={8}
              />
              <Progress
                id="progress-linear-thick"
                label="Thick"
                value={85}
                variant="linear"
                thickness={12}
              />
            </div>
            <div class="flex gap-8 items-center">
              <div class="text-sm font-medium">Circular Variants</div>
              <Progress
                id="progress-circular-small"
                value={45}
                variant="circular"
                size={80}
                thickness={8}
              />
              <Progress
                id="progress-circular-medium"
                value={65}
                variant="circular"
                size={120}
                thickness={12}
              />
              <Progress
                id="progress-circular-large"
                value={85}
                variant="circular"
                size={160}
                thickness={16}
              />
            </div>
          </div>
        );
      },
    },
  ],
};

export default Progress;

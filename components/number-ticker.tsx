import type { JSX, Component } from "solid-js";
import {
  splitProps,
  createSignal,
  createEffect,
  onCleanup,
  Show,
} from "solid-js";
import { isServer } from "solid-js/web";
import { cn } from "../lib/cn";
import type { ComponentMeta } from "../lib/meta";

export interface NumberTickerProps {
  value: number;
  startValue?: number;
  direction?: "up" | "down";
  delay?: number;
  duration?: number;
  decimalPlaces?: number;
  ease?: number;
  reanimateOnScroll?: boolean;
  class?: string;
}

export const NumberTicker: Component<NumberTickerProps> = (props) => {
  const [local, others] = splitProps(props, [
    "value",
    "startValue",
    "direction",
    "delay",
    "duration",
    "decimalPlaces",
    "ease",
    "reanimateOnScroll",
    "class",
  ]);

  const startValue = () => local.startValue ?? 0;
  const direction = () => local.direction ?? "up";
  const delay = () => local.delay ?? 0;
  const duration = () => local.duration ?? 2000;
  const decimalPlaces = () => local.decimalPlaces ?? 0;
  const ease = () => Math.max(1, local.ease ?? 4);
  const reanimateOnScroll = () => local.reanimateOnScroll ?? false;

  const [displayValue, setDisplayValue] = createSignal(
    direction() === "down" ? local.value : startValue(),
  );
  const [hasStarted, setHasStarted] = createSignal(false);
  const [isMounted, setIsMounted] = createSignal(false);
  const [elementRef, setElementRef] = createSignal<HTMLSpanElement>();

  let observer: IntersectionObserver | undefined;
  let rafId: number | undefined;
  let animationStartTime: number | undefined;

  const easeOut = (t: number) => 1 - Math.pow(1 - t, ease());

  const animate = (timestamp: number) => {
    if (!animationStartTime) {
      animationStartTime = timestamp;
    }

    const elapsed = timestamp - animationStartTime;
    const progress = Math.min(elapsed / duration(), 1);
    const easedProgress = easeOut(progress);

    const start = direction() === "down" ? local.value : startValue();
    const end = direction() === "down" ? startValue() : local.value;
    const current = start + (end - start) * easedProgress;

    setDisplayValue(current);

    if (progress < 1) {
      rafId = requestAnimationFrame(animate);
    } else {
      rafId = undefined;
      animationStartTime = undefined;
    }
  };

  const startAnimation = () => {
    if (hasStarted() || isServer) return;

    setHasStarted(true);

    const delayMs = delay() * 1000;
    if (delayMs > 0) {
      setTimeout(() => {
        rafId = requestAnimationFrame(animate);
      }, delayMs);
    } else {
      rafId = requestAnimationFrame(animate);
    }
  };

  createEffect(() => {
    if (isServer) return;
    setIsMounted(true);
  });

  createEffect(() => {
    const element = elementRef();
    if (isServer || !isMounted() || !element) return;

    // Check if element is already visible
    const rect = element.getBoundingClientRect();
    const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;

    if (isInViewport) {
      // Element is already visible, start animation immediately
      startAnimation();
    }

    // Create intersection observer to detect when element enters viewport
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasStarted()) {
            startAnimation();
          } else if (!entry.isIntersecting && reanimateOnScroll()) {
            setHasStarted(false);
            setDisplayValue(
              direction() === "down" ? local.value : startValue(),
            );
            if (rafId) {
              cancelAnimationFrame(rafId);
              rafId = undefined;
              animationStartTime = undefined;
            }
          }
        });
      },
      { threshold: 0.1 },
    );

    observer.observe(element);

    return () => {
      if (observer && element) {
        observer.unobserve(element);
        observer.disconnect();
      }
    };
  });

  onCleanup(() => {
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
  });

  const formattedValue = () => {
    const value = displayValue();
    if (isNaN(value) || !isFinite(value)) {
      return "0";
    }
    return Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimalPlaces(),
      maximumFractionDigits: decimalPlaces(),
    }).format(Number(value.toFixed(decimalPlaces())));
  };

  return (
    <Show
      when={!isServer && isMounted()}
      fallback={
        <span
          class={cn("inline-block tabular-nums tracking-wider", local.class)}
          {...others}
        >
          {Intl.NumberFormat("en-US", {
            minimumFractionDigits: decimalPlaces(),
            maximumFractionDigits: decimalPlaces(),
          }).format(local.value)}
        </span>
      }
    >
      <span
        ref={setElementRef}
        class={cn("inline-block tabular-nums tracking-wider", local.class)}
        {...others}
      >
        {formattedValue()}
      </span>
    </Show>
  );
};

export const meta: ComponentMeta<NumberTickerProps> = {
  name: "Number Ticker",
  description:
    "An animated number counter that smoothly animates from a start value to an end value when it enters the viewport. Perfect for showcasing statistics and metrics.",
  apiReference: "",
  examples: [
    {
      title: "Basic",
      description: "Simple number counter animating upward",
      code: () => (
        <div class="flex flex-col items-center gap-4 p-8">
          <NumberTicker value={12345} class="text-4xl font-bold" />
          <p class="text-sm text-muted-foreground">
            Number animates when scrolled into view
          </p>
        </div>
      ),
    },
    {
      title: "Statistics Cards",
      description: "Number tickers showing various statistics",
      code: () => (
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="rounded-lg border border-border p-6 text-center">
            <div class="h-12 w-12 i-lucide-users mx-auto mb-3 text-blue-500" />
            <NumberTicker value={1234} class="text-3xl font-bold block mb-2" />
            <p class="text-sm text-muted-foreground">Total Users</p>
          </div>
          <div class="rounded-lg border border-border p-6 text-center">
            <div class="h-12 w-12 i-lucide-trending-up mx-auto mb-3 text-green-500" />
            <NumberTicker
              value={98.5}
              decimalPlaces={1}
              class="text-3xl font-bold block mb-2"
            />
            <p class="text-sm text-muted-foreground">Success Rate %</p>
          </div>
          <div class="rounded-lg border border-border p-6 text-center">
            <div class="h-12 w-12 i-lucide-activity mx-auto mb-3 text-purple-500" />
            <NumberTicker value={45678} class="text-3xl font-bold block mb-2" />
            <p class="text-sm text-muted-foreground">Active Sessions</p>
          </div>
        </div>
      ),
    },
    {
      title: "With Decimals",
      description: "Number ticker with decimal places",
      code: () => (
        <div class="flex flex-col items-center gap-4 p-8">
          <div class="text-center">
            <NumberTicker
              value={99.99}
              decimalPlaces={2}
              class="text-5xl font-bold"
            />
            <p class="text-sm text-muted-foreground mt-2">Price in USD</p>
          </div>
        </div>
      ),
    },
    {
      title: "Custom Duration & Ease",
      description: "Control animation speed and easing strength",
      code: () => (
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
          <div class="text-center">
            <p class="text-sm text-muted-foreground mb-2">Fast (1s)</p>
            <NumberTicker
              value={5000}
              duration={1000}
              class="text-4xl font-bold"
            />
          </div>
          <div class="text-center">
            <p class="text-sm text-muted-foreground mb-2">Slow (3s)</p>
            <NumberTicker
              value={5000}
              duration={3000}
              class="text-4xl font-bold"
            />
          </div>
          <div class="text-center">
            <p class="text-sm text-muted-foreground mb-2">
              Slow + Strong Ease (3s)
            </p>
            <NumberTicker
              value={5000}
              duration={3000}
              ease={8}
              class="text-4xl font-bold"
            />
          </div>
        </div>
      ),
    },
  ],
};

export default NumberTicker;

import type { JSX, Component } from "solid-js";
import {
  splitProps,
  createSignal,
  createEffect,
  onCleanup,
  Show,
} from "solid-js";
import { isServer } from "solid-js/web";
import { Motion } from "solid-motionone";
import { cn } from "../lib/cn";
import type { ComponentMeta } from "../lib/meta";

export interface BlurFadeProps extends JSX.HTMLAttributes<HTMLDivElement> {
  children: JSX.Element;
  class?: string;
  duration?: number;
  delay?: number;
  offset?: number;
  direction?: "up" | "down" | "left" | "right";
  inView?: boolean;
  inViewMargin?: string;
  blur?: string;
  trigger?: boolean;
}

export const BlurFade: Component<BlurFadeProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "duration",
    "delay",
    "offset",
    "direction",
    "inView",
    "inViewMargin",
    "blur",
    "trigger",
  ]);

  const duration = () => local.duration ?? 0.4;
  const delay = () => local.delay ?? 0;
  const offset = () => local.offset ?? 6;
  const direction = () => local.direction ?? "down";
  const inView = () => local.inView ?? true;
  const inViewMargin = () => local.inViewMargin ?? "-50px";
  const blur = () => local.blur ?? "6px";

  const [isVisible, setIsVisible] = createSignal(false);
  const [hasTriggered, setHasTriggered] = createSignal(false);
  const [elementRef, setElementRef] = createSignal<HTMLDivElement>();

  // Get initial transform values based on direction
  const getInitialTransform = () => {
    const offsetValue = offset();
    switch (direction()) {
      case "up":
        return { y: offsetValue };
      case "down":
        return { y: -offsetValue };
      case "left":
        return { x: offsetValue };
      case "right":
        return { x: -offsetValue };
      default:
        return { y: -offsetValue };
    }
  };

  const shouldAnimate = () =>
    local.trigger !== undefined ? local.trigger : isVisible();

  createEffect(() => {
    const element = elementRef();
    if (isServer || !element) return;

    // If using external trigger, don't use intersection observer
    if (local.trigger !== undefined) {
      return;
    }

    if (!inView()) {
      setIsVisible(true);
      setHasTriggered(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggered()) {
          setIsVisible(true);
          setHasTriggered(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: inViewMargin(),
        threshold: 0.1,
      },
    );

    observer.observe(element);

    onCleanup(() => {
      observer.disconnect();
    });
  });

  return (
    <Motion.div
      ref={setElementRef}
      class={cn("transform-gpu", local.class)}
      initial={{
        opacity: 0,
        filter: `blur(${blur()})`,
        ...getInitialTransform(),
      }}
      animate={
        shouldAnimate()
          ? {
              opacity: 1,
              filter: "blur(0px)",
              x: 0,
              y: 0,
            }
          : {
              opacity: 0,
              filter: `blur(${blur()})`,
              ...getInitialTransform(),
            }
      }
      transition={{
        duration: duration(),
        delay: delay() + 0.04,
        easing: "ease-out",
      }}
      {...others}
    >
      {local.children}
    </Motion.div>
  );
};

export const meta: ComponentMeta<BlurFadeProps> = {
  name: "Blur Fade",
  description:
    "An animation component that reveals elements with a blur and fade effect as they enter the viewport. Supports multiple directions and customizable timing.",
  apiReference: "",
  examples: [
    {
      title: "Basic",
      description: "Simple blur fade animation",
      code: () => (
        <div class="space-y-8 p-8">
          <BlurFade>
            <div class="rounded-lg bg-card p-6 border">
              <h3 class="text-xl font-bold mb-2">Fade In</h3>
              <p class="text-muted-foreground">
                This element fades in with a blur effect
              </p>
            </div>
          </BlurFade>
        </div>
      ),
    },
    {
      title: "Directions",
      description: "Different animation directions",
      code: () => (
        <div class="grid grid-cols-2 gap-4 p-8">
          <BlurFade direction="up">
            <div class="rounded-lg bg-primary/10 p-4 text-center">
              <div class="h-4 w-4 mx-auto mb-2 i-lucide-arrow-up" />
              <p class="text-sm font-medium">Up</p>
            </div>
          </BlurFade>
          <BlurFade direction="down">
            <div class="rounded-lg bg-primary/10 p-4 text-center">
              <div class="h-4 w-4 mx-auto mb-2 i-lucide-arrow-down" />
              <p class="text-sm font-medium">Down</p>
            </div>
          </BlurFade>
          <BlurFade direction="left">
            <div class="rounded-lg bg-primary/10 p-4 text-center">
              <div class="h-4 w-4 mx-auto mb-2 i-lucide-arrow-left" />
              <p class="text-sm font-medium">Left</p>
            </div>
          </BlurFade>
          <BlurFade direction="right">
            <div class="rounded-lg bg-primary/10 p-4 text-center">
              <div class="h-4 w-4 mx-auto mb-2 i-lucide-arrow-right" />
              <p class="text-sm font-medium">Right</p>
            </div>
          </BlurFade>
        </div>
      ),
    },
    {
      title: "Staggered",
      description: "Multiple elements with staggered delays",
      code: () => (
        <div class="space-y-4 p-8">
          <BlurFade delay={0}>
            <div class="rounded-lg bg-card border p-4">
              <p class="font-medium">First element (no delay)</p>
            </div>
          </BlurFade>
          <BlurFade delay={0.2}>
            <div class="rounded-lg bg-card border p-4">
              <p class="font-medium">Second element (0.2s delay)</p>
            </div>
          </BlurFade>
          <BlurFade delay={0.4}>
            <div class="rounded-lg bg-card border p-4">
              <p class="font-medium">Third element (0.4s delay)</p>
            </div>
          </BlurFade>
          <BlurFade delay={0.6}>
            <div class="rounded-lg bg-card border p-4">
              <p class="font-medium">Fourth element (0.6s delay)</p>
            </div>
          </BlurFade>
        </div>
      ),
    },
    {
      title: "Custom Timing",
      description: "Control duration and blur amount",
      code: () => (
        <div class="grid grid-cols-2 gap-4 p-8">
          <BlurFade duration={0.2} blur="2px">
            <div class="rounded-lg bg-card border p-4 text-center">
              <p class="text-sm font-medium mb-1">Fast & Subtle</p>
              <p class="text-xs text-muted-foreground">0.2s, 2px blur</p>
            </div>
          </BlurFade>
          <BlurFade duration={1.5} blur="20px">
            <div class="rounded-lg bg-card border p-4 text-center">
              <p class="text-sm font-medium mb-1">Slow & Dramatic</p>
              <p class="text-xs text-muted-foreground">1.5s, 20px blur</p>
            </div>
          </BlurFade>
        </div>
      ),
    },
    {
      title: "Card List",
      description: "Staggered card animations",
      code: () => (
        <div class="space-y-4 p-8 max-w-md">
          <BlurFade delay={0} direction="right">
            <div class="flex items-center gap-4 rounded-lg bg-card border p-4">
              <div class="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <div class="h-6 w-6 i-lucide-user" />
              </div>
              <div class="flex-1">
                <h4 class="font-semibold">John Doe</h4>
                <p class="text-sm text-muted-foreground">Software Engineer</p>
              </div>
            </div>
          </BlurFade>
          <BlurFade delay={0.15} direction="right">
            <div class="flex items-center gap-4 rounded-lg bg-card border p-4">
              <div class="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <div class="h-6 w-6 i-lucide-user" />
              </div>
              <div class="flex-1">
                <h4 class="font-semibold">Jane Smith</h4>
                <p class="text-sm text-muted-foreground">Product Designer</p>
              </div>
            </div>
          </BlurFade>
          <BlurFade delay={0.3} direction="right">
            <div class="flex items-center gap-4 rounded-lg bg-card border p-4">
              <div class="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <div class="h-6 w-6 i-lucide-user" />
              </div>
              <div class="flex-1">
                <h4 class="font-semibold">Bob Johnson</h4>
                <p class="text-sm text-muted-foreground">Marketing Manager</p>
              </div>
            </div>
          </BlurFade>
        </div>
      ),
    },
  ],
};

export default BlurFade;

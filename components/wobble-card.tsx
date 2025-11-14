import type { JSX, Component } from "solid-js";
import {
  splitProps,
  createSignal,
  createEffect,
  createMemo,
  onMount,
  onCleanup,
} from "solid-js";
import { cn } from "../lib/cn";
import type { ComponentMeta } from "../lib/meta";

export interface WobbleCardProps extends JSX.HTMLAttributes<HTMLElement> {
  children: JSX.Element;
  containerClass?: string;
  class?: string;
}

export const WobbleCard: Component<WobbleCardProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "containerClass",
    "class",
  ]);

  let cardRef: HTMLElement | undefined;
  const [mousePos, setMousePos] = createSignal({ x: 0, y: 0 });
  const [smoothPos, setSmoothPos] = createSignal({ x: 0, y: 0 });
  const [smoothScale, setSmoothScale] = createSignal(0.95);
  const [isHovering, setIsHovering] = createSignal(false);

  let rafId: number | undefined;

  const handleMouseMove = (e: MouseEvent) => {
    if (!cardRef) return;
    const rect = cardRef.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 20;
    const y = (e.clientY - rect.top - rect.height / 2) / 20;
    setMousePos({ x, y });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setMousePos({ x: 0, y: 0 });
  };

  const animate = () => {
    const target = mousePos();
    const current = smoothPos();
    const hovering = isHovering();

    const dampingFactor = hovering ? 0.15 : 0.08;
    const newX = current.x + (target.x - current.x) * dampingFactor;
    const newY = current.y + (target.y - current.y) * dampingFactor;

    setSmoothPos({ x: newX, y: newY });

    const targetScale = hovering ? 1.0 : 0.95;
    const currentScale = smoothScale();
    const newScale =
      currentScale + (targetScale - currentScale) * dampingFactor;
    setSmoothScale(newScale);

    const threshold = hovering ? 0.1 : 0.01;
    const scaleThreshold = 0.001;
    if (
      Math.abs(target.x - current.x) > threshold ||
      Math.abs(target.y - current.y) > threshold ||
      Math.abs(targetScale - currentScale) > scaleThreshold
    ) {
      rafId = requestAnimationFrame(animate);
    }
  };

  createEffect(() => {
    mousePos();
    isHovering();
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(animate);
  });

  onMount(() => {
    if (cardRef) {
      cardRef.addEventListener("mousemove", handleMouseMove);
      cardRef.addEventListener("mouseenter", handleMouseEnter);
      cardRef.addEventListener("mouseleave", handleMouseLeave);
    }
  });

  onCleanup(() => {
    if (cardRef) {
      cardRef.removeEventListener("mousemove", handleMouseMove);
      cardRef.removeEventListener("mouseenter", handleMouseEnter);
      cardRef.removeEventListener("mouseleave", handleMouseLeave);
    }
    if (rafId) cancelAnimationFrame(rafId);
  });

  const outerStyle = createMemo(() => {
    const pos = smoothPos();
    return {
      transform: `translate3d(${pos.x}px, ${pos.y}px, 0) scale3d(1, 1, 1)`,
      "clip-path": "inset(0)",
      "will-change": "transform",
    };
  });

  const innerStyle = createMemo(() => {
    const pos = smoothPos();
    const scale = smoothScale();
    return {
      transform: `translate3d(${-pos.x}px, ${-pos.y}px, 0) scale3d(${scale}, ${scale}, 1)`,
      width: "105%",
      height: "105%",
      "margin-left": "-2.5%",
      "margin-top": "-2.5%",
      "margin-right": "-2.5%",
      "margin-bottom": "-2.5%",
      position: "relative" as const,
      "transform-origin": "center center",
    };
  });

  return (
    <section
      ref={cardRef}
      class={cn(
        "mx-auto w-full bg-card relative rounded-2xl overflow-hidden cursor-default",
        local.containerClass,
      )}
      style={outerStyle()}
      {...others}
    >
      <div
        class="relative h-full sm:mx-0 sm:rounded-2xl overflow-hidden"
        style={{
          "background-image":
            "radial-gradient(88% 100% at top, hsl(var(--foreground) / 0.5), hsl(var(--foreground) / 0))",
          "box-shadow":
            "0 10px 32px hsl(var(--foreground) / 0.12), 0 1px 1px hsl(var(--foreground) / 0.05), 0 0 0 1px hsl(var(--foreground) / 0.05), 0 4px 6px hsl(var(--foreground) / 0.08), 0 24px 108px hsl(var(--foreground) / 0.10)",
          display: "flex",
          "flex-direction": "column",
        }}
      >
        <div class={cn("flex-1", local.class)} style={innerStyle()}>
          {local.children}
        </div>
      </div>
    </section>
  );
};

export const meta: ComponentMeta<WobbleCardProps> = {
  name: "Wobble Card",
  description:
    "An interactive card component that responds to mouse movement with smooth wobble animations. Features dynamic scaling and translation effects for an engaging user experience.",
  apiReference: "",
  examples: [
    {
      title: "Basic",
      description: "Simple wobble card with content",
      code: () => (
        <WobbleCard class="p-8" containerClass="max-w-md">
          <h3 class="text-2xl font-bold mb-2">Wobble Card</h3>
          <p class="text-muted-foreground">
            Move your mouse over this card to see the wobble effect in action.
          </p>
        </WobbleCard>
      ),
    },
    {
      title: "With Image",
      description: "Card with image content",
      code: () => (
        <WobbleCard class="p-0" containerClass="max-w-sm">
          <div class="aspect-video bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
            <div class="h-16 w-16 i-lucide-sparkles text-white" />
          </div>
          <div class="p-6">
            <h3 class="text-xl font-bold mb-2">Image Card</h3>
            <p class="text-sm text-muted-foreground">
              Wobble effect works great with images and mixed content.
            </p>
          </div>
        </WobbleCard>
      ),
    },
    {
      title: "Grid Layout",
      description: "Multiple wobble cards in a grid",
      code: () => (
        <div class="grid grid-cols-2 gap-4 max-w-2xl">
          <WobbleCard class="p-6" containerClass="h-48">
            <div class="h-10 w-10 mb-3 i-lucide-zap text-primary" />
            <h4 class="font-semibold mb-1">Fast</h4>
            <p class="text-sm text-muted-foreground">
              Lightning quick performance
            </p>
          </WobbleCard>
          <WobbleCard class="p-6" containerClass="h-48">
            <div class="h-10 w-10 mb-3 i-lucide-shield text-primary" />
            <h4 class="font-semibold mb-1">Secure</h4>
            <p class="text-sm text-muted-foreground">
              Built with security first
            </p>
          </WobbleCard>
          <WobbleCard class="p-6" containerClass="h-48">
            <div class="h-10 w-10 mb-3 i-lucide-palette text-primary" />
            <h4 class="font-semibold mb-1">Beautiful</h4>
            <p class="text-sm text-muted-foreground">Stunning visual design</p>
          </WobbleCard>
          <WobbleCard class="p-6" containerClass="h-48">
            <div class="h-10 w-10 mb-3 i-lucide-code text-primary" />
            <h4 class="font-semibold mb-1">Developer Friendly</h4>
            <p class="text-sm text-muted-foreground">Easy to integrate</p>
          </WobbleCard>
        </div>
      ),
    },
  ],
};

export default WobbleCard;

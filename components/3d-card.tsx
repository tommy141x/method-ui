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

export interface Card3DProps {
  children?: JSX.Element;
  class?: string;
  intensity?: "subtle" | "normal" | "strong";
  disabled?: boolean;
}

export const Card3D: Component<Card3DProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "intensity",
    "disabled",
  ]);

  const intensity = () => local.intensity ?? "normal";
  const disabled = () => local.disabled ?? false;

  let wrapperRef: HTMLDivElement | undefined;
  let rafId: number | undefined;
  let isPaused = true;

  const [mousePosition, setMousePosition] = createSignal({ x: 0, y: 0 });
  const [smoothPosition, setSmoothPosition] = createSignal({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = createSignal(false);
  const [isMounted, setIsMounted] = createSignal(false);

  const getIntensityValues = () => {
    const intensityMap = {
      subtle: { rotate: 8, translate: 10, scale: 1.02 },
      normal: { rotate: 15, translate: 20, scale: 1.05 },
      strong: { rotate: 25, translate: 30, scale: 1.08 },
    };
    return intensityMap[intensity()];
  };

  // Animation loop
  const animate = () => {
    if (isPaused) return;

    const target = mousePosition();
    const current = smoothPosition();
    const hovered = isHovered();
    const damping = hovered ? 0.15 : 0.08;

    const newX = current.x + (target.x - current.x) * damping;
    const newY = current.y + (target.y - current.y) * damping;

    setSmoothPosition({ x: newX, y: newY });

    // Check if we should continue - NEVER pause while hovered
    const threshold = 0.001;
    const diffX = Math.abs(target.x - current.x);
    const diffY = Math.abs(target.y - current.y);

    if (hovered || diffX > threshold || diffY > threshold) {
      rafId = requestAnimationFrame(animate);
    } else {
      isPaused = true;
      rafId = undefined;
    }
  };

  const resume = () => {
    if (!isPaused || isServer || !isMounted()) return;
    isPaused = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
    rafId = requestAnimationFrame(animate);
  };

  const pause = () => {
    isPaused = true;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = undefined;
    }
  };

  // Track mouse position
  const handleMouseMove = (e: MouseEvent) => {
    if (!wrapperRef || disabled()) return;

    const rect = wrapperRef.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => {
    if (disabled()) return;
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (disabled()) return;
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  };

  // Resume animation whenever tracked values change
  createEffect(() => {
    mousePosition();
    isHovered();
    resume();
  });

  createEffect(() => {
    if (!isServer) {
      setIsMounted(true);
    }
  });

  onCleanup(() => {
    pause();
  });

  const getTransform = () => {
    if (disabled()) return { transform: "scale(1)" };

    const pos = smoothPosition();
    const values = getIntensityValues();

    const rotateX = pos.y * values.rotate;
    const rotateY = -pos.x * values.rotate;
    const translateX = pos.x * values.translate;
    const translateY = -pos.y * values.translate;
    const scale = isHovered() ? values.scale : 1;

    return {
      transform: `
        perspective(1000px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        translateX(${translateX}px)
        translateY(${translateY}px)
        scale(${scale})
      `,
      transition: "box-shadow 0.2s ease-out",
    };
  };

  const getGlareOverlay = () => {
    const pos = smoothPosition();
    const glareX = (pos.x + 0.5) * 100;
    const glareY = (pos.y + 0.5) * 100;

    return {
      background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.9) 10%, rgba(255, 255, 255, 0.75) 20%, rgba(255, 255, 255, 0) 80%)`,
      opacity: isHovered() ? 0.6 : 0.4,
      transition: "opacity 0.2s ease-out",
    };
  };

  return (
    <Show
      when={!isServer && isMounted()}
      fallback={
        <div class={cn("rounded-2xl", local.class)} {...others}>
          {local.children}
        </div>
      }
    >
      <div
        ref={wrapperRef}
        class={cn("perspective-1000", local.class)}
        style={{ "transform-style": "preserve-3d" }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...others}
      >
        <div
          class="relative rounded-2xl transform-gpu will-change-transform"
          style={getTransform()}
        >
          {local.children}

          {/* Glare overlay */}
          <div
            class="pointer-events-none absolute inset-0 z-50 rounded-2xl mix-blend-overlay"
            style={getGlareOverlay()}
          />
        </div>
      </div>
    </Show>
  );
};

export const meta: ComponentMeta<Card3DProps> = {
  name: "3D Card",
  description:
    "An interactive 3D card component with mouse-tracking tilt and shine effects. SSR compatible with graceful fallback.",
  apiReference: "",
  examples: [
    {
      title: "Product Card",
      description: "3D card showcasing a product",
      code: () => (
        <div class="flex justify-center p-8">
          <Card3D intensity="normal" class="w-[400px]">
            <div class="rounded-2xl bg-card border border-border overflow-hidden">
              <div class="aspect-video bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                <div class="h-24 w-24 i-lucide-box text-white" />
              </div>
              <div class="p-6">
                <h3 class="text-xl font-bold mb-2">Premium Product</h3>
                <p class="text-muted-foreground mb-4">
                  Experience the next level of interaction with this premium 3D
                  card component.
                </p>
                <div class="flex items-center justify-between">
                  <span class="text-2xl font-bold">$99</span>
                  <button class="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </Card3D>
        </div>
      ),
    },
    {
      title: "Comet Effect",
      description: "Interactive card with tilt and shine effect",
      code: () => (
        <div class="flex justify-center p-8">
          <Card3D class="w-[350px]">
            <div class="rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-8 text-white">
              <h3 class="text-2xl font-bold mb-2">3D Card</h3>
              <p class="text-white/90 mb-4">
                Hover over this card to see the 3D tilt effect with a dynamic
                shine overlay.
              </p>
              <div class="flex gap-2">
                <div class="px-3 py-1 rounded-full bg-white/20 text-sm">
                  Interactive
                </div>
                <div class="px-3 py-1 rounded-full bg-white/20 text-sm">
                  3D Effect
                </div>
              </div>
            </div>
          </Card3D>
        </div>
      ),
    },
    {
      title: "Intensity Levels",
      description: "Different intensity levels for the 3D effect",
      code: () => (
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
          <Card3D intensity="subtle" class="w-full">
            <div class="rounded-2xl bg-blue-500 p-6 text-white text-center">
              <h4 class="text-lg font-bold mb-2">Subtle</h4>
              <p class="text-sm text-white/80">Minimal 3D effect</p>
            </div>
          </Card3D>
          <Card3D intensity="normal" class="w-full">
            <div class="rounded-2xl bg-green-500 p-6 text-white text-center">
              <h4 class="text-lg font-bold mb-2">Normal</h4>
              <p class="text-sm text-white/80">Balanced effect</p>
            </div>
          </Card3D>
          <Card3D intensity="strong" class="w-full">
            <div class="rounded-2xl bg-orange-500 p-6 text-white text-center">
              <h4 class="text-lg font-bold mb-2">Strong</h4>
              <p class="text-sm text-white/80">Dramatic effect</p>
            </div>
          </Card3D>
        </div>
      ),
    },
  ],
};

export { Card3D as ThreeDCard };
export default Card3D;

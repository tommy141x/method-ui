import type { JSX, Component } from "solid-js";
import {
  splitProps,
  createSignal,
  createEffect,
  onCleanup,
  Show,
} from "solid-js";
import { isServer } from "solid-js/web";
import { annotate } from "rough-notation";
import type { RoughAnnotation } from "rough-notation/lib/model";
import { cn } from "../lib/cn";
import type { ComponentMeta } from "../lib/meta";

type AnnotationType =
  | "underline"
  | "box"
  | "circle"
  | "highlight"
  | "strike-through"
  | "crossed-off"
  | "bracket";

export interface HighlighterProps {
  children?: JSX.Element;
  type?: AnnotationType;
  color?: string;
  strokeWidth?: number;
  animationDuration?: number;
  iterations?: number;
  padding?: number;
  multiline?: boolean;
  delay?: number;
  reanimateOnScroll?: boolean;
  class?: string;
}

export const Highlighter: Component<HighlighterProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "type",
    "color",
    "strokeWidth",
    "animationDuration",
    "iterations",
    "padding",
    "multiline",
    "delay",
    "reanimateOnScroll",
    "class",
  ]);

  const type = () => local.type ?? "highlight";
  const color = () => local.color ?? "#fbbf24";
  const strokeWidth = () => local.strokeWidth ?? 2;
  const animationDuration = () => local.animationDuration ?? 800;
  const iterations = () => local.iterations ?? 2;
  const padding = () => local.padding ?? 5;
  const multiline = () => local.multiline ?? true;
  const delay = () => local.delay ?? 0;
  const reanimateOnScroll = () => local.reanimateOnScroll ?? false;

  const [elementRef, setElementRef] = createSignal<HTMLSpanElement>();
  const [isVisible, setIsVisible] = createSignal(false);
  const [isMounted, setIsMounted] = createSignal(false);

  let annotation: RoughAnnotation | null = null;
  let observer: IntersectionObserver | undefined;

  const createAnnotation = () => {
    const element = elementRef();
    if (!element || annotation || isServer) return;

    annotation = annotate(element, {
      type: type(),
      color: color(),
      strokeWidth: strokeWidth(),
      animationDuration: animationDuration(),
      iterations: iterations(),
      padding: padding(),
      multiline: multiline(),
    });

    const delayMs = delay();
    if (delayMs > 0) {
      setTimeout(() => {
        annotation?.show();
      }, delayMs);
    } else {
      annotation.show();
    }
  };

  const removeAnnotation = () => {
    if (annotation) {
      annotation.remove();
      annotation = null;
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
      createAnnotation();
    }

    // Create intersection observer for viewport detection
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            createAnnotation();
          } else if (reanimateOnScroll()) {
            setIsVisible(false);
            removeAnnotation();
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
    removeAnnotation();
  });

  return (
    <Show
      when={!isServer && isMounted()}
      fallback={
        <span class={cn("relative inline-block", local.class)} {...others}>
          {local.children}
        </span>
      }
    >
      <span
        ref={setElementRef}
        class={cn("relative inline-block", local.class)}
        {...others}
      >
        {local.children}
      </span>
    </Show>
  );
};

export const meta: ComponentMeta<HighlighterProps> = {
  name: "Highlighter",
  description:
    "An animated text highlighter using rough-notation for hand-drawn style annotations. Supports various annotation types like highlight, underline, box, circle, and more.",
  apiReference: "https://roughnotation.com",
  examples: [
    {
      title: "Basic Highlight",
      description: "Simple text highlighting with CSS variable colors",
      code: () => (
        <div class="text-center p-8">
          <p class="text-xl">
            This is{" "}
            <Highlighter color="hsl(var(--muted))">
              highlighted text
            </Highlighter>{" "}
            with an{" "}
            <Highlighter type="underline" color="hsl(var(--primary))">
              underline
            </Highlighter>{" "}
            in a sentence.
          </p>
        </div>
      ),
    },
    {
      title: "Annotation Types",
      description: "Different annotation styles",
      code: () => (
        <div class="flex flex-col gap-6 p-8">
          <p class="text-lg">
            <Highlighter type="highlight" color="#fbbf24">
              Highlight
            </Highlighter>{" "}
            makes text stand out with a background color.
          </p>
          <p class="text-lg">
            <Highlighter type="underline" color="#3b82f6">
              Underline
            </Highlighter>{" "}
            draws a line beneath the text.
          </p>
          <p class="text-lg">
            <Highlighter type="box" color="#10b981">
              Box
            </Highlighter>{" "}
            surrounds the text with a rectangle.
          </p>
          <p class="text-lg">
            <Highlighter type="circle" color="#8b5cf6">
              Circle
            </Highlighter>{" "}
            draws a circle around short text.
          </p>
          <p class="text-lg">
            <Highlighter type="strike-through" color="#ef4444">
              Strike-through
            </Highlighter>{" "}
            crosses out the text.
          </p>
        </div>
      ),
    },
    {
      title: "Custom Styling",
      description: "Customize colors, stroke width, and animation",
      code: () => (
        <div class="flex flex-col gap-6 p-8">
          <p class="text-xl">
            <Highlighter
              type="highlight"
              color="#ec4899"
              strokeWidth={4}
              animationDuration={1200}
            >
              Bold pink highlight
            </Highlighter>
          </p>
          <p class="text-xl">
            <Highlighter
              type="underline"
              color="#06b6d4"
              strokeWidth={3}
              iterations={3}
            >
              Triple underline
            </Highlighter>
          </p>
          <p class="text-xl">
            <Highlighter
              type="box"
              color="#f97316"
              strokeWidth={2}
              padding={10}
            >
              Box with extra padding
            </Highlighter>
          </p>
        </div>
      ),
    },
    {
      title: "In Context",
      description: "Highlighting key points in content",
      code: () => (
        <div class="max-w-2xl mx-auto p-8">
          <h2 class="text-3xl font-bold mb-4">
            Why Choose{" "}
            <Highlighter type="highlight" color="#fbbf24">
              Method UI
            </Highlighter>
            ?
          </h2>
          <p class="text-lg mb-4">
            Method UI provides a comprehensive set of{" "}
            <Highlighter type="underline" color="#3b82f6">
              beautifully designed components
            </Highlighter>{" "}
            that are both{" "}
            <Highlighter type="box" color="#10b981">
              easy to use
            </Highlighter>{" "}
            and highly customizable.
          </p>
          <p class="text-lg">
            Built with{" "}
            <Highlighter type="circle" color="#8b5cf6">
              SolidJS
            </Highlighter>
            , it offers excellent performance and a great developer experience.
          </p>
        </div>
      ),
    },
  ],
};

export default Highlighter;

import type { JSX, Component } from "solid-js";
import {
  splitProps,
  createSignal,
  createMemo,
  createEffect,
  onCleanup,
  For,
  Show,
} from "solid-js";
import { isServer } from "solid-js/web";
import { cn } from "../lib/cn";
import type { ComponentMeta } from "../lib/meta";

export interface TextGenerateEffectProps {
  words: string;
  class?: string;
  duration?: number;
  stagger?: number;
  startDelay?: number;
  filter?: boolean;
}

export const TextGenerateEffect: Component<TextGenerateEffectProps> = (
  props,
) => {
  const [local, others] = splitProps(props, [
    "words",
    "class",
    "duration",
    "stagger",
    "startDelay",
    "filter",
  ]);

  const duration = () => local.duration ?? 500;
  const stagger = () => local.stagger ?? 200;
  const startDelay = () => local.startDelay ?? 250;
  const filter = () => local.filter ?? true;

  const wordsArray = createMemo(() => local.words.split(" "));
  const [visibleWords, setVisibleWords] = createSignal<boolean[]>(
    Array(wordsArray().length).fill(false),
  );
  const [isMounted, setIsMounted] = createSignal(false);
  const [elementRef, setElementRef] = createSignal<HTMLDivElement>();
  const [hasAnimated, setHasAnimated] = createSignal(false);

  let observer: IntersectionObserver | undefined;

  const startAnimation = () => {
    if (hasAnimated() || isServer) return;
    setHasAnimated(true);

    setTimeout(() => {
      wordsArray().forEach((_, i) => {
        setTimeout(() => {
          setVisibleWords((prev) => {
            const newVisibleWords = [...prev];
            newVisibleWords[i] = true;
            return newVisibleWords;
          });
        }, i * stagger());
      });
    }, startDelay());
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
      startAnimation();
    }

    // Create intersection observer for viewport detection
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated()) {
            startAnimation();
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
    if (observer) {
      observer.disconnect();
    }
  });

  return (
    <Show
      when={!isServer && isMounted()}
      fallback={
        <div class={cn("leading-snug tracking-wide", local.class)} {...others}>
          {local.words}
        </div>
      }
    >
      <div
        ref={setElementRef}
        class={cn("leading-snug tracking-wide", local.class)}
        {...others}
      >
        <For each={wordsArray()}>
          {(word, i) => (
            <span
              class="inline-block mr-1"
              style={{
                "will-change": "opacity, filter, transform",
                opacity: visibleWords()[i()] ? 1 : 0,
                transform: visibleWords()[i()]
                  ? "translateY(0px)"
                  : "translateY(10px)",
                filter:
                  filter() && !visibleWords()[i()] ? "blur(10px)" : "blur(0px)",
                transition: `opacity ${duration()}ms ease-out, transform ${duration()}ms ease-out, filter ${duration()}ms ease-out`,
              }}
            >
              {word}{" "}
            </span>
          )}
        </For>
      </div>
    </Show>
  );
};

export const meta: ComponentMeta<TextGenerateEffectProps> = {
  name: "Text Generate Effect",
  description:
    "A text animation component that reveals words sequentially with a smooth fade-in and blur effect. Perfect for hero sections and attention-grabbing headlines.",
  apiReference: "",
  examples: [
    {
      title: "Basic",
      description: "Simple text generation effect",
      code: () => (
        <div class="p-8">
          <TextGenerateEffect
            words="This text appears word by word with a smooth animation"
            class="text-2xl font-bold"
          />
        </div>
      ),
    },
    {
      title: "Hero Heading",
      description: "Large heading with text generation effect",
      code: () => (
        <div class="text-center p-8">
          <TextGenerateEffect
            words="Build beautiful interfaces with Method UI"
            class="text-4xl md:text-5xl font-bold"
          />
        </div>
      ),
    },
    {
      title: "Custom Timing",
      description: "Control animation speed and delays",
      code: () => (
        <div class="flex flex-col gap-8 p-8">
          <div>
            <p class="text-sm text-muted-foreground mb-2">
              Fast (100ms stagger)
            </p>
            <TextGenerateEffect
              words="Quick animation with short delays between words"
              class="text-xl font-semibold"
              stagger={100}
              duration={300}
            />
          </div>
          <div>
            <p class="text-sm text-muted-foreground mb-2">
              Slow (400ms stagger)
            </p>
            <TextGenerateEffect
              words="Slower animation with longer delays between words"
              class="text-xl font-semibold"
              stagger={400}
              duration={800}
            />
          </div>
        </div>
      ),
    },
    {
      title: "No Blur Filter",
      description: "Text generation without blur effect",
      code: () => (
        <div class="p-8">
          <TextGenerateEffect
            words="This animation appears without the blur effect for a simpler transition"
            class="text-2xl font-bold"
            filter={false}
          />
        </div>
      ),
    },
  ],
};

export default TextGenerateEffect;

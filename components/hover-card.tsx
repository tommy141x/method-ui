import { HoverCard as ArkHoverCard } from "@ark-ui/solid/hover-card";
import { Portal } from "solid-js/web";
import { ComponentProps, Show, JSX } from "solid-js";
import { Motion, Presence } from "solid-motionone";

type HoverCardProps = ComponentProps<typeof ArkHoverCard.RootProvider> & {
  content?: JSX.Element;
};

export const HoverCard = Object.assign(
  (props: HoverCardProps) => (
    <ArkHoverCard.RootProvider {...props}>
      {props.children}
      <Portal>
        <ArkHoverCard.Positioner>
          <ArkHoverCard.Content class="z-50 bg-transparent pointer-events-none" />
          <Presence>
            <Show when={props.value?.().open}>
              <Motion.div
                class="z-50 w-64 rounded-md border bg-white dark:bg-gray-800 p-4 shadow-md outline-none pointer-events-auto"
                animate={{ opacity: [0, 1], scale: [0.95, 1] }}
                exit={{ opacity: [1, 0], scale: [1, 0.95] }}
                transition={{ duration: 0.15, easing: "ease-in-out" }}
              >
                <ArkHoverCard.Arrow>
                  <ArkHoverCard.ArrowTip />
                </ArkHoverCard.Arrow>
                {props.content}
              </Motion.div>
            </Show>
          </Presence>
        </ArkHoverCard.Positioner>
      </Portal>
    </ArkHoverCard.RootProvider>
  ),
  {
    ...ArkHoverCard,
  },
);

export { useHoverCard } from "@ark-ui/solid/hover-card";

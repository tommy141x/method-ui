import { Dialog as ArkDialog } from "@ark-ui/solid";
import { Portal } from "solid-js/web";
import { type ComponentProps, Show, type JSX } from "solid-js";
import { Motion, Presence } from "solid-motionone";
import { Button } from "./button";

export const Dialog = Object.assign(
  (props: ComponentProps<typeof ArkDialog.RootProvider>) => (
    <ArkDialog.RootProvider {...props}>
      <Portal>
        <ArkDialog.Backdrop class="fixed inset-0 z-50 bg-transparent" />
        <Presence>
          <Show when={props.value?.().open}>
            <Motion.div
              class="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs pointer-events-none"
              animate={{ opacity: [0, 1] }}
              exit={{ opacity: [1, 0] }}
              transition={{ duration: 0.2, easing: "ease-in-out" }}
            />
          </Show>
        </Presence>
        <ArkDialog.Positioner class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <ArkDialog.Content
            asChild={(contentProps: any) => (
              <Presence>
                <Show when={props.value?.().open}>
                  <Motion.div
                    {...contentProps()}
                    class="relative w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-6 shadow-lg"
                    animate={{ opacity: [0, 1], scale: [0.95, 1] }}
                    exit={{ opacity: [1, 0], scale: [1, 0.95] }}
                    transition={{ duration: 0.3, easing: "ease-in-out" }}
                  >
                    {props.children}
                  </Motion.div>
                </Show>
              </Presence>
            )}
          />
        </ArkDialog.Positioner>
      </Portal>
    </ArkDialog.RootProvider>
  ),
  {
    ...ArkDialog,
    Title: (props: ComponentProps<typeof ArkDialog.Title>) => (
      <div class="flex justify-between items-center">
        <ArkDialog.Title
          class="text-lg font-semibold text-gray-900 dark:text-gray-100"
          {...props}
        />
        <ArkDialog.CloseTrigger>
          <Button variant="ghost" size="icon">
            ✕
          </Button>
        </ArkDialog.CloseTrigger>
      </div>
    ),
    Content: (props: ComponentProps<typeof ArkDialog.Description>) => (
      <ArkDialog.Description
        class="text-sm text-gray-500 dark:text-gray-400"
        {...props}
      />
    ),
  },
);

export { useDialog } from "@ark-ui/solid";

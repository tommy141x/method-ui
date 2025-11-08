import { FloatingPanel as ArkFloatingPanel } from "@ark-ui/solid/floating-panel";
import {
  type JSX,
  splitProps,
  createSignal,
  Show,
  type ParentProps,
} from "solid-js";
import { Portal } from "solid-js/web";
import { cn } from "../lib/cn";
import { icon } from "../lib/icon";
import type { ComponentMeta } from "../lib/meta";
import { Motion } from "solid-motionone";

interface FloatingPanelProps {
  children?: JSX.Element;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (details: { open: boolean }) => void;
  size?: { width: number; height: number };
  onSizeChange?: (details: { size: { width: number; height: number } }) => void;
  position?: { x: number; y: number };
  onPositionChange?: (details: { position: { x: number; y: number } }) => void;
  minSize?: { width: number; height: number };
  maxSize?: { width: number; height: number };
  defaultSize?: { width: number; height: number };
  defaultPosition?: { x: number; y: number };
  draggable?: boolean;
  resizable?: boolean;
  closeOnEscape?: boolean;
  allowOverflow?: boolean;
  gridSize?: number;
  persistRect?: boolean;
}

export const FloatingPanel = (props: FloatingPanelProps) => {
  return (
    <ArkFloatingPanel.Root {...props}>{props.children}</ArkFloatingPanel.Root>
  );
};

interface FloatingPanelTriggerProps {
  children?: JSX.Element;
  class?: string;
}

export const FloatingPanelTrigger = (props: FloatingPanelTriggerProps) => {
  const [local, others] = splitProps(props, ["class"]);

  return (
    <ArkFloatingPanel.Trigger
      class={cn(
        "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors",
        "bg-primary text-primary-foreground hover:bg-primary/90",
        "h-10 px-4 py-2",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        local.class,
      )}
      {...others}
    />
  );
};

interface FloatingPanelContentProps {
  children?: JSX.Element;
  class?: string;
  title?: string;
  showMinimize?: boolean;
  showMaximize?: boolean;
  showClose?: boolean;
  zIndex?: number;
  headerClass?: string;
}

export const FloatingPanelContent = (props: FloatingPanelContentProps) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "title",
    "showMinimize",
    "showMaximize",
    "showClose",
    "zIndex",
    "headerClass",
  ]);

  const [isMinimized, setIsMinimized] = createSignal(false);
  const [isMaximized, setIsMaximized] = createSignal(false);

  const showMinimize = () => local.showMinimize !== false;
  const showMaximize = () => local.showMaximize !== false;
  const showClose = () => local.showClose !== false;

  return (
    <ArkFloatingPanel.Context>
      {(context) => {
        // Reset states when panel closes
        const open = () => context().open;
        let wasOpen = open();

        // Track open state changes
        if (wasOpen && !open()) {
          setIsMinimized(false);
          setIsMaximized(false);
        }
        wasOpen = open();

        return (
          <Portal>
            <ArkFloatingPanel.Positioner
              style={{ "z-index": local.zIndex ?? 100 }}
            >
              <ArkFloatingPanel.Content
                class={cn(
                  "flex flex-col rounded-lg border border-border bg-background shadow-lg",
                  "data-[state=closed]:hidden",
                  "data-[maximized]:rounded-none",
                  local.class,
                )}
                {...others}
              >
                <ArkFloatingPanel.DragTrigger>
                  <ArkFloatingPanel.Header
                    class={cn(
                      "flex items-center justify-between border-b border-border px-4 py-3 bg-accent/50",
                      "data-[dragging]:cursor-move",
                      local.headerClass,
                    )}
                  >
                    <ArkFloatingPanel.Title class="text-lg font-semibold text-foreground">
                      {local.title || "Panel"}
                    </ArkFloatingPanel.Title>
                    <div class="flex items-center gap-1">
                      <Show when={showMinimize() && !isMaximized()}>
                        <Motion.button
                          onDblClick={(e) => e.stopPropagation()}
                          onClick={() => {
                            if (isMinimized()) {
                              setIsMinimized(false);
                              context().restore();
                            } else {
                              setIsMinimized(true);
                              context().minimize();
                            }
                          }}
                          animate={{
                            scale: isMinimized() ? [1, 1.2, 1] : 1,
                          }}
                          transition={{ duration: 0.3 }}
                          class={cn(
                            "inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                            "hover:bg-accent hover:text-accent-foreground",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          )}
                        >
                          <Motion.div
                            animate={{
                              rotate: isMinimized() ? 180 : 0,
                            }}
                            transition={{ duration: 0.2 }}
                            class={cn(
                              "h-4 w-4",
                              isMinimized() ? icon("square") : icon("minus"),
                            )}
                          />
                        </Motion.button>
                      </Show>
                      <Show when={showMaximize()}>
                        <Motion.button
                          onDblClick={(e) => e.stopPropagation()}
                          onClick={() => {
                            if (isMaximized()) {
                              setIsMaximized(false);
                              context().restore();
                            } else {
                              setIsMaximized(true);
                              context().maximize();
                            }
                          }}
                          animate={{
                            scale: isMaximized() ? [1, 1.2, 1] : 1,
                          }}
                          transition={{ duration: 0.3 }}
                          class={cn(
                            "inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                            "hover:bg-accent hover:text-accent-foreground",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          )}
                        >
                          <Motion.div
                            animate={{
                              scale: isMaximized() ? 0.8 : 1,
                            }}
                            transition={{ duration: 0.2 }}
                            class={cn(
                              "h-4 w-4",
                              isMaximized()
                                ? icon("minimize-2")
                                : icon("maximize-2"),
                            )}
                          />
                        </Motion.button>
                      </Show>
                      <Show when={showClose()}>
                        <ArkFloatingPanel.CloseTrigger
                          class={cn(
                            "inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                            "hover:bg-destructive/10 hover:text-destructive",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          )}
                        >
                          <div class={cn("h-4 w-4", icon("x"))} />
                        </ArkFloatingPanel.CloseTrigger>
                      </Show>
                    </div>
                  </ArkFloatingPanel.Header>
                </ArkFloatingPanel.DragTrigger>
                <ArkFloatingPanel.Body
                  class={cn(
                    "flex-1 overflow-auto p-4",
                    "data-[minimized]:hidden",
                  )}
                >
                  {local.children}
                </ArkFloatingPanel.Body>
                <Show
                  when={
                    local.showMaximize !== false || local.showMinimize !== false
                  }
                >
                  <ArkFloatingPanel.ResizeTrigger
                    axis="n"
                    class="absolute top-0 left-0 right-0 h-1 cursor-ns-resize z-10 hover:bg-primary/20 transition-colors"
                  />
                  <ArkFloatingPanel.ResizeTrigger
                    axis="e"
                    class="absolute top-0 right-0 bottom-0 w-1 cursor-ew-resize z-10 hover:bg-primary/20 transition-colors"
                  />
                  <ArkFloatingPanel.ResizeTrigger
                    axis="w"
                    class="absolute top-0 left-0 bottom-0 w-1 cursor-ew-resize z-10 hover:bg-primary/20 transition-colors"
                  />
                  <ArkFloatingPanel.ResizeTrigger
                    axis="s"
                    class="absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize z-10 hover:bg-primary/20 transition-colors"
                  />
                  <ArkFloatingPanel.ResizeTrigger
                    axis="ne"
                    class="absolute top-0 right-0 h-3 w-3 cursor-ne-resize z-10 hover:bg-primary/20 transition-colors"
                  />
                  <ArkFloatingPanel.ResizeTrigger
                    axis="se"
                    class="absolute bottom-0 right-0 h-3 w-3 cursor-se-resize z-10 hover:bg-primary/20 transition-colors"
                  />
                  <ArkFloatingPanel.ResizeTrigger
                    axis="sw"
                    class="absolute bottom-0 left-0 h-3 w-3 cursor-sw-resize z-10 hover:bg-primary/20 transition-colors"
                  />
                  <ArkFloatingPanel.ResizeTrigger
                    axis="nw"
                    class="absolute top-0 left-0 h-3 w-3 cursor-nw-resize z-10 hover:bg-primary/20 transition-colors"
                  />
                </Show>
              </ArkFloatingPanel.Content>
            </ArkFloatingPanel.Positioner>
          </Portal>
        );
      }}
    </ArkFloatingPanel.Context>
  );
};

export const meta: ComponentMeta<FloatingPanelProps> = {
  name: "FloatingPanel",
  description:
    "A draggable and resizable floating panel component. Perfect for chat windows, notifications, or any floating UI elements that need to be movable and adjustable.",
  examples: [
    {
      title: "Basic Floating Panel",
      description: "A simple floating panel with drag and resize capabilities",
      code: () => (
        <FloatingPanel defaultOpen={false}>
          <FloatingPanelTrigger>Open Panel</FloatingPanelTrigger>
          <FloatingPanelContent title="Floating Panel">
            <p class="text-sm text-muted-foreground">
              This is a draggable and resizable floating panel. You can drag it
              by the header and resize it from any edge or corner.
            </p>
          </FloatingPanelContent>
        </FloatingPanel>
      ),
    },
    {
      title: "Chat Window Style",
      description: "A floating panel styled as a chat window",
      code: () => (
        <FloatingPanel
          defaultOpen={false}
          defaultSize={{ width: 360, height: 480 }}
          minSize={{ width: 300, height: 400 }}
        >
          <FloatingPanelTrigger>Open Chat</FloatingPanelTrigger>
          <FloatingPanelContent
            title="Support Chat"
            headerClass="bg-primary/5"
            zIndex={150}
          >
            <div class="flex flex-col gap-3">
              <div class="flex gap-2">
                <div class="h-8 w-8 rounded-full bg-muted shrink-0" />
                <div class="bg-muted rounded-lg px-3 py-2 text-sm">
                  Hello! How can I help you today?
                </div>
              </div>
              <div class="flex gap-2 flex-row-reverse">
                <div class="h-8 w-8 rounded-full bg-primary shrink-0" />
                <div class="bg-primary text-primary-foreground rounded-lg px-3 py-2 text-sm">
                  I need help with my account
                </div>
              </div>
            </div>
          </FloatingPanelContent>
        </FloatingPanel>
      ),
    },
    {
      title: "Fixed Size Panel",
      description: "A panel with a fixed size (no resizing)",
      code: () => (
        <FloatingPanel
          defaultOpen={false}
          resizable={false}
          defaultSize={{ width: 400, height: 300 }}
        >
          <FloatingPanelTrigger>Open Notification</FloatingPanelTrigger>
          <FloatingPanelContent
            title="Notifications"
            showMinimize={false}
            showMaximize={false}
            zIndex={200}
          >
            <div class="space-y-3">
              <div class="flex gap-3 p-2 rounded-md hover:bg-accent">
                <div class="h-2 w-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                <div>
                  <p class="text-sm font-medium">New message</p>
                  <p class="text-xs text-muted-foreground">
                    You have a new message from John
                  </p>
                </div>
              </div>
              <div class="flex gap-3 p-2 rounded-md hover:bg-accent">
                <div class="h-2 w-2 rounded-full bg-green-500 mt-2 shrink-0" />
                <div>
                  <p class="text-sm font-medium">Task completed</p>
                  <p class="text-xs text-muted-foreground">
                    Your export is ready to download
                  </p>
                </div>
              </div>
            </div>
          </FloatingPanelContent>
        </FloatingPanel>
      ),
    },
  ],
};

export default FloatingPanel;

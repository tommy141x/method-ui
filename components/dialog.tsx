import { Dialog as ArkDialog } from "@ark-ui/solid";
import {
  type JSX,
  splitProps,
  createSignal,
  mergeProps,
  createEffect,
  children as resolveChildren,
  Show,
} from "solid-js";
import { Portal } from "solid-js/web";
import { Dynamic } from "solid-js/web";
import { Motion, Presence } from "solid-motionone";
import { cn } from "../lib/cn";
import { icon } from "../lib/icon";
import type { ComponentMeta } from "../lib/meta";
import { Button, buttonVariants } from "./button";

/**
 * Helper to create dialog state for controlled dialogs.
 * This is necessary for proper SSR hydration in SolidStart.
 *
 * @example
 * const dialog = createDialogState();
 * return (
 *   <Dialog open={dialog.isOpen()} onOpenChange={(e) => dialog.setOpen(e.open)}>
 *     <Button onClick={dialog.open}>Open Dialog</Button>
 *     <DialogContent>...</DialogContent>
 *   </Dialog>
 * );
 */
export function createDialogState() {
  const [open, setOpen] = createSignal(false);

  return {
    open: () => setOpen(true),
    close: () => setOpen(false),
    toggle: () => setOpen(!open()),
    isOpen: open,
    setOpen,
  };
}

interface DialogProps {
  children?: JSX.Element;
  open?: boolean;
  onOpenChange?: (details: { open: boolean }) => void;
  closeOnInteractOutside?: boolean;
  closeOnEscape?: boolean;
  modal?: boolean;
  role?: "dialog" | "alertdialog";
  preventScroll?: boolean;
  trapFocus?: boolean;
  lazyMount?: boolean;
  unmountOnExit?: boolean;
  initialFocusEl?: () => HTMLElement | null;
  finalFocusEl?: () => HTMLElement | null;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onInteractOutside?: (event: any) => void;
}

export const Dialog = (props: DialogProps) => {
  // Use defaultOpen for uncontrolled dialogs to ensure proper initialization
  const merged = mergeProps({ defaultOpen: false }, props);
  return <ArkDialog.Root {...merged}>{merged.children}</ArkDialog.Root>;
};

interface DialogTriggerProps {
  children?: JSX.Element;
}

/**
 * DialogTrigger - Wrapper for dialog trigger elements
 *
 * IMPORTANT SSR HYDRATION FIX:
 *
 * This component uses a workaround for a hydration issue in SolidStart with Ark UI's Dialog.Trigger.
 *
 * THE PROBLEM:
 * - When using <ArkDialog.Trigger> directly with children that have onClick handlers (like <Button>),
 *   the click event doesn't work on first page load after SSR
 * - The Dialog.Context render prop doesn't execute during hydration, so event handlers don't attach
 * - Only after a re-render (like switching tabs) does it start working
 *
 * THE SOLUTION:
 * - Wrap children in a <div> with display:contents (invisible, doesn't affect layout)
 * - Put the onClick handler on the wrapper div instead of relying on Ark UI's trigger
 * - Manually call context().setOpen(true) to open the dialog
 * - This ensures the click handler is attached on first render, even during SSR hydration
 *
 * WHY IT WORKS:
 * - Plain divs with onClick handlers hydrate correctly in SolidStart
 * - Children (like Button components) render normally without onClick conflicts
 * - The wrapper intercepts all clicks and delegates to the dialog context
 * - display:contents makes the wrapper invisible in the DOM tree
 *
 * DO NOT:
 * - Replace this with <ArkDialog.Trigger> directly wrapping Button components
 * - Remove the wrapper div or display:contents styling
 * - Try to clone/modify children props (doesn't work in Solid's reactivity model)
 */
export const DialogTrigger = (props: DialogTriggerProps) => {
  const resolved = resolveChildren(() => props.children);

  return (
    <ArkDialog.Context>
      {(context) => {
        return (
          <div
            onClick={() => context().setOpen(true)}
            style={{ display: "contents" }}
          >
            {resolved()}
          </div>
        );
      }}
    </ArkDialog.Context>
  );
};

interface DialogContentProps {
  children?: JSX.Element;
  class?: string;
}

export const DialogContent = (props: DialogContentProps) => {
  const [local, others] = splitProps(props, ["children", "class"]);

  return (
    <Portal>
      <ArkDialog.Context>
        {(context) => {
          const isOpen = () => context().open;

          return (
            <Presence exitBeforeEnter>
              <Show when={isOpen()}>
                <Motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, easing: "ease-out" }}
                  class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
                />
              </Show>
            </Presence>
          );
        }}
      </ArkDialog.Context>

      <ArkDialog.Positioner class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <ArkDialog.Context>
          {(context) => {
            const isOpen = () => context().open;

            return (
              <Presence exitBeforeEnter>
                <Show when={isOpen()}>
                  <Motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{
                      duration: 0.3,
                      easing: [0.16, 1, 0.3, 1], // Custom easing for smooth spring-like effect
                    }}
                  >
                    <ArkDialog.Content
                      class={cn(
                        "relative w-full max-w-lg rounded-lg bg-background border border-border p-6 shadow-lg",
                        local.class,
                      )}
                      {...others}
                    >
                      <DialogCloseTrigger />
                      {local.children}
                    </ArkDialog.Content>
                  </Motion.div>
                </Show>
              </Presence>
            );
          }}
        </ArkDialog.Context>
      </ArkDialog.Positioner>
    </Portal>
  );
};

interface DialogTitleProps {
  children?: JSX.Element;
  class?: string;
}

export const DialogTitle = (props: DialogTitleProps) => {
  const [local, others] = splitProps(props, ["class"]);

  return (
    <ArkDialog.Title
      class={cn("text-lg font-semibold text-foreground", local.class)}
      {...others}
    />
  );
};

interface DialogDescriptionProps {
  children?: JSX.Element;
  class?: string;
}

export const DialogDescription = (props: DialogDescriptionProps) => {
  const [local, others] = splitProps(props, ["class"]);

  return (
    <ArkDialog.Description
      class={cn("text-sm text-muted-foreground mt-2", local.class)}
      {...others}
    />
  );
};

interface DialogCloseTriggerProps {
  children?: JSX.Element;
  class?: string;
}

export const DialogCloseTrigger = (props: DialogCloseTriggerProps) => {
  const [local, others] = splitProps(props, ["children", "class"]);

  return (
    <ArkDialog.CloseTrigger
      class={cn(
        "absolute right-6 top-6 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none",
        local.class,
      )}
      {...others}
    >
      {local.children || (
        <>
          <div class={cn("h-4 w-4", icon("x"))} />
          <span class="sr-only">Close</span>
        </>
      )}
    </ArkDialog.CloseTrigger>
  );
};

interface DialogFooterProps {
  children?: JSX.Element;
  class?: string;
}

export const DialogFooter = (props: DialogFooterProps) => {
  return (
    <div
      class={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2 mt-6",
        props.class,
      )}
    >
      {props.children}
    </div>
  );
};

// Import components for examples only - won't count as dependencies
// since they're imported after component definitions
import { Input } from "./input";
import { Badge } from "./badge";

interface DialogCloseProps {
  children?: JSX.Element;
}

export const DialogClose = (props: DialogCloseProps) => {
  return <ArkDialog.CloseTrigger>{props.children}</ArkDialog.CloseTrigger>;
};

export const meta: ComponentMeta<DialogProps> = {
  name: "Dialog",
  description:
    "A modal dialog component with composable parts. Uses Ark UI for accessibility and focus management.",
  examples: [
    {
      title: "Basic Dialog",
      description: "A simple dialog with trigger, title and description",
      code: () => (
        <Dialog>
          <DialogTrigger>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>
              Dialog Title
              <Badge variant="secondary" class="ml-2">
                New
              </Badge>
            </DialogTitle>
            <DialogDescription>
              This is a basic dialog with a title and description.
            </DialogDescription>
            <DialogFooter>
              <DialogClose>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ),
    },
    {
      title: "Controlled Dialog",
      description: "Control dialog state externally",
      code: () => {
        const dialog = createDialogState();
        return (
          <>
            <Button onClick={dialog.open}>Open Dialog</Button>
            <Dialog
              open={dialog.isOpen()}
              onOpenChange={(e) => dialog.setOpen(e.open)}
            >
              <DialogContent>
                <DialogTitle>Controlled Dialog</DialogTitle>
                <DialogDescription>
                  This dialog is controlled by external state using the
                  createDialogState helper.
                </DialogDescription>
                <DialogFooter>
                  <Button variant="outline" onClick={dialog.close}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        );
      },
    },
    {
      title: "Dialog with Form",
      description: "Dialog containing form elements",
      code: () => (
        <Dialog>
          <DialogTrigger>
            <Button>Edit Profile</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
            <div class="space-y-4 my-4">
              <div class="space-y-2">
                <label class="text-sm font-medium">Name</label>
                <Input type="text" placeholder="Enter your name" />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium">Email</label>
                <Input type="email" placeholder="Enter your email" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ),
    },
  ],
};

export default Dialog;

import type { ClassValue } from "clsx";
import clsx from "clsx";
import type { Accessor, Component, ComponentProps, JSX } from "solid-js";
import {
  createContext,
  createEffect,
  createSignal,
  createUniqueId,
  mergeProps,
  onCleanup,
  onMount,
  Show,
  splitProps,
  useContext,
} from "solid-js";
import { isServer, Portal } from "solid-js/web";
import { Motion, Presence } from "solid-motionone";
import { unoMerge } from "unocss-merge";

// Hardcoded cn function - makes this component completely self-contained
function cn(...classLists: ClassValue[]) {
  return unoMerge(clsx(classLists));
}

// Icon helper function - returns UnoCSS icon class for your configured icon library
function icon(name: string): string {
  return `i-lucide-${name}`;
}

// Types
type Orientation = "horizontal" | "vertical";
type Direction = "ltr" | "rtl";

interface NavMenuContextValue {
  value: Accessor<string>;
  setValue: (value: string) => void;
  orientation: Accessor<Orientation>;
  dir: Accessor<Direction>;
  baseId: string;
  isOpenDelayed: Accessor<boolean>;
  onTriggerEnter: (itemValue: string) => void;
  onTriggerLeave: () => void;
  onContentEnter: () => void;
  onContentLeave: () => void;
  onItemSelect: (itemValue: string) => void;
  viewport: Accessor<HTMLElement | null>;
  setViewport: (element: HTMLElement | null) => void;
  registerContent: (value: string, element: HTMLElement) => void;
  unregisterContent: (value: string) => void;
  getTriggerElement: (value: string) => HTMLElement | null;
  registerTrigger: (value: string, element: HTMLElement) => void;
}

const NavMenuContext = createContext<NavMenuContextValue>();

const useNavMenu = () => {
  const context = useContext(NavMenuContext);
  if (!context) {
    throw new Error(
      "NavMenu components must be used within a NavMenu component",
    );
  }
  return context;
};

interface NavMenuItemContextValue {
  value: string;
  isOpen: Accessor<boolean>;
}

const NavMenuItemContext = createContext<NavMenuItemContextValue>();

const useNavMenuItem = () => {
  const context = useContext(NavMenuItemContext);
  if (!context) {
    throw new Error(
      "NavMenuItem child components must be used within a NavMenuItem component",
    );
  }
  return context;
};

/* -------------------------------------------------------------------------------------------------
 * NavMenu (Root)
 * -----------------------------------------------------------------------------------------------*/

interface NavMenuProps {
  children?: JSX.Element;
  class?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: Orientation;
  dir?: Direction;
  delayDuration?: number;
  skipDelayDuration?: number;
  viewport?: boolean;
}

export const NavMenu: Component<NavMenuProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "value",
    "defaultValue",
    "onValueChange",
    "orientation",
    "dir",
    "delayDuration",
    "skipDelayDuration",
    "viewport",
  ]);

  const merged = mergeProps(
    {
      orientation: "horizontal" as Orientation,
      dir: "ltr" as Direction,
      delayDuration: 200,
      skipDelayDuration: 300,
      defaultValue: "",
      viewport: true,
    },
    local,
  );

  const [internalValue, setInternalValue] = createSignal(
    merged.defaultValue || "",
  );
  const [isOpenDelayed, setIsOpenDelayed] = createSignal(true);
  const [viewportElement, setViewportElement] =
    createSignal<HTMLElement | null>(null);

  const openTimerRef: { current: number } = { current: 0 };
  const closeTimerRef: { current: number } = { current: 0 };
  const skipDelayTimerRef: { current: number } = { current: 0 };

  const triggerElements = new Map<string, HTMLElement>();
  const contentElements = new Map<string, HTMLElement>();

  const value = () => local.value ?? internalValue();

  const setValue = (newValue: string) => {
    if (isServer) return;

    const isOpen = newValue !== "";
    const hasSkipDelayDuration = merged.skipDelayDuration > 0;

    if (isOpen) {
      window.clearTimeout(skipDelayTimerRef.current);
      if (hasSkipDelayDuration) setIsOpenDelayed(false);
    } else {
      window.clearTimeout(skipDelayTimerRef.current);
      skipDelayTimerRef.current = window.setTimeout(
        () => setIsOpenDelayed(true),
        merged.skipDelayDuration,
      );
    }

    if (local.onValueChange) {
      local.onValueChange(newValue);
    } else {
      setInternalValue(newValue);
    }
  };

  const startCloseTimer = () => {
    if (isServer) return;
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => setValue(""), 150);
  };

  const handleOpen = (itemValue: string) => {
    if (isServer) return;
    window.clearTimeout(closeTimerRef.current);
    setValue(itemValue);
  };

  const handleDelayedOpen = (itemValue: string) => {
    if (isServer) return;
    const isOpenItem = value() === itemValue;
    if (isOpenItem) {
      window.clearTimeout(closeTimerRef.current);
    } else {
      openTimerRef.current = window.setTimeout(() => {
        window.clearTimeout(closeTimerRef.current);
        setValue(itemValue);
      }, merged.delayDuration);
    }
  };

  const onTriggerEnter = (itemValue: string) => {
    if (isServer) return;
    window.clearTimeout(openTimerRef.current);
    window.clearTimeout(closeTimerRef.current); // Cancel any pending close

    // If there's already an open dropdown, switch immediately (no delay)
    if (value() !== "") {
      handleOpen(itemValue);
    } else if (isOpenDelayed()) {
      handleDelayedOpen(itemValue);
    } else {
      handleOpen(itemValue);
    }
  };

  const onTriggerLeave = () => {
    if (isServer) return;
    window.clearTimeout(openTimerRef.current);
    // Start close timer - will be cancelled if user enters content or another trigger
    startCloseTimer();
  };

  const onContentEnter = () => {
    if (isServer) return;
    window.clearTimeout(closeTimerRef.current);
  };

  const onContentLeave = () => {
    if (isServer) return;
    startCloseTimer();
  };

  onCleanup(() => {
    if (!isServer) {
      window.clearTimeout(openTimerRef.current);
      window.clearTimeout(closeTimerRef.current);
      window.clearTimeout(skipDelayTimerRef.current);
    }
  });

  const baseId = createUniqueId();

  const contextValue: NavMenuContextValue = {
    value,
    setValue,
    orientation: () => merged.orientation,
    dir: () => merged.dir,
    baseId,
    isOpenDelayed,
    onTriggerEnter,
    onTriggerLeave,
    onContentEnter,
    onContentLeave,
    onItemSelect: (itemValue: string) => {
      const currentValue = value();
      setValue(currentValue === itemValue ? "" : itemValue);
    },
    viewport: viewportElement,
    setViewport: setViewportElement,
    registerContent: (val: string, el: HTMLElement) =>
      contentElements.set(val, el),
    unregisterContent: (val: string) => contentElements.delete(val),
    getTriggerElement: (val: string) => triggerElements.get(val) || null,
    registerTrigger: (val: string, el: HTMLElement) =>
      triggerElements.set(val, el),
  };

  return (
    <NavMenuContext.Provider value={contextValue}>
      <nav
        data-orientation={merged.orientation}
        dir={merged.dir}
        data-state={value() ? "open" : "closed"}
        class={cn(
          "relative z-10 flex max-w-max flex-1 items-center justify-center",
          local.class,
        )}
        {...others}
      >
        {local.children}
        {merged.viewport && <NavMenuViewport />}
      </nav>
    </NavMenuContext.Provider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * NavMenuList
 * -----------------------------------------------------------------------------------------------*/

interface NavMenuListProps {
  children?: JSX.Element;
  class?: string;
}

export const NavMenuList: Component<NavMenuListProps> = (props) => {
  const [local, others] = splitProps(props, ["children", "class"]);
  const context = useNavMenu();

  return (
    <ul
      data-orientation={context.orientation()}
      class={cn(
        "group flex flex-1 list-none items-center justify-center gap-1",
        local.class,
      )}
      {...others}
    >
      {local.children}
    </ul>
  );
};

/* -------------------------------------------------------------------------------------------------
 * NavMenuItem
 * -----------------------------------------------------------------------------------------------*/

interface NavMenuItemProps {
  children?: JSX.Element;
  class?: string;
  value?: string;
}

export const NavMenuItem: Component<NavMenuItemProps> = (props) => {
  const [local, others] = splitProps(props, ["children", "class", "value"]);
  const context = useNavMenu();

  const autoValue = createUniqueId();
  const itemValue = local.value || autoValue;

  const isOpen = () => context.value() === itemValue;

  const itemContext: NavMenuItemContextValue = {
    value: itemValue,
    isOpen,
  };

  return (
    <NavMenuItemContext.Provider value={itemContext}>
      <li class={cn("relative", local.class)} {...others}>
        {local.children}
      </li>
    </NavMenuItemContext.Provider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * NavMenuTrigger
 * -----------------------------------------------------------------------------------------------*/

interface NavMenuTriggerProps {
  children?: JSX.Element;
  class?: string;
  disabled?: boolean;
  onClick?: (e: MouseEvent) => void;
  onPointerEnter?: (e: PointerEvent) => void;
  onPointerMove?: (e: PointerEvent) => void;
  onPointerLeave?: (e: PointerEvent) => void;
}

export const NavMenuTrigger: Component<NavMenuTriggerProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "disabled",
    "onClick",
    "onPointerEnter",
    "onPointerMove",
    "onPointerLeave",
  ]);

  const context = useNavMenu();
  const itemContext = useNavMenuItem();

  let triggerRef: HTMLButtonElement | undefined;
  const hasPointerMoveOpenedRef = { current: false };
  const wasClickCloseRef = { current: false };

  onMount(() => {
    if (triggerRef) {
      context.registerTrigger(itemContext.value, triggerRef);
    }
  });

  const triggerId = `navbar-${context.baseId}-trigger-${itemContext.value}`;
  const contentId = `navbar-${context.baseId}-content-${itemContext.value}`;

  const whenMouse = (handler: (e: PointerEvent) => void) => {
    return (e: PointerEvent) => {
      if (e.pointerType === "mouse") {
        handler(e);
      }
    };
  };

  return (
    <button
      ref={triggerRef}
      id={triggerId}
      type="button"
      disabled={local.disabled}
      data-disabled={local.disabled ? "" : undefined}
      data-state={itemContext.isOpen() ? "open" : "closed"}
      aria-expanded={itemContext.isOpen()}
      aria-controls={contentId}
      class={cn(
        "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        "focus:bg-accent focus:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        "data-[state=open]:bg-accent/50 data-[state=open]:text-accent-foreground",
        local.class,
      )}
      onPointerEnter={(e) => {
        local.onPointerEnter?.(e);
        wasClickCloseRef.current = false;
      }}
      onPointerMove={(e) => {
        local.onPointerMove?.(e);
        whenMouse(() => {
          if (
            local.disabled ||
            wasClickCloseRef.current ||
            hasPointerMoveOpenedRef.current
          )
            return;
          context.onTriggerEnter(itemContext.value);
          hasPointerMoveOpenedRef.current = true;
        })(e);
      }}
      onPointerLeave={(e) => {
        local.onPointerLeave?.(e);
        whenMouse(() => {
          if (local.disabled) return;
          context.onTriggerLeave();
          hasPointerMoveOpenedRef.current = false;
        })(e);
      }}
      onClick={(e) => {
        local.onClick?.(e);
        context.onItemSelect(itemContext.value);
        wasClickCloseRef.current = itemContext.isOpen();
      }}
      {...others}
    >
      {local.children}
      <div
        class={cn(
          "relative top-[1px] ml-1 h-3 w-3 transition-transform duration-300",
          "group-data-[state=open]:rotate-180",
          icon("chevron-down"),
        )}
        aria-hidden="true"
      />
    </button>
  );
};

/* -------------------------------------------------------------------------------------------------
 * NavMenuContent
 * -----------------------------------------------------------------------------------------------*/

interface NavMenuContentProps {
  children?: JSX.Element;
  class?: string;
  forceMount?: boolean;
}

export const NavMenuContent: Component<NavMenuContentProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "forceMount",
  ]);

  const context = useNavMenu();
  const itemContext = useNavMenuItem();

  let contentRef: HTMLElement | undefined;

  onMount(() => {
    if (contentRef) {
      context.registerContent(itemContext.value, contentRef);
    }
  });

  onCleanup(() => {
    context.unregisterContent(itemContext.value);
  });

  const contentId = `navbar-${context.baseId}-content-${itemContext.value}`;
  const triggerId = `navbar-${context.baseId}-trigger-${itemContext.value}`;

  const hasViewport = () => context.viewport() !== null;

  // Render reactively based on viewport existence
  return (
    <>
      <Show when={!hasViewport()}>
        <Presence exitBeforeEnter>
          <Show when={itemContext.isOpen()}>
            <Motion.div
              ref={(el: HTMLDivElement) => {
                contentRef = el;
              }}
              id={contentId}
              aria-labelledby={triggerId}
              data-state={itemContext.isOpen() ? "open" : "closed"}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              class={cn(
                "absolute top-full left-0 z-50 mt-1.5 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md",
                local.class,
              )}
              onPointerEnter={() => context.onContentEnter()}
              onPointerLeave={(e: PointerEvent) => {
                if (e.pointerType === "mouse") {
                  context.onContentLeave();
                }
              }}
              style={{
                "pointer-events": !itemContext.isOpen() ? "none" : undefined,
              }}
              {...others}
            >
              {local.children}
            </Motion.div>
          </Show>
        </Presence>
      </Show>

      <Show when={hasViewport() && context.viewport()}>
        {(viewportElement) => (
          <Portal mount={viewportElement()}>
            <section
              ref={(el) => {
                contentRef = el;
              }}
              id={contentId}
              aria-labelledby={triggerId}
              data-value={itemContext.value}
              class={local.class}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "max-content",
                opacity: itemContext.isOpen() ? 1 : 0,
                "pointer-events": itemContext.isOpen() ? "auto" : "none",
                transition: "opacity 0.15s ease-in-out",
              }}
              {...others}
            >
              {local.children}
            </section>
          </Portal>
        )}
      </Show>
    </>
  );
};

/* -------------------------------------------------------------------------------------------------
 * NavMenuLink
 * -----------------------------------------------------------------------------------------------*/

interface NavMenuLinkProps extends ComponentProps<"a"> {
  href: string;
  active?: boolean;
}

export const NavMenuLink: Component<NavMenuLinkProps> = (props) => {
  const [local, others] = splitProps(props, ["active"]);

  return (
    <a
      data-active={local.active ? "" : undefined}
      aria-current={local.active ? "page" : undefined}
      {...others}
      class={cn(
        "block rounded-md px-3 py-2 text-sm font-medium transition-colors outline-none",
        "hover:bg-accent hover:text-accent-foreground",
        "focus:bg-accent focus:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring",
        "data-[active]:bg-accent/50 data-[active]:text-accent-foreground",
        others.class,
      )}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * NavMenuViewport
 * -----------------------------------------------------------------------------------------------*/

interface NavMenuViewportProps {
  class?: string;
}

export const NavMenuViewport: Component<NavMenuViewportProps> = (props) => {
  const [local, others] = splitProps(props, ["class"]);
  const context = useNavMenu();

  let viewportRef: HTMLDivElement | undefined;

  const isOpen = () => {
    const open = context.value() !== "";
    return open;
  };

  const [viewportHeight, setViewportHeight] = createSignal<number | null>(null);
  const [viewportWidth, setViewportWidth] = createSignal<number | null>(null);
  const [viewportLeft, setViewportLeft] = createSignal<number>(0);
  const [wasOpen, setWasOpen] = createSignal(false);

  onMount(() => {
    if (viewportRef) {
      context.setViewport(viewportRef);
    }
  });

  onCleanup(() => {
    context.setViewport(null);
  });

  createEffect(() => {
    const _currentIsOpen = isOpen();

    // Measure the active content's dimensions and position
    if (viewportRef && context.value() !== "") {
      const wasClosedBefore = !wasOpen();
      setWasOpen(true);
      const activeValue = context.value();

      // Get the active trigger element to calculate positioning
      const activeTrigger = context.getTriggerElement(activeValue);

      // Calculate the left offset of the trigger relative to the nav container
      if (activeTrigger) {
        // Find the nav element by walking up the DOM tree
        let navElement: HTMLElement | null = viewportRef.parentElement;
        while (navElement && navElement.tagName !== "NAV") {
          navElement = navElement.parentElement as HTMLElement;
        }

        if (navElement) {
          // Use getBoundingClientRect for accurate positioning
          const navRect = navElement.getBoundingClientRect();
          const triggerRect = activeTrigger.getBoundingClientRect();
          const leftOffset = triggerRect.left - navRect.left;

          // If opening from closed state, disable transition temporarily
          if (wasClosedBefore && viewportRef.parentElement) {
            const wrapper = viewportRef.parentElement as HTMLElement;
            const oldTransition = wrapper.style.transition;
            wrapper.style.transition = "none";
            setViewportLeft(leftOffset);
            // Force reflow
            void wrapper.offsetHeight;
            // Re-enable transition
            requestAnimationFrame(() => {
              wrapper.style.transition = oldTransition;
            });
          } else {
            setViewportLeft(leftOffset);
          }
        }
      }

      const activeContent = viewportRef.querySelector(
        `[data-value="${activeValue}"]`,
      ) as HTMLElement;
      if (activeContent) {
        // Create a temporary container outside the viewport to measure natural dimensions
        const measurementContainer = document.createElement("div");
        measurementContainer.style.position = "absolute";
        measurementContainer.style.visibility = "hidden";
        measurementContainer.style.top = "-9999px";
        measurementContainer.style.left = "-9999px";
        document.body.appendChild(measurementContainer);

        // Clone the content for measurement
        const clone = activeContent.cloneNode(true) as HTMLElement;
        clone.style.position = "relative";
        clone.style.width = "max-content";
        clone.style.opacity = "1";
        clone.style.visibility = "visible";
        measurementContainer.appendChild(clone);

        // Force reflow
        void clone.offsetHeight;

        // Measure at natural dimensions (not influenced by viewport)
        const width = clone.offsetWidth;
        const height = clone.offsetHeight;

        // Cleanup
        document.body.removeChild(measurementContainer);

        // Set the new dimensions - signals will trigger CSS transition
        setViewportHeight(height);
        setViewportWidth(width);
      }
    } else {
      setWasOpen(false);

      // Delay resetting dimensions until after close animation completes (300ms)
      const timer = setTimeout(() => {
        setViewportHeight(null);
        setViewportWidth(null);
      }, 300);

      onCleanup(() => clearTimeout(timer));
    }
  });

  return (
    <div
      class="absolute top-full z-50"
      style={{
        left: `${viewportLeft()}px`,
        "pointer-events": "auto",
        transition: "left 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      onPointerEnter={() => context.onContentEnter()}
      onPointerLeave={(e: PointerEvent) => {
        if (e.pointerType === "mouse") {
          context.onContentLeave();
        }
      }}
    >
      <div
        ref={(el) => {
          viewportRef = el;
        }}
        data-state={isOpen() ? "open" : "closed"}
        class={cn(
          "relative mt-1.5 origin-top-left rounded-md border border-border bg-popover text-popover-foreground shadow-md",
          "overflow-hidden",
          local.class,
        )}
        style={{
          position: "relative",
          opacity: isOpen() ? 1 : 0,
          transform: isOpen() ? "scale(1)" : "scale(0.96)",
          height: viewportHeight() ? `${viewportHeight()}px` : "auto",
          width: viewportWidth() ? `${viewportWidth()}px` : "auto",
          transition:
            "opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), height 0.3s cubic-bezier(0.16, 1, 0.3, 1), width 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        {...others}
      >
        {/* Content will be portaled here */}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Examples & Meta
 * -----------------------------------------------------------------------------------------------*/

export default NavMenu;

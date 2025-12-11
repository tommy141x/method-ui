import type { JSX, Component, Accessor } from "solid-js";
import {
  splitProps,
  createSignal,
  createContext,
  useContext,
  Show,
  mergeProps,
  createEffect,
  onCleanup,
  onMount,
  children as resolveChildren,
} from "solid-js";
import { Portal } from "solid-js/web";
import { Motion, Presence } from "solid-motionone";
import type { ClassValue } from "clsx";
import clsx from "clsx";
import { unoMerge } from "unocss-merge";


// Hardcoded cn function - makes this component completely self-contained
function cn(...classLists: ClassValue[]) {
  return unoMerge(clsx(classLists));
}


// Icon helper function - returns UnoCSS icon class for your configured icon library
function icon(name: string): string {
  return `i-lucide-${name}`;
}

// Constants
const SIDEBAR_COOKIE_NAME = "sidebar:state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

// Types
type SidebarState = "expanded" | "collapsed";
type SidebarVariant = "sidebar" | "floating" | "inset";
type SidebarCollapsible = "offcanvas" | "icon" | "none";
type SidebarSide = "left" | "right";

interface SidebarContextValue {
  state: Accessor<SidebarState>;
  open: Accessor<boolean>;
  setOpen: (open: boolean) => void;
  openMobile: Accessor<boolean>;
  setOpenMobile: (open: boolean) => void;
  isMobile: Accessor<boolean>;
  toggleSidebar: () => void;
  variant: Accessor<SidebarVariant>;
  side: Accessor<SidebarSide>;
  collapsible: Accessor<SidebarCollapsible>;
  isInitialMount: Accessor<boolean>;
}

// Context
const SidebarContext = createContext<SidebarContextValue>();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

// Helper to detect mobile
const createIsMobile = () => {
  const [isMobile, setIsMobile] = createSignal(false);

  if (typeof window !== "undefined") {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    createEffect(() => {
      checkMobile();
      window.addEventListener("resize", checkMobile);
      onCleanup(() => window.removeEventListener("resize", checkMobile));
    });
  }

  return isMobile;
};

// Helper to get cookie
const getCookie = (name: string): string | undefined => {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
};

// Helper to set cookie
const setCookie = (name: string, value: string, maxAge: number) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}`;
};

// SidebarProvider
interface SidebarProviderProps {
  children?: JSX.Element;
  class?: string;
  style?: JSX.CSSProperties;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  fullHeight?: boolean;
}

export const SidebarProvider: Component<SidebarProviderProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "style",
    "defaultOpen",
    "open",
    "onOpenChange",
    "fullHeight",
  ]);

  const isMobile = createIsMobile();
  const [openMobile, setOpenMobile] = createSignal(false);
  const [enableTransitions, setEnableTransitions] = createSignal(false);

  // Get initial state from cookie or use defaultOpen
  const getInitialOpen = () => {
    // Don't use cookies in examples/docs
    if (
      typeof window !== "undefined" &&
      window.location.pathname.includes("/components/")
    ) {
      return local.defaultOpen ?? true;
    }
    const cookieValue = getCookie(SIDEBAR_COOKIE_NAME);
    if (cookieValue !== undefined) {
      return cookieValue === "true";
    }
    return local.defaultOpen ?? true;
  };

  const [_open, _setOpen] = createSignal(getInitialOpen());
  const open = () => local.open ?? _open();

  // Enable transitions after hydration is complete
  if (typeof window !== "undefined") {
    onMount(() => {
      requestAnimationFrame(() => {
        setEnableTransitions(true);
      });
    });
  }

  const setOpen = (value: boolean) => {
    if (local.onOpenChange) {
      local.onOpenChange(value);
    } else {
      _setOpen(value);
    }
    // Only persist to cookie in production, not in examples
    if (
      typeof window !== "undefined" &&
      !window.location.pathname.includes("/components/")
    ) {
      setCookie(SIDEBAR_COOKIE_NAME, String(value), SIDEBAR_COOKIE_MAX_AGE);
    }
  };

  const toggleSidebar = () => {
    if (isMobile()) {
      setOpenMobile(!openMobile());
    } else {
      setOpen(!open());
    }
  };

  // Keyboard shortcut
  createEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    onCleanup(() => window.removeEventListener("keydown", handleKeyDown));
  });

  const state = () => (open() ? "expanded" : "collapsed");

  const contextValue: SidebarContextValue = {
    state,
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
    variant: () => "sidebar",
    side: () => "left",
    collapsible: () => "offcanvas",
    isInitialMount: () => !enableTransitions(),
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        data-sidebar="wrapper"
        style={{
          "--sidebar-width": SIDEBAR_WIDTH,
          "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
          ...local.style,
        }}
        class={cn(
          "group/sidebar-wrapper relative flex w-full",
          local.fullHeight !== false && "h-screen overflow-hidden",
          local.class,
        )}
        {...others}
      >
        {local.children}
      </div>
    </SidebarContext.Provider>
  );
};

// Sidebar
interface SidebarProps {
  children?: JSX.Element;
  class?: string;
  side?: SidebarSide;
  variant?: SidebarVariant;
  collapsible?: SidebarCollapsible;
  // Enhanced props - allows Sidebar to work standalone without SidebarProvider
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  fullHeight?: boolean;
  wrapperClass?: string;
  wrapperStyle?: JSX.CSSProperties;
  inset?: JSX.Element;
}

/**
 * Sidebar component that can work standalone or within a SidebarProvider.
 * When used standalone, it automatically creates its own provider context.
 *
 * @example
 * // Standalone usage (simplified - no SidebarProvider needed)
 * <Sidebar variant="floating" collapsible="icon" fullHeight={false} class="h-[600px]">
 *   <SidebarHeader>...</SidebarHeader>
 *   <SidebarContent>...</SidebarContent>
 * </Sidebar>
 *
 * @example
 * // With inset content
 * <Sidebar variant="floating" inset={<SidebarInset>...</SidebarInset>}>
 *   <SidebarHeader>...</SidebarHeader>
 * </Sidebar>
 *
 * @example
 * // Legacy usage with explicit provider (still supported)
 * <SidebarProvider><Sidebar>...</Sidebar><SidebarInset>...</SidebarInset></SidebarProvider>
 */
export const Sidebar: Component<SidebarProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "side",
    "variant",
    "collapsible",
    "defaultOpen",
    "open",
    "onOpenChange",
    "fullHeight",
    "wrapperClass",
    "wrapperStyle",
    "inset",
  ]);

  const merged = mergeProps(
    {
      side: "left" as SidebarSide,
      variant: "sidebar" as SidebarVariant,
      collapsible: "offcanvas" as SidebarCollapsible,
    },
    local,
  );

  // Check if we're inside an existing SidebarProvider
  const existingContext = useContext(SidebarContext);
  const needsOwnProvider = !existingContext;

  // If we need our own provider, render the sidebar wrapped in one
  if (needsOwnProvider) {
    return (
      <SidebarProvider
        defaultOpen={local.defaultOpen}
        open={local.open}
        onOpenChange={local.onOpenChange}
        fullHeight={local.fullHeight}
        class={local.wrapperClass}
        style={local.wrapperStyle}
      >
        <SidebarInternal
          side={local.side}
          variant={local.variant}
          collapsible={local.collapsible}
          class={local.class}
          {...others}
        >
          {local.children}
        </SidebarInternal>
        {local.inset}
      </SidebarProvider>
    );
  }

  // Otherwise use the existing provider context
  return (
    <SidebarInternal
      side={local.side}
      variant={local.variant}
      collapsible={local.collapsible}
      class={local.class}
      {...others}
    >
      {local.children}
    </SidebarInternal>
  );
};

// Internal component that does the actual sidebar rendering
interface SidebarInternalProps {
  children?: JSX.Element;
  class?: string;
  side?: SidebarSide;
  variant?: SidebarVariant;
  collapsible?: SidebarCollapsible;
}

const SidebarInternal: Component<SidebarInternalProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "side",
    "variant",
    "collapsible",
  ]);

  const merged = mergeProps(
    {
      side: "left" as SidebarSide,
      variant: "sidebar" as SidebarVariant,
      collapsible: "offcanvas" as SidebarCollapsible,
    },
    local,
  );

  const context = useSidebar();

  // Update context with sidebar props
  const extendedContext: SidebarContextValue = {
    ...context,
    variant: () => merged.variant,
    side: () => merged.side,
    collapsible: () => merged.collapsible,
  };

  if (merged.collapsible === "none") {
    return (
      <SidebarContext.Provider value={extendedContext}>
        <div
          data-sidebar="sidebar"
          data-variant={merged.variant}
          data-side={merged.side}
          class={cn(
            "flex h-full w-(--sidebar-width) flex-col bg-background border-r border-border",
            local.class,
          )}
          {...others}
        >
          {local.children}
        </div>
      </SidebarContext.Provider>
    );
  }

  if (context.isMobile()) {
    return (
      <SidebarContext.Provider value={extendedContext}>
        <Portal>
          <Presence>
            <Show when={context.openMobile()}>
              <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                onClick={() => context.setOpenMobile(false)}
              />
            </Show>
          </Presence>

          <Presence>
            <Show when={context.openMobile()}>
              <Motion.div
                initial={{
                  x: merged.side === "left" ? "-100%" : "100%",
                }}
                animate={{ x: 0 }}
                exit={{
                  x: merged.side === "left" ? "-100%" : "100%",
                }}
                transition={{ duration: 0.3, easing: [0.16, 1, 0.3, 1] }}
                data-sidebar="sidebar"
                data-mobile="true"
                data-variant={merged.variant}
                data-side={merged.side}
                style={{
                  "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
                }}
                class={cn(
                  "fixed inset-y-0 z-50 flex h-full w-(--sidebar-width) flex-col bg-background border-border shadow-lg",
                  merged.side === "left"
                    ? "left-0 border-r"
                    : "right-0 border-l",
                  local.class,
                )}
                {...others}
              >
                {local.children}
              </Motion.div>
            </Show>
          </Presence>
        </Portal>
      </SidebarContext.Provider>
    );
  }

  const getWidth = () => {
    if (merged.collapsible === "offcanvas" && context.state() === "collapsed") {
      return "0rem";
    }
    if (merged.collapsible === "icon" && context.state() === "collapsed") {
      if (merged.variant === "floating" || merged.variant === "inset") {
        return "4rem"; // 3rem icon + 0.5rem padding on each side = 4rem total
      }
      return "3rem";
    }
    if (merged.variant === "floating" || merged.variant === "inset") {
      return "17rem"; // 16rem sidebar + 0.5rem padding on each side = 17rem total
    }
    return "16rem";
  };

  return (
    <SidebarContext.Provider value={extendedContext}>
      <aside
        class="group peer hidden md:block shrink-0"
        data-state={context.state()}
        data-collapsible={
          context.state() === "collapsed" ? merged.collapsible : ""
        }
        data-variant={merged.variant}
        data-side={merged.side}
        data-sidebar="container"
      >
        <div
          data-sidebar="wrapper"
          style={{ width: getWidth() }}
          class={cn(
            "flex h-full box-border",
            context.isInitialMount()
              ? ""
              : "transition-[width] duration-200 ease-in-out",
            merged.variant === "floating" || merged.variant === "inset"
              ? "p-2"
              : "group-data-[side=left]:border-r group-data-[side=right]:border-l border-border",
            local.class,
          )}
          {...others}
        >
          <div
            data-sidebar="sidebar"
            data-variant={merged.variant}
            data-side={merged.side}
            style={{
              opacity:
                merged.collapsible === "offcanvas" &&
                context.state() === "collapsed"
                  ? 0
                  : 1,
            }}
            class={cn(
              "flex h-full w-full flex-col bg-background overflow-hidden",
              context.isInitialMount()
                ? ""
                : "transition-opacity duration-150 ease-out",
              merged.variant === "floating" &&
                "rounded-lg border border-border shadow-sm",
            )}
          >
            {local.children}
          </div>
        </div>
      </aside>
    </SidebarContext.Provider>
  );
};

// SidebarTrigger
interface SidebarTriggerProps {
  children?: JSX.Element;
  class?: string;
  onClick?: (e: MouseEvent) => void;
}

export const SidebarTrigger: Component<SidebarTriggerProps> = (props) => {
  const [local, others] = splitProps(props, ["children", "class", "onClick"]);
  const sidebar = useSidebar();

  return (
    <button
      data-sidebar="trigger"
      type="button"
      class={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        "h-7 w-7",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        local.class,
      )}
      onClick={(e) => {
        local.onClick?.(e);
        sidebar.toggleSidebar();
      }}
      {...others}
    >
      {local.children || (
        <>
          <div class={cn("h-4 w-4", icon("panel-left"))} />
          <span class="sr-only">Toggle Sidebar</span>
        </>
      )}
    </button>
  );
};

// SidebarRail
interface SidebarRailProps {
  class?: string;
  onClick?: () => void;
}

export const SidebarRail: Component<SidebarRailProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "onClick"]);
  const sidebar = useSidebar();

  return (
    <button
      data-sidebar="rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      type="button"
      onClick={() => {
        local.onClick?.();
        sidebar.toggleSidebar();
      }}
      title="Toggle Sidebar"
      class={cn(
        "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear",
        "group-data-[side=left]:-right-4 group-data-[side=right]:left-0",
        "after:absolute after:inset-y-0 after:left-1/2 after:w-[2px]",
        "hover:after:bg-border",
        "sm:flex",
        "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize",
        "[[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        local.class,
      )}
      {...others}
    />
  );
};

// SidebarInset
interface SidebarInsetProps {
  children?: JSX.Element;
  class?: string;
}

export const SidebarInset: Component<SidebarInsetProps> = (props) => {
  const [local, others] = splitProps(props, ["class"]);

  return (
    <main
      data-sidebar="inset"
      class={cn(
        "relative flex flex-1 flex-col bg-background overflow-auto",
        "peer-data-[variant=inset]:m-2 peer-data-[variant=inset]:rounded-xl peer-data-[variant=inset]:shadow peer-data-[variant=inset]:border peer-data-[variant=inset]:border-border",
        local.class,
      )}
      {...others}
    />
  );
};

// SidebarHeader
interface SidebarHeaderProps {
  children?: JSX.Element;
  class?: string;
}

export const SidebarHeader: Component<SidebarHeaderProps> = (props) => {
  const [local, others] = splitProps(props, ["class"]);

  return (
    <div
      data-sidebar="header"
      class={cn(
        "flex flex-col gap-2 px-2 pb-2",
        "group-data-[collapsible=icon]:pt-2 group-data-[collapsible=icon]:overflow-hidden",
        local.class,
      )}
      {...others}
    />
  );
};

// SidebarFooter
interface SidebarFooterProps {
  children?: JSX.Element;
  class?: string;
}

export const SidebarFooter: Component<SidebarFooterProps> = (props) => {
  const [local, others] = splitProps(props, ["class"]);

  return (
    <div
      data-sidebar="footer"
      class={cn("flex flex-col gap-2 px-2 pt-2", local.class)}
      {...others}
    />
  );
};

// SidebarContent
interface SidebarContentProps {
  children?: JSX.Element;
  class?: string;
}

export const SidebarContent: Component<SidebarContentProps> = (props) => {
  const [local, others] = splitProps(props, ["class"]);

  return (
    <div
      data-sidebar="content"
      class={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        local.class,
      )}
      {...others}
    />
  );
};

// SidebarGroup
interface SidebarGroupProps {
  children?: JSX.Element;
  class?: string;
}

export const SidebarGroup: Component<SidebarGroupProps> = (props) => {
  const [local, others] = splitProps(props, ["class"]);

  return (
    <div
      data-sidebar="group"
      class={cn("relative flex w-full min-w-0 flex-col px-2", local.class)}
      {...others}
    />
  );
};

// SidebarGroupLabel
interface SidebarGroupLabelProps {
  children?: JSX.Element;
  class?: string;
  asChild?: boolean;
}

export const SidebarGroupLabel: Component<SidebarGroupLabelProps> = (props) => {
  const [local, others] = splitProps(props, ["children", "class", "asChild"]);
  const resolved = resolveChildren(() => local.children);

  const content = (
    <div
      data-sidebar="group-label"
      class={cn(
        "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-muted-foreground outline-hidden",
        "transition-all duration-200 ease-linear",
        "focus-visible:ring-2 focus-visible:ring-ring",
        "group-data-[collapsible=icon]:h-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:overflow-hidden",
        "[&>svg]:size-4 [&>svg]:shrink-0",
        local.class,
      )}
      {...others}
    >
      {resolved()}
    </div>
  );

  return content;
};

// SidebarGroupAction
interface SidebarGroupActionProps {
  children?: JSX.Element;
  class?: string;
  onClick?: () => void;
}

export const SidebarGroupAction: Component<SidebarGroupActionProps> = (
  props,
) => {
  const [local, others] = splitProps(props, ["class"]);

  return (
    <button
      data-sidebar="group-action"
      type="button"
      class={cn(
        "absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-foreground outline-hidden transition-transform",
        "hover:bg-accent hover:text-accent-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring",
        "after:absolute after:-inset-2 md:after:hidden",
        "group-data-[collapsible=icon]:hidden",
        "[&>svg]:size-4 [&>svg]:shrink-0",
        local.class,
      )}
      {...others}
    />
  );
};

// SidebarGroupContent
interface SidebarGroupContentProps {
  children?: JSX.Element;
  class?: string;
}

export const SidebarGroupContent: Component<SidebarGroupContentProps> = (
  props,
) => {
  const [local, others] = splitProps(props, ["class"]);

  return (
    <div
      data-sidebar="group-content"
      class={cn("w-full text-sm", local.class)}
      {...others}
    />
  );
};

// SidebarMenu
interface SidebarMenuProps {
  children?: JSX.Element;
  class?: string;
}

export const SidebarMenu: Component<SidebarMenuProps> = (props) => {
  const [local, others] = splitProps(props, ["class"]);

  return (
    <ul
      data-sidebar="menu"
      class={cn("flex w-full min-w-0 flex-col gap-1", local.class)}
      {...others}
    />
  );
};

// SidebarMenuItem
interface SidebarMenuItemProps {
  children?: JSX.Element;
  class?: string;
}

export const SidebarMenuItem: Component<SidebarMenuItemProps> = (props) => {
  const [local, others] = splitProps(props, ["class"]);

  return (
    <li
      data-sidebar="menu-item"
      class={cn("group/menu-item relative", local.class)}
      {...others}
    />
  );
};

// SidebarMenuButton
interface SidebarMenuButtonProps {
  children?: JSX.Element;
  class?: string;
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  onClick?: () => void;
}

export const SidebarMenuButton: Component<SidebarMenuButtonProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "asChild",
    "isActive",
    "tooltip",
    "variant",
    "size",
  ]);

  const merged = mergeProps({ variant: "default", size: "default" }, local);
  const sidebar = useSidebar();
  const resolved = resolveChildren(() => local.children);

  const button = (
    <button
      data-sidebar="menu-button"
      data-size={merged.size}
      data-active={local.isActive}
      type="button"
      class={cn(
        "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden",
        "hover:bg-accent hover:text-accent-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring",
        "active:bg-accent active:text-accent-foreground",
        "disabled:pointer-events-none disabled:opacity-50",
        "data-[active=true]:bg-accent data-[active=true]:font-medium data-[active=true]:text-accent-foreground",
        "group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! group-data-[collapsible=icon]:justify-center",
        "[&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:[&>*:not(:first-child)]:hidden",
        merged.size === "sm" && "h-7 text-xs",
        merged.size === "default" && "h-8 text-sm",
        merged.size === "lg" &&
          "h-12 text-sm group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:size-8!",
        merged.variant === "outline" &&
          "bg-background shadow-[0_0_0_1px_hsl(var(--border))] hover:bg-accent hover:text-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--accent))]",
        local.class,
      )}
      {...others}
    >
      {resolved()}
    </button>
  );

  if (!local.tooltip) {
    return button;
  }

  // Simple tooltip implementation
  return (
    <div class="relative group/tooltip">
      {button}
      <Show when={sidebar.state() === "collapsed" && !sidebar.isMobile()}>
        <div
          class={cn(
            "pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 rounded-md bg-secondary px-3 py-1.5 text-xs text-secondary-foreground shadow-md opacity-0 transition-opacity",
            "group-hover/tooltip:opacity-100",
          )}
        >
          {local.tooltip}
        </div>
      </Show>
    </div>
  );
};

// SidebarMenuAction
interface SidebarMenuActionProps {
  children?: JSX.Element;
  class?: string;
  showOnHover?: boolean;
  onClick?: () => void;
}

export const SidebarMenuAction: Component<SidebarMenuActionProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "showOnHover"]);

  return (
    <button
      data-sidebar="menu-action"
      type="button"
      class={cn(
        "absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-foreground outline-hidden transition-transform",
        "hover:bg-accent hover:text-accent-foreground",
        "peer-hover/menu-button:text-accent-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring",
        "after:absolute after:-inset-2 md:after:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        "[&>svg]:size-4 [&>svg]:shrink-0",
        local.showOnHover &&
          "peer-data-[active=true]/menu-button:text-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0",
        local.class,
      )}
      {...others}
    />
  );
};

// SidebarMenuBadge
interface SidebarMenuBadgeProps {
  children?: JSX.Element;
  class?: string;
}

export const SidebarMenuBadge: Component<SidebarMenuBadgeProps> = (props) => {
  const [local, others] = splitProps(props, ["class"]);

  return (
    <div
      data-sidebar="menu-badge"
      class={cn(
        "pointer-events-none absolute right-1 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-foreground",
        "peer-hover/menu-button:text-accent-foreground",
        "peer-data-[active=true]/menu-button:text-accent-foreground",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        local.class,
      )}
      {...others}
    />
  );
};

// SidebarMenuSub
interface SidebarMenuSubProps {
  children?: JSX.Element;
  class?: string;
}

export const SidebarMenuSub: Component<SidebarMenuSubProps> = (props) => {
  const [local, others] = splitProps(props, ["class"]);

  return (
    <ul
      data-sidebar="menu-sub"
      class={cn(
        "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-border px-2.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        local.class,
      )}
      {...others}
    />
  );
};

// SidebarMenuSubItem
interface SidebarMenuSubItemProps {
  children?: JSX.Element;
  class?: string;
}

export const SidebarMenuSubItem: Component<SidebarMenuSubItemProps> = (
  props,
) => {
  const [local, others] = splitProps(props, ["class"]);

  return (
    <li data-sidebar="menu-sub-item" class={cn(local.class)} {...others} />
  );
};

// SidebarMenuSubButton
interface SidebarMenuSubButtonProps {
  children?: JSX.Element;
  class?: string;
  asChild?: boolean;
  size?: "sm" | "md";
  isActive?: boolean;
  onClick?: () => void;
}

export const SidebarMenuSubButton: Component<SidebarMenuSubButtonProps> = (
  props,
) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "asChild",
    "size",
    "isActive",
  ]);

  const merged = mergeProps({ size: "md" }, local);

  return (
    <button
      data-sidebar="menu-sub-button"
      data-size={merged.size}
      data-active={local.isActive}
      type="button"
      class={cn(
        "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-foreground outline-hidden transition-[color,background-color]",
        "hover:bg-accent hover:text-accent-foreground",
        "active:bg-accent active:text-accent-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        "data-[active=true]:bg-accent data-[active=true]:text-accent-foreground",
        "[&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-accent-foreground",
        merged.size === "sm" && "text-xs",
        merged.size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        local.class,
      )}
      {...others}
    >
      {local.children}
    </button>
  );
};

// SidebarSeparator
interface SidebarSeparatorProps {
  class?: string;
}

export const SidebarSeparator: Component<SidebarSeparatorProps> = (props) => {
  const [local, others] = splitProps(props, ["class"]);

  return (
    <div
      data-sidebar="separator"
      class={cn("mx-2 w-auto h-px bg-border", local.class)}
      {...others}
    />
  );
};


export default Sidebar;

import type { JSX, Component, Accessor } from "solid-js";
import {
  splitProps,
  createSignal,
  createContext,
  useContext,
  Show,
  For,
} from "solid-js";
import { cn } from "../lib/cn";
import { icon } from "../lib/icon";
import type { ComponentMeta } from "../lib/meta";

// Context for sidebar state
interface SidebarContextValue {
  collapsed: Accessor<boolean>;
  setCollapsed: (collapsed: boolean) => void;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextValue>();

const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error(
      "Sidebar components must be used within a Sidebar component",
    );
  }
  return context;
};

// Main Sidebar component
interface SidebarProps {
  children?: JSX.Element;
  class?: string;
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  collapsible?: "offcanvas" | "icon" | "none";
}

export const Sidebar: Component<SidebarProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "defaultCollapsed",
    "collapsed",
    "onCollapsedChange",
    "collapsible",
  ]);

  const [internalCollapsed, setInternalCollapsed] = createSignal(
    local.defaultCollapsed ?? false,
  );

  const isCollapsed = () => local.collapsed ?? internalCollapsed();

  const setCollapsed = (value: boolean) => {
    setInternalCollapsed(value);
    local.onCollapsedChange?.(value);
  };

  const toggle = () => {
    setCollapsed(!isCollapsed());
  };

  const contextValue: SidebarContextValue = {
    collapsed: isCollapsed,
    setCollapsed,
    toggle,
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      <div class="relative">
        <aside
          class={cn(
            "flex h-full flex-col border-r border-border bg-background transition-all duration-300 ease-in-out",
            isCollapsed() ? "w-16" : "w-64",
            local.class,
          )}
          data-collapsed={isCollapsed()}
          {...others}
        >
          {local.children}
        </aside>
      </div>
    </SidebarContext.Provider>
  );
};

// Sidebar Header
interface SidebarHeaderProps {
  children?: JSX.Element;
  class?: string;
}

export const SidebarHeader: Component<SidebarHeaderProps> = (props) => {
  const [local, others] = splitProps(props, ["children", "class"]);

  return (
    <div
      class={cn(
        "flex items-center justify-between gap-2 border-b border-border px-4 py-3",
        local.class,
      )}
      {...others}
    >
      {local.children}
    </div>
  );
};

// Sidebar Content
interface SidebarContentProps {
  children?: JSX.Element;
  class?: string;
}

export const SidebarContent: Component<SidebarContentProps> = (props) => {
  const [local, others] = splitProps(props, ["children", "class"]);

  return (
    <div class={cn("flex-1 overflow-y-auto py-2", local.class)} {...others}>
      {local.children}
    </div>
  );
};

// Sidebar Footer
interface SidebarFooterProps {
  children?: JSX.Element;
  class?: string;
}

export const SidebarFooter: Component<SidebarFooterProps> = (props) => {
  const [local, others] = splitProps(props, ["children", "class"]);

  return (
    <div
      class={cn("border-t border-border px-4 py-3", local.class)}
      {...others}
    >
      {local.children}
    </div>
  );
};

// Sidebar Group
interface SidebarGroupProps {
  children?: JSX.Element;
  class?: string;
}

export const SidebarGroup: Component<SidebarGroupProps> = (props) => {
  const [local, others] = splitProps(props, ["children", "class"]);

  return (
    <div class={cn("px-3 py-2", local.class)} {...others}>
      {local.children}
    </div>
  );
};

// Sidebar Group Label
interface SidebarGroupLabelProps {
  children?: JSX.Element;
  class?: string;
}

export const SidebarGroupLabel: Component<SidebarGroupLabelProps> = (props) => {
  const [local, others] = splitProps(props, ["children", "class"]);
  const sidebar = useSidebar();

  return (
    <Show when={!sidebar.collapsed()}>
      <div
        class={cn(
          "mb-2 px-2 text-xs font-semibold text-muted-foreground",
          local.class,
        )}
        {...others}
      >
        {local.children}
      </div>
    </Show>
  );
};

// Sidebar Group Content
interface SidebarGroupContentProps {
  children?: JSX.Element;
  class?: string;
}

export const SidebarGroupContent: Component<SidebarGroupContentProps> = (
  props,
) => {
  const [local, others] = splitProps(props, ["children", "class"]);

  return (
    <div class={cn(local.class)} {...others}>
      {local.children}
    </div>
  );
};

// Sidebar Menu
interface SidebarMenuProps {
  children?: JSX.Element;
  class?: string;
}

export const SidebarMenu: Component<SidebarMenuProps> = (props) => {
  const [local, others] = splitProps(props, ["children", "class"]);

  return (
    <ul class={cn("space-y-1", local.class)} {...others}>
      {local.children}
    </ul>
  );
};

// Sidebar Menu Item
interface SidebarMenuItemProps {
  children?: JSX.Element;
  class?: string;
}

export const SidebarMenuItem: Component<SidebarMenuItemProps> = (props) => {
  const [local, others] = splitProps(props, ["children", "class"]);

  return (
    <li class={cn(local.class)} {...others}>
      {local.children}
    </li>
  );
};

// Sidebar Menu Button
interface SidebarMenuButtonProps {
  children?: JSX.Element;
  class?: string;
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string;
}

export const SidebarMenuButton: Component<SidebarMenuButtonProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "asChild",
    "isActive",
    "tooltip",
  ]);
  const sidebar = useSidebar();

  if (local.asChild) {
    return <>{local.children}</>;
  }

  return (
    <button
      class={cn(
        "flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        local.isActive && "bg-accent text-accent-foreground",
        sidebar.collapsed() && "justify-center",
        local.class,
      )}
      title={sidebar.collapsed() ? local.tooltip : undefined}
      {...others}
    >
      {local.children}
    </button>
  );
};

// Sidebar Trigger (wrapper component)
interface SidebarTriggerProps {
  children?: JSX.Element;
  class?: string;
}

export const SidebarTrigger: Component<SidebarTriggerProps> = (props) => {
  const [local, others] = splitProps(props, ["children", "class"]);
  const sidebar = useSidebar();

  return (
    <div onClick={sidebar.toggle} class={cn(local.class)} {...others}>
      {local.children}
    </div>
  );
};

// Import Button for examples
import { Button } from "./button";

export const meta: ComponentMeta<SidebarProps> = {
  name: "Sidebar",
  description:
    "A collapsible sidebar component with composable parts. Perfect for application navigation with support for icons, labels, and grouping.",
  examples: [
    {
      title: "Basic Sidebar",
      description: "A simple sidebar with header, content, and footer",
      code: () => (
        <div class="flex h-[400px] w-full overflow-hidden rounded-lg border">
          <Sidebar>
            <SidebarHeader>
              <div class="flex items-center gap-2">
                <div class="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <span class="text-sm font-bold">M</span>
                </div>
                <span class="font-semibold">Method UI</span>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Getting Started</SidebarGroupLabel>
                <SidebarGroupContent>
                  <div class="space-y-1">
                    <div class="rounded-md px-2 py-2 text-sm">Introduction</div>
                    <div class="rounded-md px-2 py-2 text-sm">Installation</div>
                    <div class="rounded-md px-2 py-2 text-sm">Usage</div>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
              <div class="text-xs text-muted-foreground">v1.0.0</div>
            </SidebarFooter>
          </Sidebar>
          <div class="flex-1 p-6">
            <h2 class="text-2xl font-bold">Main Content</h2>
            <p class="text-muted-foreground">This is the main content area.</p>
          </div>
        </div>
      ),
    },
    {
      title: "With Menu Items",
      description: "Sidebar with clickable menu items and icons",
      code: () => {
        return (
          <div class="flex h-[400px] w-full overflow-hidden rounded-lg border">
            <Sidebar>
              <SidebarHeader>
                <div class="flex items-center gap-2">
                  <div class="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <span class="text-sm font-bold">A</span>
                  </div>
                  <span class="font-semibold">Application</span>
                </div>
              </SidebarHeader>
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupLabel>Menu</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton isActive={true} tooltip="Home">
                          <div class="h-4 w-4 i-lucide-home" />
                          <span>Home</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Inbox">
                          <div class="h-4 w-4 i-lucide-inbox" />
                          <span>Inbox</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Calendar">
                          <div class="h-4 w-4 i-lucide-calendar" />
                          <span>Calendar</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Search">
                          <div class="h-4 w-4 i-lucide-search" />
                          <span>Search</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Settings">
                          <div class="h-4 w-4 i-lucide-settings" />
                          <span>Settings</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
            </Sidebar>
            <div class="flex-1 p-6">
              <h2 class="text-2xl font-bold">Dashboard</h2>
              <p class="text-muted-foreground">Welcome to your dashboard.</p>
            </div>
          </div>
        );
      },
    },
    {
      title: "Collapsible Sidebar",
      description: "Sidebar with collapse/expand functionality",
      code: () => {
        const [collapsed, setCollapsed] = createSignal(false);

        return (
          <div class="flex h-[400px] w-full overflow-hidden rounded-lg border">
            <Sidebar collapsed={collapsed()} onCollapsedChange={setCollapsed}>
              <SidebarHeader>
                <div class="flex items-center gap-2">
                  <div class="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <span class="text-sm font-bold">W</span>
                  </div>
                  {!collapsed() && <span class="font-semibold">Workspace</span>}
                </div>
              </SidebarHeader>
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Dashboard">
                          <div class="h-4 w-4 i-lucide-layout-dashboard" />
                          {!collapsed() && <span>Dashboard</span>}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Projects">
                          <div class="h-4 w-4 i-lucide-folder" />
                          {!collapsed() && <span>Projects</span>}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Team">
                          <div class="h-4 w-4 i-lucide-users" />
                          {!collapsed() && <span>Team</span>}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Analytics">
                          <div class="h-4 w-4 i-lucide-bar-chart" />
                          {!collapsed() && <span>Analytics</span>}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
              <SidebarFooter>
                <Show
                  when={!collapsed()}
                  fallback={
                    <div class="flex justify-center">
                      <SidebarTrigger>
                        <Button variant="ghost" size="icon">
                          <div class="h-4 w-4 transition-transform rotate-180 i-lucide-panel-left" />
                        </Button>
                      </SidebarTrigger>
                    </div>
                  }
                >
                  <div class="flex items-center gap-2">
                    <div class="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <div class="h-4 w-4 i-lucide-user" />
                    </div>
                    <div class="flex flex-col flex-1">
                      <span class="text-sm font-medium">John Doe</span>
                      <span class="text-xs text-muted-foreground">
                        john@example.com
                      </span>
                    </div>
                    <SidebarTrigger class="ml-auto">
                      <Button variant="ghost" size="icon">
                        <div class="h-4 w-4 i-lucide-panel-left" />
                      </Button>
                    </SidebarTrigger>
                  </div>
                </Show>
              </SidebarFooter>
            </Sidebar>
            <div class="flex-1 p-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-2xl font-bold">Content Area</h2>
                <Button onClick={() => setCollapsed(!collapsed())}>
                  Toggle Sidebar
                </Button>
              </div>
              <p class="text-muted-foreground">
                Click the button or use the sidebar toggle to collapse/expand
                the sidebar.
              </p>
            </div>
          </div>
        );
      },
    },
  ],
};

export default Sidebar;

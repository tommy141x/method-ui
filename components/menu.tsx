import { Menu as ArkMenu } from "@ark-ui/solid/menu";
import type { PositioningOptions } from "@zag-js/popper";
import type { Component, JSX } from "solid-js";
import { Show, splitProps } from "solid-js";
import { Portal } from "solid-js/web";
import { Motion, Presence } from "solid-motionone";
import { cn } from "../lib/cn";
import type { ComponentMeta } from "../lib/meta";
import { buttonVariants } from "./button";

type MenuProps = {
  children?: JSX.Element;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (details: { open: boolean }) => void;
  onSelect?: (details: { value: string | null }) => void;
  closeOnSelect?: boolean;
  positioning?: PositioningOptions;
  id?: string;
  ids?: Partial<{
    trigger: string;
    contextTrigger: string;
    content: string;
    groupLabel: (id: string) => string;
    group: (id: string) => string;
    positioner: string;
    arrow: string;
  }>;
  "aria-label"?: string;
  highlightedValue?: string;
  defaultHighlightedValue?: string;
  onHighlightChange?: (details: { highlightedValue: string | null }) => void;
  loopFocus?: boolean;
  typeahead?: boolean;
  composite?: boolean;
};

export const Menu: Component<MenuProps> = (props) => {
  return <ArkMenu.Root {...props}>{props.children}</ArkMenu.Root>;
};

type MenuTriggerProps = {
  children?: JSX.Element;
  class?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
};

export const MenuTrigger: Component<MenuTriggerProps> = (props) => {
  const [local, buttonProps, others] = splitProps(
    props,
    ["class", "children"],
    ["variant", "size"],
  );

  return (
    <ArkMenu.Trigger
      class={cn(
        buttonVariants({
          variant: buttonProps.variant,
          size: buttonProps.size,
        }),
        "data-[state=open]:ring-0 data-[state=open]:ring-offset-0 data-[state=open]:outline-none focus:data-[state=open]:ring-0 focus-visible:data-[state=open]:ring-0",
        local.class,
      )}
      {...others}
    >
      {local.children}
    </ArkMenu.Trigger>
  );
};

type MenuContentProps = ArkMenu.ContentProps & {
  children?: JSX.Element;
  class?: string;
};

export const MenuContent: Component<MenuContentProps> = (props) => {
  const [local, others] = splitProps(props, ["class"]);
  return (
    <Portal>
      <ArkMenu.Positioner>
        <ArkMenu.Context>
          {(context) => {
            const isOpen = () => context().open;

            return (
              <Presence exitBeforeEnter>
                <Show when={isOpen()}>
                  <Motion.div
                    animate={{
                      opacity: [0, 1],
                      scale: [0.96, 1],
                      y: [-8, 0],
                    }}
                    exit={{ opacity: [1, 0], scale: [1, 0.96], y: [0, -8] }}
                    transition={{
                      duration: 0.2,
                      easing: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <ArkMenu.Content
                      class={cn(
                        "z-50 min-w-[var(--reference-width)] overflow-hidden rounded-md border border-border bg-background p-1 shadow-md max-h-[300px] overflow-y-auto outline-none focus:outline-none focus-visible:outline-none",
                        local.class,
                      )}
                      {...others}
                    />
                  </Motion.div>
                </Show>
              </Presence>
            );
          }}
        </ArkMenu.Context>
      </ArkMenu.Positioner>
    </Portal>
  );
};

type MenuItemProps = ArkMenu.ItemProps & {
  value: string;
  children?: JSX.Element;
  class?: string;
  disabled?: boolean;
};

export const MenuItem: Component<MenuItemProps> = (props) => {
  const [local, others] = splitProps(props, ["class"]);
  return (
    <ArkMenu.Item
      class={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
        local.class,
      )}
      {...others}
    />
  );
};

type MenuSeparatorProps = ArkMenu.SeparatorProps & {
  class?: string;
};

export const MenuSeparator: Component<MenuSeparatorProps> = (props) => {
  return (
    <ArkMenu.Separator
      class={cn("-mx-1 my-1 h-px border-border", props.class)}
    />
  );
};

type MenuLabelProps = ArkMenu.ItemGroupLabelProps & {
  children?: JSX.Element;
  class?: string;
};

export const MenuLabel: Component<MenuLabelProps> = (props) => {
  const [local, others] = splitProps(props, ["class"]);
  return (
    <ArkMenu.ItemGroupLabel
      class={cn(
        "px-2 py-1.5 text-xs font-semibold text-muted-foreground",
        local.class,
      )}
      {...others}
    />
  );
};

type MenuGroupProps = ArkMenu.ItemGroupProps & {
  children?: JSX.Element;
};

export const MenuGroup: Component<MenuGroupProps> = (props) => {
  return <ArkMenu.ItemGroup>{props.children}</ArkMenu.ItemGroup>;
};

export const meta: ComponentMeta<MenuProps> = {
  name: "Menu",
  description:
    "A menu component for displaying actions and options. Built on Ark UI Menu - all Ark UI Menu props are supported.",
  examples: [
    {
      title: "Context Menu with Nested Items",
      description: "Right-click anywhere in the area to open context menu",
      code: () => {
        return (
          <Menu>
            <ArkMenu.ContextTrigger class="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-border border-dashed bg-muted/50 cursor-default">
              <p class="text-sm text-muted-foreground">Right click here</p>
            </ArkMenu.ContextTrigger>
            <MenuContent>
              <MenuItem value="view">
                <div class="h-4 w-4 mr-2 i-lucide-eye" />
                View
              </MenuItem>
              <MenuItem value="edit">
                <div class="h-4 w-4 mr-2 i-lucide-pencil" />
                Edit
              </MenuItem>
              <MenuSeparator />
              <Menu>
                <ArkMenu.TriggerItem class="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground">
                  <div class="h-4 w-4 mr-2 i-lucide-share-2" />
                  Share
                  <div class="h-4 w-4 ml-auto i-lucide-chevron-right" />
                </ArkMenu.TriggerItem>
                <MenuContent>
                  <MenuItem value="email">
                    <div class="h-4 w-4 mr-2 i-lucide-mail" />
                    Email
                  </MenuItem>
                  <MenuItem value="link">
                    <div class="h-4 w-4 mr-2 i-lucide-link" />
                    Copy Link
                  </MenuItem>
                  <MenuItem value="embed">
                    <div class="h-4 w-4 mr-2 i-lucide-code" />
                    Embed
                  </MenuItem>
                </MenuContent>
              </Menu>
              <Menu>
                <ArkMenu.TriggerItem class="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground">
                  <div class="h-4 w-4 mr-2 i-lucide-download" />
                  Export
                  <div class="h-4 w-4 ml-auto i-lucide-chevron-right" />
                </ArkMenu.TriggerItem>
                <MenuContent>
                  <MenuItem value="pdf">
                    <div class="h-4 w-4 mr-2 i-lucide-file-text" />
                    PDF
                  </MenuItem>
                  <MenuItem value="png">
                    <div class="h-4 w-4 mr-2 i-lucide-image" />
                    PNG
                  </MenuItem>
                  <MenuItem value="svg">
                    <div class="h-4 w-4 mr-2 i-lucide-file-code" />
                    SVG
                  </MenuItem>
                </MenuContent>
              </Menu>
              <MenuSeparator />
              <MenuItem value="delete">
                <div class="h-4 w-4 mr-2 i-lucide-trash" />
                Delete
              </MenuItem>
            </MenuContent>
          </Menu>
        );
      },
    },
    {
      title: "Button Trigger with Icons",
      description: "Menu with button trigger and icon items",
      code: () => {
        return (
          <Menu>
            <MenuTrigger variant="outline">
              <div class="h-4 w-4 mr-2 i-lucide-settings" />
              Actions
            </MenuTrigger>
            <MenuContent>
              <MenuItem value="new">
                <div class="h-4 w-4 mr-2 i-lucide-file-plus" />
                New File
              </MenuItem>
              <MenuItem value="open">
                <div class="h-4 w-4 mr-2 i-lucide-folder-open" />
                Open File
              </MenuItem>
              <MenuItem value="save">
                <div class="h-4 w-4 mr-2 i-lucide-save" />
                Save
              </MenuItem>
              <MenuSeparator />
              <MenuItem value="settings">
                <div class="h-4 w-4 mr-2 i-lucide-settings" />
                Settings
              </MenuItem>
              <MenuItem value="exit">
                <div class="h-4 w-4 mr-2 i-lucide-log-out" />
                Exit
              </MenuItem>
            </MenuContent>
          </Menu>
        );
      },
    },
  ],
};

export default Menu;

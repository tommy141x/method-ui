import {
  createSignal,
  createEffect,
  For,
  Show,
  JSX,
  splitProps,
  createMemo,
  onMount,
  onCleanup,
  createContext,
  useContext,
  untrack,
} from "solid-js";
import { Portal } from "solid-js/web";
import { Motion, Presence } from "solid-motionone";
import { cn } from "../lib/cn";
import { icon } from "../lib/icon";
import type { ComponentMeta } from "../lib/meta";

// Context for managing group state
interface CommandGroupContextValue {
  groupId: string;
  registerGroupItem: (id: string) => void;
  unregisterGroupItem: (id: string) => void;
}

const CommandGroupContext = createContext<
  CommandGroupContextValue | undefined
>();

const useCommandGroupContext = () => {
  return useContext(CommandGroupContext);
};

// Context for managing command state
interface CommandContextValue {
  search: () => string;
  setSearch: (value: string) => void;
  selectedIndex: () => number;
  setSelectedIndex: (index: number) => void;
  getItems: () => CommandItemData[];
  itemCount: () => number;
  registerItem: (item: CommandItemData) => void;
  unregisterItem: (id: string) => void;
  onSelect?: (value: string) => void;
  loading?: () => boolean;
  loop?: boolean;
}

interface CommandItemData {
  id: string;
  value: string;
  disabled?: boolean;
  keywords?: string[];
  onSelect?: () => void;
}

const CommandContext = createContext<CommandContextValue>();

const useCommandContext = () => {
  const context = useContext(CommandContext);
  if (!context) {
    throw new Error(
      "Command components must be used within a Command component",
    );
  }
  return context;
};

// Main Command component
interface CommandProps {
  children?: JSX.Element;
  class?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  onSelect?: (value: string) => void;
  filter?: (value: string, search: string, keywords?: string[]) => boolean;
  loop?: boolean;
  loading?: () => boolean;
}

export const Command = (props: CommandProps) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "value",
    "onValueChange",
    "onSelect",
    "filter",
    "loop",
    "loading",
  ]);

  const [search, setSearch] = createSignal("");
  const [selectedIndex, setSelectedIndex] = createSignal(0);
  const [itemsMap, setItemsMap] = createSignal<Map<string, CommandItemData>>(
    new Map(),
  );
  const [loading, setLoading] = createSignal(false);

  const getItems = () => Array.from(itemsMap().values());
  const itemCount = () => itemsMap().size;

  const registerItem = (item: CommandItemData) => {
    setItemsMap((prev) => {
      const next = new Map(prev);
      next.set(item.id, item);
      return next;
    });
  };

  const unregisterItem = (id: string) => {
    setItemsMap((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  };

  // Reset selected index when search changes and ensure first visible item is selected
  createEffect(() => {
    const searchValue = search();
    setSelectedIndex(0);

    // If there's a search, make sure we're selecting a visible item
    if (searchValue) {
      const allItems = getItems();
      const firstVisibleIndex = allItems.findIndex((item) => {
        if (item.disabled) return false;

        const value = item.value.toLowerCase();
        const search = searchValue.toLowerCase();

        if (value.includes(search)) return true;

        if (item.keywords) {
          return item.keywords.some((keyword) =>
            keyword.toLowerCase().includes(search),
          );
        }

        return false;
      });

      // Count only visible items before this one
      if (firstVisibleIndex >= 0) {
        const visibleItems = allItems.filter((item, idx) => {
          if (item.disabled) return false;
          if (idx > firstVisibleIndex) return false;

          const value = item.value.toLowerCase();
          const search = searchValue.toLowerCase();

          if (value.includes(search)) return true;

          if (item.keywords) {
            return item.keywords.some((keyword) =>
              keyword.toLowerCase().includes(search),
            );
          }

          return false;
        });
        setSelectedIndex(0);
      }
    }
  });

  // Notify parent of value changes
  createEffect(() => {
    const value = search();
    local.onValueChange?.(value);
  });

  const contextValue: CommandContextValue = {
    search,
    setSearch,
    selectedIndex,
    setSelectedIndex,
    getItems,
    itemCount,
    registerItem,
    unregisterItem,
    onSelect: local.onSelect,
    loading: local.loading || loading,
    loop: local.loop,
  };

  return (
    <CommandContext.Provider value={contextValue}>
      <div
        class={cn(
          "flex flex-col overflow-hidden bg-background text-foreground",
          local.class,
        )}
        {...others}
        role="combobox"
        aria-expanded="true"
      >
        {local.children}
      </div>
    </CommandContext.Provider>
  );
};

// Command Input
interface CommandInputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  class?: string;
  placeholder?: string;
}

export const CommandInput = (props: CommandInputProps) => {
  const [local, others] = splitProps(props, [
    "class",
    "placeholder",
    "value",
    "onInput",
  ]);
  const context = useCommandContext();
  let inputRef: HTMLInputElement | undefined;

  onMount(() => {
    inputRef?.focus();
  });

  const handleInput = (e: Event & { currentTarget: HTMLInputElement }) => {
    const value = e.currentTarget.value;
    context.setSearch(value);
    if (local.onInput) {
      (local.onInput as any)(e);
    }
  };

  return (
    <div class="flex items-center border-b border-border px-3">
      <Show
        when={!context.loading?.()}
        fallback={
          <div class="h-4 w-4 mr-2 shrink-0 opacity-50 flex items-center justify-center animate-spin">
            <div class={cn("h-4 w-4", icon("loader-circle"))} />
          </div>
        }
      >
        <div class={cn("h-4 w-4 mr-2 shrink-0 opacity-50", icon("search"))} />
      </Show>
      <input
        ref={inputRef}
        type="text"
        class={cn(
          "flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          local.class,
        )}
        placeholder={local.placeholder || "Type a command or search..."}
        value={context.search()}
        onInput={handleInput}
        {...others}
      />
    </div>
  );
};

// Command List
interface CommandListProps {
  children?: JSX.Element;
  class?: string;
}

export const CommandList = (props: CommandListProps) => {
  const [local, others] = splitProps(props, ["children", "class"]);
  const context = useCommandContext();
  let listRef: HTMLDivElement | undefined;

  // Keyboard navigation - only count actually visible items
  const handleKeyDown = (e: KeyboardEvent) => {
    const allItems = context.getItems();
    const searchValue = context.search();

    // Filter to only visible items based on search
    const visibleItems = allItems.filter((item) => {
      if (item.disabled) return false;

      if (!searchValue) return true;

      const value = item.value.toLowerCase();
      const search = searchValue.toLowerCase();

      if (value.includes(search)) return true;

      if (item.keywords) {
        return item.keywords.some((keyword) =>
          keyword.toLowerCase().includes(search),
        );
      }

      return false;
    });

    const maxIndex = visibleItems.length - 1;

    if (maxIndex < 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const currentIndex = context.selectedIndex();
      const next = currentIndex + 1;
      if (context.loop) {
        context.setSelectedIndex(next > maxIndex ? 0 : next);
      } else {
        context.setSelectedIndex(Math.min(next, maxIndex));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const currentIndex = context.selectedIndex();
      const next = currentIndex - 1;
      if (context.loop) {
        context.setSelectedIndex(next < 0 ? maxIndex : next);
      } else {
        context.setSelectedIndex(Math.max(next, 0));
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selectedItem = visibleItems[context.selectedIndex()];

      if (selectedItem && !selectedItem.disabled) {
        selectedItem.onSelect?.();
        context.onSelect?.(selectedItem.value);
      }
    }
  };

  onMount(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleKeyDown);
    }
  });

  onCleanup(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("keydown", handleKeyDown);
    }
  });

  // Scroll selected item into view
  createEffect(() => {
    const index = context.selectedIndex();
    if (listRef) {
      const items = listRef.querySelectorAll('[role="option"]');
      const selectedElement = items[index] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  });

  return (
    <div
      ref={listRef}
      class={cn(
        "max-h-[400px] overflow-y-auto overflow-x-hidden p-1",
        local.class,
      )}
      role="listbox"
      {...others}
    >
      {local.children}
    </div>
  );
};

// Command Empty
interface CommandEmptyProps {
  children?: JSX.Element;
  class?: string;
}

export const CommandEmpty = (props: CommandEmptyProps) => {
  const [local, others] = splitProps(props, ["children", "class"]);
  const context = useCommandContext();

  // Show empty when search is active but no items are visible
  const shouldShow = createMemo(() => {
    if (context.loading?.()) return false;
    const searchValue = context.search();
    if (!searchValue) return false;

    // Check if any items are actually visible
    const allItems = context.getItems();
    const hasVisibleItems = allItems.some((item) => {
      const value = item.value.toLowerCase();
      const search = searchValue.toLowerCase();

      if (value.includes(search)) return true;

      if (item.keywords) {
        return item.keywords.some((keyword) =>
          keyword.toLowerCase().includes(search),
        );
      }

      return false;
    });

    return !hasVisibleItems;
  });

  return (
    <Show when={shouldShow()}>
      <div
        class={cn(
          "py-6 text-center text-sm text-muted-foreground",
          local.class,
        )}
        {...others}
      >
        {local.children || "No results found."}
      </div>
    </Show>
  );
};

// Command Loading
interface CommandLoadingProps {
  children?: JSX.Element;
  class?: string;
}

export const CommandLoading = (props: CommandLoadingProps) => {
  const [local, others] = splitProps(props, ["children", "class"]);
  const context = useCommandContext();

  return (
    <Show when={context.loading?.()}>
      <div
        class={cn(
          "py-6 text-center text-sm text-muted-foreground",
          local.class,
        )}
        {...others}
      >
        {local.children || "Loading..."}
      </div>
    </Show>
  );
};

// Command Group
interface CommandGroupProps {
  children?: JSX.Element;
  heading?: string;
  class?: string;
}

export const CommandGroup = (props: CommandGroupProps) => {
  const [local, others] = splitProps(props, ["children", "heading", "class"]);
  const context = useCommandContext();
  const [groupId] = createSignal(
    `command-group-${Math.random().toString(36).substr(2, 9)}`,
  );
  const [visibleItemIds, setVisibleItemIds] = createSignal<Set<string>>(
    new Set(),
  );

  // Track visible items in this group
  const registerGroupItem = (id: string) => {
    setVisibleItemIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const unregisterGroupItem = (id: string) => {
    setVisibleItemIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  // Check if group has any visible items
  const hasVisibleItems = createMemo(() => {
    return visibleItemIds().size > 0;
  });

  return (
    <CommandGroupContext.Provider
      value={{ groupId: groupId(), registerGroupItem, unregisterGroupItem }}
    >
      <div
        class={cn(
          "overflow-hidden p-1",
          !hasVisibleItems() && "hidden",
          local.class,
        )}
        role="group"
        {...others}
      >
        <Show when={local.heading}>
          <div class="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
            {local.heading}
          </div>
        </Show>
        <div class="space-y-1">{local.children}</div>
      </div>
    </CommandGroupContext.Provider>
  );
};

// Command Item
interface CommandItemProps {
  children?: JSX.Element;
  value?: string;
  disabled?: boolean;
  onSelect?: () => void;
  keywords?: string[];
  class?: string;
}

export const CommandItem = (props: CommandItemProps) => {
  const [local, others] = splitProps(props, [
    "children",
    "value",
    "disabled",
    "onSelect",
    "keywords",
    "class",
  ]);

  const context = useCommandContext();
  const [id] = createSignal(
    `command-item-${Math.random().toString(36).substr(2, 9)}`,
  );
  const [visibleIndex, setVisibleIndex] = createSignal(-1);

  // Filter based on search - hide non-matching items
  const isVisible = createMemo(() => {
    const searchValue = context.search();
    if (!searchValue) return true;

    const value = local.value?.toLowerCase() || "";
    const search = searchValue.toLowerCase();

    // Check value
    if (value.includes(search)) return true;

    // Check keywords
    if (local.keywords) {
      return local.keywords.some((keyword) =>
        keyword.toLowerCase().includes(search),
      );
    }

    return false;
  });

  const groupContext = useCommandGroupContext();

  // Always register item with context on mount
  onMount(() => {
    const itemData: CommandItemData = {
      id: id(),
      value: local.value || "",
      disabled: local.disabled,
      keywords: local.keywords,
      onSelect: local.onSelect,
    };
    context.registerItem(itemData);

    // Register with group immediately on mount (all items start visible)
    groupContext?.registerGroupItem(id());
  });

  // Track visibility with group (separate from context registration)
  createEffect(() => {
    if (isVisible()) {
      groupContext?.registerGroupItem(id());
    } else {
      groupContext?.unregisterGroupItem(id());
    }
  });

  // Cleanup on unmount
  onCleanup(() => {
    context.unregisterItem(id());
    groupContext?.unregisterGroupItem(id());
  });

  // Calculate visible index among actually visible items (considering search)
  createEffect(() => {
    if (!isVisible()) {
      setVisibleIndex(-1);
      return;
    }

    // Trigger on item count change and search, but get items without tracking
    context.itemCount();
    const searchValue = context.search();
    const allItems = untrack(() => context.getItems());

    // Filter to only visible items based on search
    const visibleItems = allItems.filter((item) => {
      if (item.disabled) return false;

      if (!searchValue) return true;

      const value = item.value.toLowerCase();
      const search = searchValue.toLowerCase();

      if (value.includes(search)) return true;

      if (item.keywords) {
        return item.keywords.some((keyword) =>
          keyword.toLowerCase().includes(search),
        );
      }

      return false;
    });

    const myIndex = visibleItems.findIndex((item) => item.id === id());
    setVisibleIndex(myIndex);
  });

  const isSelected = createMemo(
    () => context.selectedIndex() === visibleIndex(),
  );

  const handleClick = () => {
    if (!local.disabled) {
      local.onSelect?.();
      context.onSelect?.(local.value || "");
    }
  };

  const handleMouseEnter = () => {
    if (!local.disabled && visibleIndex() >= 0) {
      context.setSelectedIndex(visibleIndex());
    }
  };

  return (
    <Show when={isVisible()}>
      <div
        class={cn(
          "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none",
          isSelected()
            ? "bg-accent text-accent-foreground"
            : "hover:bg-accent/50 hover:text-accent-foreground",
          local.disabled && "pointer-events-none opacity-50",
          local.class,
        )}
        role="option"
        aria-selected={isSelected()}
        aria-disabled={local.disabled}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        {...others}
      >
        {local.children}
      </div>
    </Show>
  );
};

// Command Separator
interface CommandSeparatorProps {
  class?: string;
}

export const CommandSeparator = (props: CommandSeparatorProps) => {
  const context = useCommandContext();

  // Hide separator when no search or when groups around it are empty
  const isVisible = createMemo(() => {
    const searchValue = context.search();
    if (!searchValue) return true;

    // If there's a search, only show if there are visible items
    const allItems = context.getItems();
    return allItems.some((item) => {
      const value = item.value.toLowerCase();
      const search = searchValue.toLowerCase();

      if (value.includes(search)) return true;

      if (item.keywords) {
        return item.keywords.some((keyword) =>
          keyword.toLowerCase().includes(search),
        );
      }

      return false;
    });
  });

  return (
    <Show when={isVisible()}>
      <div
        class={cn("-mx-1 h-px bg-border my-1", props.class)}
        role="separator"
      />
    </Show>
  );
};

// Command Shortcut
interface CommandShortcutProps {
  children?: JSX.Element;
  class?: string;
}

export const CommandShortcut = (props: CommandShortcutProps) => {
  const [local, others] = splitProps(props, ["children", "class"]);

  return (
    <span
      class={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        local.class,
      )}
      {...others}
    >
      {local.children}
    </span>
  );
};

// Command Dialog - wrapper for modal command menu
interface CommandDialogProps {
  children?: JSX.Element;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  class?: string;
}

export const CommandDialog = (props: CommandDialogProps) => {
  const [local, others] = splitProps(props, [
    "children",
    "open",
    "onOpenChange",
    "class",
  ]);

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      local.onOpenChange?.(false);
    }
  };

  createEffect(() => {
    if (typeof window === "undefined") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && local.open) {
        local.onOpenChange?.(false);
      }
    };

    if (local.open) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    onCleanup(() => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    });
  });

  return (
    <Portal>
      <Presence exitBeforeEnter>
        <Show when={local.open}>
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            onClick={handleBackdropClick}
          />
        </Show>
      </Presence>

      <div class="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4 pointer-events-none">
        <Presence exitBeforeEnter>
          <Show when={local.open}>
            <Motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{
                duration: 0.2,
                easing: [0.16, 1, 0.3, 1],
              }}
              class={cn(
                "w-full max-w-[640px] overflow-hidden rounded-lg border border-border bg-background shadow-2xl pointer-events-auto",
                local.class,
              )}
              {...others}
            >
              {local.children}
            </Motion.div>
          </Show>
        </Presence>
      </div>
    </Portal>
  );
};

// Import components for examples
import { Button } from "./button";

export const meta: ComponentMeta<CommandProps> = {
  name: "Command",
  description:
    "A command menu component with keyboard navigation, search filtering, and Raycast-like styling. Fully declarative API with support for static and async content.",
  examples: [
    {
      title: "Basic Command Menu",
      description: "A simple command menu with static items and groups",
      code: () => {
        const [selected, setSelected] = createSignal<string>("");

        return (
          <div class="flex flex-col gap-4">
            <Command
              class="rounded-lg border shadow-md md:min-w-[450px]"
              onSelect={(value) => setSelected(value)}
            >
              <CommandInput placeholder="Type a command or search..." />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Suggestions">
                  <CommandItem value="calendar">
                    <div class={cn("h-4 w-4 mr-2", icon("calendar"))} />
                    <span>Calendar</span>
                  </CommandItem>
                  <CommandItem value="search-emoji">
                    <div class={cn("h-4 w-4 mr-2", icon("smile"))} />
                    <span>Search Emoji</span>
                  </CommandItem>
                  <CommandItem value="calculator" disabled>
                    <div class={cn("h-4 w-4 mr-2", icon("calculator"))} />
                    <span>Calculator</span>
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Settings">
                  <CommandItem value="profile">
                    <div class={cn("h-4 w-4 mr-2", icon("user"))} />
                    <span>Profile</span>
                    <CommandShortcut>⌘P</CommandShortcut>
                  </CommandItem>
                  <CommandItem value="billing">
                    <div class={cn("h-4 w-4 mr-2", icon("credit-card"))} />
                    <span>Billing</span>
                    <CommandShortcut>⌘B</CommandShortcut>
                  </CommandItem>
                  <CommandItem value="settings">
                    <div class={cn("h-4 w-4 mr-2", icon("settings"))} />
                    <span>Settings</span>
                    <CommandShortcut>⌘S</CommandShortcut>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
            <Show when={selected()}>
              <p class="text-sm text-muted-foreground">
                Selected: <strong>{selected()}</strong>
              </p>
            </Show>
          </div>
        );
      },
    },
    {
      title: "Command Dialog",
      description: "Command menu in a modal dialog with keyboard shortcut",
      code: () => {
        const [open, setOpen] = createSignal(false);

        // Keyboard shortcut to open (Cmd+K or Ctrl+K)
        createEffect(() => {
          if (typeof window === "undefined") return;

          const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
              e.preventDefault();
              setOpen((prev) => !prev);
            }
          };

          window.addEventListener("keydown", handleKeyDown);
          return () => window.removeEventListener("keydown", handleKeyDown);
        });

        return (
          <>
            <div class="flex flex-col gap-4">
              <p class="text-sm text-muted-foreground">
                Press{" "}
                <kbd class="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span class="text-xs">⌘</span>K
                </kbd>{" "}
                to open the command menu
              </p>
              <Button onClick={() => setOpen(true)}>Open Command Menu</Button>
            </div>

            <CommandDialog open={open()} onOpenChange={setOpen}>
              <Command>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup heading="Suggestions">
                    <CommandItem
                      value="calendar"
                      onSelect={() => setOpen(false)}
                    >
                      <div class={cn("h-4 w-4 mr-2", icon("calendar"))} />
                      <span>Calendar</span>
                    </CommandItem>
                    <CommandItem
                      value="search-emoji"
                      onSelect={() => setOpen(false)}
                    >
                      <div class={cn("h-4 w-4 mr-2", icon("smile"))} />
                      <span>Search Emoji</span>
                    </CommandItem>
                    <CommandItem
                      value="calculator"
                      onSelect={() => setOpen(false)}
                    >
                      <div class={cn("h-4 w-4 mr-2", icon("calculator"))} />
                      <span>Calculator</span>
                    </CommandItem>
                  </CommandGroup>
                  <CommandSeparator />
                  <CommandGroup heading="Settings">
                    <CommandItem
                      value="profile"
                      onSelect={() => setOpen(false)}
                    >
                      <div class={cn("h-4 w-4 mr-2", icon("user"))} />
                      <span>Profile</span>
                      <CommandShortcut>⌘P</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                      value="billing"
                      onSelect={() => setOpen(false)}
                    >
                      <div class={cn("h-4 w-4 mr-2", icon("credit-card"))} />
                      <span>Billing</span>
                      <CommandShortcut>⌘B</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                      value="settings"
                      onSelect={() => setOpen(false)}
                    >
                      <div class={cn("h-4 w-4 mr-2", icon("settings"))} />
                      <span>Settings</span>
                      <CommandShortcut>⌘S</CommandShortcut>
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </CommandDialog>
          </>
        );
      },
    },
    {
      title: "With Async Search",
      description: "Command menu with async data loading (simulated API)",
      code: () => {
        const mockData = [
          { id: 1, title: "React Documentation", category: "Frameworks" },
          { id: 2, title: "Solid.js Guide", category: "Frameworks" },
          { id: 3, title: "Vue.js Tutorial", category: "Frameworks" },
          { id: 4, title: "Svelte Handbook", category: "Frameworks" },
          { id: 5, title: "TypeScript Docs", category: "Languages" },
          { id: 6, title: "JavaScript Guide", category: "Languages" },
          { id: 7, title: "CSS Tricks", category: "Styling" },
          { id: 8, title: "Tailwind CSS", category: "Styling" },
        ];

        const [items, setItems] = createSignal<typeof mockData>([]);
        const [loading, setLoading] = createSignal(false);
        let searchTimeout: number | undefined;

        const fakeApiSearch = (query: string): Promise<typeof mockData> => {
          return new Promise((resolve) => {
            setTimeout(() => {
              const filtered = mockData.filter(
                (item) =>
                  item.title.toLowerCase().includes(query.toLowerCase()) ||
                  item.category.toLowerCase().includes(query.toLowerCase()),
              );
              resolve(filtered);
            }, 400);
          });
        };

        // Show first 4 items initially
        onMount(() => {
          setItems(mockData.slice(0, 4));
        });

        const handleSearch = (value: string) => {
          clearTimeout(searchTimeout);

          if (!value) {
            setItems(mockData.slice(0, 4));
            setLoading(false);
            return;
          }

          setLoading(true);
          searchTimeout = setTimeout(async () => {
            try {
              const results = await fakeApiSearch(value);
              setItems(results);
            } catch (error) {
              console.error("Search failed:", error);
            } finally {
              setLoading(false);
            }
          }, 300) as unknown as number;
        };

        return (
          <Command
            class="rounded-lg border shadow-md md:min-w-[450px]"
            onValueChange={handleSearch}
            loading={loading}
          >
            <CommandInput placeholder="Search documentation..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Results">
                <For each={items()}>
                  {(item) => (
                    <CommandItem value={item.title}>
                      <div class={cn("h-4 w-4 mr-2", icon("file-text"))} />
                      <div class="flex flex-col gap-0.5 overflow-hidden">
                        <span class="truncate">{item.title}</span>
                        <span class="text-xs text-muted-foreground truncate">
                          {item.category}
                        </span>
                      </div>
                    </CommandItem>
                  )}
                </For>
              </CommandGroup>
            </CommandList>
          </Command>
        );
      },
    },
  ],
};

export default Command;

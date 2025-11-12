import { JsonTreeView as ArkJsonTreeView } from "@ark-ui/solid/json-tree-view";
import type { Component } from "solid-js";
import { splitProps } from "solid-js";
import { cn } from "../lib/cn";
import { icon } from "../lib/icon";
import type { ComponentMeta } from "../lib/meta";

type JsonTreeViewProps = {
  data: any;
  label?: string;
  defaultExpandedDepth?: number;
  quotesOnKeys?: boolean;
  showNonenumerable?: boolean;
  maxPreviewItems?: number;
  collapseStringsAfterLength?: number;
  groupArraysAfterLength?: number;
  class?: string;
};

export const JsonTreeView: Component<JsonTreeViewProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "label", "data"]);

  return (
    <div class={cn("w-full", local.class)}>
      {local.label && (
        <div class="text-sm font-semibold mb-2">{local.label}</div>
      )}
      <ArkJsonTreeView.Root data={local.data} {...others}>
        <ArkJsonTreeView.Tree
          class={cn(
            "flex flex-col text-xs leading-relaxed font-mono",
            "[&_svg]:w-4 [&_svg]:h-4",
            // Data type colors
            "[&_[data-type='string']]:text-destructive",
            "[&_[data-type='number']]:text-primary",
            "[&_[data-type='boolean']]:text-[#f59e0b] [&_[data-type='boolean']]:font-semibold",
            "[&_[data-type='null']]:text-muted-foreground [&_[data-type='null']]:font-semibold [&_[data-type='null']]:italic",
            "[&_[data-type='undefined']]:text-muted-foreground [&_[data-type='undefined']]:font-semibold [&_[data-type='undefined']]:italic",
            // Kind-specific styles
            "[&_[data-kind='brace']]:text-foreground [&_[data-kind='brace']]:font-bold",
            "[&_[data-kind='key']]:text-[#10b981] [&_[data-kind='key']]:font-medium",
            "[&_[data-kind='colon']]:text-muted-foreground [&_[data-kind='colon']]:mx-1",
            "[&_[data-type='function']]:text-[#f59e0b] [&_[data-type='function']]:italic",
            "[&_[data-type='date']]:text-primary",
            "[&_[data-type='error']]:text-destructive [&_[data-type='error']]:font-medium",
            "[&_[data-type='regex']]:text-accent-foreground",
            "[&_[data-kind='preview-text']]:text-muted-foreground [&_[data-kind='preview-text']]:italic",
            "[&_[data-kind='constructor']]:text-accent-foreground [&_[data-kind='constructor']]:font-medium",
            // Branch content positioning
            "[&_[data-part='branch-content']]:relative",
            // Indent guide styles
            "[&_[data-part='branch-indent-guide']]:h-full",
            "[&_[data-part='branch-indent-guide']]:w-px",
            "[&_[data-part='branch-indent-guide']]:bg-border",
            "[&_[data-part='branch-indent-guide']]:absolute",
            "[&_[data-part='branch-indent-guide']]:left-[calc((var(--depth)-1)*22px)]",
            "[&_[data-part='branch-indent-guide'][data-depth='1']]:left-3",
            // Branch control styles
            "[&_[data-part='branch-control']]:flex",
            "[&_[data-part='branch-control']]:items-center",
            "[&_[data-part='branch-control']]:gap-1.5",
            "[&_[data-part='branch-control']]:py-1.5",
            "[&_[data-part='branch-control']]:pe-1",
            "[&_[data-part='branch-control']]:ps-[calc((var(--depth)-1)*22px)]",
            "[&_[data-part='branch-control'][data-depth='1']]:ps-1",
            "[&_[data-part='branch-control']]:select-none",
            "[&_[data-part='branch-control']]:cursor-pointer",
            "[&_[data-part='branch-control']]:rounded-md",
            // Branch indicator (arrow) styles
            "[&_[data-part='branch-indicator']]:flex",
            "[&_[data-part='branch-indicator']]:items-center",
            "[&_[data-part='branch-indicator']]:justify-center",
            "[&_[data-part='branch-indicator']]:shrink-0",
            "[&_[data-part='branch-indicator']]:w-4",
            "[&_[data-part='branch-indicator']]:h-4",
            "[&_[data-part='branch-indicator']]:text-muted-foreground",
            "[&_[data-part='branch-indicator']]:transition-transform",
            "[&_[data-part='branch-indicator']]:duration-200",
            "[&_[data-part='branch-indicator']]:ease-out",
            "[&_[data-part='branch-indicator']]:origin-center",
            "[&_[data-part='branch-indicator'][data-state='open']]:rotate-90",
            // Item styles
            "[&_[data-part='item']]:flex",
            "[&_[data-part='item']]:items-center",
            "[&_[data-part='item']]:gap-2",
            "[&_[data-part='item']]:relative",
            "[&_[data-part='item']]:py-1.5",
            "[&_[data-part='item']]:px-1",
            "[&_[data-part='item']]:ps-[calc(var(--depth)*22px)]",
            "[&_[data-part='item']]:rounded-md",
            "[&_[data-part='item']]:cursor-pointer",
            // Item and branch text styles
            "[&_[data-part='item-text']]:flex",
            "[&_[data-part='item-text']]:items-center",
            "[&_[data-part='item-text']]:flex-1",
            "[&_[data-part='branch-text']]:flex",
            "[&_[data-part='branch-text']]:items-center",
            "[&_[data-part='branch-text']]:flex-1",
          )}
          arrow={<div class={cn("h-4 w-4", icon("chevron-right"))} />}
        />
        <style>
          {`
            /* Pure CSS for hover states - UnoCSS doesn't handle these correctly */
            [data-scope="json-tree-view"] [data-part="branch-control"]:hover {
              background-color: hsl(var(--accent));
              color: hsl(var(--accent-foreground));
            }

            [data-scope="json-tree-view"] [data-part="item"]:hover {
              background-color: hsl(var(--accent));
              color: hsl(var(--accent-foreground));
            }

            /* Fix branch control flex alignment and padding */
            [data-scope="json-tree-view"] [data-part="branch-control"] {
              display: flex;
              align-items: center;
              gap: 0.375rem;
              padding: 0 0.25rem;
              padding-left: calc((var(--depth) - 1) * 22px);
            }
            [data-scope="json-tree-view"] [data-part="branch-control"][data-depth="1"] {
              padding-left: 0.25rem;
            }

            /* Fix branch indicator alignment */
            [data-scope="json-tree-view"] [data-part="branch-indicator"] {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
            }

            /* Fix branch text alignment */
            [data-scope="json-tree-view"] [data-part="branch-text"] {
              display: flex;
              align-items: center;
            }

            /* Fix item indentation and padding */
            [data-scope="json-tree-view"] [data-part="item"] {
              padding: 0 0.25rem;
              padding-left: calc(var(--depth) * 22px);
            }

            /* Fix indent guide positioning */
            [data-scope="json-tree-view"] [data-part="branch-indent-guide"] {
              left: calc((var(--depth) - 1) * 22px);
            }
            [data-scope="json-tree-view"] [data-part="branch-indent-guide"][data-depth="1"] {
              left: 0.75rem;
            }
          `}
        </style>
      </ArkJsonTreeView.Root>
    </div>
  );
};

export const meta: ComponentMeta<JsonTreeViewProps> = {
  name: "JsonTreeView",
  description:
    "A component for displaying and exploring JSON data in a tree structure. Perfect for debugging, API responses, and configuration viewers.",
  examples: [
    {
      title: "Basic",
      description: "Display JSON data in a tree view with various data types",
      code: () => {
        return (
          <JsonTreeView
            label="User Data"
            data={{
              name: "John Doe",
              age: 30,
              email: "john.doe@example.com",
              balance: 1234.56,
              score: -42,
              isActive: true,
              isVerified: false,
              avatar: null,
              description: undefined,
              createdAt: new Date("2024-01-15T14:22:00.000Z"),
              lastLogin: new Date("2024-01-12T00:00:00.000Z"),
              tags: ["user", "premium", "verified"],
              scores: [95, 87, 92, 78, 100],
              address: {
                street: "123 Main St",
                city: "Anytown",
                state: "CA",
                zip: 12345,
                coordinates: {
                  lat: 37.7749,
                  lng: -122.4194,
                },
              },
              greet: (name: string) => `Hello, ${name}!`,
              emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              lastError: new Error("Something went wrong"),
              preferences: new Map([
                ["theme", "dark"],
                ["language", "en"],
                ["notifications", "enabled"],
              ]),
              visitedPages: new Set(["/home", "/profile", "/settings"]),
              mixedData: [
                "string",
                42,
                true,
                null,
                { nested: "object" },
                [1, 2, 3],
                new Date(),
              ],
            }}
          />
        );
      },
    },
    {
      title: "Expand Depth",
      description: "Control how many levels are expanded by default",
      code: () => {
        return (
          <JsonTreeView
            label="Configuration"
            defaultExpandedDepth={1}
            data={{
              server: {
                host: "localhost",
                port: 3000,
                ssl: {
                  enabled: true,
                  cert: "/path/to/cert",
                  key: "/path/to/key",
                },
              },
              database: {
                host: "db.example.com",
                port: 5432,
                credentials: {
                  username: "admin",
                  password: "********",
                },
              },
            }}
          />
        );
      },
    },
    {
      title: "Array Data",
      description: "Display arrays and nested structures",
      code: () => {
        return (
          <JsonTreeView
            label="API Response"
            data={{
              users: [
                { id: 1, name: "Alice", active: true },
                { id: 2, name: "Bob", active: false },
                { id: 3, name: "Charlie", active: true },
              ],
              meta: {
                total: 3,
                page: 1,
                perPage: 10,
              },
            }}
          />
        );
      },
    },
    {
      title: "Mixed Types",
      description: "Display various JavaScript data types",
      code: () => {
        return (
          <JsonTreeView
            label="Data Types"
            defaultExpandedDepth={2}
            data={{
              string: "Hello World",
              number: 42,
              boolean: true,
              null: null,
              undefined: undefined,
              array: [1, 2, 3, 4, 5],
              object: {
                nested: "value",
                deep: {
                  deeper: "data",
                },
              },
            }}
          />
        );
      },
    },
  ],
};

export default JsonTreeView;

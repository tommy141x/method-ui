import { JsonTreeView as ArkJsonTreeView } from "@ark-ui/solid/json-tree-view";
import type { Component } from "solid-js";
import { splitProps } from "solid-js";
import { cn } from "../lib/cn";
import { icon } from "../lib/icon";
import type { ComponentMeta } from "../lib/meta";

type JsonTreeViewProps = {
	data: unknown;
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
			{local.label && <div class="text-sm font-semibold mb-2">{local.label}</div>}
			<ArkJsonTreeView.Root data={local.data} {...others}>
				<ArkJsonTreeView.Tree
					class={cn(
						"flex flex-col text-xs leading-relaxed font-mono",
						"[&_svg]:w-4 [&_svg]:h-4",
						// Data type colors
						"**:data-[type='string']:text-destructive",
						"**:data-[type='number']:text-primary",
						"**:data-[type='boolean']:text-[#f59e0b] **:data-[type='boolean']:font-semibold",
						"**:data-[type='null']:text-muted-foreground **:data-[type='null']:font-semibold **:data-[type='null']:italic",
						"**:data-[type='undefined']:text-muted-foreground **:data-[type='undefined']:font-semibold **:data-[type='undefined']:italic",
						// Kind-specific styles
						"**:data-[kind='brace']:text-foreground **:data-[kind='brace']:font-bold",
						"**:data-[kind='key']:text-[#10b981] **:data-[kind='key']:font-medium",
						"**:data-[kind='colon']:text-muted-foreground **:data-[kind='colon']:mx-1",
						"**:data-[type='function']:text-[#f59e0b] **:data-[type='function']:italic",
						"**:data-[type='date']:text-primary",
						"**:data-[type='error']:text-destructive **:data-[type='error']:font-medium",
						"**:data-[type='regex']:text-accent-foreground",
						"**:data-[kind='preview-text']:text-muted-foreground **:data-[kind='preview-text']:italic",
						"**:data-[kind='constructor']:text-accent-foreground **:data-[kind='constructor']:font-medium",
						// Branch content positioning
						"**:data-[part='branch-content']:relative",
						// Indent guide styles
						"**:data-[part='branch-indent-guide']:h-full",
						"**:data-[part='branch-indent-guide']:w-px",
						"**:data-[part='branch-indent-guide']:bg-border",
						"**:data-[part='branch-indent-guide']:absolute",
						"**:data-[part='branch-indent-guide']:left-[calc((var(--depth)-1)*22px)]",
						"[&_[data-part='branch-indent-guide'][data-depth='1']]:left-3",
						// Branch control styles
						"**:data-[part='branch-control']:flex",
						"**:data-[part='branch-control']:items-center",
						"**:data-[part='branch-control']:gap-1.5",
						"**:data-[part='branch-control']:py-1.5",
						"**:data-[part='branch-control']:pe-1",
						"**:data-[part='branch-control']:ps-[calc((var(--depth)-1)*22px)]",
						"[&_[data-part='branch-control'][data-depth='1']]:ps-1",
						"**:data-[part='branch-control']:select-none",
						"**:data-[part='branch-control']:cursor-pointer",
						"**:data-[part='branch-control']:rounded-md",
						// Branch indicator (arrow) styles
						"**:data-[part='branch-indicator']:flex",
						"**:data-[part='branch-indicator']:items-center",
						"**:data-[part='branch-indicator']:justify-center",
						"**:data-[part='branch-indicator']:shrink-0",
						"**:data-[part='branch-indicator']:w-4",
						"**:data-[part='branch-indicator']:h-4",
						"**:data-[part='branch-indicator']:text-muted-foreground",
						"**:data-[part='branch-indicator']:transition-transform",
						"**:data-[part='branch-indicator']:duration-200",
						"**:data-[part='branch-indicator']:ease-out",
						"**:data-[part='branch-indicator']:origin-center",
						"[&_[data-part='branch-indicator'][data-state='open']]:rotate-90",
						// Item styles
						"**:data-[part='item']:flex",
						"**:data-[part='item']:items-center",
						"**:data-[part='item']:gap-2",
						"**:data-[part='item']:relative",
						"**:data-[part='item']:py-1.5",
						"**:data-[part='item']:px-1",
						"**:data-[part='item']:ps-[calc(var(--depth)*22px)]",
						"**:data-[part='item']:rounded-md",
						"**:data-[part='item']:cursor-pointer",
						// Item and branch text styles
						"**:data-[part='item-text']:flex",
						"**:data-[part='item-text']:items-center",
						"**:data-[part='item-text']:flex-1",
						"**:data-[part='branch-text']:flex",
						"**:data-[part='branch-text']:items-center",
						"**:data-[part='branch-text']:flex-1"
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
							mixedData: ["string", 42, true, null, { nested: "object" }, [1, 2, 3], new Date()],
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

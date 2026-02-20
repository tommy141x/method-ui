import { Listbox as ArkListbox, createListCollection } from "@ark-ui/solid";
import type { ListCollection } from "@zag-js/collection";
import { createContext, createMemo, For, type JSX, Show, splitProps } from "solid-js";
import IconCheck from "~icons/lucide/check";
import { cn } from "../lib/cn";
import type { ComponentMeta } from "../lib/meta";

// Context for Listbox
interface ListboxContextValue {
	items: ListboxItemData[];
}

interface ListboxItemData {
	value: string;
	label: string;
	disabled?: boolean;
	group?: string;
}

const ListboxContext = createContext<ListboxContextValue>();

// Main Listbox component - simple API
interface ListboxProps {
	children?: JSX.Element;
	value?: string[];
	defaultValue?: string[];
	onValueChange?: (details: { value: string[] }) => void;
	selectionMode?: "single" | "multiple";
	disabled?: boolean;
	loopFocus?: boolean;
	autoHighlight?: boolean;
	class?: string;
	label?: string;
	placeholder?: string;
}

export const Listbox = (props: ListboxProps) => {
	const [local, others] = splitProps(props, ["children", "class", "label", "placeholder"]);

	const itemsArray: ListboxItemData[] = [];

	const contextValue: ListboxContextValue = {
		items: itemsArray,
	};

	// Create collection with items
	const ListboxWithCollection = () => {
		const collection = createMemo(() => {
			const hasGroups = itemsArray.some((item) => item.group);

			if (hasGroups) {
				return createListCollection({
					items: itemsArray,
					groupBy: (item: ListboxItemData) => item.group || "",
				});
			}
			return createListCollection({
				items: itemsArray,
			});
		});

		return (
			<ArkListbox.Root
				collection={collection()}
				class={cn("flex flex-col gap-2", local.class)}
				{...others}
			>
				<Show when={local.label}>
					<ArkListbox.Label class="text-sm font-medium leading-none">
						{local.label}
					</ArkListbox.Label>
				</Show>
				<ArkListbox.Content class="flex flex-col gap-1 max-h-[300px] overflow-y-auto rounded-md border border-input bg-background p-1 shadow-md focus:outline-none">
					<Show when={local.placeholder}>
						<ArkListbox.Context>
							{(context) => (
								<Show when={context().value.length === 0}>
									<div class="px-3 py-2 text-sm text-muted-foreground">{local.placeholder}</div>
								</Show>
							)}
						</ArkListbox.Context>
					</Show>
					<Show
						when={collection().group}
						fallback={
							<For each={collection().items}>
								{(item: ListboxItemData) => (
									<ArkListbox.Item
										item={item}
										class="relative flex cursor-pointer select-none items-center justify-between rounded-sm px-3 py-2 text-sm outline-none transition-colors data-disabled:pointer-events-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:opacity-50 hover:bg-accent/50"
									>
										<ArkListbox.ItemText>
											{typeof item === "string" ? item : item.label}
										</ArkListbox.ItemText>
										<ArkListbox.ItemIndicator class="flex items-center justify-center h-4 w-4 shrink-0 transition-all duration-200 ease-out data-[state=checked]:animate-in data-[state=checked]:fade-in data-[state=checked]:zoom-in-50 [&[hidden]]:hidden">
											<IconCheck class="h-3 w-3" />
										</ArkListbox.ItemIndicator>
									</ArkListbox.Item>
								)}
							</For>
						}
					>
						<For each={collection().group()}>
							{([groupLabel, groupItems]: [string, ListboxItemData[]]) => (
								<ArkListbox.ItemGroup>
									<ArkListbox.ItemGroupLabel class="px-3 py-2 text-xs font-semibold text-muted-foreground">
										{groupLabel}
									</ArkListbox.ItemGroupLabel>
									<For each={groupItems}>
										{(item: ListboxItemData) => (
											<ArkListbox.Item
												item={item}
												class="relative flex cursor-pointer select-none items-center justify-between rounded-sm px-3 py-2 text-sm outline-none transition-colors data-disabled:pointer-events-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:opacity-50 hover:bg-accent/50 ml-2"
											>
												<ArkListbox.ItemText>{item.label}</ArkListbox.ItemText>
												<ArkListbox.ItemIndicator class="flex items-center justify-center h-4 w-4 shrink-0 transition-all duration-200 ease-out data-[state=checked]:animate-in data-[state=checked]:fade-in data-[state=checked]:zoom-in-50 [&[hidden]]:hidden">
													<IconCheck class="h-3 w-3" />
												</ArkListbox.ItemIndicator>
											</ArkListbox.Item>
										)}
									</For>
								</ArkListbox.ItemGroup>
							)}
						</For>
					</Show>
				</ArkListbox.Content>
			</ArkListbox.Root>
		);
	};

	return (
		<ListboxContext.Provider value={contextValue}>
			{local.children}
			<ListboxWithCollection />
		</ListboxContext.Provider>
	);
};

// ListboxItem for simple API
interface ListboxItemProps {
	value: string | ListboxItemData;
	children?: JSX.Element;
	disabled?: boolean;
	group?: string;
	class?: string;
}

export const ListboxItem = (props: ListboxItemProps) => {
	const [local, others] = splitProps(props, ["class", "children", "value"]);

	return (
		<ArkListbox.Item
			item={local.value}
			class={cn(
				"relative flex cursor-pointer select-none items-center justify-between rounded-sm px-3 py-2 text-sm outline-none transition-colors data-disabled:pointer-events-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:opacity-50 hover:bg-accent/50",
				local.class
			)}
			{...others}
		>
			<ArkListbox.ItemText>
				{local.children || (typeof local.value === "string" ? local.value : local.value.label)}
			</ArkListbox.ItemText>
			<ArkListbox.ItemIndicator class="flex items-center justify-center h-4 w-4 shrink-0 transition-all duration-200 ease-out data-[state=checked]:animate-in data-[state=checked]:fade-in data-[state=checked]:zoom-in-50 [&[hidden]]:hidden">
				<IconCheck class="h-3 w-3" />
			</ArkListbox.ItemIndicator>
		</ArkListbox.Item>
	);
};

// Composable API exports
export function ListboxRoot<T>(props: {
	children?: JSX.Element;
	collection: ListCollection<T>;
	value?: string[];
	defaultValue?: string[];
	onValueChange?: (details: { value: string[] }) => void;
	selectionMode?: "single" | "multiple";
	disabled?: boolean;
	loopFocus?: boolean;
	autoHighlight?: boolean;
	class?: string;
}) {
	const [local, others] = splitProps(props, ["class"]);
	return <ArkListbox.Root class={cn("flex flex-col gap-2", local.class)} {...others} />;
}

export const ListboxLabel = (props: { children?: JSX.Element; class?: string }) => {
	const [local, others] = splitProps(props, ["class"]);
	return (
		<ArkListbox.Label class={cn("text-sm font-medium leading-none", local.class)} {...others} />
	);
};

export const ListboxContent = (props: { children?: JSX.Element; class?: string }) => {
	const [local, others] = splitProps(props, ["class"]);
	return (
		<ArkListbox.Content
			class={cn(
				"flex flex-col gap-1 max-h-[300px] overflow-y-auto rounded-md border border-input bg-background p-1 shadow-md focus:outline-none",
				local.class
			)}
			{...others}
		/>
	);
};

export const ListboxItemComposable = (props: {
	item: ListboxItemData | string;
	children?: JSX.Element;
	class?: string;
	highlightOnHover?: boolean;
}) => {
	const [local, others] = splitProps(props, ["class"]);
	return (
		<ArkListbox.Item
			class={cn(
				"relative flex cursor-pointer select-none items-center justify-between rounded-sm px-3 py-2 text-sm outline-none transition-colors data-disabled:pointer-events-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:opacity-50 hover:bg-accent/50",
				local.class
			)}
			{...others}
		/>
	);
};

export const ListboxItemText = (props: { children?: JSX.Element; class?: string }) => {
	const [local, others] = splitProps(props, ["class"]);
	return <ArkListbox.ItemText class={cn(local.class)} {...others} />;
};

export const ListboxItemIndicator = (props: { children?: JSX.Element; class?: string }) => {
	const [local, others] = splitProps(props, ["class", "children"]);
	return (
		<ArkListbox.ItemIndicator
			class={cn(
				"flex items-center justify-center h-4 w-4 shrink-0 transition-all duration-200 ease-out data-[state=checked]:animate-in data-[state=checked]:fade-in data-[state=checked]:zoom-in-50 [&[hidden]]:hidden",
				local.class
			)}
			{...others}
		>
			{local.children || <IconCheck class="h-3 w-3" />}
		</ArkListbox.ItemIndicator>
	);
};

export const ListboxItemGroup = (props: { children?: JSX.Element; class?: string }) => {
	const [local, others] = splitProps(props, ["class"]);
	return <ArkListbox.ItemGroup class={cn(local.class)} {...others} />;
};

export const ListboxItemGroupLabel = (props: { children?: JSX.Element; class?: string }) => {
	const [local, others] = splitProps(props, ["class"]);
	return (
		<ArkListbox.ItemGroupLabel
			class={cn("px-3 py-2 text-xs font-semibold text-muted-foreground", local.class)}
			{...others}
		/>
	);
};

export const ListboxValueText = (props: {
	children?: JSX.Element;
	placeholder?: string;
	class?: string;
}) => {
	const [local, others] = splitProps(props, ["class"]);
	return <ArkListbox.ValueText class={cn(local.class)} {...others} />;
};

export const ListboxContextComponent = ArkListbox.Context;
export const ListboxEmpty = ArkListbox.Empty;

export const meta: ComponentMeta<ListboxProps> = {
	name: "Listbox",
	description:
		"A listbox component that allows users to select one or more options from a list. Use Listbox with ListboxItem for simple cases, or compose with ListboxRoot, ListboxContent, and other parts for full control.",
	examples: [
		{
			title: "Basic",
			description: "A simple listbox with framework options",
			code: () => {
				const collection = createListCollection({
					items: ["React", "Solid", "Vue", "Svelte"],
				});

				return (
					<ListboxRoot collection={collection}>
						<ListboxLabel>Select your Framework</ListboxLabel>
						<ListboxContent>
							<For each={collection.items}>
								{(item) => <ListboxItem value={item}>{item}</ListboxItem>}
							</For>
						</ListboxContent>
					</ListboxRoot>
				);
			},
		},
		{
			title: "Multiple Selection",
			description: "A listbox that allows selecting multiple items",
			code: () => {
				const collection = createListCollection({
					items: ["React", "Solid", "Vue", "Svelte"],
				});

				return (
					<ListboxRoot collection={collection} selectionMode="multiple">
						<ListboxLabel>Select Frameworks (Multiple)</ListboxLabel>
						<ListboxContent>
							<For each={collection.items}>
								{(item) => <ListboxItem value={item}>{item}</ListboxItem>}
							</For>
						</ListboxContent>
					</ListboxRoot>
				);
			},
		},
		{
			title: "With Groups",
			description: "A listbox with grouped items",
			code: () => {
				const collection = createListCollection({
					items: [
						{ label: "React", value: "react", type: "JS" },
						{ label: "Solid", value: "solid", type: "JS" },
						{ label: "Vue", value: "vue", type: "JS" },
						{ label: "Svelte", value: "svelte", type: "JS" },
						{ label: "Panda", value: "panda", type: "CSS" },
						{ label: "Tailwind", value: "tailwind", type: "CSS" },
					],
					groupBy: (item) => item.type,
				});

				return (
					<ListboxRoot collection={collection}>
						<ListboxLabel>Select your Frameworks</ListboxLabel>
						<ListboxContent>
							<For each={collection.group()}>
								{([type, group]) => (
									<ListboxItemGroup>
										<ListboxItemGroupLabel>{type}</ListboxItemGroupLabel>
										<For each={group}>
											{(item) => <ListboxItem value={item}>{item.label}</ListboxItem>}
										</For>
									</ListboxItemGroup>
								)}
							</For>
						</ListboxContent>
					</ListboxRoot>
				);
			},
		},
		{
			title: "With Disabled Items",
			description: "A listbox with some disabled options",
			code: () => {
				const collection = createListCollection({
					items: [
						{ label: "React", value: "react" },
						{ label: "Solid", value: "solid" },
						{ label: "Svelte", value: "svelte", disabled: true },
						{ label: "Vue", value: "vue" },
					],
				});

				return (
					<ListboxRoot collection={collection}>
						<ListboxLabel>Select your Framework</ListboxLabel>
						<ListboxContent>
							<For each={collection.items}>
								{(item) => <ListboxItem value={item}>{item.label}</ListboxItem>}
							</For>
						</ListboxContent>
					</ListboxRoot>
				);
			},
		},
	],
};

export default Listbox;

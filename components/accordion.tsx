import { Accordion as ArkAccordion } from "@ark-ui/solid";
import { cva } from "class-variance-authority";
import type { Component, JSX } from "solid-js";
import { splitProps } from "solid-js";
import IconChevronDown from "~icons/lucide/chevron-down";
import { cn } from "../lib/cn";
import type { ComponentMeta } from "../lib/meta";

const accordionItemVariants = cva("border-b border-border last:border-b-0", {
	variants: {
		variant: {
			default: "border-b border-border last:border-b-0",
			outlined: "border border-border rounded-lg mb-2 last:mb-0",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

const accordionTriggerVariants = cva(
	"flex w-full items-center justify-between py-4 font-medium transition-all hover:underline text-left disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:no-underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md outline-none",
	{
		variants: {
			variant: {
				default: "px-0",
				outlined: "px-4",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	}
);

const accordionContentVariants = cva("text-sm", {
	variants: {
		variant: {
			default: "",
			outlined: "",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

const accordionContentInnerVariants = cva("", {
	variants: {
		variant: {
			default: "px-0 pb-4 pt-0",
			outlined: "px-4 pb-4 pt-0",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

type AccordionProps = {
	children?: JSX.Element;
	value?: string[];
	defaultValue?: string[];
	onValueChange?: (details: { value: string[] }) => void;
	multiple?: boolean;
	collapsible?: boolean;
	disabled?: boolean;
	orientation?: "horizontal" | "vertical";
	class?: string;
};

export const Accordion: Component<AccordionProps> = (props) => {
	const [local, others] = splitProps(props, ["children", "class"]);
	return (
		<ArkAccordion.Root
			class={cn("w-full", local.class)}
			lazyMount={false}
			unmountOnExit={false}
			{...others}
		>
			<style>
				{`
          @keyframes accordion-slideDown {
            from {
              height: 0;
            }
            to {
              height: var(--height);
            }
          }

          @keyframes accordion-slideUp {
            from {
              height: var(--height);
            }
            to {
              height: 0;
            }
          }

          [data-scope="accordion"][data-part="item-content"][data-state="open"] {
            animation: accordion-slideDown 250ms cubic-bezier(0.16, 1, 0.3, 1);
            overflow: hidden;
          }

          [data-scope="accordion"][data-part="item-content"][data-state="closed"] {
            animation: accordion-slideUp 250ms cubic-bezier(0.16, 1, 0.3, 1);
            overflow: hidden;
          }
        `}
			</style>
			{local.children}
		</ArkAccordion.Root>
	);
};

type AccordionItemProps = {
	value: string;
	children?: JSX.Element;
	disabled?: boolean;
	class?: string;
	variant?: "default" | "outlined";
};

export const AccordionItem: Component<AccordionItemProps> = (props) => {
	const [local, variantProps, others] = splitProps(props, ["children", "class"], ["variant"]);
	return (
		<ArkAccordion.Item
			class={cn(accordionItemVariants({ variant: variantProps.variant }), local.class)}
			{...others}
		>
			{local.children}
		</ArkAccordion.Item>
	);
};

type AccordionTriggerProps = {
	children?: JSX.Element;
	class?: string;
	variant?: "default" | "outlined";
};

export const AccordionTrigger: Component<AccordionTriggerProps> = (props) => {
	const [local, variantProps, others] = splitProps(props, ["children", "class"], ["variant"]);
	return (
		<ArkAccordion.ItemTrigger
			class={cn(accordionTriggerVariants({ variant: variantProps.variant }), local.class)}
			{...others}
		>
			{local.children}
			<ArkAccordion.ItemIndicator class="transition-transform duration-200 data-[state=open]:rotate-180">
				<IconChevronDown class="h-4 w-4" />
			</ArkAccordion.ItemIndicator>
		</ArkAccordion.ItemTrigger>
	);
};

type AccordionContentProps = {
	children?: JSX.Element;
	class?: string;
	variant?: "default" | "outlined";
};

export const AccordionContent: Component<AccordionContentProps> = (props) => {
	const [local, variantProps, others] = splitProps(props, ["children", "class"], ["variant"]);

	return (
		<ArkAccordion.ItemContent
			class={cn(accordionContentVariants({ variant: variantProps.variant }), local.class)}
			{...others}
		>
			<div class={cn(accordionContentInnerVariants({ variant: variantProps.variant }))}>
				{local.children}
			</div>
		</ArkAccordion.ItemContent>
	);
};

type AccordionIndicatorProps = {
	class?: string;
};

export const AccordionIndicator: Component<AccordionIndicatorProps> = (props) => {
	const [local, others] = splitProps(props, ["class"]);
	return (
		<ArkAccordion.ItemIndicator
			class={cn("transition-transform duration-200 data-[state=open]:rotate-180", local.class)}
			{...others}
		>
			<IconChevronDown class="h-4 w-4" />
		</ArkAccordion.ItemIndicator>
	);
};

export const AccordionRoot = Accordion;

// Import components for examples only - won't count as dependencies
// since they're imported right before the meta export
import { Badge } from "./badge";

export const meta: ComponentMeta<AccordionProps> = {
	name: "Accordion",
	description:
		"A vertically stacked set of interactive headings that each reveal a section of content.",
	variants: accordionItemVariants,
	examples: [
		{
			title: "Basic",
			description: "Single item expansion by default",
			code: () => (
				<Accordion defaultValue={["react"]}>
					<AccordionItem value="react">
						<AccordionTrigger>What is React?</AccordionTrigger>
						<AccordionContent>
							<span class="text-muted-foreground">
								React is a JavaScript library for building user interfaces. It allows developers to
								create reusable UI components.
							</span>
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="solid">
						<AccordionTrigger>What is Solid?</AccordionTrigger>
						<AccordionContent>
							<span class="text-muted-foreground">
								SolidJS is a declarative, efficient, and flexible JavaScript library for building
								user interfaces with fine-grained reactivity.
							</span>
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="vue">
						<AccordionTrigger>What is Vue?</AccordionTrigger>
						<AccordionContent>
							<span class="text-muted-foreground">
								Vue is a progressive framework for building user interfaces, designed to be
								incrementally adoptable.
							</span>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			),
		},
		{
			title: "Collapsible",
			description: "Allow all panels to be closed",
			code: () => (
				<Accordion collapsible defaultValue={["react"]}>
					<AccordionItem value="react">
						<AccordionTrigger>Can I close all items?</AccordionTrigger>
						<AccordionContent>
							<span class="text-muted-foreground">
								Yes! With the collapsible prop, you can close all accordion items by clicking the
								open item.
							</span>
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="solid">
						<AccordionTrigger>Is it animated?</AccordionTrigger>
						<AccordionContent>
							<span class="text-muted-foreground">
								Absolutely. The accordion uses smooth CSS animations for opening and closing.
							</span>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			),
		},
		{
			title: "Multiple",
			description: "Allow multiple panels to be open simultaneously",
			code: () => (
				<Accordion multiple defaultValue={["react", "solid"]}>
					<AccordionItem value="react">
						<AccordionTrigger>Features</AccordionTrigger>
						<AccordionContent>
							<span class="text-muted-foreground">
								Full keyboard navigation, collapsible items, and smooth animations built-in.
							</span>
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="solid">
						<AccordionTrigger>Accessibility</AccordionTrigger>
						<AccordionContent>
							<span class="text-muted-foreground">
								Complies with WAI-ARIA design patterns and supports screen readers.
							</span>
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="vue">
						<AccordionTrigger>Styling</AccordionTrigger>
						<AccordionContent>
							<span class="text-muted-foreground">
								Fully customizable with Tailwind CSS and class variance authority.
							</span>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			),
		},
		{
			title: "Outlined",
			description: "Accordion with outlined styling",
			code: () => (
				<Accordion defaultValue={["installation"]}>
					<AccordionItem value="installation" variant="outlined">
						<AccordionTrigger variant="outlined">
							<div class="flex items-center gap-2">
								Installation
								<Badge variant="secondary" class="text-[10px] px-1.5 py-0">
									New
								</Badge>
							</div>
						</AccordionTrigger>
						<AccordionContent variant="outlined">
							<span class="text-muted-foreground">
								Install the package using your favorite package manager: npm install @ark-ui/solid
							</span>
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="usage" variant="outlined">
						<AccordionTrigger variant="outlined">Usage</AccordionTrigger>
						<AccordionContent variant="outlined">
							<span class="text-muted-foreground">
								Import the components and start building your accordion UI with full TypeScript
								support.
							</span>
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="customization" variant="outlined">
						<AccordionTrigger variant="outlined">
							<div class="flex items-center gap-2">
								Customization
								<Badge
									variant="outline"
									class="text-[10px] px-1.5 py-0 bg-green-500/10 text-green-700 border-green-500/20"
								>
									Updated
								</Badge>
							</div>
						</AccordionTrigger>
						<AccordionContent variant="outlined">
							<span class="text-muted-foreground">
								Use CVA variants and Tailwind classes to customize the look and feel.
							</span>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			),
		},
		{
			title: "Disabled",
			description: "Accordion with disabled items",
			code: () => (
				<Accordion defaultValue={["available"]}>
					<AccordionItem value="available">
						<AccordionTrigger>Available</AccordionTrigger>
						<AccordionContent>
							<span class="text-muted-foreground">
								This accordion item is available and can be toggled.
							</span>
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="disabled" disabled>
						<AccordionTrigger>Disabled</AccordionTrigger>
						<AccordionContent>
							<span class="text-muted-foreground">This item is disabled and cannot be opened.</span>
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="enabled">
						<AccordionTrigger>Enabled</AccordionTrigger>
						<AccordionContent>
							<span class="text-muted-foreground">This accordion item is also available.</span>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			),
		},
	],
};

export default Accordion;

import { Accordion as ArkAccordion } from "@ark-ui/solid";
import { cva } from "class-variance-authority";
import type { ClassValue } from "clsx";
import clsx from "clsx";
import type { Component, JSX } from "solid-js";
import { splitProps } from "solid-js";
import { unoMerge } from "unocss-merge";

// Hardcoded cn function - makes this component completely self-contained
function cn(...classLists: ClassValue[]) {
	return unoMerge(clsx(classLists));
}

// Icon helper function - returns UnoCSS icon class for your configured icon library
function icon(name: string): string {
	return `i-lucide-${name}`;
}

const accordionItemVariants = cva("border-b border-border", {
	variants: {
		variant: {
			default: "border-b border-border",
			outlined: "border border-border rounded-lg mb-2",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

const accordionTriggerVariants = cva(
	"flex w-full items-center justify-between py-4 font-medium transition-all hover:underline text-left disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:no-underline",
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
				<div class={cn("h-4 w-4", icon("chevron-down"))} />
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
			<style>
				{`
          @keyframes slideDown {
            from {
              height: 0;
            }
            to {
              height: var(--height);
            }
          }

          @keyframes slideUp {
            from {
              height: var(--height);
            }
            to {
              height: 0;
            }
          }

          [data-scope="accordion"][data-part="item-content"][data-state="open"] {
            animation: slideDown 250ms cubic-bezier(0.16, 1, 0.3, 1);
            overflow: hidden;
          }

          [data-scope="accordion"][data-part="item-content"][data-state="closed"] {
            animation: slideUp 250ms cubic-bezier(0.16, 1, 0.3, 1);
            overflow: hidden;
          }
        `}
			</style>
			{local.children}
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
			<div class={cn("h-4 w-4", icon("chevron-down"))} />
		</ArkAccordion.ItemIndicator>
	);
};

export const AccordionRoot = Accordion;

export default Accordion;

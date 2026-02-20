import { Toggle as ArkToggle } from "@ark-ui/solid/toggle";
import { cva } from "class-variance-authority";
import type { Component, JSX, ValidComponent } from "solid-js";
import { mergeProps, Show, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";
import IconLoaderCircle from "~icons/lucide/loader-circle";

import { cn } from "../lib/cn";
import type { ComponentMeta } from "../lib/meta";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [background-image:none]",
	{
		variants: {
			variant: {
				default:
					"!bg-primary text-primary-foreground hover:!bg-primary/90 data-[pressed]:!bg-primary/80",
				destructive:
					"!bg-destructive text-destructive-foreground hover:!bg-destructive/90 data-[pressed]:!bg-destructive/80",
				outline:
					"border border-input !bg-background text-foreground hover:!bg-accent hover:text-accent-foreground data-[pressed]:!bg-accent",
				secondary:
					"!bg-secondary text-secondary-foreground hover:!bg-secondary/80 data-[pressed]:!bg-secondary/70",
				ghost:
					"!bg-transparent text-foreground hover:!bg-accent hover:text-accent-foreground data-[pressed]:!bg-accent",
				link: "!bg-transparent text-primary underline-offset-4 hover:underline",
			},
			size: {
				default: "h-10 px-4 py-2",
				sm: "h-9 px-3 text-xs",
				lg: "h-11 px-8",
				icon: "size-8",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}
);

type ButtonProps = {
	variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
	size?: "default" | "sm" | "lg" | "icon";
	class?: string | undefined;
	children?: JSX.Element;
	toggle?: boolean;
	pressed?: boolean;
	defaultPressed?: boolean;
	onPressedChange?: (pressed: boolean) => void;
	// New props for loading state
	loading?: boolean;
	loadingText?: string;
	// New props for icons — pass a JSX element, e.g. <IconCheck />
	leftIcon?: JSX.Element;
	rightIcon?: JSX.Element;
	// Polymorphic as prop
	as?: ValidComponent;
	[key: string]: unknown;
};

const Button: Component<ButtonProps> = (props) => {
	const merged = mergeProps(
		{ variant: "default" as const, size: "default" as const, toggle: false },
		props
	);

	const [local, toggleProps, others] = splitProps(
		merged,
		[
			"variant",
			"size",
			"class",
			"toggle",
			"children",
			"loading",
			"loadingText",
			"leftIcon",
			"rightIcon",
			"disabled",
			"as",
		],
		["pressed", "defaultPressed", "onPressedChange"]
	);

	const isDisabled = () => !!(local.disabled || local.loading);

	const content = () => (
		<>
			<Show when={local.loading}>
				<IconLoaderCircle class="h-4 w-4 animate-spin" />
			</Show>
			<Show when={!local.loading && local.leftIcon} keyed>
				{(leftIcon) => leftIcon}
			</Show>
			<Show when={local.loading && local.loadingText} fallback={local.children}>
				{local.loadingText}
			</Show>
			<Show when={!local.loading && local.rightIcon} keyed>
				{(rightIcon) => rightIcon}
			</Show>
		</>
	);

	if (local.toggle) {
		return (
			<ArkToggle.Root
				pressed={toggleProps.pressed as unknown as boolean | undefined}
				defaultPressed={toggleProps.defaultPressed as unknown as boolean | undefined}
				onPressedChange={toggleProps.onPressedChange}
				disabled={isDisabled()}
				class={cn(buttonVariants({ variant: local.variant, size: local.size }), local.class)}
				{...others}
			>
				{content()}
			</ArkToggle.Root>
		);
	}

	// For polymorphic rendering without 'as' prop, use regular button
	if (!local.as) {
		return (
			<button
				disabled={isDisabled()}
				class={cn(buttonVariants({ variant: local.variant, size: local.size }), local.class)}
				{...others}
			>
				{content()}
			</button>
		);
	}

	// For polymorphic rendering with 'as' prop, use Dynamic
	// Don't pass disabled to non-button elements (like anchor tags)
	const isButtonElement = local.as === "button" || !local.as;
	const dynamicProps = isButtonElement ? { disabled: isDisabled() } : {};

	return (
		<Dynamic
			component={local.as}
			class={cn(buttonVariants({ variant: local.variant, size: local.size }), local.class)}
			{...dynamicProps}
			{...others}
		>
			{content()}
		</Dynamic>
	);
};

import { createSignal } from "solid-js";
// Example-only imports - removed during CLI transform
import IconAlignCenter from "~icons/lucide/align-center";
import IconAlignLeft from "~icons/lucide/align-left";
import IconAlignRight from "~icons/lucide/align-right";
import IconArrowRight from "~icons/lucide/arrow-right";
import IconDownload from "~icons/lucide/download";
import IconExternalLink from "~icons/lucide/external-link";
import IconPlus from "~icons/lucide/plus";
import IconSettings from "~icons/lucide/settings";

export const meta: ComponentMeta<ButtonProps> = {
	name: "Button",
	description:
		"A versatile button component with multiple variants and sizes. Supports toggle mode, loading states, and icons.",
	apiReference: "",
	variants: buttonVariants,
	examples: [
		{
			title: "Button Variants",
			description: "Different button styles",
			code: () => (
				<div class="flex gap-2">
					<Button variant="default">Default</Button>
					<Button variant="destructive">Destructive</Button>
					<Button variant="outline">Outline</Button>
					<Button variant="secondary">Secondary</Button>
					<Button variant="ghost">Ghost</Button>
					<Button variant="link">Link</Button>
				</div>
			),
		},
		{
			title: "Button Sizes",
			description: "Different button sizes",
			code: () => (
				<div class="flex gap-2 items-center">
					<Button size="sm">Small</Button>
					<Button size="default">Default</Button>
					<Button size="lg">Large</Button>
					<Button size="icon">⭐</Button>
				</div>
			),
		},
		{
			title: "With Icons",
			description: "Buttons with left and right icons",
			code: () => (
				<div class="flex gap-2 flex-wrap">
					<Button leftIcon={<IconPlus />}>New Item</Button>
					<Button rightIcon={<IconArrowRight />}>Continue</Button>
					<Button leftIcon={<IconDownload />} rightIcon={<IconExternalLink />}>
						Download
					</Button>
					<Button variant="outline" leftIcon={<IconSettings />}>
						Settings
					</Button>
				</div>
			),
		},
		{
			title: "Loading States",
			description: "Buttons with loading indicators",
			code: () => {
				const [loading1, setLoading1] = createSignal(false);
				const [loading2, setLoading2] = createSignal(false);
				return (
					<div class="flex gap-2 flex-wrap">
						<Button
							loading={loading1()}
							onClick={() => {
								setLoading1(true);
								setTimeout(() => setLoading1(false), 2000);
							}}
						>
							Click to Load
						</Button>
						<Button
							loading={loading2()}
							loadingText="Saving..."
							onClick={() => {
								setLoading2(true);
								setTimeout(() => setLoading2(false), 2000);
							}}
						>
							Save Changes
						</Button>
						<Button loading={true} loadingText="Processing...">
							Always Loading
						</Button>
					</div>
				);
			},
		},
		{
			title: "Toggle Button",
			description: "Button with toggle state",
			code: () => {
				const [pressed, setPressed] = createSignal(false);
				return (
					<div class="flex flex-col gap-2">
						<Button toggle pressed={pressed()} onPressedChange={setPressed} variant="outline">
							{pressed() ? "Pressed" : "Not Pressed"}
						</Button>
						<p class="text-sm text-muted-foreground">State: {pressed() ? "On" : "Off"}</p>
					</div>
				);
			},
		},
		{
			title: "Toggle Group",
			description: "Multiple toggle buttons styled as a group",
			code: () => {
				const [selected, setSelected] = createSignal("center");
				return (
					<div class="flex">
						<Button
							toggle
							pressed={selected() === "left"}
							onPressedChange={(pressed) => pressed && setSelected("left")}
							variant="outline"
							size="icon"
							class="rounded-l-md! rounded-r-none!"
						>
							<IconAlignLeft class="h-4 w-4" />
						</Button>
						<Button
							toggle
							pressed={selected() === "center"}
							onPressedChange={(pressed) => pressed && setSelected("center")}
							variant="outline"
							size="icon"
							class="rounded-none border-l-0"
						>
							<IconAlignCenter class="h-4 w-4" />
						</Button>
						<Button
							toggle
							pressed={selected() === "right"}
							onPressedChange={(pressed) => pressed && setSelected("right")}
							variant="outline"
							size="icon"
							class="rounded-r-md! rounded-l-none! border-l-0"
						>
							<IconAlignRight class="h-4 w-4" />
						</Button>
					</div>
				);
			},
		},
	],
};

export { Button, buttonVariants };
export type { ButtonProps };

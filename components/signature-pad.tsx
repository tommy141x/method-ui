import {
	SignaturePad as ArkSignaturePad,
	type SignaturePadRootProps,
} from "@ark-ui/solid/signature-pad";
import type { Component, JSX } from "solid-js";
import { createSignal, Show, splitProps } from "solid-js";
import { cn } from "../lib/cn";
import type { ComponentMeta } from "../lib/meta";

// Simple SignaturePad component - the easy way
type SignaturePadProps = Omit<SignaturePadRootProps, "class"> & {
	class?: string;
	label?: JSX.Element;
	showClearButton?: boolean;
	showGuide?: boolean;
};

export const SignaturePad: Component<SignaturePadProps> = (props) => {
	const [local, others] = splitProps(props, ["class", "label", "showClearButton", "showGuide"]);

	const showClear = local.showClearButton ?? true;
	const showGuide = local.showGuide ?? true;

	return (
		<ArkSignaturePad.Root class={cn("flex flex-col gap-1.5 w-full", local.class)} {...others}>
			<Show when={local.label}>
				<ArkSignaturePad.Label class="text-sm font-medium leading-none">
					{local.label}
				</ArkSignaturePad.Label>
			</Show>
			<ArkSignaturePad.Control class="relative border border-input rounded-lg bg-background min-h-52 min-w-0">
				<ArkSignaturePad.Segment class="fill-foreground w-full h-full absolute top-0 left-0 pointer-events-none" />
				<Show when={showClear}>
					<ArkSignaturePad.ClearTrigger class="absolute top-3 right-3 px-3 py-1.5 text-xs font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
						Clear
					</ArkSignaturePad.ClearTrigger>
				</Show>
				<Show when={showGuide}>
					<ArkSignaturePad.Guide class="absolute bottom-6 left-6 right-6 h-px border-b border-dashed border-border opacity-50" />
				</Show>
			</ArkSignaturePad.Control>
		</ArkSignaturePad.Root>
	);
};

// Composable API for advanced usage
export const SignaturePadRoot = ArkSignaturePad.Root;

export const SignaturePadLabel = (props: { children?: JSX.Element; class?: string }) => {
	const [local, others] = splitProps(props, ["class"]);
	return (
		<ArkSignaturePad.Label
			class={cn("text-sm font-medium leading-none", local.class)}
			{...others}
		/>
	);
};

export const SignaturePadControl = (props: { children?: JSX.Element; class?: string }) => {
	const [local, others] = splitProps(props, ["class"]);
	return (
		<ArkSignaturePad.Control
			class={cn(
				"relative border border-input rounded-lg bg-background min-h-52 min-w-0",
				local.class
			)}
			{...others}
		/>
	);
};

export const SignaturePadSegment = (props: { fill?: string; class?: string }) => {
	const [local, others] = splitProps(props, ["class"]);
	return (
		<ArkSignaturePad.Segment
			class={cn(
				"fill-foreground w-full h-full absolute top-0 left-0 pointer-events-none",
				local.class
			)}
			{...others}
		/>
	);
};

export const SignaturePadClearTrigger = (props: { children?: JSX.Element; class?: string }) => {
	const [local, others] = splitProps(props, ["class", "children"]);
	return (
		<ArkSignaturePad.ClearTrigger
			class={cn(
				"px-3 py-1.5 text-xs font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				local.class
			)}
			{...others}
		>
			{local.children || "Clear"}
		</ArkSignaturePad.ClearTrigger>
	);
};

export const SignaturePadGuide = (props: { class?: string }) => {
	const [local, others] = splitProps(props, ["class"]);
	return (
		<ArkSignaturePad.Guide
			class={cn("h-px border-b border-dashed border-border opacity-50", local.class)}
			{...others}
		/>
	);
};

export const SignaturePadHiddenInput = ArkSignaturePad.HiddenInput;

export const meta: ComponentMeta<SignaturePadProps> = {
	name: "SignaturePad",
	description:
		"A signature pad component for capturing handwritten signatures. Built on Ark UI SignaturePad - all Ark UI SignaturePad props are supported.",
	examples: [
		{
			title: "Basic",
			description: "A simple signature pad with label and clear button",
			code: () => {
				return <SignaturePad label="Sign below" />;
			},
		},
		{
			title: "With Image Preview",
			description: "Display a preview of the signature as an image",
			code: () => {
				const [imageUrl, setImageUrl] = createSignal("");

				return (
					<div class="flex flex-col gap-4 w-full max-w-2xl">
						<SignaturePad
							label="Sign below"
							onDrawEnd={(details) =>
								details.getDataUrl("image/png").then((url) => setImageUrl(url))
							}
						/>
						<Show when={imageUrl()}>
							<div class="border border-input rounded-lg p-4">
								<p class="text-sm font-medium mb-2">Preview:</p>
								<img src={imageUrl()} alt="Signature" class="max-w-full h-auto" />
							</div>
						</Show>
					</div>
				);
			},
		},
		{
			title: "Custom Stroke Color",
			description: "Signature pad with custom stroke color",
			code: () => {
				return <SignaturePad label="Sign in blue" drawing={{ fill: "#3b82f6", size: 2 }} />;
			},
		},
		{
			title: "Composable",
			description: "Build custom layouts with composable parts",
			code: () => {
				return (
					<SignaturePadRoot class="w-full max-w-2xl">
						<SignaturePadLabel>Please sign here</SignaturePadLabel>
						<SignaturePadControl class="h-64">
							<SignaturePadSegment />
							<SignaturePadClearTrigger class="absolute top-2 right-2">
								Reset
							</SignaturePadClearTrigger>
							<SignaturePadGuide class="absolute bottom-16 left-0 right-0" />
						</SignaturePadControl>
					</SignaturePadRoot>
				);
			},
		},
	],
};

export default SignaturePad;

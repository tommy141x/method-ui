import { RadioGroup as ArkRadioGroup } from "@ark-ui/solid/radio-group";
import type { Component, JSX } from "solid-js";
import { For } from "solid-js";
import { Motion } from "solid-motionone";
import { cn } from "../lib/cn";
import type { ComponentMeta } from "../lib/meta";

type RadioGroupProps = {
	children?: JSX.Element;
	value?: string;
	defaultValue?: string;
	onValueChange?: (details: { value: string | null }) => void;
	disabled?: boolean;
	form?: string;
	id?: string;
	ids?: Partial<{
		root: string;
		label: string;
		indicator: string;
		item: (value: string) => string;
		itemLabel: (value: string) => string;
		itemControl: (value: string) => string;
		itemHiddenInput: (value: string) => string;
	}>;
	name?: string;
	orientation?: "horizontal" | "vertical";
	readOnly?: boolean;
	class?: string;
};

export const RadioGroup: Component<RadioGroupProps> = (props) => {
	return <ArkRadioGroup.Root {...props} class={cn("flex flex-col gap-3", props.class)} />;
};

type RadioGroupLabelProps = {
	children?: JSX.Element;
	class?: string;
};

export const RadioGroupLabel: Component<RadioGroupLabelProps> = (props) => {
	return (
		<ArkRadioGroup.Label class={cn("text-sm font-medium leading-none", props.class)} {...props} />
	);
};

type RadioGroupItemProps = {
	value: string;
	children?: JSX.Element;
	class?: string;
	disabled?: boolean;
	invalid?: boolean;
};

export const RadioGroupItem: Component<RadioGroupItemProps> = (props) => {
	return (
		<ArkRadioGroup.Item
			value={props.value}
			disabled={props.disabled}
			invalid={props.invalid}
			class={cn(
				"flex items-center gap-2 cursor-pointer data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
				props.class
			)}
		>
			<ArkRadioGroup.ItemControl class="relative h-4 w-4 rounded-full border border-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 overflow-hidden">
				<ArkRadioGroup.ItemContext>
					{(context) => (
						<>
							{context().checked && (
								<Motion.div
									class="absolute inset-[2px] rounded-full bg-primary"
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{
										duration: 0.2,
										easing: [0.16, 1, 0.3, 1],
									}}
								/>
							)}
						</>
					)}
				</ArkRadioGroup.ItemContext>
			</ArkRadioGroup.ItemControl>
			<ArkRadioGroup.ItemText class="text-sm leading-none select-none">
				{props.children}
			</ArkRadioGroup.ItemText>
			<ArkRadioGroup.ItemHiddenInput />
		</ArkRadioGroup.Item>
	);
};

export const meta: ComponentMeta<RadioGroupProps> = {
	name: "RadioGroup",
	description:
		"A radio group component for selecting a single option from a list. Built on Ark UI RadioGroup - all Ark UI RadioGroup props are supported.",
	examples: [
		{
			title: "Horizontal",
			description: "A horizontal radio group with text options",
			code: () => {
				const sizes = ["Small", "Medium", "Large"];

				return (
					<RadioGroup defaultValue="Medium" orientation="horizontal" class="flex-row gap-4">
						<RadioGroupLabel>Size</RadioGroupLabel>
						<For each={sizes}>{(size) => <RadioGroupItem value={size}>{size}</RadioGroupItem>}</For>
					</RadioGroup>
				);
			},
		},
		{
			title: "With Icons",
			description: "Radio group with icons for each option",
			code: () => {
				const _frameworks = [
					{ value: "react", label: "React" },
					{ value: "solid", label: "Solid" },
					{ value: "vue", label: "Vue" },
					{ value: "svelte", label: "Svelte" },
				];

				return (
					<RadioGroup defaultValue="solid">
						<RadioGroupLabel>Framework</RadioGroupLabel>
						<RadioGroupItem value="react">
							<div class="flex items-center gap-2">
								<div class="h-4 w-4 i-lucide-atom" />
								<span>React</span>
							</div>
						</RadioGroupItem>
						<RadioGroupItem value="solid">
							<div class="flex items-center gap-2">
								<div class="h-4 w-4 i-lucide-box" />
								<span>Solid</span>
							</div>
						</RadioGroupItem>
						<RadioGroupItem value="vue">
							<div class="flex items-center gap-2">
								<div class="h-4 w-4 i-lucide-triangle" />
								<span>Vue</span>
							</div>
						</RadioGroupItem>
						<RadioGroupItem value="svelte">
							<div class="flex items-center gap-2">
								<div class="h-4 w-4 i-lucide-zap" />
								<span>Svelte</span>
							</div>
						</RadioGroupItem>
					</RadioGroup>
				);
			},
		},
		{
			title: "With Description",
			description: "Radio group with descriptions and disabled option",
			code: () => {
				const options = [
					{
						value: "starter",
						label: "Starter",
						desc: "Perfect for beginners",
						disabled: false,
					},
					{
						value: "pro",
						label: "Pro",
						desc: "For professional developers",
						disabled: false,
					},
					{
						value: "enterprise",
						label: "Enterprise",
						desc: "Advanced features for teams",
						disabled: true,
					},
				];

				return (
					<RadioGroup defaultValue="pro">
						<RadioGroupLabel>Select a plan</RadioGroupLabel>
						<For each={options}>
							{(option) => (
								<RadioGroupItem value={option.value} disabled={option.disabled}>
									<div class="flex flex-col gap-0.5">
										<span class="text-sm font-medium">{option.label}</span>
										<span class="text-xs text-muted-foreground">{option.desc}</span>
									</div>
								</RadioGroupItem>
							)}
						</For>
					</RadioGroup>
				);
			},
		},
	],
};

export default RadioGroup;

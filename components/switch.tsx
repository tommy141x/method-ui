import { Switch as ArkSwitch } from "@ark-ui/solid/switch";
import type { Component, JSX } from "solid-js";
import { createUniqueId } from "solid-js";
import { cn } from "../lib/cn";
import type { ComponentMeta } from "../lib/meta";

type SwitchProps = {
	checked?: boolean;
	defaultChecked?: boolean;
	onCheckedChange?: (details: { checked: boolean }) => void;
	disabled?: boolean;
	invalid?: boolean;
	readOnly?: boolean;
	required?: boolean;
	name?: string;
	value?: string | number;
	form?: string;
	id?: string;
	class?: string;
	children?: JSX.Element;
};

export const Switch: Component<SwitchProps> = (props) => {
	// Generate a unique ID if not provided
	const switchId = props.id || createUniqueId();

	return (
		<ArkSwitch.Root
			checked={props.checked}
			defaultChecked={props.defaultChecked}
			onCheckedChange={props.onCheckedChange}
			disabled={props.disabled}
			invalid={props.invalid}
			readOnly={props.readOnly}
			required={props.required}
			name={props.name}
			value={props.value}
			form={props.form}
			id={switchId}
			class={cn("inline-flex items-center gap-2 cursor-pointer", props.class)}
		>
			<ArkSwitch.Control class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed data-[disabled]:opacity-60 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input">
				<ArkSwitch.Thumb class="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform duration-200 ease-in-out data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0" />
			</ArkSwitch.Control>
			<ArkSwitch.Label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
				{props.children}
			</ArkSwitch.Label>
			<ArkSwitch.HiddenInput />
		</ArkSwitch.Root>
	);
};

export const meta: ComponentMeta<SwitchProps> = {
	name: "Switch",
	description:
		"A switch component for toggling between on and off states. Built on Ark UI Switch - all Ark UI Switch props are supported.",
	examples: [
		{
			title: "Basic",
			description: "A basic switch with text label",
			code: () => {
				return (
					<div class="flex items-center gap-2">
						<Switch />
						<span class="text-sm">Enable notifications</span>
					</div>
				);
			},
		},
		{
			title: "Default Checked",
			description: "A switch that is checked by default",
			code: () => {
				return (
					<div class="flex items-center gap-2">
						<Switch defaultChecked />
						<span class="text-sm">Auto-save</span>
					</div>
				);
			},
		},
		{
			title: "Disabled",
			description: "Disabled switches in both states",
			code: () => {
				return (
					<div class="space-y-2">
						<div class="flex items-center gap-2">
							<Switch disabled />
							<span class="text-sm">Disabled (off)</span>
						</div>
						<div class="flex items-center gap-2">
							<Switch disabled defaultChecked />
							<span class="text-sm">Disabled (on)</span>
						</div>
					</div>
				);
			},
		},
		{
			title: "With Change Handler",
			description: "A switch with a change event handler",
			code: () => {
				return (
					<div class="flex items-center gap-2">
						<Switch onCheckedChange={(details) => console.log("Checked:", details.checked)} />
						<span class="text-sm">Marketing emails</span>
					</div>
				);
			},
		},
	],
};

export default Switch;

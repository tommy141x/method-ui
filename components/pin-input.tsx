import { PinInput as ArkPinInput } from "@ark-ui/solid/pin-input";
import type { Component, JSX } from "solid-js";
import { Index } from "solid-js";
import { cn } from "../lib/cn";
import type { ComponentMeta } from "../lib/meta";

type PinInputProps = {
	value?: string[];
	defaultValue?: string[];
	onValueChange?: (details: { value: string[]; valueAsString: string }) => void;
	onValueComplete?: (details: { value: string[]; valueAsString: string }) => void;
	onValueInvalid?: (details: { value: string }) => void;
	count?: number;
	type?: "numeric" | "alphanumeric" | "alphabetic";
	mask?: boolean;
	otp?: boolean;
	placeholder?: string;
	disabled?: boolean;
	invalid?: boolean;
	readOnly?: boolean;
	required?: boolean;
	autoFocus?: boolean;
	blurOnComplete?: boolean;
	selectOnFocus?: boolean;
	name?: string;
	form?: string;
	id?: string;
	pattern?: string;
	class?: string;
	label?: JSX.Element;
};

export const PinInput: Component<PinInputProps> = (props) => {
	const count = () => props.count || 6;

	return (
		<ArkPinInput.Root
			value={props.value}
			defaultValue={props.defaultValue}
			onValueChange={props.onValueChange}
			onValueComplete={props.onValueComplete}
			onValueInvalid={props.onValueInvalid}
			count={count()}
			type={props.type}
			mask={props.mask}
			otp={props.otp}
			placeholder={props.placeholder}
			disabled={props.disabled}
			invalid={props.invalid}
			readOnly={props.readOnly}
			required={props.required}
			autoFocus={props.autoFocus}
			blurOnComplete={props.blurOnComplete}
			selectOnFocus={props.selectOnFocus}
			name={props.name}
			form={props.form}
			id={props.id}
			pattern={props.pattern}
			class={cn("flex flex-col gap-3", props.class)}
		>
			{props.label && (
				<ArkPinInput.Label class="text-sm font-medium leading-none">
					{props.label}
				</ArkPinInput.Label>
			)}
			<ArkPinInput.Control class="flex gap-2">
				<Index each={Array.from({ length: count() })}>
					{(_, index) => (
						<ArkPinInput.Input
							index={index}
							class="h-12 w-12 rounded-md border border-input bg-background text-center text-sm ring-offset-background transition-all duration-200 ease-out hover:border-ring/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 data-[invalid]:border-destructive"
						/>
					)}
				</Index>
			</ArkPinInput.Control>
			<ArkPinInput.HiddenInput />
		</ArkPinInput.Root>
	);
};

export const meta: ComponentMeta<PinInputProps> = {
	name: "PinInput",
	description:
		"A pin input component for entering sequences of digits or characters. Built on Ark UI PinInput - all Ark UI PinInput props are supported.",
	examples: [
		{
			title: "Basic",
			description: "A basic 6-digit pin input",
			code: () => {
				return (
					<PinInput
						label="Enter PIN"
						placeholder="○"
						onValueComplete={(e) => console.log("Complete:", e.valueAsString)}
					/>
				);
			},
		},
		{
			title: "4-Digit PIN",
			description: "A shorter 4-digit pin input",
			code: () => {
				return (
					<PinInput
						label="Security PIN"
						count={4}
						placeholder="○"
						onValueComplete={(e) => console.log("PIN:", e.valueAsString)}
					/>
				);
			},
		},
		{
			title: "OTP Code",
			description: "One-time password input with auto-complete",
			code: () => {
				return (
					<PinInput
						label="Verification Code"
						count={6}
						otp
						type="numeric"
						placeholder="0"
						onValueComplete={(e) => console.log("OTP:", e.valueAsString)}
					/>
				);
			},
		},
		{
			title: "Masked Input",
			description: "Pin input with masked values for security",
			code: () => {
				return (
					<PinInput
						label="Secure PIN"
						count={4}
						mask
						type="numeric"
						placeholder="○"
						onValueComplete={(_e) => console.log("Secure PIN entered")}
					/>
				);
			},
		},
		{
			title: "Alphanumeric",
			description: "Pin input that accepts letters and numbers",
			code: () => {
				return (
					<PinInput
						label="Activation Code"
						count={5}
						type="alphanumeric"
						placeholder="-"
						onValueComplete={(e) => console.log("Code:", e.valueAsString)}
					/>
				);
			},
		},
	],
};

export default PinInput;

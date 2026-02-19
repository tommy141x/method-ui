import { QrCode as ArkQrCode } from "@ark-ui/solid/qr-code";
import type { Component, JSX } from "solid-js";
import { cn } from "../lib/cn";
import type { ComponentMeta } from "../lib/meta";

type QrCodeProps = {
	value?: string;
	defaultValue?: string;
	onValueChange?: (details: { value: string }) => void;
	id?: string;
	class?: string;
	size?: number;
	encoding?: {
		ecc?: "L" | "M" | "Q" | "H";
		boostEcc?: boolean;
	};
	overlay?: () => JSX.Element;
};

export const QrCode: Component<QrCodeProps> = (props) => {
	const size = props.size || 200;

	return (
		<ArkQrCode.Root
			value={props.value}
			defaultValue={props.defaultValue}
			onValueChange={props.onValueChange}
			encoding={props.encoding}
			id={props.id}
			class={cn("flex flex-col items-center gap-4", props.class)}
		>
			<div
				class="relative inline-block"
				style={{
					width: `${size}px`,
					height: `${size}px`,
				}}
			>
				<ArkQrCode.Frame
					class="bg-white rounded-lg"
					style={{
						width: `${size}px`,
						height: `${size}px`,
					}}
				>
					<ArkQrCode.Pattern />
				</ArkQrCode.Frame>
				{props.overlay && (
					<ArkQrCode.Overlay class="absolute inset-0 flex items-center justify-center z-10">
						<div class="w-16 h-16 rounded-full ring-4 ring-white bg-white flex items-center justify-center overflow-hidden">
							{props.overlay()}
						</div>
					</ArkQrCode.Overlay>
				)}
			</div>
		</ArkQrCode.Root>
	);
};

export const meta: ComponentMeta<QrCodeProps> = {
	name: "QrCode",
	description:
		"A QR code component for generating scannable codes. Built on Ark UI QrCode - all Ark UI QrCode props are supported.",
	examples: [
		{
			title: "Basic",
			description: "A simple QR code with a URL",
			code: () => {
				return <QrCode value="https://github.com/ark-ui/ark" />;
			},
		},
		{
			title: "With Overlay",
			description: "A QR code with a logo overlay in the center",
			code: () => {
				return (
					<QrCode
						value="https://github.com/ark-ui/ark"
						encoding={{ ecc: "H" }}
						overlay={() => (
							<img src="https://ark-ui.com/icon-192.png" alt="Ark UI Logo" class="w-full h-full" />
						)}
					/>
				);
			},
		},
		{
			title: "Custom Size",
			description: "QR codes with different sizes",
			code: () => {
				return (
					<div class="flex gap-8 items-center">
						<QrCode value="https://github.com/ark-ui/ark" size={120} />
						<QrCode value="https://github.com/ark-ui/ark" size={200} />
						<QrCode value="https://github.com/ark-ui/ark" size={280} />
					</div>
				);
			},
		},
		{
			title: "Error Correction",
			description: "QR code with high error correction for better reliability",
			code: () => {
				return <QrCode value="https://github.com/ark-ui/ark" encoding={{ ecc: "H" }} />;
			},
		},
	],
};

export default QrCode;

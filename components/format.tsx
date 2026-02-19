import { Format as ArkFormat } from "@ark-ui/solid/format";
import { cva, type VariantProps } from "class-variance-authority";
import type { Component } from "solid-js";
import { Show, splitProps } from "solid-js";
import { cn } from "../lib/cn";
import type { ComponentMeta } from "../lib/meta";

const formatVariants = cva("inline", {
	variants: {
		variant: {
			number: "",
			byte: "",
			"relative-time": "",
		},
	},
	defaultVariants: {
		variant: "number",
	},
});

type FormatProps = VariantProps<typeof formatVariants> & {
	class?: string;
	// Number props
	value?: number | Date;
	locale?: string;
	// Number-specific
	style?: "decimal" | "currency" | "percent" | "unit" | "long" | "short" | "narrow";
	currency?: string;
	currencyDisplay?: "symbol" | "narrowSymbol" | "code" | "name";
	unit?: string | "bit" | "byte";
	unitDisplay?: "short" | "long" | "narrow";
	notation?: "standard" | "scientific" | "engineering" | "compact";
	compactDisplay?: "short" | "long";
	minimumFractionDigits?: number;
	maximumFractionDigits?: number;
	// Byte-specific
	unitSystem?: "decimal" | "binary";
	// Relative time-specific
	numeric?: "always" | "auto";
};

export const Format: Component<FormatProps> = (props) => {
	const [local, variants, others] = splitProps(props, ["class"], ["variant"]);

	const effectiveVariant = () => variants.variant ?? "number";

	const isNumber = () => effectiveVariant() === "number";
	const isByte = () => effectiveVariant() === "byte";
	const _isRelativeTime = () => effectiveVariant() === "relative-time";

	return (
		<Show
			when={isNumber()}
			fallback={
				<Show
					when={isByte()}
					fallback={
						<span class={cn(formatVariants(variants), local.class)}>
							{/* biome-ignore lint/suspicious/noExplicitAny: ark-ui type compatibility */}
							<ArkFormat.RelativeTime {...(others as any)} />
						</span>
					}
				>
					<span class={cn(formatVariants(variants), local.class)}>
						{/* biome-ignore lint/suspicious/noExplicitAny: ark-ui type compatibility */}
						<ArkFormat.Byte {...(others as any)} />
					</span>
				</Show>
			}
		>
			<span class={cn(formatVariants(variants), local.class)}>
				{/* biome-ignore lint/suspicious/noExplicitAny: ark-ui type compatibility */}
				<ArkFormat.Number {...(others as any)} />
			</span>
		</Show>
	);
};

export const meta: ComponentMeta<FormatProps> = {
	name: "Format",
	description:
		"Format numbers, bytes, and relative times with internationalization support and styling variants.",
	variants: formatVariants,
	apiReference: "https://ark-ui.com/docs/utilities/format-number",
	examples: [
		{
			title: "Number",
			description: "Format numbers with various styles",
			code: () => {
				return (
					<div class="flex flex-col gap-2 text-sm">
						<div>
							Number: <Format value={1450.45} class="font-bold" />
						</div>
						<div>
							Currency:{" "}
							<Format
								variant="number"
								value={1450.45}
								style="currency"
								currency="USD"
								class="font-bold"
							/>
						</div>
						<div>
							Percent: <Format variant="number" value={0.145} style="percent" class="font-bold" />
						</div>
					</div>
				);
			},
		},
		{
			title: "Byte",
			description: "Format byte sizes with automatic unit conversion",
			code: () => {
				return (
					<div class="flex flex-col gap-2 text-sm">
						<div>
							Small: <Format variant="byte" value={1450.45} class="font-bold" />
						</div>
						<div>
							Medium: <Format variant="byte" value={1024000} class="font-bold" />
						</div>
						<div>
							Large: <Format variant="byte" value={1048576} unitDisplay="long" class="font-bold" />
						</div>
					</div>
				);
			},
		},
		{
			title: "Relative Time",
			description: "Format dates as relative time",
			code: () => {
				const now = new Date();
				const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

				return (
					<div class="flex flex-col gap-2 text-sm">
						<div>
							Edited <Format variant="relative-time" value={yesterday} class="font-bold" />
						</div>
						<div>
							Updated{" "}
							<Format variant="relative-time" value={yesterday} style="short" class="font-bold" />
						</div>
					</div>
				);
			},
		},
	],
};

export default Format;

import { cva, type VariantProps } from "class-variance-authority";
import type { ClassValue } from "clsx";
import clsx from "clsx";
import type { Component, JSX } from "solid-js";
import { splitProps } from "solid-js";
import { unoMerge } from "unocss-merge";

// Hardcoded cn function - makes this component completely self-contained
function cn(...classLists: ClassValue[]) {
	return unoMerge(clsx(classLists));
}

const badgeVariants = cva(
	"inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
	{
		variants: {
			variant: {
				default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
				secondary:
					"border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
				destructive:
					"border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
				outline: "text-foreground",
			},
			clickable: {
				true: "cursor-pointer",
				false: "cursor-default",
			},
		},
		defaultVariants: {
			variant: "default",
			clickable: false,
		},
	}
);

export interface BadgeProps {
	children?: JSX.Element;
	variant?: VariantProps<typeof badgeVariants>["variant"];
	clickable?: boolean;
	onClick?: (event: MouseEvent) => void;
	class?: string;
}

export const Badge: Component<BadgeProps> = (props) => {
	const [local, variantProps, others] = splitProps(
		props,
		["children", "class", "onClick"],
		["variant", "clickable"]
	);

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: role is set dynamically to "button" when onClick or clickable is provided
		<div
			class={cn(
				badgeVariants({
					variant: variantProps.variant,
					clickable: variantProps.clickable,
				}),
				local.class
			)}
			role={local.onClick || variantProps.clickable ? "button" : undefined}
			tabIndex={local.onClick || variantProps.clickable ? 0 : undefined}
			onClick={local.onClick}
			onKeyDown={(e) => {
				if (local.onClick && (e.key === "Enter" || e.key === " ")) {
					e.preventDefault();
					local.onClick(e as unknown as MouseEvent);
				}
			}}
			{...others}
		>
			{local.children}
		</div>
	);
};

export default Badge;

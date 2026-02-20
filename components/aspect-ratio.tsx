import type { Component, JSX } from "solid-js";
import { splitProps } from "solid-js";
import { cn } from "../lib/cn";
import type { ComponentMeta } from "../lib/meta";

export interface AspectRatioProps {
	children?: JSX.Element;
	ratio?: number;
	class?: string;
}

export const AspectRatio: Component<AspectRatioProps> = (props) => {
	const [local, others] = splitProps(props, ["children", "ratio", "class"]);

	return (
		<div
			class={cn("relative w-full overflow-hidden", local.class)}
			style={{
				"padding-bottom": `${100 / (local.ratio ?? 1)}%`,
			}}
			{...others}
		>
			<div class="absolute inset-0">{local.children}</div>
		</div>
	);
};

// Example-only imports - removed during CLI transform
import IconImage from "~icons/lucide/image";

export const meta: ComponentMeta<AspectRatioProps> = {
	name: "AspectRatio",
	description:
		"A component for maintaining consistent aspect ratios for media content like images and videos.",
	apiReference: "",
	examples: [
		{
			title: "Basic",
			description: "Aspect ratio with custom content",
			code: () => (
				<AspectRatio ratio={16 / 9} class="bg-muted rounded-lg">
					<div class="flex items-center justify-center h-full">
						<div class="text-center">
							<IconImage class="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
							<p class="text-sm text-muted-foreground">16:9 Aspect Ratio</p>
						</div>
					</div>
				</AspectRatio>
			),
		},
		{
			title: "Different Ratios",
			description: "Common aspect ratios",
			code: () => (
				<div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
					<div>
						<p class="text-sm font-medium mb-2">16:9 (Widescreen)</p>
						<AspectRatio ratio={16 / 9} class="bg-muted rounded-lg">
							<div class="flex items-center justify-center h-full bg-linear-to-br from-blue-500 to-cyan-500">
								<span class="text-white font-mono text-lg font-semibold">16:9</span>
							</div>
						</AspectRatio>
					</div>
					<div>
						<p class="text-sm font-medium mb-2">4:3 (Standard)</p>
						<AspectRatio ratio={4 / 3} class="bg-muted rounded-lg">
							<div class="flex items-center justify-center h-full bg-linear-to-br from-green-500 to-emerald-500">
								<span class="text-white font-mono text-lg font-semibold">4:3</span>
							</div>
						</AspectRatio>
					</div>
					<div>
						<p class="text-sm font-medium mb-2">1:1 (Square)</p>
						<AspectRatio ratio={1 / 1} class="bg-muted rounded-lg">
							<div class="flex items-center justify-center h-full bg-linear-to-br from-orange-500 to-red-500">
								<span class="text-white font-mono text-lg font-semibold">1:1</span>
							</div>
						</AspectRatio>
					</div>
				</div>
			),
		},
	],
};

export default AspectRatio;

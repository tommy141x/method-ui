import type { Component, JSX } from "solid-js";
import { splitProps } from "solid-js";
import { cn } from "../lib/cn";
import type { ComponentMeta } from "../lib/meta";

interface SkeletonProps {
	class?: string;
	style?: JSX.CSSProperties;
}

export const Skeleton: Component<SkeletonProps> = (props) => {
	const [local, others] = splitProps(props, ["class"]);

	return <div class={cn("animate-pulse rounded-md bg-muted", local.class)} {...others} />;
};

export const meta: ComponentMeta<SkeletonProps> = {
	name: "Skeleton",
	description:
		"A skeleton component for displaying loading states. Use to show a placeholder while content is loading.",
	examples: [
		{
			title: "Basic",
			description: "Simple skeleton loader",
			code: () => (
				<div class="flex items-center space-x-4">
					<Skeleton class="h-12 w-12 rounded-full" />
					<div class="space-y-2">
						<Skeleton class="h-4 w-[250px]" />
						<Skeleton class="h-4 w-[200px]" />
					</div>
				</div>
			),
		},
		{
			title: "Card",
			description: "Skeleton for a card layout",
			code: () => (
				<div class="flex flex-col space-y-3">
					<Skeleton class="h-[125px] w-[250px] rounded-xl" />
					<div class="space-y-2">
						<Skeleton class="h-4 w-[250px]" />
						<Skeleton class="h-4 w-[200px]" />
					</div>
				</div>
			),
		},
		{
			title: "List",
			description: "Skeleton for a list of items",
			code: () => (
				<div class="space-y-4">
					<div class="flex items-center space-x-4">
						<Skeleton class="h-10 w-10 rounded-full" />
						<div class="space-y-2 flex-1">
							<Skeleton class="h-4 w-full" />
							<Skeleton class="h-3 w-3/4" />
						</div>
					</div>
					<div class="flex items-center space-x-4">
						<Skeleton class="h-10 w-10 rounded-full" />
						<div class="space-y-2 flex-1">
							<Skeleton class="h-4 w-full" />
							<Skeleton class="h-3 w-3/4" />
						</div>
					</div>
					<div class="flex items-center space-x-4">
						<Skeleton class="h-10 w-10 rounded-full" />
						<div class="space-y-2 flex-1">
							<Skeleton class="h-4 w-full" />
							<Skeleton class="h-3 w-3/4" />
						</div>
					</div>
				</div>
			),
		},
		{
			title: "Table",
			description: "Skeleton for a table layout",
			code: () => (
				<div class="w-full space-y-2">
					<Skeleton class="h-10 w-full" />
					<Skeleton class="h-10 w-full" />
					<Skeleton class="h-10 w-full" />
					<Skeleton class="h-10 w-full" />
					<Skeleton class="h-10 w-full" />
				</div>
			),
		},
	],
};

export default Skeleton;

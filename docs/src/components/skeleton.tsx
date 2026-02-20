import type { ClassValue } from "clsx";
import clsx from "clsx";
import type { Component, JSX } from "solid-js";
import { splitProps } from "solid-js";
import { unoMerge } from "unocss-merge";

function cn(...classLists: ClassValue[]) {
	return unoMerge(clsx(classLists));
}

interface SkeletonProps {
	class?: string;
	style?: JSX.CSSProperties;
}

export const Skeleton: Component<SkeletonProps> = (props) => {
	const [local, others] = splitProps(props, ["class"]);

	return <div class={cn("animate-pulse rounded-md bg-muted", local.class)} {...others} />;
};

export default Skeleton;

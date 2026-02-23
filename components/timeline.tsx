import type { Component, JSX } from "solid-js";
import { createSignal, For, mergeProps, Show, splitProps } from "solid-js";
import IconCheck from "~icons/lucide/check";
import IconCircleDot from "~icons/lucide/circle-dot";
import IconClock from "~icons/lucide/clock";
import IconHome from "~icons/lucide/home";
import IconMapPin from "~icons/lucide/map-pin";
import IconPackage from "~icons/lucide/package";
import IconTruck from "~icons/lucide/truck";
import { cn } from "../lib/cn";
import type { ComponentMeta } from "../lib/meta";

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Data shape for each item when using the assembled <Timeline> component.
 * Consumers build an array of these and hand it to `items`.
 */
export type TimelineItemData = {
	title: JSX.Element;
	description?: JSX.Element;
	/** Custom bullet content rendered inside the bullet circle. */
	bullet?: JSX.Element;
	/** Per-item override of the root `bulletSize`. */
	bulletSize?: number;
};

export interface TimelineProps extends Omit<JSX.HTMLAttributes<HTMLUListElement>, "children"> {
	items: TimelineItemData[];
	/**
	 * Index of the last *active* item (0-based).
	 *
	 * - `-1`  → nothing is active (all bullets and lines are inactive)
	 * -  `0`  → first bullet is active, no lines are active
	 * -  `1`  → first two bullets are active, first line is active
	 * - …and so on
	 *
	 * Defaults to `-1`.
	 */
	activeItem?: number;
	/** Diameter of every bullet circle in px. Default 16. */
	bulletSize?: number;
	/** Width of the vertical connector line in px. Default 2. */
	lineSize?: number;
	class?: string;
}

export interface TimelineItemProps extends Omit<JSX.HTMLAttributes<HTMLLIElement>, "title"> {
	title: JSX.Element;
	description?: JSX.Element;
	bullet?: JSX.Element;
	isLast?: boolean;
	/** Whether the connector line *below* this item is highlighted. */
	isActive?: boolean;
	/** Whether this item's bullet ring is highlighted. */
	isActiveBullet?: boolean;
	bulletSize?: number;
	lineSize?: number;
	class?: string;
}

export interface TimelineItemBulletProps extends JSX.HTMLAttributes<HTMLDivElement> {
	children?: JSX.Element;
	isActive?: boolean;
	bulletSize?: number;
	lineSize?: number;
	class?: string;
}

export interface TimelineItemTitleProps extends JSX.HTMLAttributes<HTMLDivElement> {
	children?: JSX.Element;
	class?: string;
}

export interface TimelineItemDescriptionProps extends JSX.HTMLAttributes<HTMLParagraphElement> {
	children?: JSX.Element;
	class?: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * The circular bullet marker on the left rail.
 * Positioned absolutely relative to its parent `<TimelineItem>`.
 */
export const TimelineItemBullet: Component<TimelineItemBulletProps> = (rawProps) => {
	const props = mergeProps({ bulletSize: 16, lineSize: 2 }, rawProps);
	const [local, others] = splitProps(props, [
		"children",
		"isActive",
		"bulletSize",
		"lineSize",
		"class",
	]);

	return (
		<div
			class={cn(
				"absolute top-0 flex items-center justify-center rounded-full border bg-background transition-colors",
				local.isActive ? "border-primary" : "border-border",
				local.class
			)}
			style={{
				width: `${local.bulletSize}px`,
				height: `${local.bulletSize}px`,
				left: `${-local.bulletSize / 2 - local.lineSize / 2}px`,
				"border-width": `${local.lineSize}px`,
			}}
			aria-hidden="true"
			{...others}
		>
			{local.children}
		</div>
	);
};

/** Title line for a timeline item. */
export const TimelineItemTitle: Component<TimelineItemTitleProps> = (props) => {
	const [local, others] = splitProps(props, ["class", "children"]);
	return (
		<div class={cn("mb-1 text-sm font-semibold leading-none", local.class)} {...others}>
			{local.children}
		</div>
	);
};

/** Supporting description text beneath the title. */
export const TimelineItemDescription: Component<TimelineItemDescriptionProps> = (props) => {
	const [local, others] = splitProps(props, ["class", "children"]);
	return (
		<p class={cn("text-sm text-muted-foreground", local.class)} {...others}>
			{local.children}
		</p>
	);
};

/**
 * A single row in the timeline. Can be used directly for custom/composable
 * layouts or rendered automatically by the assembled `<Timeline>` component.
 */
export const TimelineItem: Component<TimelineItemProps> = (rawProps) => {
	const props = mergeProps({ bulletSize: 16, lineSize: 2 }, rawProps);
	const [local, others] = splitProps(props, [
		"class",
		"bullet",
		"description",
		"title",
		"isLast",
		"isActive",
		"isActiveBullet",
		"bulletSize",
		"lineSize",
	]);

	return (
		<li
			class={cn(
				"relative border-l border-l-border pb-8 pl-8 transition-colors",
				// Last item: hide the tail and remove bottom padding
				local.isLast && "border-l-transparent pb-0",
				// Active line: the segment connecting this item to the next
				local.isActive && !local.isLast && "border-l-primary",
				local.class
			)}
			style={{
				"border-left-width": `${local.lineSize}px`,
			}}
			{...others}
		>
			<TimelineItemBullet
				lineSize={local.lineSize}
				bulletSize={local.bulletSize}
				isActive={local.isActiveBullet}
			>
				{local.bullet}
			</TimelineItemBullet>

			<TimelineItemTitle>{local.title}</TimelineItemTitle>

			<Show when={local.description}>
				<TimelineItemDescription>{local.description}</TimelineItemDescription>
			</Show>
		</li>
	);
};

// ─── Assembled component ──────────────────────────────────────────────────────

/**
 * Assembled data-driven timeline. Pass an array of `items` and an
 * `activeItem` index to render a complete timeline with progress tracking.
 *
 * For fully custom layouts compose `<TimelineItem>`, `<TimelineItemBullet>`,
 * `<TimelineItemTitle>`, and `<TimelineItemDescription>` directly inside a
 * plain `<ul>`.
 */
export const Timeline: Component<TimelineProps> = (rawProps) => {
	const props = mergeProps({ bulletSize: 16, lineSize: 2, activeItem: -1 }, rawProps);
	const [local, others] = splitProps(props, [
		"items",
		"activeItem",
		"bulletSize",
		"lineSize",
		"class",
	]);

	return (
		<ul
			class={cn("", local.class)}
			style={{
				// Left-pad the list so bullets aren't clipped by the viewport edge
				"padding-left": `${local.bulletSize / 2}px`,
			}}
			{...others}
		>
			<For each={local.items}>
				{(item, index) => (
					<TimelineItem
						title={item.title}
						description={item.description}
						bullet={item.bullet}
						isLast={index() === local.items.length - 1}
						isActive={local.activeItem === -1 ? false : local.activeItem >= index() + 1}
						isActiveBullet={local.activeItem === -1 ? false : local.activeItem >= index()}
						bulletSize={item.bulletSize ?? local.bulletSize}
						lineSize={local.lineSize}
					/>
				)}
			</For>
		</ul>
	);
};

// ─── Metadata / Examples ─────────────────────────────────────────────────────

// Example-only imports – stripped by the CLI transform
import IconCalendar from "~icons/lucide/calendar";
import IconStar from "~icons/lucide/star";

export const meta: ComponentMeta<TimelineProps> = {
	name: "Timeline",
	description:
		"A vertical timeline component for displaying chronological events, step-by-step processes, or progress tracking. Supports active-state highlighting, custom bullet content, and fully composable sub-components.",
	examples: [
		{
			title: "Basic",
			description: "A simple read-only timeline",
			code: () => (
				<Timeline
					class="max-w-sm"
					items={[
						{
							title: "Project kicked off",
							description: "Initial planning and requirements gathered from stakeholders.",
						},
						{
							title: "Design phase",
							description: "Wireframes and high-fidelity mockups approved by the team.",
						},
						{
							title: "Development",
							description: "Core features implemented and unit tests written.",
						},
						{
							title: "Launched 🎉",
							description: "Deployed to production and announced to users.",
						},
					]}
				/>
			),
		},
		{
			title: "With Active State",
			description: "Highlight completed steps with activeItem",
			code: () => (
				<Timeline
					class="max-w-sm"
					activeItem={2}
					items={[
						{
							title: "Order placed",
							description: "We received your order and payment.",
						},
						{
							title: "Processing",
							description: "Your items are being packed and prepared.",
						},
						{
							title: "Shipped",
							description: "Your parcel is on its way.",
						},
						{
							title: "Delivered",
							description: "Estimated arrival: 2 business days.",
						},
					]}
				/>
			),
		},
		{
			title: "With Icon Bullets",
			description: "Custom icons inside each bullet",
			code: () => (
				<Timeline
					class="max-w-sm"
					bulletSize={28}
					lineSize={2}
					activeItem={3}
					items={[
						{
							title: "Order confirmed",
							description: "Friday, 9 June · 10:23 AM",
							bullet: <IconCheck class="size-3.5 text-primary" />,
						},
						{
							title: "Packed & ready",
							description: "Friday, 9 June · 2:45 PM",
							bullet: <IconPackage class="size-3.5 text-primary" />,
						},
						{
							title: "Out for delivery",
							description: "Saturday, 10 June · 8:12 AM",
							bullet: <IconTruck class="size-3.5 text-primary" />,
						},
						{
							title: "Delivered",
							description: "Saturday, 10 June · 1:30 PM",
							bullet: <IconHome class="size-3.5 text-primary" />,
						},
					]}
				/>
			),
		},
		{
			title: "Interactive Progress",
			description: "Advance or rewind the active step",
			code: () => {
				const steps: TimelineItemData[] = [
					{
						title: "Account created",
						description: "You signed up and verified your email.",
						bullet: <IconCheck class="size-3 text-primary" />,
					},
					{
						title: "Profile set up",
						description: "Name, avatar, and preferences saved.",
						bullet: <IconStar class="size-3 text-primary" />,
					},
					{
						title: "First project",
						description: "Created and published your first project.",
						bullet: <IconCircleDot class="size-3 text-primary" />,
					},
					{
						title: "Invited a teammate",
						description: "Collaboration unlocked.",
						bullet: <IconMapPin class="size-3 text-primary" />,
					},
				];

				const [active, setActive] = createSignal(0);

				return (
					<div class="flex flex-col gap-6 max-w-sm">
						<Timeline bulletSize={24} lineSize={2} activeItem={active()} items={steps} />
						<div class="flex gap-2">
							<button
								type="button"
								class="flex-1 rounded-md border border-border px-3 py-1.5 text-sm transition-colors hover:bg-accent disabled:opacity-40"
								disabled={active() <= -1}
								onClick={() => setActive((v) => v - 1)}
							>
								← Back
							</button>
							<button
								type="button"
								class="flex-1 rounded-md border border-border px-3 py-1.5 text-sm transition-colors hover:bg-accent disabled:opacity-40"
								disabled={active() >= steps.length - 1}
								onClick={() => setActive((v) => v + 1)}
							>
								Next →
							</button>
						</div>
						<p class="text-xs text-muted-foreground text-center">
							Step {Math.max(active() + 1, 0)} of {steps.length}
						</p>
					</div>
				);
			},
		},
		{
			title: "Composable",
			description: "Build a custom layout using the sub-components directly",
			code: () => (
				<ul class="pl-2 max-w-sm">
					<TimelineItem
						isActiveBullet
						isActive
						bulletSize={28}
						lineSize={2}
						title={
							<span class="flex items-center gap-2">
								Interview scheduled
								<span class="rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
									New
								</span>
							</span>
						}
						description="Your application has been reviewed. An interview slot has been reserved."
						bullet={<IconCalendar class="size-3.5 text-primary" />}
					/>
					<TimelineItem
						isActiveBullet
						isActive
						bulletSize={28}
						lineSize={2}
						title="Application submitted"
						description="Received on 3 June 2025."
						bullet={<IconCheck class="size-3.5 text-primary" />}
					/>
					<TimelineItem
						isLast
						bulletSize={28}
						lineSize={2}
						title="Position opened"
						description="Role posted on 28 May 2025."
						bullet={<IconClock class="size-3.5 text-muted-foreground" />}
					/>
				</ul>
			),
		},
	],
};

export default Timeline;

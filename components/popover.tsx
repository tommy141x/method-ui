import type {
	PopoverFocusOutsideEvent,
	PopoverInteractOutsideEvent,
	PopoverPointerDownOutsideEvent,
} from "@ark-ui/solid/popover";
import { Popover as ArkPopover } from "@ark-ui/solid/popover";
import type { PositioningOptions } from "@zag-js/popper";
import { createSignal, type JSX, mergeProps, Show, splitProps } from "solid-js";
import { Motion, Presence } from "solid-motionone";
import { cn } from "../lib/cn";
import { icon } from "../lib/icon";
import type { ComponentMeta } from "../lib/meta";

/**
 * Helper to create popover state for controlled popovers.
 *
 * @example
 * const popover = createPopoverState();
 * return (
 *   <Popover open={popover.isOpen()} onOpenChange={(e) => popover.setOpen(e.open)}>
 *     <Button onClick={popover.open}>Open Popover</Button>
 *     <PopoverContent>...</PopoverContent>
 *   </Popover>
 * );
 */
export function createPopoverState() {
	const [open, setOpen] = createSignal(false);

	return {
		open: () => setOpen(true),
		close: () => setOpen(false),
		toggle: () => setOpen(!open()),
		isOpen: open,
		setOpen,
	};
}

interface PopoverProps {
	children?: JSX.Element;
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (details: { open: boolean }) => void;
	closeOnInteractOutside?: boolean;
	closeOnEscape?: boolean;
	modal?: boolean;
	autoFocus?: boolean;
	portalled?: boolean;
	positioning?: PositioningOptions;
	lazyMount?: boolean;
	unmountOnExit?: boolean;
	initialFocusEl?: () => HTMLElement | null;
	onEscapeKeyDown?: (event: KeyboardEvent) => void;
	onInteractOutside?: (event: PopoverInteractOutsideEvent) => void;
	onFocusOutside?: (event: PopoverFocusOutsideEvent) => void;
	onPointerDownOutside?: (event: PopoverPointerDownOutsideEvent) => void;
}

export const Popover = (props: PopoverProps) => {
	const merged = mergeProps({ closeOnInteractOutside: true, closeOnEscape: true }, props);
	return <ArkPopover.Root {...merged} />;
};

interface PopoverTriggerProps {
	children?: JSX.Element;
	class?: string;
}

export const PopoverTrigger = (props: PopoverTriggerProps) => {
	const [local, others] = splitProps(props, ["class"]);

	return <ArkPopover.Trigger class={cn(local.class)} {...others} />;
};

interface PopoverAnchorProps {
	children?: JSX.Element;
	class?: string;
}

export const PopoverAnchor = (props: PopoverAnchorProps) => {
	const [local, others] = splitProps(props, ["class"]);

	return <ArkPopover.Anchor class={cn(local.class)} {...others} />;
};

interface PopoverContentProps {
	children?: JSX.Element;
	class?: string;
	showArrow?: boolean;
}

export const PopoverContent = (props: PopoverContentProps) => {
	const [local, others] = splitProps(props, ["children", "class", "showArrow"]);

	return (
		<ArkPopover.Context>
			{(context) => (
				<ArkPopover.Positioner>
					<Presence>
						<Show when={context().open}>
							<Motion.div
								animate={{ opacity: [0, 1], scale: [0.96, 1] }}
								exit={{ opacity: [1, 0], scale: [1, 0.96] }}
								transition={{ duration: 0.2, easing: "ease-in-out" }}
							>
								<ArkPopover.Content
									class={cn(
										"z-50 w-72 rounded-lg border border-border bg-popover text-popover-foreground shadow-md outline-none",
										local.class
									)}
									{...others}
								>
									{local.showArrow !== false && (
										<ArkPopover.Arrow class="--arrow-size-[12px] --arrow-background-[var(--colors-popover)]">
											<ArkPopover.ArrowTip class="border-t border-l border-border" />
										</ArkPopover.Arrow>
									)}
									{local.children}
								</ArkPopover.Content>
							</Motion.div>
						</Show>
					</Presence>
				</ArkPopover.Positioner>
			)}
		</ArkPopover.Context>
	);
};

interface PopoverTitleProps {
	children?: JSX.Element;
	class?: string;
}

export const PopoverTitle = (props: PopoverTitleProps) => {
	const [local, others] = splitProps(props, ["class"]);

	return (
		<ArkPopover.Title
			class={cn("text-sm font-semibold text-foreground", local.class)}
			{...others}
		/>
	);
};

interface PopoverDescriptionProps {
	children?: JSX.Element;
	class?: string;
}

export const PopoverDescription = (props: PopoverDescriptionProps) => {
	const [local, others] = splitProps(props, ["class"]);

	return (
		<ArkPopover.Description class={cn("text-sm text-muted-foreground", local.class)} {...others} />
	);
};

interface PopoverCloseTriggerProps {
	children?: JSX.Element;
	class?: string;
}

export const PopoverCloseTrigger = (props: PopoverCloseTriggerProps) => {
	const [local, others] = splitProps(props, ["children", "class"]);

	return (
		<ArkPopover.CloseTrigger
			class={cn(
				"rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none",
				local.class
			)}
			{...others}
		>
			{local.children || (
				<>
					<div class={cn("h-4 w-4", icon("x"))} />
					<span class="sr-only">Close</span>
				</>
			)}
		</ArkPopover.CloseTrigger>
	);
};

interface PopoverHeaderProps {
	children?: JSX.Element;
	class?: string;
}

export const PopoverHeader = (props: PopoverHeaderProps) => {
	return (
		<div class={cn("flex items-center justify-between p-4 pb-0", props.class)}>
			{props.children}
		</div>
	);
};

interface PopoverBodyProps {
	children?: JSX.Element;
	class?: string;
}

export const PopoverBody = (props: PopoverBodyProps) => {
	return <div class={cn("p-4", props.class)}>{props.children}</div>;
};

interface PopoverFooterProps {
	children?: JSX.Element;
	class?: string;
}

export const PopoverFooter = (props: PopoverFooterProps) => {
	return (
		<div class={cn("flex items-center justify-end gap-2 p-4 pt-0", props.class)}>
			{props.children}
		</div>
	);
};

export default Popover;

import { Badge } from "./badge";
// Import components for examples only - won't count as dependencies
// since they're imported right before the meta export
import { Button } from "./button";
import { Input } from "./input";

export const meta: ComponentMeta<PopoverProps> = {
	name: "Popover",
	description:
		"A popover component for displaying rich content in a floating panel. Built on Ark UI with smooth animations and flexible positioning.",
	examples: [
		{
			title: "Basic Popover",
			description: "A simple popover with trigger and content",
			code: () => (
				<Popover>
					<PopoverTrigger>
						<Button variant="outline">Open Popover</Button>
					</PopoverTrigger>
					<PopoverContent>
						<PopoverHeader>
							<PopoverTitle>Popover Title</PopoverTitle>
							<PopoverCloseTrigger />
						</PopoverHeader>
						<PopoverBody>
							<p class="text-sm">
								This is a basic popover with a title and description. It can contain any content you
								need.
							</p>
						</PopoverBody>
					</PopoverContent>
				</Popover>
			),
		},
		{
			title: "With Description",
			description: "Popover with title and description",
			code: () => (
				<Popover>
					<PopoverTrigger>
						<Button>
							<div class="h-4 w-4 i-lucide-info mr-2" />
							Learn More
						</Button>
					</PopoverTrigger>
					<PopoverContent>
						<PopoverBody class="space-y-2">
							<PopoverTitle>About This Feature</PopoverTitle>
							<PopoverDescription>
								This feature helps you manage your content more effectively. You can customize
								various aspects of the behavior.
							</PopoverDescription>
						</PopoverBody>
					</PopoverContent>
				</Popover>
			),
		},
		{
			title: "With Form",
			description: "Popover containing interactive form elements",
			code: () => (
				<Popover>
					<PopoverTrigger>
						<Button variant="outline">
							<div class="h-4 w-4 i-lucide-settings mr-2" />
							Settings
						</Button>
					</PopoverTrigger>
					<PopoverContent class="w-80">
						<PopoverHeader>
							<PopoverTitle>Dimensions</PopoverTitle>
							<PopoverCloseTrigger />
						</PopoverHeader>
						<PopoverBody class="space-y-4">
							<div class="space-y-2">
								<label for="popover-width" class="text-sm font-medium">
									Width
								</label>
								<Input id="popover-width" type="number" placeholder="100" />
							</div>
							<div class="space-y-2">
								<label for="popover-height" class="text-sm font-medium">
									Height
								</label>
								<Input id="popover-height" type="number" placeholder="100" />
							</div>
						</PopoverBody>
						<PopoverFooter>
							<Button variant="outline" size="sm">
								Cancel
							</Button>
							<Button size="sm">Save</Button>
						</PopoverFooter>
					</PopoverContent>
				</Popover>
			),
		},
		{
			title: "Custom Positioning",
			description: "Control popover placement and offset",
			code: () => (
				<Popover positioning={{ placement: "right", gutter: 16 }}>
					<PopoverTrigger>
						<Button variant="ghost">Hover for right placement</Button>
					</PopoverTrigger>
					<PopoverContent showArrow={false}>
						<PopoverBody>
							<PopoverTitle class="mb-2">Right Positioned</PopoverTitle>
							<p class="text-sm text-muted-foreground">
								This popover appears to the right with custom spacing and no arrow.
							</p>
						</PopoverBody>
					</PopoverContent>
				</Popover>
			),
		},
		{
			title: "Controlled Popover",
			description: "Control popover state externally",
			code: () => {
				const popover = createPopoverState();
				return (
					<div class="flex items-center gap-4">
						<Popover open={popover.isOpen()} onOpenChange={(e) => popover.setOpen(e.open)}>
							<PopoverTrigger>
								<Button>Controlled Popover</Button>
							</PopoverTrigger>
							<PopoverContent>
								<PopoverBody class="space-y-2">
									<PopoverTitle>Controlled State</PopoverTitle>
									<PopoverDescription>
										This popover is controlled by external state.
									</PopoverDescription>
									<div class="flex gap-2 pt-2">
										<Button size="sm" onClick={popover.close}>
											Close
										</Button>
									</div>
								</PopoverBody>
							</PopoverContent>
						</Popover>
						<Badge
							variant={popover.isOpen() ? "default" : "secondary"}
							class="cursor-pointer"
							onClick={popover.toggle}
						>
							State: {popover.isOpen() ? "Open" : "Closed"}
						</Badge>
					</div>
				);
			},
		},
		{
			title: "Rich Content",
			description: "Popover with complex nested content",
			code: () => (
				<Popover>
					<PopoverTrigger>
						<Button variant="outline">
							<div class="h-4 w-4 i-lucide-user mr-2" />
							View Profile
						</Button>
					</PopoverTrigger>
					<PopoverContent class="w-80">
						<PopoverBody class="space-y-3">
							<div class="flex items-center gap-3">
								<div class="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
									<div class="h-6 w-6 i-lucide-user text-secondary-foreground" />
								</div>
								<div>
									<h4 class="font-semibold">John Doe</h4>
									<p class="text-sm text-muted-foreground">Software Engineer</p>
								</div>
							</div>
							<div class="border-t border-border pt-3">
								<p class="text-sm text-muted-foreground">
									Passionate about building great user experiences and writing clean, maintainable
									code.
								</p>
							</div>
							<div class="flex gap-2">
								<Badge variant="secondary">React</Badge>
								<Badge variant="secondary">TypeScript</Badge>
								<Badge variant="secondary">Solid</Badge>
							</div>
						</PopoverBody>
					</PopoverContent>
				</Popover>
			),
		},
	],
};

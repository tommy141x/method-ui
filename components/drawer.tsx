import {
	type Accessor,
	createContext,
	createEffect,
	createSignal,
	type JSX,
	mergeProps,
	onCleanup,
	Show,
	splitProps,
	useContext,
} from "solid-js";
import { Portal } from "solid-js/web";
import { Motion, Presence } from "solid-motionone";
import IconX from "~icons/lucide/x";
import { cn } from "../lib/cn";
import type { ComponentMeta } from "../lib/meta";

// ===== Context =====

interface DrawerContextValue {
	open: Accessor<boolean>;
	setOpen: (open: boolean) => void;
	side: Accessor<"top" | "bottom" | "left" | "right">;
	isDragging: Accessor<boolean>;
	setIsDragging: (dragging: boolean) => void;
	dragOffset: Accessor<number>;
	setDragOffset: (offset: number) => void;
	openPercentage: Accessor<number>;
	setOpenPercentage: (percentage: number) => void;
	dismissThreshold: number;
	velocityThreshold: number;
	closeOnInteractOutside: boolean;
}

const DrawerContext = createContext<DrawerContextValue>();

const useDrawerContext = () => {
	const context = useContext(DrawerContext);
	if (!context) {
		throw new Error("Drawer components must be used within a Drawer");
	}
	return context;
};

/**
 * Helper to create drawer state for controlled drawers.
 * This is necessary for proper SSR hydration in SolidStart.
 *
 * @example
 * const drawer = createDrawerState();
 * return (
 *   <Drawer open={drawer.isOpen()} onOpenChange={(e) => drawer.setOpen(e.open)}>
 *     <Button onClick={drawer.open}>Open Drawer</Button>
 *     <DrawerPortal>
 *       <DrawerContent>...</DrawerContent>
 *     </DrawerPortal>
 *   </Drawer>
 * );
 */
export function createDrawerState() {
	const [open, setOpen] = createSignal(false);

	return {
		open: () => setOpen(true),
		close: () => setOpen(false),
		toggle: () => setOpen(!open()),
		isOpen: open,
		setOpen,
	};
}

// ===== Root Component =====

interface DrawerProps {
	children?: JSX.Element;
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (details: { open: boolean }) => void;
	side?: "top" | "bottom" | "left" | "right";
	closeOnInteractOutside?: boolean;
	closeOnEscape?: boolean;
	preventScroll?: boolean;
	modal?: boolean;
	dismissThreshold?: number; // 0-1, percentage of drawer size to trigger close
	velocityThreshold?: number; // px/ms
}

export const Drawer = (props: DrawerProps) => {
	const merged = mergeProps(
		{
			defaultOpen: false,
			side: "bottom" as const,
			closeOnInteractOutside: true,
			closeOnEscape: true,
			preventScroll: true,
			modal: true,
			dismissThreshold: 0.4,
			velocityThreshold: 0.4,
		},
		props
	);

	const [internalOpen, setInternalOpen] = createSignal(merged.open ?? merged.defaultOpen);
	const [isDragging, setIsDragging] = createSignal(false);
	const [dragOffset, setDragOffset] = createSignal(0);
	const [openPercentage, setOpenPercentage] = createSignal(1);

	// Handle controlled/uncontrolled state
	const isControlled = () => merged.open !== undefined;
	const open = () => (isControlled() ? (merged.open ?? false) : internalOpen());

	const setOpen = (value: boolean) => {
		if (!isControlled()) {
			setInternalOpen(value);
		}
		merged.onOpenChange?.({ open: value });
	};

	// Prevent scroll when drawer is open and modal
	createEffect(() => {
		if (open() && merged.modal && merged.preventScroll) {
			const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
			document.body.style.overflow = "hidden";
			document.body.style.paddingRight = `${scrollbarWidth}px`;

			onCleanup(() => {
				document.body.style.overflow = "";
				document.body.style.paddingRight = "";
			});
		}
	});

	// Handle escape key
	createEffect(() => {
		if (!open() || !merged.closeOnEscape) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setOpen(false);
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		onCleanup(() => document.removeEventListener("keydown", handleKeyDown));
	});

	const contextValue: DrawerContextValue = {
		open,
		setOpen,
		side: () => merged.side,
		isDragging,
		setIsDragging,
		dragOffset,
		setDragOffset,
		openPercentage,
		setOpenPercentage,
		dismissThreshold: merged.dismissThreshold,
		velocityThreshold: merged.velocityThreshold,
		closeOnInteractOutside: merged.closeOnInteractOutside,
	};

	return <DrawerContext.Provider value={contextValue}>{merged.children}</DrawerContext.Provider>;
};

// ===== Trigger Component =====

interface DrawerTriggerProps {
	children?: JSX.Element;
	class?: string;
}

export const DrawerTrigger = (props: DrawerTriggerProps) => {
	const [local, others] = splitProps(props, ["children", "class"]);
	const context = useDrawerContext();

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: transparent wrapper div
		// biome-ignore lint/a11y/useKeyWithClickEvents: child element handles keyboard
		<div onClick={() => context.setOpen(true)} style={{ display: "contents" }} {...others}>
			{local.children}
		</div>
	);
};

// ===== Close Component =====

interface DrawerCloseProps {
	children?: JSX.Element;
	class?: string;
}

export const DrawerClose = (props: DrawerCloseProps) => {
	const [local, others] = splitProps(props, ["children", "class"]);
	const context = useDrawerContext();

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: transparent wrapper div
		// biome-ignore lint/a11y/useKeyWithClickEvents: child element handles keyboard
		<div onClick={() => context.setOpen(false)} style={{ display: "contents" }} {...others}>
			{local.children}
		</div>
	);
};

// ===== Overlay Component =====

interface DrawerOverlayProps {
	children?: JSX.Element;
	class?: string;
}

const DrawerOverlay = (props: DrawerOverlayProps) => {
	const [local, others] = splitProps(props, ["class", "children"]);
	const context = useDrawerContext();

	return (
		<Presence>
			<Show when={context.open()}>
				<Motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.3, easing: "ease-out" }}
					class={cn("fixed inset-0 z-50 bg-black/80 backdrop-blur-sm", local.class)}
					style={{
						"background-color": `rgb(0 0 0 / ${0.8 * context.openPercentage()})`,
					}}
					onClick={() => {
						if (context.closeOnInteractOutside) {
							context.setOpen(false);
						}
					}}
					{...others}
				>
					{local.children}
				</Motion.div>
			</Show>
		</Presence>
	);
};

// ===== Content Component =====

interface DrawerContentProps {
	children?: JSX.Element;
	class?: string;
	withHandle?: boolean;
}

export const DrawerContent = (props: DrawerContentProps) => {
	const [local, others] = splitProps(props, ["children", "class", "withHandle"]);

	const context = useDrawerContext();
	const merged = mergeProps({ withHandle: true }, props);

	let contentRef: HTMLDivElement | undefined;
	let dragStartPos = 0;
	let dragStartTime = 0;
	let contentSize = 0;

	const getAxis = () => {
		const side = context.side();
		return side === "left" || side === "right" ? "x" : "y";
	};

	const getDirection = () => {
		const side = context.side();
		return side === "bottom" || side === "right" ? 1 : -1;
	};

	const handleDragStart = (e: MouseEvent | TouchEvent, clientPos: number) => {
		e.preventDefault();
		e.stopPropagation();
		if (!contentRef) return;
		dragStartPos = clientPos;
		dragStartTime = Date.now();

		const rect = contentRef.getBoundingClientRect();
		contentSize = getAxis() === "x" ? rect.width : rect.height;

		context.setIsDragging(true);
	};

	const handleDragMove = (e: MouseEvent | TouchEvent, clientPos: number) => {
		if (!context.isDragging()) return;
		e.preventDefault();

		const delta = (clientPos - dragStartPos) * getDirection();
		const clampedDelta = Math.max(0, delta);

		context.setDragOffset(clampedDelta);

		const percentage = Math.max(0, Math.min(1, 1 - clampedDelta / contentSize));
		context.setOpenPercentage(percentage);
	};

	const handleDragEnd = (e: MouseEvent | TouchEvent, clientPos: number) => {
		if (!context.isDragging()) return;
		e.preventDefault();

		const delta = (clientPos - dragStartPos) * getDirection();
		const percentage = delta / contentSize;
		const duration = Date.now() - dragStartTime;
		const velocity = delta / duration;

		// Minimum drag distance of 10px to prevent accidental close on simple clicks
		const minDragDistance = 10;
		const dragDistance = Math.abs(clientPos - dragStartPos);

		const shouldClose =
			dragDistance > minDragDistance &&
			(percentage > context.dismissThreshold || velocity > context.velocityThreshold);

		// Always reset drag state immediately
		context.setIsDragging(false);
		context.setDragOffset(0);
		context.setOpenPercentage(1);

		if (shouldClose) {
			context.setOpen(false);
		}
	};

	// Mouse events
	const handleMouseDown = (e: MouseEvent) => {
		const clientPos = getAxis() === "x" ? e.clientX : e.clientY;
		handleDragStart(e, clientPos);
	};

	createEffect(() => {
		if (!context.isDragging()) return;

		const handleMouseMove = (e: MouseEvent) => {
			const clientPos = getAxis() === "x" ? e.clientX : e.clientY;
			handleDragMove(e, clientPos);
		};

		const handleMouseUp = (e: MouseEvent) => {
			const clientPos = getAxis() === "x" ? e.clientX : e.clientY;
			handleDragEnd(e, clientPos);
		};

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);

		onCleanup(() => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		});
	});

	// Touch events
	const handleTouchStart = (e: TouchEvent) => {
		const touch = e.touches[0];
		if (!touch) return;
		const clientPos = getAxis() === "x" ? touch.clientX : touch.clientY;
		handleDragStart(e, clientPos);
	};

	createEffect(() => {
		if (!context.isDragging()) return;

		const handleTouchMove = (e: TouchEvent) => {
			const touch = e.touches[0];
			if (!touch) return;
			const clientPos = getAxis() === "x" ? touch.clientX : touch.clientY;
			handleDragMove(e, clientPos);
		};

		const handleTouchEnd = (e: TouchEvent) => {
			const touch = e.changedTouches[0];
			if (!touch) return;
			const clientPos = getAxis() === "x" ? touch.clientX : touch.clientY;
			handleDragEnd(e, clientPos);
		};

		document.addEventListener("touchmove", handleTouchMove, { passive: true });
		document.addEventListener("touchend", handleTouchEnd);

		onCleanup(() => {
			document.removeEventListener("touchmove", handleTouchMove);
			document.removeEventListener("touchend", handleTouchEnd);
		});
	});

	const getInitialAnimation = () => {
		const side = context.side();
		switch (side) {
			case "bottom":
				return { y: "100%", opacity: 0 };
			case "top":
				return { y: "-100%", opacity: 0 };
			case "left":
				return { x: "-100%", opacity: 0 };
			case "right":
				return { x: "100%", opacity: 0 };
		}
	};

	const getExitAnimation = () => {
		const side = context.side();
		switch (side) {
			case "bottom":
				return { y: "100%", opacity: 0 };
			case "top":
				return { y: "-100%", opacity: 0 };
			case "left":
				return { x: "-100%", opacity: 0 };
			case "right":
				return { x: "100%", opacity: 0 };
		}
	};

	const getAnimateValues = () => {
		// When actively dragging, apply the drag offset
		if (context.isDragging()) {
			const offset = context.dragOffset();
			const side = context.side();

			switch (side) {
				case "bottom":
					return { x: 0, y: offset, opacity: 1 };
				case "top":
					return { x: 0, y: -offset, opacity: 1 };
				case "left":
					return { x: -offset, y: 0, opacity: 1 };
				case "right":
					return { x: offset, y: 0, opacity: 1 };
				default:
					return { x: 0, y: 0, opacity: 1 };
			}
		}

		// When not dragging, return to default position
		return { x: 0, y: 0, opacity: 1 };
	};

	return (
		<Presence>
			<Show when={context.open()}>
				<Motion.div
					ref={contentRef}
					initial={getInitialAnimation()}
					animate={getAnimateValues()}
					exit={getExitAnimation()}
					transition={{
						duration: context.isDragging() ? 0 : 0.3,
						easing: [0.32, 0.72, 0, 1] as [number, number, number, number],
					}}
					class={cn(
						"bg-background fixed z-60 flex flex-col border border-border shadow-lg",
						context.side() === "bottom" && [
							"inset-x-0 bottom-0 mt-24 max-h-[80vh] rounded-t-lg border-b-0",
						],
						context.side() === "top" && [
							"inset-x-0 top-0 mb-24 max-h-[80vh] rounded-b-lg border-t-0",
						],
						context.side() === "left" && ["inset-y-0 left-0 w-3/4 max-w-sm border-l-0"],
						context.side() === "right" && ["inset-y-0 right-0 w-3/4 max-w-sm border-r-0"],
						local.class
					)}
					onClick={(e) => e.stopPropagation()}
					{...others}
				>
					<Show when={merged.withHandle && context.side() === "bottom"}>
						<button
							type="button"
							aria-label="Drag to close"
							class="shrink-0 rounded-full bg-muted cursor-grab active:cursor-grabbing mt-4 mb-2 h-1.5 w-12 self-center"
							onMouseDown={handleMouseDown}
							onTouchStart={handleTouchStart}
							onClick={(e) => e.stopPropagation()}
						/>
					</Show>
					{local.children}
					<Show when={merged.withHandle && context.side() === "top"}>
						<button
							type="button"
							aria-label="Drag to close"
							class="shrink-0 rounded-full bg-muted cursor-grab active:cursor-grabbing mt-2 mb-4 h-1.5 w-12 self-center"
							onMouseDown={handleMouseDown}
							onTouchStart={handleTouchStart}
							onClick={(e) => e.stopPropagation()}
						/>
					</Show>
					<Show when={merged.withHandle && context.side() === "left"}>
						<button
							type="button"
							aria-label="Drag to close"
							class="shrink-0 rounded-full bg-muted cursor-grab active:cursor-grabbing ml-4 mr-2 h-12 w-1.5 self-start"
							onMouseDown={handleMouseDown}
							onTouchStart={handleTouchStart}
							onClick={(e) => e.stopPropagation()}
						/>
					</Show>
					<Show when={merged.withHandle && context.side() === "right"}>
						<button
							type="button"
							aria-label="Drag to close"
							class="shrink-0 rounded-full bg-muted cursor-grab active:cursor-grabbing ml-2 mr-4 h-12 w-1.5 self-end"
							onMouseDown={handleMouseDown}
							onTouchStart={handleTouchStart}
							onClick={(e) => e.stopPropagation()}
						/>
					</Show>
				</Motion.div>
			</Show>
		</Presence>
	);
};

// ===== Portal Component =====

interface DrawerPortalProps {
	children?: JSX.Element;
}

export const DrawerPortal = (props: DrawerPortalProps) => {
	return (
		<Portal>
			<DrawerOverlay />
			{props.children}
		</Portal>
	);
};

// ===== Header Component =====

interface DrawerHeaderProps {
	children?: JSX.Element;
	class?: string;
}

export const DrawerHeader = (props: DrawerHeaderProps) => {
	const [local, others] = splitProps(props, ["class"]);

	return <div class={cn("flex flex-col gap-1.5 p-4 text-left", local.class)} {...others} />;
};

// ===== Footer Component =====

interface DrawerFooterProps {
	children?: JSX.Element;
	class?: string;
}

export const DrawerFooter = (props: DrawerFooterProps) => {
	const [local, others] = splitProps(props, ["class"]);

	return <div class={cn("mt-auto flex flex-col gap-2 p-4", local.class)} {...others} />;
};

// ===== Title Component =====

interface DrawerTitleProps {
	children?: JSX.Element;
	class?: string;
}

export const DrawerTitle = (props: DrawerTitleProps) => {
	const [local, others] = splitProps(props, ["class"]);

	return <h2 class={cn("text-lg font-semibold text-foreground", local.class)} {...others} />;
};

// ===== Description Component =====

interface DrawerDescriptionProps {
	children?: JSX.Element;
	class?: string;
}

export const DrawerDescription = (props: DrawerDescriptionProps) => {
	const [local, others] = splitProps(props, ["class"]);

	return <p class={cn("text-sm text-muted-foreground", local.class)} {...others} />;
};

// ===== Close Trigger Component =====

interface DrawerCloseTriggerProps {
	children?: JSX.Element;
	class?: string;
}

export const DrawerCloseTrigger = (props: DrawerCloseTriggerProps) => {
	const [local, others] = splitProps(props, ["children", "class"]);
	const context = useDrawerContext();

	return (
		<button
			onClick={() => context.setOpen(false)}
			class={cn(
				"absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none",
				local.class
			)}
			{...others}
		>
			{local.children || (
				<>
					<IconX class="h-4 w-4" />
					<span class="sr-only">Close</span>
				</>
			)}
		</button>
	);
};

// ===== Body Component =====

interface DrawerBodyProps {
	children?: JSX.Element;
	class?: string;
}

export const DrawerBody = (props: DrawerBodyProps) => {
	const [local, others] = splitProps(props, ["class"]);

	return <div class={cn("flex-1 overflow-y-auto p-4", local.class)} {...others} />;
};

// Example-only imports - removed during CLI transform
import IconPlus from "~icons/lucide/plus";
// Import components for examples only
import { Button } from "./button";
import { Input } from "./input";

export const meta: ComponentMeta<DrawerProps> = {
	name: "Drawer",
	description:
		"A drawer component that slides in from any edge of the screen. Supports drag-to-dismiss, keyboard navigation, and focus management. Custom implementation with full directional support.",
	examples: [
		{
			title: "Bottom Drawer",
			description: "Default drawer that slides up from the bottom",
			code: () => (
				<Drawer side="bottom">
					<DrawerTrigger>
						<Button>Open Drawer</Button>
					</DrawerTrigger>
					<DrawerPortal>
						<DrawerContent>
							<DrawerHeader>
								<DrawerTitle>Drawer Title</DrawerTitle>
								<DrawerDescription>
									This is a drawer that slides in from the bottom. Drag it down to dismiss.
								</DrawerDescription>
							</DrawerHeader>
							<DrawerBody>
								<p class="text-sm">Drawer content goes here. You can add any content you want.</p>
							</DrawerBody>
							<DrawerFooter>
								<DrawerClose>
									<Button variant="outline" class="w-full">
										Close
									</Button>
								</DrawerClose>
							</DrawerFooter>
						</DrawerContent>
					</DrawerPortal>
				</Drawer>
			),
		},
		{
			title: "Right Drawer",
			description: "Drawer that slides in from the right side",
			code: () => (
				<Drawer side="right">
					<DrawerTrigger>
						<Button variant="outline">Open Right Drawer</Button>
					</DrawerTrigger>
					<DrawerPortal>
						<DrawerContent withHandle={false}>
							<DrawerCloseTrigger />
							<DrawerHeader>
								<DrawerTitle>Navigation Menu</DrawerTitle>
								<DrawerDescription>Browse through available options</DrawerDescription>
							</DrawerHeader>
							<DrawerBody>
								<nav class="space-y-2">
									<button
										type="button"
										class="w-full text-left px-3 py-2 rounded-md hover:bg-accent"
									>
										Dashboard
									</button>
									<button
										type="button"
										class="w-full text-left px-3 py-2 rounded-md hover:bg-accent"
									>
										Settings
									</button>
									<button
										type="button"
										class="w-full text-left px-3 py-2 rounded-md hover:bg-accent"
									>
										Profile
									</button>
									<button
										type="button"
										class="w-full text-left px-3 py-2 rounded-md hover:bg-accent"
									>
										Logout
									</button>
								</nav>
							</DrawerBody>
						</DrawerContent>
					</DrawerPortal>
				</Drawer>
			),
		},
		{
			title: "Left Drawer",
			description: "Drawer that slides in from the left side",
			code: () => (
				<Drawer side="left">
					<DrawerTrigger>
						<Button variant="outline">Open Left Drawer</Button>
					</DrawerTrigger>
					<DrawerPortal>
						<DrawerContent withHandle={false}>
							<DrawerCloseTrigger />
							<DrawerHeader>
								<DrawerTitle>Filters</DrawerTitle>
								<DrawerDescription>Filter and sort your results</DrawerDescription>
							</DrawerHeader>
							<DrawerBody>
								<div class="space-y-4">
									<div>
										<label for="drawer-category" class="text-sm font-medium mb-2 block">
											Category
										</label>
										<select
											id="drawer-category"
											class="w-full rounded-md border border-border bg-background px-3 py-2"
										>
											<option>All</option>
											<option>Electronics</option>
											<option>Clothing</option>
										</select>
									</div>
									<div>
										<label for="drawer-price-range" class="text-sm font-medium mb-2 block">
											Price Range
										</label>
										<input id="drawer-price-range" type="range" class="w-full" />
									</div>
								</div>
							</DrawerBody>
							<DrawerFooter>
								<Button class="w-full">Apply Filters</Button>
								<DrawerClose>
									<Button variant="outline" class="w-full">
										Cancel
									</Button>
								</DrawerClose>
							</DrawerFooter>
						</DrawerContent>
					</DrawerPortal>
				</Drawer>
			),
		},
		{
			title: "Top Drawer",
			description: "Drawer that slides in from the top",
			code: () => (
				<Drawer side="top">
					<DrawerTrigger>
						<Button variant="outline">Open Top Drawer</Button>
					</DrawerTrigger>
					<DrawerPortal>
						<DrawerContent>
							<DrawerCloseTrigger />
							<DrawerHeader>
								<DrawerTitle>Announcement</DrawerTitle>
								<DrawerDescription>Important information and updates</DrawerDescription>
							</DrawerHeader>
							<DrawerBody>
								<div class="space-y-2">
									<p class="text-sm">
										🎉 New features have been released! Check out our latest updates.
									</p>
									<p class="text-sm text-muted-foreground">Drag up to dismiss this notification.</p>
								</div>
							</DrawerBody>
						</DrawerContent>
					</DrawerPortal>
				</Drawer>
			),
		},
		{
			title: "Controlled Drawer",
			description: "Control drawer state externally",
			code: () => {
				const drawer = createDrawerState();
				return (
					<div class="space-y-4">
						<div class="flex gap-2">
							<Button onClick={drawer.open}>Open</Button>
							<Button variant="outline" onClick={drawer.close}>
								Close
							</Button>
							<Button variant="secondary" onClick={drawer.toggle}>
								Toggle
							</Button>
						</div>
						<Drawer
							open={drawer.isOpen()}
							onOpenChange={(e) => drawer.setOpen(e.open)}
							side="bottom"
						>
							<DrawerPortal>
								<DrawerContent>
									<DrawerHeader>
										<DrawerTitle>Controlled Drawer</DrawerTitle>
										<DrawerDescription>
											This drawer's state is controlled externally
										</DrawerDescription>
									</DrawerHeader>
									<DrawerBody>
										<p class="text-sm">You can control this drawer using the buttons above.</p>
									</DrawerBody>
									<DrawerFooter>
										<Button onClick={drawer.close} class="w-full">
											Close from Inside
										</Button>
									</DrawerFooter>
								</DrawerContent>
							</DrawerPortal>
						</Drawer>
					</div>
				);
			},
		},
		{
			title: "Form Drawer",
			description: "Drawer with form content",
			code: () => (
				<Drawer side="right">
					<DrawerTrigger>
						<Button>
							<IconPlus class="h-4 w-4 mr-2" />
							Add Item
						</Button>
					</DrawerTrigger>
					<DrawerPortal>
						<DrawerContent withHandle={false}>
							<DrawerCloseTrigger />
							<DrawerHeader>
								<DrawerTitle>Add New Item</DrawerTitle>
								<DrawerDescription>
									Fill in the details below to create a new item
								</DrawerDescription>
							</DrawerHeader>
							<DrawerBody>
								<form class="space-y-4">
									<div class="space-y-2">
										<label for="drawer-item-name" class="text-sm font-medium">
											Name
										</label>
										<Input id="drawer-item-name" type="text" placeholder="Enter item name" />
									</div>
									<div class="space-y-2">
										<label for="drawer-item-desc" class="text-sm font-medium">
											Description
										</label>
										<textarea
											id="drawer-item-desc"
											class="w-full min-h-[100px] rounded-md border border-border bg-background px-3 py-2 text-sm"
											placeholder="Enter description"
										/>
									</div>
									<div class="space-y-2">
										<label for="drawer-item-price" class="text-sm font-medium">
											Price
										</label>
										<Input id="drawer-item-price" type="number" placeholder="0.00" />
									</div>
								</form>
							</DrawerBody>
							<DrawerFooter>
								<Button class="w-full">Save Item</Button>
								<DrawerClose>
									<Button variant="outline" class="w-full">
										Cancel
									</Button>
								</DrawerClose>
							</DrawerFooter>
						</DrawerContent>
					</DrawerPortal>
				</Drawer>
			),
		},
	],
};

export default Drawer;

import { Carousel as ArkCarousel } from "@ark-ui/solid/carousel";
import { cva, type VariantProps } from "class-variance-authority";
import type { Component, JSX } from "solid-js";
import { Index, splitProps } from "solid-js";
import IconChevronLeft from "~icons/lucide/chevron-left";
import IconChevronRight from "~icons/lucide/chevron-right";
import IconPause from "~icons/lucide/pause";
import IconPlay from "~icons/lucide/play";
import { cn } from "../lib/cn";
import type { ComponentMeta } from "../lib/meta";

// ─── Variants ────────────────────────────────────────────────────────────────

const carouselVariants = cva("relative", {
	variants: {
		size: {
			sm: "max-w-sm w-full",
			default: "max-w-lg w-full",
			lg: "max-w-2xl w-full",
			full: "w-full",
		},
	},
	defaultVariants: {
		size: "default",
	},
});

const carouselTriggerVariants = cva(
	"inline-flex shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default:
					"h-8 w-8 border border-input bg-background text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground",
				ghost: "h-8 w-8 text-foreground hover:bg-accent hover:text-accent-foreground",
				outline:
					"h-8 w-8 border border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	}
);

const carouselIndicatorVariants = cva(
	"rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none cursor-pointer",
	{
		variants: {
			variant: {
				default:
					"h-2 w-2 bg-foreground/20 hover:bg-foreground/40 data-[current]:bg-primary data-[current]:w-4",
				dot: "h-2 w-2 bg-foreground/30 hover:bg-foreground/50 data-[current]:bg-foreground",
				line: "h-0.5 w-5 bg-foreground/20 hover:bg-foreground/40 data-[current]:bg-primary data-[current]:w-8",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	}
);

// ─── Base Carousel CSS ────────────────────────────────────────────────────────

const CAROUSEL_STYLES = `
  [data-scope="carousel"][data-part="item-group"] {
    display: flex;
    overflow: hidden;
    width: 100%;
  }
  [data-scope="carousel"][data-part="item-group"][data-orientation="vertical"] {
    flex-direction: column;
  }
  [data-scope="carousel"][data-part="item"] {
    flex: 0 0 var(--slide-item-size);
    min-width: 0;
  }
`;

// ─── Root ─────────────────────────────────────────────────────────────────────

type CarouselProps = {
	children?: JSX.Element;
	slideCount: number;
	defaultPage?: number;
	page?: number;
	onPageChange?: (details: { page: number }) => void;
	slidesPerPage?: number;
	slidesPerMove?: number | "auto";
	orientation?: "horizontal" | "vertical";
	loop?: boolean;
	autoplay?: boolean | { delay: number };
	allowMouseDrag?: boolean;
	autoSize?: boolean;
	spacing?: string;
	padding?: string;
	snapType?: "proximity" | "mandatory";
	inViewThreshold?: number | number[];
	class?: string;
} & VariantProps<typeof carouselVariants>;

export const Carousel: Component<CarouselProps> = (props) => {
	const [local, variantProps, others] = splitProps(props, ["children", "class"], ["size"]);
	return (
		<ArkCarousel.Root
			class={cn(carouselVariants({ size: variantProps.size }), local.class)}
			{...others}
		>
			<style>{CAROUSEL_STYLES}</style>
			{local.children}
		</ArkCarousel.Root>
	);
};

// ─── Control ──────────────────────────────────────────────────────────────────

type CarouselControlProps = {
	children?: JSX.Element;
	class?: string;
};

export const CarouselControl: Component<CarouselControlProps> = (props) => {
	const [local, others] = splitProps(props, ["children", "class"]);
	return (
		<ArkCarousel.Control class={cn("flex items-center gap-2 w-full", local.class)} {...others}>
			{local.children}
		</ArkCarousel.Control>
	);
};

// ─── PrevTrigger ──────────────────────────────────────────────────────────────

type CarouselPrevTriggerProps = {
	children?: JSX.Element;
	class?: string;
	variant?: "default" | "ghost" | "outline";
};

export const CarouselPrevTrigger: Component<CarouselPrevTriggerProps> = (props) => {
	const [local, variantProps, others] = splitProps(props, ["children", "class"], ["variant"]);
	return (
		<ArkCarousel.PrevTrigger
			class={cn(carouselTriggerVariants({ variant: variantProps.variant }), local.class)}
			{...others}
		>
			{local.children ?? <IconChevronLeft />}
		</ArkCarousel.PrevTrigger>
	);
};

// ─── NextTrigger ──────────────────────────────────────────────────────────────

type CarouselNextTriggerProps = {
	children?: JSX.Element;
	class?: string;
	variant?: "default" | "ghost" | "outline";
};

export const CarouselNextTrigger: Component<CarouselNextTriggerProps> = (props) => {
	const [local, variantProps, others] = splitProps(props, ["children", "class"], ["variant"]);
	return (
		<ArkCarousel.NextTrigger
			class={cn(carouselTriggerVariants({ variant: variantProps.variant }), local.class)}
			{...others}
		>
			{local.children ?? <IconChevronRight />}
		</ArkCarousel.NextTrigger>
	);
};

// ─── ItemGroup ────────────────────────────────────────────────────────────────

type CarouselItemGroupProps = {
	children?: JSX.Element;
	class?: string;
};

export const CarouselItemGroup: Component<CarouselItemGroupProps> = (props) => {
	const [local, others] = splitProps(props, ["children", "class"]);
	return (
		<ArkCarousel.ItemGroup class={cn("flex-1 rounded-md overflow-hidden", local.class)} {...others}>
			{local.children}
		</ArkCarousel.ItemGroup>
	);
};

// ─── Item ─────────────────────────────────────────────────────────────────────

type CarouselItemProps = {
	index: number;
	children?: JSX.Element;
	class?: string;
	snapAlign?: "start" | "center" | "end";
};

export const CarouselItem: Component<CarouselItemProps> = (props) => {
	const [local, others] = splitProps(props, ["children", "class"]);
	return (
		<ArkCarousel.Item class={cn("relative overflow-hidden", local.class)} {...others}>
			{local.children}
		</ArkCarousel.Item>
	);
};

// ─── IndicatorGroup ───────────────────────────────────────────────────────────

type CarouselIndicatorGroupProps = {
	children?: JSX.Element;
	class?: string;
};

export const CarouselIndicatorGroup: Component<CarouselIndicatorGroupProps> = (props) => {
	const [local, others] = splitProps(props, ["children", "class"]);
	return (
		<ArkCarousel.IndicatorGroup
			class={cn("flex items-center justify-center gap-1.5 mt-3", local.class)}
			{...others}
		>
			{local.children}
		</ArkCarousel.IndicatorGroup>
	);
};

// ─── Indicator ────────────────────────────────────────────────────────────────

type CarouselIndicatorProps = {
	index: number;
	children?: JSX.Element;
	class?: string;
	readOnly?: boolean;
	variant?: "default" | "dot" | "line";
};

export const CarouselIndicator: Component<CarouselIndicatorProps> = (props) => {
	const [local, variantProps, others] = splitProps(props, ["children", "class"], ["variant"]);
	return (
		<ArkCarousel.Indicator
			class={cn(carouselIndicatorVariants({ variant: variantProps.variant }), local.class)}
			{...others}
		>
			{local.children}
		</ArkCarousel.Indicator>
	);
};

// ─── AutoplayTrigger ──────────────────────────────────────────────────────────

type CarouselAutoplayTriggerProps = {
	children?: JSX.Element;
	class?: string;
	variant?: "default" | "ghost" | "outline";
};

export const CarouselAutoplayTrigger: Component<CarouselAutoplayTriggerProps> = (props) => {
	const [local, variantProps, others] = splitProps(props, ["children", "class"], ["variant"]);
	return (
		<ArkCarousel.AutoplayTrigger
			class={cn(carouselTriggerVariants({ variant: variantProps.variant }), local.class)}
			{...others}
		>
			{local.children ?? (
				<ArkCarousel.AutoplayIndicator fallback={<IconPlay />}>
					<IconPause />
				</ArkCarousel.AutoplayIndicator>
			)}
		</ArkCarousel.AutoplayTrigger>
	);
};

// ─── Context re-export ────────────────────────────────────────────────────────

export const CarouselContext = ArkCarousel.Context;

// ─── Composable root alias ────────────────────────────────────────────────────

export const CarouselRoot = Carousel;

// ─── Meta ─────────────────────────────────────────────────────────────────────

const DEMO_SLIDES = [
	{
		label: "Design Systems",
		color: "bg-primary/10 text-primary border border-primary/20",
	},
	{
		label: "Component Driven",
		color: "bg-secondary text-secondary-foreground border border-border",
	},
	{
		label: "Accessible First",
		color: "bg-destructive/10 text-destructive border border-destructive/20",
	},
	{
		label: "Dark Mode Ready",
		color: "bg-accent text-accent-foreground border border-border",
	},
	{
		label: "Fully Typed",
		color: "bg-muted text-muted-foreground border border-border",
	},
];

export const meta: ComponentMeta<CarouselProps> = {
	name: "Carousel",
	description:
		"A carousel component for cycling through slides with optional autoplay, indicators, and multiple orientations. Built on Ark UI Carousel.",
	variants: carouselTriggerVariants,
	examples: [
		{
			title: "Basic",
			description: "A simple carousel with navigation controls and indicator dots",
			code: () => (
				<Carousel slideCount={DEMO_SLIDES.length}>
					<CarouselControl>
						<CarouselPrevTrigger />
						<CarouselItemGroup>
							<Index each={DEMO_SLIDES}>
								{(slide, index) => (
									<CarouselItem index={index}>
										<div
											class={cn(
												"flex h-40 w-full items-center justify-center rounded-md text-sm font-medium",
												slide().color
											)}
										>
											{slide().label}
										</div>
									</CarouselItem>
								)}
							</Index>
						</CarouselItemGroup>
						<CarouselNextTrigger />
					</CarouselControl>
					<CarouselIndicatorGroup>
						<Index each={DEMO_SLIDES}>{(_, index) => <CarouselIndicator index={index} />}</Index>
					</CarouselIndicatorGroup>
				</Carousel>
			),
		},
		{
			title: "Ghost Triggers",
			description: "Navigation buttons with ghost styling",
			code: () => (
				<Carousel slideCount={DEMO_SLIDES.length}>
					<CarouselControl>
						<CarouselPrevTrigger variant="ghost" />
						<CarouselItemGroup>
							<Index each={DEMO_SLIDES}>
								{(slide, index) => (
									<CarouselItem index={index}>
										<div
											class={cn(
												"flex h-40 w-full items-center justify-center rounded-md text-sm font-medium",
												slide().color
											)}
										>
											{slide().label}
										</div>
									</CarouselItem>
								)}
							</Index>
						</CarouselItemGroup>
						<CarouselNextTrigger variant="ghost" />
					</CarouselControl>
					<CarouselIndicatorGroup>
						<Index each={DEMO_SLIDES}>
							{(_, index) => <CarouselIndicator index={index} variant="dot" />}
						</Index>
					</CarouselIndicatorGroup>
				</Carousel>
			),
		},
		{
			title: "Line Indicators",
			description: "Carousel with line-style indicators",
			code: () => (
				<Carousel slideCount={DEMO_SLIDES.length}>
					<CarouselControl>
						<CarouselPrevTrigger variant="outline" />
						<CarouselItemGroup>
							<Index each={DEMO_SLIDES}>
								{(slide, index) => (
									<CarouselItem index={index}>
										<div
											class={cn(
												"flex h-40 w-full items-center justify-center rounded-md text-sm font-medium",
												slide().color
											)}
										>
											{slide().label}
										</div>
									</CarouselItem>
								)}
							</Index>
						</CarouselItemGroup>
						<CarouselNextTrigger variant="outline" />
					</CarouselControl>
					<CarouselIndicatorGroup>
						<Index each={DEMO_SLIDES}>
							{(_, index) => <CarouselIndicator index={index} variant="line" />}
						</Index>
					</CarouselIndicatorGroup>
				</Carousel>
			),
		},
		{
			title: "Multiple Per Page",
			description: "Show multiple slides at once with spacing",
			code: () => (
				<Carousel slideCount={DEMO_SLIDES.length} slidesPerPage={2} spacing="12px" size="full">
					<CarouselControl>
						<CarouselPrevTrigger />
						<CarouselItemGroup>
							<Index each={DEMO_SLIDES}>
								{(slide, index) => (
									<CarouselItem index={index}>
										<div
											class={cn(
												"flex h-40 w-full items-center justify-center rounded-md text-sm font-medium",
												slide().color
											)}
										>
											{slide().label}
										</div>
									</CarouselItem>
								)}
							</Index>
						</CarouselItemGroup>
						<CarouselNextTrigger />
					</CarouselControl>
					<CarouselContext>
						{(api) => (
							<CarouselIndicatorGroup>
								<Index each={api().pageSnapPoints}>
									{(_, index) => <CarouselIndicator index={index} />}
								</Index>
							</CarouselIndicatorGroup>
						)}
					</CarouselContext>
				</Carousel>
			),
		},
		{
			title: "Autoplay",
			description: "Carousel with automatic playback and loop",
			code: () => (
				<Carousel slideCount={DEMO_SLIDES.length} autoplay loop>
					<CarouselItemGroup>
						<Index each={DEMO_SLIDES}>
							{(slide, index) => (
								<CarouselItem index={index}>
									<div
										class={cn(
											"flex h-40 w-full items-center justify-center rounded-md text-sm font-medium",
											slide().color
										)}
									>
										{slide().label}
									</div>
								</CarouselItem>
							)}
						</Index>
					</CarouselItemGroup>
					<CarouselControl class="justify-center mt-2 gap-3">
						<CarouselPrevTrigger variant="outline" />
						<CarouselAutoplayTrigger />
						<CarouselNextTrigger variant="outline" />
					</CarouselControl>
					<CarouselIndicatorGroup>
						<Index each={DEMO_SLIDES}>{(_, index) => <CarouselIndicator index={index} />}</Index>
					</CarouselIndicatorGroup>
				</Carousel>
			),
		},
		{
			title: "Looping",
			description: "Carousel that loops back to the beginning",
			code: () => (
				<Carousel slideCount={DEMO_SLIDES.length} loop>
					<CarouselControl>
						<CarouselPrevTrigger />
						<CarouselItemGroup>
							<Index each={DEMO_SLIDES}>
								{(slide, index) => (
									<CarouselItem index={index}>
										<div
											class={cn(
												"flex h-40 w-full items-center justify-center rounded-md text-sm font-medium",
												slide().color
											)}
										>
											{slide().label}
										</div>
									</CarouselItem>
								)}
							</Index>
						</CarouselItemGroup>
						<CarouselNextTrigger />
					</CarouselControl>
					<CarouselIndicatorGroup>
						<Index each={DEMO_SLIDES}>{(_, index) => <CarouselIndicator index={index} />}</Index>
					</CarouselIndicatorGroup>
				</Carousel>
			),
		},
	],
};

export default Carousel;

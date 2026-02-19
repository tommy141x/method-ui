import { cva, type VariantProps } from "class-variance-authority";
import type { Component, JSX } from "solid-js";
import { mergeProps, Show, splitProps } from "solid-js";
import { cn } from "../lib/cn";
import type { ComponentMeta } from "../lib/meta";

const bookVariants = cva("group inline-block w-fit cursor-pointer transition-all duration-300", {
	variants: {
		animation: {
			hover: "[&>div]:hover:[transform:rotateY(-25deg)_scale(1.05)_translateX(-12px)]",
			default: "[&>div]:hover:[transform:rotateY(-20deg)_scale(1.066)_translateX(-8px)]",
			none: "",
		},
		size: {
			xs: "",
			sm: "",
			md: "",
			lg: "",
			xl: "",
		},
	},
	defaultVariants: {
		animation: "default",
		size: "md",
	},
});

const sizePresets = {
	xs: { width: 120, height: 160 },
	sm: { width: 150, height: 200 },
	md: { width: 196, height: 240 },
	lg: { width: 240, height: 320 },
	xl: { width: 300, height: 400 },
};

export interface BookProps {
	children?: JSX.Element;
	variant?: "default" | "simple" | "hardcover" | "notebook";
	color?: string;
	textColor?: string;
	depth?: number;
	illustration?: JSX.Element;
	width?: number;
	height?: number;
	spineText?: string;
	bookmark?: boolean;
	bookmarkColor?: string;
	animation?: VariantProps<typeof bookVariants>["animation"];
	size?: VariantProps<typeof bookVariants>["size"];
	orientation?: "portrait" | "landscape";
	pages?: number;
	author?: string;
	title?: string;
	class?: string;
}

export const Book: Component<BookProps> = (props) => {
	const merged = mergeProps(
		{
			color: "#555555",
			textColor: "currentColor",
			depth: 5,
			variant: "default" as const,
			animation: "default" as const,
			size: "md" as const,
			orientation: "portrait" as const,
			pages: 100,
			bookmark: false,
			bookmarkColor: "#fff200",
		},
		props
	);

	const [local, others] = splitProps(merged, [
		"children",
		"variant",
		"color",
		"textColor",
		"depth",
		"illustration",
		"width",
		"height",
		"spineText",
		"bookmark",
		"bookmarkColor",
		"animation",
		"size",
		"orientation",
		"pages",
		"author",
		"title",
		"class",
	]);

	const dimensions = () => sizePresets[local.size ?? "md"];
	const bookWidth = () => local.width || dimensions().width;
	const bookHeight = () => local.height || dimensions().height;

	const getVariantStyles = () => {
		switch (local.variant) {
			case "hardcover":
				return {
					"border-radius": "4px",
					border: "2px solid rgba(0,0,0,0.1)",
				};
			case "notebook":
				return {
					"border-radius": "6px",
					background: `linear-gradient(135deg, ${local.color} 0%, ${local.color}dd 100%)`,
				};
			default:
				return {
					"border-radius": "4px",
				};
		}
	};

	const bindBg = () =>
		local.variant === "notebook"
			? "linear-gradient(90deg, transparent 0%, rgba(255,0,0,0.3) 2%, transparent 4%, transparent 96%, rgba(255,0,0,0.5) 98%, transparent 100%)"
			: "linear-gradient(90deg,hsla(0,0%,100%,0),hsla(0,0%,100%,0) 12%,hsla(0,0%,100%,.25) 29.25%,hsla(0,0%,100%,0) 50.5%,hsla(0,0%,100%,0) 75.25%,hsla(0,0%,100%,.25) 91%,hsla(0,0%,100%,0)),linear-gradient(90deg,rgba(0,0,0,.03),rgba(0,0,0,.1) 12%,transparent 30%,rgba(0,0,0,.02) 50%,rgba(0,0,0,.2) 73.5%,rgba(0,0,0,.5) 75.25%,rgba(0,0,0,.15) 85.25%,transparent)";

	const pageGradient = () =>
		local.variant === "notebook"
			? "repeating-linear-gradient(90deg, #f8f9fa 0px, #e9ecef 1px, #f8f9fa 2px, #dee2e6 3px)"
			: "repeating-linear-gradient(90deg,#fff,#a3a3a3 1px,#fff 4px,#9a9a9a 0)";

	return (
		<div
			class={cn(bookVariants({ animation: local.animation, size: local.size }))}
			style={{
				perspective: "1200px",
				"--book-color": local.color,
				"--text-color": local.textColor,
				"--book-depth": `${local.depth}cqw`,
				"--book-width": `${bookWidth()}px`,
				"--book-height": `${bookHeight()}px`,
			}}
			{...others}
		>
			<div
				class={cn(
					"relative w-fit min-w-[calc(var(--book-width))] rotate-0 transition-all duration-700 ease-out contain-inline-size [transform-style:preserve-3d]",
					local.orientation === "landscape" ? "aspect-[4/3]" : "aspect-[3/4]"
				)}
			>
				{/* Main Book Cover */}
				<div
					class="absolute size-full overflow-hidden border"
					style={{
						"background-color": local.color,
						...getVariantStyles(),
						height: `${bookHeight()}px`,
					}}
				>
					{/* Bookmark Ribbon */}
					<Show when={local.bookmark}>
						<div
							class="absolute top-0 right-4 z-10 h-16 w-4 shadow-sm"
							style={{
								"background-color": local.bookmarkColor,
								"clip-path": "polygon(0 0, 100% 0, 100% 90%, 50% 100%, 0 90%)",
							}}
						/>
					</Show>

					{/* Spine Text */}
					<Show when={local.spineText}>
						<div
							class="absolute top-1/2 left-0 z-10 -translate-y-1/2 -rotate-90 px-2 text-xs font-semibold whitespace-nowrap"
							style={{
								color: local.textColor,
								"transform-origin": "center",
							}}
						>
							{local.spineText}
						</div>
					</Show>

					{/* Cover Content */}
					<Show when={local.variant !== "simple"}>
						<div
							class="relative flex h-full flex-col overflow-hidden"
							style={{ "background-color": local.color }}
						>
							{/* Bind Effect */}
							<div
								class="absolute inset-y-0 left-0 w-[10%] opacity-100 mix-blend-overlay"
								style={{ "background-image": bindBg() }}
							/>

							{/* Title and Author */}
							<Show when={local.title || local.author}>
								<div class="p-4 text-center">
									<Show when={local.title}>
										<h3 class="mb-2 text-lg font-bold" style={{ color: local.textColor }}>
											{local.title}
										</h3>
									</Show>
									<Show when={local.author}>
										<p
											class="absolute bottom-2 left-7 text-xs opacity-70"
											style={{ color: local.textColor }}
										>
											{local.author}
										</p>
									</Show>
								</div>
							</Show>

							{/* Illustration */}
							<Show when={local.illustration}>
								<div class="flex flex-1 items-center justify-center p-4">{local.illustration}</div>
							</Show>

							{/* Content */}
							<div class="flex-1 p-4">
								<div class="h-full w-full">{local.children}</div>
							</div>

							{/* Page Count */}
							<Show when={local.pages}>
								<div
									class="absolute right-2 bottom-2 text-xs opacity-70"
									style={{ color: local.textColor }}
								>
									{local.pages}p
								</div>
							</Show>
						</div>
					</Show>

					{/* Simple Variant Content */}
					<Show when={local.variant === "simple"}>
						<div class="flex h-full items-center justify-center p-4">{local.children}</div>
					</Show>
				</div>

				{/* Book Pages (Side) */}
				<div
					aria-hidden="true"
					class="absolute top-[3px] h-[calc(88%)] w-[calc(var(--book-depth)-2px)]"
					style={{
						"background-image": pageGradient(),
						transform:
							"translateX(calc(var(--book-width) - var(--book-depth) / 2 - 6px)) rotateY(90deg) translateX(calc(var(--book-depth) / 2))",
					}}
				/>

				{/* Book Back Cover */}
				<div
					aria-hidden="true"
					class="absolute left-0 h-[calc(90%)] w-full"
					style={{
						"background-color": local.color,
						...getVariantStyles(),
						transform: "translateZ(calc(-1 * var(--book-depth)))",
						filter: "brightness(0.8)",
					}}
				/>
			</div>
		</div>
	);
};

export const meta: ComponentMeta<BookProps> = {
	name: "Book",
	description:
		"A 3D book component with multiple variants and customizable styling. Features realistic depth, spine text, bookmarks, and hover animations.",
	apiReference: "",
	variants: bookVariants,
	examples: [
		{
			title: "Basic",
			description: "Simple book with title and author",
			code: () => (
				<div class="flex justify-center p-8">
					<Book title="The Great Book" author="John Doe" color="#2563eb" textColor="white" />
				</div>
			),
		},
		{
			title: "Variants",
			description: "Different book styles",
			code: () => (
				<div class="flex gap-8 justify-center items-end p-8">
					<Book variant="default" title="Default" color="#059669" textColor="white" size="sm" />
					<Book variant="hardcover" title="Hardcover" color="#dc2626" textColor="white" size="sm" />
					<Book variant="notebook" title="Notebook" color="#7c3aed" textColor="white" size="sm" />
				</div>
			),
		},
		{
			title: "Sizes",
			description: "Different book sizes",
			code: () => (
				<div class="flex gap-6 justify-center items-end p-8">
					<Book title="XS" size="xs" color="#f59e0b" textColor="white" />
					<Book title="SM" size="sm" color="#ec4899" textColor="white" />
					<Book title="MD" size="md" color="#8b5cf6" textColor="white" />
					<Book title="LG" size="lg" color="#06b6d4" textColor="white" />
				</div>
			),
		},
		{
			title: "With Features",
			description: "Book with bookmark, spine text, and pages",
			code: () => (
				<div class="flex justify-center p-8">
					<Book
						title="Advanced Features"
						author="Jane Smith"
						spineText="ADVANCED FEATURES"
						bookmark
						bookmarkColor="#fbbf24"
						pages={256}
						color="#1e40af"
						textColor="white"
						size="lg"
					/>
				</div>
			),
		},
	],
};

export default Book;

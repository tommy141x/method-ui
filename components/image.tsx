import type { ImageData } from "@responsive-image/core";
import { ResponsiveImage } from "@responsive-image/solid";
import type { Component, JSX } from "solid-js";
import { splitProps } from "solid-js";
import { cn } from "../lib/cn";
import type { ComponentMeta } from "../lib/meta";

// Type guard to check if src is responsive image data
const isResponsiveImageData = (src: unknown): src is ImageData => {
	return (
		Boolean(src) &&
		typeof src === "object" &&
		src !== null &&
		typeof src !== "string" &&
		"imageTypes" in src &&
		"availableWidths" in src &&
		"imageUrlFor" in src &&
		typeof (src as ImageData).imageUrlFor === "function"
	);
};

export interface ImageProps extends Omit<JSX.ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> {
	/** Image source - can be a responsive ImageData object or a regular URL string */
	src: ImageData | string;
	/** Alternative text for accessibility (required) */
	alt: string;
	/** Additional CSS classes */
	class?: string;
	/** Layout mode - 'responsive' (default) or 'fixed' */
	layout?: "responsive" | "fixed";
	/** Image width (for fixed layout) */
	width?: number;
	/** Image height (for fixed layout) */
	height?: number;
	/** Size in viewport width (for responsive layout, e.g., 70 for 70vw) */
	size?: number;
	/** Custom sizes attribute for more complex responsive scenarios */
	sizes?: string;
	/** Loading behavior */
	loading?: "lazy" | "eager";
	/** Decoding hint */
	decoding?: "async" | "sync" | "auto";
	/** Fetch priority hint */
	fetchpriority?: "high" | "low" | "auto";
	/** Object fit CSS property */
	objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
	/** Object position CSS property */
	objectPosition?: string;
	/** Priority loading (disables lazy loading and sets fetchpriority high) */
	priority?: boolean;
	/** Callback when image loads */
	onLoad?: (event: Event) => void;
	/** Callback when image fails to load */
	onError?: (event: Event) => void;
}

// Main Image component
export const Image: Component<ImageProps> = (props) => {
	const [local, otherProps] = splitProps(props, [
		"src",
		"alt",
		"class",
		"loading",
		"decoding",
		"fetchpriority",
		"priority",
		"objectFit",
		"objectPosition",
		"onLoad",
		"onError",
		"size",
		"sizes",
		"width",
		"height",
		"layout",
	]);

	// Early return if no src
	if (!local.src) {
		return null;
	}

	// Auto-detect LCP images and optimize them
	const isLCP =
		local.priority ||
		local.fetchpriority === "high" ||
		(local.width != null && local.width >= 800) ||
		(local.height != null && local.height >= 400);

	// Optimize loading strategy
	const optimizedLoading = (isLCP ? "eager" : (local.loading ?? "lazy")) as "lazy" | "eager";
	const optimizedFetchPriority = (isLCP ? "high" : (local.fetchpriority ?? "auto")) as
		| "high"
		| "low"
		| "auto";

	const imgStyle: JSX.CSSProperties | undefined =
		local.objectFit || local.objectPosition
			? {
					...(local.objectFit ? { "object-fit": local.objectFit } : {}),
					...(local.objectPosition ? { "object-position": local.objectPosition } : {}),
				}
			: undefined;

	// If it's a responsive ImageData object, use the @responsive-image/solid component.
	// Renders a proper <picture> element with <source> elements for avif/webp and an
	// <img> fallback, with correct srcset + sizes attributes. Handles SSR natively.
	if (isResponsiveImageData(local.src)) {
		return (
			<ResponsiveImage
				src={local.src}
				alt={local.alt}
				class={cn("rounded-lg", local.class)}
				loading={optimizedLoading}
				fetchpriority={optimizedFetchPriority}
				decoding={local.decoding ?? "async"}
				size={local.size}
				sizes={local.sizes}
				width={local.width}
				height={local.height}
				style={imgStyle}
				onLoad={local.onLoad}
				onError={local.onError}
				{...otherProps}
			/>
		);
	}

	// Regular string URL — plain <img>
	return (
		<img
			src={typeof local.src === "string" ? local.src : ""}
			alt={local.alt}
			class={cn("rounded-lg", local.class)}
			loading={optimizedLoading}
			fetchpriority={optimizedFetchPriority}
			decoding={local.decoding ?? "async"}
			style={imgStyle}
			onLoad={local.onLoad}
			onError={local.onError}
			{...otherProps}
		/>
	);
};

export const meta: ComponentMeta<ImageProps> = {
	name: "Image",
	description:
		"A responsive image component powered by @responsive-image/solid. Automatically generates optimized images in multiple sizes and formats (WebP, AVIF) with Low Quality Image Placeholders (LQIP). Supports both local images (processed at build time) and regular image URLs. \n\n**Setup Required**: Add the Vite plugin to your `app.config.ts`:\n\n```typescript\nimport { setupPlugins } from '@responsive-image/vite-plugin';\nimport { defineConfig } from '@solidjs/start/config';\n\nexport default defineConfig({\n  vite: {\n    plugins: [\n      setupPlugins({\n        include: /^[^?]+\\.(jpg|jpeg|png|webp)\\?.*responsive.*$/,\n      }),\n    ],\n  },\n});\n```\n\n**TypeScript Setup**: Add to `types/global.d.ts`:\n\n```typescript\ndeclare module '*responsive' {\n  import type { ImageData } from '@responsive-image/core';\n  const value: ImageData;\n  export default value;\n}\n```\n\n**Import Usage**: Import local images with `?responsive` query:\n\n```typescript\nimport heroImage from './hero.jpg?responsive';\n// With LQIP:\nimport heroImage from './hero.jpg?lqip=blurhash&responsive';\n// Custom sizes:\nimport heroImage from './hero.jpg?w=400;800;1200&responsive';\n```",
	apiReference: "https://responsive-image.dev/",
	examples: [
		{
			title: "Responsive Image",
			description: "Automatically fills container width with optimized sizes",
			code: () => {
				return (
					<Image
						src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200"
						alt="Mountain landscape"
					/>
				);
			},
		},
		{
			title: "Fixed Size Image",
			description: "Render an image with fixed dimensions and 2x for retina",
			code: () => {
				return (
					<Image
						src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400"
						alt="Mountain landscape"
						width={400}
						layout="fixed"
					/>
				);
			},
		},
		{
			title: "Priority Image (LCP)",
			description: "Disable lazy loading for above-the-fold hero images",
			code: () => {
				return (
					<Image
						src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200"
						alt="Hero image"
						priority
						objectFit="cover"
					/>
				);
			},
		},
		{
			title: "Custom Object Fit",
			description: "Control how the image fits within its container",
			code: () => {
				return (
					<div class="h-96">
						<Image
							src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200"
							alt="Mountain landscape"
							objectFit="cover"
							objectPosition="center"
							class="h-full"
						/>
					</div>
				);
			},
		},
	],
};

export default Image;

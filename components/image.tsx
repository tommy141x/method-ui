import type { JSX, Component } from "solid-js";
import { splitProps, Show } from "solid-js";
import { isServer } from "solid-js/web";
import { cn } from "../lib/cn";
import type { ComponentMeta } from "../lib/meta";
import type { ImageData } from "@responsive-image/core";

// Type guard to check if src is responsive image data
const isResponsiveImageData = (src: any): src is ImageData => {
  return (
    src &&
    typeof src === "object" &&
    typeof src !== "string" &&
    "imageTypes" in src &&
    "availableWidths" in src &&
    "aspectRatio" in src &&
    "imageUrlFor" in src &&
    typeof src.imageUrlFor === "function"
  );
};

export interface ImageProps
  extends Omit<JSX.ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> {
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

// Helper to generate fallback img props from responsive image data
const createFallbackImgProps = (
  src: ImageData,
  props: Partial<ImageProps>,
  targetWidth?: number,
) => {
  // Calculate optimal fallback width based on props
  const fallbackWidth = (() => {
    if (targetWidth) return targetWidth;
    if (props.width) return props.width;
    if (props.size) return props.size;

    // Parse sizes attribute to get a reasonable default
    if (props.sizes) {
      const sizeMatch = props.sizes.match(/(\d+)px/);
      if (sizeMatch) return parseInt(sizeMatch[1]);

      // Handle viewport units
      const vwMatch = props.sizes.match(/(\d+)vw/);
      if (vwMatch) {
        const vw = parseInt(vwMatch[1]);
        return Math.round((vw / 100) * 1200); // Assume 1200px viewport
      }
    }

    // Default fallback width
    return 800;
  })();

  // Calculate height based on aspect ratio if not provided
  const fallbackHeight =
    props.height ||
    (src.aspectRatio ? Math.round(fallbackWidth / src.aspectRatio) : undefined);

  // Generate fallback src URL
  const fallbackSrc = (() => {
    try {
      const widths = src.availableWidths || [];
      const targetWidth = fallbackWidth;

      // Find the closest available width that's >= target width
      let closestWidth = widths.find((w) => w >= targetWidth);
      if (!closestWidth) {
        // If no width is large enough, use the largest available
        closestWidth = Math.max(...widths);
      }

      return src.imageUrlFor(closestWidth || fallbackWidth);
    } catch (error) {
      console.warn("Failed to generate fallback URL:", error);
      // Try with a smaller width
      try {
        return src.imageUrlFor(400);
      } catch {
        // Last resort
        return (src as any).src || "";
      }
    }
  })();

  return {
    src: fallbackSrc,
    width: fallbackWidth,
    height: fallbackHeight,
    alt: props.alt || "",
    class: props.class,
    loading: props.loading,
    fetchpriority: props.fetchpriority,
    decoding: props.decoding || "async",
    style: {
      ...(props.objectFit && { "object-fit": props.objectFit }),
      ...(props.objectPosition && { "object-position": props.objectPosition }),
    },
  };
};

// Internal component for responsive images
const InternalResponsiveImage: Component<ImageProps> = (props) => {
  const [local, otherProps] = splitProps(props, [
    "src",
    "alt",
    "width",
    "height",
    "size",
    "sizes",
    "layout",
    "class",
    "loading",
    "decoding",
    "fetchpriority",
    "objectFit",
    "objectPosition",
    "priority",
    "onLoad",
    "onError",
  ]);

  if (!isResponsiveImageData(local.src)) {
    return null;
  }

  // Determine target width for fallback
  const getTargetWidth = () => {
    if (local.width) return local.width;
    if (local.size) return local.size;

    if (local.sizes) {
      const sizeMatch = local.sizes.match(/(\d+)px/);
      if (sizeMatch) return parseInt(sizeMatch[1]);

      const vwMatch = local.sizes.match(/(\d+)vw/);
      if (vwMatch) {
        const vw = parseInt(vwMatch[1]);
        return Math.round((vw / 100) * 1200);
      }
    }

    return 800;
  };

  const targetWidth = getTargetWidth();
  const fallbackImgProps = createFallbackImgProps(
    local.src,
    local,
    targetWidth,
  );

  // Fallback element
  const fallbackElement = (
    <img
      {...fallbackImgProps}
      class={cn("rounded-lg", fallbackImgProps.class)}
      {...otherProps}
    />
  );

  // Server-side rendering: always use fallback
  if (isServer) {
    return fallbackElement;
  }

  // Client-side: dynamically load ResponsiveImage
  return (
    <Show when={!isServer} fallback={fallbackElement}>
      <ClientOnlyResponsiveImage
        {...local}
        fallbackElement={fallbackElement}
        {...otherProps}
      />
    </Show>
  );
};

// Client-only wrapper for ResponsiveImage
const ClientOnlyResponsiveImage: Component<
  ImageProps & { fallbackElement: JSX.Element }
> = (props) => {
  const [local, otherProps] = splitProps(props, [
    "src",
    "alt",
    "width",
    "height",
    "size",
    "sizes",
    "layout",
    "class",
    "loading",
    "decoding",
    "fetchpriority",
    "priority",
    "fallbackElement",
  ]);

  // Dynamically import ResponsiveImage
  let ResponsiveImageComponent: any;

  try {
    import("@responsive-image/solid").then((module) => {
      ResponsiveImageComponent = module.ResponsiveImage;
    });
  } catch (error) {
    console.error("Failed to load ResponsiveImage:", error);
    return local.fallbackElement;
  }

  if (!ResponsiveImageComponent) {
    return local.fallbackElement;
  }

  try {
    const responsiveProps: any = {
      src: local.src,
      alt: local.alt,
      class: cn("rounded-lg", local.class),
      loading:
        local.priority || local.loading === "eager" ? "eager" : local.loading,
      decoding: local.decoding || "async",
      fetchpriority: local.priority ? "high" : local.fetchpriority,
      ...otherProps,
    };

    // Add layout-specific props
    if (local.layout === "fixed" && (local.width || local.height)) {
      if (local.width) responsiveProps.width = local.width;
      if (local.height) responsiveProps.height = local.height;
    } else {
      // Responsive layout
      if (local.size) responsiveProps.size = local.size;
      if (local.sizes) responsiveProps.sizes = local.sizes;
    }

    return <ResponsiveImageComponent {...responsiveProps} />;
  } catch (error) {
    console.error("Error rendering ResponsiveImage:", error);
    return local.fallbackElement;
  }
};

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
  ]);

  // Early return if no src
  if (!local.src) {
    return null;
  }

  // Auto-detect LCP images and optimize them
  const isLikelyLCP = () => {
    if (local.priority) return true;
    if (local.fetchpriority === "high") return true;

    const width = (props as any).width || 0;
    const height = (props as any).height || 0;
    return width >= 800 || height >= 400;
  };

  // Optimize loading strategy
  const optimizedLoading = isLikelyLCP() ? "eager" : local.loading || "lazy";
  const optimizedFetchPriority = isLikelyLCP()
    ? "high"
    : local.fetchpriority || "auto";

  const imageStyle: JSX.CSSProperties = {
    ...(local.objectFit && { "object-fit": local.objectFit }),
    ...(local.objectPosition && { "object-position": local.objectPosition }),
  };

  // Handle error state
  const handleError = (event: Event) => {
    local.onError?.(event);
  };

  const handleLoad = (event: Event) => {
    local.onLoad?.(event);
  };

  // If it's a responsive ImageData object, use InternalResponsiveImage
  if (isResponsiveImageData(local.src)) {
    return (
      <InternalResponsiveImage
        {...props}
        loading={optimizedLoading as any}
        fetchpriority={optimizedFetchPriority as any}
        decoding={local.decoding || "async"}
      />
    );
  }

  // Regular image fallback
  const imgSrc = typeof local.src === "string" ? local.src : "";

  return (
    <img
      src={imgSrc}
      alt={local.alt}
      class={cn("rounded-lg", local.class)}
      loading={optimizedLoading as any}
      fetchpriority={optimizedFetchPriority as any}
      decoding={local.decoding || "async"}
      style={imageStyle}
      onLoad={handleLoad}
      onError={handleError}
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

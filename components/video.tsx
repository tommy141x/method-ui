import type { Component, JSX } from "solid-js";
import { createSignal, ErrorBoundary, onCleanup, onMount, Show, splitProps } from "solid-js";
import { isServer } from "solid-js/web";
import { cn } from "../lib/cn";
import type { ComponentMeta } from "../lib/meta";

export interface VideoProps extends JSX.VideoHTMLAttributes<HTMLVideoElement> {
	children?: JSX.Element;
	class?: string;
	/** Plyr options object - pass any Plyr configuration options */
	options?: any;
	/** Video provider type */
	provider?: "html5" | "youtube" | "vimeo";
	/** Video source URL or ID (for YouTube/Vimeo) */
	src?: string;
	/** Poster image URL (HTML5 video only) */
	poster?: string;
	/** Title of the media (for accessibility) */
	title?: string;
	/** Autoplay the video on load */
	autoplay?: boolean;
	/** Start playback muted */
	muted?: boolean;
	/** Loop the video */
	loop?: boolean;
	/** Enable/disable controls */
	controls?: boolean;
	/** Playback speed (e.g., 0.5, 1, 1.5, 2) */
	speed?: number;
	/** Video quality (e.g., 720, 1080) */
	quality?: number;
	/** Initial volume (0-1) */
	volume?: number;
	/** Click video to toggle play/pause */
	clickToPlay?: boolean;
	/** Hide controls automatically after inactivity */
	hideControls?: boolean;
	/** Enable keyboard shortcuts */
	keyboard?: boolean | { focused: boolean; global: boolean };
	/** Enable tooltips on controls */
	tooltips?: boolean | { controls: boolean; seek: boolean };
	/** Captions configuration */
	captions?: {
		active?: boolean;
		language?: string;
		update?: boolean;
	};
	/** Fullscreen configuration */
	fullscreen?: {
		enabled?: boolean;
		fallback?: boolean | "force";
		iosNative?: boolean;
		container?: string;
	};
	/** Preview thumbnails configuration */
	previewThumbnails?: {
		enabled: boolean;
		src: string | string[];
		withCredentials?: boolean;
	};
	/** Event handlers */
	onReady?: (player: any) => void;
	onPlay?: (event: any) => void;
	onPause?: (event: any) => void;
	onEnded?: (event: any) => void;
	onError?: (event: any) => void;
	onTimeUpdate?: (event: any) => void;
	onSeeking?: (event: any) => void;
	onSeeked?: (event: any) => void;
	onVolumeChange?: (event: any) => void;
	onQualityChange?: (event: any) => void;
	onRateChange?: (event: any) => void;
	onEnterFullscreen?: (event: any) => void;
	onExitFullscreen?: (event: any) => void;
}

/**
 * Plyr CSS custom properties mapped to Method UI design tokens
 *
 * This inline style object maps all Plyr video player CSS variables to our
 * UnoCSS/global.css theming system. This ensures the video player automatically
 * adapts to theme changes and maintains visual consistency with the rest of the UI.
 *
 * Key mappings:
 * - Primary colors → --primary (main UI color, focus states, accents)
 * - Backgrounds → --background, --card, --popover (context-dependent)
 * - Foregrounds → --foreground, --card-foreground, --popover-foreground
 * - Muted colors → --muted, --muted-foreground (badges, progress, tracks)
 * - Border radius → --radius (consistent with global border radius tokens)
 * - Font family → --font-sans (consistent typography)
 * - Shadows → Custom shadows using --background with opacity
 *
 * @see https://github.com/sampotts/plyr#customizing-the-css
 */
const plyrThemeStyles: Record<string, string> = {
	"--plyr-color-main": "hsl(var(--primary))",
	"--plyr-video-background": "hsl(var(--background))",
	"--plyr-focus-visible-color": "hsl(var(--primary))",
	"--plyr-badge-background": "hsl(var(--muted))",
	"--plyr-badge-text-color": "hsl(var(--muted-foreground))",
	"--plyr-badge-border-radius": "var(--radius)",
	"--plyr-captions-background": "hsl(var(--popover) / 0.9)",
	"--plyr-captions-text-color": "hsl(var(--popover-foreground))",
	"--plyr-control-icon-size": "18px",
	"--plyr-control-spacing": "10px",
	"--plyr-control-radius": "calc(var(--radius) - 2px)",
	"--plyr-control-toggle-checked-background": "hsl(var(--primary))",
	"--plyr-video-controls-background": "linear-gradient(transparent, hsl(var(--background) / 0.95))",
	"--plyr-video-control-color": "hsl(var(--foreground))",
	"--plyr-video-control-color-hover": "hsl(var(--foreground))",
	"--plyr-video-control-background-hover": "hsl(var(--accent))",
	"--plyr-audio-controls-background": "hsl(var(--card))",
	"--plyr-audio-control-color": "hsl(var(--card-foreground))",
	"--plyr-audio-control-color-hover": "hsl(var(--card-foreground))",
	"--plyr-audio-control-background-hover": "hsl(var(--accent))",
	"--plyr-menu-background": "hsl(var(--popover))",
	"--plyr-menu-color": "hsl(var(--popover-foreground))",
	"--plyr-menu-shadow":
		"0 4px 6px -1px hsl(var(--foreground) / 0.1), 0 2px 4px -2px hsl(var(--foreground) / 0.1)",
	"--plyr-menu-radius": "var(--radius)",
	"--plyr-menu-arrow-size": "6px",
	"--plyr-menu-item-arrow-color": "hsl(var(--muted-foreground))",
	"--plyr-menu-item-arrow-size": "4px",
	"--plyr-menu-border-color": "hsl(var(--border))",
	"--plyr-menu-border-shadow-color": "hsl(var(--border) / 0.1)",
	"--plyr-progress-loading-size": "25px",
	"--plyr-progress-loading-background": "hsl(var(--muted) / 0.6)",
	"--plyr-video-progress-buffered-background": "hsl(var(--muted-foreground) / 0.25)",
	"--plyr-audio-progress-buffered-background": "hsl(var(--muted) / 0.6)",
	"--plyr-range-thumb-height": "13px",
	"--plyr-range-thumb-background": "hsl(var(--foreground))",
	"--plyr-range-thumb-shadow":
		"0 1px 2px hsl(var(--foreground) / 0.15), 0 0 0 1px hsl(var(--border))",
	"--plyr-range-thumb-active-shadow-width": "3px",
	"--plyr-range-track-height": "5px",
	"--plyr-range-fill-background": "hsl(var(--primary))",
	"--plyr-video-range-track-background": "hsl(var(--muted-foreground) / 0.3)",
	"--plyr-video-range-thumb-active-shadow-color": "hsl(var(--primary) / 0.5)",
	"--plyr-audio-range-track-background": "hsl(var(--muted) / 0.4)",
	"--plyr-audio-range-thumb-active-shadow-color": "hsl(var(--primary) / 0.3)",
	"--plyr-tooltip-background": "hsl(var(--popover))",
	"--plyr-tooltip-color": "hsl(var(--popover-foreground))",
	"--plyr-tooltip-padding": "calc(10px / 2)",
	"--plyr-tooltip-arrow-size": "4px",
	"--plyr-tooltip-radius": "calc(var(--radius) - 2px)",
	"--plyr-tooltip-shadow":
		"0 1px 3px 0 hsl(var(--foreground) / 0.1), 0 1px 2px -1px hsl(var(--foreground) / 0.1)",
	"--plyr-font-family": "var(--font-sans)",
	"--plyr-font-size-base": "15px",
	"--plyr-font-size-small": "13px",
	"--plyr-font-size-large": "18px",
	"--plyr-font-size-xlarge": "21px",
	"--plyr-font-weight-regular": "400",
	"--plyr-font-weight-bold": "600",
	"--plyr-line-height": "1.7",
};

// Additional styles to ensure iframes (YouTube) respect rounded corners
const additionalVideoStyles = `
  .plyr iframe {
    border-radius: var(--radius);
  }
  .plyr__video-wrapper {
    border-radius: var(--radius);
    overflow: hidden;
  }
`;

// Default Plyr options for proper sizing and behavior
const defaultPlyrOptions = {
	fullscreen: { enabled: true, fallback: true, iosNative: false },
	hideControls: true,
	blankVideo: "",
	controls: [
		"play-large",
		"play",
		"progress",
		"current-time",
		"mute",
		"volume",
		"captions",
		"settings",
		"pip",
		"airplay",
		"fullscreen",
	],
};

export const Video: Component<VideoProps> = (props) => {
	const [local, videoProps] = splitProps(props, [
		"children",
		"class",
		"options",
		"provider",
		"src",
		"poster",
		"title",
		"autoplay",
		"muted",
		"loop",
		"speed",
		"quality",
		"volume",
		"clickToPlay",
		"hideControls",
		"keyboard",
		"tooltips",
		"captions",
		"fullscreen",
		"previewThumbnails",
		"onReady",
		"onPlay",
		"onPause",
		"onEnded",
		"onError",
		"onTimeUpdate",
		"onSeeking",
		"onSeeked",
		"onVolumeChange",
		"onQualityChange",
		"onRateChange",
		"onEnterFullscreen",
		"onExitFullscreen",
	]);

	let playerRef: HTMLVideoElement | HTMLDivElement | undefined;
	let player: any;
	const [_mounted, setMounted] = createSignal(false);
	const [error, setError] = createSignal<string | null>(null);

	const isEmbed = local.provider === "youtube" || local.provider === "vimeo";

	onMount(async () => {
		if (isServer || !playerRef) return;

		try {
			// Load Plyr CSS if not already loaded
			if (!document.querySelector('link[href*="plyr.css"]')) {
				const link = document.createElement("link");
				link.rel = "stylesheet";
				link.href = "https://cdn.plyr.io/3.7.8/plyr.css";
				document.head.appendChild(link);
			}

			// Add custom styles for rounded corners on iframes
			if (!document.querySelector("#plyr-custom-styles")) {
				const style = document.createElement("style");
				style.id = "plyr-custom-styles";
				style.textContent = additionalVideoStyles;
				document.head.appendChild(style);
			}

			const Plyr = (await import("plyr")).default;

			// Merge default options with user options and component props
			const plyrOptions = {
				...defaultPlyrOptions,
				...local.options,
				// Override with component props if provided
				...(local.title && { title: local.title }),
				...(local.autoplay !== undefined && { autoplay: local.autoplay }),
				...(local.muted !== undefined && { muted: local.muted }),
				...(local.loop !== undefined && { loop: { active: local.loop } }),
				...(local.volume !== undefined && { volume: local.volume }),
				...(local.clickToPlay !== undefined && {
					clickToPlay: local.clickToPlay,
				}),
				...(local.hideControls !== undefined && {
					hideControls: local.hideControls,
				}),
				...(local.keyboard !== undefined && { keyboard: local.keyboard }),
				...(local.tooltips !== undefined && { tooltips: local.tooltips }),
				...(local.captions && { captions: local.captions }),
				...(local.fullscreen && { fullscreen: local.fullscreen }),
				...(local.previewThumbnails && {
					previewThumbnails: local.previewThumbnails,
				}),
				...(local.speed !== undefined && {
					speed: {
						selected: local.speed,
						options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
					},
				}),
				...(local.quality !== undefined && {
					quality: {
						default: local.quality,
						options: [4320, 2880, 2160, 1440, 1080, 720, 576, 480, 360, 240],
					},
				}),
			};

			// Initialize Plyr
			player = new Plyr(playerRef, plyrOptions);

			// Attach event listeners
			if (player?.on) {
				if (local.onReady) {
					player.on("ready", (_event: any) => local.onReady?.(player));
				}
				if (local.onPlay) {
					player.on("play", local.onPlay);
				}
				if (local.onPause) {
					player.on("pause", local.onPause);
				}
				if (local.onEnded) {
					player.on("ended", local.onEnded);
				}
				if (local.onTimeUpdate) {
					player.on("timeupdate", local.onTimeUpdate);
				}
				if (local.onSeeking) {
					player.on("seeking", local.onSeeking);
				}
				if (local.onSeeked) {
					player.on("seeked", local.onSeeked);
				}
				if (local.onVolumeChange) {
					player.on("volumechange", local.onVolumeChange);
				}
				if (local.onQualityChange) {
					player.on("qualitychange", local.onQualityChange);
				}
				if (local.onRateChange) {
					player.on("ratechange", local.onRateChange);
				}
				if (local.onEnterFullscreen) {
					player.on("enterfullscreen", local.onEnterFullscreen);
				}
				if (local.onExitFullscreen) {
					player.on("exitfullscreen", local.onExitFullscreen);
				}
			}

			// Add error event listener
			if (player?.on) {
				player.on("error", (event: any) => {
					console.error("Plyr error:", event);
					setError("Failed to load video. The video source may be unavailable.");
					// Call user's error handler if provided
					if (local.onError) {
						local.onError(event);
					}
				});
			}

			setMounted(true);
		} catch (error) {
			console.error("Failed to load Plyr:", error);
			setError("Failed to initialize video player.");
		}
	});

	onCleanup(() => {
		if (player?.destroy) {
			player.destroy();
		}
	});

	// Combine theme styles with container styles
	const containerStyles = {
		...plyrThemeStyles,
		width: "100%",
		position: "relative" as const,
		overflow: "hidden" as const,
		borderRadius: "var(--radius)",
	};

	return (
		<ErrorBoundary
			fallback={(_err) => (
				<div
					style={containerStyles}
					class={cn(
						"flex items-center justify-center bg-muted/50 rounded-lg p-8 min-h-[300px]",
						local.class
					)}
				>
					<div class="text-center space-y-2">
						<div class="text-destructive font-semibold">Video Player Error</div>
						<div class="text-sm text-muted-foreground">
							{error() || "An unexpected error occurred while loading the video player."}
						</div>
					</div>
				</div>
			)}
		>
			<div style={containerStyles} class={cn(local.class)}>
				<Show
					when={error()}
					fallback={
						<Show
							when={!isServer}
							fallback={
								<video
									class="w-full h-auto rounded-lg"
									poster={local.poster}
									src={local.src}
									controls
									{...videoProps}
								>
									{local.children}
								</video>
							}
						>
							{isEmbed ? (
								<div
									ref={playerRef as HTMLDivElement}
									class="plyr rounded-lg overflow-hidden"
									data-plyr-provider={local.provider}
									data-plyr-embed-id={local.src}
								/>
							) : (
								<video
									ref={playerRef as HTMLVideoElement}
									class="plyr rounded-lg"
									playsinline
									controls
									preload="metadata"
									poster={local.poster}
									src={local.src}
									{...videoProps}
								>
									{local.children}
								</video>
							)}
						</Show>
					}
				>
					<div
						class={cn(
							"flex items-center justify-center bg-muted/50 rounded-lg p-8 min-h-[300px]",
							local.class
						)}
					>
						<div class="text-center space-y-2">
							<div class="text-destructive font-semibold">Video Load Error</div>
							<div class="text-sm text-muted-foreground">{error()}</div>
						</div>
					</div>
				</Show>
			</div>
		</ErrorBoundary>
	);
};

export const meta: ComponentMeta<VideoProps> = {
	name: "Video",
	description:
		"A comprehensive video player component powered by Plyr. Supports HTML5 video, YouTube, and Vimeo with features like captions, keyboard shortcuts, preview thumbnails, quality selection, speed controls, and full event handling. Fully themed to match your design system.",
	apiReference: "https://github.com/sampotts/plyr",
	examples: [
		{
			title: "Basic HTML5 Video",
			description: "Simple HTML5 video player",
			code: () => (
				<Video src="https://media.tommy-johnston.com/api/assets/b5fa48f2-6a24-4392-8026-777f973b4c73/video/playback?key=ZB3A5C98YCJugb5uFXvlgZ9EIgDWVH_xZlfORxjWS8UFFR7ZIunQmr7nkEZ9X_1TUuM&c=mMYFI4Rfq6e%2FfAhoj0OHCGU%3D" />
			),
		},
		{
			title: "YouTube Video",
			description: "Embedded YouTube video with Plyr controls",
			code: () => (
				<Video
					provider="youtube"
					src="T9mZdGRVc-c"
					options={{
						youtube: { noCookie: true },
					}}
				/>
			),
		},
	],
};

export default Video;

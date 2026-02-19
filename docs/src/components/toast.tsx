/**
 * Toast Component - Notification system using solid-notifications
 *
 * SETUP INSTRUCTIONS:
 *
 * 1. Wrap your app with ToastProvider and add the Toaster component:
 *
 *    import { ToastContainer } from "./components/toast";
 *
 *    export default function App() {
 *      return (
 *        <ToastContainer>
 *          {/* Your app content *\/}
 *        </ToastContainer>
 *      );
 *    }
 *
 * 2. Use toast notifications in your components:
 *
 *    Using the hook:
 *    import { useToast } from "./components/toast";
 *
 *    const { notify } = useToast();
 *    notify("Hello world!", { type: "success" });
 *
 *    Using helper functions:
 *    import { toast } from "./components/toast";
 *
 *    toast.success("Operation successful!");
 *    toast.error("Something went wrong!");
 *    toast.warning("Please be careful!");
 *    toast.info("Did you know?");
 *    toast.loading("Processing...");
 *
 *    Using global API (no imports needed in component):
 *    import { showToast } from "./components/toast";
 *
 *    showToast("Hello world!", { type: "success", duration: 5000 });
 *
 * FEATURES:
 * - Multiple toast types (default, success, error, warning, info, loading)
 * - Customizable duration and position
 * - Promise-based toasts for async operations
 * - Custom JSX content support
 * - Update and dismiss toasts programmatically
 * - Dark mode support via CSS variables
 * - Keyboard shortcuts (Alt+T to focus, Escape to dismiss)
 * - Pause on hover and window blur
 * - Drag to dismiss
 */

import { cva } from "class-variance-authority";
import type { ClassValue } from "clsx";
import clsx from "clsx";
import type { Component, JSX } from "solid-js";
import { mergeProps, splitProps } from "solid-js";
import { Portal } from "solid-js/web";
import {
	Toaster as SolidToaster,
	ToastProvider as SolidToastProvider,
	showToast,
	type ToastOptions,
	useToast,
} from "solid-notifications";
import { unoMerge } from "unocss-merge";

// Hardcoded cn function - makes this component completely self-contained
function cn(...classLists: ClassValue[]) {
	return unoMerge(clsx(classLists));
}

// Icon helper function - returns UnoCSS icon class for your configured icon library
function icon(name: string): string {
	return `i-lucide-${name}`;
}

const _toastVariants = cva("", {
	variants: {
		variant: {
			default: "",
			success: "",
			error: "",
			warning: "",
			info: "",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

// Toast icon map - defined at module level so UnoCSS extractor can find icon() calls
const TOAST_ICONS = {
	success: icon("circle-check"),
	error: icon("circle-x"),
	warning: icon("triangle-alert"),
	info: icon("info"),
	loading: icon("loader-circle"),
	default: icon("bell"),
} as const;

export interface ToastProps {
	variant?: "default" | "success" | "error" | "warning" | "info";
	duration?: number | false;
	position?:
		| "top-left"
		| "top-center"
		| "top-right"
		| "bottom-left"
		| "bottom-center"
		| "bottom-right";
}

/**
 * Toaster component props
 */
export interface ToasterProps {
	toasterId?: string;
	position?: "top" | "bottom";
	align?: "left" | "center" | "right";
	class?: string;
	// Toaster config
	limit?: number | false;
	reverseToastOrder?: boolean;
	offsetX?: number;
	offsetY?: number;
	gutter?: number;
	renderOnWindowInactive?: boolean;
	pauseOnWindowInactive?: boolean;
	toasterStyle?: JSX.CSSProperties;
	// Toast config
	theme?: string | undefined | null;
	type?: "default" | "success" | "error" | "loading" | "warning" | "info";
	duration?: number | false;
	onEnter?: string;
	enterDuration?: number;
	onExit?: string;
	exitDuration?: number;
	onIdle?: string;
	style?:
		| JSX.CSSProperties
		| ((args: { theme: string | undefined | null; type: string }) => JSX.CSSProperties);
	pauseOnHover?: boolean;
	wrapperClass?: string | ((args: { theme: string | undefined | null; type: string }) => string);
	wrapperStyle?:
		| JSX.CSSProperties
		| ((args: { theme: string | undefined | null; type: string }) => JSX.CSSProperties);
	enterCallback?: () => void;
	updateCallback?: () => void;
	exitCallback?: (reason?: boolean | string) => void;
	showDismissButton?: boolean;
	dismissButtonClass?:
		| string
		| ((args: { theme: string | undefined | null; type: string }) => string);
	dismissButtonStyle?:
		| JSX.CSSProperties
		| ((args: { theme: string | undefined | null; type: string }) => JSX.CSSProperties);
	dismissOnClick?: boolean;
	showProgressBar?: boolean;
	progressBarClass?:
		| string
		| ((args: { theme: string | undefined | null; type: string }) => string);
	progressBarStyle?:
		| JSX.CSSProperties
		| ((args: { theme: string | undefined | null; type: string }) => JSX.CSSProperties);
	showIcon?: boolean;
	icon?:
		| JSX.Element
		| null
		| ((args: { theme: string | undefined | null; type: string }) => JSX.Element);
	dragToDismiss?: boolean;
	dragTreshold?: number;
	ariaLive?: "polite" | "assertive" | "off";
	role?: "status" | "alert";
}

/**
 * Toaster - Container for rendering toast notifications
 * Place this component where you want toasts to appear
 */
export const Toaster: Component<ToasterProps> = (props) => {
	const merged = mergeProps(
		{
			position: "top" as const,
			align: "right" as const,
			toasterId: "default",
			offsetX: 16,
			offsetY: 16,
			gutter: 8,
			duration: 5000,
			showIcon: true,
			showDismissButton: true,
			showProgressBar: true,
		},
		props
	);

	const [local, others] = splitProps(merged, [
		"toasterId",
		"position",
		"align",
		"class",
		"toasterStyle",
	]);

	console.log("Toaster component rendering with toasterId:", local.toasterId);

	return (
		<>
			<style>
				{`
          /* Solid Notifications CSS Variables */
          :root {
            --sn-z-index: 999999;
            --sn-color-default: hsl(var(--foreground));
            --sn-color-success: #22c55e;
            --sn-color-error: #ef4444;
            --sn-color-warning: #f59e0b;
            --sn-color-info: #3b82f6;

            --sn-wrapper-max-width: 24rem;
            --sn-wrapper-min-width: 18rem;
            --sn-wrapper-transition-duration: 0.3s;

            --sn-toast-bg-color: hsl(var(--background));
            --sn-toast-gap: 0.75rem;
            --sn-toast-font-size: 0.875rem;
            --sn-toast-line-height: 1.5;
            --sn-toast-padding: 0.75rem;
            --sn-toast-text-color: hsl(var(--foreground));
            --sn-toast-border-radius: 0.5rem;
            --sn-toast-box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);

            --sn-dismiss-btn-size: 1.5rem;
            --sn-dismiss-btn-border-radius: 0.25rem;
            --sn-dismiss-btn-transition: opacity 0.3s;
            --sn-dismiss-btn-margin: 0;
            --sn-dismiss-btn-color: hsl(var(--muted-foreground));
            --sn-dismiss-btn-hover-color: hsl(var(--foreground));

            --sn-progress-bar-height: 0.25rem;
            --sn-progress-bar-color: hsl(var(--primary));

            --sn-icon-size: 1.25rem;
            --sn-icon-margin: 0.125rem 0 0 0;
            --sn-icon-stroke: currentColor;
            --sn-icon-fill: hsl(var(--foreground));
          }

          .dark {
            --sn-toast-box-shadow: inset 0 0 0.5px 1px hsla(0, 0%, 100%, 0.075),
              0 0 0 1px hsla(0, 0%, 0%, 0.05), 0 0.3px 0.4px hsla(0, 0%, 0%, 0.02),
              0 0.9px 1.5px hsla(0, 0%, 0%, 0.045), 0 3.5px 6px hsla(0, 0%, 0%, 0.09);
          }

          /* Base toast structure */
          .sn-toaster {
            position: fixed !important;
            z-index: var(--sn-z-index) !important;
            pointer-events: none !important;
          }

          .sn-toast-wrapper {
            pointer-events: auto !important;
            transition: all var(--sn-wrapper-transition-duration) cubic-bezier(0.4, 0, 0.2, 1) !important;
            max-width: var(--sn-wrapper-max-width) !important;
            min-width: var(--sn-wrapper-min-width) !important;
            border: none !important;
            outline: none !important;
            position: absolute !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            display: flex !important;
            flex-direction: column !important;
            line-height: 1 !important;
          }

          /* Center-aligned toasters need transform on wrapper */
          .sn-toaster[style*="left: 50%"] .sn-toast-wrapper {
            transform: translateX(-50%) !important;
          }

          .sn-toast-wrapper::before,
          .sn-toast-wrapper::after {
            display: none !important;
            content: none !important;
          }

          .sn-toast {
            display: flex !important;
            align-items: flex-start !important;
            gap: var(--sn-toast-gap) !important;
            width: 100% !important;
            padding: var(--sn-toast-padding) !important;
            border-radius: var(--sn-toast-border-radius) !important;
            background-color: var(--sn-toast-bg-color) !important;
            color: var(--sn-toast-text-color) !important;
            font-size: var(--sn-toast-font-size) !important;
            line-height: var(--sn-toast-line-height) !important;
            box-shadow: var(--sn-toast-box-shadow) !important;
            margin: 0 !important;
            border: 1px solid hsl(var(--border)) !important;
            outline: none !important;
          }

          .sn-toast::before,
          .sn-toast::after {
            display: none !important;
            content: none !important;
          }

          /* Toast type variants */
          .sn-type-success {
            --sn-progress-bar-color: var(--sn-color-success);
            --sn-icon-fill: var(--sn-color-success);
          }

          .sn-type-success .sn-toast {
            border-color: var(--sn-color-success) !important;
          }

          .sn-type-success .sn-toast > div:first-child {
            color: var(--sn-color-success) !important;
          }

          .sn-type-error {
            --sn-progress-bar-color: var(--sn-color-error);
            --sn-icon-fill: var(--sn-color-error);
          }

          .sn-type-error .sn-toast {
            border-color: var(--sn-color-error) !important;
          }

          .sn-type-error .sn-toast > div:first-child {
            color: var(--sn-color-error) !important;
          }

          .sn-type-warning {
            --sn-progress-bar-color: var(--sn-color-warning);
            --sn-icon-fill: var(--sn-color-warning);
          }

          .sn-type-warning .sn-toast {
            border-color: var(--sn-color-warning) !important;
          }

          .sn-type-warning .sn-toast > div:first-child {
            color: var(--sn-color-warning) !important;
          }

          .sn-type-info {
            --sn-progress-bar-color: var(--sn-color-info);
            --sn-icon-fill: var(--sn-color-info);
          }

          .sn-type-info .sn-toast {
            border-color: var(--sn-color-info) !important;
          }

          .sn-type-info .sn-toast > div:first-child {
            color: var(--sn-color-info) !important;
          }

          /* Dismiss button */
          .sn-dismiss-button {
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            width: var(--sn-dismiss-btn-size);
            height: var(--sn-dismiss-btn-size);
            border-radius: var(--sn-dismiss-btn-border-radius);
            opacity: 0.7;
            transition: var(--sn-dismiss-btn-transition);
            cursor: pointer;
            background: transparent;
            border: none;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--sn-dismiss-btn-color);
            margin: var(--sn-dismiss-btn-margin);
          }

          .sn-dismiss-button:hover {
            opacity: 1;
          }

          .sn-dismiss-button:focus {
            outline: none;
            opacity: 1;
          }

          /* Hide any default content in dismiss button including SVG */
          .sn-dismiss-button > *,
          .sn-dismiss-button svg {
            display: none !important;
          }

          .sn-dismiss-button::before {
            content: "×";
            font-size: 1.25rem;
            line-height: 1;
          }



          /* Progress bar */
          .sn-progress-bar {
            position: absolute !important;
            bottom: 0 !important;
            left: 0 !important;
            height: var(--sn-progress-bar-height) !important;
            background-color: var(--sn-progress-bar-color) !important;
            border-radius: 0 0 var(--sn-toast-border-radius) var(--sn-toast-border-radius) !important;
            transition: width 0.1s linear !important;
            z-index: 1 !important;
          }

          /* Animations */
          @keyframes SNSlideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          @keyframes SNSlideOutRight {
            from {
              transform: translateX(0);
              opacity: 1;
            }
            to {
              transform: translateX(100%);
              opacity: 0;
            }
          }

          @keyframes SNSlideInLeft {
            from {
              transform: translateX(-100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          @keyframes SNSlideOutLeft {
            from {
              transform: translateX(0);
              opacity: 1;
            }
            to {
              transform: translateX(-100%);
              opacity: 0;
            }
          }

          @keyframes SNSlideInTop {
            from {
              transform: translateY(-100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }

          @keyframes SNSlideOutTop {
            from {
              transform: translateY(0);
              opacity: 1;
            }
            to {
              transform: translateY(-100%);
              opacity: 0;
            }
          }

          @keyframes SNSlideInBottom {
            from {
              transform: translateY(100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }

          @keyframes SNSlideOutBottom {
            from {
              transform: translateY(0);
              opacity: 1;
            }
            to {
              transform: translateY(100%);
              opacity: 0;
            }
          }

          .sn-state-right-top-entering,
          .sn-state-right-bottom-entering {
            animation: SNSlideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }

          .sn-state-right-top-exiting,
          .sn-state-right-bottom-exiting {
            animation: SNSlideOutRight 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }

          .sn-state-left-top-entering,
          .sn-state-left-bottom-entering {
            animation: SNSlideInLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }

          .sn-state-left-top-exiting,
          .sn-state-left-bottom-exiting {
            animation: SNSlideOutLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }

          .sn-state-center-top-entering {
            animation: SNSlideInTop 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }

          .sn-state-center-top-exiting {
            animation: SNSlideOutTop 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }

          .sn-state-center-bottom-entering {
            animation: SNSlideInBottom 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }

          .sn-state-center-bottom-exiting {
            animation: SNSlideOutBottom 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }
        `}
			</style>
			<Portal mount={document.body}>
				<SolidToaster
					toasterId={local.toasterId}
					positionY={local.position}
					positionX={local.align}
					toasterStyle={{
						[local.position]: "16px",
						...(local.align === "left" && { left: "16px" }),
						...(local.align === "right" && { right: "16px" }),
						...(local.align === "center" && {
							left: "50%",
							right: "auto",
						}),
					}}
					wrapperClass={cn("sn-toast-wrapper", local.class)}
					class="sn-toast"
					icon={(args: { type: string; theme?: string | null }) => {
						const iconClass =
							TOAST_ICONS[args.type as keyof typeof TOAST_ICONS] || TOAST_ICONS.default;
						return (
							<div
								class={cn(
									"shrink-0 flex items-center justify-center self-start",
									args.type === "loading" && "animate-spin",
									iconClass
								)}
								style={{
									width: "var(--sn-icon-size)",
									height: "var(--sn-icon-size)",
									margin: "var(--sn-icon-margin)",
									color: "var(--sn-icon-fill)",
									"margin-top": "2px",
								}}
							/>
						);
					}}
					progressBarClass="sn-progress-bar"
					dismissButtonClass="sn-dismiss-button"
					{...others}
				/>
			</Portal>
		</>
	);
};

/**
 * ToastContainer - Combined ToastProvider + Toaster component
 * Wrap your entire app with this component to enable toast notifications
 *
 * @example
 * <ToastContainer>
 *   <App />
 * </ToastContainer>
 */
export const ToastContainer: Component<{
	children?: JSX.Element;
	position?: "top" | "bottom";
	align?: "left" | "center" | "right";
}> = (props) => {
	const [local, _others] = splitProps(props, ["children", "position", "align"]);

	return (
		<SolidToastProvider>
			{local.children}
			<Toaster position={local.position} align={local.align} toasterId="default" />
		</SolidToastProvider>
	);
};

/**
 * Re-export ToastProvider for advanced usage
 */
export { SolidToastProvider as ToastProvider };

/**
 * useToast - Hook to access toast notification functions
 * Returns { notify, update, dismiss, remove, promise, getQueue, clearQueue }
 */
export { useToast };

/**
 * showToast - Global function to show toast notifications
 * Can be called from anywhere without hooks
 */
export { showToast };

/**
 * Helper function to show different toast types
 */
export const toast = {
	success: (message: string, options?: ToastOptions) =>
		showToast(message, { type: "success", toasterId: "default", ...options }),
	error: (message: string, options?: ToastOptions) =>
		showToast(message, { type: "error", toasterId: "default", ...options }),
	warning: (message: string, options?: ToastOptions) =>
		showToast(message, { type: "warning", toasterId: "default", ...options }),
	info: (message: string, options?: ToastOptions) =>
		showToast(message, { type: "info", toasterId: "default", ...options }),
	loading: (message: string, options?: ToastOptions) =>
		showToast(message, {
			type: "loading",
			duration: false,
			toasterId: "default",
			...options,
		}),
	promise: async <T,>(
		promise: Promise<T>,
		messages: {
			pending: string;
			success: string | ((data: T) => string);
			error: string | ((error: unknown) => string);
		},
		options?: ToastOptions
	) => {
		const { promiseToast } = await import("solid-notifications");
		return promiseToast(promise, messages, {
			toasterId: "default",
			...options,
		});
	},
};

export default Toaster;

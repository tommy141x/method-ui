/**
 * Toaster Component - Toast notification system using Ark UI
 *
 * EASY SETUP (Recommended):
 *
 * 1. Add the Toast component to your app root (uses default singleton):
 *
 *    import { Toast, toaster } from "./components/toast";
 *
 *    export default function App() {
 *      return (
 *        <>
 *          <Toast />
 *          // Your app content
 *        </>
 *      );
 *    }
 *
 * 2. Use the default toaster anywhere in your app:
 *
 *    import { toaster } from "./components/toast";
 *
 *    toaster.success({ title: "Success!", description: "Done!" });
 *    toaster.error({ title: "Error", description: "Something went wrong" });
 *
 * CUSTOM CONFIGURATION:
 *
 * Option A - Configure via props:
 *
 *    <Toast config={{ placement: "top", gap: 24 }} />
 *
 * Option B - Configure before use (in app.tsx):
 *
 *    import { configureToaster } from "./components/toast";
 *
 *    configureToaster("default", {
 *      placement: "top-end",
 *      overlap: false,
 *      gap: 24,
 *    });
 *
 * MULTIPLE TOASTERS:
 *
 * You can have multiple named toasters for different positions:
 *
 *    // In app.tsx
 *    <Toast name="main" config={{ placement: "bottom-end" }} />
 *    <Toast name="alerts" config={{ placement: "top" }} />
 *
 *    // In your components
 *    import { getToaster } from "./components/toast";
 *
 *    const mainToaster = getToaster("main");
 *    const alertToaster = getToaster("alerts");
 *
 *    mainToaster.success({ title: "Saved!" });
 *    alertToaster.error({ title: "Error!" });
 *
 * FEATURES:
 * - Default singleton toaster (no setup needed)
 * - Multiple named toasters support
 * - All toast types (success, error, warning, info, loading)
 * - Promise-based toasts for async operations
 * - Action buttons and custom durations
 * - Stacking animations and pause on hover
 * - Dark mode support
 */

import type { CreateToasterProps, CreateToasterReturn } from "@ark-ui/solid/toast";
import {
	Toast as ArkToast,
	Toaster as ArkToaster,
	createToaster as arkCreateToaster,
} from "@ark-ui/solid/toast";
import type { Component } from "solid-js";
import { Show, splitProps } from "solid-js";
import { Portal } from "solid-js/web";
import IconCircleCheck from "~icons/lucide/circle-check";
import IconCircleX from "~icons/lucide/circle-x";
import IconInfo from "~icons/lucide/info";
import IconLoaderCircle from "~icons/lucide/loader-circle";
import IconTriangleAlert from "~icons/lucide/triangle-alert";
import IconX from "~icons/lucide/x";
import { cn } from "../lib/cn";
import type { ComponentMeta } from "../lib/meta";

// Re-export createToaster from Ark UI with proper types
export const createToaster = (props: CreateToasterProps) => {
	return arkCreateToaster(props);
};

export type ToasterInstance = CreateToasterReturn;

// ============================================================================
// Toaster Registry - Allows named toasters to be configured and accessed
// ============================================================================

const toasterRegistry = new Map<string, CreateToasterReturn>();

/**
 * Get or create a named toaster instance
 * @param name - Name of the toaster (default: "default")
 * @param config - Configuration for the toaster (only used on first call)
 */
export function getToaster(
	name: string = "default",
	config?: CreateToasterProps
): CreateToasterReturn {
	if (!toasterRegistry.has(name)) {
		const defaultConfig: CreateToasterProps = {
			placement: "bottom-end",
			overlap: true,
			gap: 16,
		};
		const instance = arkCreateToaster({ ...defaultConfig, ...config });
		toasterRegistry.set(name, instance);
	}
	const toaster = toasterRegistry.get(name);
	if (!toaster) throw new Error(`Toaster "${name}" could not be created`);
	return toaster;
}

/**
 * Configure a named toaster before it's created
 * Call this in your app.tsx before rendering the Toast component
 * @param name - Name of the toaster
 * @param config - Configuration for the toaster
 */
export function configureToaster(name: string, config: CreateToasterProps): void {
	if (toasterRegistry.has(name)) {
		console.warn(`Toaster "${name}" is already created. Configuration will be ignored.`);
		return;
	}
	toasterRegistry.set(name, arkCreateToaster(config));
}

// Default toaster instance - singleton that can be imported anywhere
export const toaster = getToaster("default");

// Toast component props
export interface ToastProps {
	/**
	 * Name of the toaster instance to use (default: "default")
	 * The component will get or create a toaster with this name
	 */
	name?: string;
	/**
	 * Optional toaster instance (overrides name if provided)
	 * Use this if you want to manually create and pass a toaster
	 */
	toaster?: CreateToasterReturn;
	/**
	 * Configuration for the toaster (only used if toaster doesn't exist yet)
	 */
	config?: CreateToasterProps;
	/**
	 * Additional CSS classes
	 */
	class?: string;
	/**
	 * The document's text/writing direction
	 */
	dir?: "ltr" | "rtl";
	/**
	 * A root node to correctly resolve document in custom environments (e.g., iframes, Electron)
	 */
	getRootNode?: () => Node | ShadowRoot | Document;
}

// Toast type icons
const ToastIcon: Component<{ type?: string }> = (props) => {
	return (
		<Show when={props.type}>
			<div class="shrink-0 mt-0.5">
				<Show when={props.type === "success"}>
					<IconCircleCheck class="h-5 w-5 text-green-600 dark:text-green-400" />
				</Show>
				<Show when={props.type === "error"}>
					<IconCircleX class="h-5 w-5 text-destructive" />
				</Show>
				<Show when={props.type === "warning"}>
					<IconTriangleAlert class="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
				</Show>
				<Show when={props.type === "info"}>
					<IconInfo class="h-5 w-5 text-primary" />
				</Show>
				<Show when={props.type === "loading"}>
					<IconLoaderCircle class="h-5 w-5 animate-spin text-primary" />
				</Show>
			</div>
		</Show>
	);
};

// Main Toast component
export const Toast: Component<ToastProps> = (props) => {
	const [local, others] = splitProps(props, ["toaster", "name", "config", "class"]);

	// Get toaster instance: use provided toaster, or get/create named toaster
	const toasterInstance = local.toaster || getToaster(local.name || "default", local.config);

	if (!toasterInstance) return null;

	return (
		<>
			<style>
				{`
          /* Toast group positioning */
          [data-scope="toast"][data-part="group"] {
            position: fixed;
            z-index: 9999;
            pointer-events: none;
          }

          /* Toast animations and positioning */
          [data-scope="toast"][data-part="root"] {
            pointer-events: auto;
            position: relative;
            width: 356px;
            max-width: calc(100vw - 32px);
            translate: var(--x) var(--y);
            scale: var(--scale);
            z-index: var(--z-index);
            height: var(--height);
            opacity: var(--opacity);
            will-change: translate, opacity, scale;
            transition:
              translate 400ms,
              scale 400ms,
              opacity 400ms,
              height 400ms;
            transition-timing-function: cubic-bezier(0.21, 1.02, 0.73, 1);
          }

          [data-scope="toast"][data-part="root"][data-state="closed"] {
            transition:
              translate 400ms,
              scale 400ms,
              opacity 200ms;
            transition-timing-function: cubic-bezier(0.06, 0.71, 0.55, 1);
          }

          /* Mobile responsive */
          @media (max-width: 640px) {
            [data-scope="toast"][data-part="group"] {
              width: 100%;
              left: 0 !important;
              right: 0 !important;
            }

            [data-scope="toast"][data-part="root"] {
              width: calc(100% - var(--gap) * 2);
              margin: 0 auto;
            }
          }
        `}
			</style>
			<Portal>
				<ArkToaster toaster={toasterInstance} {...others}>
					{(toast) => (
						<ArkToast.Root
							class={cn(
								"group relative flex w-full items-start gap-3 border border-border bg-background p-4 shadow-lg",
								"data-[type=success]:border-green-600/50 dark:data-[type=success]:border-green-400/50",
								"data-[type=error]:border-destructive/50",
								"data-[type=warning]:border-yellow-600/50 dark:data-[type=warning]:border-yellow-400/50",
								"data-[type=info]:border-primary/50",
								"data-[type=loading]:border-primary/50",
								local.class
							)}
							style={{
								"border-radius": "var(--radius)",
							}}
						>
							<ToastIcon type={toast().type} />

							<div class="flex-1 space-y-1">
								<ArkToast.Title class="text-sm font-semibold text-foreground">
									{toast().title}
								</ArkToast.Title>
								<Show when={toast().description}>
									<ArkToast.Description class="text-sm text-muted-foreground">
										{toast().description}
									</ArkToast.Description>
								</Show>

								<Show when={toast().action}>
									<div class="flex gap-2 mt-3">
										<ArkToast.ActionTrigger class="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
											{toast().action?.label}
										</ArkToast.ActionTrigger>
									</div>
								</Show>
							</div>

							<Show when={toast().type !== "loading"}>
								<ArkToast.CloseTrigger class="absolute right-2 top-2 rounded-sm p-1 opacity-0 transition-opacity group-hover:opacity-70 hover:opacity-100">
									<IconX class="h-4 w-4" />
								</ArkToast.CloseTrigger>
							</Show>
						</ArkToast.Root>
					)}
				</ArkToaster>
			</Portal>
		</>
	);
};

// Import components for examples
import { Button } from "./button";

export const meta: ComponentMeta<ToastProps> = {
	name: "Toast",
	description:
		"A toast notification system built on Ark UI. Features stacking, gestures, promise handling, and full customization.",
	examples: [
		{
			title: "Setup",
			description: "Create toaster instances for different positions",
			code: () => {
				const toasterBottomRight = createToaster({
					placement: "bottom-end",
					overlap: true,
					gap: 16,
				});

				const toasterTopCenter = createToaster({
					placement: "top",
					overlap: false,
					gap: 8,
				});

				return (
					<div class="space-y-4">
						<div class="p-4 rounded-lg border border-border bg-muted/50">
							<p class="text-sm text-muted-foreground mb-4">
								Toast instances are created once at the app level and can be used anywhere in your
								application. Add the Toast component to your app root to render notifications.
							</p>
							<div class="flex flex-wrap gap-2">
								<Button
									onClick={() =>
										toasterBottomRight.create({
											title: "Bottom Right",
											description: "This appears in the bottom right corner",
											type: "info",
										})
									}
								>
									Bottom Right Toast
								</Button>
								<Button
									onClick={() =>
										toasterTopCenter.create({
											title: "Top Center",
											description: "This appears at the top center",
											type: "info",
										})
									}
								>
									Top Center Toast
								</Button>
							</div>
						</div>
						<Toast toaster={toasterBottomRight} />
						<Toast toaster={toasterTopCenter} />
					</div>
				);
			},
		},
		{
			title: "Toast Types",
			description:
				"Different toast types with appropriate icons and colors. Use type-specific methods or the generic create method.",
			code: () => {
				const toaster = createToaster({
					placement: "bottom-end",
					overlap: true,
					gap: 16,
				});

				return (
					<div class="space-y-4">
						<div class="flex flex-wrap gap-2">
							<Button
								onClick={() =>
									toaster.success({
										title: "Success!",
										description: "Your changes have been saved.",
									})
								}
							>
								Success
							</Button>
							<Button
								onClick={() =>
									toaster.error({
										title: "Error",
										description: "Something went wrong. Please try again.",
									})
								}
							>
								Error
							</Button>
							<Button
								onClick={() =>
									toaster.warning({
										title: "Warning",
										description: "This action cannot be undone.",
									})
								}
							>
								Warning
							</Button>
							<Button
								onClick={() =>
									toaster.info({
										title: "Info",
										description: "This is an informational message.",
									})
								}
							>
								Info
							</Button>
							<Button
								onClick={() =>
									toaster.loading({
										title: "Loading...",
										description: "Please wait while we process your request.",
									})
								}
							>
								Loading
							</Button>
						</div>
						<Toast toaster={toaster} />
					</div>
				);
			},
		},
		{
			title: "With Actions",
			description: "Toasts can include action buttons for user interaction",
			code: () => {
				const toaster = createToaster({
					placement: "bottom-end",
					overlap: true,
					gap: 16,
				});

				return (
					<div class="space-y-4">
						<Button
							onClick={() =>
								toaster.create({
									title: "Update Available",
									description: "A new version of the app is ready to install.",
									type: "info",
									action: {
										label: "Update Now",
										onClick: () => console.log("Updating..."),
									},
								})
							}
						>
							Show Action Toast
						</Button>
						<Toast toaster={toaster} />
					</div>
				);
			},
		},
		{
			title: "Custom Duration",
			description: "Control how long toasts are displayed",
			code: () => {
				const toaster = createToaster({
					placement: "bottom-end",
					overlap: true,
					gap: 16,
				});

				return (
					<div class="space-y-4">
						<div class="flex flex-wrap gap-2">
							<Button
								onClick={() =>
									toaster.create({
										title: "Quick Toast",
										description: "This will disappear in 2 seconds",
										type: "info",
										duration: 2000,
									})
								}
							>
								2 Second Toast
							</Button>
							<Button
								onClick={() =>
									toaster.create({
										title: "Long Toast",
										description: "This will stay for 10 seconds",
										type: "info",
										duration: 10000,
									})
								}
							>
								10 Second Toast
							</Button>
							<Button
								onClick={() =>
									toaster.create({
										title: "Persistent Toast",
										description: "This won't auto-dismiss",
										type: "warning",
										duration: Infinity,
									})
								}
							>
								Persistent Toast
							</Button>
						</div>
						<Toast toaster={toaster} />
					</div>
				);
			},
		},
		{
			title: "Promise Toasts",
			description: "Show loading, success, and error states for async operations",
			code: () => {
				const toaster = createToaster({
					placement: "bottom-end",
					overlap: true,
					gap: 16,
				});

				const simulateAsync = () =>
					new Promise((resolve, reject) => {
						setTimeout(() => {
							Math.random() > 0.5 ? resolve("Success!") : reject("Failed!");
						}, 2000);
					});

				return (
					<div class="space-y-4">
						<Button
							onClick={() => {
								toaster.promise(simulateAsync(), {
									loading: {
										title: "Processing...",
										description: "Please wait",
									},
									success: {
										title: "Success!",
										description: "Operation completed successfully",
									},
									error: {
										title: "Error",
										description: "Operation failed",
									},
								});
							}}
						>
							Promise Toast
						</Button>
						<Toast toaster={toaster} />
					</div>
				);
			},
		},
		{
			title: "Programmatic Control",
			description: "Dismiss toasts programmatically using the returned ID",
			code: () => {
				const toaster = createToaster({
					placement: "bottom-end",
					overlap: true,
					gap: 16,
				});

				let toastId: string | undefined;

				return (
					<div class="space-y-4">
						<div class="flex flex-wrap gap-2">
							<Button
								onClick={() => {
									toastId = toaster.create({
										title: "Dismissible Toast",
										description: "Click the dismiss button to close this",
										type: "info",
										duration: Infinity,
									});
								}}
							>
								Create Toast
							</Button>
							<Button
								onClick={() => {
									if (toastId) {
										toaster.dismiss(toastId);
										toastId = undefined;
									}
								}}
							>
								Dismiss Toast
							</Button>
							<Button
								onClick={() => {
									toaster.dismiss();
								}}
							>
								Dismiss All
							</Button>
						</div>
						<Toast toaster={toaster} />
					</div>
				);
			},
		},
		{
			title: "Multiple Toasts",
			description: "Stack multiple toasts with overlap and gap settings",
			code: () => {
				const toaster = createToaster({
					placement: "bottom-end",
					overlap: true,
					gap: 16,
					max: 5,
				});

				return (
					<div class="space-y-4">
						<Button
							onClick={() => {
								const types = ["success", "error", "warning", "info"] as const;
								const randomType = types[Math.floor(Math.random() * types.length)];
								toaster.create({
									title: `Toast ${Date.now()}`,
									description: `This is a ${randomType} toast`,
									type: randomType,
								});
							}}
						>
							Add Random Toast
						</Button>
						<Toast toaster={toaster} />
					</div>
				);
			},
		},
	],
};

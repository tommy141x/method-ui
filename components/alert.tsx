import { cva, type VariantProps } from "class-variance-authority";
import type { Component, JSX } from "solid-js";
import { Show, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";
import IconAlertCircle from "~icons/lucide/alert-circle";
import IconAlertTriangle from "~icons/lucide/alert-triangle";
import IconCheckCircle from "~icons/lucide/check-circle";
import IconInfo from "~icons/lucide/info";
import IconTerminal from "~icons/lucide/terminal";
import { cn } from "../lib/cn";
import type { ComponentMeta } from "../lib/meta";

const alertVariants = cva("relative w-full rounded-lg border p-4", {
	variants: {
		variant: {
			default: "bg-card text-card-foreground border-border",
			destructive:
				"border-destructive/50 bg-destructive/10 text-destructive dark:border-destructive/50 dark:bg-destructive/10",
			success:
				"border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400 dark:border-green-500/50 dark:bg-green-500/10",
			warning:
				"border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 dark:border-yellow-500/50 dark:bg-yellow-500/10",
			info: "border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-400 dark:border-blue-500/50 dark:bg-blue-500/10",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

// Icon component mapping for each variant
const variantIconComponents: Record<string, Component<{ class?: string }>> = {
	default: IconTerminal,
	destructive: IconAlertCircle,
	success: IconCheckCircle,
	warning: IconAlertTriangle,
	info: IconInfo,
};

export interface AlertProps {
	children?: JSX.Element;
	variant?: VariantProps<typeof alertVariants>["variant"];
	class?: string;
	// Icon prop: true for auto icon based on variant, false for no icon, JSX.Element for a custom icon
	icon?: boolean | JSX.Element;
}

export const Alert: Component<AlertProps> = (props) => {
	const [local, variantProps, others] = splitProps(
		props,
		["children", "class", "icon"],
		["variant"]
	);

	const renderIcon = () => {
		// If icon is explicitly false, don't render any icon
		if (local.icon === false) return null;

		// If icon is true, use the default icon component for the variant
		if (local.icon === true) {
			const variantKey = variantProps.variant || "default";
			const IconComp = variantIconComponents[variantKey];
			return <Dynamic component={IconComp} class="h-5 w-5 mt-0.5 shrink-0" />;
		}

		// If icon is a JSX element, render it directly
		if (local.icon) {
			return local.icon;
		}

		// Default: no icon
		return null;
	};

	return (
		<div
			role="alert"
			class={cn(alertVariants({ variant: variantProps.variant }), local.class)}
			{...others}
		>
			<div class="flex gap-3 items-start">
				<Show when={local.icon !== undefined}>{renderIcon()}</Show>
				<div class="flex-1">{local.children}</div>
			</div>
		</div>
	);
};

export interface AlertTitleProps {
	children?: JSX.Element;
	class?: string;
}

export const AlertTitle: Component<AlertTitleProps> = (props) => {
	const [local, others] = splitProps(props, ["children", "class"]);

	return (
		<h5 class={cn("font-semibold leading-tight tracking-tight", local.class)} {...others}>
			{local.children}
		</h5>
	);
};

export interface AlertDescriptionProps {
	children?: JSX.Element;
	class?: string;
}

export const AlertDescription: Component<AlertDescriptionProps> = (props) => {
	const [local, others] = splitProps(props, ["children", "class"]);

	return (
		<div class={cn("text-sm opacity-90 [&_p]:leading-relaxed", local.class)} {...others}>
			{local.children}
		</div>
	);
};

export const meta: ComponentMeta<AlertProps> = {
	name: "Alert",
	description:
		"An alert component for displaying important messages with automatic icon support, titles, and descriptions. Supports multiple variants for different message types.",
	apiReference: "",
	variants: alertVariants,
	examples: [
		{
			title: "Basic",
			description: "Simple alerts with title and description",
			code: () => (
				<div class="flex flex-col gap-4">
					<Alert>
						<AlertTitle>Heads up!</AlertTitle>
						<AlertDescription>You can add components to your app using the cli.</AlertDescription>
					</Alert>
					<Alert variant="info">
						<AlertTitle>Information</AlertTitle>
						<AlertDescription>A new version of the app is available.</AlertDescription>
					</Alert>
				</div>
			),
		},
		{
			title: "Variants",
			description: "Different alert variants for various message types",
			code: () => (
				<div class="flex flex-col gap-4">
					<Alert variant="destructive">
						<AlertTitle>Error</AlertTitle>
						<AlertDescription>Your session has expired. Please log in again.</AlertDescription>
					</Alert>
					<Alert variant="success">
						<AlertTitle>Success!</AlertTitle>
						<AlertDescription>Your changes have been saved successfully.</AlertDescription>
					</Alert>
					<Alert variant="warning">
						<AlertTitle>Warning</AlertTitle>
						<AlertDescription>
							Your storage is almost full. Consider upgrading your plan.
						</AlertDescription>
					</Alert>
				</div>
			),
		},
		{
			title: "With Auto Icons",
			description: "Alerts with automatic icons based on variant",
			code: () => (
				<div class="flex flex-col gap-4">
					<Alert icon={true}>
						<AlertTitle>Heads up!</AlertTitle>
						<AlertDescription>You can add components to your app using the cli.</AlertDescription>
					</Alert>
					<Alert variant="destructive" icon={true}>
						<AlertTitle>Error</AlertTitle>
						<AlertDescription>Your session has expired. Please log in again.</AlertDescription>
					</Alert>
					<Alert variant="success" icon={true}>
						<AlertTitle>Success!</AlertTitle>
						<AlertDescription>Your changes have been saved successfully.</AlertDescription>
					</Alert>
					<Alert variant="warning" icon={true}>
						<AlertTitle>Warning</AlertTitle>
						<AlertDescription>
							Your storage is almost full. Consider upgrading your plan.
						</AlertDescription>
					</Alert>
					<Alert variant="info" icon={true}>
						<AlertTitle>Information</AlertTitle>
						<AlertDescription>This is an informational message with an auto icon.</AlertDescription>
					</Alert>
				</div>
			),
		},
		{
			title: "With Custom Icons",
			description: "Alerts with custom icon names",
			code: () => (
				<div class="flex flex-col gap-4">
					<Alert icon="bell">
						<AlertTitle>You have 3 unread notifications</AlertTitle>
					</Alert>
					<Alert variant="success" icon="rocket">
						<AlertTitle>Deployment successful!</AlertTitle>
						<AlertDescription>Your app has been deployed to production.</AlertDescription>
					</Alert>
					<Alert variant="info" icon="sparkles">
						<AlertTitle>New features available</AlertTitle>
						<AlertDescription>Check out the latest updates in your dashboard.</AlertDescription>
					</Alert>
				</div>
			),
		},
		{
			title: "Without Icons",
			description: "Alerts with icons explicitly disabled",
			code: () => (
				<div class="flex flex-col gap-4">
					<Alert icon={false}>
						<AlertTitle>Simple Alert</AlertTitle>
						<AlertDescription>This alert has no icon for a cleaner look.</AlertDescription>
					</Alert>
					<Alert variant="success" icon={false}>
						<AlertTitle>Success</AlertTitle>
						<AlertDescription>Operation completed.</AlertDescription>
					</Alert>
				</div>
			),
		},
		{
			title: "Description Only",
			description: "Alert with just a description",
			code: () => (
				<div class="flex flex-col gap-4">
					<Alert icon={true} variant="info">
						<AlertDescription>Remember to save your work regularly.</AlertDescription>
					</Alert>
					<Alert icon="zap" variant="warning">
						<AlertDescription>Low battery - please connect to power.</AlertDescription>
					</Alert>
				</div>
			),
		},
	],
};

export default Alert;

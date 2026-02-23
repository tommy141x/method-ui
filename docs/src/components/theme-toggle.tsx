import { type Component, Show } from "solid-js";
import IconMoon from "~icons/lucide/moon";
import IconSun from "~icons/lucide/sun";
import { Button } from "./button";
import { useTheme } from "./theme";

export const ThemeToggle: Component = () => {
	const { theme, setTheme, currentTheme, mounted } = useTheme();

	const toggleTheme = () => {
		// Cycle through base (dark) -> light -> base
		if (theme() === "base") {
			setTheme("light");
		} else if (theme() === "light") {
			setTheme("base");
		} else {
			// If on a custom theme, go back to base
			setTheme("base");
		}
	};

	const isBaseTheme = () => theme() === "base";
	const isLightTheme = () => theme() === "light";
	const isCustomTheme = () => !isBaseTheme() && !isLightTheme();

	return (
		<Button
			onClick={toggleTheme}
			variant="outline"
			size="icon"
			class="fixed top-4 right-4 z-50"
			aria-label="Toggle theme"
			title={currentTheme()?.name || theme()}
		>
			{/*
			 * Guard all theme-reactive Show branches behind mounted().
			 * During SSR and the initial hydration pass mounted() is false,
			 * so both server and client render the exact same static fallback
			 * (the moon icon). After onMount fires the correct icon is shown
			 * reactively — avoiding any SSR/hydration key mismatch.
			 */}
			<Show
				when={mounted()}
				fallback={<IconMoon class="w-4 h-4 transition-all duration-200" />}
			>
				{/* Moon icon for base theme (dark) */}
				<Show when={isBaseTheme()}>
					<IconMoon class="w-4 h-4 transition-all duration-200" />
				</Show>

				{/* Sun icon for light theme */}
				<Show when={isLightTheme()}>
					<IconSun class="w-4 h-4 transition-all duration-200" />
				</Show>

				{/* Primary color circle for custom themes */}
				<Show when={isCustomTheme()}>
					<div class="w-4 h-4 rounded-full bg-primary border-2 border-primary-foreground transition-all duration-200" />
				</Show>
			</Show>
		</Button>
	);
};

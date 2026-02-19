import { type Component, Show } from "solid-js";
import { Button } from "./button";
import { useTheme } from "./theme";

export const ThemeToggle: Component = () => {
	const { theme, setTheme, currentTheme } = useTheme();

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
			{/* Moon icon for base theme (dark) */}
			<Show when={isBaseTheme()}>
				<div class="i-lucide-moon w-4 h-4 transition-all duration-200" />
			</Show>

			{/* Sun icon for light theme */}
			<Show when={isLightTheme()}>
				<div class="i-lucide-sun w-4 h-4 transition-all duration-200" />
			</Show>

			{/* Primary color circle for custom themes */}
			<Show when={isCustomTheme()}>
				<div class="w-4 h-4 rounded-full bg-primary border-2 border-primary-foreground transition-all duration-200" />
			</Show>
		</Button>
	);
};

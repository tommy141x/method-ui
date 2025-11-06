import { Component } from "solid-js";
import { useTheme } from "../lib/theme-provider";
import { Button } from "./button";

export const ThemeToggle: Component = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      onClick={toggleTheme}
      variant="outline"
      size="icon"
      class="fixed top-4 right-4 z-50"
      aria-label="Toggle theme"
      title={`Switch to ${theme() === "light" ? "dark" : "light"} mode`}
    >
      <div
        class={`i-lucide-sun w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
          theme() === "light"
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 rotate-90 scale-0"
        }`}
      />
      <div
        class={`i-lucide-moon w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
          theme() === "dark"
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 -rotate-90 scale-0"
        }`}
      />
    </Button>
  );
};

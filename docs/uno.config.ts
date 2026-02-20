import transformerDirectives from "@unocss/transformer-directives";
import transformerVariantGroup from "@unocss/transformer-variant-group";
import {
	defineConfig,
	presetAttributify,
	presetTypography,
	presetUno,
	presetWebFonts,
} from "unocss";

export default defineConfig({
	presets: [
		presetUno(),
		presetAttributify(),
		presetTypography(),
		presetWebFonts({
			fonts: {
				sans: "Inter:400,500,600,700",
				mono: "JetBrains Mono:400,500,600,700",
				retro: "Press Start 2P:400,500,600,700",
			},
		}),
	],
	// NOTE: transformers removed - they can cause issues with the directive plugin
	transformers: [transformerDirectives(), transformerVariantGroup()],
	rules: [
		[
			"bg-background",
			{
				"background-color": "hsl(var(--background) / var(--background-opacity, 1))",
				"backdrop-filter": "var(--background-backdrop-filter, none)",
				"-webkit-backdrop-filter": "var(--background-backdrop-filter, none)",
			},
		],
		[
			"bg-card",
			{
				"background-color": "hsl(var(--card) / var(--card-opacity, 1))",
				"backdrop-filter": "var(--card-backdrop-filter, none)",
				"-webkit-backdrop-filter": "var(--card-backdrop-filter, none)",
			},
		],
		[
			"bg-popover",
			{
				"background-color": "hsl(var(--popover) / var(--popover-opacity, 1))",
				"backdrop-filter": "var(--popover-backdrop-filter, none)",
				"-webkit-backdrop-filter": "var(--popover-backdrop-filter, none)",
			},
		],
	],
	theme: {
		colors: {
			border: "hsl(var(--border))",
			input: "hsl(var(--input))",
			ring: "hsl(var(--ring))",
			background: "hsl(var(--background))",
			foreground: "hsl(var(--foreground))",
			primary: {
				DEFAULT: "hsl(var(--primary))",
				foreground: "hsl(var(--primary-foreground))",
			},
			secondary: {
				DEFAULT: "hsl(var(--secondary))",
				foreground: "hsl(var(--secondary-foreground))",
			},
			destructive: {
				DEFAULT: "hsl(var(--destructive))",
				foreground: "hsl(var(--destructive-foreground))",
			},
			muted: {
				DEFAULT: "hsl(var(--muted))",
				foreground: "hsl(var(--muted-foreground))",
			},
			accent: {
				DEFAULT: "hsl(var(--accent))",
				foreground: "hsl(var(--accent-foreground))",
			},
			popover: {
				DEFAULT: "hsl(var(--popover))",
				foreground: "hsl(var(--popover-foreground))",
			},
			card: {
				DEFAULT: "hsl(var(--card))",
				foreground: "hsl(var(--card-foreground))",
			},
		},
		borderRadius: {
			lg: "var(--radius)",
			md: "calc(var(--radius) - 2px)",
			sm: "calc(var(--radius) - 4px)",
		},
		fontFamily: {
			sans: ["var(--font-sans)", "Inter", "sans-serif"],
			mono: ["JetBrains Mono", "monospace"],
			retro: ["Press Start 2P", "monospace"],
		},
	},
	safelist: ["sr-only", "not-sr-only"],
});

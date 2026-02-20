import {
	defineConfig,
	presetAttributify,
	presetTypography,
	presetUno,
	presetWebFonts,
	transformerDirectives,
	transformerVariantGroup,
} from "unocss";

/*
Icon Usage:
Import icons as components using unplugin-icons:
  import IconCheck from '~icons/lucide/check'
  import IconUser from '~icons/lucide/user'

Use them directly in JSX:
  <IconCheck class="h-4 w-4" />
  <IconUser class="h-5 w-5 text-muted-foreground" />

Available collections: lucide, heroicons, tabler, ph (phosphor)
Find all icons at: https://icones.js.org/

Make sure unplugin-icons is configured in your vite.config:
  import Icons from 'unplugin-icons/vite'
  plugins: [Icons({ compiler: 'solid' })]
*/

export default defineConfig({
	presets: [
		presetUno(),
		presetAttributify(),
		presetTypography(),
		presetWebFonts({
			fonts: {
				sans: "Inter:400,500,600,700",
				mono: "JetBrains Mono:400,500,600,700",
				retro: "Press Start 2P",
			},
		}),
	],
	transformers: [transformerDirectives(), transformerVariantGroup()],
	rules: [
		[
			"bg-background",
			{
				"background-color": "hsl(var(--background) / var(--background-opacity, 1))",
				"backdrop-filter": "var(--backdrop-blur, none) var(--backdrop-saturate, none)",
				"-webkit-backdrop-filter": "var(--backdrop-blur, none) var(--backdrop-saturate, none)",
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
			display: ["Space Grotesk", "sans-serif"],
			retro: ["Press Start 2P", "monospace"],
			serif: ["Merriweather", "serif"],
		},
	},
	safelist: ["sr-only", "not-sr-only"],
});

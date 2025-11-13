import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";

/*
Icon Usage:
Use icons with the pattern: i-{collection}-{icon-name}

Examples:
- <div class="i-lucide-heart" />              // Heart icon
- <div class="i-lucide-user text-xl" />       // User icon with size
- <div class="i-lucide-sun dark:i-lucide-moon" /> // Theme toggle

Available collections: lucide, heroicons, tabler, ph (phosphor)
Find all icons at: https://icones.js.org/
*/

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      collections: {
        // This will be replaced with actual icon library configuration
        // Format: libraryName: () => import("@iconify-json/library/icons.json").then(i => i.default)
      },
      extraProperties: {
        display: "inline-block",
        "vertical-align": "middle",
      },
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        sans: "Inter:400,500,600,700",
        mono: "JetBrains Mono:400,500,600,700",
        display: "Space Grotesk:400,500,600,700",
        retro: "Press Start 2P", // Remove :400
        serif: "Merriweather:400,700",
      },
    }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
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

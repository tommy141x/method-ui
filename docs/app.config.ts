import { defineConfig } from "vite";
import { devtools } from "@tanstack/devtools-vite";
import viteTsConfigPaths from "vite-tsconfig-paths";
import TurboConsole from "unplugin-turbo-console/vite";
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";
import AutoImport from "unplugin-auto-import/vite";
import UnoCSS from "unocss/vite";

import {
  presetWind4,
  presetAttributify,
  presetTypography,
  presetWebFonts,
} from "unocss";

import transformerDirectives from "@unocss/transformer-directives";
import transformerVariantGroup from "@unocss/transformer-variant-group";

import { tanstackStart } from "@tanstack/solid-start/plugin/vite";
import solidPlugin from "vite-plugin-solid";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  optimizeDeps: {
    noDiscovery: true,
  },
  environments: {
    ssr: {
      optimizeDeps: {
        noDiscovery: true,
      },
    },
  },

  plugins: [
    // 1. Environment setup — must be first so the SSR environment is ready for everything else
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    // 2. Path resolution — must be early so all subsequent plugins resolve aliases correctly
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    // 3. Code preprocessing — auto-imports and icon handling before framework transforms
    AutoImport({
      imports: ["solid-js"],
      resolvers: [
        IconsResolver({
          prefix: "Icon",
          extension: "jsx",
        }),
      ],
    }),
    Icons({
      autoInstall: true,
      compiler: "solid",
    }),
    TurboConsole(),
    // 4. UnoCSS — utility-first styles with design tokens
    UnoCSS({
      minify: true,
      presets: [
        presetWind4(),
        presetAttributify(),
        presetTypography(),
        presetWebFonts({
          fonts: {
            sans: "Inter:400,500,600,700,800,900",
            mono: "JetBrains Mono:400,500,600,700",
            retro: "Press Start 2P:400,500,600,700",
          },
        }),
      ],
      transformers: [transformerDirectives(), transformerVariantGroup()],
      rules: [],
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
    } as any),
    // 5. Framework core — tanstackStart sets up SSR routing before solidPlugin compiles JSX
    tanstackStart(),
    solidPlugin({ ssr: true }),
    // 6. Dev tooling — run last
    devtools(),
  ],
  ssr: {
    noExternal: ["@unocss/reset"],
  },
});

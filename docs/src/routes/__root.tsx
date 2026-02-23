import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/solid-router";
import { Suspense } from "solid-js";
import { HydrationScript } from "solid-js/web";
import { GlassFilter } from "../components/glass-filter";
import { type ThemeDefinition, ThemeProvider } from "../components/theme";

import "@/global.css";
import "virtual:uno.css";

const themes: ThemeDefinition[] = [
	{
		id: "base",
		name: "Dark",
		description: "Dark mode - the default base theme",
	},
	{
		id: "light",
		name: "Light",
		description: "Light mode",
		cssVars: {
			background: "0 0% 100%",
			foreground: "222.2 84% 4.9%",
			card: "0 0% 100%",
			"card-foreground": "222.2 84% 4.9%",
			popover: "0 0% 100%",
			"popover-foreground": "222.2 84% 4.9%",
			primary: "222.2 47.4% 11.2%",
			"primary-foreground": "210 40% 98%",
			secondary: "210 40% 96.1%",
			"secondary-foreground": "222.2 47.4% 11.2%",
			muted: "210 40% 96.1%",
			"muted-foreground": "215.4 16.3% 46.9%",
			accent: "210 40% 96.1%",
			"accent-foreground": "222.2 47.4% 11.2%",
			destructive: "0 84.2% 60.2%",
			"destructive-foreground": "210 40% 98%",
			border: "214.3 31.8% 91.4%",
			input: "214.3 31.8% 91.4%",
			ring: "222.2 84% 4.9%",
		},
	},
	{
		id: "glass",
		name: "Glass",
		description: "Liquid Glass",
		extends: "base",
	},
	{
		id: "orange",
		name: "Orange",
		description: "Energetic, warm orange",
		extends: "base",
		cssVars: {
			primary: "20.5 90.2% 48.2%",
			"primary-foreground": "210 40% 98%",
			destructive: "20 100% 39%",
			ring: "20.5 90.2% 48.2%",
		},
	},
	{
		id: "retro",
		name: "Retro",
		description: "Nostalgic retro vibes",
		extends: "base",
		font: '"Press Start 2P", monospace',
		fontSize: "83.5%",
		cssVars: {
			radius: "none",
		},
	},
	{
		id: "retro-light",
		name: "Retro (Light)",
		description: "Retro theme on light background",
		extends: "light",
		font: '"Press Start 2P", monospace',
		fontSize: "83.5%",
		cssVars: {
			radius: "none",
		},
	},
];

export const Route = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "Method UI — Component Library for SolidJS" },
			{
				name: "description",
				content:
					"A comprehensive, accessible, and customizable component library for SolidJS. Built on Ark UI with full TypeScript support.",
			},
			{ name: "author", content: "TG Studios" },
			{ name: "theme-color", content: "#0a0a0a" },
			{ name: "color-scheme", content: "dark light" },
			{ name: "generator", content: "TanStack Start" },
			{
				name: "keywords",
				content:
					"Method UI, SolidJS, component library, Ark UI, TypeScript, accessible components, UI kit",
			},
			{ property: "og:site_name", content: "Method UI" },
			{ property: "og:locale", content: "en_US" },
			{ property: "og:type", content: "website" },
			{
				property: "og:title",
				content: "Method UI — Component Library for SolidJS",
			},
			{
				property: "og:description",
				content:
					"A comprehensive, accessible, and customizable component library for SolidJS. Built on Ark UI with full TypeScript support.",
			},
			{ name: "twitter:card", content: "summary_large_image" },
			{
				name: "twitter:title",
				content: "Method UI — Component Library for SolidJS",
			},
			{
				name: "twitter:description",
				content:
					"A comprehensive, accessible, and customizable component library for SolidJS. Built on Ark UI with full TypeScript support.",
			},
		],
		links: [
			{ rel: "icon", href: "/favicon.ico", sizes: "any" },
			{ rel: "icon", href: "/favicon.png", type: "image/png" },
			{ rel: "apple-touch-icon", href: "/favicon.png" },
			{
				rel: "preconnect",
				href: "https://fonts.bunny.net",
				crossOrigin: "anonymous",
			},
		],
	}),
	shellComponent: RootComponent,
});

function RootComponent() {
	return (
		<html lang="en">
			<head>
				<HydrationScript />
				<HeadContent />
				<script
					innerHTML={`
            (function() {
              try {
                var theme = localStorage.getItem('theme');
                var validThemes = ['base', 'light', 'glass', 'orange', 'retro', 'retro-light'];
                if (!theme || validThemes.indexOf(theme) === -1) {
                  theme = 'base';
                }
                if (theme !== 'base') {
                  document.documentElement.classList.add(theme);
                }
              } catch (e) {}
            })();
          `}
				/>
			</head>
			<body>
				<ThemeProvider config={{ themes, defaultTheme: "base" }}>
					<GlassFilter />
					<Suspense>
						<Outlet />
					</Suspense>
				</ThemeProvider>
				<Scripts />
			</body>
		</html>
	);
}

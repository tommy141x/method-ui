import { Meta, Title } from "@solidjs/meta";
import { For, Show } from "solid-js";
import { Badge } from "../../components/badge";
import { Button } from "../../components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/card";
import { DocsLayout } from "../../components/docs-layout";
import { useTheme } from "../../components/theme";

export default function Theming() {
	const { theme, setTheme, themes, currentTheme } = useTheme();

	return (
		<DocsLayout>
			<Title>Theming - Method UI</Title>
			<Meta
				name="description"
				content="Learn how to customize and theme your Method UI application with CSS variables and the Theme component."
			/>

			<div class="max-w-4xl">
				{/* Header */}
				<div class="mb-12">
					<Badge variant="secondary" class="mb-4">
						Customization
					</Badge>
					<h1 class="text-4xl md:text-5xl font-bold mb-4">Theming</h1>
					<p class="text-xl text-muted-foreground">
						A flexible theme system that treats all themes equally. Create light, dark, or custom
						color themes with ease.
					</p>
				</div>

				{/* Overview */}
				<Card class="mb-8">
					<CardHeader>
						<CardTitle>Overview</CardTitle>
						<CardDescription>
							The Method UI theme system uses CSS variables and a simple provider pattern to enable
							powerful theming capabilities.
						</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="grid gap-4">
							<div class="flex gap-3">
								<div class="i-lucide-palette size-5 text-primary flex-shrink-0 mt-0.5" />
								<div>
									<h3 class="font-medium mb-1">No Special Treatment</h3>
									<p class="text-sm text-muted-foreground">
										All themes are equal. There's no hardcoded "light" or "dark" logic - just
										themes.
									</p>
								</div>
							</div>
							<div class="flex gap-3">
								<div class="i-lucide-box size-5 text-primary flex-shrink-0 mt-0.5" />
								<div>
									<h3 class="font-medium mb-1">The 'base' Theme</h3>
									<p class="text-sm text-muted-foreground">
										Use theme ID 'base' to reference :root styles without creating a CSS class.
										Perfect for your default theme.
									</p>
								</div>
							</div>
							<div class="flex gap-3">
								<div class="i-lucide-layers size-5 text-primary flex-shrink-0 mt-0.5" />
								<div>
									<h3 class="font-medium mb-1">CSS Variable Merging</h3>
									<p class="text-sm text-muted-foreground">
										Define only what you want to change. Unspecified variables automatically inherit
										from :root.
									</p>
								</div>
							</div>
							<div class="flex gap-3">
								<div class="i-lucide-code size-5 text-primary flex-shrink-0 mt-0.5" />
								<div>
									<h3 class="font-medium mb-1">Flexible Definition</h3>
									<p class="text-sm text-muted-foreground">
										Define themes in CSS files or inline in your code - whatever works best for your
										project.
									</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Quick Start */}
				<Card class="mb-8">
					<CardHeader>
						<CardTitle>Quick Start</CardTitle>
						<CardDescription>Get started with theming in 3 simple steps</CardDescription>
					</CardHeader>
					<CardContent class="space-y-6">
						<div>
							<div class="flex items-center gap-2 mb-3">
								<div class="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
									1
								</div>
								<h3 class="font-medium">Wrap your app with ThemeProvider</h3>
							</div>
							<div class="bg-muted p-4 rounded-lg font-mono text-xs overflow-x-auto">
								<pre class="whitespace-pre-wrap">
									{`import { ThemeProvider } from '@/components/theme';

const themes = [
  { id: 'base', name: 'Dark' },
  { id: 'light', name: 'Light' },
];

export default function App() {
  return (
    <ThemeProvider config={{ themes, defaultTheme: 'base' }}>
      <YourApp />
    </ThemeProvider>
  );
}`}
								</pre>
							</div>
						</div>

						<div>
							<div class="flex items-center gap-2 mb-3">
								<div class="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
									2
								</div>
								<h3 class="font-medium">Define your themes in CSS</h3>
							</div>
							<div class="bg-muted p-4 rounded-lg font-mono text-xs overflow-x-auto">
								<pre class="whitespace-pre-wrap">
									{`/* global.css */

/* :root defines the base theme (Dark) - all variables must be defined here */
:root {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  /* ... all other variables */
}

/* Note: No .base class needed - the ID 'base' uses :root automatically */

/* .light is a theme that overrides base */
.light {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  /* Only override what changes from :root */
}`}
								</pre>
							</div>
						</div>

						<div>
							<div class="flex items-center gap-2 mb-3">
								<div class="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
									3
								</div>
								<h3 class="font-medium">Use the useTheme hook</h3>
							</div>
							<div class="bg-muted p-4 rounded-lg font-mono text-xs overflow-x-auto">
								<pre class="whitespace-pre-wrap">
									{`import { useTheme } from '@/components/theme';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
   <button onClick={() => setTheme(theme() === 'base' ? 'light' : 'base')}>
     Toggle Theme
   </button>
 );
}`}
								</pre>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Live Demo */}
				<Card class="mb-8">
					<CardHeader>
						<CardTitle>Interactive Demo</CardTitle>
						<CardDescription>Try switching themes to see the changes in real-time</CardDescription>
					</CardHeader>
					<CardContent class="space-y-6">
						<div>
							<h3 class="text-sm font-medium mb-3">Current Theme</h3>
							<div class="p-4 bg-muted rounded-lg space-y-2">
								<div class="text-sm">
									Theme ID: <code class="font-mono bg-background px-2 py-1 rounded">{theme()}</code>
								</div>
								<div class="text-sm">
									Theme Name: <strong>{currentTheme()?.name || "Unknown"}</strong>
								</div>
								<Show when={currentTheme()?.description}>
									<div class="text-xs text-muted-foreground">{currentTheme()?.description}</div>
								</Show>
							</div>
						</div>

						<div>
							<h3 class="text-sm font-medium mb-3">Switch Theme</h3>
							<div class="flex flex-wrap gap-2">
								<For each={themes()}>
									{(t) => (
										<Button
											variant={theme() === t.id ? "default" : "outline"}
											onClick={() => setTheme(t.id)}
										>
											{t.name}
										</Button>
									)}
								</For>
							</div>
						</div>

						<div>
							<h3 class="text-sm font-medium mb-3">Color Preview</h3>
							<div class="grid grid-cols-2 md:grid-cols-3 gap-3">
								<div class="space-y-2">
									<div class="h-16 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
										Primary
									</div>
								</div>
								<div class="space-y-2">
									<div class="h-16 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center text-sm font-medium">
										Secondary
									</div>
								</div>
								<div class="space-y-2">
									<div class="h-16 rounded-lg bg-accent text-accent-foreground flex items-center justify-center text-sm font-medium">
										Accent
									</div>
								</div>
								<div class="space-y-2">
									<div class="h-16 rounded-lg bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
										Muted
									</div>
								</div>
								<div class="space-y-2">
									<div class="h-16 rounded-lg bg-destructive text-destructive-foreground flex items-center justify-center text-sm font-medium">
										Destructive
									</div>
								</div>
								<div class="space-y-2">
									<div class="h-16 rounded-lg border-2 border-border flex items-center justify-center text-sm font-medium">
										Border
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* CSS Variables */}
				<Card class="mb-8">
					<CardHeader>
						<CardTitle>Available CSS Variables</CardTitle>
						<CardDescription>
							All variables defined in :root that can be overridden in theme classes
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="grid grid-cols-2 md:grid-cols-3 gap-2">
							{[
								"--background",
								"--foreground",
								"--card",
								"--card-foreground",
								"--popover",
								"--popover-foreground",
								"--primary",
								"--primary-foreground",
								"--secondary",
								"--secondary-foreground",
								"--muted",
								"--muted-foreground",
								"--accent",
								"--accent-foreground",
								"--destructive",
								"--destructive-foreground",
								"--border",
								"--input",
								"--ring",
								"--radius",
							].map((variable) => (
								<div class="bg-muted px-3 py-2 rounded font-mono text-xs">{variable}</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Method 1: CSS */}
				<Card class="mb-8">
					<CardHeader>
						<CardTitle>Method 1: Define Themes in CSS</CardTitle>
						<CardDescription>
							Recommended for themes you want to use across your entire application
						</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<div>
							<h3 class="text-sm font-medium mb-3">Add theme classes to your global.css</h3>
							<div class="bg-muted p-4 rounded-lg font-mono text-xs overflow-x-auto">
								<pre class="whitespace-pre-wrap">
									{`/* global.css */

/* :root defines the base theme - dark mode by default */
/* ALL CSS variables MUST be defined here */
:root {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 47.4% 11.2%;
  /* ... all other variables */
}

/* Note: You can use theme ID 'base' without creating a .base class */
/* It will automatically use :root values */

/* Light theme - only override what changes */
.light {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --border: 214.3 31.8% 91.4%;
  /* Other vars inherit from :root */
}

/* Rose theme - only change accent color */
.rose {
  --primary: 346.8 77.2% 59.8%;
  --ring: 346.8 77.2% 59.8%;
  /* Everything else inherits from :root */
}

/* Orange theme with warm accent */
.orange {
  --primary: 20.5 90.2% 48.2%;
  --ring: 20.5 90.2% 48.2%;
  /* Other vars inherit from :root */
}`}
								</pre>
							</div>
						</div>

						<div>
							<h3 class="text-sm font-medium mb-3">Register themes in your ThemeProvider</h3>
							<div class="bg-muted p-4 rounded-lg font-mono text-xs overflow-x-auto">
								<pre class="whitespace-pre-wrap">
									{`import { ThemeProvider } from '@/components/theme';

const themes = [
  { id: 'base', name: 'Dark Mode' },
  { id: 'light', name: 'Light Mode' },
  { id: 'rose', name: 'Rose' },
  { id: 'orange', name: 'Orange' },
];

<ThemeProvider config={{ themes, defaultTheme: 'base' }}>
  <App />
</ThemeProvider>`}
								</pre>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Theme Inheritance */}
				<Card class="mb-8">
					<CardHeader>
						<CardTitle>Theme Inheritance</CardTitle>
						<CardDescription>
							Create theme variants by extending other themes - supports recursive inheritance
						</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<div>
							<h3 class="text-sm font-medium mb-3">Extend themes with the extends property</h3>
							<div class="bg-muted p-4 rounded-lg font-mono text-xs overflow-x-auto">
								<pre class="whitespace-pre-wrap">
									{`import { ThemeProvider } from '@/components/theme';

const themes = [
  {
    id: 'base',
    name: 'Dark Mode',
    // No CSS class needed - uses :root automatically
  },
  {
    id: 'light',
    name: 'Light Mode',
    // CSS class .light in global.css
  },
  {
    id: 'rose',
    name: 'Rose',
    cssVars: {
      primary: '346.8 77.2% 49.8%',
    }
  },
  {
    id: 'rose-dark',
    name: 'Rose Dark',
    extends: 'dark', // Inherits all vars from dark theme
    cssVars: {
      primary: '346.8 77.2% 59.8%', // Overrides just primary
    }
  },
  {
    id: 'slate-dark',
    name: 'Slate Dark',
    extends: 'dark',
    cssVars: {
      primary: '215.4 16.3% 56.9%',
      ring: '215.4 16.3% 56.9%',
    }
  },
];

<ThemeProvider config={{ themes, defaultTheme: 'base' }}>
  <App />
</ThemeProvider>`}
								</pre>
							</div>
						</div>

						<div>
							<h3 class="text-sm font-medium mb-3">How it works</h3>
							<div class="space-y-3 text-sm">
								<div class="flex gap-3">
									<div class="i-lucide-arrow-right size-5 text-primary flex-shrink-0 mt-0.5" />
									<div>
										<strong>CSS Classes:</strong> When using CSS-defined themes, all classes in the
										inheritance chain are applied unless the theme ID is 'base' which uses :root
										(e.g., <code class="bg-muted px-1 rounded">dark rose-dark</code>)
									</div>
								</div>
								<div class="flex gap-3">
									<div class="i-lucide-arrow-right size-5 text-primary flex-shrink-0 mt-0.5" />
									<div>
										<strong>Inline cssVars:</strong> Variables are recursively merged, with child
										themes overriding parent values
									</div>
								</div>
								<div class="flex gap-3">
									<div class="i-lucide-arrow-right size-5 text-primary flex-shrink-0 mt-0.5" />
									<div>
										<strong>Recursive:</strong> Themes can extend themes that extend other themes
										(e.g., modern → dark → base)
									</div>
								</div>
								<div class="flex gap-3">
									<div class="i-lucide-arrow-right size-5 text-primary flex-shrink-0 mt-0.5" />
									<div>
										<strong>Safe:</strong> Circular dependencies are automatically detected and
										prevented
									</div>
								</div>
							</div>
						</div>

						<div class="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
							<div class="flex gap-2 items-start">
								<div class="i-lucide-lightbulb size-4 text-green-500 mt-0.5 flex-shrink-0" />
								<div class="text-sm">
									<strong class="text-green-500">Pro Tip:</strong> Use theme inheritance to create
									color variants for different base themes. For example, create "rose-light" and
									"rose-dark" that extend "light" and "dark" respectively.
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Method 2: Inline */}
				<Card class="mb-8">
					<CardHeader>
						<CardTitle>Method 2: Define Themes Inline</CardTitle>
						<CardDescription>
							Great for dynamic themes or when you don't want to modify CSS files
						</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<div>
							<h3 class="text-sm font-medium mb-3">Pass CSS variables in theme config</h3>
							<div class="bg-muted p-4 rounded-lg font-mono text-xs overflow-x-auto">
								<pre class="whitespace-pre-wrap">
									{`import { ThemeProvider } from '@/components/theme';

const themes = [
  {
    id: 'base',
    name: 'Dark Mode',
    description: 'Easy on the eyes',
    // No cssVars - uses :root automatically
  },
  {
    id: 'light',
    name: 'Light Mode',
    description: 'Clean and bright',
    // CSS class .light in global.css
  },
  {
    id: 'purple',
    name: 'Purple Theme',
    description: 'Custom purple accent',
    cssVars: {
      primary: '262.1 83.3% 57.8%',
      ring: '262.1 83.3% 57.8%',
    }
  },
  {
    id: 'custom',
    name: 'Custom Theme',
    cssVars: {
      primary: '142.1 76.2% 36.3%',
      'primary-foreground': '355.7 100% 97.3%',
      ring: '142.1 76.2% 36.3%',
    }
  },
];

<ThemeProvider config={{ themes, defaultTheme: 'base' }}>
  <App />
</ThemeProvider>`}
								</pre>
							</div>
						</div>

						<div class="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
							<div class="flex gap-2 items-start">
								<div class="i-lucide-info size-4 text-blue-500 mt-0.5 flex-shrink-0" />
								<div class="text-sm">
									<strong class="text-blue-500">Note:</strong> Inline cssVars override CSS-defined
									themes. If a theme has both a CSS class and cssVars, the cssVars take precedence.
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Building Controls */}
				<Card class="mb-8">
					<CardHeader>
						<CardTitle>Building Theme Controls</CardTitle>
						<CardDescription>
							Use the useTheme hook to create your own theme switchers
						</CardDescription>
					</CardHeader>
					<CardContent class="space-y-6">
						<div>
							<h3 class="text-sm font-medium mb-3">Simple Toggle</h3>
							<div class="bg-muted p-4 rounded-lg font-mono text-xs overflow-x-auto">
								<pre class="whitespace-pre-wrap">
									{`import { useTheme } from '@/components/theme';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggle = () => {
    setTheme(theme() === 'base' ? 'light' : 'base');
  };

  return <button onClick={toggle}>Toggle Theme</button>;
}`}
								</pre>
							</div>
						</div>

						<div>
							<h3 class="text-sm font-medium mb-3">Cycle Through All Themes</h3>
							<div class="bg-muted p-4 rounded-lg font-mono text-xs overflow-x-auto">
								<pre class="whitespace-pre-wrap">
									{`import { useTheme } from '@/components/theme';

function ThemeCycler() {
  const { theme, setTheme, themes } = useTheme();

  const cycleTheme = () => {
    const current = themes().findIndex(t => t.id === theme());
    const next = (current + 1) % themes().length;
    setTheme(themes()[next].id);
  };

  return (
    <button onClick={cycleTheme}>
      {theme()} (Click to cycle)
    </button>
  );
}`}
								</pre>
							</div>
						</div>

						<div>
							<h3 class="text-sm font-medium mb-3">Theme Selector Buttons</h3>
							<div class="bg-muted p-4 rounded-lg font-mono text-xs overflow-x-auto">
								<pre class="whitespace-pre-wrap">
									{`import { useTheme } from '@/components/theme';
import { For } from 'solid-js';

function ThemeSelector() {
  const { theme, setTheme, themes } = useTheme();

  return (
    <div class="flex gap-2">
      <For each={themes()}>
        {(t) => (
          <button
            onClick={() => setTheme(t.id)}
            class={theme() === t.id ? 'active' : ''}
          >
            {t.name}
          </button>
        )}
      </For>
    </div>
  );
}`}
								</pre>
							</div>
						</div>

						<div>
							<h3 class="text-sm font-medium mb-3">Using Built-in ThemeSwitcher</h3>
							<div class="bg-muted p-4 rounded-lg font-mono text-xs overflow-x-auto">
								<pre class="whitespace-pre-wrap">
									{`import { ThemeSwitcher } from '@/components/theme';

function MyApp() {
  return (
    <div>
      {/* Simple list */}
      <ThemeSwitcher />

      {/* With descriptions */}
      <ThemeSwitcher showDescription />

      {/* Custom rendering */}
      <ThemeSwitcher
        renderButton={(theme, isActive) => (
          <div class={isActive ? 'active' : ''}>
            {theme.name}
          </div>
        )}
      />
    </div>
  );
}`}
								</pre>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Best Practices */}
				<Card class="mb-8">
					<CardHeader>
						<CardTitle>Best Practices</CardTitle>
						<CardDescription>Tips for creating maintainable themes</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="flex gap-3">
							<div class="i-lucide-check-circle size-5 text-green-500 flex-shrink-0 mt-0.5" />
							<div>
								<h3 class="font-medium mb-1">Override Only What You Need</h3>
								<p class="text-sm text-muted-foreground">
									Theme classes only need to define variables that differ from :root. Everything
									else automatically inherits.
								</p>
								<div class="mt-2 bg-muted p-3 rounded font-mono text-xs">
									<pre>{`.my-theme {
  --primary: 346.8 77.2% 49.8%;
  /* All other vars inherit from :root */
}`}</pre>
								</div>
							</div>
						</div>

						<div class="flex gap-3">
							<div class="i-lucide-check-circle size-5 text-green-500 flex-shrink-0 mt-0.5" />
							<div>
								<h3 class="font-medium mb-1">Use HSL Color Format</h3>
								<p class="text-sm text-muted-foreground">
									HSL (Hue Saturation Lightness) makes it easier to create color variations and
									maintain consistency.
								</p>
								<div class="mt-2 bg-muted p-3 rounded font-mono text-xs">
									<pre>{`/* ✅ Good */
--primary: 221.2 83.2% 53.3%;

/* ❌ Avoid */
--primary: #3b82f6;`}</pre>
								</div>
							</div>
						</div>

						<div class="flex gap-3">
							<div class="i-lucide-check-circle size-5 text-green-500 flex-shrink-0 mt-0.5" />
							<div>
								<h3 class="font-medium mb-1">Test in Multiple Contexts</h3>
								<p class="text-sm text-muted-foreground">
									Make sure your custom color themes work well when layered on different base themes
									(like light and dark).
								</p>
							</div>
						</div>

						<div class="flex gap-3">
							<div class="i-lucide-x-circle size-5 text-red-500 flex-shrink-0 mt-0.5" />
							<div>
								<h3 class="font-medium mb-1">Don't Redefine Everything</h3>
								<p class="text-sm text-muted-foreground">
									You don't need to copy all variables from :root into your theme. Only define what
									changes. The CSS cascade handles the rest.
								</p>
							</div>
						</div>

						<div class="flex gap-3">
							<div class="i-lucide-check-circle size-5 text-green-500 flex-shrink-0 mt-0.5" />
							<div>
								<h3 class="font-medium mb-1">Use Theme Inheritance</h3>
								<p class="text-sm text-muted-foreground">
									Instead of duplicating theme definitions, use the extends property to create
									variants based on existing themes.
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* API Reference */}
				<Card class="mb-8">
					<CardHeader>
						<CardTitle>API Reference</CardTitle>
					</CardHeader>
					<CardContent class="space-y-6">
						<div>
							<h3 class="font-semibold mb-2">ThemeProvider</h3>
							<p class="text-sm text-muted-foreground mb-3">
								The root provider component that manages theme state.
							</p>
							<div class="bg-muted p-4 rounded-lg font-mono text-xs space-y-2">
								<div>
									<strong>config.themes</strong>: ThemeDefinition[]
								</div>
								<div>
									<strong>config.defaultTheme</strong>?: string
								</div>
								<div>
									<strong>config.storageKey</strong>?: string (default: "theme")
								</div>
								<div>
									<strong>config.attribute</strong>?: "class" | "data-theme" (default: "class")
								</div>
								<div>
									<strong>config.syncAcrossTabs</strong>?: boolean (default: true)
								</div>
							</div>
						</div>

						<div>
							<h3 class="font-semibold mb-2">useTheme()</h3>
							<p class="text-sm text-muted-foreground mb-3">
								Hook to access theme state and controls.
							</p>
							<div class="bg-muted p-4 rounded-lg font-mono text-xs space-y-2">
								<div>
									<strong>theme()</strong>: string - Current theme ID
								</div>
								<div>
									<strong>setTheme(id)</strong>: void - Change theme
								</div>
								<div>
									<strong>themes()</strong>: ThemeDefinition[] - All themes
								</div>
								<div>
									<strong>currentTheme()</strong>: ThemeDefinition | undefined
								</div>
								<div>
									<strong>mounted()</strong>: boolean - Is client-side mounted
								</div>
							</div>
						</div>

						<div>
							<h3 class="font-semibold mb-2">ThemeDefinition</h3>
							<p class="text-sm text-muted-foreground mb-3">Object describing a theme.</p>
							<div class="bg-muted p-4 rounded-lg font-mono text-xs space-y-2">
								<div>
									<strong>id</strong>: string - Unique identifier
								</div>
								<div>
									<strong>name</strong>: string - Display name
								</div>
								<div>
									<strong>description</strong>?: string - Optional description
								</div>
								<div>
									<strong>cssVars</strong>?: Record&lt;string, string&gt; - CSS variable overrides
								</div>
								<div>
									<strong>extends</strong>?: string - Base theme ID to inherit from
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</DocsLayout>
	);
}

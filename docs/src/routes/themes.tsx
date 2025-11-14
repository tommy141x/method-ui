import { For, Show } from "solid-js";
import { Title, Meta } from "@solidjs/meta";
import { Navbar } from "../components/navbar";
import { Button } from "../components/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/card";
import { Badge } from "../components/badge";
import { useTheme } from "../components/theme";
import { cn } from "@lib/cn";

export default function Themes() {
  const { theme, setTheme, themes, mounted } = useTheme();

  return (
    <div class="min-h-screen bg-background">
      <Title>Themes - Method UI</Title>
      <Meta
        name="description"
        content="Customize the look and feel of your application with Method UI themes. Choose from pre-built color schemes or create your own."
      />

      <Navbar />

      <div class="container mx-auto px-4 py-12">
        {/* Header */}
        <div class="max-w-3xl mb-12">
          <Badge variant="secondary" class="mb-4">
            Customization
          </Badge>
          <h1 class="text-4xl md:text-5xl font-bold mb-4">Themes</h1>
          <p class="text-xl text-muted-foreground">
            Customize the look and feel of your application. Choose from
            pre-built themes or create your own using CSS variables.
          </p>
        </div>

        {/* Theme Gallery */}
        <div class="mb-12">
          <h2 class="text-2xl font-bold mb-6">Available Themes</h2>
          <p class="text-muted-foreground mb-6">
            Choose from our curated collection of themes. Each theme can be
            further customized with CSS variables.
          </p>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <For each={themes()}>
              {(themeOption) => (
                <button
                  onClick={() => setTheme(themeOption.id)}
                  class="text-left h-full"
                >
                  <Card
                    class={cn(
                      "cursor-pointer transition-all hover:shadow-lg h-full flex flex-col",
                      theme() === themeOption.id && "ring-2 ring-primary",
                    )}
                  >
                    <CardHeader class="flex-1 flex flex-col justify-between min-h-[180px]">
                      <div class="flex items-start justify-between mb-4 gap-2">
                        <div class="flex-1 min-w-0">
                          <CardTitle class="line-clamp-2 break-words">
                            {themeOption.name}
                          </CardTitle>
                          <CardDescription class="mt-2 line-clamp-3 break-words min-h-[3.6em]">
                            {themeOption.description}
                          </CardDescription>
                        </div>
                        <Show when={theme() === themeOption.id}>
                          <Badge variant="default" class="flex-shrink-0">
                            Active
                          </Badge>
                        </Show>
                      </div>
                      {/* Color Preview */}
                      <div class="flex gap-2 items-center mt-auto">
                        <Show
                          when={themeOption.cssVars?.primary}
                          fallback={
                            <div class="flex gap-2 items-center">
                              <div class="w-10 h-10 rounded-full border-2 border-border shadow-sm bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0" />
                              <div class="text-xs text-muted-foreground">
                                Base Theme
                              </div>
                            </div>
                          }
                        >
                          <div
                            class="w-10 h-10 rounded-full border-2 border-border shadow-sm flex-shrink-0"
                            style={{
                              "background-color": `hsl(${themeOption.cssVars?.primary})`,
                            }}
                            title="Primary Color"
                          />
                          <div class="text-xs text-muted-foreground">
                            Primary Color
                          </div>
                        </Show>
                      </div>
                    </CardHeader>
                  </Card>
                </button>
              )}
            </For>
          </div>
        </div>

        {/* Live Preview */}
        <div class="mb-12">
          <h2 class="text-2xl font-bold mb-6">Live Preview</h2>
          <Card>
            <CardHeader>
              <CardTitle>Current Theme Preview</CardTitle>
              <CardDescription>
                See how components look with the selected theme
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              {/* Buttons */}
              <div>
                <h3 class="text-sm font-medium mb-3">Buttons</h3>
                <div class="flex flex-wrap gap-2">
                  <Button variant="default">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                </div>
              </div>

              {/* Badges */}
              <div>
                <h3 class="text-sm font-medium mb-3">Badges</h3>
                <div class="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="outline">Outline</Badge>
                </div>
              </div>

              {/* Cards */}
              <div>
                <h3 class="text-sm font-medium mb-3">Card</h3>
                <Card class="max-w-md bg-muted">
                  <CardHeader>
                    <CardTitle>Card Title</CardTitle>
                    <CardDescription>
                      This is a card with the current theme applied
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p class="text-sm">
                      Cards automatically inherit the theme colors and adapt to
                      your selected color scheme.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customization Guide */}
        <div class="space-y-6">
          <h2 class="text-2xl font-bold">Customization</h2>

          <Card>
            <CardHeader>
              <CardTitle>Available CSS Variables</CardTitle>
              <CardDescription>
                Method UI uses CSS variables for theming. All variables are
                defined in :root and can be overridden in theme classes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                <div class="bg-muted p-2 rounded font-mono text-xs">
                  --background
                </div>
                <div class="bg-muted p-2 rounded font-mono text-xs">
                  --foreground
                </div>
                <div class="bg-muted p-2 rounded font-mono text-xs">
                  --primary
                </div>
                <div class="bg-muted p-2 rounded font-mono text-xs">
                  --primary-foreground
                </div>
                <div class="bg-muted p-2 rounded font-mono text-xs">
                  --secondary
                </div>
                <div class="bg-muted p-2 rounded font-mono text-xs">
                  --secondary-foreground
                </div>
                <div class="bg-muted p-2 rounded font-mono text-xs">
                  --muted
                </div>
                <div class="bg-muted p-2 rounded font-mono text-xs">
                  --muted-foreground
                </div>
                <div class="bg-muted p-2 rounded font-mono text-xs">
                  --accent
                </div>
                <div class="bg-muted p-2 rounded font-mono text-xs">
                  --accent-foreground
                </div>
                <div class="bg-muted p-2 rounded font-mono text-xs">
                  --destructive
                </div>
                <div class="bg-muted p-2 rounded font-mono text-xs">
                  --destructive-foreground
                </div>
                <div class="bg-muted p-2 rounded font-mono text-xs">
                  --border
                </div>
                <div class="bg-muted p-2 rounded font-mono text-xs">
                  --input
                </div>
                <div class="bg-muted p-2 rounded font-mono text-xs">--ring</div>
                <div class="bg-muted p-2 rounded font-mono text-xs">
                  --radius
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Method 1: Define Themes in CSS</CardTitle>
              <CardDescription>
                Create theme classes in your global.css file. This is the
                recommended approach for themes you want to use across your
                entire app.
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div>
                <h3 class="text-sm font-medium mb-2">
                  Step 1: Add theme classes to global.css
                </h3>
                <div class="bg-muted p-4 rounded-lg font-mono text-xs overflow-x-auto">
                  <pre class="whitespace-pre-wrap">
                    {`/* In your global.css */

/* Purple theme - only override what you want to change */
.purple {
  --primary: 262.1 83.3% 57.8%;
  --ring: 262.1 83.3% 57.8%;
}

/* Midnight theme - full dark theme with custom colors */
.midnight {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  --border: 217.2 32.6% 17.5%;
}

/* Warm theme - subtle color adjustments */
.warm {
  --primary: 24.6 95% 53.1%;
  --accent: 45 93.4% 47.5%;
}`}
                  </pre>
                </div>
              </div>

              <div>
                <h3 class="text-sm font-medium mb-2">
                  Step 2: Register themes in ThemeProvider
                </h3>
                <div class="bg-muted p-4 rounded-lg font-mono text-xs overflow-x-auto">
                  <pre class="whitespace-pre-wrap">
                    {`import { ThemeProvider } from '@/components/theme';

const themes = [
  { id: 'light', name: 'Light' },
  { id: 'dark', name: 'Dark' },
  { id: 'purple', name: 'Purple' },
  { id: 'midnight', name: 'Midnight' },
  { id: 'warm', name: 'Warm' },
];

<ThemeProvider config={{ themes, defaultTheme: 'light' }}>
  <App />
</ThemeProvider>`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Method 2: Define Themes Inline</CardTitle>
              <CardDescription>
                Pass CSS variables directly in your theme configuration. Great
                for dynamic themes or when you don't want to modify CSS files.
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div>
                <h3 class="text-sm font-medium mb-2">
                  Define themes with cssVars property
                </h3>
                <div class="bg-muted p-4 rounded-lg font-mono text-xs overflow-x-auto">
                  <pre class="whitespace-pre-wrap">
                    {`import { ThemeProvider } from '@/components/theme';

const themes = [
  {
    id: 'light',
    name: 'Light Mode',
    description: 'Clean and bright',
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    description: 'Easy on the eyes',
  },
  {
    id: 'custom-blue',
    name: 'Ocean Blue',
    description: 'Custom blue accent',
    cssVars: {
      primary: '217.2 91.2% 59.8%',
      ring: '217.2 91.2% 59.8%',
    }
  },
  {
    id: 'rose',
    name: 'Rose',
    description: 'Warm and elegant',
    cssVars: {
      primary: '346.8 77.2% 49.8%',
      ring: '346.8 77.2% 49.8%',
    }
  },
];

<ThemeProvider config={{ themes }}>
  <App />
</ThemeProvider>`}
                  </pre>
                </div>
              </div>

              <div class="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
                <div class="flex gap-2 items-start">
                  <div class="i-lucide-info size-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div class="text-sm">
                    <strong class="text-blue-500">Tip:</strong> Inline cssVars
                    override CSS-defined themes. If a theme has both a CSS class
                    and cssVars defined, the cssVars take precedence.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Best Practices</CardTitle>
              <CardDescription>
                Tips for creating maintainable themes
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div>
                <h3 class="text-sm font-medium mb-2">
                  ✅ Do: Override only what you need
                </h3>
                <p class="text-sm text-muted-foreground mb-2">
                  Theme classes only need to define variables that differ from
                  :root. Everything else automatically inherits.
                </p>
                <div class="bg-muted p-3 rounded font-mono text-xs">
                  <pre>{`.my-theme {
  --primary: 346.8 77.2% 49.8%;
  /* All other vars inherit from :root */
}`}</pre>
                </div>
              </div>

              <div>
                <h3 class="text-sm font-medium mb-2">
                  ✅ Do: Use HSL color format
                </h3>
                <p class="text-sm text-muted-foreground mb-2">
                  HSL (Hue Saturation Lightness) makes it easier to create color
                  variations and maintain consistency.
                </p>
                <div class="bg-muted p-3 rounded font-mono text-xs">
                  <pre>{`--primary: 221.2 83.2% 53.3%;
/* Not: #3b82f6 */`}</pre>
                </div>
              </div>

              <div>
                <h3 class="text-sm font-medium mb-2">
                  ✅ Do: Test in both light and dark contexts
                </h3>
                <p class="text-sm text-muted-foreground">
                  Color themes should work well when applied on top of both
                  light and dark base themes. Test your custom colors in both
                  contexts.
                </p>
              </div>

              <div>
                <h3 class="text-sm font-medium mb-2">
                  ❌ Don't: Redefine all variables
                </h3>
                <p class="text-sm text-muted-foreground">
                  You don't need to copy all variables from :root into your
                  theme. Only define what changes.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

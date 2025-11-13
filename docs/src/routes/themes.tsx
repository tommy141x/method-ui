import { createSignal, For, onMount, createEffect, Show } from "solid-js";
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
import { cn } from "@lib/cn";

interface ThemeColors {
  primary?: string;
  primaryForeground?: string;
  secondary?: string;
  secondaryForeground?: string;
  accent?: string;
  accentForeground?: string;
  muted?: string;
  mutedForeground?: string;
  background?: string;
  foreground?: string;
  card?: string;
  cardForeground?: string;
  popover?: string;
  popoverForeground?: string;
  border?: string;
  input?: string;
  ring?: string;
  destructive?: string;
  destructiveForeground?: string;
  radius?: string;
}

interface Theme {
  name: string;
  id: string;
  description: string;
  cssVars: {
    light: ThemeColors;
    dark: ThemeColors;
  };
}

export default function Themes() {
  const [selectedTheme, setSelectedTheme] = createSignal("default");
  const [mounted, setMounted] = createSignal(false);

  const themes: Theme[] = [
    {
      name: "Default",
      id: "default",
      description: "The default Method UI theme",
      cssVars: {
        light: {
          primary: "221.2 83.2% 53.3%",
        },
        dark: {
          primary: "221.2 83.2% 53.3%",
        },
      },
    },
    {
      name: "Slate",
      id: "slate",
      description: "A cool, professional slate theme",
      cssVars: {
        light: {
          primary: "215.4 16.3% 46.9%",
          ring: "215.4 16.3% 46.9%",
        },
        dark: {
          primary: "215.4 16.3% 56.9%",
          ring: "215.4 16.3% 56.9%",
        },
      },
    },
    {
      name: "Rose",
      id: "rose",
      description: "A warm, elegant rose theme",
      cssVars: {
        light: {
          primary: "346.8 77.2% 49.8%",
          ring: "346.8 77.2% 49.8%",
        },
        dark: {
          primary: "346.8 77.2% 59.8%",
          ring: "346.8 77.2% 59.8%",
        },
      },
    },
    {
      name: "Blue",
      id: "blue",
      description: "A vibrant, modern blue theme",
      cssVars: {
        light: {
          primary: "221.2 83.2% 53.3%",
          ring: "221.2 83.2% 53.3%",
        },
        dark: {
          primary: "217.2 91.2% 59.8%",
          ring: "217.2 91.2% 59.8%",
        },
      },
    },
    {
      name: "Green",
      id: "green",
      description: "A fresh, natural green theme",
      cssVars: {
        light: {
          primary: "142.1 76.2% 36.3%",
          ring: "142.1 76.2% 36.3%",
        },
        dark: {
          primary: "142.1 70.6% 45.3%",
          ring: "142.1 70.6% 45.3%",
        },
      },
    },
    {
      name: "Orange",
      id: "orange",
      description: "An energetic, warm orange theme",
      cssVars: {
        light: {
          primary: "24.6 95% 53.1%",
          ring: "24.6 95% 53.1%",
        },
        dark: {
          primary: "20.5 90.2% 48.2%",
          ring: "20.5 90.2% 48.2%",
        },
      },
    },
  ];

  const applyTheme = (themeId: string) => {
    const theme = themes.find((t) => t.id === themeId);
    if (!theme) return;

    const root = document.documentElement;

    // Set data attribute for the theme
    root.setAttribute("data-theme", themeId);

    // Apply light mode variables
    const lightVars = theme.cssVars.light;
    Object.entries(lightVars).forEach(([key, value]) => {
      if (value) {
        const cssVar = `--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
        root.style.setProperty(cssVar, value);
      }
    });

    // Apply dark mode variables using a style tag
    const existingStyle = document.getElementById("theme-dark-mode");
    if (existingStyle) {
      existingStyle.remove();
    }

    const darkVars = theme.cssVars.dark;
    const darkVarEntries = Object.entries(darkVars).filter(
      ([_, value]) => value,
    );

    if (darkVarEntries.length > 0) {
      const style = document.createElement("style");
      style.id = "theme-dark-mode";
      const darkCss = darkVarEntries
        .map(([key, value]) => {
          const cssVar = `--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
          return `  ${cssVar}: ${value};`;
        })
        .join("\n");
      style.textContent = `.dark {\n${darkCss}\n}`;
      document.head.appendChild(style);
    }

    localStorage.setItem("theme-color", themeId);
  };

  const handleThemeChange = (themeId: string) => {
    setSelectedTheme(themeId);
    applyTheme(themeId);
  };

  // Apply theme on mount (client only)
  onMount(() => {
    const savedTheme = localStorage.getItem("theme-color") || "default";
    setSelectedTheme(savedTheme);
    applyTheme(savedTheme);
    setMounted(true);
  });

  // Apply theme when it changes (client only)
  createEffect(() => {
    if (mounted()) {
      const theme = selectedTheme();
      applyTheme(theme);
    }
  });

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

        {/* Theme Selector */}
        <div class="mb-12">
          <h2 class="text-2xl font-bold mb-6">Theme Gallery</h2>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <For each={themes}>
              {(theme) => (
                <div
                  class="cursor-pointer"
                  onClick={() => handleThemeChange(theme.id)}
                >
                  <Card
                    class={cn(
                      "transition-all hover:shadow-lg",
                      selectedTheme() === theme.id && "ring-2 ring-primary",
                    )}
                  >
                    <CardHeader>
                      <div class="flex items-start justify-between mb-4">
                        <div class="flex-1">
                          <CardTitle>{theme.name}</CardTitle>
                          <CardDescription class="mt-2">
                            {theme.description}
                          </CardDescription>
                        </div>
                        {selectedTheme() === theme.id && (
                          <Badge variant="default">Active</Badge>
                        )}
                      </div>
                      {/* Color Palette Preview */}
                      <div class="flex gap-2">
                        <div
                          class="w-8 h-8 rounded-full border-2 border-border"
                          style={{
                            "background-color": `hsl(${theme.cssVars.light.primary || "221.2 83.2% 53.3%"})`,
                          }}
                          title="Primary (Light Mode)"
                        />
                        <div
                          class="w-8 h-8 rounded-full border-2 border-border"
                          style={{
                            "background-color": `hsl(${theme.cssVars.dark.primary || "221.2 83.2% 53.3%"})`,
                          }}
                          title="Primary (Dark Mode)"
                        />
                        <div
                          class="w-8 h-8 rounded-full border-2 border-border"
                          style={{
                            "background-color": `hsl(${theme.cssVars.light.ring || theme.cssVars.light.primary || "221.2 83.2% 53.3%"})`,
                          }}
                          title="Ring/Focus (Light Mode)"
                        />
                      </div>
                    </CardHeader>
                  </Card>
                </div>
              )}
            </For>
          </div>
        </div>

        {/* Customization Guide */}
        <div class="space-y-6">
          <h2 class="text-2xl font-bold">Customization</h2>

          <Card>
            <CardHeader>
              <CardTitle>Using CSS Variables</CardTitle>
              <CardDescription>
                Method UI uses CSS variables for theming. You can customize any
                theme by overriding these variables in your global CSS.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div class="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre>
                  {(() => {
                    const theme = themes.find((t) => t.id === selectedTheme());
                    if (!theme)
                      return "/* Select a theme to see CSS variables */";

                    const lightVars = theme.cssVars.light;
                    const darkVars = theme.cssVars.dark;

                    // Default values from global.css
                    const defaults = {
                      light: {
                        background: "0 0% 100%",
                        foreground: "222.2 84% 4.9%",
                        card: "0 0% 98%",
                        cardForeground: "222.2 84% 4.9%",
                        popover: "0 0% 100%",
                        popoverForeground: "222.2 84% 4.9%",
                        primary: "221.2 83.2% 53.3%",
                        primaryForeground: "210 40% 98%",
                        secondary: "210 40% 96%",
                        secondaryForeground: "222.2 84% 4.9%",
                        muted: "210 40% 96%",
                        mutedForeground: "215.4 16.3% 46.9%",
                        accent: "210 40% 96%",
                        accentForeground: "222.2 84% 4.9%",
                        destructive: "0 84.2% 60.2%",
                        destructiveForeground: "210 40% 98%",
                        border: "214.3 31.8% 91.4%",
                        input: "214.3 31.8% 91.4%",
                        ring: "221.2 83.2% 53.3%",
                        radius: "0.5rem",
                      },
                      dark: {
                        background: "222.2 84% 4.9%",
                        foreground: "210 40% 98%",
                        card: "222.2 47% 11.2%",
                        cardForeground: "210 40% 98%",
                        popover: "222.2 84% 4.9%",
                        popoverForeground: "210 40% 98%",
                        primary: "221.2 83.2% 53.3%",
                        primaryForeground: "210 40% 98%",
                        secondary: "217.2 32.6% 17.5%",
                        secondaryForeground: "210 40% 98%",
                        muted: "217.2 32.6% 17.5%",
                        mutedForeground: "215 20.2% 65.1%",
                        accent: "217.2 32.6% 17.5%",
                        accentForeground: "210 40% 98%",
                        destructive: "0 62.8% 30.6%",
                        destructiveForeground: "210 40% 98%",
                        border: "217.2 32.6% 17.5%",
                        input: "217.2 32.6% 17.5%",
                        ring: "224.3 76.3% 94.1%",
                      },
                    };

                    let css = `/* Add to your global.css */\n:root {\n`;
                    css += `  --background: ${lightVars.background || defaults.light.background};\n`;
                    css += `  --foreground: ${lightVars.foreground || defaults.light.foreground};\n`;
                    css += `  --card: ${lightVars.card || defaults.light.card};\n`;
                    css += `  --card-foreground: ${lightVars.cardForeground || defaults.light.cardForeground};\n`;
                    css += `  --popover: ${lightVars.popover || defaults.light.popover};\n`;
                    css += `  --popover-foreground: ${lightVars.popoverForeground || defaults.light.popoverForeground};\n`;
                    css += `  --primary: ${lightVars.primary || defaults.light.primary};\n`;
                    css += `  --primary-foreground: ${lightVars.primaryForeground || defaults.light.primaryForeground};\n`;
                    css += `  --secondary: ${lightVars.secondary || defaults.light.secondary};\n`;
                    css += `  --secondary-foreground: ${lightVars.secondaryForeground || defaults.light.secondaryForeground};\n`;
                    css += `  --muted: ${lightVars.muted || defaults.light.muted};\n`;
                    css += `  --muted-foreground: ${lightVars.mutedForeground || defaults.light.mutedForeground};\n`;
                    css += `  --accent: ${lightVars.accent || defaults.light.accent};\n`;
                    css += `  --accent-foreground: ${lightVars.accentForeground || defaults.light.accentForeground};\n`;
                    css += `  --destructive: ${lightVars.destructive || defaults.light.destructive};\n`;
                    css += `  --destructive-foreground: ${lightVars.destructiveForeground || defaults.light.destructiveForeground};\n`;
                    css += `  --border: ${lightVars.border || defaults.light.border};\n`;
                    css += `  --input: ${lightVars.input || defaults.light.input};\n`;
                    css += `  --ring: ${lightVars.ring || defaults.light.ring};\n`;
                    css += `  --radius: ${lightVars.radius || defaults.light.radius};\n`;
                    css += `}\n`;

                    css += `\n.dark {\n`;
                    css += `  --background: ${darkVars.background || defaults.dark.background};\n`;
                    css += `  --foreground: ${darkVars.foreground || defaults.dark.foreground};\n`;
                    css += `  --card: ${darkVars.card || defaults.dark.card};\n`;
                    css += `  --card-foreground: ${darkVars.cardForeground || defaults.dark.cardForeground};\n`;
                    css += `  --popover: ${darkVars.popover || defaults.dark.popover};\n`;
                    css += `  --popover-foreground: ${darkVars.popoverForeground || defaults.dark.popoverForeground};\n`;
                    css += `  --primary: ${darkVars.primary || defaults.dark.primary};\n`;
                    css += `  --primary-foreground: ${darkVars.primaryForeground || defaults.dark.primaryForeground};\n`;
                    css += `  --secondary: ${darkVars.secondary || defaults.dark.secondary};\n`;
                    css += `  --secondary-foreground: ${darkVars.secondaryForeground || defaults.dark.secondaryForeground};\n`;
                    css += `  --muted: ${darkVars.muted || defaults.dark.muted};\n`;
                    css += `  --muted-foreground: ${darkVars.mutedForeground || defaults.dark.mutedForeground};\n`;
                    css += `  --accent: ${darkVars.accent || defaults.dark.accent};\n`;
                    css += `  --accent-foreground: ${darkVars.accentForeground || defaults.dark.accentForeground};\n`;
                    css += `  --destructive: ${darkVars.destructive || defaults.dark.destructive};\n`;
                    css += `  --destructive-foreground: ${darkVars.destructiveForeground || defaults.dark.destructiveForeground};\n`;
                    css += `  --border: ${darkVars.border || defaults.dark.border};\n`;
                    css += `  --input: ${darkVars.input || defaults.dark.input};\n`;
                    css += `  --ring: ${darkVars.ring || defaults.dark.ring};\n`;
                    css += `}`;

                    return css;
                  })()}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Creating a Custom Theme</CardTitle>
              <CardDescription>
                Follow these steps to create your own custom theme
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div>
                <h3 class="font-semibold mb-2">1. Choose Your Colors</h3>
                <p class="text-sm text-muted-foreground">
                  Select your primary, secondary, and accent colors. Use HSL
                  format for better color manipulation.
                </p>
              </div>
              <div>
                <h3 class="font-semibold mb-2">2. Define CSS Variables</h3>
                <p class="text-sm text-muted-foreground">
                  Override the default CSS variables in your global stylesheet
                  with your chosen colors.
                </p>
              </div>
              <div>
                <h3 class="font-semibold mb-2">3. Test Dark Mode</h3>
                <p class="text-sm text-muted-foreground">
                  Make sure to define dark mode variants in the .dark selector
                  for a complete theme.
                </p>
              </div>
              <div>
                <h3 class="font-semibold mb-2">4. Adjust Component Variants</h3>
                <p class="text-sm text-muted-foreground">
                  Fine-tune individual component variants if needed to match
                  your design system.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Color Palette Generator</CardTitle>
              <CardDescription>
                Coming soon: An interactive tool to generate custom color
                palettes for your theme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" disabled>
                Launch Color Generator (Coming Soon)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer class="container mx-auto px-4 py-12 border-t border-border mt-12">
        <div class="max-w-6xl mx-auto text-center text-muted-foreground">
          <p>Built with ❤️ using SolidJS and Ark UI</p>
        </div>
      </footer>
    </div>
  );
}

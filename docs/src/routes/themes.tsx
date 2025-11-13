import { createSignal, For } from "solid-js";
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

export default function Themes() {
  const [selectedTheme, setSelectedTheme] = createSignal("default");

  const themes = [
    {
      name: "Default",
      id: "default",
      description: "The default Method UI theme",
      colors: {
        primary: "hsl(222.2 47.4% 11.2%)",
        background: "hsl(0 0% 100%)",
        foreground: "hsl(222.2 84% 4.9%)",
        muted: "hsl(210 40% 96.1%)",
      },
    },
    {
      name: "Slate",
      id: "slate",
      description: "A cool, professional slate theme",
      colors: {
        primary: "hsl(215.4 16.3% 46.9%)",
        background: "hsl(0 0% 100%)",
        foreground: "hsl(222.2 84% 4.9%)",
        muted: "hsl(210 40% 96.1%)",
      },
    },
    {
      name: "Rose",
      id: "rose",
      description: "A warm, elegant rose theme",
      colors: {
        primary: "hsl(346.8 77.2% 49.8%)",
        background: "hsl(0 0% 100%)",
        foreground: "hsl(240 10% 3.9%)",
        muted: "hsl(240 4.8% 95.9%)",
      },
    },
    {
      name: "Blue",
      id: "blue",
      description: "A vibrant, modern blue theme",
      colors: {
        primary: "hsl(221.2 83.2% 53.3%)",
        background: "hsl(0 0% 100%)",
        foreground: "hsl(222.2 84% 4.9%)",
        muted: "hsl(210 40% 96.1%)",
      },
    },
    {
      name: "Green",
      id: "green",
      description: "A fresh, natural green theme",
      colors: {
        primary: "hsl(142.1 76.2% 36.3%)",
        background: "hsl(0 0% 100%)",
        foreground: "hsl(240 10% 3.9%)",
        muted: "hsl(240 4.8% 95.9%)",
      },
    },
    {
      name: "Orange",
      id: "orange",
      description: "An energetic, warm orange theme",
      colors: {
        primary: "hsl(24.6 95% 53.1%)",
        background: "hsl(0 0% 100%)",
        foreground: "hsl(20 14.3% 4.1%)",
        muted: "hsl(60 4.8% 95.9%)",
      },
    },
  ];

  return (
    <div class="min-h-screen bg-background">
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
                  onClick={() => setSelectedTheme(theme.id)}
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
                          style={{ "background-color": theme.colors.primary }}
                          title="Primary"
                        />
                        <div
                          class="w-8 h-8 rounded-full border-2 border-border"
                          style={{
                            "background-color": theme.colors.background,
                          }}
                          title="Background"
                        />
                        <div
                          class="w-8 h-8 rounded-full border-2 border-border"
                          style={{
                            "background-color": theme.colors.foreground,
                          }}
                          title="Foreground"
                        />
                        <div
                          class="w-8 h-8 rounded-full border-2 border-border"
                          style={{ "background-color": theme.colors.muted }}
                          title="Muted"
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
                <pre>{`/* In your global.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 11.2%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 212.7 26.8% 83.9%;
}`}</pre>
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

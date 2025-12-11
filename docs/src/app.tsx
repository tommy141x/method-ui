import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { MetaProvider } from "@solidjs/meta";
import "./global.css";
import { ThemeProvider, type ThemeDefinition } from "./components/theme";
import { GlassFilter } from "./components/glass-filter";

const themes: ThemeDefinition[] = [
  {
    id: "base",
    name: "Dark",
    description: "Dark mode - the default base theme",
    // Uses :root from global.css - no cssVars needed
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
      "chart-1": "20.5 90.2% 48.2%",
      "chart-2": "20 100% 39%",
      "chart-3": "20.5 90.2% 48.2%",
      "chart-4": "20 100% 39%",
      "chart-5": "20.5 90.2% 48.2%",
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

export default function App() {
  return (
    <MetaProvider>
      <ThemeProvider config={{ themes, defaultTheme: "base" }}>
        <GlassFilter />
        <Router
          root={(props) => (
            <Suspense fallback={<div>Loading...</div>}>
              {props.children}
            </Suspense>
          )}
        >
          <FileRoutes />
        </Router>
      </ThemeProvider>
    </MetaProvider>
  );
}

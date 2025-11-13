import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { MetaProvider } from "@solidjs/meta";
import "@unocss/reset/tailwind.css";
import "./global.css";
import "uno.css";
import { ThemeProvider } from "./lib/theme-provider";

export default function App() {
  return (
    <MetaProvider>
      <ThemeProvider>
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

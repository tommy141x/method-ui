import { defineConfig } from "@solidjs/start/config";
import UnoCSS from "unocss/vite";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  vite: {
    plugins: [
      UnoCSS({
        mode: "global",
      }),
    ],
    resolve: {
      alias: {
        "~": resolve(__dirname, "./src"),
        "@components": resolve(__dirname, "../components"),
        "@lib": resolve(__dirname, "../lib"),
      },
    },
    ssr: {
      noExternal: ["@ark-ui/solid", "solid-motionone"],
    },
  },
  server: {
    preset: "node-server",
  },
});

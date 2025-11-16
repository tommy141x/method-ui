import { defineConfig } from "@solidjs/start/config";
import { setupPlugins } from "@responsive-image/vite-plugin";
import UnoCSS from "unocss/vite";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  server: {
    preset: "static",
    baseURL: process.env.BASE_PATH || "/",
  },
  vite: {
    plugins: [
      UnoCSS({
        mode: "global",
      }),
      setupPlugins({
        include: /^[^?]+\.jpg\?.*responsive.*$/,
        lqip: { type: "inline" },
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
});

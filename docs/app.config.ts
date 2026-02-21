import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { setupPlugins } from "@responsive-image/vite-plugin";
import { defineConfig } from "@solidjs/start/config";
import UnoCSS from "unocss/vite";
import Icons from "unplugin-icons/vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
	vite: {
		plugins: [
			Icons({ compiler: "solid" }),
			UnoCSS(),
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
			noExternal: ["@ark-ui/solid"],
			external: ["@responsive-image/solid"],
		},
	},
});

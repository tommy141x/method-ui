/// <reference types="vite/client" />

// Teach TypeScript about ~icons/* virtual imports produced by unplugin-icons.
// The compiler: "solid" option means each icon is a SolidJS component.
declare module "~icons/*" {
	import type { Component, JSX } from "solid-js";
	const component: Component<JSX.SvgSVGAttributes<SVGSVGElement>>;
	export default component;
}

// Cloudflare Workers environment bindings
interface CloudflareEnv {}

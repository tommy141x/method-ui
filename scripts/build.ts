#!/usr/bin/env bun

/**
 * Build script for Method UI CLI
 *
 * This script bundles the CLI for publishing to npm.
 * It creates a standalone JavaScript file that works with any package manager.
 */

import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const projectRoot = import.meta.dir.replace(/scripts$/, "");

// Clean dist directory
try {
	rmSync(join(projectRoot, "dist"), { recursive: true, force: true });
} catch (_e) {
	// Directory might not exist
}

mkdirSync(join(projectRoot, "dist"), { recursive: true });

console.log("🔨 Building Method UI CLI...\n");

const result = await Bun.build({
	entrypoints: [join(projectRoot, "cli", "cli.ts")],
	outdir: join(projectRoot, "dist"),
	target: "node",
	format: "esm",
	splitting: false,
	minify: {
		whitespace: true,
		syntax: true,
		identifiers: false, // Keep readable names for debugging
	},
	sourcemap: "linked",
	// Mark all node_modules as external (like shadcn does)
	// This keeps dependencies separate and allows npm/bun to manage them
	external: ["*"],
	naming: {
		entry: "cli.js",
	},
});

if (!result.success) {
	console.error("❌ Build failed:");
	for (const log of result.logs) {
		console.error(log);
	}
	process.exit(1);
}

console.log("✅ Build successful!\n");

console.log("📦 Output files:");
for (const output of result.outputs) {
	const size = (output.size / 1024).toFixed(2);
	console.log(`  - ${output.path} (${size} KB)`);
}

console.log("\n🎉 Ready to publish!");
console.log("\nNext steps:");
console.log("  1. Test locally: bun run dist/cli.js");
console.log("  2. Dry run: bun publish --dry-run");
console.log("  3. Publish: bun publish");

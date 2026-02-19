import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { readPackageJson } from "./dependencies.js";

/**
 * Find the project root directory by looking for package.json
 * Walks up the directory tree from the current working directory
 */
export function findProjectRoot(startPath: string = process.cwd()): string | null {
	let currentPath = resolve(startPath);

	while (true) {
		const packageJsonPath = join(currentPath, "package.json");

		if (existsSync(packageJsonPath)) {
			return currentPath;
		}

		const parentPath = dirname(currentPath);

		// If we've reached the root of the filesystem, stop
		if (parentPath === currentPath) {
			return null;
		}

		currentPath = parentPath;
	}
}

/**
 * Get the project root directory or throw an error if not found
 */
export function getProjectRoot(): string {
	const root = findProjectRoot();

	if (!root) {
		throw new Error(
			"Could not find project root. Please run this command from within a project directory (one that contains package.json)."
		);
	}

	return root;
}

/**
 * Detects if the project uses TypeScript
 */
export function detectTypeScript(): boolean {
	// Check for tsconfig.json
	if (existsSync("tsconfig.json")) {
		return true;
	}

	// Check package.json for TypeScript dependencies
	const packageJson = readPackageJson();
	if (packageJson) {
		const deps = {
			...packageJson.dependencies,
			...packageJson.devDependencies,
		};

		if (deps.typescript || deps["@types/node"]) {
			return true;
		}
	}

	// Check for .ts/.tsx files in common directories
	const commonDirs = ["src", "lib", "app", "pages", "components"];
	for (const dir of commonDirs) {
		if (existsSync(dir)) {
			try {
				const { readdirSync } = require("node:fs");
				const files = readdirSync(dir);
				if (files.some((file: string) => file.endsWith(".ts") || file.endsWith(".tsx"))) {
					return true;
				}
			} catch {
				// Ignore errors reading directories
			}
		}
	}

	return false;
}

/**
 * Gets the appropriate file extension based on TypeScript detection
 */
export function getProjectFileExtension(): ".js" | ".ts" {
	return detectTypeScript() ? ".ts" : ".js";
}

/**
 * Gets project language information
 */
export function getProjectLanguageInfo(): {
	typescript: boolean;
	extension: string;
	reason: string;
} {
	const typescript = detectTypeScript();
	let reason = "default";

	if (typescript) {
		if (existsSync("tsconfig.json")) {
			reason = "found tsconfig.json";
		} else {
			const packageJson = readPackageJson();
			const deps = packageJson
				? { ...packageJson.dependencies, ...packageJson.devDependencies }
				: {};
			if (deps.typescript) {
				reason = "found typescript dependency";
			} else if (deps["@types/node"]) {
				reason = "found @types/node dependency";
			} else {
				reason = "found .ts/.tsx files";
			}
		}
	}

	return {
		typescript,
		extension: typescript ? ".ts" : ".js",
		reason,
	};
}

/**
 * Check if we're currently in a valid project directory
 */
export function isInProject(): boolean {
	return findProjectRoot() !== null;
}

/**
 * Resolve a path relative to the project root
 */
export function resolveFromProjectRoot(relativePath: string): string {
	const projectRoot = getProjectRoot();
	return resolve(projectRoot, relativePath);
}

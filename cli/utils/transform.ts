/**
 * Transform utilities for converting component files to user-ready code
 * This handles inlining the cn function and other transformations needed
 * to make components completely self-contained for end users.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { getProjectRoot } from "./project.js";

/**
 * Find the CLI package directory using multiple strategies
 */
function findCliDirectory(): string | null {
	let cliDir: string | null = null;

	// Strategy 1: Use __dirname if available (Node.js/CommonJS)
	if (typeof __dirname !== "undefined") {
		// Go up from cli/utils to package root
		cliDir = join(__dirname, "..", "..");
	}

	// Strategy 2: Use import.meta.url if available (ES modules)
	if (!cliDir && typeof import.meta !== "undefined" && import.meta.url) {
		try {
			const currentFile = new URL(import.meta.url).pathname;
			// Go up from cli/utils to package root
			cliDir = join(dirname(dirname(dirname(currentFile))));
		} catch (_error) {
			// Ignore URL parsing errors
		}
	}

	// Strategy 3: Look for package.json with our specific name
	if (!cliDir) {
		let searchDir = process.cwd();
		while (searchDir !== dirname(searchDir)) {
			try {
				const pkgPath = join(searchDir, "package.json");
				if (existsSync(pkgPath)) {
					const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
					if (pkg.name === "method-ui" && existsSync(join(searchDir, "components"))) {
						cliDir = searchDir;
						break;
					}
				}
			} catch (_error) {
				// Ignore JSON parsing errors
			}
			searchDir = dirname(searchDir);
		}
	}

	// Strategy 4: Check common locations for the CLI package
	if (!cliDir) {
		const possiblePaths = [
			join(process.cwd(), "node_modules", "method-ui"),
			join(dirname(process.cwd()), "method"),
			join(__dirname || ".", "..", ".."),
		];

		for (const path of possiblePaths) {
			if (existsSync(join(path, "components")) && existsSync(join(path, "package.json"))) {
				try {
					const pkg = JSON.parse(readFileSync(join(path, "package.json"), "utf-8"));
					if (pkg.name === "method-ui") {
						cliDir = path;
						break;
					}
				} catch (_error) {
					// Continue checking other paths
				}
			}
		}
	}

	return cliDir;
}

/**
 * Get icon library from user's components.json config
 */
function getIconLibraryFromConfig(): string {
	try {
		const projectRoot = getProjectRoot();
		const configPath = join(projectRoot, "components.json");

		if (existsSync(configPath)) {
			const configContent = readFileSync(configPath, "utf-8");
			const config = JSON.parse(configContent);
			return config.iconLibrary || "lucide";
		}
	} catch (_error) {
		// Fall back to lucide if config not found or invalid
	}
	return "lucide";
}

/**
 * Get the cn import lines to inline into transformed components
 * This makes components completely self-contained with no external dependencies
 */
function getCnImports(): string {
	return `import type { ClassValue } from "clsx";
import clsx from "clsx";
import { unoMerge } from "unocss-merge";`;
}

function getCnFunctionCode(): string {
	return `function cn(...classLists: ClassValue[]) {
	return unoMerge(clsx(classLists));
}`;
}

/**
 * Get list of available components
 */
export function getAvailableComponents(): string[] {
	const cliDir = findCliDirectory();

	if (!cliDir) {
		return [];
	}

	const componentsDir = join(cliDir, "components");

	if (!existsSync(componentsDir)) {
		return [];
	}

	try {
		return readdirSync(componentsDir)
			.filter((file) => file.endsWith(".tsx"))
			.map((file) => file.replace(".tsx", ""));
	} catch (_error) {
		return [];
	}
}

/**
 * Check if a component exists
 */
export function componentExists(componentName: string): boolean {
	const availableComponents = getAvailableComponents();
	return availableComponents.includes(componentName);
}

/**
 * Read a component file from our CLI's components directory
 */
export function readComponentFile(componentName: string): string {
	const cliDir = findCliDirectory();

	if (!cliDir) {
		throw new Error(`Could not locate method-ui package directory`);
	}

	const componentPath = join(cliDir, "components", `${componentName}.tsx`);
	try {
		return readFileSync(componentPath, "utf-8");
	} catch (_error) {
		throw new Error(`Component "${componentName}" not found at ${componentPath}`);
	}
}

/**
 * Remove meta export by finding balanced braces
 * This handles nested objects and functions properly
 */
function removeMetaExport(code: string): string {
	const metaStart = code.indexOf("export const meta:");
	if (metaStart === -1) return code;

	let braceCount = 0;
	let inMeta = false;
	let endIndex = metaStart;

	for (let i = metaStart; i < code.length; i++) {
		if (code[i] === "{") {
			braceCount++;
			inMeta = true;
		} else if (code[i] === "}") {
			braceCount--;
			if (inMeta && braceCount === 0) {
				// Find the semicolon after the closing brace
				const semicolonIndex = code.indexOf(";", i);
				if (semicolonIndex !== -1) {
					endIndex = semicolonIndex + 1;
					// Include trailing newline if present
					if (code[endIndex] === "\n") {
						endIndex++;
					}
				} else {
					endIndex = i + 1;
				}
				break;
			}
		}
	}

	return code.slice(0, metaStart) + code.slice(endIndex);
}

/**
 * Remove everything that sits between the last real component code and the
 * `export const meta` block. This covers:
 *   - The "// Example-only imports - removed during CLI transform" marker comment
 *   - Icon / component imports that are only used in examples
 *   - Any other comments or blank lines in that gap
 *
 * Strategy: walk backwards from the meta line and discard every line that is
 * blank, a comment, or an import statement — stopping the moment actual code
 * is encountered. `removeMetaExport` handles removing the meta block itself.
 *
 * Note: top-of-file imports that are only used inside the meta block are handled
 * automatically by `cleanupImports` (step 9), which runs after `removeMetaExport`
 * has already stripped the meta body — making those imports appear unused.
 */
function removePreMetaContent(code: string): string {
	const lines = code.split("\n");

	// Find the meta export line
	const metaLine = lines.findIndex((l) => /^\s*export const meta[:<\s]/.test(l));
	if (metaLine === -1) return code;

	// Walk backwards from the meta line, marking every removable line
	let cutFrom = metaLine;
	let i = metaLine - 1;

	while (i >= 0) {
		const trimmed = lines[i].trim();

		const isRemovable =
			trimmed === "" ||
			trimmed.startsWith("//") ||
			trimmed.startsWith("/*") ||
			trimmed.startsWith("*") ||
			trimmed.endsWith("*/") ||
			trimmed.startsWith("import ");

		if (isRemovable) {
			cutFrom = i;
			i--;
		} else {
			break;
		}
	}

	// Splice out the pre-meta zone; the meta line itself stays for removeMetaExport
	return [...lines.slice(0, cutFrom), ...lines.slice(metaLine)].join("\n");
}

/**
 * Escape a string for use inside a RegExp
 */
function escapeForRegex(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Extract the locally-bound identifier(s) from an import statement so we can
 * check whether they're actually used in the component body.
 *
 * Handles:
 *   import Foo from "x"                            => ["Foo"]
 *   import type Foo from "x"                       => ["Foo"]
 *   import { Bar, Baz as B, type Qux } from "x"   => ["Bar", "B", "Qux"]
 *   import Foo, { Bar } from "x"                   => ["Foo", "Bar"]
 *   import * as Ns from "x"                        => ["Ns"]
 */
function extractImportIdentifiers(importText: string): string[] {
	const ids: string[] = [];

	// Namespace import: import * as Foo from "..."
	const nsMatch = importText.match(/import\s+(?:type\s+)?\*\s+as\s+([A-Za-z_$][A-Za-z0-9_$]*)/);
	if (nsMatch) return [nsMatch[1]];

	// Named imports: { Foo, Bar as Baz, type Qux }
	const namedMatch = importText.match(/\{([^}]+)\}/);
	if (namedMatch) {
		for (const part of namedMatch[1].split(",")) {
			const t = part.trim().replace(/^type\s+/, "");
			const asMatch = t.match(/\S+\s+as\s+(\S+)/);
			const name = asMatch ? asMatch[1] : t.split(/\s+/)[0];
			if (name) ids.push(name);
		}
	}

	// Default import (possibly combined with named: `import Foo, { Bar } from "..."`)
	const defaultMatch = importText.match(
		/import\s+(?:type\s+)?([A-Za-z_$][A-Za-z0-9_$]*)\s*(?:,|\s+from)/
	);
	if (defaultMatch) ids.push(defaultMatch[1]);

	return ids.filter(Boolean);
}

/**
 * Remove identifiers from a named import list that appear in `unusedIds`.
 * Returns null when the entire import should be dropped (all identifiers unused).
 */
function removeIdentifiersFromImport(importText: string, unusedIds: Set<string>): string | null {
	const namedMatch = importText.match(/\{([^}]+)\}/);
	if (!namedMatch) return importText;

	const kept = namedMatch[1]
		.split(",")
		.map((p) => p.trim())
		.filter((p) => {
			if (!p) return false;
			const noType = p.replace(/^type\s+/, "");
			const asMatch = noType.match(/\S+\s+as\s+(\S+)/);
			const localName = asMatch ? asMatch[1] : noType.split(/\s+/)[0];
			return localName && !unusedIds.has(localName);
		});

	if (kept.length === 0) return null;

	return importText.replace(/\{[^}]+\}/, `{ ${kept.join(", ")} }`);
}

/**
 * Remove unused imports and sort the remaining ones.
 *
 * Works in three passes:
 *   1. Split the file into the leading import block and the rest of the code.
 *   2. For each import, check whether every bound identifier appears in the
 *      body code. Drop (or prune) imports whose identifiers are all absent.
 *   3. Sort surviving imports by module path and reassemble the file.
 *
 * This is run as the final transform step, after meta and example content has
 * already been removed, so any import that was only referenced inside the meta
 * block — whether it lived at the top of the file or just above the meta —
 * will naturally appear unused here and get dropped.
 */
function cleanupImports(code: string): string {
	const lines = code.split("\n");
	const importBlocks: string[] = [];
	const bodyLines: string[] = [];

	let i = 0;
	let pastImports = false;

	while (i < lines.length) {
		const trimmed = lines[i].trim();

		if (!pastImports) {
			// Blank lines within the import section are discarded; we'll add one back later.
			if (trimmed === "") {
				i++;
				continue;
			}

			if (trimmed.startsWith("import ")) {
				let importText = lines[i];

				// Handle multi-line imports — keep reading until we find `from "...";`
				while (
					!importText.match(/from\s+["'][^"']+["'];?\s*$/) &&
					!importText.match(/^import\s+["'][^"']+["'];?\s*$/) &&
					i < lines.length - 1
				) {
					i++;
					importText += `\n${lines[i]}`;
				}

				importBlocks.push(importText);
				i++;
				continue;
			}

			// First non-blank, non-import line → we are past the import block.
			pastImports = true;
		}

		bodyLines.push(lines[i]);
		i++;
	}

	if (importBlocks.length === 0) return code;

	const bodyCode = bodyLines.join("\n");

	// ------------------------------------------------------------------
	// Remove unused imports (or prune individual unused named identifiers)
	// ------------------------------------------------------------------
	const usedImports: string[] = [];

	for (const importText of importBlocks) {
		// Side-effect import — always keep.
		if (/^import\s+["']/.test(importText)) {
			usedImports.push(importText);
			continue;
		}

		const ids = extractImportIdentifiers(importText);

		if (ids.length === 0) {
			// Namespace or unrecognised shape — keep as-is.
			usedImports.push(importText);
			continue;
		}

		const unusedIds = new Set(
			ids.filter((id) => !new RegExp(`\\b${escapeForRegex(id)}\\b`).test(bodyCode))
		);

		if (unusedIds.size === 0) {
			// All identifiers are used — keep as-is.
			usedImports.push(importText);
			continue;
		}

		if (unusedIds.size === ids.length) {
			// Every identifier is unused — drop the whole import.
			continue;
		}

		// Some identifiers are unused — prune only those from named imports.
		const pruned = removeIdentifiersFromImport(importText, unusedIds);
		if (pruned) usedImports.push(pruned);
	}

	// ------------------------------------------------------------------
	// Sort by module path using Unicode code-point order so that
	// punctuation-prefixed virtual modules (e.g. "~icons/…", code 126)
	// sort AFTER regular lowercase package names — matching Biome's
	// organizeImports behaviour.
	// ------------------------------------------------------------------
	usedImports.sort((a, b) => {
		const ma = (a.match(/from\s+["']([^"']+)["']/) || [])[1] ?? "";
		const mb = (b.match(/from\s+["']([^"']+)["']/) || [])[1] ?? "";
		return ma < mb ? -1 : ma > mb ? 1 : 0;
	});

	// ------------------------------------------------------------------
	// Reassemble: imports → blank line → body (trim leading blank lines)
	// ------------------------------------------------------------------
	const trimmedBody = bodyLines.join("\n").replace(/^\n+/, "");
	return `${usedImports.join("\n")}\n\n${trimmedBody}`;
}

/**
 * Transform a component by replacing imports and inlining utilities.
 * This prepares components for end-user installation by:
 * - Removing pre-meta content (comments/imports between component code and meta export)
 * - Removing the meta export (only used for documentation/showcase)
 * - Removing ComponentMeta import (not needed in user projects)
 * - Removing unused imports, including any top-of-file imports only referenced in meta
 * - Inlining the cn utility function
 * - Rewriting ~icons/lucide/ import paths to the user's chosen icon collection
 */
export function transformComponent(componentCode: string): string {
	let transformedCode = componentCode;

	// Step 1: Remove comments/imports that sit between component code and the meta export
	transformedCode = removePreMetaContent(transformedCode);

	// Step 2: Remove the meta export and its entire value object
	transformedCode = removeMetaExport(transformedCode);

	// Step 3: Remove ComponentMeta type import (users don't need it)
	transformedCode = transformedCode.replace(
		/import\s+type\s*{\s*ComponentMeta\s*}\s*from\s*["'].*?meta["'];?\s*\n?/g,
		""
	);

	// Step 4: Remove the cn import line
	const cnImportMatch = transformedCode.match(
		/^import\s*{\s*cn\s*}\s*from\s*["'][^"']*["'];?\s*\n?/m
	);

	if (cnImportMatch) {
		transformedCode = transformedCode.replace(cnImportMatch[0], "");
	}

	// Step 5: Swap icon collection prefix in all ~icons/lucide/ imports.
	// Components use lucide as the canonical source collection. This single
	// regex replacement is the complete, reliable collection-switching mechanism —
	// every static icon import gets the correct prefix for the user's chosen library.
	const iconLibrary = getIconLibraryFromConfig();
	if (iconLibrary !== "lucide") {
		transformedCode = transformedCode.replace(/~icons\/lucide\//g, `~icons/${iconLibrary}/`);
	}

	// Step 6: Add cn imports after the last existing import
	const lines = transformedCode.split("\n");
	let lastImportIndex = -1;

	for (let i = 0; i < lines.length; i++) {
		const trimmed = lines[i].trim();

		if (trimmed.startsWith("import ")) {
			let currentIndex = i;

			while (currentIndex < lines.length) {
				const currentLine = lines[currentIndex].trim();
				if (currentLine.includes("from")) {
					lastImportIndex = currentIndex;
					break;
				}
				currentIndex++;
			}
		}
	}

	if (lastImportIndex >= 0) {
		const linesArray = transformedCode.split("\n");
		linesArray.splice(lastImportIndex + 1, 0, getCnImports());
		transformedCode = linesArray.join("\n");
		// Account for the 3 lines added by getCnImports
		lastImportIndex += 3;
	}

	// Step 7: Find where to insert the cn function (after all imports)
	const finalLines = transformedCode.split("\n");
	let insertIndex = lastImportIndex + 1;

	while (insertIndex < finalLines.length && finalLines[insertIndex].trim() === "") {
		insertIndex++;
	}

	// Step 8: Insert cn function — one blank line before, one after
	finalLines.splice(insertIndex, 0, getCnFunctionCode(), "");
	transformedCode = finalLines.join("\n");

	// Step 9: Sort imports and remove any that became unused after meta/example removal
	transformedCode = cleanupImports(transformedCode);

	return transformedCode;
}

/**
 * Extract component dependencies from the code
 */
export function extractDependencies(componentCode: string): string[] {
	const dependencies: string[] = [];
	const importRegex = /import\s+(?:.*?from\s+)?["']([^"']+)["']/g;

	for (const match of importRegex.exec(componentCode) ? componentCode.matchAll(importRegex) : []) {
		const packageName = match[1];

		// Skip relative imports and built-in modules
		if (!packageName.startsWith(".") && !packageName.startsWith("/")) {
			// Extract the package name (handle scoped packages)
			const parts = packageName.split("/");
			if (packageName.startsWith("@")) {
				dependencies.push(`${parts[0]}/${parts[1]}`);
			} else {
				dependencies.push(parts[0]);
			}
		}
	}

	return [...new Set(dependencies)];
}

/**
 * Generate installation command for dependencies
 */
export function generateInstallCommand(
	dependencies: string[],
	packageManager: string = "bun"
): string {
	if (dependencies.length === 0) return "";

	const commands = {
		bun: `bun add ${dependencies.join(" ")}`,
		npm: `npm install ${dependencies.join(" ")}`,
		yarn: `yarn add ${dependencies.join(" ")}`,
		pnpm: `pnpm add ${dependencies.join(" ")}`,
	};

	return commands[packageManager as keyof typeof commands] || commands.bun;
}

/**
 * Create component metadata for CLI operations
 */
export interface ComponentMetadata {
	name: string;
	description: string;
	dependencies: string[];
	devDependencies?: string[];
	examples?: string[];
}

/**
 * Transform and prepare a component for user installation
 */
export function prepareComponentForUser(
	componentName: string,
	packageManager: string = "bun"
): {
	code: string;
	dependencies: string[];
	installCommand: string;
	fileName: string;
} {
	const originalCode = readComponentFile(componentName);
	const transformedCode = transformComponent(originalCode);
	const dependencies = extractDependencies(transformedCode);

	return {
		code: transformedCode,
		dependencies,
		installCommand: generateInstallCommand(dependencies, packageManager),
		fileName: `${componentName}.tsx`,
	};
}

/**
 * Validate that a component follows Method UI conventions
 */
export function validateComponent(componentCode: string): {
	valid: boolean;
	errors: string[];
} {
	const errors: string[] = [];

	// Check if component code exists and is not empty
	if (!componentCode || componentCode.trim().length === 0) {
		errors.push("Component code is empty");
		return { valid: false, errors };
	}

	// Check if it's a valid JSX component
	if (
		!componentCode.includes("JSX") &&
		!componentCode.includes("function") &&
		!componentCode.includes("const")
	) {
		errors.push("Component must export a function or const component");
	}

	// Check if it uses proper SolidJS imports
	if (!componentCode.includes("solid-js") && componentCode.includes("JSX")) {
		errors.push('SolidJS components should import from "solid-js"');
	}

	// Check for required Method UI patterns
	if (componentCode.includes("className")) {
		errors.push('Use "class" prop instead of "className" for SolidJS components');
	}

	// Check if component has proper export
	if (!componentCode.includes("export")) {
		errors.push("Component must have an export statement");
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}

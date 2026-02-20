#!/usr/bin/env bun
/**
 * fix-example-imports.ts
 *
 * Scans every component file and moves icon imports that are ONLY referenced
 * inside the `export const meta` block to just above that block, under a
 * marker comment.  The CLI transform (`removeExampleOnlyImports`) already
 * strips any import that appears after the initial import block, so once the
 * imports are relocated the transform will automatically exclude them from
 * installed component files.
 *
 * Usage:
 *   bun scripts/fix-example-imports.ts            # dry-run (prints diffs)
 *   bun scripts/fix-example-imports.ts --write    # write changes to disk
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const WRITE = process.argv.includes("--write");
const COMPONENTS_DIR = join(import.meta.dir, "..", "components");
const MARKER_COMMENT = "// Example-only imports - removed during CLI transform";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract the default-import identifier from a single-line import statement.
 * Handles:
 *   import Foo from "..."
 *   import type Foo from "..."
 * Returns null for named / namespace / side-effect imports.
 */
function extractDefaultIdentifier(importLine: string): string | null {
	const m = importLine.match(/^import\s+(?:type\s+)?(\w+)\s+from\s+/);
	return m ? m[1] : null;
}

/**
 * Find the line index of `export const meta` (the start of the meta block).
 * Returns -1 if not found.
 */
function findMetaLine(lines: string[]): number {
	return lines.findIndex((l) => /^export const meta[:<\s]/.test(l.trim()));
}

/**
 * Determine the last line of the initial import block — i.e. the index of the
 * last line that belongs to the "header" (imports + blank lines + comments)
 * before the first real code line.
 */
function findInitialImportEnd(lines: string[]): number {
	let inMultiline = false;
	let lastImportLine = -1;

	for (let i = 0; i < lines.length; i++) {
		const trimmed = lines[i].trim();

		if (inMultiline) {
			// End of a multi-line import
			if (trimmed.includes("from ") || trimmed.endsWith(";")) {
				lastImportLine = i;
				inMultiline = false;
			}
			continue;
		}

		if (trimmed.startsWith("import ")) {
			lastImportLine = i;
			// Is this a multi-line import (no `from` on the same line)?
			if (!trimmed.includes(" from ") && !trimmed.endsWith(";")) {
				inMultiline = true;
			}
			continue;
		}

		// Blank lines and JSDoc / block comments don't end the import block
		if (
			trimmed === "" ||
			trimmed.startsWith("//") ||
			trimmed.startsWith("/*") ||
			trimmed.startsWith("*")
		) {
			continue;
		}

		// First real code line — stop here
		break;
	}

	return lastImportLine;
}

// ---------------------------------------------------------------------------
// Per-file processing
// ---------------------------------------------------------------------------

interface FileResult {
	path: string;
	changed: boolean;
	movedCount: number;
	newContent?: string;
}

function processFile(filePath: string): FileResult {
	const original = readFileSync(filePath, "utf-8");
	const lines = original.split("\n");

	const metaLine = findMetaLine(lines);
	if (metaLine === -1) {
		return { path: filePath, changed: false, movedCount: 0 };
	}

	const importEnd = findInitialImportEnd(lines);

	// Collect all ~icons imports that live in the initial import block
	const iconImports: Array<{ lineIndex: number; identifier: string; raw: string }> = [];

	for (let i = 0; i <= importEnd; i++) {
		const line = lines[i];
		const trimmed = line.trim();

		if (!trimmed.startsWith("import ")) continue;
		if (!trimmed.includes("~icons/")) continue;

		const id = extractDefaultIdentifier(trimmed);
		if (!id) continue;

		iconImports.push({ lineIndex: i, identifier: id, raw: line });
	}

	if (iconImports.length === 0) {
		return { path: filePath, changed: false, movedCount: 0 };
	}

	// For each icon import decide: is the identifier referenced OUTSIDE the meta block?
	// "outside" means anywhere between the end of the import block and the meta line.
	const _componentBody = lines.slice(0, metaLine).join("\n");

	const exampleOnly: typeof iconImports = [];

	for (const imp of iconImports) {
		// Build a version of the component body that excludes the import line itself
		const bodyWithoutImport = lines
			.slice(0, metaLine)
			.filter((_, idx) => idx !== imp.lineIndex)
			.join("\n");

		const usedAsWord = new RegExp(`\\b${imp.identifier}\\b`).test(bodyWithoutImport);
		if (!usedAsWord) {
			exampleOnly.push(imp);
		}
	}

	if (exampleOnly.length === 0) {
		return { path: filePath, changed: false, movedCount: 0 };
	}

	// Also skip files that already have the marker comment just above the meta —
	// running the script twice would be a no-op anyway, but this makes it obvious.
	const lineBeforeMeta = lines[metaLine - 1]?.trim() ?? "";
	const lineBeforeBeforeMeta = lines[metaLine - 2]?.trim() ?? "";
	const alreadyMarked =
		lineBeforeMeta === MARKER_COMMENT || lineBeforeBeforeMeta === MARKER_COMMENT;

	if (alreadyMarked) {
		return { path: filePath, changed: false, movedCount: 0 };
	}

	// Build the new file content
	const linesToRemove = new Set(exampleOnly.map((imp) => imp.lineIndex));

	const newLines: string[] = [];

	for (let i = 0; i < lines.length; i++) {
		// Skip the example-only import lines at the top
		if (linesToRemove.has(i)) continue;

		// Just before the meta line, inject the marker + moved imports
		if (i === metaLine) {
			// Trim trailing blank lines from what we've built so far
			while (newLines.length > 0 && newLines[newLines.length - 1].trim() === "") {
				newLines.pop();
			}
			newLines.push("");
			newLines.push(MARKER_COMMENT);
			for (const imp of exampleOnly) {
				newLines.push(imp.raw);
			}
			newLines.push("");
		}

		newLines.push(lines[i]);
	}

	// Collapse any runs of 3+ blank lines that the removal might have created
	const collapsed: string[] = [];
	let blankRun = 0;
	for (const line of newLines) {
		if (line.trim() === "") {
			blankRun++;
			if (blankRun <= 2) collapsed.push(line);
		} else {
			blankRun = 0;
			collapsed.push(line);
		}
	}

	const newContent = collapsed.join("\n");

	return {
		path: filePath,
		changed: newContent !== original,
		movedCount: exampleOnly.length,
		newContent,
	};
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const componentFiles = readdirSync(COMPONENTS_DIR)
	.filter((f) => f.endsWith(".tsx"))
	.sort()
	.map((f) => join(COMPONENTS_DIR, f));

console.log(
	`Scanning ${componentFiles.length} component(s) in ${relative(process.cwd(), COMPONENTS_DIR)}/\n`
);

let totalMoved = 0;
let totalFiles = 0;

for (const filePath of componentFiles) {
	const result = processFile(filePath);

	if (!result.changed) continue;

	const rel = relative(process.cwd(), result.path);
	console.log(`  ${WRITE ? "✓" : "~"} ${rel}  (${result.movedCount} import(s) moved)`);

	if (WRITE && result.newContent !== undefined) {
		writeFileSync(result.path, result.newContent, "utf-8");
	}

	totalMoved += result.movedCount;
	totalFiles++;
}

if (totalFiles === 0) {
	console.log("Nothing to change — all components look correct.");
} else if (!WRITE) {
	console.log(`\n${totalFiles} file(s) would be modified (${totalMoved} import(s) moved).`);
	console.log("Run with --write to apply changes.");
} else {
	console.log(`\nDone. Modified ${totalFiles} file(s), moved ${totalMoved} import(s).`);
}

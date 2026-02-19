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
          if (
            pkg.name === "method-ui" &&
            existsSync(join(searchDir, "components"))
          ) {
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
      if (
        existsSync(join(path, "components")) &&
        existsSync(join(path, "package.json"))
      ) {
        try {
          const pkg = JSON.parse(
            readFileSync(join(path, "package.json"), "utf-8"),
          );
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
 * Get the cn function code from templates directory
 * This makes components completely self-contained with no external dependencies
 */
function getCnImports(): string {
  return `import type { ClassValue } from "clsx";
import clsx from "clsx";
import { unoMerge } from "unocss-merge";`;
}

function getCnFunctionCode(): string {
  return `
// Hardcoded cn function - makes this component completely self-contained
function cn(...classLists: ClassValue[]) {
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
    throw new Error(
      `Component "${componentName}" not found at ${componentPath}`,
    );
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
 * Remove example-only imports that appear after component code
 * These are imports placed after the main component definitions but before the meta export
 * They're only used in examples and shouldn't be included in the user's code
 *
 * Strategy: Look for import statements that appear after we've seen at least one
 * component export (export const/function) AND are followed by another comment mentioning
 * "example" or appear in a specific pattern after component definitions.
 */
function removeExampleOnlyImports(code: string): string {
  const lines = code.split("\n");
  const result: string[] = [];

  // First, identify the initial import block (all imports before any code)
  let initialImportEnd = 0;
  let inMultilineImport = false;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    // Track multiline imports
    if (trimmed.startsWith("import ")) {
      inMultilineImport =
        !trimmed.includes(";") &&
        !trimmed.includes('from "') &&
        !trimmed.includes("from '");
    } else if (inMultilineImport) {
      if (
        trimmed.includes(";") ||
        trimmed.includes('from "') ||
        trimmed.includes("from '")
      ) {
        inMultilineImport = false;
      }
    } else if (
      trimmed &&
      !trimmed.startsWith("//") &&
      !trimmed.startsWith("/*") &&
      !trimmed.startsWith("*") &&
      !trimmed.endsWith("*/") &&
      !trimmed.startsWith("import")
    ) {
      // Found first non-import, non-comment line
      initialImportEnd = i;
      break;
    }
  }

  // Now process all lines and remove imports that come after the initial block
  let skipUntilSemicolon = false;
  let skipCommentLines = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // If we're skipping a multiline import
    if (skipUntilSemicolon) {
      if (
        trimmed.includes(";") ||
        trimmed.includes('from "') ||
        trimmed.includes("from '")
      ) {
        skipUntilSemicolon = false;
      }
      continue;
    }

    // If we're past the initial imports and find another import
    if (i > initialImportEnd && trimmed.startsWith("import ")) {
      // Check if the previous lines were comments about examples
      let foundExampleComment = false;
      for (let j = Math.max(0, result.length - 5); j < result.length; j++) {
        const prevLine = result[j];
        if (prevLine?.includes("example") && prevLine.trim().startsWith("//")) {
          foundExampleComment = true;
          skipCommentLines = result.length - j;
          break;
        }
      }

      // Remove the comment lines if this is an example import
      if (foundExampleComment) {
        for (let j = 0; j < skipCommentLines; j++) {
          result.pop();
        }
        // Also remove any empty lines before the comments
        while (result.length > 0 && result[result.length - 1].trim() === "") {
          result.pop();
        }
      }

      // Skip this import line
      skipUntilSemicolon =
        !trimmed.includes(";") &&
        !trimmed.includes('from "') &&
        !trimmed.includes("from '");
      continue;
    }

    result.push(line);
  }

  return result.join("\n");
}

/**
 * Transform a component by replacing imports and inlining utilities
 * This prepares components for end-user installation by:
 * - Removing example-only imports (imports after component code)
 * - Inlining the cn utility function
 * - Removing ComponentMeta import (not needed in user projects)
 * - Removing meta export (only used for documentation/showcase)
 */
export function transformComponent(componentCode: string): string {
  let transformedCode = componentCode;

  // Step 1: Remove example-only imports (must be done before other transformations)
  transformedCode = removeExampleOnlyImports(transformedCode);

  // Step 2: Remove the meta export and its entire value object
  transformedCode = removeMetaExport(transformedCode);

  // Step 3: Remove ComponentMeta type import (users don't need it)
  transformedCode = transformedCode.replace(
    /import\s+type\s*{\s*ComponentMeta\s*}\s*from\s*["'].*?meta["'];?\s*\n?/g,
    "",
  );

  // Step 4: Remove the cn import line
  const cnImportMatch = transformedCode.match(
    /^import\s*{\s*cn\s*}\s*from\s*["'][^"']*["'];?\s*\n?/m,
  );

  if (cnImportMatch) {
    transformedCode = transformedCode.replace(cnImportMatch[0], "");
  }

  // Step 5: Remove icon import
  transformedCode = transformedCode.replace(
    /import\s*{\s*icon\s*}\s*from\s*["'][^"']*["'];?\s*\n?/g,
    "",
  );

  // Step 6: Add cn imports after the last existing import
  const lines = transformedCode.split("\n");
  let lastImportIndex = -1;

  // Find the last import statement
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    // Check if this line contains an import statement
    if (trimmed.startsWith("import ")) {
      // Track this as a potential last import
      let currentIndex = i;

      // Handle multi-line imports - keep going until we find the closing
      while (currentIndex < lines.length) {
        const currentLine = lines[currentIndex].trim();
        if (currentLine.includes("from")) {
          // Found the from clause, this line ends the import
          lastImportIndex = currentIndex;
          break;
        }
        currentIndex++;
      }
    }
  }

  if (lastImportIndex >= 0) {
    const linesArray = transformedCode.split("\n");

    // Add cn imports right after the last import
    linesArray.splice(lastImportIndex + 1, 0, getCnImports());

    transformedCode = linesArray.join("\n");

    // Update lastImportIndex to account for added cn imports (3 lines)
    lastImportIndex += 3;
  }

  // Step 7: Find where to insert function definitions (after all imports)
  // Re-split lines since we've added imports
  const finalLines = transformedCode.split("\n");
  let insertIndex = lastImportIndex + 1;

  // Skip empty lines after imports
  while (
    insertIndex < finalLines.length &&
    finalLines[insertIndex].trim() === ""
  ) {
    insertIndex++;
  }

  // Step 8: Get icon library from user's config and inline the icon function
  const iconLibrary = getIconLibraryFromConfig();
  const iconFunctionCode = `
// Icon helper function - returns UnoCSS icon class for your configured icon library
function icon(name: string): string {
  return \`i-${iconLibrary}-\${name}\`;
}`;

  // Step 9: Insert cn and icon function definitions
  const usesIcon = transformedCode.includes("icon(");

  if (usesIcon) {
    finalLines.splice(
      insertIndex,
      0,
      "",
      getCnFunctionCode(),
      "",
      iconFunctionCode,
      "",
    );
  } else {
    finalLines.splice(insertIndex, 0, "", getCnFunctionCode(), "");
  }

  transformedCode = finalLines.join("\n");

  return transformedCode;
}

/**
 * Extract component dependencies from the code
 */
export function extractDependencies(componentCode: string): string[] {
  const dependencies: string[] = [];
  const importRegex = /import\s+(?:.*?from\s+)?["']([^"']+)["']/g;

  for (const match of importRegex.exec(componentCode)
    ? componentCode.matchAll(importRegex)
    : []) {
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
  packageManager: string = "bun",
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
  packageManager: string = "bun",
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
    errors.push(
      'Use "class" prop instead of "className" for SolidJS components',
    );
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

/**
 * Transform utilities for converting component files to user-ready code
 * This handles inlining the cn function and other transformations needed
 * to make components completely self-contained for end users.
 */

import { readFileSync, existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import type { ClassValue } from "clsx";
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
    } catch (error) {
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
      } catch (error) {
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
        } catch (error) {
          // Continue checking other paths
        }
      }
    }
  }

  return cliDir;
}

/**
 * Get the cn function code from templates directory
 * This makes components completely self-contained with no external dependencies
 */
function getCnFunctionCode(): string {
  const cliDir = findCliDirectory();

  if (!cliDir) {
    // Fallback to hardcoded version if CLI directory not found
    return `import type { ClassValue } from "clsx";
import clsx from "clsx";
import { unoMerge } from "unocss-merge";

// Hardcoded cn function - makes this component completely self-contained
function cn(...classLists: ClassValue[]) {
  return unoMerge(clsx(classLists));
}`;
  }

  const cnPath = join(cliDir, "templates", "cn.ts");

  if (!existsSync(cnPath)) {
    // Fallback to hardcoded version if template file not found
    return `import type { ClassValue } from "clsx";
import clsx from "clsx";
import { unoMerge } from "unocss-merge";

// Hardcoded cn function - makes this component completely self-contained
function cn(...classLists: ClassValue[]) {
  return unoMerge(clsx(classLists));
}`;
  }

  try {
    const cnFileContent = readFileSync(cnPath, "utf-8");
    // Transform the export to a local function declaration
    // Remove comments and extract just the function logic
    const lines = cnFileContent.split("\n");
    const importLines = lines.filter((line) =>
      line.trim().startsWith("import"),
    );
    const exportLine = lines.find((line) => line.includes("export const cn"));

    if (exportLine) {
      // Convert "export const cn = (...args) => body" to "function cn(...args) { return body; }"
      const arrowMatch = exportLine.match(
        /export const cn = \((.*?)\) => (.+);?$/,
      );
      if (arrowMatch) {
        const params = arrowMatch[1];
        const body = arrowMatch[2];
        const functionDeclaration = `function cn(${params}) {\n  return ${body};\n}`;

        return [
          ...importLines,
          "",
          "// Hardcoded cn function - makes this component completely self-contained",
          functionDeclaration,
        ].join("\n");
      }
    }

    // Fallback if parsing fails - try a more robust transformation
    let transformedContent = cnFileContent;

    // Handle the specific case: export const cn = (...args) => body;
    transformedContent = transformedContent.replace(
      /export const cn = \((.*?)\) => ([^;]+);?/,
      "function cn($1) {\n  return $2;\n}",
    );

    // If that didn't work, try the original approach but fix the closing brace
    if (transformedContent.includes("export const cn =")) {
      transformedContent = transformedContent
        .replace(/export const cn = /g, "function cn")
        .replace(/=> /g, "{ return ")
        .replace(/;$/, ""); // Remove trailing semicolon

      // Ensure proper closing brace
      if (!transformedContent.includes("}")) {
        transformedContent = transformedContent + "\n}";
      }
    }

    return transformedContent;
  } catch (error) {
    // Fallback to hardcoded version if reading fails
    return `import type { ClassValue } from "clsx";
import clsx from "clsx";
import { unoMerge } from "unocss-merge";

// Hardcoded cn function - makes this component completely self-contained
function cn(...classLists: ClassValue[]) {
  return unoMerge(clsx(classLists));
}`;
  }
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
  } catch (error) {
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
  } catch (error) {
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
 * Transform a component by replacing imports and inlining utilities
 * This prepares components for end-user installation by:
 * - Inlining the cn utility function
 * - Removing ComponentMeta import (not needed in user projects)
 * - Removing meta export (only used for documentation/showcase)
 */
export function transformComponent(componentCode: string): string {
  let transformedCode = componentCode;

  // Replace the cn import with the function from templates
  transformedCode = transformedCode.replace(
    /import\s*{\s*cn\s*}\s*from\s*["'].*?["'];?\s*\n?/g,
    getCnFunctionCode() + "\n\n",
  );

  // Remove ComponentMeta type import (users don't need it)
  transformedCode = transformedCode.replace(
    /import\s+type\s*{\s*ComponentMeta\s*}\s*from\s*["'].*?meta["'];?\s*\n?/g,
    "",
  );

  // Remove the meta export and its entire value object using proper brace matching
  transformedCode = removeMetaExport(transformedCode);

  return transformedCode;
}

/**
 * Extract component dependencies from the code
 */
export function extractDependencies(componentCode: string): string[] {
  const dependencies: string[] = [];
  const importRegex = /import\s+(?:.*?from\s+)?["']([^"']+)["']/g;

  let match;
  while ((match = importRegex.exec(componentCode)) !== null) {
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

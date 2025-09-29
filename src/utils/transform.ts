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
 * The hardcoded cn function that will be injected into components
 * This makes components completely self-contained with no external dependencies
 */
export const CN_FUNCTION_CODE = `import type { ClassValue } from "clsx";
import clsx from "clsx";
import { unoMerge } from "unocss-merge";

// Hardcoded cn function - makes this component completely self-contained
function cn(...classLists: ClassValue[]) {
  return unoMerge(clsx(classLists));
}`;

/**
 * Get list of available components
 */
export function getAvailableComponents(): string[] {
  // Find the CLI directory - look for where the CLI's components folder is
  let cliDir = process.cwd();

  // If we're in a user project, go up to find the CLI directory
  while (
    !existsSync(join(cliDir, "components")) &&
    cliDir !== dirname(cliDir)
  ) {
    cliDir = dirname(cliDir);
  }

  // If still not found, try relative to this file
  if (!existsSync(join(cliDir, "components"))) {
    cliDir = join(__dirname || ".", "..", "..", "..");
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
  // Find the CLI directory - look for where the CLI's package.json is
  let cliDir = process.cwd();

  // If we're in a user project, go up to find the CLI directory
  while (
    !existsSync(join(cliDir, "components")) &&
    cliDir !== dirname(cliDir)
  ) {
    cliDir = dirname(cliDir);
  }

  // If still not found, try relative to this file
  if (!existsSync(join(cliDir, "components"))) {
    cliDir = join(__dirname || ".", "..", "..", "..");
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
 * Transform a component by replacing imports and inlining utilities
 */
export function transformComponent(componentCode: string): string {
  let transformedCode = componentCode;

  // Replace the cn import with hardcoded function
  transformedCode = transformedCode.replace(
    /import\s*{\s*cn\s*}\s*from\s*["'].*?["'];?\s*\n?/g,
    CN_FUNCTION_CODE + "\n\n",
  );

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

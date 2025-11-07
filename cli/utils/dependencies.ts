import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";
import * as p from "@clack/prompts";
import { getTemplatesDirectory } from "./files.js";

// Types
export type PackageManager = "npm" | "yarn" | "pnpm" | "bun";

export interface ComponentDependency {
  name: string;
  type: "component";
  path: string;
}

export interface PackageDependency {
  name: string;
  type: "package";
  imports: string[];
  version?: string;
  isInstalled?: boolean;
}

export interface DependencyAnalysis {
  componentDependencies: ComponentDependency[];
  packageDependencies: PackageDependency[];
  allDependencies: (ComponentDependency | PackageDependency)[];
}

export interface DependencyTree {
  name: string;
  dependencies: DependencyTree[];
  packageDependencies: PackageDependency[];
  visited?: boolean;
}

export interface InstallationPlan {
  components: string[];
  packages: PackageDependency[];
  hasAnyDependencies: boolean;
}

export interface PackageManagerInfo {
  name: PackageManager;
  lockFile: string;
  installCommand: string;
  addCommand: string;
}

// Constants
export const REQUIRED_PACKAGES = [
  "@ark-ui/solid",
  "@unocss/preset-icons",
  "class-variance-authority",
  "clsx",
  "unocss",
  "unocss-merge",
  "solid-js",
  "solid-motionone",
];

const PACKAGE_MANAGERS: Record<PackageManager, PackageManagerInfo> = {
  bun: {
    name: "bun",
    lockFile: "bun.lockb",
    installCommand: "bun install",
    addCommand: "bun add",
  },
  yarn: {
    name: "yarn",
    lockFile: "yarn.lock",
    installCommand: "yarn install",
    addCommand: "yarn add",
  },
  pnpm: {
    name: "pnpm",
    lockFile: "pnpm-lock.yaml",
    installCommand: "pnpm install",
    addCommand: "pnpm add",
  },
  npm: {
    name: "npm",
    lockFile: "package-lock.json",
    installCommand: "npm install",
    addCommand: "npm install",
  },
};

const IGNORED_IMPORTS = new Set([
  "cn", // Gets replaced with hardcoded function during transformation
]);

const ICON_PACKAGES: Record<string, string> = {
  lucide: "@iconify-json/lucide",
  heroicons: "@iconify-json/heroicons",
  tabler: "@iconify-json/tabler",
  phosphor: "@iconify-json/ph",
};

// Package Manager Detection and Operations
export function detectPackageManager(): PackageManager {
  // Check for lock files (most reliable)
  if (existsSync("bun.lockb") || existsSync("bun.lock")) {
    return "bun";
  }
  if (existsSync("pnpm-lock.yaml")) {
    return "pnpm";
  }
  if (existsSync("yarn.lock")) {
    return "yarn";
  }
  if (existsSync("package-lock.json")) {
    return "npm";
  }

  // Check package.json packageManager field
  try {
    const packageJson = readPackageJson();
    if (packageJson?.packageManager) {
      const pm = packageJson.packageManager.split("@")[0] as PackageManager;
      if (pm in PACKAGE_MANAGERS) {
        return pm;
      }
    }
  } catch {
    // Ignore errors
  }

  // Check user agent (for npm/yarn/pnpm)
  const userAgent = process.env.npm_config_user_agent;
  if (userAgent) {
    if (userAgent.includes("bun")) return "bun";
    if (userAgent.includes("pnpm")) return "pnpm";
    if (userAgent.includes("yarn")) return "yarn";
  }

  // Default fallback
  return "npm";
}

export function installPackages(
  packages: string[],
  options: {
    packageManager?: PackageManager;
    dev?: boolean;
    stdio?: "inherit" | "pipe" | "ignore";
  } = {},
): void {
  if (packages.length === 0) return;

  const pm = getPackageManagerInfo(options.packageManager);
  const devFlag = options.dev ? (pm.name === "npm" ? "--save-dev" : "-D") : "";
  const command = `${pm.addCommand} ${packages.join(" ")} ${devFlag}`.trim();

  execSync(command, {
    stdio: options.stdio || "inherit",
    cwd: process.cwd(),
  });
}

export function getPackageManagerInfo(
  packageManager?: PackageManager,
): PackageManagerInfo {
  return PACKAGE_MANAGERS[packageManager || detectPackageManager()];
}

// Package.json Operations
export function readPackageJson(projectRoot?: string): any | null {
  const packageJsonPath = projectRoot
    ? join(projectRoot, "package.json")
    : "package.json";

  if (!existsSync(packageJsonPath)) {
    return null;
  }

  try {
    const content = readFileSync(packageJsonPath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    p.log.warn(`Failed to parse package.json: ${error}`);
    return null;
  }
}

export function getInstalledPackages(
  projectRoot?: string,
): Record<string, string> {
  const packageJson = readPackageJson(projectRoot);

  if (!packageJson) {
    return {};
  }

  return {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
    ...packageJson.peerDependencies,
  };
}

export function isPackageInstalled(
  packageName: string,
  projectRoot?: string,
): boolean {
  const installedPackages = getInstalledPackages(projectRoot);
  return packageName in installedPackages;
}

// Icon Package Utilities
export function getIconPackages(iconLibrary: string): string[] {
  const packageName = ICON_PACKAGES[iconLibrary] || ICON_PACKAGES.lucide;
  return [packageName];
}

export function getAllRequiredPackages(
  iconLibrary: string = "lucide",
): string[] {
  return [...REQUIRED_PACKAGES, ...getIconPackages(iconLibrary)];
}

// Component Dependency Analysis
function isUtilityImport(importPath: string): boolean {
  const utilityPatterns = [
    /\/utils?\//, // Contains /utils/ or /util/
    /\/lib\//, // Contains /lib/
    /\/helpers?\//, // Contains /helpers/ or /helper/
    /\/(cn|utils|lib|helpers?)(\.[jt]sx?)?$/, // Ends with utility names
  ];

  return utilityPatterns.some((pattern) => pattern.test(importPath));
}

function extractComponentNameFromPath(importPath: string): string | null {
  // Remove ./ or ../
  const cleanPath = importPath.replace(/^\.\.?\//, "");

  // Remove file extension if present
  const withoutExt = cleanPath.replace(/\.(tsx?|jsx?)$/, "");

  // Get the last segment (component name)
  const segments = withoutExt.split("/");
  return segments[segments.length - 1];
}

function getPackageName(source: string): string {
  const parts = source.split("/");

  if (source.startsWith("@")) {
    // Scoped package like @ark-ui/solid
    return parts.slice(0, 2).join("/");
  } else {
    // Regular package like solid-js
    return parts[0];
  }
}

function extractImportedNames(importStatement: string): string[] {
  const imports: string[] = [];

  // Default import: import Button from "..."
  const defaultImportMatch = importStatement.match(
    /import\s+([^{,\s]+)\s+from/,
  );
  if (defaultImportMatch) {
    imports.push(defaultImportMatch[1].trim());
  }

  // Named imports: import { Button, Input } from "..."
  const namedImportsMatch = importStatement.match(/import\s+{([^}]+)}\s+from/);
  if (namedImportsMatch) {
    const namedImports = namedImportsMatch[1]
      .split(",")
      .map((name) =>
        name
          .trim()
          .split(/\s+as\s+/)[0]
          .trim(),
      )
      .filter((name) => name.length > 0);
    imports.push(...namedImports);
  }

  // Namespace import: import * as Utils from "..."
  const namespaceImportMatch = importStatement.match(
    /import\s+\*\s+as\s+(\w+)\s+from/,
  );
  if (namespaceImportMatch) {
    imports.push(namespaceImportMatch[1]);
  }

  return imports;
}

export function analyzeComponentDependencies(
  filePath: string,
): DependencyAnalysis {
  if (!existsSync(filePath)) {
    throw new Error(`Component file not found: ${filePath}`);
  }

  const content = readFileSync(filePath, "utf-8");
  const componentDependencies: ComponentDependency[] = [];
  const packageDependencies: PackageDependency[] = [];

  // Regex patterns for different import styles
  const importPatterns = [
    /import\s+(?:{[^}]*}|[^{,\s]+|\*\s+as\s+\w+)\s+from\s+['"`]([^'"`]+)['"`]/g,
    /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
  ];

  for (const pattern of importPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const source = match[1];

      if (!source) continue;

      // Check if it's a relative import (component dependency)
      if (source.startsWith("./") || source.startsWith("../")) {
        const componentName = extractComponentNameFromPath(source);

        if (
          componentName &&
          !IGNORED_IMPORTS.has(componentName) &&
          !isUtilityImport(source) &&
          !componentDependencies.some((d) => d.name === componentName)
        ) {
          componentDependencies.push({
            name: componentName,
            type: "component",
            path: source,
          });
        }
      } else if (!source.startsWith("/") && !source.startsWith(".")) {
        // External package dependency
        const packageName = getPackageName(source);
        const imports = extractImportedNames(match[0]);

        // Filter out ignored imports
        const filteredImports = imports.filter(
          (imp) => !IGNORED_IMPORTS.has(imp),
        );

        // Only add package if it has non-ignored imports
        if (filteredImports.length > 0) {
          const existingPackage = packageDependencies.find(
            (p) => p.name === packageName,
          );
          if (existingPackage) {
            existingPackage.imports.push(...filteredImports);
            existingPackage.imports = [...new Set(existingPackage.imports)];
          } else {
            packageDependencies.push({
              name: packageName,
              type: "package",
              imports: filteredImports,
            });
          }
        }
      }
    }
  }

  return {
    componentDependencies,
    packageDependencies,
    allDependencies: [...componentDependencies, ...packageDependencies],
  };
}

// Component File Operations
function findComponentFile(
  componentName: string,
  componentsDir: string,
): string | null {
  const possibleExtensions = [".tsx", ".ts", ".jsx", ".js"];

  for (const ext of possibleExtensions) {
    const filePath = join(componentsDir, `${componentName}${ext}`);
    if (existsSync(filePath)) {
      return filePath;
    }
  }

  return null;
}

export function isComponentInstalled(
  componentName: string,
  componentsPath: string,
): boolean {
  return findComponentFile(componentName, componentsPath) !== null;
}

// Registry Operations

/**
 * Load component dependencies from registry.json
 * This provides accurate dependency information excluding example-only imports
 */
function getComponentDependenciesFromRegistry(
  componentName: string,
): { components: string[]; packages: string[] } | null {
  try {
    // Look for registry.json in the templates directory
    const templatesDir = getTemplatesDirectory();
    const registryPath = join(templatesDir, "lib", "registry.json");

    if (!existsSync(registryPath)) {
      return null;
    }

    const registryContent = readFileSync(registryPath, "utf-8");
    const registry = JSON.parse(registryContent);

    const componentMetadata = registry.componentMetadata?.[componentName];

    if (!componentMetadata || !componentMetadata.dependencies) {
      return null;
    }

    return {
      components: componentMetadata.dependencies.components || [],
      packages: componentMetadata.dependencies.packages || [],
    };
  } catch (error) {
    // If registry is not available or malformed, return null to fall back to file analysis
    return null;
  }
}

// Dependency Tree Operations
export function buildDependencyTree(
  componentName: string,
  componentsDir: string,
  visited = new Set<string>(),
): DependencyTree {
  // Prevent infinite recursion
  if (visited.has(componentName)) {
    return {
      name: componentName,
      dependencies: [],
      packageDependencies: [],
      visited: true,
    };
  }

  visited.add(componentName);

  // Try to get dependencies from registry first (this excludes example-only dependencies)
  const registryDeps = getComponentDependenciesFromRegistry(componentName);

  if (registryDeps) {
    // Use registry data - this is more accurate and excludes example dependencies
    const dependencyTrees: DependencyTree[] = [];

    for (const depName of registryDeps.components) {
      const subTree = buildDependencyTree(
        depName,
        componentsDir,
        new Set(visited),
      );
      dependencyTrees.push(subTree);
    }

    const packageDependencies: PackageDependency[] = registryDeps.packages.map(
      (pkg) => ({
        name: pkg,
        type: "package" as const,
        imports: [],
      }),
    );

    return {
      name: componentName,
      dependencies: dependencyTrees,
      packageDependencies,
    };
  }

  // Fallback to file analysis if registry is not available
  const componentPath = findComponentFile(componentName, componentsDir);
  if (!componentPath) {
    return {
      name: componentName,
      dependencies: [],
      packageDependencies: [],
    };
  }

  const analysis = analyzeComponentDependencies(componentPath);

  // Recursively analyze component dependencies
  const dependencyTrees: DependencyTree[] = [];

  for (const dep of analysis.componentDependencies) {
    const subTree = buildDependencyTree(
      dep.name,
      componentsDir,
      new Set(visited),
    );
    dependencyTrees.push(subTree);
  }

  return {
    name: componentName,
    dependencies: dependencyTrees,
    packageDependencies: analysis.packageDependencies,
  };
}

export function flattenDependencyTree(tree: DependencyTree): {
  components: string[];
  packages: PackageDependency[];
} {
  const components = new Set<string>();
  const packages = new Map<string, PackageDependency>();

  function traverse(node: DependencyTree) {
    // Don't include the root component itself in dependencies
    if (node.name !== tree.name) {
      components.add(node.name);
    }

    // Add package dependencies
    node.packageDependencies.forEach((pkg) => {
      if (packages.has(pkg.name)) {
        const existing = packages.get(pkg.name)!;
        existing.imports = [...new Set([...existing.imports, ...pkg.imports])];
      } else {
        packages.set(pkg.name, { ...pkg });
      }
    });

    // Recursively traverse dependencies
    node.dependencies.forEach((dep) => {
      if (!dep.visited) {
        traverse(dep);
      }
    });
  }

  traverse(tree);

  return {
    components: Array.from(components),
    packages: Array.from(packages.values()),
  };
}

// Consolidated Dependency Resolution
export function getMissingDependencies(
  componentNames: string[],
  projectRoot: string,
  componentsPath: string,
  componentsSourceDir: string,
): {
  missingComponents: string[];
  missingPackages: PackageDependency[];
  installedComponents: string[];
  installedPackages: PackageDependency[];
} {
  const allMissingComponents = new Set<string>();
  const allMissingPackages = new Map<string, PackageDependency>();
  const allInstalledComponents = new Set<string>();
  const allInstalledPackages = new Map<string, PackageDependency>();

  // Analyze each requested component
  for (const componentName of componentNames) {
    const tree = buildDependencyTree(componentName, componentsSourceDir);
    const flattened = flattenDependencyTree(tree);

    // Check component dependencies
    flattened.components.forEach((comp) => {
      if (isComponentInstalled(comp, componentsPath)) {
        allInstalledComponents.add(comp);
      } else {
        allMissingComponents.add(comp);
      }
    });

    // Check package dependencies
    flattened.packages.forEach((pkg) => {
      const isInstalled = isPackageInstalled(pkg.name, projectRoot);
      const targetMap = isInstalled ? allInstalledPackages : allMissingPackages;

      if (targetMap.has(pkg.name)) {
        const existing = targetMap.get(pkg.name)!;
        existing.imports = [...new Set([...existing.imports, ...pkg.imports])];
      } else {
        targetMap.set(pkg.name, { ...pkg, isInstalled });
      }
    });
  }

  return {
    missingComponents: Array.from(allMissingComponents),
    missingPackages: Array.from(allMissingPackages.values()),
    installedComponents: Array.from(allInstalledComponents),
    installedPackages: Array.from(allInstalledPackages.values()),
  };
}

// Legacy Support Functions (for backward compatibility)
export function getMissingPackages(
  requiredPackages: string[] = REQUIRED_PACKAGES,
): string[] {
  const installedPackages = getInstalledPackages();
  return requiredPackages.filter(
    (packageName) => !installedPackages[packageName],
  );
}

export function getMissingPackagesWithIcons(
  iconLibrary: string = "lucide",
): string[] {
  const allRequired = getAllRequiredPackages(iconLibrary);
  return getMissingPackages(allRequired);
}

export function formatPackageList(
  packages: string[],
  prefix: string = "  -",
): string {
  return packages.map((pkg) => `${prefix} ${pkg}`).join("\n");
}

export function isPackageManagerAvailable(
  packageManager: PackageManager,
): boolean {
  try {
    const info = getPackageManagerInfo(packageManager);
    // Try to get version to check if package manager is available
    execSync(`${packageManager} --version`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export function areAllPackagesInstalled(
  requiredPackages: string[] = REQUIRED_PACKAGES,
): boolean {
  const missingPackages = getMissingPackages(requiredPackages);
  return missingPackages.length === 0;
}

export function validatePackageJson(): { valid: boolean; error?: string } {
  if (!existsSync("package.json")) {
    return {
      valid: false,
      error:
        "No package.json found. Please run this command in a project with a package.json file.",
    };
  }

  const packageJson = readPackageJson();
  if (!packageJson) {
    return {
      valid: false,
      error: "Failed to parse package.json",
    };
  }

  return { valid: true };
}

export function checkPackageCompatibility(): {
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];

  const installedPackages = getInstalledPackages();

  // Check for SolidJS version compatibility
  if (installedPackages["solid-js"]) {
    const version = installedPackages["solid-js"];
    const majorVersion = parseInt(version.replace(/^[\^~]/, "").split(".")[0]);

    if (majorVersion < 1) {
      warnings.push(
        `SolidJS version ${version} detected. Method UI requires SolidJS 1.x or higher for optimal compatibility.`,
      );
    }
  }

  // Check for UnoCSS compatibility
  if (installedPackages["unocss"]) {
    const version = installedPackages["unocss"];
    const majorVersion = parseInt(version.replace(/^[\^~]/, "").split(".")[0]);

    if (majorVersion < 0.55) {
      warnings.push(
        `UnoCSS version ${version} detected. Consider updating to 0.55+ for better compatibility.`,
      );
    }
  }

  // Check for conflicting CSS frameworks
  const conflictingPackages = [
    "tailwindcss",
    "bootstrap",
    "bulma",
    "foundation-sites",
  ];

  const conflicts = conflictingPackages.filter((pkg) => installedPackages[pkg]);
  if (conflicts.length > 0) {
    warnings.push(
      `Conflicting CSS frameworks detected: ${conflicts.join(", ")}. This may cause style conflicts with Method UI components.`,
    );
  }

  return { warnings, errors };
}

// Re-export from files.ts for convenience
export { getTemplatesDirectory };

// Advanced Dependency Installation System
export interface InstallationResult {
  success: boolean;
  installedComponents: string[];
  installedPackages: string[];
  errors: string[];
}

/**
 * Display installation plan to user and get confirmation
 */
async function displayInstallationPlan(
  missingComponents: string[],
  missingPackages: PackageDependency[],
): Promise<boolean> {
  if (missingComponents.length === 0 && missingPackages.length === 0) {
    return true;
  }

  p.log.warn("Additional dependencies required:");

  if (missingComponents.length > 0) {
    p.log.step("Components to install:");
    missingComponents.forEach((component) => {
      p.log.message(`  • ${component}`);
    });
  }

  if (missingPackages.length > 0) {
    p.log.step("Packages to install:");
    missingPackages.forEach((pkg) => {
      const imports =
        pkg.imports.length > 0 ? ` (${pkg.imports.join(", ")})` : "";
      p.log.message(`  • ${pkg.name}${imports}`);
    });
  }

  const shouldInstall = await p.confirm({
    message: "Would you like to install these dependencies?",
    initialValue: true,
  });

  if (p.isCancel(shouldInstall)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  return shouldInstall;
}

/**
 * Install components by copying them to the project
 */
async function installComponents(
  componentNames: string[],
  projectRoot: string,
  componentsPath: string,
): Promise<{
  success: boolean;
  installed: string[];
  errors: string[];
}> {
  if (componentNames.length === 0) {
    return { success: true, installed: [], errors: [] };
  }

  const { prepareComponentForUser, validateComponent } = await import(
    "./transform.js"
  );
  const { safeWriteFile } = await import("./files.js");
  const { transformTypeScriptToJavaScript } = await import("./typescript.js");
  const { readComponentsConfig, isTypeScriptProject } = await import(
    "./config.js"
  );
  const { join } = await import("path");
  const { existsSync } = await import("fs");

  const installed: string[] = [];
  const errors: string[] = [];
  const packageManager = detectPackageManager();
  const config = readComponentsConfig();
  const isTypeScript = isTypeScriptProject(config);

  for (const componentName of componentNames) {
    try {
      const result = prepareComponentForUser(componentName, packageManager);

      let finalCode = result.code;
      let finalFileName = result.fileName;

      // Transform to JavaScript if project is JavaScript-based
      if (!isTypeScript) {
        finalCode = transformTypeScriptToJavaScript(finalCode);
        finalFileName = finalFileName.replace(".tsx", ".jsx");
      }

      // Validate the transformed component
      const validation = validateComponent(finalCode);
      if (!validation.valid) {
        errors.push(
          `${componentName}: Validation failed: ${validation.errors.join(", ")}`,
        );
        continue;
      }

      const outputPath = join(projectRoot, componentsPath, finalFileName);

      // Check if component already exists
      if (existsSync(outputPath)) {
        const shouldOverwrite = await p.confirm({
          message: `Component "${componentName}" already exists. Overwrite?`,
          initialValue: false,
        });

        if (p.isCancel(shouldOverwrite)) {
          p.cancel("Operation cancelled.");
          process.exit(0);
        }

        if (!shouldOverwrite) {
          errors.push(`${componentName}: Overwrite declined`);
          continue;
        }
      }

      safeWriteFile(outputPath, finalCode);
      installed.push(componentName);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      errors.push(`${componentName}: ${errorMessage}`);
    }
  }

  return {
    success: errors.length === 0,
    installed,
    errors,
  };
}

/**
 * Main function to handle dependency resolution and installation
 */
export async function installWithDependencies(
  componentNames: string[],
): Promise<InstallationResult> {
  const { getProjectRoot } = await import("./project.js");
  const { readComponentsConfig, getComponentsPath } = await import(
    "./config.js"
  );
  const { getTemplatesDirectory } = await import("./files.js");

  const projectRoot = getProjectRoot();
  const config = readComponentsConfig();

  if (!config) {
    throw new Error(
      "No components.json found. Please run 'method init' first.",
    );
  }

  const componentsPath = getComponentsPath(config);

  // Get components source directory from CLI package
  const templatesDir = getTemplatesDirectory();
  const componentsSourceDir = templatesDir.replace("templates", "components");

  // Analyze dependencies
  const missing = getMissingDependencies(
    componentNames,
    projectRoot,
    componentsPath,
    componentsSourceDir,
  );

  // If no dependencies, proceed directly with component installation
  if (
    missing.missingComponents.length === 0 &&
    missing.missingPackages.length === 0
  ) {
    p.log.step("Installing components...");
    const componentResult = await installComponents(
      componentNames,
      projectRoot,
      componentsPath,
    );

    return {
      success: componentResult.success,
      installedComponents: componentResult.installed,
      installedPackages: [],
      errors: componentResult.errors,
    };
  }

  // Show plan and get user confirmation
  const shouldProceed = await displayInstallationPlan(
    missing.missingComponents,
    missing.missingPackages,
  );

  if (!shouldProceed) {
    p.log.warn("Installation cancelled by user");
    return {
      success: false,
      installedComponents: [],
      installedPackages: [],
      errors: ["Installation cancelled by user"],
    };
  }

  const result: InstallationResult = {
    success: true,
    installedComponents: [],
    installedPackages: [],
    errors: [],
  };

  // Install packages first
  if (missing.missingPackages.length > 0) {
    p.log.step("Installing packages...");
    try {
      const packageNames = missing.missingPackages.map((pkg) => pkg.name);
      const packageManager = detectPackageManager();
      installPackages(packageNames, { packageManager });
      result.installedPackages = packageNames;
      p.log.success(`Installed ${packageNames.length} package(s)`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      result.success = false;
      result.errors.push(`Package installation failed: ${errorMessage}`);
      return result; // Don't proceed with components if packages failed
    }
  }

  // Install dependency components first, then requested components
  const allComponentsToInstall = [
    ...missing.missingComponents,
    ...componentNames,
  ];
  const uniqueComponents = [...new Set(allComponentsToInstall)];

  if (uniqueComponents.length > 0) {
    p.log.step("Installing components...");
    const componentResult = await installComponents(
      uniqueComponents,
      projectRoot,
      componentsPath,
    );

    result.installedComponents = componentResult.installed;

    if (componentResult.success) {
      p.log.success(
        `Successfully installed ${componentResult.installed.length} component(s)`,
      );
    } else {
      result.success = false;
      result.errors.push(...componentResult.errors);

      if (componentResult.installed.length > 0) {
        p.log.success(
          `Installed ${componentResult.installed.length} component(s)`,
        );
      }

      if (componentResult.errors.length > 0) {
        p.log.error("Some components failed to install:");
        componentResult.errors.forEach((error) => p.log.error(`  ${error}`));
      }
    }
  }

  return result;
}

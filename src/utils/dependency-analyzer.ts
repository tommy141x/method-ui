import { readFileSync, existsSync } from "fs";
import { join } from "path";

export interface ComponentDependency {
  name: string;
  type: "component";
  path: string;
}

export interface PackageDependency {
  name: string;
  type: "package";
  imports: string[];
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

/**
 * Parse a component file to extract import dependencies using regex
 */
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
    // import { Button } from "./button";
    // import Button from "./button";
    // import * as Button from "./button";
    /import\s+(?:{[^}]*}|[^{,\s]+|\*\s+as\s+\w+)\s+from\s+['"`]([^'"`]+)['"`]/g,
    // import("./button")
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

        // Check if this package is already in the list
        const existingPackage = packageDependencies.find(
          (p) => p.name === packageName,
        );
        if (existingPackage) {
          // Add imports to existing package
          existingPackage.imports.push(...imports);
          existingPackage.imports = [...new Set(existingPackage.imports)]; // Remove duplicates
        } else {
          packageDependencies.push({
            name: packageName,
            type: "package",
            imports: imports,
          });
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

/**
 * Extract imported names from an import statement using regex
 */
function extractImportedNames(importStatement: string): string[] {
  const imports: string[] = [];

  // Handle different import patterns
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

/**
 * Extract component name from relative import path
 */
function extractComponentNameFromPath(importPath: string): string | null {
  // Remove ./ or ../
  const cleanPath = importPath.replace(/^\.\.?\//, "");

  // Remove file extension if present
  const withoutExt = cleanPath.replace(/\.(tsx?|jsx?)$/, "");

  // Get the last segment (component name)
  const segments = withoutExt.split("/");
  return segments[segments.length - 1];
}

/**
 * Extract package name from import source (handle scoped packages)
 */
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

/**
 * Build a complete dependency tree for a component, including nested dependencies
 */
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

/**
 * Find component file in the components directory
 */
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

/**
 * Flatten dependency tree to get all unique dependencies
 */
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

/**
 * Check if a package is already installed in the project
 */
export function isPackageInstalled(
  packageName: string,
  projectRoot: string,
): boolean {
  try {
    const packageJsonPath = join(projectRoot, "package.json");
    if (!existsSync(packageJsonPath)) {
      return false;
    }

    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
      ...packageJson.peerDependencies,
    };

    return packageName in allDeps;
  } catch (error) {
    return false;
  }
}

/**
 * Check if a component is already installed in the project
 */
export function isComponentInstalled(
  componentName: string,
  componentsPath: string,
): boolean {
  return findComponentFile(componentName, componentsPath) !== null;
}

/**
 * Get missing dependencies that need to be installed
 */
export function getMissingDependencies(
  tree: DependencyTree,
  projectRoot: string,
  componentsPath: string,
): {
  missingComponents: string[];
  missingPackages: PackageDependency[];
} {
  const flattened = flattenDependencyTree(tree);

  const missingComponents = flattened.components.filter(
    (component) => !isComponentInstalled(component, componentsPath),
  );

  const missingPackages = flattened.packages.filter(
    (pkg) => !isPackageInstalled(pkg.name, projectRoot),
  );

  return {
    missingComponents,
    missingPackages,
  };
}

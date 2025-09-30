import { consola } from "consola";
import { yellow, cyan, green, red } from "yoctocolors";
import {
  DependencyTree,
  getMissingDependencies,
  PackageDependency,
  buildDependencyTree,
} from "./dependency-analyzer.js";
import {
  detectPackageManager,
  installPackages as installPackagesFromPM,
} from "./package-manager.js";
import { readComponentsConfig, getComponentsPath } from "./config.js";
import { getProjectRoot } from "./project.js";
import { prepareComponentForUser } from "./transform.js";
import { safeWriteFile } from "./files.js";
import { join } from "path";
import { existsSync } from "fs";

export interface InstallationPlan {
  components: string[];
  packages: PackageDependency[];
  hasAnyDependencies: boolean;
}

export interface InstallationResult {
  success: boolean;
  installedComponents: string[];
  installedPackages: string[];
  errors: string[];
}

/**
 * Analyze dependencies for components and create an installation plan
 */
export async function createInstallationPlan(
  componentNames: string[],
  projectRoot: string,
  componentsPath: string,
): Promise<InstallationPlan> {
  const allMissingComponents = new Set<string>();
  const allMissingPackages = new Map<string, PackageDependency>();

  // Analyze each requested component
  for (const componentName of componentNames) {
    // Get the components directory from the CLI package
    const { getTemplatesDirectory } = await import("./files.js");
    const templatesDir = getTemplatesDirectory();
    const componentsDir = templatesDir.replace("templates", "components");

    const tree = buildDependencyTree(componentName, componentsDir);
    const missing = getMissingDependencies(tree, projectRoot, componentsPath);

    // Add missing components
    missing.missingComponents.forEach((comp) => allMissingComponents.add(comp));

    // Add missing packages (merge imports for same package)
    missing.missingPackages.forEach((pkg) => {
      if (allMissingPackages.has(pkg.name)) {
        const existing = allMissingPackages.get(pkg.name)!;
        existing.imports = [...new Set([...existing.imports, ...pkg.imports])];
      } else {
        allMissingPackages.set(pkg.name, { ...pkg });
      }
    });
  }

  return {
    components: Array.from(allMissingComponents),
    packages: Array.from(allMissingPackages.values()),
    hasAnyDependencies:
      allMissingComponents.size > 0 || allMissingPackages.size > 0,
  };
}

/**
 * Display installation plan to user and get confirmation
 */
export async function displayInstallationPlan(
  plan: InstallationPlan,
): Promise<boolean> {
  if (!plan.hasAnyDependencies) {
    return true;
  }

  consola.log("");
  consola.log(`${yellow("!")} Additional dependencies required:`);
  consola.log("");

  if (plan.components.length > 0) {
    consola.log(`${cyan("Components to install:")}`);
    plan.components.forEach((component) => {
      consola.log(`  • ${component}`);
    });
    consola.log("");
  }

  if (plan.packages.length > 0) {
    consola.log(`${cyan("Packages to install:")}`);
    plan.packages.forEach((pkg) => {
      const imports =
        pkg.imports.length > 0 ? ` (${pkg.imports.join(", ")})` : "";
      consola.log(`  • ${pkg.name}${imports}`);
    });
    consola.log("");
  }

  return await consola.prompt("Would you like to install these dependencies?", {
    type: "confirm",
    initial: true,
  });
}

/**
 * Install packages using the detected package manager
 */
export async function installPackages(packages: PackageDependency[]): Promise<{
  success: boolean;
  installed: string[];
  errors: string[];
}> {
  if (packages.length === 0) {
    return { success: true, installed: [], errors: [] };
  }

  const packageNames = packages.map((pkg) => pkg.name);
  const packageManager = detectPackageManager();

  try {
    installPackagesFromPM(packageNames, { packageManager });
    return {
      success: true,
      installed: packageNames,
      errors: [],
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      installed: [],
      errors: [errorMessage],
    };
  }
}

/**
 * Install components by copying them to the project
 */
export async function installComponents(
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

  const installed: string[] = [];
  const errors: string[] = [];
  const packageManager = detectPackageManager();

  for (const componentName of componentNames) {
    try {
      const result = prepareComponentForUser(componentName, packageManager);
      const outputPath = join(projectRoot, componentsPath, result.fileName);

      // Check if component already exists
      if (existsSync(outputPath)) {
        const shouldOverwrite = await consola.prompt(
          `Component ${componentName} already exists. Overwrite?`,
          {
            type: "confirm",
            initial: false,
          },
        );

        if (!shouldOverwrite) {
          errors.push(`${componentName}: Overwrite declined`);
          continue;
        }
      }

      safeWriteFile(outputPath, result.code);
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
 * Execute full installation plan with dependencies
 */
export async function executeInstallationPlan(
  plan: InstallationPlan,
  projectRoot: string,
  componentsPath: string,
): Promise<InstallationResult> {
  const result: InstallationResult = {
    success: true,
    installedComponents: [],
    installedPackages: [],
    errors: [],
  };

  // Install packages first
  if (plan.packages.length > 0) {
    consola.log(`${cyan("Installing packages...")}`);
    const packageResult = await installPackages(plan.packages);

    if (packageResult.success) {
      result.installedPackages = packageResult.installed;
      consola.success(`Installed ${packageResult.installed.length} package(s)`);
    } else {
      result.success = false;
      result.errors.push(...packageResult.errors);
      consola.error("Failed to install packages:");
      packageResult.errors.forEach((error) => consola.error(`  ${error}`));
      return result; // Don't proceed with components if packages failed
    }
  }

  // Install components
  if (plan.components.length > 0) {
    consola.log(`${cyan("Installing components...")}`);
    const componentResult = await installComponents(
      plan.components,
      projectRoot,
      componentsPath,
    );

    result.installedComponents = componentResult.installed;

    if (componentResult.success) {
      consola.success(
        `Installed ${componentResult.installed.length} component(s)`,
      );
    } else {
      result.success = false;
      result.errors.push(...componentResult.errors);

      if (componentResult.installed.length > 0) {
        consola.success(
          `Installed ${componentResult.installed.length} component(s)`,
        );
      }

      if (componentResult.errors.length > 0) {
        consola.error("Some components failed to install:");
        componentResult.errors.forEach((error) => consola.error(`  ${error}`));
      }
    }
  }

  return result;
}

/**
 * Main function to handle dependency resolution and installation
 */
export async function installWithDependencies(
  componentNames: string[],
): Promise<InstallationResult> {
  const projectRoot = getProjectRoot();
  const config = readComponentsConfig();

  if (!config) {
    throw new Error(
      "No components.json found. Please run 'method init' first.",
    );
  }

  const componentsPath = getComponentsPath(config);

  // Create installation plan
  const plan = await createInstallationPlan(
    componentNames,
    projectRoot,
    componentsPath,
  );

  // If no dependencies, proceed directly
  if (!plan.hasAnyDependencies) {
    return executeInstallationPlan(plan, projectRoot, componentsPath);
  }

  // Show plan and get user confirmation
  const shouldProceed = await displayInstallationPlan(plan);

  if (!shouldProceed) {
    consola.warn("Installation cancelled by user");
    return {
      success: false,
      installedComponents: [],
      installedPackages: [],
      errors: ["Installation cancelled by user"],
    };
  }

  // Execute the installation plan
  return executeInstallationPlan(plan, projectRoot, componentsPath);
}

/**
 * Display dependency tree for debugging/information purposes
 */
export function displayDependencyTree(
  componentName: string,
  tree: DependencyTree,
  indent = 0,
): void {
  const prefix = "  ".repeat(indent);
  const icon = indent === 0 ? "🎯" : "└─";

  consola.log(`${prefix}${icon} ${componentName}`);

  if (tree.packageDependencies.length > 0) {
    tree.packageDependencies.forEach((pkg) => {
      const imports =
        pkg.imports.length > 0 ? ` (${pkg.imports.join(", ")})` : "";
      consola.log(`${prefix}  📦 ${pkg.name}${imports}`);
    });
  }

  if (tree.dependencies.length > 0) {
    tree.dependencies.forEach((dep) => {
      if (!dep.visited) {
        displayDependencyTree(dep.name, dep, indent + 1);
      } else {
        consola.log(`${prefix}  🔄 ${dep.name} (circular reference)`);
      }
    });
  }
}

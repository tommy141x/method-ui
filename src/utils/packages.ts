import { existsSync, readFileSync } from "fs";
import { consola } from "consola";

export const REQUIRED_PACKAGES = [
  "@ark-ui/solid",
  "@unocss/reset",
  "@unocss/preset-icons",
  "class-variance-authority",
  "clsx",
  "unocss",
  "unocss-merge",
  "solid-js",
  "solid-motionone",
];

/**
 * Get required icon packages based on icon library
 */
export function getIconPackages(iconLibrary: string): string[] {
  const iconPackages: Record<string, string> = {
    lucide: "@iconify-json/lucide",
    heroicons: "@iconify-json/heroicons",
    tabler: "@iconify-json/tabler",
    phosphor: "@iconify-json/ph",
  };

  const packageName = iconPackages[iconLibrary] || iconPackages.lucide;
  return [packageName];
}

/**
 * Get all required packages including icon library
 */
export function getAllRequiredPackages(
  iconLibrary: string = "lucide",
): string[] {
  return [...REQUIRED_PACKAGES, ...getIconPackages(iconLibrary)];
}

export interface PackageInfo {
  name: string;
  version?: string;
  isInstalled: boolean;
}

export interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  packageManager?: string;
}

/**
 * Reads and parses package.json from the current directory
 */
export function readPackageJson(): PackageJson | null {
  if (!existsSync("package.json")) {
    return null;
  }

  try {
    const content = readFileSync("package.json", "utf-8");
    return JSON.parse(content) as PackageJson;
  } catch (error) {
    consola.error("Failed to parse package.json:", error);
    return null;
  }
}

/**
 * Gets all installed packages from package.json
 */
export function getInstalledPackages(): Record<string, string> {
  const packageJson = readPackageJson();

  if (!packageJson) {
    return {};
  }

  return {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
    ...packageJson.peerDependencies,
  };
}

/**
 * Checks if a specific package is installed
 */
export function isPackageInstalled(packageName: string): boolean {
  const installedPackages = getInstalledPackages();
  return packageName in installedPackages;
}

/**
 * Gets information about a specific package
 */
export function getPackageInfo(packageName: string): PackageInfo {
  const installedPackages = getInstalledPackages();
  const isInstalled = packageName in installedPackages;

  return {
    name: packageName,
    version: isInstalled ? installedPackages[packageName] : undefined,
    isInstalled,
  };
}

/**
 * Checks which required packages are missing
 */
export function getMissingPackages(
  requiredPackages: string[] = REQUIRED_PACKAGES,
): string[] {
  const installedPackages = getInstalledPackages();

  return requiredPackages.filter(
    (packageName) => !installedPackages[packageName],
  );
}

/**
 * Get missing packages including icon library packages
 */
export function getMissingPackagesWithIcons(
  iconLibrary: string = "lucide",
): string[] {
  const allRequired = getAllRequiredPackages(iconLibrary);
  return getMissingPackages(allRequired);
}

/**
 * Gets detailed information about all required packages
 */
export function getRequiredPackagesInfo(
  requiredPackages: string[] = REQUIRED_PACKAGES,
): PackageInfo[] {
  return requiredPackages.map((packageName) => getPackageInfo(packageName));
}

/**
 * Checks if all required packages are installed
 */
export function areAllPackagesInstalled(
  requiredPackages: string[] = REQUIRED_PACKAGES,
): boolean {
  const missingPackages = getMissingPackages(requiredPackages);
  return missingPackages.length === 0;
}

/**
 * Check if all packages including icon library are installed
 */
export function areAllPackagesInstalledWithIcons(
  iconLibrary: string = "lucide",
): boolean {
  const missingPackages = getMissingPackagesWithIcons(iconLibrary);
  return missingPackages.length === 0;
}

/**
 * Validates that package.json exists and is valid
 */
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
      error:
        "Invalid package.json format. Please check your package.json file.",
    };
  }

  return { valid: true };
}

/**
 * Groups packages by their installation status
 */
export function groupPackagesByStatus(
  packageNames: string[] = REQUIRED_PACKAGES,
) {
  const installed: PackageInfo[] = [];
  const missing: PackageInfo[] = [];

  packageNames.forEach((packageName) => {
    const info = getPackageInfo(packageName);
    if (info.isInstalled) {
      installed.push(info);
    } else {
      missing.push(info);
    }
  });

  return { installed, missing };
}

/**
 * Formats package names for display in CLI
 */
export function formatPackageList(
  packages: string[],
  prefix: string = "  -",
): string {
  return packages.map((pkg) => `${prefix} ${pkg}`).join("\n");
}

/**
 * Checks for potential package conflicts or version mismatches
 */
export function checkPackageCompatibility(): {
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];

  const installedPackages = getInstalledPackages();

  // Check for SolidJS version compatibility
  if (installedPackages["solid-js"]) {
    const solidVersion = installedPackages["solid-js"];

    // Basic version check for major version compatibility
    if (solidVersion.startsWith("^0.") || solidVersion.startsWith("0.")) {
      warnings.push(
        "SolidJS version appears to be v0.x. Consider upgrading to v1.x for better compatibility.",
      );
    }
  }

  // Check for UnoCSS core packages consistency (only check @unocss/* packages, not unocss-merge)
  const unocssPackages = Object.keys(installedPackages).filter((pkg) =>
    pkg.startsWith("@unocss/"),
  );

  if (unocssPackages.length > 1) {
    const versions = unocssPackages.map((pkg) => installedPackages[pkg]);
    const uniqueVersions = [...new Set(versions)];

    if (uniqueVersions.length > 1) {
      warnings.push(
        "Multiple @unocss/* package versions detected. Ensure all UnoCSS packages use the same version for consistency.",
      );
    }
  }

  // Check for potential conflicts with Tailwind CSS
  if (installedPackages["tailwindcss"]) {
    warnings.push(
      "Both UnoCSS and Tailwind CSS are installed. This may cause conflicts. Consider using only UnoCSS for this project.",
    );
  }

  return { warnings, errors };
}

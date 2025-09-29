import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { readPackageJson } from "./packages.js";

export type PackageManager = "npm" | "yarn" | "pnpm" | "bun";

export interface PackageManagerInfo {
  name: PackageManager;
  lockFile: string;
  installCommand: string;
  addCommand: string;
}

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

/**
 * Detects the package manager being used in the current project
 * based on lock files, package.json packageManager field, and user agent
 */
export function detectPackageManager(): PackageManager {
  // 1. Check for lock files (most reliable)
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

  // 2. Check package.json packageManager field
  const packageJson = readPackageJson();
  if (packageJson?.packageManager) {
    const pmName = packageJson.packageManager.split("@")[0];
    if (pmName in PACKAGE_MANAGERS) {
      return pmName as PackageManager;
    }
  }

  // 3. Check npm_config_user_agent environment variable
  const userAgent = process.env.npm_config_user_agent;
  if (userAgent) {
    if (userAgent.includes("bun/")) return "bun";
    if (userAgent.includes("pnpm/")) return "pnpm";
    if (userAgent.includes("yarn/")) return "yarn";
    if (userAgent.includes("npm/")) return "npm";
  }

  // 4. Check which package managers are available and prefer more modern ones
  const availableManagers = getAvailablePackageManagers();
  if (availableManagers.includes("bun")) return "bun";
  if (availableManagers.includes("pnpm")) return "pnpm";
  if (availableManagers.includes("yarn")) return "yarn";
  if (availableManagers.includes("npm")) return "npm";

  // Final fallback
  return "npm";
}

/**
 * Gets package manager information for the detected or specified package manager
 */
export function getPackageManagerInfo(
  packageManager?: PackageManager,
): PackageManagerInfo {
  const pm = packageManager || detectPackageManager();
  return PACKAGE_MANAGERS[pm];
}

/**
 * Executes a package manager command
 */
export function executePackageManagerCommand(
  command: string,
  packageManager?: PackageManager,
  options: { stdio?: "inherit" | "pipe" | "ignore" } = {},
): void {
  const pm = getPackageManagerInfo(packageManager);
  const fullCommand = `${pm.name} ${command}`;

  execSync(fullCommand, {
    stdio: options.stdio || "inherit",
    cwd: process.cwd(),
  });
}

/**
 * Installs packages using the detected package manager
 */
export function installPackages(
  packages: string[],
  options: {
    packageManager?: PackageManager;
    dev?: boolean;
    stdio?: "inherit" | "pipe" | "ignore";
  } = {},
): void {
  const pm = getPackageManagerInfo(options.packageManager);
  const devFlag = options.dev ? (pm.name === "npm" ? "--save-dev" : "-D") : "";
  const command = `${pm.addCommand} ${packages.join(" ")} ${devFlag}`.trim();

  executePackageManagerCommand(command.replace(pm.name, "").trim(), pm.name, {
    stdio: options.stdio,
  });
}

/**
 * Checks if a package manager is available in the system
 */
export function isPackageManagerAvailable(
  packageManager: PackageManager,
): boolean {
  try {
    execSync(`${packageManager} --version`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets all available package managers in the system
 */
export function getAvailablePackageManagers(): PackageManager[] {
  return (Object.keys(PACKAGE_MANAGERS) as PackageManager[]).filter(
    isPackageManagerAvailable,
  );
}

/**
 * Gets the most appropriate package manager for the project
 * considering both availability and project context
 */
export function getRecommendedPackageManager(): {
  packageManager: PackageManager;
  reason: string;
} {
  const detected = detectPackageManager();
  const available = getAvailablePackageManagers();

  if (available.includes(detected)) {
    return {
      packageManager: detected,
      reason: getLockFileReason(detected) || "detected from environment",
    };
  }

  // If detected PM is not available, suggest the best available alternative
  const fallbacks: PackageManager[] = ["bun", "pnpm", "yarn", "npm"];
  for (const pm of fallbacks) {
    if (available.includes(pm)) {
      return {
        packageManager: pm,
        reason: `${detected} not available, using ${pm}`,
      };
    }
  }

  return {
    packageManager: "npm",
    reason: "fallback - no other package managers available",
  };
}

/**
 * Gets the reason why a package manager was detected
 */
function getLockFileReason(pm: PackageManager): string | null {
  const info = PACKAGE_MANAGERS[pm];
  if (existsSync(info.lockFile)) {
    return `found ${info.lockFile}`;
  }
  return null;
}

import { defineCommand, runMain } from "citty";
import * as p from "@clack/prompts";
import {
  detectPackageManager,
  installPackages,
  getMissingPackages,
  getMissingPackagesWithIcons,
  formatPackageList,
  isPackageManagerAvailable,
  areAllPackagesInstalled,
  getMissingDependencies,
  buildDependencyTree,
  getTemplatesDirectory,
  installWithDependencies,
  validatePackageJson,
  checkPackageCompatibility,
} from "./src/utils/dependencies.js";
import {
  readComponentsConfig,
  hasComponentsConfig,
  getComponentsPath,
  validateComponentsConfig,
  createComponentsConfig,
  getDefaultConfigValues,
} from "./src/utils/config.js";

import {
  prepareComponentForUser,
  validateComponent,
  componentExists,
  getAvailableComponents,
} from "./src/utils/transform.js";

import {
  getProjectRoot,
  isInProject,
  getProjectLanguageInfo,
} from "./src/utils/project.js";
import { createProjectFiles, safeWriteFile } from "./src/utils/files.js";

const initCommand = defineCommand({
  meta: {
    name: "init",
    description: "Initialize Method UI in your project",
  },
  async run() {
    p.intro("Welcome to Method UI setup!");

    // Check if we're in a valid project
    if (!isInProject()) {
      p.log.error(
        "Could not find project root. Please run this command from within a project directory (one that contains package.json).",
      );
      return;
    }

    const projectRoot = getProjectRoot();

    // Check if already initialized
    if (hasComponentsConfig()) {
      const shouldOverwrite = await p.confirm({
        message:
          "Method UI is already initialized. Do you want to overwrite the configuration?",
        initialValue: false,
      });

      if (p.isCancel(shouldOverwrite)) {
        p.cancel("Operation cancelled.");
        process.exit(0);
      }

      if (!shouldOverwrite) {
        p.outro("Initialization cancelled.");
        return;
      }
    }

    // Check package compatibility
    const compatibility = checkPackageCompatibility();
    if (compatibility.warnings.length > 0) {
      p.log.warn("⚠️  Compatibility warnings:");
      compatibility.warnings.forEach((warning: string) =>
        p.log.warn(`  ${warning}`),
      );
    }

    // Check for missing packages
    const missingPackages = getMissingPackages();

    if (missingPackages.length > 0) {
      p.log.warn("The following packages need to be installed:");
      p.log.message(formatPackageList(missingPackages));

      const shouldInstall = await p.confirm({
        message: "Would you like to install them now?",
        initialValue: true,
      });

      if (p.isCancel(shouldInstall)) {
        p.cancel("Operation cancelled.");
        process.exit(0);
      }

      if (shouldInstall) {
        const packageManager = detectPackageManager();

        // Check if the detected package manager is available
        if (!isPackageManagerAvailable(packageManager)) {
          p.log.error(
            `${packageManager} is not available. Please install it or use a different package manager.`,
          );
          process.exit(1);
        }

        p.log.info(`Detected package manager: ${packageManager}`);

        const s = p.spinner();
        s.start(`Installing packages with ${packageManager}...`);

        try {
          installPackages(missingPackages, { packageManager });
          s.stop("Packages installed successfully!");
        } catch (error) {
          s.stop("Failed to install packages");
          p.log.error(
            "Installation failed. Please install the packages manually and run init again.",
          );
          p.log.error(String(error));
          process.exit(1);
        }
      } else {
        p.log.warn(
          "Please install the required packages manually before proceeding.",
        );
        process.exit(1);
      }
    } else {
      p.log.success("All required packages are already installed!");
    }

    // Configuration prompts
    p.log.step("Let's configure your project:");

    // Auto-detect TypeScript
    const languageInfo = getProjectLanguageInfo();
    p.log.info(
      `Detected language: ${languageInfo.typescript ? "TypeScript" : "JavaScript"} (${languageInfo.reason})`,
    );

    const typescript = await p.confirm({
      message: `Use TypeScript? ${languageInfo.typescript ? "(detected)" : "(not detected)"}`,
      initialValue: languageInfo.typescript,
    });

    if (p.isCancel(typescript)) {
      p.cancel("Operation cancelled.");
      process.exit(0);
    }

    const defaultValues = getDefaultConfigValues();

    const componentsPath = await p.text({
      message: "Where should components be installed?",
      initialValue: defaultValues.componentsPath,
    });

    if (p.isCancel(componentsPath)) {
      p.cancel("Operation cancelled.");
      process.exit(0);
    }

    const iconLibrary = await p.select({
      message: "Which icon library would you like to use?",
      options: [
        { label: "Lucide", value: "lucide", hint: "recommended" },
        { label: "Heroicons", value: "heroicons" },
        { label: "Tabler", value: "tabler" },
        { label: "Phosphor", value: "phosphor" },
      ],
      initialValue: "lucide",
    });

    if (p.isCancel(iconLibrary)) {
      p.cancel("Operation cancelled.");
      process.exit(0);
    }

    // Check for icon library specific packages
    const missingPackagesWithIcons = getMissingPackagesWithIcons(iconLibrary);

    if (missingPackagesWithIcons.length > 0) {
      p.log.warn(`Additional packages needed for ${iconLibrary}:`);
      p.log.message(formatPackageList(missingPackagesWithIcons));

      const shouldInstallIcons = await p.confirm({
        message: "Would you like to install the icon library packages now?",
        initialValue: true,
      });

      if (p.isCancel(shouldInstallIcons)) {
        p.cancel("Operation cancelled.");
        process.exit(0);
      }

      if (shouldInstallIcons) {
        const packageManager = detectPackageManager();

        const s = p.spinner();
        s.start(`Installing ${iconLibrary} packages with ${packageManager}...`);

        try {
          installPackages(missingPackagesWithIcons, { packageManager });
          s.stop(`${iconLibrary} packages installed successfully!`);
        } catch (error) {
          s.stop("Failed to install icon packages");
          p.log.error(
            "Installation failed. Please install the packages manually and run init again.",
          );
          process.exit(1);
        }
      }
    }

    // Create configuration
    const config = {
      typescript,
      componentsPath,
      iconLibrary,
    };

    // Show configuration summary
    p.log.step("Configuration summary:");
    p.log.message(
      `  Language: ${config.typescript ? "TypeScript" : "JavaScript"}`,
    );
    p.log.message(`  Components: ${config.componentsPath}`);
    p.log.message(`  Icon library: ${config.iconLibrary}`);

    const confirm = await p.confirm({
      message: "Proceed with this configuration?",
      initialValue: true,
    });

    if (p.isCancel(confirm)) {
      p.cancel("Operation cancelled.");
      process.exit(0);
    }

    if (confirm) {
      try {
        // Create configuration file
        createComponentsConfig(config);

        // Create project files (uno.config.js/ts and global.css)
        await createProjectFiles(projectRoot, config.iconLibrary);

        p.outro("Method UI has been initialized successfully!");
        p.log.message("Files created:");
        p.log.message(`  • components.json - Configuration`);
        p.log.message(
          `  • uno.config.${config.typescript ? "ts" : "js"} - UnoCSS configuration`,
        );
        p.log.message(`  • global.css - Design tokens and styles`);
      } catch (error) {
        p.log.error(`Failed to create configuration: ${error}`);
        process.exit(1);
      }
    } else {
      p.outro("Setup cancelled.");
    }
  },
});

const addCommand = defineCommand({
  meta: {
    name: "add",
    description: "Add a component to your project",
  },
  args: {
    components: {
      type: "positional",
      description: "Component name(s) to add",
      required: false,
    },
  },
  async run({ args }) {
    // Check if we're in a valid project
    if (!isInProject()) {
      p.log.error(
        "Could not find project root. Please run this command from within a project directory (one that contains package.json).",
      );
      return;
    }

    const projectRoot = getProjectRoot();

    if (!hasComponentsConfig()) {
      p.log.error("No components.json found. Please run 'method init' first.");
      return;
    }

    // Validate configuration
    const config = readComponentsConfig();
    if (config) {
      const validationErrors = validateComponentsConfig(config);
      if (validationErrors.length > 0) {
        p.log.error("Configuration validation failed:");
        validationErrors.forEach((error) => p.log.error(`  ${error}`));
        p.log.message("Please run 'method init' to fix the configuration.");
        process.exit(1);
      }
    }

    // Parse component names - support both single and multiple components
    const componentNames = args.components ? args.components.split(/\s+/) : [];

    if (componentNames.length === 0) {
      p.log.step("Available components:");
      const availableComponents = getAvailableComponents();
      availableComponents.forEach((component) => {
        p.log.message(`  • ${component}`);
      });
      if (availableComponents.length === 0) {
        p.log.message("  No components available");
      }
    } else {
      // Validate that all components exist
      const invalidComponents = componentNames.filter(
        (name) => !componentExists(name),
      );
      if (invalidComponents.length > 0) {
        p.log.error(`Component(s) not found: ${invalidComponents.join(", ")}`);
        p.log.message("Available components:");
        const availableComponents = getAvailableComponents();
        availableComponents.forEach((component) => {
          p.log.message(`  • ${component}`);
        });
        if (availableComponents.length === 0) {
          p.log.message("  No components available");
        }
        return;
      }

      // Use new advanced dependency detection and installation system
      try {
        p.log.step("Analyzing dependencies...");

        const result = await installWithDependencies(componentNames);

        if (result.success) {
          if (result.installedComponents.length > 0) {
            p.log.success(
              `Successfully added ${result.installedComponents.length} component(s):`,
            );
            result.installedComponents.forEach((comp) =>
              p.log.message(`  ✓ ${comp}`),
            );
          }

          if (result.installedPackages.length > 0) {
            p.log.success(
              `Successfully installed ${result.installedPackages.length} package(s):`,
            );
            result.installedPackages.forEach((pkg) =>
              p.log.message(`  ✓ ${pkg}`),
            );
          }
        } else {
          p.log.error("Installation failed:");
          result.errors.forEach((error) => p.log.error(`  ${error}`));

          if (
            result.installedComponents.length > 0 ||
            result.installedPackages.length > 0
          ) {
            p.log.message("Partially installed:");
            if (result.installedComponents.length > 0) {
              p.log.message("Components:");
              result.installedComponents.forEach((comp) =>
                p.log.message(`  ✓ ${comp}`),
              );
            }
            if (result.installedPackages.length > 0) {
              p.log.message("Packages:");
              result.installedPackages.forEach((pkg) =>
                p.log.message(`  ✓ ${pkg}`),
              );
            }
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        p.log.error(
          `Failed to add component(s): ${componentNames.join(", ")} - ${errorMessage}`,
        );
      }
    }
  },
});

const removeCommand = defineCommand({
  meta: {
    name: "remove",
    description: "Remove a component from your project",
  },
  args: {
    component: {
      type: "positional",
      description: "Component name to remove",
      required: true,
    },
  },
  async run({ args }) {
    // Check if we're in a valid project
    if (!isInProject()) {
      p.log.error(
        "Could not find project root. Please run this command from within a project directory (one that contains package.json).",
      );
      return;
    }

    const projectRoot = getProjectRoot();

    if (!hasComponentsConfig()) {
      p.log.error("No components.json found. Please run 'method init' first.");
      return;
    }

    const config = readComponentsConfig();
    if (!config) {
      p.log.error("Configuration not found.");
      return;
    }

    const { existsSync, unlinkSync } = await import("fs");
    const { join } = await import("path");

    const componentsPath = getComponentsPath(config);
    const componentFile = `${args.component}.tsx`;
    const componentPath = join(projectRoot, componentsPath, componentFile);

    // Check if component exists
    if (!existsSync(componentPath)) {
      p.log.error(
        `Component "${args.component}" not found at ${componentsPath}/${componentFile}`,
      );
      p.log.message("Available components in your project:");

      try {
        const { readdirSync } = await import("fs");
        const files = readdirSync(join(projectRoot, componentsPath))
          .filter((file) => file.endsWith(".tsx"))
          .map((file) => file.replace(".tsx", ""));

        if (files.length > 0) {
          files.forEach((file) => p.log.message(`  • ${file}`));
        } else {
          p.log.message("  (no components found)");
        }
      } catch (error) {
        p.log.message("  (unable to read components directory)");
      }
      return;
    }

    // Confirm removal
    const shouldRemove = await p.confirm({
      message: `Are you sure you want to remove the "${args.component}" component? This action cannot be undone.`,
      initialValue: false,
    });

    if (p.isCancel(shouldRemove)) {
      p.cancel("Operation cancelled.");
      process.exit(0);
    }

    if (!shouldRemove) {
      p.outro("Component removal cancelled.");
      return;
    }

    try {
      unlinkSync(componentPath);
      p.log.success(
        `Component "${args.component}" removed successfully from ${componentsPath}/${componentFile}`,
      );
    } catch (error) {
      p.log.error(`Failed to remove component: ${error}`);
    }
  },
});

const main = defineCommand({
  meta: {
    name: "method",
    description: "Method UI Component Library CLI",
    version: "1.0.0",
  },
  subCommands: {
    init: initCommand,
    add: addCommand,
    remove: removeCommand,
  },
});

runMain(main);

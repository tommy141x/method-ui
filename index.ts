import { defineCommand, runMain } from "citty";
import cliSpinners from "cli-spinners";
import yoctoSpinner from "yocto-spinner";
import { red, green, cyan, yellow } from "yoctocolors";
import { consola } from "consola";
import {
  detectPackageManager,
  installPackages as installPackagesUtil,
  isPackageManagerAvailable,
} from "./src/utils/package-manager.js";
import {
  hasComponentsConfig,
  createComponentsConfig,
  readComponentsConfig,
  getDefaultConfigValues,
  validateComponentsConfig,
  getComponentsPath,
} from "./src/utils/config.js";
import {
  REQUIRED_PACKAGES,
  getMissingPackages,
  getMissingPackagesWithIcons,
  areAllPackagesInstalled,
  areAllPackagesInstalledWithIcons,
  validatePackageJson,
  formatPackageList,
  checkPackageCompatibility,
} from "./src/utils/packages.js";
import {
  prepareComponentForUser,
  validateComponent,
  componentExists,
  getAvailableComponents,
} from "./src/utils/transform.js";
import { installWithDependencies } from "./src/utils/dependency-installer.js";
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
    consola.log(`${cyan("◇")} Welcome to ${green("Method UI")} setup!`);
    consola.log("");

    // Check if we're in a valid project
    if (!isInProject()) {
      consola.error(
        "Could not find project root. Please run this command from within a project directory (one that contains package.json).",
      );
      return;
    }

    const projectRoot = getProjectRoot();

    // Check if already initialized
    if (hasComponentsConfig()) {
      const shouldOverwrite = await consola.prompt(
        "Method UI is already initialized. Do you want to overwrite the configuration?",
        {
          type: "confirm",
          initial: false,
        },
      );

      if (!shouldOverwrite) {
        consola.log("Initialization cancelled.");
        return;
      }
    }

    // Check package compatibility
    const compatibility = checkPackageCompatibility();
    if (compatibility.warnings.length > 0) {
      consola.warn("⚠️  Compatibility warnings:");
      compatibility.warnings.forEach((warning) => consola.warn(`  ${warning}`));
      consola.log("");
    }

    // Check for missing packages
    const missingPackages = getMissingPackages();

    if (missingPackages.length > 0) {
      consola.log(
        `${yellow("!")} The following packages need to be installed:`,
      );
      consola.log(formatPackageList(missingPackages));
      consola.log("");

      const shouldInstall = await consola.prompt(
        "Would you like to install them now?",
        {
          type: "confirm",
          initial: true,
        },
      );

      if (shouldInstall) {
        const packageManager = detectPackageManager();

        // Check if the detected package manager is available
        if (!isPackageManagerAvailable(packageManager)) {
          consola.error(
            `${packageManager} is not available. Please install it or use a different package manager.`,
          );
          process.exit(1);
        }

        consola.log(
          `${cyan("◇")} Detected package manager: ${green(packageManager)}`,
        );

        const spinner = yoctoSpinner({
          text: `Installing packages with ${packageManager}...`,
          spinner: cliSpinners.dots,
        }).start();

        try {
          installPackagesUtil(missingPackages, { packageManager });
          spinner.success("Packages installed successfully!");
          consola.log("");
        } catch (error) {
          spinner.error("Failed to install packages");
          consola.error(
            "Installation failed. Please install the packages manually and run init again.",
          );
          consola.error(error);
          process.exit(1);
        }
      } else {
        consola.warn(
          "Please install the required packages manually before proceeding.",
        );
        process.exit(1);
      }
    } else {
      consola.success(
        `${green("✓")} All required packages are already installed!`,
      );
      consola.log("");
    }

    // Configuration prompts
    consola.log(`${cyan("◇")} Let's configure your project:`);
    consola.log("");

    // Auto-detect TypeScript
    const languageInfo = getProjectLanguageInfo();
    consola.log(
      `${cyan("◇")} Detected language: ${languageInfo.typescript ? "TypeScript" : "JavaScript"} (${languageInfo.reason})`,
    );

    const typescript = await consola.prompt(
      `Use TypeScript? ${languageInfo.typescript ? "(detected)" : "(not detected)"}`,
      {
        type: "confirm",
        initial: languageInfo.typescript,
      },
    );

    const defaultValues = getDefaultConfigValues();

    const componentsPath = await consola.prompt(
      "Where should components be installed?",
      {
        type: "text",
        initial: defaultValues.componentsPath,
        placeholder: defaultValues.componentsPath,
      },
    );

    const iconLibrary = await consola.prompt(
      "Which icon library would you like to use?",
      {
        type: "select",
        options: [
          { label: "Lucide", value: "lucide", hint: "recommended" },
          { label: "Heroicons", value: "heroicons" },
          { label: "Tabler", value: "tabler" },
          { label: "Phosphor", value: "phosphor" },
        ],
        initial: "lucide",
      },
    );

    // Check for icon library specific packages
    const missingPackagesWithIcons = getMissingPackagesWithIcons(iconLibrary);

    if (missingPackagesWithIcons.length > 0) {
      consola.log("");
      consola.log(
        `${yellow("!")} Additional packages needed for ${iconLibrary}:`,
      );
      consola.log(formatPackageList(missingPackagesWithIcons));
      consola.log("");

      const shouldInstallIcons = await consola.prompt(
        "Would you like to install the icon library packages now?",
        {
          type: "confirm",
          initial: true,
        },
      );

      if (shouldInstallIcons) {
        const packageManager = detectPackageManager();

        const spinner = yoctoSpinner({
          text: `Installing ${iconLibrary} packages with ${packageManager}...`,
          spinner: cliSpinners.dots,
        }).start();

        try {
          installPackagesUtil(missingPackagesWithIcons, { packageManager });
          spinner.success("Icon library packages installed successfully!");
          consola.log("");
        } catch (error) {
          spinner.error("Failed to install icon library packages");
          consola.error(
            "Installation failed. Please install the packages manually.",
          );
          throw error;
        }
      }
    }

    consola.log("");

    // Create configuration
    const config = {
      typescript,
      componentsPath,
      iconLibrary,
    };

    // Show configuration summary
    consola.log(`${cyan("◇")} Configuration summary:`);
    consola.log(
      `  Language: ${config.typescript ? "TypeScript" : "JavaScript"}`,
    );
    consola.log(`  Components: ${config.componentsPath}`);
    consola.log(`  Icon library: ${config.iconLibrary}`);
    consola.log("");

    const confirm = await consola.prompt("Proceed with this configuration?", {
      type: "confirm",
      initial: true,
    });

    if (confirm) {
      try {
        // Create configuration file
        createComponentsConfig(config);

        // Create project files (uno.config.js/ts and global.css)
        createProjectFiles(projectRoot, config.typescript, config.iconLibrary);

        consola.log("");
        consola.success("Method UI has been initialized successfully!");
        consola.log("");
        consola.log("Files created:");
        consola.log(`  • components.json - Configuration`);
        consola.log(
          `  • uno.config.${config.typescript ? "ts" : "js"} - UnoCSS configuration`,
        );
        consola.log(`  • global.css - Design tokens and styles`);
        consola.log("");
        consola.log("Next steps:");
        consola.log("  1. Import global.css in your app");
        consola.log("  2. Add UnoCSS to your build process");
        consola.log("  3. Add components using 'method add <component>'");
        consola.log("  4. Start building amazing UIs!");
      } catch (error) {
        consola.error("Failed to create configuration:", error);
        throw error;
      }
    } else {
      consola.log("Setup cancelled.");
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
      consola.error(
        "Could not find project root. Please run this command from within a project directory (one that contains package.json).",
      );
      return;
    }

    const projectRoot = getProjectRoot();

    if (!hasComponentsConfig()) {
      consola.error(
        "No components.json found. Please run 'method init' first.",
      );
      return;
    }

    // Validate configuration
    const config = readComponentsConfig();
    if (config) {
      const validationErrors = validateComponentsConfig(config);
      if (validationErrors.length > 0) {
        consola.error("Configuration validation failed:");
        validationErrors.forEach((error) => consola.error(`  ${error}`));
        consola.log("Please run 'method init' to fix the configuration.");
        process.exit(1);
      }
    }

    // Parse component names - support both single and multiple components
    const componentNames = args.components ? args.components.split(/\s+/) : [];

    if (componentNames.length === 0) {
      consola.log(`${cyan("◇")} Available components:`);
      const availableComponents = getAvailableComponents();
      if (availableComponents.length > 0) {
        availableComponents.forEach((component) => {
          consola.log(`  • ${component}`);
        });
      } else {
        consola.log("  • button     - Interactive button component");
        consola.log("  • input      - Form input component");
        consola.log("  • card       - Container card component");
        consola.log("  • dialog     - Modal dialog component");
        consola.log("  • badge      - Status badge component");
      }
      consola.log("");
      consola.log("Usage: method add <component> [component2] [component3]...");
      consola.log("Examples:");
      consola.log("  method add button");
      consola.log("  method add button input card");
    } else {
      // Validate that all components exist
      const invalidComponents = componentNames.filter(
        (name) => !componentExists(name),
      );
      if (invalidComponents.length > 0) {
        consola.error(
          `Component(s) not found: ${invalidComponents.join(", ")}`,
        );
        consola.log("");
        consola.log("Available components:");
        const availableComponents = getAvailableComponents();
        if (availableComponents.length > 0) {
          availableComponents.forEach((component) => {
            consola.log(`  • ${component}`);
          });
        } else {
          consola.log("  • button");
          consola.log("  • input");
          consola.log("  • card");
          consola.log("  • dialog");
          consola.log("  • badge");
        }
        return;
      }

      // Use new dependency resolution system
      try {
        consola.log(`${cyan("◇")} Analyzing dependencies...`);

        const result = await installWithDependencies(componentNames);

        if (result.success) {
          consola.log("");
          if (result.installedComponents.length > 0) {
            consola.success(
              `Successfully added ${result.installedComponents.length} component(s):`,
            );
            result.installedComponents.forEach((comp) =>
              consola.log(`  ✓ ${comp}`),
            );
          }

          if (result.installedPackages.length > 0) {
            consola.success(
              `Successfully installed ${result.installedPackages.length} package(s):`,
            );
            result.installedPackages.forEach((pkg) =>
              consola.log(`  ✓ ${pkg}`),
            );
          }

          consola.log("");
          consola.log("Next steps:");
          consola.log("  1. Import the components you need");
          consola.log("  2. Start building amazing UIs!");
        } else {
          consola.error("Installation failed:");
          result.errors.forEach((error) => consola.error(`  ${error}`));

          if (
            result.installedComponents.length > 0 ||
            result.installedPackages.length > 0
          ) {
            consola.log("");
            consola.log("Partially installed:");
            if (result.installedComponents.length > 0) {
              consola.log("Components:");
              result.installedComponents.forEach((comp) =>
                consola.log(`  ✓ ${comp}`),
              );
            }
            if (result.installedPackages.length > 0) {
              consola.log("Packages:");
              result.installedPackages.forEach((pkg) =>
                consola.log(`  ✓ ${pkg}`),
              );
            }
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        consola.error(
          `Failed to analyze or install dependencies: ${errorMessage}`,
        );
      }
    }
  },
});

const statusCommand = defineCommand({
  meta: {
    name: "status",
    description: "Check the status of your Method UI installation",
  },
  async run() {
    consola.log(`${cyan("◇")} Method UI Status Check`);
    consola.log("");

    // Check if we're in a valid project
    if (!isInProject()) {
      consola.error(
        "Could not find project root. Please run this command from within a project directory (one that contains package.json).",
      );
      return;
    }

    consola.success("project found and valid");

    // Check configuration
    if (hasComponentsConfig()) {
      const config = readComponentsConfig();
      if (config) {
        const validationErrors = validateComponentsConfig(config);
        if (validationErrors.length === 0) {
          consola.success("components.json is valid");
        } else {
          consola.error("components.json has validation errors:");
          validationErrors.forEach((error) => consola.error(`    ${error}`));
        }
      } else {
        consola.error("components.json exists but is invalid");
      }
    } else {
      consola.warn(
        `${yellow("!")} components.json not found. Run 'method init' to initialize.`,
      );
    }

    // Check packages
    const allInstalled = areAllPackagesInstalled();
    if (allInstalled) {
      consola.success("All required packages are installed");
    } else {
      const missing = getMissingPackages();
      consola.error("Missing required packages:");
      consola.log(formatPackageList(missing, "    "));
    }

    // Check package manager
    const packageManager = detectPackageManager();
    const isAvailable = isPackageManagerAvailable(packageManager);
    if (isAvailable) {
      consola.success(`Package manager: ${packageManager}`);
    } else {
      consola.error(`Package manager ${packageManager} not available`);
    }

    // Check compatibility
    const compatibility = checkPackageCompatibility();
    if (compatibility.warnings.length > 0) {
      consola.warn("Compatibility warnings:");
      compatibility.warnings.forEach((warning) => consola.warn(`  ${warning}`));
    }

    consola.log("");
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
      consola.error(
        "Could not find project root. Please run this command from within a project directory (one that contains package.json).",
      );
      return;
    }

    const projectRoot = getProjectRoot();

    if (!hasComponentsConfig()) {
      consola.error(
        "No components.json found. Please run 'method init' first.",
      );
      return;
    }

    const config = readComponentsConfig();
    if (!config) {
      consola.error("Configuration not found.");
      return;
    }

    const { existsSync, unlinkSync } = await import("fs");
    const { join } = await import("path");

    const componentsPath = getComponentsPath(config);
    const componentFile = `${args.component}.tsx`;
    const componentPath = join(projectRoot, componentsPath, componentFile);

    // Check if component exists
    if (!existsSync(componentPath)) {
      consola.error(
        `Component "${args.component}" not found at ${componentsPath}/${componentFile}`,
      );
      consola.log("");
      consola.log("Available components in your project:");

      try {
        const { readdirSync } = await import("fs");
        const files = readdirSync(join(projectRoot, componentsPath))
          .filter((file) => file.endsWith(".tsx"))
          .map((file) => file.replace(".tsx", ""));

        if (files.length > 0) {
          files.forEach((file) => consola.log(`  • ${file}`));
        } else {
          consola.log("  (no components found)");
        }
      } catch (error) {
        consola.log("  (unable to read components directory)");
      }
      return;
    }

    // Confirm removal
    const shouldRemove = await consola.prompt(
      `Are you sure you want to remove the "${args.component}" component?`,
      {
        type: "confirm",
        initial: false,
      },
    );

    if (!shouldRemove) {
      consola.log("Component removal cancelled.");
      return;
    }

    try {
      unlinkSync(componentPath);
      consola.success(
        `Removed ${args.component} component from ${componentsPath}/${componentFile}`,
      );

      consola.log("");
      consola.log("Note: This only removes the component file.");
      consola.log("You may need to:");
      consola.log("  1. Remove imports of this component from your code");
      consola.log("  2. Clean up any unused dependencies");
    } catch (error) {
      consola.error(`Failed to remove component: ${error}`);
    }
  },
});

const main = defineCommand({
  meta: {
    name: "method",
    version: "1.0.0",
    description: "Method UI Component Library CLI",
  },
  subCommands: {
    init: initCommand,
    add: addCommand,
    remove: removeCommand,
    status: statusCommand,
  },
});

runMain(main);

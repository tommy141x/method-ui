import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { consola } from "consola";

export interface ComponentsConfig {
  components: string;
  iconLibrary: string;
}

export interface InitConfig {
  typescript: boolean;
  componentsPath: string;
  iconLibrary: string;
}

const DEFAULT_CONFIG: Partial<ComponentsConfig> = {
  components: "./src/components",
  iconLibrary: "lucide",
};

/**
 * Checks if components.json exists in the current directory
 */
export function hasComponentsConfig(): boolean {
  return existsSync("components.json");
}

/**
 * Reads and parses the components.json file
 */
export function readComponentsConfig(): ComponentsConfig | null {
  if (!hasComponentsConfig()) {
    return null;
  }

  try {
    const content = readFileSync("components.json", "utf-8");
    return JSON.parse(content) as ComponentsConfig;
  } catch (error) {
    consola.error("Failed to parse components.json:", error);
    return null;
  }
}

/**
 * Creates a components.json file from the provided configuration
 */
export function createComponentsConfig(config: InitConfig): void {
  const componentsConfig: ComponentsConfig = {
    components: config.componentsPath,
    iconLibrary: config.iconLibrary,
  };

  try {
    writeFileSync("components.json", JSON.stringify(componentsConfig, null, 2));
    consola.success("components.json created successfully!");
  } catch (error) {
    consola.error("Failed to create components.json:", error);
    throw error;
  }
}

/**
 * Updates an existing components.json file with new values
 */
export function updateComponentsConfig(
  updates: Partial<ComponentsConfig>,
): void {
  const existingConfig = readComponentsConfig();

  if (!existingConfig) {
    consola.error("No components.json found to update");
    return;
  }

  const updatedConfig = mergeConfig(existingConfig, updates);

  try {
    writeFileSync("components.json", JSON.stringify(updatedConfig, null, 2));
    consola.success("components.json updated successfully!");
  } catch (error) {
    consola.error("Failed to update components.json:", error);
    throw error;
  }
}

/**
 * Deep merges two configuration objects
 */
function mergeConfig(
  existing: ComponentsConfig,
  updates: Partial<ComponentsConfig>,
): ComponentsConfig {
  const merged = { ...existing };

  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        const existingValue = (existing as any)[key];
        const mergedValue =
          typeof existingValue === "object" && existingValue !== null
            ? Object.assign({}, existingValue, value)
            : value;
        (merged as any)[key] = mergedValue;
      } else {
        (merged as any)[key] = value;
      }
    }
  }

  return merged;
}

/**
 * Validates the components.json configuration
 */
export function validateComponentsConfig(config: ComponentsConfig): string[] {
  const errors: string[] = [];

  if (!config.components) {
    errors.push("Missing components path in configuration");
  }

  if (!config.iconLibrary) {
    errors.push("Missing icon library in configuration");
  }

  return errors;
}

/**
 * Resolves a path using the configured aliases
 */
export function getComponentsPath(config?: ComponentsConfig): string {
  const componentsConfig = config || readComponentsConfig();
  return componentsConfig?.components || "./src/components";
}

/**
 * Gets the file extension based on the tsx configuration
 */
export function getFileExtension(): string {
  return ".tsx";
}

/**
 * Generates default configuration prompts for interactive setup
 */
export function getDefaultConfigValues(): Partial<InitConfig> {
  return {
    typescript: true,
    componentsPath: "./src/components",
    iconLibrary: "lucide",
  };
}

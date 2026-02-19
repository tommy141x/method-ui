import { existsSync, readFileSync, writeFileSync } from "node:fs";
import * as p from "@clack/prompts";

export interface ComponentsConfig {
	components: string;
	iconLibrary: string;
	typescript: boolean;
}

export interface InitConfig {
	typescript: boolean;
	componentsPath: string;
	iconLibrary: string;
}

const _DEFAULT_CONFIG: Partial<ComponentsConfig> = {
	components: "./src/components",
	iconLibrary: "lucide",
	typescript: true,
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
		p.log.error(`Failed to parse components.json: ${error}`);
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
		typescript: config.typescript,
	};

	try {
		writeFileSync("components.json", JSON.stringify(componentsConfig, null, 2));
		p.log.success("components.json created successfully!");
	} catch (error) {
		p.log.error(`Failed to create components.json: ${error}`);
		throw error;
	}
}

/**
 * Updates an existing components.json file with new values
 */
export function updateComponentsConfig(updates: Partial<ComponentsConfig>): void {
	const existingConfig = readComponentsConfig();

	if (!existingConfig) {
		p.log.error("No components.json found to update");
		return;
	}

	const updatedConfig = mergeConfig(existingConfig, updates);

	try {
		writeFileSync("components.json", JSON.stringify(updatedConfig, null, 2));
		p.log.success("components.json updated successfully!");
	} catch (error) {
		p.log.error(`Failed to update components.json: ${error}`);
		throw error;
	}
}

/**
 * Deep merges two configuration objects
 */
function mergeConfig(
	existing: ComponentsConfig,
	updates: Partial<ComponentsConfig>
): ComponentsConfig {
	const merged: Record<string, unknown> = {
		...(existing as unknown as Record<string, unknown>),
	};
	const existingRecord = existing as unknown as Record<string, unknown>;

	for (const [key, value] of Object.entries(updates)) {
		if (value !== undefined) {
			if (typeof value === "object" && value !== null && !Array.isArray(value)) {
				const existingValue = existingRecord[key];
				const mergedValue =
					typeof existingValue === "object" && existingValue !== null
						? Object.assign({}, existingValue, value)
						: value;
				merged[key] = mergedValue;
			} else {
				merged[key] = value;
			}
		}
	}

	return merged as unknown as ComponentsConfig;
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

	if (config.typescript === undefined) {
		errors.push("Missing typescript setting in configuration");
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
 * Gets the file extension based on the typescript configuration
 */
export function getFileExtension(config?: ComponentsConfig | null): string {
	const componentsConfig = config || readComponentsConfig();
	return componentsConfig?.typescript ? ".tsx" : ".jsx";
}

/**
 * Checks if the project is configured for TypeScript
 */
export function isTypeScriptProject(config?: ComponentsConfig | null): boolean {
	const componentsConfig = config || readComponentsConfig();
	return componentsConfig?.typescript ?? true; // Default to TypeScript if not specified
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

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as p from "@clack/prompts";

/**
 * Find the CLI's lib directory (contains template files)
 */
export function getTemplatesDirectory(): string {
	// Get the current file's directory
	const currentFileUrl = import.meta.url;
	const currentFilePath = fileURLToPath(currentFileUrl);
	const currentDir = dirname(currentFilePath);

	// Try multiple approaches to find the lib directory
	const searchPaths = [
		// 1. Relative to this file (cli/utils/files.ts -> lib)
		join(currentDir, "..", "..", "lib"),
		// 2. Walking up from current working directory
		(() => {
			let cliDir = process.cwd();
			while (!existsSync(join(cliDir, "lib")) && cliDir !== dirname(cliDir)) {
				cliDir = dirname(cliDir);
			}
			return join(cliDir, "lib");
		})(),
		// 3. Common node_modules locations
		join(process.cwd(), "node_modules", "method-ui", "lib"),
		join(currentDir, "..", "..", "..", "method-ui", "lib"),
	];

	for (const templatesDir of searchPaths) {
		if (existsSync(templatesDir)) {
			return templatesDir;
		}
	}

	throw new Error(`Could not find lib directory. Searched in:\n${searchPaths.join("\n")}`);
}

/**
 * Ensures a directory exists, creating it if necessary
 */
export function ensureDirectoryExists(dirPath: string): void {
	try {
		mkdirSync(dirPath, { recursive: true });
	} catch (_error) {
		// Directory might already exist, check if it's actually a directory
		if (!existsSync(dirPath)) {
			throw new Error(`Failed to create directory: ${dirPath}`);
		}
	}
}

/**
 * Safely writes a file, ensuring the directory exists first
 */
export function safeWriteFile(filePath: string, content: string): void {
	const dir = dirname(filePath);
	ensureDirectoryExists(dir);
	writeFileSync(filePath, content);
}

/**
 * Create a backup of an existing file
 */
function createBackup(filePath: string): string {
	if (!existsSync(filePath)) {
		return "";
	}

	const backupPath = `${filePath}.backup`;
	let counter = 1;
	let finalBackupPath = backupPath;

	// Find a unique backup filename
	while (existsSync(finalBackupPath)) {
		finalBackupPath = `${backupPath}.${counter}`;
		counter++;
	}

	try {
		copyFileSync(filePath, finalBackupPath);
		return finalBackupPath;
	} catch (error) {
		p.log.warn(`Failed to create backup: ${error}`);
		return "";
	}
}

/**
 * Read a template file
 */
function readTemplate(templatePath: string): string {
	if (!existsSync(templatePath)) {
		throw new Error(`Template file not found: ${templatePath}`);
	}

	return readFileSync(templatePath, "utf-8");
}

/**
 * Generate UnoCSS configuration file content from template
 */
export async function generateUnoConfig(_iconLibrary: string): Promise<string> {
	const { readComponentsConfig, isTypeScriptProject } = await import("./config.js");
	const config = readComponentsConfig();
	const typescript = isTypeScriptProject(config);

	const templatesDir = getTemplatesDirectory();
	const templatePath = join(templatesDir, "uno.config.ts");

	let content = readTemplate(templatePath);

	// Transform to JavaScript if needed
	if (!typescript) {
		const { transformTypeScriptToJavaScript } = await import("./typescript.js");
		content = transformTypeScriptToJavaScript(content);
	}

	return content;
}

/**
 * Generate global CSS file content from template
 */
export function generateGlobalCSS(): string {
	const templatesDir = getTemplatesDirectory();
	const templatePath = join(templatesDir, "global.css");

	return readTemplate(templatePath);
}

/**
 * Create UnoCSS configuration file
 */
export async function createUnoConfig(projectRoot: string, iconLibrary: string): Promise<void> {
	const { readComponentsConfig, isTypeScriptProject } = await import("./config.js");
	const config = readComponentsConfig();
	const typescript = isTypeScriptProject(config);

	const extension = typescript ? "ts" : "js";
	const filename = `uno.config.${extension}`;
	const filepath = join(projectRoot, filename);

	// Check for existing uno.config files and create backups
	const existingTsConfig = join(projectRoot, "uno.config.ts");
	const existingJsConfig = join(projectRoot, "uno.config.js");

	if (existsSync(existingTsConfig)) {
		const backupPath = createBackup(existingTsConfig);
		if (backupPath) {
			p.log.warn(`Existing uno.config.ts backed up to: ${basename(backupPath)}`);
		}
		p.log.warn(
			"Your existing UnoCSS configuration will be replaced. Please merge any custom settings manually."
		);
	} else if (existsSync(existingJsConfig)) {
		const backupPath = createBackup(existingJsConfig);
		if (backupPath) {
			p.log.warn(`Existing uno.config.js backed up to: ${basename(backupPath)}`);
		}
		p.log.warn(
			"Your existing UnoCSS configuration will be replaced. Please merge any custom settings manually."
		);
	}

	try {
		const content = await generateUnoConfig(iconLibrary);
		safeWriteFile(filepath, content);
		p.log.success(`Created ${filename}`);
	} catch (error) {
		p.log.error(`Failed to create ${filename}: ${error}`);
		throw error;
	}
}

/**
 * Create global CSS file
 */
export function createGlobalCSS(projectRoot: string): void {
	const filename = "global.css";
	const filepath = join(projectRoot, filename);

	try {
		const content = generateGlobalCSS();
		safeWriteFile(filepath, content);
		p.log.success(`Created ${filename}`);
	} catch (error) {
		p.log.error(`Failed to create ${filename}: ${error}`);
		throw error;
	}
}

/**
 * Create all necessary project files
 */
export async function createProjectFiles(projectRoot: string, iconLibrary: string): Promise<void> {
	await createUnoConfig(projectRoot, iconLibrary);
	createGlobalCSS(projectRoot);
}

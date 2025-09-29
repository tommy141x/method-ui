import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { consola } from "consola";
import {
  transformTypeScriptToJavaScript,
  convertFileExtension,
} from "./typescript.js";

/**
 * Get icon collection configuration based on library name
 */
function getIconCollection(iconLibrary: string): {
  name: string;
  package: string;
} {
  const collections = {
    lucide: {
      name: "lucide",
      package: "@iconify-json/lucide/icons.json",
    },
    heroicons: {
      name: "heroicons",
      package: "@iconify-json/heroicons/icons.json",
    },
    tabler: {
      name: "tabler",
      package: "@iconify-json/tabler/icons.json",
    },
    phosphor: {
      name: "ph",
      package: "@iconify-json/ph/icons.json",
    },
  };

  return (
    collections[iconLibrary as keyof typeof collections] || collections.lucide
  );
}

/**
 * Find the CLI's templates directory
 */
function getTemplatesDirectory(): string {
  // Find the CLI directory - look for where the CLI's templates folder is
  let cliDir = process.cwd();

  // If we're in a user project, go up to find the CLI directory
  while (!existsSync(join(cliDir, "templates")) && cliDir !== dirname(cliDir)) {
    cliDir = dirname(cliDir);
  }

  // If still not found, try relative to this file
  if (!existsSync(join(cliDir, "templates"))) {
    cliDir = join(__dirname || ".", "..", "..", "..");
  }

  const templatesDir = join(cliDir, "templates");

  if (!existsSync(templatesDir)) {
    throw new Error(`Could not find templates directory at ${templatesDir}`);
  }

  return templatesDir;
}

/**
 * Ensures a directory exists, creating it if necessary
 */
export function ensureDirectoryExists(dirPath: string): void {
  try {
    mkdirSync(dirPath, { recursive: true });
  } catch (error) {
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
 * Read and process a template file with variable substitution
 */
function readTemplate(templatePath: string, iconLibrary?: string): string {
  if (!existsSync(templatePath)) {
    throw new Error(`Template file not found: ${templatePath}`);
  }

  let content = readFileSync(templatePath, "utf-8");

  // Replace icon configuration if provided
  if (iconLibrary) {
    const iconCollection = getIconCollection(iconLibrary);
    const iconConfig = `${iconCollection.name}: () =>
          import("${iconCollection.package}").then((i) => i.default),`;

    content = content.replace(
      /\/\/ This will be replaced with actual icon library configuration\s*\n\s*\/\/ Format:.*$/m,
      iconConfig,
    );
  }

  return content;
}

/**
 * Generate UnoCSS configuration file content from template
 */
export function generateUnoConfig(
  typescript: boolean,
  iconLibrary: string,
): string {
  const templatesDir = getTemplatesDirectory();
  const templatePath = join(templatesDir, "uno.config.ts");

  let content = readTemplate(templatePath, iconLibrary);

  // Transform to JavaScript if needed
  if (!typescript) {
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
export function createUnoConfig(
  projectRoot: string,
  typescript: boolean,
  iconLibrary: string,
): void {
  const extension = typescript ? "ts" : "js";
  const filename = `uno.config.${extension}`;
  const filepath = join(projectRoot, filename);

  try {
    const content = generateUnoConfig(typescript, iconLibrary);
    safeWriteFile(filepath, content);
    consola.success(`Created ${filename}`);
  } catch (error) {
    consola.error(`Failed to create ${filename}:`, error);
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
    consola.success(`Created ${filename}`);
  } catch (error) {
    consola.error(`Failed to create ${filename}:`, error);
    throw error;
  }
}

/**
 * Create all necessary project files
 */
export function createProjectFiles(
  projectRoot: string,
  typescript: boolean,
  iconLibrary: string,
): void {
  createUnoConfig(projectRoot, typescript, iconLibrary);
  createGlobalCSS(projectRoot);
}

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import * as p from "@clack/prompts";
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
export function getTemplatesDirectory(): string {
  // Get the current file's directory
  const currentFileUrl = import.meta.url;
  const currentFilePath = fileURLToPath(currentFileUrl);
  const currentDir = dirname(currentFilePath);

  // Try multiple approaches to find the templates directory
  const searchPaths = [
    // 1. Relative to this file (src/utils/files.ts -> templates)
    join(currentDir, "..", "..", "templates"),
    // 2. Walking up from current working directory
    (() => {
      let cliDir = process.cwd();
      while (
        !existsSync(join(cliDir, "templates")) &&
        cliDir !== dirname(cliDir)
      ) {
        cliDir = dirname(cliDir);
      }
      return join(cliDir, "templates");
    })(),
    // 3. Common node_modules locations
    join(process.cwd(), "node_modules", "method-ui", "templates"),
    join(currentDir, "..", "..", "..", "method-ui", "templates"),
  ];

  for (const templatesDir of searchPaths) {
    if (existsSync(templatesDir)) {
      return templatesDir;
    }
  }

  throw new Error(
    `Could not find templates directory. Searched in:\n${searchPaths.join("\n")}`,
  );
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
export async function generateUnoConfig(iconLibrary: string): Promise<string> {
  const { readComponentsConfig, isTypeScriptProject } = await import(
    "./config.js"
  );
  const config = readComponentsConfig();
  const typescript = isTypeScriptProject(config);

  const templatesDir = getTemplatesDirectory();
  const templatePath = join(templatesDir, "uno.config.ts");

  let content = readTemplate(templatePath, iconLibrary);

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
export async function createUnoConfig(
  projectRoot: string,
  iconLibrary: string,
): Promise<void> {
  const { readComponentsConfig, isTypeScriptProject } = await import(
    "./config.js"
  );
  const config = readComponentsConfig();
  const typescript = isTypeScriptProject(config);

  const extension = typescript ? "ts" : "js";
  const filename = `uno.config.${extension}`;
  const filepath = join(projectRoot, filename);

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
export async function createProjectFiles(
  projectRoot: string,
  iconLibrary: string,
): Promise<void> {
  await createUnoConfig(projectRoot, iconLibrary);
  createGlobalCSS(projectRoot);
}

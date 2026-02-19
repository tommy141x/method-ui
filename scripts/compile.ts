/**
 * Comprehensive component metadata generator
 * Extracts props, variants, examples, dependencies, and source code from component files
 *
 * Run with: bun run compile
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import * as ts from "typescript";

interface PropDoc {
  name: string;
  type: string;
  description?: string;
  required?: boolean;
  defaultValue?: string;
}

interface VariantDoc {
  name: string;
  values: string[];
  defaultValue?: string;
}

interface ExampleDoc {
  title: string;
  description?: string;
  source: string;
}

interface DependencyInfo {
  components: string[];
  packages: string[];
}

interface ComponentMetadata {
  name: string;
  fileName: string;
  description?: string;
  props: PropDoc[];
  variants: VariantDoc[];
  examples: ExampleDoc[];
  dependencies: DependencyInfo;
  files: string[];
}

/**
 * Remove excess indentation from source code
 */
function dedent(code: string): string {
  const lines = code.split("\n");

  // Remove leading/trailing empty lines
  while (lines.length > 0 && lines[0].trim() === "") {
    lines.shift();
  }
  while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
    lines.pop();
  }

  if (lines.length === 0) return "";

  // Get indentation of lines after the first (which is usually the wrapper)
  const indents = lines
    .slice(1)
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const match = line.match(/^(\s*)/);
      return match ? match[1].length : 0;
    });

  const minIndent = indents.length > 0 ? Math.min(...indents) : 0;

  // Remove that indentation from all lines
  return lines
    .map((line, i) => {
      // For the first line, only trim leading whitespace
      if (i === 0) return line.trimStart();
      return line.slice(minIndent);
    })
    .join("\n");
}

/**
 * Auto-generate description from prop name
 */
function generateDescriptionFromPropName(propName: string): string {
  const descriptions: Record<string, string> = {
    variant: "Visual style variant",
    size: "Size",
    class: "Additional CSS classes",
    className: "Additional CSS classes",
    children: "Child elements or content",
    disabled: "Whether the component is disabled",
    required: "Whether the field is required",
    placeholder: "Placeholder text",
    value: "Current value",
    defaultValue: "Default value",
    onChange: "Change event handler",
    onClick: "Click event handler",
    onSubmit: "Submit event handler",
    onBlur: "Blur event handler",
    onFocus: "Focus event handler",
    open: "Whether the component is open",
    onOpenChange: "Callback when open state changes",
    label: "Label text",
    error: "Error message",
    hint: "Helper text",
    icon: "Icon component or class",
    title: "Title text",
    description: "Description text",
    content: "Content to display",
    type: "Type of input or element",
  };

  if (descriptions[propName]) {
    return descriptions[propName];
  }

  // Generate from camelCase
  const words = propName.replace(/([A-Z])/g, " $1").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * Extract props from TypeScript interface
 * Auto-generates descriptions from prop names
 */
function extractPropsFromInterface(
  sourceFile: ts.SourceFile,
  interfaceName: string,
  _checker: ts.TypeChecker,
): PropDoc[] {
  const props: PropDoc[] = [];

  function extractPropsFromNode(node: ts.Node) {
    // For property signatures (interface members)
    if (
      ts.isPropertySignature(node) &&
      node.name &&
      ts.isIdentifier(node.name)
    ) {
      const propName = node.name.text;
      const isOptional = !!node.questionToken;

      // Get type string
      let typeString = "any";
      if (node.type) {
        typeString = node.type.getText(sourceFile);
      }

      // Auto-generate description
      const description = generateDescriptionFromPropName(propName);

      props.push({
        name: propName,
        type: typeString,
        description,
        required: !isOptional,
        defaultValue: undefined, // Will be filled from CVA defaults if available
      });
      return; // Don't recurse into property signature
    }

    // For type literals (object types)
    if (ts.isTypeLiteralNode(node)) {
      for (const member of node.members) {
        extractPropsFromNode(member);
      }
      return; // Already processed children
    }

    // Recursively visit child nodes
    ts.forEachChild(node, extractPropsFromNode);
  }

  function visit(node: ts.Node) {
    // Look for type alias with our interface name
    if (ts.isTypeAliasDeclaration(node) && node.name.text === interfaceName) {
      extractPropsFromNode(node.type);
    }

    // Look for interface declaration
    if (ts.isInterfaceDeclaration(node) && node.name.text === interfaceName) {
      for (const member of node.members) {
        extractPropsFromNode(member);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return props;
}

/**
 * Extract variants from the CVA variable referenced in meta.variants
 */
function extractVariantsFromMeta(
  sourceCode: string,
  _sourceFile: ts.SourceFile,
): VariantDoc[] {
  const variants: VariantDoc[] = [];

  // Find: variants: buttonVariants (or whatever variable name)
  const variantsRefMatch = sourceCode.match(/variants:\s*(\w+)/);
  if (!variantsRefMatch) return variants;

  const variantVarName = variantsRefMatch[1];

  // Find the CVA definition for this variable
  const cvaStart = sourceCode.indexOf(`const ${variantVarName} = cva`);
  if (cvaStart === -1) return variants;

  // Find the variants: { ... } block within the CVA definition
  const afterCva = sourceCode.substring(cvaStart);
  const variantsBlockStart = afterCva.indexOf("variants:");
  if (variantsBlockStart === -1) return variants;

  // Extract the variants block by matching braces
  let braceCount = 0;
  let inVariantsBlock = false;
  let variantsContent = "";
  let i = variantsBlockStart;

  while (i < afterCva.length) {
    const char = afterCva[i];

    if (char === "{") {
      if (braceCount === 0) inVariantsBlock = true;
      braceCount++;
    } else if (char === "}") {
      braceCount--;
      if (braceCount === 0 && inVariantsBlock) {
        break;
      }
    }

    if (inVariantsBlock && braceCount > 0) {
      variantsContent += char;
    }

    i++;
  }

  // Parse each variant from the content
  // Each variant is: variantName: { value1: "...", value2: "..." }
  const variantRegex = /(\w+):\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;
  let match: RegExpExecArray | null = variantRegex.exec(variantsContent);

  while (match !== null) {
    const variantName = match[1];
    const variantValuesBlock = match[2];

    // Extract the value names (keys before colons, excluding CSS properties like hover:)
    const valueMatches = variantValuesBlock.matchAll(/^\s*(\w+):/gm);
    const values: string[] = [];

    for (const valueMatch of valueMatches) {
      const valueName = valueMatch[1];
      // Skip if it looks like a CSS property
      if (
        !valueName.match(
          /^(hover|focus|active|disabled|group|peer|before|after|first|last)/,
        )
      ) {
        values.push(valueName);
      }
    }

    // Find default value
    const defaultRegex = new RegExp(
      `defaultVariants:\\s*\\{[^}]*${variantName}:\\s*["']([^"']+)["']`,
    );
    const defaultMatch = afterCva.match(defaultRegex);
    const defaultValue = defaultMatch ? defaultMatch[1] : undefined;

    if (values.length > 0) {
      variants.push({
        name: variantName,
        values,
        defaultValue,
      });
    }

    match = variantRegex.exec(variantsContent);
  }

  return variants;
}

/**
 * Extract examples from meta export - reads JSX directly from source
 */
function extractExamplesFromMeta(sourceCode: string): ExampleDoc[] {
  const examples: ExampleDoc[] = [];

  // Create a TypeScript source file for AST parsing
  const sourceFile = ts.createSourceFile(
    "temp.tsx",
    sourceCode,
    ts.ScriptTarget.Latest,
    true,
  );

  // Find the meta export
  let metaExport: ts.VariableStatement | undefined;
  ts.forEachChild(sourceFile, (node) => {
    if (
      ts.isVariableStatement(node) &&
      node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      const declaration = node.declarationList.declarations[0];
      if (
        declaration &&
        ts.isIdentifier(declaration.name) &&
        declaration.name.text === "meta"
      ) {
        metaExport = node;
      }
    }
  });

  if (!metaExport) return examples;

  const declaration = metaExport.declarationList.declarations[0];
  if (
    !declaration.initializer ||
    !ts.isObjectLiteralExpression(declaration.initializer)
  ) {
    return examples;
  }

  // Find the examples property
  const metaObject = declaration.initializer;
  let examplesArray: ts.ArrayLiteralExpression | undefined;

  for (const prop of metaObject.properties) {
    if (
      ts.isPropertyAssignment(prop) &&
      ts.isIdentifier(prop.name) &&
      prop.name.text === "examples" &&
      ts.isArrayLiteralExpression(prop.initializer)
    ) {
      examplesArray = prop.initializer;
      break;
    }
  }

  if (!examplesArray) return examples;

  // Extract each example
  for (const element of examplesArray.elements) {
    if (!ts.isObjectLiteralExpression(element)) continue;

    let title = "";
    let description: string | undefined;
    let codeFunction: ts.ArrowFunction | undefined;

    // Extract properties from the example object
    for (const prop of element.properties) {
      if (!ts.isPropertyAssignment(prop)) continue;

      const propName =
        ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name)
          ? prop.name.text
          : "";

      if (propName === "title" && ts.isStringLiteral(prop.initializer)) {
        title = prop.initializer.text;
      } else if (
        propName === "description" &&
        ts.isStringLiteral(prop.initializer)
      ) {
        description = prop.initializer.text;
      } else if (propName === "code" && ts.isArrowFunction(prop.initializer)) {
        codeFunction = prop.initializer;
      }
    }

    if (!title || !codeFunction) continue;

    // Extract JSX from the code function body
    let jsxSource = "";

    if (ts.isParenthesizedExpression(codeFunction.body)) {
      // () => (JSX)
      jsxSource = codeFunction.body.expression.getText(sourceFile);
    } else if (
      ts.isJsxElement(codeFunction.body) ||
      ts.isJsxSelfClosingElement(codeFunction.body) ||
      ts.isJsxFragment(codeFunction.body)
    ) {
      // () => <JSX>
      jsxSource = codeFunction.body.getText(sourceFile);
    } else if (ts.isBlock(codeFunction.body)) {
      // () => { ... }
      // Check if there are variable declarations before the return
      const hasVariableDeclarations = codeFunction.body.statements.some(
        (stmt) => ts.isVariableStatement(stmt),
      );

      if (hasVariableDeclarations) {
        // Include the entire function body with variable declarations
        // Extract everything between { and }
        const bodyText = codeFunction.body.getText(sourceFile);
        // Remove the surrounding braces and trim
        jsxSource = bodyText.substring(1, bodyText.length - 1).trim();
      } else {
        // Just extract the return statement JSX
        for (const statement of codeFunction.body.statements) {
          if (ts.isReturnStatement(statement) && statement.expression) {
            if (ts.isParenthesizedExpression(statement.expression)) {
              jsxSource = statement.expression.expression.getText(sourceFile);
            } else {
              jsxSource = statement.expression.getText(sourceFile);
            }
            break;
          }
        }
      }
    }

    if (!jsxSource) continue;

    examples.push({
      title,
      description,
      source: dedent(jsxSource),
    });
  }

  return examples;
}

/**
 * Extract component description from meta
 */
function extractDescription(sourceCode: string): string | undefined {
  const descRegex =
    /export\s+const\s+meta[^=]*=\s*\{[\s\S]*?description:\s*["']([^"']+)["']/;
  const match = sourceCode.match(descRegex);
  return match ? match[1] : undefined;
}

/**
 * Extract dependencies from component source code
 */
function extractDependencies(
  sourceCode: string,
  fileName: string,
): DependencyInfo {
  const componentDeps = new Set<string>();
  const packageDeps = new Set<string>();

  // Extract only the import section at the top of the file
  // Stop at the first actual code (export, const, function, interface, etc.)
  // but skip over comments and JSDoc blocks
  const lines = sourceCode.split("\n");
  const importLines: string[] = [];
  let inBlockComment = false;
  let inImportStatement = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Track block comment state
    if (trimmed.startsWith("/*") || trimmed.includes("/**")) {
      inBlockComment = true;
    }
    if (trimmed.includes("*/")) {
      inBlockComment = false;
      continue; // Skip the closing line
    }

    // Track multi-line import statements
    if (trimmed.startsWith("import ")) {
      inImportStatement = true;
      importLines.push(line);
      // Check if import ends on same line
      if (trimmed.includes(";") || trimmed.match(/from\s+['"][^'"]+['"]/)) {
        inImportStatement = false;
      }
      continue;
    }

    // Continue multi-line import
    if (inImportStatement) {
      importLines.push(line);
      // Check if import ends on this line
      if (trimmed.includes(";") || trimmed.match(/from\s+['"][^'"]+['"]/)) {
        inImportStatement = false;
      }
      continue;
    }

    // Include whitespace
    if (trimmed === "") {
      importLines.push(line);
    }
    // Skip comments
    else if (
      trimmed.startsWith("//") ||
      trimmed.startsWith("*") ||
      inBlockComment
    ) {
    }
    // Stop at first actual code
    else if (
      trimmed.startsWith("export") ||
      trimmed.startsWith("const ") ||
      trimmed.startsWith("let ") ||
      trimmed.startsWith("var ") ||
      trimmed.startsWith("function ") ||
      trimmed.startsWith("interface ") ||
      trimmed.startsWith("type ") ||
      trimmed.startsWith("class ")
    ) {
      break;
    }
  }

  const importSection = importLines.join("\n");

  // Patterns to match various import styles
  const importRegex =
    /import\s+(?:{[^}]*}|[^{,\s]+|\*\s+as\s+\w+)\s+from\s+['"]([^'"]+)['"]/g;
  const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

  const allMatches = [
    ...importSection.matchAll(importRegex),
    ...importSection.matchAll(dynamicImportRegex),
  ];

  for (const match of allMatches) {
    const source = match[1];
    if (!source) continue;

    // Check if it's a relative import (component dependency)
    if (source.startsWith("./") || source.startsWith("../")) {
      // Extract component name from path
      const componentName = source
        .replace(/^\.\.\//, "")
        .replace(/^\.\//, "")
        .replace(/\.(tsx?|jsx?)$/, "")
        .split("/")
        .pop();

      // Ignore utility imports
      if (
        componentName &&
        componentName !== "cn" &&
        componentName !== "icon" &&
        componentName !== "meta" &&
        componentName !== fileName
      ) {
        componentDeps.add(componentName);
      }
    } else if (!source.startsWith("/") && !source.startsWith(".")) {
      // External package dependency
      const packageName = source.startsWith("@")
        ? source.split("/").slice(0, 2).join("/")
        : source.split("/")[0];

      // Ignore certain packages
      if (
        packageName !== "solid-js" &&
        packageName !== "solid-js/web" &&
        !packageName.startsWith("node:")
      ) {
        packageDeps.add(packageName);
      }
    }
  }

  return {
    components: Array.from(componentDeps).sort(),
    packages: Array.from(packageDeps).sort(),
  };
}

/**
 * Get all files associated with a component
 */
function getComponentFiles(fileName: string): string[] {
  return [`${fileName}.tsx`];
}

/**
 * Process a single component and return its metadata
 */
function processComponent(
  file: string,
  componentsDir: string,
  quiet: boolean = false,
  program?: ts.Program,
): ComponentMetadata {
  const filePath = join(componentsDir, file);
  const sourceCode = readFileSync(filePath, "utf-8");
  const fileName = file.replace(".tsx", "");

  const componentName =
    fileName.charAt(0).toUpperCase() +
    fileName.slice(1).replace(/-([a-z])/g, (_, l) => l.toUpperCase());

  if (!quiet) {
    console.log(`Processing: ${fileName}`);
  }

  // Create TypeScript source file for prop extraction
  const sourceFile = ts.createSourceFile(
    file,
    sourceCode,
    ts.ScriptTarget.Latest,
    true,
  );

  // Extract props interface name from ComponentMeta<PropsInterface>
  let interfaceName = `${componentName}Props`; // Default fallback
  const metaGenericMatch = sourceCode.match(/ComponentMeta<(\w+)>/);
  if (metaGenericMatch) {
    interfaceName = metaGenericMatch[1];
    if (!quiet) {
      console.log(`  Found props interface: ${interfaceName}`);
    }
  }

  // Use cached program or create new one
  let typeCheckerProgram = program;
  if (!typeCheckerProgram) {
    typeCheckerProgram = ts.createProgram([filePath], {
      target: ts.ScriptTarget.Latest,
      module: ts.ModuleKind.ESNext,
    });
  }
  const checker = typeCheckerProgram.getTypeChecker();

  const props = extractPropsFromInterface(sourceFile, interfaceName, checker);
  const variants = extractVariantsFromMeta(sourceCode, sourceFile);
  const examples = extractExamplesFromMeta(sourceCode);
  const description = extractDescription(sourceCode);

  // Merge default values from variants into props
  for (const variant of variants) {
    const prop = props.find((p) => p.name === variant.name);
    if (prop && variant.defaultValue && !prop.defaultValue) {
      prop.defaultValue = `"${variant.defaultValue}"`;
    }
  }

  const dependencies = extractDependencies(sourceCode, fileName);
  const files = getComponentFiles(fileName);

  if (!quiet) {
    console.log(`  Props: ${props.length}`);
    console.log(`  Variants: ${variants.length}`);
    console.log(`  Examples: ${examples.length}`);
    console.log(`  Component Dependencies: ${dependencies.components.length}`);
    console.log(`  Package Dependencies: ${dependencies.packages.length}`);
  }

  return {
    name: componentName,
    fileName,
    description,
    props,
    variants,
    examples,
    dependencies,
    files,
  };
}

/**
 * Generate metadata for all components or a specific component
 */
export async function generateComponentMetadata(specificFile?: string) {
  const componentsDir = join(process.cwd(), "components");
  const outputFile = join(process.cwd(), "lib", "registry.json");

  let allMetadata: Record<string, ComponentMetadata> = {};

  // Load existing metadata if we're doing an incremental update
  if (specificFile) {
    try {
      const existingData = readFileSync(outputFile, "utf-8");
      const existing = JSON.parse(existingData);
      allMetadata = existing.componentMetadata || {};
    } catch (_error) {
      // File doesn't exist yet, that's ok
      console.log("No existing metadata found, generating from scratch...");
    }
  }

  console.log("Extracting component metadata...\n");

  if (specificFile) {
    // Process only the specific file
    if (!specificFile.endsWith(".tsx")) {
      console.error(`Error: ${specificFile} is not a .tsx file`);
      return;
    }

    const fileName = specificFile.replace(".tsx", "");
    allMetadata[fileName] = processComponent(
      specificFile,
      componentsDir,
      false,
    );
  } else {
    // Process all components in parallel
    const files = readdirSync(componentsDir).filter((f) => f.endsWith(".tsx"));

    console.log(`⚡ Processing ${files.length} components in parallel...`);
    const startTime = Date.now();

    // Create a shared TypeScript program for all components (much faster)
    const filePaths = files.map((f) => join(componentsDir, f));
    const sharedProgram = ts.createProgram(filePaths, {
      target: ts.ScriptTarget.Latest,
      module: ts.ModuleKind.ESNext,
    });

    const results = await Promise.all(
      files.map(async (file) => {
        const fileName = file.replace(".tsx", "");
        const metadata = processComponent(
          file,
          componentsDir,
          true,
          sharedProgram,
        );
        return { fileName, metadata };
      }),
    );

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✓ Completed in ${elapsed}s\n`);

    // Collect results
    for (const { fileName, metadata } of results) {
      allMetadata[fileName] = metadata;
    }
  }

  // Generate JSON file
  const output = {
    $schema: "https://method-ui.dev/schema/registry.json",
    _comment:
      "AUTO-GENERATED FILE - DO NOT EDIT. Generated by scripts/compile.ts. Run: bun run compile",
    name: "method-ui",
    version: "0.1.0",
    componentMetadata: allMetadata,
    componentList: Object.keys(allMetadata),
  };

  writeFileSync(outputFile, JSON.stringify(output, null, 2));

  console.log(
    `\n✓ Generated registry metadata for ${Object.keys(allMetadata).length} components`,
  );
  console.log(`  Output: ${outputFile}`);

  // Log dependency statistics
  const totalComponentDeps = Object.values(allMetadata).reduce(
    (sum, meta) => sum + meta.dependencies.components.length,
    0,
  );
  const totalPackageDeps = new Set(
    Object.values(allMetadata).flatMap((meta) => meta.dependencies.packages),
  ).size;

  console.log(`\n📦 Dependency Summary:`);
  console.log(`  Total component dependencies: ${totalComponentDeps}`);
  console.log(`  Unique package dependencies: ${totalPackageDeps}`);
}

// Run it only if called directly - check for command line argument
if (import.meta.main) {
  const specificFile = process.argv[2];
  await generateComponentMetadata(specificFile);
}

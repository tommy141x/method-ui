/**
 * Utility functions for transforming TypeScript code to JavaScript
 * Uses the TypeScript compiler API for accurate transformations
 */

import * as ts from "typescript";

/**
 * Transform TypeScript code to JavaScript using the TypeScript compiler API
 */
export function transformTypeScriptToJavaScript(tsCode: string): string {
  try {
    // Create compiler options for JavaScript output
    const compilerOptions: ts.CompilerOptions = {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.Preserve,
      allowJs: true,
      removeComments: false,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      skipLibCheck: true,
      strict: false, // We don't need strict checking for transformation
    };

    // Transform the code
    const result = ts.transpileModule(tsCode, {
      compilerOptions,
      transformers: {
        before: [
          // Custom transformer to clean up any remaining type artifacts
          (context: ts.TransformationContext) => {
            return (sourceFile: ts.SourceFile) => {
              function visit(node: ts.Node): ts.Node {
                // Remove type-only imports completely
                if (ts.isImportDeclaration(node) && node.importClause) {
                  const importClause = node.importClause;
                  if (importClause.isTypeOnly) {
                    // Return an empty statement that will be removed
                    return ts.factory.createEmptyStatement();
                  }

                  // Clean named imports of type-only imports
                  if (
                    importClause.namedBindings &&
                    ts.isNamedImports(importClause.namedBindings)
                  ) {
                    const elements = importClause.namedBindings.elements.filter(
                      (element) => !element.isTypeOnly,
                    );

                    if (elements.length === 0) {
                      return ts.factory.createEmptyStatement();
                    }

                    if (
                      elements.length !==
                      importClause.namedBindings.elements.length
                    ) {
                      return ts.factory.updateImportDeclaration(
                        node,
                        node.modifiers,
                        ts.factory.updateImportClause(
                          importClause,
                          importClause.isTypeOnly,
                          importClause.name,
                          ts.factory.updateNamedImports(
                            importClause.namedBindings,
                            elements,
                          ),
                        ),
                        node.moduleSpecifier,
                        undefined,
                      );
                    }
                  }
                }

                return ts.visitEachChild(node, visit, context);
              }

              return ts.visitNode(sourceFile, visit) as ts.SourceFile;
            };
          },
        ],
      },
    });

    return result.outputText;
  } catch (error) {
    console.warn(
      "TypeScript transformation failed, falling back to simple regex replacement:",
      error,
    );
    return fallbackTransform(tsCode);
  }
}

/**
 * Fallback transformation using simple regex patterns
 * Used if TypeScript compiler API fails
 */
function fallbackTransform(tsCode: string): string {
  let jsCode = tsCode;

  // Remove import type statements
  jsCode = jsCode.replace(/import\s+type\s+[^;]+;?\s*\n?/g, "");

  // Remove export type statements
  jsCode = jsCode.replace(/export\s+type\s+[^;=]+[;=][^;]*;?\s*\n?/g, "");

  // Remove interface declarations (be more careful)
  jsCode = jsCode.replace(
    /interface\s+\w+[^{]*{[^{}]*(?:{[^{}]*}[^{}]*)*}\s*/g,
    "",
  );

  // Remove type aliases
  jsCode = jsCode.replace(/type\s+\w+\s*=\s*[^;]+;?\s*\n?/g, "");

  // Clean up type annotations in imports (conservative)
  jsCode = jsCode.replace(
    /import\s*{\s*([^}]+)\s*}\s*from\s*["']([^"']+)["']/g,
    (match, imports, module) => {
      const cleanImports = imports
        .split(",")
        .map((imp: string) => {
          return imp
            .trim()
            .replace(/^type\s+/, "")
            .replace(/:\s*[^,}]+/g, "")
            .trim();
        })
        .filter((imp: string) => imp.length > 0 && imp !== "type")
        .join(", ");

      if (cleanImports.length === 0) {
        return "";
      }

      return `import { ${cleanImports} } from "${module}"`;
    },
  );

  // Clean up empty lines
  jsCode = jsCode
    .replace(/\n\s*\n\s*\n/g, "\n\n")
    .replace(/^\s*\n/gm, "")
    .trim();

  return jsCode;
}

/**
 * Convert file extension from TypeScript to JavaScript
 */
export function convertFileExtension(filename: string): string {
  return filename.replace(/\.tsx?$/, ".js");
}

/**
 * Convert JSX file extension appropriately
 */
export function convertJSXExtension(filename: string): string {
  return filename.replace(/\.tsx$/, ".jsx");
}

/**
 * Check if code contains TypeScript-specific syntax
 */
export function containsTypeScript(code: string): boolean {
  const tsPatterns = [
    /:\s*\w+[\w\[\]<>|&\s]*[,)=]/, // Type annotations
    /interface\s+\w+/, // Interface declarations
    /type\s+\w+\s*=/, // Type aliases
    /import\s+type/, // Type imports
    /<[A-Z]\w*>/, // Generic types
    /export\s+type/, // Type exports
  ];

  return tsPatterns.some((pattern) => pattern.test(code));
}

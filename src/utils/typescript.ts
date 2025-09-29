/**
 * Utility functions for transforming TypeScript code to JavaScript
 */

/**
 * Transform TypeScript code to JavaScript
 * Removes type annotations and converts import/export syntax
 */
export function transformTypeScriptToJavaScript(tsCode: string): string {
  let jsCode = tsCode;

  // Remove type annotations from imports
  jsCode = jsCode.replace(
    /import\s+(?:type\s+)?{([^}]+)}\s+from\s+["']([^"']+)["']/g,
    (match, imports, module) => {
      // Remove type annotations from import list
      const cleanImports = imports
        .split(',')
        .map((imp: string) => {
          return imp
            .trim()
            .replace(/:\s*[^,]+/g, '') // Remove : Type annotations
            .replace(/\s+as\s+\w+/g, '') // Remove 'as' aliases for now
            .trim();
        })
        .filter((imp: string) => imp.length > 0)
        .join(', ');

      return `import { ${cleanImports} } from "${module}"`;
    }
  );

  // Remove standalone type imports
  jsCode = jsCode.replace(/import\s+type\s+[^;]+;?\s*\n?/g, '');

  // Remove type annotations from function parameters
  jsCode = jsCode.replace(
    /(\w+):\s*[^,)=]+/g,
    '$1'
  );

  // Remove return type annotations
  jsCode = jsCode.replace(
    /\):\s*[^{]+{/g,
    ') {'
  );

  // Remove interface declarations
  jsCode = jsCode.replace(/interface\s+\w+\s*{[^}]*}\s*/g, '');

  // Remove type assertions
  jsCode = jsCode.replace(/\s+as\s+\w+/g, '');

  // Remove generic type parameters
  jsCode = jsCode.replace(/<[^>]+>/g, '');

  // Remove export type declarations
  jsCode = jsCode.replace(/export\s+type\s+[^;]+;?\s*\n?/g, '');

  // Clean up extra whitespace and empty lines
  jsCode = jsCode
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove multiple empty lines
    .replace(/,\s*}/g, '\n}') // Clean up trailing commas in objects
    .trim();

  return jsCode;
}

/**
 * Convert file extension from .ts to .js
 */
export function convertFileExtension(filename: string): string {
  return filename.replace(/\.ts$/, '.js');
}

/**
 * Check if code contains TypeScript-specific syntax
 */
export function containsTypeScript(code: string): boolean {
  const tsPatterns = [
    /:\s*\w+/,           // Type annotations
    /interface\s+\w+/,    // Interface declarations
    /type\s+\w+\s*=/,     // Type aliases
    /<[^>]+>/,           // Generic types
    /import\s+type/,      // Type imports
  ];

  return tsPatterns.some(pattern => pattern.test(code));
}

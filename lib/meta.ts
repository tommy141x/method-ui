import type { JSX } from "solid-js";

export interface PropDefinition {
  name: string;
  type: string;
  description?: string;
  required?: boolean;
  defaultValue?: string;
}

export interface ComponentExample {
  title: string;
  description?: string;
  code: () => JSX.Element;
  // Source will be auto-extracted from code function if not provided
  source?: string;
}

export interface ComponentMeta<TProps = any> {
  name: string;
  description: string;
  variants?: any; // Pass existing cva variants (e.g., buttonVariants)
  // Props, variants, and examples are auto-extracted at build time
  // Run: bun run generate:metadata
  examples: ComponentExample[];
}

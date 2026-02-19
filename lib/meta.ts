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

export interface ComponentMeta<_TProps = unknown> {
	name: string;
	description: string;
	apiReference?: string; // Link to API reference documentation. Defaults to https://ark-ui.com/docs/components/{component-name}#api-reference if not specified
	variants?: unknown; // Pass existing cva variants (e.g., buttonVariants)
	// Props, variants, and examples are auto-extracted at build time
	// Run: bun run generate:metadata
	examples: ComponentExample[];
	hidden?: boolean; // Hide this component from docs navigation and component list
}

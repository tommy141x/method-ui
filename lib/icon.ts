/**
 * Icon utility function that returns the correct icon class based on the project's icon library.
 * This function is replaced at build time by the CLI with the actual icon library prefix.
 *
 * @param name - The icon name (e.g., 'check', 'x', 'chevron-down')
 * @returns The full UnoCSS icon class (e.g., 'i-lucide-check')
 */
export function icon(name: string): string {
	// This will be replaced by the CLI at build time with:
	// return `i-{iconLibrary}-${name}`
	return `i-lucide-${name}`;
}

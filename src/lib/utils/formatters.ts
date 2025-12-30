/**
 * Convert kebab-case string to Title Case
 */
export function toTitleCase(str: string): string {
	return str
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

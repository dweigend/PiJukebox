/**
 * Text formatting utilities
 */

/**
 * Format text to title case with proper spacing
 * @example
 * formatTitle("ein_geschenk_des_himmels") // => "Ein Geschenk Des Himmels"
 * formatTitle("01_song_name.mp3") // => "Song Name"
 */
export function formatTitle(text: string): string {
	return text
		.replace(/\.\w+$/i, '') // Remove extension (e.g., .mp3)
		.replace(/^\d+[_-]/, '') // Remove leading number prefix (01_, 02-)
		.replace(/[_-]/g, ' ') // Replace underscores/hyphens with spaces
		.trim()
		.replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize each word
}

/**
 * Sanitize filename for safe filesystem and URL usage
 * Converts special characters, umlauts, and spaces to filesystem-safe format
 * @example
 * sanitizeFilename("01 - Ein Lied für dich.mp3") // => "01-ein-lied-fuer-dich.mp3"
 * sanitizeFilename("Meine Musik (2024).mp3") // => "meine-musik-2024.mp3"
 */
export function sanitizeFilename(filename: string): string {
	// Extract extension
	const extension = filename.match(/\.\w+$/)?.[0] || '';
	const nameWithoutExt = filename.replace(/\.\w+$/, '');

	// Umlaut conversion map
	const umlautMap: Record<string, string> = {
		ä: 'ae',
		ö: 'oe',
		ü: 'ue',
		ß: 'ss',
		Ä: 'Ae',
		Ö: 'Oe',
		Ü: 'Ue'
	};

	return (
		nameWithoutExt
			// Replace umlauts
			.replace(/[äöüßÄÖÜ]/g, (char) => umlautMap[char] || char)
			// Convert to lowercase
			.toLowerCase()
			// Replace spaces and special chars with hyphens
			.replace(/[\s()[\]{}]+/g, '-')
			// Remove all non-alphanumeric except hyphens, underscores, dots
			.replace(/[^a-z0-9._-]/g, '')
			// Replace multiple consecutive hyphens/underscores with single hyphen
			.replace(/[-_]+/g, '-')
			// Remove leading/trailing hyphens
			.replace(/^-+|-+$/g, '') + extension.toLowerCase()
	);
}

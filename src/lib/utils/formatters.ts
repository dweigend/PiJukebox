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

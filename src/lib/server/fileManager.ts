/**
 * File manager for music folder operations
 */

import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import type { Folder, Song } from '$lib/types';

const MUSIC_DIR = 'music';

/**
 * Check if folder exists in music directory
 */
export async function folderExists(folderName: string): Promise<boolean> {
	try {
		const folderPath = join(MUSIC_DIR, folderName);
		const stats = await stat(folderPath);
		return stats.isDirectory();
	} catch {
		return false;
	}
}

/**
 * Get all music folders (albums)
 */
export async function getAllFolders(): Promise<string[]> {
	const entries = await readdir(MUSIC_DIR, { withFileTypes: true });
	return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
}

/**
 * Get all MP3 files in folder as Song objects
 */
export async function getFolderSongs(folderName: string): Promise<Song[]> {
	const folderPath = join(MUSIC_DIR, folderName);
	const exists = await folderExists(folderName);

	if (!exists) {
		return [];
	}

	const files = await readdir(folderPath);
	const mp3Files = files.filter((file) => file.toLowerCase().endsWith('.mp3'));

	return mp3Files.map((filename) => ({
		filename,
		path: join(folderPath, filename),
		title: deriveTitle(filename)
	}));
}

/**
 * Get complete folder with songs
 */
export async function getFolder(folderName: string): Promise<Folder | null> {
	const exists = await folderExists(folderName);

	if (!exists) {
		return null;
	}

	const songs = await getFolderSongs(folderName);
	return {
		name: folderName,
		songs,
		path: join(MUSIC_DIR, folderName)
	};
}

/**
 * Derive song title from filename
 * Example: "01_song_name.mp3" -> "Song Name"
 */
function deriveTitle(filename: string): string {
	return filename
		.replace(/\.mp3$/i, '') // Remove extension
		.replace(/^\d+[_-]/, '') // Remove leading number prefix (01_, 02-)
		.replace(/[_-]/g, ' ') // Replace underscores/hyphens with spaces
		.trim()
		.replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize words
}

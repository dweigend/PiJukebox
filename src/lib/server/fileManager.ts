/**
 * File manager for music folder operations
 */

import { readdir, stat, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { formatTitle, sanitizeFilename } from '$lib/utils/formatters';
import type { Folder, Song } from '$lib/types';

const MUSIC_DIR = 'static/music';

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
		path: `/music/${folderName}/${filename}`,
		title: formatTitle(filename)
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
		path: `/music/${folderName}`
	};
}

/**
 * Create new music folder
 */
export async function createFolder(folderName: string): Promise<void> {
	const folderPath = join(MUSIC_DIR, folderName);
	await mkdir(folderPath, { recursive: true });
}

/**
 * Save MP3 file to folder with sanitized filename
 * @returns The sanitized filename that was actually saved
 */
export async function saveMP3(
	folderName: string,
	filename: string,
	buffer: Buffer
): Promise<string> {
	const sanitizedFilename = sanitizeFilename(filename);
	const folderPath = join(MUSIC_DIR, folderName);
	const filePath = join(folderPath, sanitizedFilename);
	await writeFile(filePath, buffer);
	return sanitizedFilename;
}

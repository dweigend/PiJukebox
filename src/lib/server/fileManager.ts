/**
 * File manager for music folder operations
 */

import { readdir, stat, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { formatTitle, sanitizeFilename } from '$lib/utils/formatters';
import type { Folder, Song } from '$lib/types';

/**
 * Music directory path - environment-dependent
 *
 * WHY DIFFERENT PATHS?
 * - Development: Vite dev server serves static files directly from 'static/' directory
 * - Production: SvelteKit adapter-node serves static files from 'build/client/' directory
 *
 * HOW IT WORKS:
 * 1. Development (bun run dev):
 *    - Uploads go to: static/music/
 *    - Vite serves: /music/* → static/music/*
 *    - ✅ Uploads immediately accessible
 *
 * 2. Production (after bun run build):
 *    - Build process: SvelteKit automatically copies static/* → build/client/*
 *    - Uploads go to: build/client/music/ (runtime directory)
 *    - Node serves: /music/* → build/client/music/*
 *    - ✅ Uploads immediately accessible without rebuild
 *
 * AUTOMATIC MIGRATION:
 * - When you run 'bun run build', SvelteKit automatically copies ALL files
 *   from static/music/ → build/client/music/
 * - This means: Any uploads in static/music/ are automatically migrated
 *   to the production directory during the next build
 *
 * DEPLOYMENT:
 * - After deploying new code to Raspberry Pi, run 'bun run build'
 * - This will automatically migrate any existing uploads from static/music/
 *   to build/client/music/
 *
 * ONE-TIME MIGRATION (if needed):
 * - If you have existing uploads on the Pi that need immediate access:
 *   cp -r static/music/* build/client/music/
 */
const MUSIC_DIR =
	process.env.NODE_ENV === 'production'
		? 'build/client/music' // Production: serve from built assets
		: 'static/music'; // Development: serve from source

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
 * Note: Folder name should already be sanitized before calling this function
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

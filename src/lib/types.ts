/**
 * Core type definitions for kinder_audio
 */

/**
 * RFID card mapping to music folder
 */
export interface Card {
	/** 10-digit RFID card identifier */
	id: string;
	/** Name of the music folder (album) */
	folderName: string;
	/** Timestamp when card was assigned */
	assignedAt: Date;
}

/**
 * Music folder (album/playlist)
 */
export interface Folder {
	/** Folder name */
	name: string;
	/** List of songs in folder */
	songs: Song[];
	/** Absolute path to folder */
	path: string;
}

/**
 * Individual song file
 */
export interface Song {
	/** MP3 filename */
	filename: string;
	/** Absolute path to MP3 file */
	path: string;
	/** Song title (derived from filename) */
	title: string;
}

/**
 * Active playlist for audio playback
 */
export interface Playlist {
	/** Associated folder */
	folder: Folder;
	/** Songs in playlist */
	songs: Song[];
	/** Current song index (0-based) */
	currentIndex: number;
}

/**
 * Database schema for lowdb
 */
export interface DatabaseSchema {
	/** Card ID to folder name mappings */
	cards: Record<string, string>;
}

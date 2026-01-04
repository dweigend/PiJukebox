/**
 * Core type definitions for PiJukebox
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
 * Card data stored in database (supports track ordering)
 */
export interface CardData {
	/** Name of the music folder */
	folderName: string;
	/** Optional: Track filenames in desired playback order */
	trackOrder?: string[];
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
 * Player settings
 */
export interface Settings {
	/** Maximum volume (1-100%) */
	maxVolume: number;
	/** Current volume (1-100%) */
	currentVolume: number;
	/** Mute status */
	isMuted: boolean;
}

/**
 * Database schema for lowdb
 * Note: cards uses union type for backwards compatibility with old string entries
 */
export interface DatabaseSchema {
	/** Card ID to folder/CardData mappings */
	cards: Record<string, string | CardData>;
	/** Player settings */
	settings: Settings;
}

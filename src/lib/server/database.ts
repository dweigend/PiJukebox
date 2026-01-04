/**
 * Database wrapper for lowdb v7
 * CRUD operations for RFID card to folder mappings
 */

import { JSONFilePreset } from 'lowdb/node';
import type { DatabaseSchema, Settings, CardData } from '$lib/types';
import { DEFAULT_MAX_VOLUME, DEFAULT_CURRENT_VOLUME } from '$lib/constants';

const DB_PATH = 'data/db.json';

// Default database structure
const defaultData: DatabaseSchema = {
	cards: {},
	settings: {
		maxVolume: DEFAULT_MAX_VOLUME,
		currentVolume: DEFAULT_CURRENT_VOLUME,
		isMuted: false
	}
};

// Initialize database instance
let db: Awaited<ReturnType<typeof JSONFilePreset<DatabaseSchema>>> | null = null;

/**
 * Initialize database connection
 */
async function initDb() {
	if (db === null) {
		db = await JSONFilePreset<DatabaseSchema>(DB_PATH, defaultData);
	}
	return db;
}

/**
 * Get folder name for RFID card (backwards compatible)
 */
export async function getCardMapping(cardId: string): Promise<string | null> {
	const database = await initDb();
	const entry = database.data.cards?.[cardId];
	if (!entry) return null;

	// Normalize: CardData → folderName string
	return typeof entry === 'string' ? entry : entry.folderName;
}

/**
 * Assign folder to RFID card
 */
export async function setCardMapping(cardId: string, folderName: string): Promise<void> {
	const database = await initDb();
	await database.update((data) => {
		if (!data.cards) data.cards = {};
		data.cards[cardId] = folderName;
	});
}

/**
 * Remove card mapping
 */
export async function deleteCardMapping(cardId: string): Promise<void> {
	const database = await initDb();
	await database.update((data) => {
		if (data.cards) {
			delete data.cards[cardId];
		}
	});
}

/**
 * Get all card mappings (backwards compatible - returns only folderNames)
 */
export async function getAllMappings(): Promise<Record<string, string>> {
	const database = await initDb();
	const cards = database.data.cards ?? {};

	// Normalize: CardData → folderName string
	const result: Record<string, string> = {};
	for (const [cardId, entry] of Object.entries(cards)) {
		result[cardId] = typeof entry === 'string' ? entry : entry.folderName;
	}
	return result;
}

/**
 * Get player settings
 */
export async function getSettings(): Promise<Settings> {
	const database = await initDb();
	return (
		database.data.settings ?? {
			maxVolume: DEFAULT_MAX_VOLUME,
			currentVolume: DEFAULT_CURRENT_VOLUME,
			isMuted: false
		}
	);
}

/**
 * Update player settings
 */
export async function updateSettings(settings: Partial<Settings>): Promise<void> {
	const database = await initDb();
	await database.update((data) => {
		if (!data.settings) {
			data.settings = {
				maxVolume: DEFAULT_MAX_VOLUME,
				currentVolume: DEFAULT_CURRENT_VOLUME,
				isMuted: false
			};
		}
		Object.assign(data.settings, settings);
	});
}

/**
 * Get card data with track order (normalizes old string entries)
 */
export async function getCardData(cardId: string): Promise<CardData | null> {
	const database = await initDb();
	const entry = database.data.cards?.[cardId];
	if (!entry) return null;

	// Normalize: string → CardData for backwards compatibility
	if (typeof entry === 'string') {
		return { folderName: entry };
	}
	return entry;
}

/**
 * Save complete card data (folder + optional track order)
 */
export async function setCardData(cardId: string, data: CardData): Promise<void> {
	const database = await initDb();
	await database.update((db) => {
		if (!db.cards) db.cards = {};
		db.cards[cardId] = data;
	});
}

/**
 * Update track order for existing card
 */
export async function setTrackOrder(cardId: string, order: string[]): Promise<void> {
	const database = await initDb();
	const existing = await getCardData(cardId);
	if (!existing) {
		throw new Error(`Card ${cardId} not found`);
	}

	await database.update((db) => {
		db.cards[cardId] = { ...existing, trackOrder: order };
	});
}

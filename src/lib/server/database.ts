/**
 * Database wrapper for lowdb v7
 * CRUD operations for RFID card to folder mappings
 */

import { JSONFilePreset } from 'lowdb/node';
import type { DatabaseSchema } from '$lib/types';

const DB_PATH = 'data/db.json';

// Default database structure
const defaultData: DatabaseSchema = {
	cards: {}
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
 * Get folder name for RFID card
 */
export async function getCardMapping(cardId: string): Promise<string | null> {
	const database = await initDb();
	return database.data.cards[cardId] ?? null;
}

/**
 * Assign folder to RFID card
 */
export async function setCardMapping(cardId: string, folderName: string): Promise<void> {
	const database = await initDb();
	await database.update((data) => {
		data.cards[cardId] = folderName;
	});
}

/**
 * Remove card mapping
 */
export async function deleteCardMapping(cardId: string): Promise<void> {
	const database = await initDb();
	await database.update((data) => {
		delete data.cards[cardId];
	});
}

/**
 * Get all card mappings
 */
export async function getAllMappings(): Promise<Record<string, string>> {
	const database = await initDb();
	return database.data.cards;
}

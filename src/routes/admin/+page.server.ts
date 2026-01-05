/**
 * Admin interface server route
 * Handles card mapping, folder creation, and MP3 uploads
 */

import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	CARD_ID_LENGTH,
	CARD_ID_PATTERN,
	MIN_VOLUME,
	MAX_VOLUME,
	DEFAULT_MAX_VOLUME,
	DEFAULT_CURRENT_VOLUME
} from '$lib/constants';
import {
	getAllMappings,
	setCardMapping,
	deleteCardMapping,
	getSettings,
	updateSettings
} from '$lib/server/database';
import { getAllFolders, getFolderSongs, createFolder, folderExists } from '$lib/server/fileManager';
import { sanitizeFolderName } from '$lib/utils/formatters';

/**
 * Load all card mappings, available folders, and settings
 */
export const load: PageServerLoad = async () => {
	try {
		const mappings = await getAllMappings();
		const folders = await getAllFolders();
		const settings = await getSettings();

		// Build mappings with songs (for CardEditor)
		const mappingsWithSongs = await Promise.all(
			Object.entries(mappings).map(async ([cardId, folderName]) => {
				const songs = await getFolderSongs(folderName);
				return {
					cardId,
					folderName,
					songCount: songs.length,
					songs
				};
			})
		);

		return {
			mappings: mappingsWithSongs,
			folders,
			settings
		};
	} catch (error) {
		console.error('Failed to load admin data:', error);
		return {
			mappings: [],
			folders: [],
			settings: {
				maxVolume: DEFAULT_MAX_VOLUME,
				currentVolume: DEFAULT_CURRENT_VOLUME,
				isMuted: false
			}
		};
	}
};

/**
 * Form actions for admin operations
 */
export const actions: Actions = {
	/**
	 * Assign RFID card to folder
	 */
	assignCard: async ({ request }) => {
		const formData = await request.formData();
		const cardId = formData.get('cardId')?.toString().trim();
		const folderName = formData.get('folderName')?.toString();

		// Validation
		if (!cardId || cardId.length !== CARD_ID_LENGTH || !CARD_ID_PATTERN.test(cardId)) {
			return fail(400, { error: `Card ID must be exactly ${CARD_ID_LENGTH} digits` });
		}

		if (!folderName) {
			return fail(400, { error: 'Folder name is required' });
		}

		const exists = await folderExists(folderName);
		if (!exists) {
			return fail(400, { error: 'Selected folder does not exist' });
		}

		// Save mapping
		await setCardMapping(cardId, folderName);

		return {
			success: true,
			message: `Card ${cardId} assigned to ${folderName}`
		};
	},

	/**
	 * Delete card mapping
	 */
	deleteCard: async ({ request }) => {
		const formData = await request.formData();
		const cardId = formData.get('cardId')?.toString();

		if (!cardId) {
			return fail(400, { error: 'Card ID is required' });
		}

		await deleteCardMapping(cardId);

		return {
			success: true,
			message: `Card ${cardId} mapping deleted`
		};
	},

	/**
	 * Create new music folder with automatic name sanitization
	 */
	createFolder: async ({ request }) => {
		const formData = await request.formData();
		const inputFolderName = formData.get('folderName')?.toString().trim();

		// Validation
		if (!inputFolderName) {
			return fail(400, { error: 'Folder name is required' });
		}

		// Sanitize folder name
		const sanitizedFolderName = sanitizeFolderName(inputFolderName);

		// Check if folder already exists (after sanitization)
		const exists = await folderExists(sanitizedFolderName);
		if (exists) {
			return fail(400, {
				error: `Folder "${sanitizedFolderName}" already exists${inputFolderName !== sanitizedFolderName ? ` (sanitized from "${inputFolderName}")` : ''}`
			});
		}

		// Create folder with sanitized name
		await createFolder(sanitizedFolderName);

		return {
			success: true,
			message:
				inputFolderName === sanitizedFolderName
					? `Folder "${sanitizedFolderName}" created successfully`
					: `Folder created as "${sanitizedFolderName}" (sanitized from "${inputFolderName}")`
		};
	},

	/**
	 * Update player settings
	 */
	updateSettings: async ({ request }) => {
		const formData = await request.formData();
		const maxVolumeStr = formData.get('maxVolume')?.toString();

		// Validation
		if (!maxVolumeStr) {
			return fail(400, { error: 'Maximum volume is required' });
		}

		const maxVolume = parseInt(maxVolumeStr, 10);

		if (isNaN(maxVolume) || maxVolume < MIN_VOLUME || maxVolume > MAX_VOLUME) {
			return fail(400, {
				error: `Maximum volume must be between ${MIN_VOLUME} and ${MAX_VOLUME}`
			});
		}

		// Save settings
		await updateSettings({ maxVolume });

		return {
			success: true,
			message: `Maximum volume set to ${maxVolume}%`
		};
	}
};

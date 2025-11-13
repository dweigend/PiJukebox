/**
 * Admin interface server route
 * Handles card mapping, folder creation, and MP3 uploads
 */

import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getAllMappings, setCardMapping, deleteCardMapping } from '$lib/server/database';
import {
	getAllFolders,
	getFolderSongs,
	createFolder,
	saveMP3,
	folderExists
} from '$lib/server/fileManager';

/**
 * Load all card mappings and available folders
 */
export const load: PageServerLoad = async () => {
	const mappings = await getAllMappings();
	const folders = await getAllFolders();

	// Build mappings with song counts
	const mappingsWithCounts = await Promise.all(
		Object.entries(mappings).map(async ([cardId, folderName]) => {
			const songs = await getFolderSongs(folderName);
			return {
				cardId,
				folderName,
				songCount: songs.length
			};
		})
	);

	return {
		mappings: mappingsWithCounts,
		folders
	};
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
		if (!cardId || cardId.length !== 10 || !/^\d{10}$/.test(cardId)) {
			return fail(400, { error: 'Card ID must be exactly 10 digits' });
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
	 * Create new music folder
	 */
	createFolder: async ({ request }) => {
		const formData = await request.formData();
		const folderName = formData.get('folderName')?.toString().trim();

		// Validation
		if (!folderName) {
			return fail(400, { error: 'Folder name is required' });
		}

		// Check for invalid characters
		if (!/^[a-z0-9_-]+$/i.test(folderName)) {
			return fail(400, {
				error: 'Folder name can only contain letters, numbers, underscores, and hyphens'
			});
		}

		// Check if folder already exists
		const exists = await folderExists(folderName);
		if (exists) {
			return fail(400, { error: 'Folder already exists' });
		}

		// Create folder
		await createFolder(folderName);

		return {
			success: true,
			message: `Folder "${folderName}" created successfully`
		};
	},

	/**
	 * Upload MP3 to folder
	 */
	uploadMP3: async ({ request }) => {
		const formData = await request.formData();
		const folderName = formData.get('folderName')?.toString();
		const file = formData.get('mp3File') as File | null;

		// Validation
		if (!folderName) {
			return fail(400, { error: 'Folder name is required' });
		}

		if (!file || file.size === 0) {
			return fail(400, { error: 'MP3 file is required' });
		}

		// Check file type
		if (!file.name.toLowerCase().endsWith('.mp3')) {
			return fail(400, { error: 'Only MP3 files are allowed' });
		}

		// Check file size (max 10MB)
		const maxSize = 10 * 1024 * 1024; // 10MB
		if (file.size > maxSize) {
			return fail(400, { error: 'File size must be less than 10MB' });
		}

		// Check if folder exists
		const exists = await folderExists(folderName);
		if (!exists) {
			return fail(400, { error: 'Selected folder does not exist' });
		}

		// Save MP3
		const buffer = Buffer.from(await file.arrayBuffer());
		await saveMP3(folderName, file.name, buffer);

		return {
			success: true,
			message: `File "${file.name}" uploaded to ${folderName}`
		};
	}
};

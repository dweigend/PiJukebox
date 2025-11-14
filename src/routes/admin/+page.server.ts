/**
 * Admin interface server route
 * Handles card mapping, folder creation, and MP3 uploads
 */

import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	CARD_ID_LENGTH,
	CARD_ID_PATTERN,
	FOLDER_NAME_PATTERN,
	UPLOAD_MAX_SIZE_BYTES
} from '$lib/constants';
import { getAllMappings, setCardMapping, deleteCardMapping } from '$lib/server/database';
import {
	getAllFolders,
	getFolderSongs,
	createFolder,
	saveMP3,
	folderExists
} from '$lib/server/fileManager';
import { sanitizeFolderName } from '$lib/utils/formatters';

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
	 * Upload MP3(s) to folder
	 */
	uploadMP3: async ({ request }) => {
		const formData = await request.formData();
		const folderName = formData.get('folderName')?.toString();
		const files = formData.getAll('mp3File') as File[];

		// Validation
		if (!folderName) {
			return fail(400, { error: 'Folder name is required' });
		}

		if (!files || files.length === 0 || files[0].size === 0) {
			return fail(400, { error: 'At least one MP3 file is required' });
		}

		// Check if folder exists
		const exists = await folderExists(folderName);
		if (!exists) {
			return fail(400, { error: 'Selected folder does not exist' });
		}

		// Validate and upload each file
		const uploadedFiles: string[] = [];
		for (const file of files) {
			// Check file type
			if (!file.name.toLowerCase().endsWith('.mp3')) {
				return fail(400, { error: `File "${file.name}" is not an MP3 file` });
			}

			// Check file size
			if (file.size > UPLOAD_MAX_SIZE_BYTES) {
				return fail(400, { error: `File "${file.name}" exceeds 10MB limit` });
			}

			// Save MP3 (filename will be sanitized automatically)
			const buffer = Buffer.from(await file.arrayBuffer());
			const savedFilename = await saveMP3(folderName, file.name, buffer);
			uploadedFiles.push(savedFilename);
		}

		return {
			success: true,
			message:
				uploadedFiles.length === 1
					? `File "${uploadedFiles[0]}" uploaded to ${folderName}`
					: `${uploadedFiles.length} files uploaded to ${folderName}`
		};
	}
};

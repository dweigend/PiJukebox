import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { deleteSong, folderExists } from '$lib/server/fileManager';
import { getAllMappings, getCardData, setTrackOrder } from '$lib/server/database';

export const DELETE: RequestHandler = async ({ params }) => {
	const { folderName, filename } = params;

	// SECURITY: Early validation (defense in depth - deleteSong also validates)
	if (!filename.toLowerCase().endsWith('.mp3')) {
		throw error(400, 'Only MP3 files can be deleted');
	}
	if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
		throw error(400, 'Invalid filename');
	}

	// Validate folder exists
	const exists = await folderExists(folderName);
	if (!exists) {
		throw error(404, 'Folder not found');
	}

	// Delete the file (has its own security validation)
	try {
		await deleteSong(folderName, filename);
	} catch {
		throw error(404, 'Song not found or invalid');
	}

	// Clean up trackOrder for all cards pointing to this folder
	await cleanupTrackOrders(folderName, filename);

	return json({ success: true });
};

/**
 * Remove deleted filename from trackOrder of all cards using this folder
 * Optimized: Uses Promise.all for parallel DB operations
 */
async function cleanupTrackOrders(folderName: string, deletedFilename: string): Promise<void> {
	const mappings = await getAllMappings();

	// Find all cards pointing to this folder
	const affectedCardIds = Object.entries(mappings)
		.filter(([, folder]) => folder === folderName)
		.map(([cardId]) => cardId);

	// Process all affected cards in parallel
	await Promise.all(
		affectedCardIds.map(async (cardId) => {
			const cardData = await getCardData(cardId);
			if (!cardData?.trackOrder?.length) return;

			const newOrder = cardData.trackOrder.filter((f) => f !== deletedFilename);

			// Only update if order changed
			if (newOrder.length !== cardData.trackOrder.length) {
				await setTrackOrder(cardId, newOrder);
			}
		})
	);
}

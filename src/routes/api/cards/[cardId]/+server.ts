/**
 * API route to lookup RFID card and return playlist
 */

import { error, json } from '@sveltejs/kit';
import { getCardData } from '$lib/server/database';
import { getFolder, sortSongsByOrder } from '$lib/server/fileManager';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const { cardId } = params;

	const cardData = await getCardData(cardId);

	if (!cardData) {
		throw error(404, 'Card not assigned');
	}

	const folder = await getFolder(cardData.folderName);

	if (!folder || folder.songs.length === 0) {
		throw error(404, 'Folder not found or empty');
	}

	// Apply track order if available
	const orderedSongs = cardData.trackOrder?.length
		? sortSongsByOrder(folder.songs, cardData.trackOrder)
		: folder.songs;

	const orderedFolder = { ...folder, songs: orderedSongs };

	return json({
		folder: orderedFolder,
		playlist: {
			folder: orderedFolder,
			songs: orderedSongs,
			currentIndex: 0
		}
	});
};

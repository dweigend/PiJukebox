/**
 * API route to lookup RFID card and return playlist
 */

import { error, json } from '@sveltejs/kit';
import { getCardMapping } from '$lib/server/database';
import { getFolder } from '$lib/server/fileManager';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const { cardId } = params;

	const folderName = await getCardMapping(cardId);

	if (!folderName) {
		throw error(404, 'Card not assigned');
	}

	const folder = await getFolder(folderName);

	if (!folder || folder.songs.length === 0) {
		throw error(404, 'Folder not found or empty');
	}

	return json({
		folder,
		playlist: {
			folder,
			songs: folder.songs,
			currentIndex: 0
		}
	});
};

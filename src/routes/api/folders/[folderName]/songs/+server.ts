/**
 * API endpoint for folder songs
 * GET: Returns all songs in a folder
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getFolderSongs, folderExists } from '$lib/server/fileManager';

export const GET: RequestHandler = async ({ params }) => {
	const { folderName } = params;

	if (!folderName) {
		throw error(400, 'Folder name is required');
	}

	const exists = await folderExists(folderName);
	if (!exists) {
		throw error(404, 'Folder not found');
	}

	const songs = await getFolderSongs(folderName);
	return json({ songs });
};

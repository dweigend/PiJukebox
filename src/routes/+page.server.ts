/**
 * Player page server load function
 */

import { getAllFolders } from '$lib/server/fileManager';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const folders = await getAllFolders();

	return {
		folders
	};
};

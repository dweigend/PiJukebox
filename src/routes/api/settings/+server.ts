/**
 * API endpoint for player settings
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSettings } from '$lib/server/database';

/**
 * GET /api/settings
 * Returns current player settings
 */
export const GET: RequestHandler = async () => {
	const settings = await getSettings();
	return json(settings);
};

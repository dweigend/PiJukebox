/**
 * API Routes for volume settings
 * GET: Load settings from database
 * POST: Save settings to database
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSettings, updateSettings } from '$lib/server/database';

/**
 * GET /api/volume
 * Load volume settings from database
 */
export const GET: RequestHandler = async () => {
	try {
		const settings = await getSettings();
		return json(settings);
	} catch (err) {
		console.error('Failed to load volume settings:', err);
		return error(500, 'Failed to load volume settings');
	}
};

/**
 * POST /api/volume
 * Save volume settings to database
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const settings = await request.json();

		// Validate settings
		if (
			typeof settings.maxVolume !== 'number' ||
			typeof settings.currentVolume !== 'number' ||
			typeof settings.isMuted !== 'boolean'
		) {
			return error(400, 'Invalid settings format');
		}

		// Validate ranges
		if (
			settings.maxVolume < 1 ||
			settings.maxVolume > 100 ||
			settings.currentVolume < 1 ||
			settings.currentVolume > 100
		) {
			return error(400, 'Volume values must be between 1 and 100');
		}

		await updateSettings(settings);
		return json({ success: true });
	} catch (err) {
		console.error('Failed to save volume settings:', err);
		return error(500, 'Failed to save volume settings');
	}
};

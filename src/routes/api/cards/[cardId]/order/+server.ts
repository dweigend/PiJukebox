/**
 * API route to update track order for a card
 */

import { error, json } from '@sveltejs/kit';
import { getCardData, setTrackOrder } from '$lib/server/database';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request }) => {
	const { cardId } = params;

	// Validate card exists
	const cardData = await getCardData(cardId);
	if (!cardData) {
		throw error(404, 'Card not found');
	}

	// Parse and validate request body
	const body = await request.json();
	const { trackOrder } = body;

	if (!Array.isArray(trackOrder)) {
		throw error(400, 'trackOrder must be an array');
	}

	if (!trackOrder.every((item) => typeof item === 'string')) {
		throw error(400, 'trackOrder must contain only strings');
	}

	// Save track order
	await setTrackOrder(cardId, trackOrder);

	return json({ success: true });
};

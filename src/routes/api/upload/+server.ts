/**
 * Upload API endpoint with progress support
 * Replaces the old form action for better UX with large files
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { UPLOAD_MAX_SIZE_BYTES } from '$lib/constants';
import { saveMP3, folderExists } from '$lib/server/fileManager';

export const POST: RequestHandler = async ({ request }) => {
	const formData = await request.formData();
	const folderName = formData.get('folderName')?.toString();
	const files = formData.getAll('files') as File[];

	// Validation: folder name required
	if (!folderName) {
		return json({ error: 'Folder name is required' }, { status: 400 });
	}

	// Validation: at least one file
	if (!files || files.length === 0 || files[0].size === 0) {
		return json({ error: 'At least one MP3 file is required' }, { status: 400 });
	}

	// Validation: folder must exist
	const exists = await folderExists(folderName);
	if (!exists) {
		return json({ error: 'Selected folder does not exist' }, { status: 400 });
	}

	// Validate and upload each file
	const uploadedFiles: string[] = [];
	for (const file of files) {
		// Check file type
		if (!file.name.toLowerCase().endsWith('.mp3')) {
			return json({ error: `File "${file.name}" is not an MP3 file` }, { status: 400 });
		}

		// Check file size
		if (file.size > UPLOAD_MAX_SIZE_BYTES) {
			return json({ error: `File "${file.name}" exceeds 500MB limit` }, { status: 400 });
		}

		// Save MP3 (filename will be sanitized automatically)
		const buffer = Buffer.from(await file.arrayBuffer());
		const savedFilename = await saveMP3(folderName, file.name, buffer);
		uploadedFiles.push(savedFilename);
	}

	return json({
		success: true,
		uploaded: uploadedFiles,
		message:
			uploadedFiles.length === 1
				? `File "${uploadedFiles[0]}" uploaded`
				: `${uploadedFiles.length} files uploaded`
	});
};

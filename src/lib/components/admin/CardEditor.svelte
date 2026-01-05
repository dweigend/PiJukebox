<script lang="ts">
	/**
	 * Card Editor component for creating and editing RFID card assignments
	 * Orchestrates TrackList and UploadZone for complete card management
	 */
	import type { Song } from '$lib/types';
	import { CARD_ID_PATTERN, FOLDER_NAME_PATTERN } from '$lib/constants';
	import { formatTitle, sanitizeFolderName } from '$lib/utils/formatters';
	import TrackList from './TrackList.svelte';
	import UploadZone from './UploadZone.svelte';

	interface Props {
		cardId?: string;
		folderName?: string;
		songs?: Song[];
		existingFolders: string[];
		onSave: () => void;
		onCancel: () => void;
	}

	let {
		cardId = '',
		folderName = '',
		songs = [],
		existingFolders,
		onSave,
		onCancel
	}: Props = $props();

	// Editable state (initialized from props)
	let editCardId = $state(cardId);
	let editFolderName = $state(folderName);
	let editSongs = $state<Song[]>([...songs]);

	// UI state
	let isSaving = $state(false);
	let error = $state<string | null>(null);
	let successMessage = $state<string | null>(null);

	// Folder mode: select existing or create new
	let folderMode = $state<'select' | 'new'>(folderName ? 'select' : 'new');
	let newFolderName = $state('');

	// Derived state
	const isNewCard = $derived(!cardId);
	const activeFolderName = $derived(
		folderMode === 'select' ? editFolderName : sanitizeFolderName(newFolderName)
	);
	const isCardIdValid = $derived(CARD_ID_PATTERN.test(editCardId));
	const isFolderValid = $derived(
		activeFolderName.length > 0 && FOLDER_NAME_PATTERN.test(activeFolderName)
	);
	const canSave = $derived(isCardIdValid && isFolderValid && !isSaving);

	// Event handlers
	async function handleReorder(order: string[]): Promise<void> {
		// Optimistic update: reorder local songs
		const reorderedSongs = order
			.map((filename) => editSongs.find((s) => s.filename === filename))
			.filter((s): s is Song => s !== undefined);

		editSongs = reorderedSongs;

		// Save to API if card already exists
		if (!isNewCard && editCardId) {
			try {
				const response = await fetch(`/api/cards/${editCardId}/order`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ trackOrder: order })
				});

				if (!response.ok) {
					throw new Error('Failed to save track order');
				}
			} catch (err) {
				error = err instanceof Error ? err.message : 'Failed to save order';
			}
		}
	}

	async function handleDelete(filename: string): Promise<void> {
		if (!activeFolderName) return;

		if (!confirm(`Delete "${formatTitle(filename)}"?`)) return;

		try {
			const response = await fetch(
				`/api/folders/${activeFolderName}/songs/${encodeURIComponent(filename)}`,
				{ method: 'DELETE' }
			);

			if (!response.ok) {
				throw new Error('Failed to delete song');
			}

			// Update local state
			editSongs = editSongs.filter((s) => s.filename !== filename);
			showSuccess('Song deleted');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to delete song';
		}
	}

	async function handleUploadComplete(): Promise<void> {
		await refreshSongs();
		showSuccess('Upload complete');
	}

	async function refreshSongs(): Promise<void> {
		if (!activeFolderName) return;

		try {
			const response = await fetch(`/api/folders/${activeFolderName}/songs`);
			if (response.ok) {
				const data = await response.json();
				editSongs = data.songs;
			}
		} catch (err) {
			console.error('Failed to refresh songs:', err);
		}
	}

	async function handleSave(): Promise<void> {
		if (!canSave) return;

		error = null;
		isSaving = true;

		try {
			// 1. Create folder if new
			if (folderMode === 'new' && newFolderName) {
				await createFolder(activeFolderName);
			}

			// 2. Assign card to folder
			await assignCard(editCardId, activeFolderName);

			// 3. Save track order if songs exist
			if (editSongs.length > 0) {
				await saveTrackOrder(
					editCardId,
					editSongs.map((s) => s.filename)
				);
			}

			// Success!
			onSave();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save card';
		} finally {
			isSaving = false;
		}
	}

	async function createFolder(name: string): Promise<void> {
		const formData = new FormData();
		formData.append('folderName', name);

		const response = await fetch('?/createFolder', {
			method: 'POST',
			body: formData
		});

		if (!response.ok) {
			throw new Error('Failed to create folder');
		}
	}

	async function assignCard(cardId: string, folderName: string): Promise<void> {
		const formData = new FormData();
		formData.append('cardId', cardId);
		formData.append('folderName', folderName);

		const response = await fetch('?/assignCard', {
			method: 'POST',
			body: formData
		});

		if (!response.ok) {
			throw new Error('Failed to assign card');
		}
	}

	async function saveTrackOrder(cardId: string, order: string[]): Promise<void> {
		const response = await fetch(`/api/cards/${cardId}/order`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ trackOrder: order })
		});

		if (!response.ok) {
			throw new Error('Failed to save track order');
		}
	}

	function showSuccess(message: string): void {
		successMessage = message;
		setTimeout(() => (successMessage = null), 2000);
	}

	function clearError(): void {
		error = null;
	}
</script>

<div class="card border border-base-content/10 bg-base-100">
	<div class="card-body space-y-4 p-4">
		<!-- Header -->
		<h3 class="card-title text-lg">
			{isNewCard ? 'New Card' : `Edit Card ${cardId}`}
		</h3>

		<!-- Error Alert -->
		{#if error}
			<div class="alert alert-error">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 shrink-0 stroke-current"
					fill="none"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<span>{error}</span>
				<button class="btn btn-ghost btn-xs" onclick={clearError}>✕</button>
			</div>
		{/if}

		<!-- Success Alert -->
		{#if successMessage}
			<div class="alert alert-success">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 shrink-0 stroke-current"
					fill="none"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<span>{successMessage}</span>
			</div>
		{/if}

		<!-- Card ID Input -->
		<fieldset class="fieldset">
			<legend class="fieldset-legend text-sm">RFID Card ID</legend>
			<input
				type="text"
				bind:value={editCardId}
				placeholder="0000000000"
				class="input-bordered input input-sm w-full"
				class:input-error={editCardId.length > 0 && !isCardIdValid}
				class:input-success={isCardIdValid}
				maxlength="10"
				pattern="\d{10}"
				disabled={!isNewCard}
			/>
			<label class="label">
				<span class="label-text-alt">
					{#if !isCardIdValid && editCardId.length > 0}
						Must be exactly 10 digits
					{:else}
						Enter or scan the 10-digit card ID
					{/if}
				</span>
			</label>
		</fieldset>

		<!-- Folder Selection -->
		<fieldset class="fieldset">
			<legend class="fieldset-legend text-sm">Music Folder</legend>

			<!-- Mode Toggle -->
			<div class="mb-2 join">
				<button
					type="button"
					class="btn join-item btn-xs"
					class:btn-active={folderMode === 'select'}
					onclick={() => (folderMode = 'select')}
				>
					Select Existing
				</button>
				<button
					type="button"
					class="btn join-item btn-xs"
					class:btn-active={folderMode === 'new'}
					onclick={() => (folderMode = 'new')}
				>
					Create New
				</button>
			</div>

			{#if folderMode === 'select'}
				<select bind:value={editFolderName} class="select-bordered select w-full select-sm">
					<option value="" disabled>Select a folder</option>
					{#each existingFolders as folder (folder)}
						<option value={folder}>{formatTitle(folder)}</option>
					{/each}
				</select>
			{:else}
				<input
					type="text"
					bind:value={newFolderName}
					placeholder="my_album_name"
					class="input-bordered input input-sm w-full"
					class:input-error={newFolderName.length > 0 && !isFolderValid}
				/>
				{#if newFolderName && newFolderName !== sanitizeFolderName(newFolderName)}
					<label class="label">
						<span class="label-text-alt text-info">
							Will be saved as: {sanitizeFolderName(newFolderName)}
						</span>
					</label>
				{/if}
			{/if}
		</fieldset>

		<!-- Track List (only if folder exists and has songs) -->
		{#if activeFolderName && editSongs.length > 0}
			<fieldset class="fieldset">
				<legend class="fieldset-legend text-sm">Tracks ({editSongs.length})</legend>
				<TrackList songs={editSongs} onreorder={handleReorder} ondelete={handleDelete} />
			</fieldset>
		{:else if activeFolderName && !isNewCard}
			<div class="py-2 text-sm text-base-content/50">No tracks yet. Upload MP3 files below.</div>
		{/if}

		<!-- Upload Zone (only if folder name is set) -->
		{#if activeFolderName}
			<UploadZone folderName={activeFolderName} onupload={handleUploadComplete} />
		{/if}

		<!-- Action Buttons -->
		<div class="card-actions justify-end gap-2 pt-2">
			<button type="button" class="btn btn-ghost btn-sm" onclick={onCancel} disabled={isSaving}>
				Cancel
			</button>
			<button type="button" class="btn btn-sm btn-primary" onclick={handleSave} disabled={!canSave}>
				{#if isSaving}
					<span class="loading loading-xs loading-spinner"></span>
				{/if}
				{isNewCard ? 'Create Card' : 'Save Changes'}
			</button>
		</div>
	</div>
</div>

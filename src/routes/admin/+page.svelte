<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatTitle } from '$lib/utils/formatters';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Smart Edit Flow State
	let cardInput = $state('');
	let existingMapping = $state<{ folder: string; songCount: number } | null>(null);
	let isChecking = $state(false);

	// Auto-lookup bei 10 Ziffern
	$effect(() => {
		if (cardInput.length === 10 && /^\d{10}$/.test(cardInput)) {
			checkCardMapping(cardInput);
		} else {
			existingMapping = null;
		}
	});

	async function checkCardMapping(cardId: string) {
		isChecking = true;
		try {
			const response = await fetch(`/api/cards/${cardId}`);
			if (response.ok) {
				const data = await response.json();
				existingMapping = {
					folder: data.folder.name,
					songCount: data.folder.songs.length
				};
			} else {
				existingMapping = null;
			}
		} catch {
			existingMapping = null;
		} finally {
			isChecking = false;
		}
	}
</script>

<div class="container mx-auto max-w-5xl space-y-3 p-4">
	<h1 class="text-3xl font-bold">Admin Interface</h1>

	<!-- Success/Error Messages -->
	{#if form?.success}
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
			<span>{form.message}</span>
		</div>
	{/if}

	{#if form?.error}
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
			<span>{form.error}</span>
		</div>
	{/if}

	<!-- Section 1: Card Mappings Overview -->
	<div class="card border border-base-content/5 bg-base-100">
		<div class="card-body p-4">
			<h2 class="card-title text-lg">Card Mappings</h2>

			{#if data.mappings.length === 0}
				<p class="text-sm text-base-content/60">No card mappings yet. Assign a card below.</p>
			{:else}
				<div class="overflow-x-auto">
					<table class="table table-zebra table-sm">
						<thead>
							<tr>
								<th>Card ID</th>
								<th>Folder</th>
								<th>Songs</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each data.mappings as mapping (mapping.cardId)}
								<tr>
									<td><code class="text-xs">{mapping.cardId}</code></td>
									<td class="text-sm">{formatTitle(mapping.folderName)}</td>
									<td>
										<span class="badge badge-xs badge-info">{mapping.songCount} songs</span>
									</td>
									<td>
										<form method="POST" action="?/deleteCard" use:enhance>
											<input type="hidden" name="cardId" value={mapping.cardId} />
											<button type="submit" class="btn btn-ghost btn-xs">Delete</button>
										</form>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	</div>

	<!-- Section 2: Assign Card -->
	<div class="card border border-base-content/5 bg-base-100">
		<div class="card-body p-4">
			<h2 class="card-title text-lg">Assign Card to Folder</h2>

			<form method="POST" action="?/assignCard" use:enhance class="space-y-3">
				<fieldset class="fieldset">
					<legend class="fieldset-legend text-sm">RFID Card ID</legend>
					<input
						type="text"
						name="cardId"
						bind:value={cardInput}
						placeholder="Enter 10-digit card ID"
						class="input-bordered input input-sm w-full"
						maxlength="10"
						required
					/>
					<label class="label">
						<span class="label-text-alt">Enter the 10-digit RFID card ID</span>
					</label>
				</fieldset>

				<!-- Smart Card Status Alert -->
				{#if isChecking}
					<div class="alert alert-warning">
						<span class="loading loading-sm loading-spinner"></span>
						<span>Checking card...</span>
					</div>
				{:else if existingMapping}
					<div class="alert alert-info">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							class="h-6 w-6 shrink-0 stroke-current"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							></path>
						</svg>
						<span
							>Card bereits zugewiesen: <strong>{formatTitle(existingMapping.folder)}</strong>
							({existingMapping.songCount}
							{existingMapping.songCount === 1 ? 'song' : 'songs'})</span
						>
					</div>
				{:else if cardInput.length === 10}
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
						<span>Neue Karte - bitte Folder zuweisen</span>
					</div>
				{/if}

				<fieldset class="fieldset">
					<legend class="fieldset-legend text-sm">Music Folder</legend>
					<select name="folderName" class="select-bordered select w-full select-sm" required>
						<option disabled selected={!existingMapping}>Select a folder</option>
						{#each data.folders as folder (folder)}
							<option value={folder} selected={existingMapping?.folder === folder}>
								{formatTitle(folder)}
							</option>
						{/each}
					</select>
					<label class="label">
						<span class="label-text-alt">Choose the music folder for this card</span>
					</label>
				</fieldset>

				<div class="card-actions justify-end">
					<button type="submit" class="btn btn-sm btn-primary">
						{existingMapping ? 'Update Mapping' : 'Assign Card'}
					</button>
				</div>
			</form>
		</div>
	</div>

	<!-- Section 3: Create Folder -->
	<div class="card border border-base-content/5 bg-base-100">
		<div class="card-body p-4">
			<h2 class="card-title text-lg">Create New Folder</h2>

			<form method="POST" action="?/createFolder" use:enhance class="space-y-3">
				<fieldset class="fieldset">
					<legend class="fieldset-legend text-sm">Folder Name</legend>
					<input
						type="text"
						name="folderName"
						placeholder="e.g., my_album_name"
						class="input-bordered input input-sm w-full"
						pattern="[a-zA-Z0-9_-]+"
						required
					/>
					<label class="label">
						<span class="label-text-alt"
							>Use only letters, numbers, underscores, and hyphens (no spaces)</span
						>
					</label>
				</fieldset>

				<div class="card-actions justify-end">
					<button type="submit" class="btn btn-sm btn-secondary">Create Folder</button>
				</div>
			</form>
		</div>
	</div>

	<!-- Section 4: Upload MP3s -->
	<div class="card border border-base-content/5 bg-base-100">
		<div class="card-body p-4">
			<h2 class="card-title text-lg">Upload MP3s to Folder</h2>

			<form
				method="POST"
				action="?/uploadMP3"
				enctype="multipart/form-data"
				use:enhance
				class="space-y-3"
			>
				<fieldset class="fieldset">
					<legend class="fieldset-legend text-sm">Target Folder</legend>
					<select name="folderName" class="select-bordered select w-full select-sm" required>
						<option disabled selected>Select a folder</option>
						{#each data.folders as folder (folder)}
							<option value={folder}>{formatTitle(folder)}</option>
						{/each}
					</select>
					<label class="label">
						<span class="label-text-alt">Choose the destination folder</span>
					</label>
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend text-sm">MP3 Files</legend>
					<input
						type="file"
						name="mp3File"
						accept=".mp3,audio/mpeg"
						class="file-input-bordered file-input w-full file-input-sm"
						multiple
						required
					/>
					<label class="label">
						<span class="label-text-alt">Select one or more MP3 files (max 10MB each)</span>
					</label>
				</fieldset>

				<div class="card-actions justify-end">
					<button type="submit" class="btn btn-sm btn-accent">Upload MP3s</button>
				</div>
			</form>
		</div>
	</div>
</div>

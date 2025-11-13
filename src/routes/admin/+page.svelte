<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatTitle } from '$lib/utils/formatters';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<div class="container mx-auto space-y-6 p-4">
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
		<div class="card-body">
			<h2 class="card-title">Card Mappings</h2>

			{#if data.mappings.length === 0}
				<p class="text-base-content/60">No card mappings yet. Assign a card below.</p>
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
									<td><code class="text-sm">{mapping.cardId}</code></td>
									<td>{formatTitle(mapping.folderName)}</td>
									<td>
										<span class="badge badge-sm badge-info">{mapping.songCount} songs</span>
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
		<div class="card-body">
			<h2 class="card-title">Assign Card to Folder</h2>

			<form method="POST" action="?/assignCard" use:enhance class="space-y-4">
				<fieldset class="fieldset">
					<legend class="fieldset-legend">RFID Card ID</legend>
					<input
						type="text"
						name="cardId"
						placeholder="Enter 10-digit card ID"
						class="input-bordered input w-full"
						pattern="[0-9]{10}"
						maxlength="10"
						required
					/>
					<label class="label">Enter the 10-digit RFID card ID</label>
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Music Folder</legend>
					<select name="folderName" class="select-bordered select w-full" required>
						<option disabled selected>Select a folder</option>
						{#each data.folders as folder (folder)}
							<option value={folder}>{formatTitle(folder)}</option>
						{/each}
					</select>
					<label class="label">Choose the music folder for this card</label>
				</fieldset>

				<div class="card-actions justify-end">
					<button type="submit" class="btn btn-primary">Assign Card</button>
				</div>
			</form>
		</div>
	</div>

	<!-- Section 3: Create Folder -->
	<div class="card border border-base-content/5 bg-base-100">
		<div class="card-body">
			<h2 class="card-title">Create New Folder</h2>

			<form method="POST" action="?/createFolder" use:enhance class="space-y-4">
				<fieldset class="fieldset">
					<legend class="fieldset-legend">Folder Name</legend>
					<input
						type="text"
						name="folderName"
						placeholder="e.g., my_album_name"
						class="input-bordered input w-full"
						pattern="[a-zA-Z0-9_-]+"
						required
					/>
					<label class="label"
						>Use only letters, numbers, underscores, and hyphens (no spaces)</label
					>
				</fieldset>

				<div class="card-actions justify-end">
					<button type="submit" class="btn btn-secondary">Create Folder</button>
				</div>
			</form>
		</div>
	</div>

	<!-- Section 4: Upload MP3s -->
	<div class="card border border-base-content/5 bg-base-100">
		<div class="card-body">
			<h2 class="card-title">Upload MP3s to Folder</h2>

			<form
				method="POST"
				action="?/uploadMP3"
				enctype="multipart/form-data"
				use:enhance
				class="space-y-4"
			>
				<fieldset class="fieldset">
					<legend class="fieldset-legend">Target Folder</legend>
					<select name="folderName" class="select-bordered select w-full" required>
						<option disabled selected>Select a folder</option>
						{#each data.folders as folder (folder)}
							<option value={folder}>{formatTitle(folder)}</option>
						{/each}
					</select>
					<label class="label">Choose the destination folder</label>
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">MP3 Files</legend>
					<input
						type="file"
						name="mp3File"
						accept=".mp3,audio/mpeg"
						class="file-input-bordered file-input w-full"
						multiple
						required
					/>
					<label class="label">Select one or more MP3 files (max 10MB each)</label>
				</fieldset>

				<div class="card-actions justify-end">
					<button type="submit" class="btn btn-accent">Upload MP3s</button>
				</div>
			</form>
		</div>
	</div>
</div>

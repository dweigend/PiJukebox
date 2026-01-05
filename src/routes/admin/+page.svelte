<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { formatTitle } from '$lib/utils/formatters';
	import { MIN_VOLUME, MAX_VOLUME } from '$lib/constants';
	import CardEditor from '$lib/components/admin/CardEditor.svelte';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Editor state
	let selectedCardId = $state<string | null>(null);
	let isCreatingNew = $state(false);

	// Derived state
	const selectedCard = $derived(
		selectedCardId ? data.mappings.find((m) => m.cardId === selectedCardId) : null
	);
	const isEditorOpen = $derived(isCreatingNew || selectedCardId !== null);

	// Volume slider state (reactive for live preview)
	let maxVolumeSlider = $state(data.settings.maxVolume);

	// Event handlers
	function openEditor(cardId: string): void {
		selectedCardId = cardId;
		isCreatingNew = false;
	}

	function openNewEditor(): void {
		selectedCardId = null;
		isCreatingNew = true;
	}

	function closeEditor(): void {
		selectedCardId = null;
		isCreatingNew = false;
	}

	async function handleEditorSave(): Promise<void> {
		closeEditor();
		await invalidateAll();
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

	<!-- Card Mappings Table -->
	<div class="card border border-base-content/5 bg-base-100">
		<div class="card-body p-4">
			<div class="flex items-center justify-between">
				<h2 class="card-title text-lg">Card Mappings</h2>
				<button onclick={openNewEditor} class="btn btn-sm btn-primary" disabled={isEditorOpen}>
					+ Add
				</button>
			</div>

			{#if data.mappings.length === 0}
				<p class="text-sm text-base-content/60">
					No card mappings yet. Click "+ Add" to create one.
				</p>
			{:else}
				<div class="overflow-x-auto">
					<table class="table table-zebra table-sm">
						<thead>
							<tr>
								<th>Card ID</th>
								<th>Folder</th>
								<th>Songs</th>
								<th class="w-28">Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each data.mappings as mapping (mapping.cardId)}
								<tr class:bg-base-200={selectedCardId === mapping.cardId}>
									<td><code class="text-xs">{mapping.cardId}</code></td>
									<td class="text-sm">{formatTitle(mapping.folderName)}</td>
									<td>
										<span class="badge badge-xs badge-info">{mapping.songCount}</span>
									</td>
									<td>
										<div class="flex gap-1">
											<button
												onclick={() => openEditor(mapping.cardId)}
												class="btn btn-ghost btn-xs"
												disabled={isEditorOpen}
											>
												Edit
											</button>
											<form method="POST" action="?/deleteCard" use:enhance>
												<input type="hidden" name="cardId" value={mapping.cardId} />
												<button type="submit" class="btn btn-ghost btn-xs" disabled={isEditorOpen}>
													Del
												</button>
											</form>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	</div>

	<!-- Card Editor (conditional) -->
	{#if isEditorOpen}
		<CardEditor
			cardId={isCreatingNew ? undefined : (selectedCardId ?? undefined)}
			folderName={selectedCard?.folderName}
			songs={selectedCard?.songs ?? []}
			existingFolders={data.folders}
			onSave={handleEditorSave}
			onCancel={closeEditor}
		/>
	{/if}

	<!-- Settings (Collapsed) -->
	<div class="collapse-arrow collapse border border-base-content/5 bg-base-100">
		<input type="checkbox" />
		<div class="collapse-title font-medium">Settings</div>
		<div class="collapse-content">
			<form method="POST" action="?/updateSettings" use:enhance class="space-y-3 pt-2">
				<fieldset class="fieldset">
					<legend class="fieldset-legend text-sm">Maximum Volume</legend>
					<div class="flex items-center gap-4">
						<input
							type="range"
							name="maxVolume"
							bind:value={maxVolumeSlider}
							min={MIN_VOLUME}
							max={MAX_VOLUME}
							class="range range-primary"
						/>
						<output class="min-w-[3rem] text-right font-mono text-lg font-bold">
							{maxVolumeSlider}%
						</output>
					</div>
					<label class="label">
						<span class="label-text-alt">
							Limits the maximum volume to protect children's hearing (recommended: 70-80%)
						</span>
					</label>
				</fieldset>

				<div class="card-actions justify-end">
					<button type="submit" class="btn btn-sm btn-primary">Save Settings</button>
				</div>
			</form>
		</div>
	</div>
</div>

<script lang="ts">
	import { onMount } from 'svelte';
	import { audioManager } from '$lib/managers/AudioManager.svelte';
	import { rfidManager } from '$lib/managers/RFIDManager.svelte';
	import { keyboardManager } from '$lib/managers/KeyboardManager.svelte';
	import { formatTitle } from '$lib/utils/formatters';
	import { MusicalNoteIcon } from 'heroicons-svelte/24/solid';

	let errorMessage = $state<string | null>(null);
	let unassignedCardId = $state<string | null>(null);
	let isLoading = $state(false);

	/**
	 * Handle RFID card scan
	 */
	async function handleCardScanned(cardId: string) {
		errorMessage = null;
		unassignedCardId = null;
		isLoading = true;

		try {
			const response = await fetch(`/api/cards/${cardId}`);

			if (!response.ok) {
				if (response.status === 404) {
					// Card not assigned yet - show friendly info
					unassignedCardId = cardId;
				} else {
					errorMessage = 'Error loading card';
				}
				return;
			}

			const data = await response.json();
			audioManager.loadPlaylist(data.playlist);
			audioManager.play();
		} catch {
			errorMessage = 'Error loading music';
		} finally {
			isLoading = false;
		}
	}

	/**
	 * Handle pause/play toggle
	 */
	function handlePausePlay() {
		if (audioManager.isPlaying) {
			audioManager.pause();
		} else {
			audioManager.play();
		}
	}

	/**
	 * Initialize managers on mount
	 */
	onMount(() => {
		rfidManager.init(handleCardScanned);
		keyboardManager.init({
			onPrevious: () => audioManager.previous(),
			onPausePlay: handlePausePlay,
			onNext: () => audioManager.next()
		});

		return () => {
			rfidManager.destroy();
			keyboardManager.destroy();
		};
	});
</script>

<div class="flex min-h-screen items-center justify-center bg-base-200 p-8">
	<div class="w-full max-w-2xl space-y-6">
		<!-- Header -->
		<div class="text-center">
			<h1 class="text-4xl font-bold text-base-content">Kinder Audio Player</h1>
		</div>

		<!-- Loading State -->
		{#if isLoading}
			<div class="flex justify-center">
				<span class="loading loading-lg loading-spinner text-primary"></span>
			</div>
		{/if}

		<!-- Unassigned Card Info -->
		{#if unassignedCardId}
			<div class="alert alert-info">
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
						d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<div class="flex flex-col">
					<span class="font-bold">Card not assigned yet</span>
					<span class="text-sm"
						>Card ID: <code class="rounded bg-base-200 px-2 py-1">{unassignedCardId}</code></span
					>
				</div>
				<a href="/admin" data-sveltekit-reload class="btn btn-sm btn-primary">Assign in Admin</a>
			</div>
		{/if}

		<!-- Error Message -->
		{#if errorMessage}
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
				<span>{errorMessage}</span>
			</div>
		{/if}

		<!-- Player Card -->
		{#if audioManager.currentSong}
			<div class="card border-2 border-base-300 bg-base-100 shadow-xl">
				<div class="card-body items-center space-y-6 text-center">
					<!-- Music Icon -->
					<MusicalNoteIcon class="h-36 w-36 text-primary" />

					<!-- Status Badge -->
					<div
						class="badge gap-2 badge-lg"
						class:badge-success={audioManager.isPlaying}
						class:badge-neutral={!audioManager.isPlaying}
					>
						{audioManager.isPlaying ? '▶ Playing' : '⏸ Paused'}
					</div>

					<!-- Song Info -->
					<div class="space-y-2">
						<h2 class="text-3xl font-bold text-primary">
							{audioManager.currentSong.title}
						</h2>

						{#if audioManager.playlist}
							<p class="text-lg opacity-70">
								{formatTitle(audioManager.playlist.folder.name)}
							</p>

							<p class="text-sm font-medium text-accent">
								Track {audioManager.playlist.currentIndex + 1} of {audioManager.playlist.songs
									.length}
							</p>
						{/if}
					</div>

					<!-- Controls Info -->
					<div class="divider my-2"></div>
					<div class="text-sm opacity-60">
						<kbd class="kbd kbd-sm">W</kbd>
						Previous |
						<kbd class="kbd kbd-sm">E</kbd>
						Pause/Play |
						<kbd class="kbd kbd-sm">R</kbd>
						Next
					</div>
				</div>
			</div>
		{:else}
			<!-- Waiting for Card -->
			<div class="card border-2 border-base-300 bg-base-100 shadow-xl">
				<div class="card-body items-center space-y-6 text-center">
					<MusicalNoteIcon class="h-36 w-36 text-primary" />
					<h2 class="card-title text-2xl">Scan a card to start playing</h2>
					<div class="text-sm opacity-60">
						<kbd class="kbd kbd-sm">W</kbd>
						Previous |
						<kbd class="kbd kbd-sm">E</kbd>
						Pause/Play |
						<kbd class="kbd kbd-sm">R</kbd>
						Next
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

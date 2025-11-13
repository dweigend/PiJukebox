<script lang="ts">
	import { onMount } from 'svelte';
	import { audioManager } from '$lib/managers/AudioManager.svelte';
	import { rfidManager } from '$lib/managers/RFIDManager.svelte';
	import { keyboardManager } from '$lib/managers/KeyboardManager.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let errorMessage = $state<string | null>(null);
	let isLoading = $state(false);

	/**
	 * Handle RFID card scan
	 */
	async function handleCardScanned(cardId: string) {
		errorMessage = null;
		isLoading = true;

		try {
			const response = await fetch(`/api/cards/${cardId}`);

			if (!response.ok) {
				const message = response.status === 404 ? 'Card not assigned' : 'Error loading card';
				errorMessage = message;
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

<div class="bg-base-200 flex min-h-screen items-center justify-center p-8">
	<div class="w-full max-w-2xl space-y-6">
		<!-- Header -->
		<div class="text-center">
			<h1 class="text-base-content text-4xl font-bold">Kinder Audio Player</h1>
		</div>

		<!-- Loading State -->
		{#if isLoading}
			<div class="flex justify-center">
				<span class="loading loading-spinner loading-lg text-primary"></span>
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
			<div class="card bg-base-100 border-base-300 border-2 shadow-xl">
				<div class="card-body">
					<!-- Status Indicator -->
					<div class="indicator mb-4 w-full">
						<span
							class="indicator-item badge badge-lg"
							class:badge-success={audioManager.isPlaying}
							class:badge-neutral={!audioManager.isPlaying}
						>
							{audioManager.isPlaying ? '▶ Playing' : '⏸ Paused'}
						</span>
						<div class="bg-base-200 flex w-full items-center justify-center p-8">
							<div class="text-8xl">🎵</div>
						</div>
					</div>

					<!-- Song Info Stats -->
					<div class="stats stats-vertical bg-base-200 w-full shadow">
						<div class="stat place-items-center">
							<div class="stat-title">Now Playing</div>
							<div class="stat-value text-primary text-2xl">
								{audioManager.currentSong.title}
							</div>
						</div>

						{#if audioManager.playlist}
							<div class="stat place-items-center">
								<div class="stat-title">Album</div>
								<div class="stat-value text-base">
									{audioManager.playlist.folder.name}
								</div>
							</div>

							<div class="stat place-items-center">
								<div class="stat-title">Track</div>
								<div class="stat-value text-accent text-base">
									{audioManager.playlist.currentIndex + 1} / {audioManager.playlist.songs.length}
								</div>
							</div>
						{/if}
					</div>

					<!-- Controls Info -->
					<div class="divider my-2"></div>
					<div class="text-center text-sm opacity-60">
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
			<div class="card bg-base-100 border-base-300 border-2 shadow-xl">
				<div class="card-body items-center space-y-6 text-center">
					<div class="text-9xl">🎵</div>
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

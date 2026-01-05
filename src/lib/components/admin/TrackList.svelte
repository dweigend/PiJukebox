<script lang="ts">
	/**
	 * Drag & drop track list component for reordering and deleting songs
	 * Uses svelte-dnd-action for drag and drop functionality
	 */
	import { flip } from 'svelte/animate';
	import { dndzone, type DndEvent } from 'svelte-dnd-action';
	import type { Song } from '$lib/types';

	interface Props {
		songs: Song[];
		onreorder?: (order: string[]) => void;
		ondelete?: (filename: string) => void;
	}

	let { songs, onreorder, ondelete }: Props = $props();

	// DnD requires items with `id` field
	interface DndItem {
		id: string;
		filename: string;
		title: string;
	}

	// eslint-disable-next-line svelte/prefer-writable-derived -- DnD requires mutable items during drag
	let items = $state<DndItem[]>([]);
	const flipDurationMs = 200;

	// Sync songs prop to internal items state (DnD mutates items during drag)
	$effect(() => {
		items = songs.map((song) => ({
			id: song.filename,
			filename: song.filename,
			title: song.title
		}));
	});

	function handleConsider(e: CustomEvent<DndEvent<DndItem>>) {
		items = e.detail.items;
	}

	function handleFinalize(e: CustomEvent<DndEvent<DndItem>>) {
		items = e.detail.items;
		// Notify parent of new order
		const newOrder = items.map((item) => item.filename);
		onreorder?.(newOrder);
	}

	function handleDelete(filename: string) {
		ondelete?.(filename);
	}
</script>

{#if items.length === 0}
	<div class="py-4 text-center text-sm text-base-content/50">No tracks</div>
{:else}
	<ul
		class="menu w-full rounded-box bg-base-200"
		use:dndzone={{ items, flipDurationMs }}
		onconsider={handleConsider}
		onfinalize={handleFinalize}
	>
		{#each items as item, index (item.id)}
			<li animate:flip={{ duration: flipDurationMs }}>
				<div class="flex w-full items-center gap-2">
					<!-- Drag Handle -->
					<span class="cursor-grab text-base-content/40">⠿</span>

					<!-- Track Number -->
					<span class="badge w-6 badge-ghost badge-sm text-center">{index + 1}</span>

					<!-- Track Title -->
					<span class="flex-1 truncate">{item.title}</span>

					<!-- Delete Button -->
					{#if ondelete}
						<button
							type="button"
							class="btn text-error btn-ghost btn-xs"
							onclick={() => handleDelete(item.filename)}
							title="Delete track"
						>
							🗑️
						</button>
					{/if}
				</div>
			</li>
		{/each}
	</ul>
{/if}

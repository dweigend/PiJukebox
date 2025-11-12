/**
 * AudioManager - Reactive audio playback manager using howler.js
 * Wraps howler.js with Svelte 5 $state runes for reactive state management
 */

import { Howl } from 'howler';
import type { Playlist, Song } from '$lib/types';

class AudioManager {
	// Reactive state
	playlist = $state<Playlist | null>(null);
	currentSong = $state<Song | null>(null);
	isPlaying = $state(false);

	// Howl instance
	#howl: Howl | null = null;

	/**
	 * Load a playlist and prepare for playback
	 */
	loadPlaylist(newPlaylist: Playlist) {
		this.#cleanup();
		this.playlist = newPlaylist;

		if (newPlaylist.songs.length === 0) return;

		this.currentSong = newPlaylist.songs[newPlaylist.currentIndex];
		this.#initHowl();
	}

	/**
	 * Start or resume playback
	 */
	play() {
		if (!this.#howl) return;
		this.#howl.play();
		this.isPlaying = true;
	}

	/**
	 * Pause playback
	 */
	pause() {
		if (!this.#howl) return;
		this.#howl.pause();
		this.isPlaying = false;
	}

	/**
	 * Play next song in playlist
	 */
	next() {
		if (!this.playlist) return;

		const nextIndex = (this.playlist.currentIndex + 1) % this.playlist.songs.length;
		this.playlist.currentIndex = nextIndex;
		this.currentSong = this.playlist.songs[nextIndex];

		this.#initHowl();
		this.play();
	}

	/**
	 * Play previous song in playlist
	 */
	previous() {
		if (!this.playlist) return;

		const prevIndex =
			this.playlist.currentIndex === 0
				? this.playlist.songs.length - 1
				: this.playlist.currentIndex - 1;

		this.playlist.currentIndex = prevIndex;
		this.currentSong = this.playlist.songs[prevIndex];

		this.#initHowl();
		this.play();
	}

	/**
	 * Initialize Howl instance for current song
	 */
	#initHowl() {
		this.#cleanup();

		if (!this.currentSong) return;

		this.#howl = new Howl({
			src: [this.currentSong.path],
			html5: true,
			onend: () => this.next(),
			onplay: () => (this.isPlaying = true),
			onpause: () => (this.isPlaying = false)
		});
	}

	/**
	 * Clean up current Howl instance
	 */
	#cleanup() {
		if (this.#howl) {
			this.#howl.unload();
			this.#howl = null;
		}
		this.isPlaying = false;
	}
}

// Export singleton instance
export const audioManager = new AudioManager();

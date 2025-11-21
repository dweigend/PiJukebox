/**
 * AudioManager - Reactive audio playback manager using howler.js
 * Wraps howler.js with Svelte 5 $state runes for reactive state management
 */

import { Howl } from 'howler';
import type { Playlist, Song } from '$lib/types';
import { MIN_VOLUME, MAX_VOLUME, VOLUME_STEP } from '$lib/constants';

class AudioManager {
	// Reactive state
	playlist = $state<Playlist | null>(null);
	currentSong = $state<Song | null>(null);
	isPlaying = $state(false);

	// Volume state (0.0 - 1.0 for Howler.js)
	currentVolume = $state(0.8); // 80% initial volume
	maxVolume = $state(0.8); // 80% maximum volume (default)
	isMuted = $state(false);

	// Howl instance
	#howl: Howl | null = null;
	#volumeBeforeMute: number = 0.8;

	/**
	 * Initialize AudioManager - load volume settings from database
	 */
	async init() {
		try {
			const response = await fetch('/api/volume');
			const settings = await response.json();

			// Convert from percentage (1-100) to normalized (0-1) for Howler.js
			this.currentVolume = settings.currentVolume / 100;
			this.maxVolume = settings.maxVolume / 100;
			this.isMuted = settings.isMuted;
		} catch (error) {
			console.error('Failed to load volume settings:', error);
			// Keep defaults
		}
	}

	/**
	 * Save current volume settings to database
	 */
	async saveSettings() {
		try {
			await fetch('/api/volume', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					currentVolume: Math.round(this.currentVolume * 100),
					maxVolume: Math.round(this.maxVolume * 100),
					isMuted: this.isMuted
				})
			});
		} catch (error) {
			console.error('Failed to save volume settings:', error);
		}
	}

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
	 * Set maximum volume limit (1-100%)
	 */
	setMaxVolume(percentage: number) {
		const clamped = Math.max(MIN_VOLUME, Math.min(MAX_VOLUME, percentage));
		this.maxVolume = clamped / 100;

		// Ensure current volume doesn't exceed new max
		if (this.currentVolume > this.maxVolume) {
			this.setVolume(Math.round(this.maxVolume * 100));
		}

		// Persist to database
		this.saveSettings();
	}

	/**
	 * Set volume (1-100%), clamped to maxVolume
	 */
	setVolume(percentage: number) {
		const normalized = Math.min(percentage / 100, this.maxVolume);
		this.currentVolume = Math.max(MIN_VOLUME / 100, normalized);

		if (this.#howl) {
			this.#howl.volume(this.currentVolume);
		}

		// Unmute if setting volume while muted
		if (this.isMuted && percentage > 0) {
			this.isMuted = false;
		}

		// Persist to database
		this.saveSettings();
	}

	/**
	 * Increase volume by VOLUME_STEP
	 */
	volumeUp() {
		const currentPercentage = Math.round(this.currentVolume * 100);
		const maxPercentage = Math.round(this.maxVolume * 100);
		const newPercentage = Math.min(currentPercentage + VOLUME_STEP, maxPercentage);
		console.log('[DEBUG Volume] volumeUp() called:', {
			current: currentPercentage + '%',
			max: maxPercentage + '%',
			new: newPercentage + '%',
			howlExists: !!this.#howl
		});
		this.setVolume(newPercentage);
	}

	/**
	 * Decrease volume by VOLUME_STEP
	 */
	volumeDown() {
		const currentPercentage = Math.round(this.currentVolume * 100);
		const newPercentage = Math.max(currentPercentage - VOLUME_STEP, MIN_VOLUME);
		console.log('[DEBUG Volume] volumeDown() called:', {
			current: currentPercentage + '%',
			new: newPercentage + '%',
			howlExists: !!this.#howl
		});
		this.setVolume(newPercentage);
	}

	/**
	 * Toggle mute on/off
	 * Note: howler.js also has mute() method, but current implementation works
	 */
	toggleMute() {
		if (this.isMuted) {
			// Unmute: restore previous volume
			this.currentVolume = this.#volumeBeforeMute;
			if (this.#howl) {
				this.#howl.volume(this.currentVolume);
			}
			this.isMuted = false;
		} else {
			// Mute: save current volume and set to 0
			this.#volumeBeforeMute = this.currentVolume;
			this.currentVolume = 0;
			if (this.#howl) {
				this.#howl.volume(0);
			}
			this.isMuted = true;
		}

		// Persist to database
		this.saveSettings();
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
			volume: this.currentVolume, // Set initial volume
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

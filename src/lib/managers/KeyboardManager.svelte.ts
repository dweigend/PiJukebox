/**
 * KeyboardManager - Handles keyboard and media key controls
 * W = Previous, E = Pause/Play, R = Next
 * Volume Knob = VolumeUp/Down/Mute (Media Keys)
 */

class KeyboardManager {
	// Reactive state for tracking active keys
	isWPressed = $state(false);
	isEPressed = $state(false);
	isRPressed = $state(false);

	// Callbacks for key actions
	#onPrevious: (() => void) | null = null;
	#onPausePlay: (() => void) | null = null;
	#onNext: (() => void) | null = null;
	#onVolumeUp: (() => void) | null = null;
	#onVolumeDown: (() => void) | null = null;
	#onMute: (() => void) | null = null;

	/**
	 * Initialize keyboard listener
	 */
	init(callbacks: {
		onPrevious: () => void;
		onPausePlay: () => void;
		onNext: () => void;
		onVolumeUp: () => void;
		onVolumeDown: () => void;
		onMute: () => void;
	}) {
		this.#onPrevious = callbacks.onPrevious;
		this.#onPausePlay = callbacks.onPausePlay;
		this.#onNext = callbacks.onNext;
		this.#onVolumeUp = callbacks.onVolumeUp;
		this.#onVolumeDown = callbacks.onVolumeDown;
		this.#onMute = callbacks.onMute;

		if (typeof window !== 'undefined') {
			window.addEventListener('keydown', this.#handleKeyDown);
			window.addEventListener('keyup', this.#handleKeyUp);
		}
	}

	/**
	 * Clean up event listeners
	 */
	destroy() {
		if (typeof window !== 'undefined') {
			window.removeEventListener('keydown', this.#handleKeyDown);
			window.removeEventListener('keyup', this.#handleKeyUp);
		}
	}

	/**
	 * Handle key press
	 */
	#handleKeyDown = (event: KeyboardEvent) => {
		const key = event.key.toLowerCase();

		// Debug logging
		console.log('[KeyboardManager] Key pressed:', {
			key: event.key,
			keyLower: key,
			code: event.code,
			repeat: event.repeat
		});

		// Prevent repeated triggers when key is held
		if (event.repeat) return;

		switch (key) {
			case 'w':
				this.isWPressed = true;
				console.log('[KeyboardManager] Triggering Previous');
				this.#onPrevious?.();
				break;
			case 'e':
				this.isEPressed = true;
				console.log('[KeyboardManager] Triggering Pause/Play');
				this.#onPausePlay?.();
				break;
			case 'r':
				this.isRPressed = true;
				console.log('[KeyboardManager] Triggering Next');
				this.#onNext?.();
				break;
			case 'audiovolumeup':
				console.log('[KeyboardManager] Triggering Volume Up');
				this.#onVolumeUp?.();
				break;
			case 'audiovolumedown':
				console.log('[KeyboardManager] Triggering Volume Down');
				this.#onVolumeDown?.();
				break;
			case 'audiovolumemute':
				console.log('[KeyboardManager] Triggering Mute');
				this.#onMute?.();
				break;
			default:
				console.log('[KeyboardManager] Unhandled key:', key);
		}
	};

	/**
	 * Handle key release
	 */
	#handleKeyUp = (event: KeyboardEvent) => {
		const key = event.key.toLowerCase();

		switch (key) {
			case 'w':
				this.isWPressed = false;
				break;
			case 'e':
				this.isEPressed = false;
				break;
			case 'r':
				this.isRPressed = false;
				break;
		}
	};
}

// Export singleton instance
export const keyboardManager = new KeyboardManager();

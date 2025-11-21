/**
 * KeyboardManager - Handles keyboard controls
 * W = Previous, E = Pause/Play, R = Next
 * Arrow Up/Down = Volume Up/Down, Space = Mute
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

		// Prevent repeated triggers when key is held
		if (event.repeat) return;

		switch (key) {
			case 'w':
				this.isWPressed = true;
				this.#onPrevious?.();
				break;
			case 'e':
				this.isEPressed = true;
				this.#onPausePlay?.();
				break;
			case 'r':
				this.isRPressed = true;
				this.#onNext?.();
				break;
			case 'arrowup': // CH57x Controller (new config) or Keyboard Arrow Up
				this.#onVolumeUp?.();
				break;
			case 'arrowdown': // CH57x Controller (new config) or Keyboard Arrow Down
				this.#onVolumeDown?.();
				break;
			case ' ': // CH57x Controller (Space) or Keyboard Space
				this.#onMute?.();
				break;
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

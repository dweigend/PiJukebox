/**
 * KeyboardManager - Handles W/E/R keyboard controls
 * W = Previous, E = Pause/Play, R = Next
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

	/**
	 * Initialize keyboard listener
	 */
	init(callbacks: { onPrevious: () => void; onPausePlay: () => void; onNext: () => void }) {
		this.#onPrevious = callbacks.onPrevious;
		this.#onPausePlay = callbacks.onPausePlay;
		this.#onNext = callbacks.onNext;

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

/**
 * RFIDManager - Handles RFID card input via USB keyboard
 * RFID scanner sends 10 digits + ENTER key
 */

class RFIDManager {
	// Reactive state
	currentInput = $state('');
	lastCardId = $state<string | null>(null);

	// Timeout for input reset
	#inputTimeout: ReturnType<typeof setTimeout> | null = null;
	#onCardScanned: ((cardId: string) => void) | null = null;

	/**
	 * Initialize keyboard listener
	 */
	init(onCardScanned: (cardId: string) => void) {
		this.#onCardScanned = onCardScanned;

		if (typeof window !== 'undefined') {
			window.addEventListener('keydown', this.#handleKeyDown);
		}
	}

	/**
	 * Clean up event listeners
	 */
	destroy() {
		if (typeof window !== 'undefined') {
			window.removeEventListener('keydown', this.#handleKeyDown);
		}
		this.#clearTimeout();
	}

	/**
	 * Handle keyboard input
	 */
	#handleKeyDown = (event: KeyboardEvent) => {
		// Handle ENTER key - card scan complete
		if (event.key === 'Enter') {
			this.#processCard();
			return;
		}

		// Only accept digit keys (0-9)
		if (!/^\d$/.test(event.key)) return;

		// Append digit to current input
		this.currentInput += event.key;

		// Reset timeout - new input received
		this.#resetTimeout();

		// Automatically process if 10 digits reached
		if (this.currentInput.length === 10) {
			this.#processCard();
		}
	};

	/**
	 * Process scanned card ID
	 */
	#processCard() {
		if (this.currentInput.length !== 10) {
			this.#reset();
			return;
		}

		const cardId = this.currentInput;
		this.lastCardId = cardId;
		this.#reset();

		// Emit card ID to callback
		if (this.#onCardScanned) {
			this.#onCardScanned(cardId);
		}
	}

	/**
	 * Reset input and timeout
	 */
	#reset() {
		this.currentInput = '';
		this.#clearTimeout();
	}

	/**
	 * Reset timeout for input collection
	 */
	#resetTimeout() {
		this.#clearTimeout();

		// Auto-reset after 2 seconds of no input
		this.#inputTimeout = setTimeout(() => {
			this.#reset();
		}, 2000);
	}

	/**
	 * Clear input timeout
	 */
	#clearTimeout() {
		if (this.#inputTimeout) {
			clearTimeout(this.#inputTimeout);
			this.#inputTimeout = null;
		}
	}
}

// Export singleton instance
export const rfidManager = new RFIDManager();

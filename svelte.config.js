import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// Use adapter-node for stable production deployment on Raspberry Pi
		adapter: adapter({
			out: 'build',
			precompress: true
		}),
		// Allow CSRF requests from local network
		// Safe because Pi is only accessible within home network
		csrf: {
			trustedOrigins: [
				'http://localhost:3000',
				'http://raspberrypi.local:3000',
				'http://raspi-rfid.local:3000',
				'http://192.168.1.177:3000'
			]
		}
	}
};

export default config;

import adapter from 'svelte-adapter-bun';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// Use adapter-bun for production deployment with Bun runtime
		adapter: adapter({
			out: 'build',
			precompress: true,
			envPrefix: 'PUBLIC_'
		})
	}
};

export default config;

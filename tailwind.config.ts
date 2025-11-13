import type { Config } from 'tailwindcss';
import daisyui from 'daisyui';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	plugins: [daisyui],
	daisyui: {
		themes: [
			{
				corporate: {
					'color-scheme': 'light',
					'base-100': 'oklch(1.000 0.000 0.0)',
					'base-200': 'oklch(1.000 0.000 0.0)',
					'base-300': 'oklch(0.978 0.000 0.0)',
					'base-content': 'oklch(0.000 0.031 0.0)',
					primary: 'oklch(58% 0.158 241.966)',
					'primary-content': 'oklch(100% 0 0)',
					secondary: 'oklch(0.000 0.000 0.0)',
					'secondary-content': 'oklch(1.000 0.000 0.0)',
					accent: 'oklch(60% 0.118 184.704)',
					'accent-content': 'oklch(100% 0 0)',
					neutral: 'oklch(0.000 0.000 0.0)',
					'neutral-content': 'oklch(100% 0 0)',
					info: 'oklch(60% 0.126 221.723)',
					'info-content': 'oklch(100% 0 0)',
					success: 'oklch(62% 0.194 149.214)',
					'success-content': 'oklch(100% 0 0)',
					warning: 'oklch(85% 0.199 91.936)',
					'warning-content': 'oklch(0% 0 0)',
					error: 'oklch(70% 0.191 22.216)',
					'error-content': 'oklch(0% 0 0)',
					'--rounded-box': '0rem',
					'--rounded-btn': '0.5rem',
					'--rounded-badge': '0.5rem',
					'--border-btn': '1.5px',
					'--tab-border': '1.5px'
				}
			}
		]
	}
} satisfies Config;

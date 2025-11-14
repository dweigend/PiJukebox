# Development Guidelines for AI Assistants

This document provides comprehensive guidelines for AI coding assistants working on **PiJukebox**.

## Project Overview

**PiJukebox** is a Toniebox-alternative: A Raspberry Pi-based music player for children controlled by RFID cards and a USB controller.

**Core Functionality:**

- RFID cards trigger music playback (card → folder mapping)
- USB controller (W/E/R keys) controls playback (Previous/Pause/Next)
- Web admin interface for card management
- Runs on Raspberry Pi in kiosk mode

## Tech Stack

### Frontend

- **SvelteKit** - Full-stack framework (SSR + API routes)
- **Svelte 5** - UI components with runes (`$state`, `$derived`, `$effect`)
- **Tailwind CSS + DaisyUI** - Styling (NO custom CSS unless absolutely necessary)
- **howler.js** - Audio playback library

### Backend

- **SvelteKit** - Server-side API routes (`+page.server.ts`, `+server.ts`)
- **lowdb** - Lightweight JSON database (card ↔ folder mappings)

### Development Tools

- **TypeScript** - Type-safe development
- **Vitest** - Unit testing
- **Playwright** - E2E testing
- **ESLint + Prettier** - Code quality

### Package Management

- **Primary:** Bun (fast, modern JavaScript runtime)
- **Fallback:** npm/pnpm (for compatibility)
- **NEVER use:** yarn v1 (deprecated)

## Architecture

```
src/
├── routes/
│   ├── +page.svelte              # Player UI (minimal, child-friendly)
│   ├── +page.server.ts           # Player data loader
│   └── admin/
│       ├── +page.svelte          # Admin interface
│       └── +page.server.ts       # Form actions (card mapping, upload)
├── lib/
│   ├── managers/                 # Client-side manager classes (.svelte.ts)
│   │   ├── AudioManager.svelte.ts      # howler.js wrapper with $state
│   │   ├── RFIDManager.svelte.ts       # RFID keyboard input handler
│   │   └── KeyboardManager.svelte.ts   # W/E/R controller listener
│   ├── server/                   # Server-only modules
│   │   ├── database.ts           # lowdb operations (CRUD for cards)
│   │   └── fileManager.ts        # File system ops (music folders)
│   └── types.ts                  # Shared TypeScript types
static/
└── music/                        # MP3 files organized by folder
data/
└── db.json                       # lowdb database (gitignored)
```

### Key Architectural Patterns

#### 1. Manager Classes (Client-side)

**Location:** `src/lib/managers/*.svelte.ts`

**Pattern:** Export class instances using Svelte 5 runes

```typescript
// AudioManager.svelte.ts
class AudioManager {
	private playlist = $state<Track[]>([]);
	private currentIndex = $state(0);

	get currentTrack() {
		return this.playlist[this.currentIndex];
	}

	// Methods...
}

export const audioManager = new AudioManager();
```

**Usage in components:**

```svelte
<script>
	import { audioManager } from '$lib/managers/AudioManager.svelte';
</script>

<div>{audioManager.currentTrack?.title}</div>
```

**Rules:**

- ✅ Use `$state()` for reactive properties
- ✅ Use `$derived()` for computed values
- ✅ Export singleton instances
- ❌ NO Svelte stores (legacy pattern)
- ❌ NO reactive statements (`$:`) - use `$derived` or `$effect`

#### 2. Server-side Modules

**Location:** `src/lib/server/*.ts`

**Pattern:** Standard TypeScript modules

```typescript
// database.ts
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

export async function getCardMapping(cardId: string) {
	// Implementation...
}
```

**Import path:** `$lib/server/database` (aliased)

**Rules:**

- ✅ Only import in `+page.server.ts` or `+server.ts`
- ✅ Use standard async/await patterns
- ❌ NEVER import in client-side code (build will fail)

#### 3. SvelteKit Routes

**Load data:** `+page.server.ts`

```typescript
export async function load() {
	const cards = await getAllCards();
	return { cards };
}
```

**Form actions:** `+page.server.ts`

```typescript
export const actions = {
	mapCard: async ({ request }) => {
		const data = await request.formData();
		// Handle form submission
	}
};
```

## Coding Standards

### TypeScript

**Strictness:**

```typescript
// ✅ Good - explicit types, early returns
function getTrackDuration(track: Track | null): number {
	if (!track) return 0;
	return track.duration;
}

// ❌ Bad - implicit any, nested conditions
function getTrackDuration(track) {
	if (track) {
		if (track.duration) {
			return track.duration;
		}
	}
	return 0;
}
```

**Rules:**

- ✅ Enable strict mode
- ✅ No `any` types (use `unknown` if needed)
- ✅ Explicit return types on functions
- ✅ Early returns for validation
- ✅ Functions < 20 lines (extract helpers if needed)

### Svelte 5

**Reactivity with Runes:**

```svelte
<script lang="ts">
  // ✅ Good - Svelte 5 runes
  let count = $state(0);
  let doubled = $derived(count * 2);

  $effect(() => {
    console.log('Count changed:', count);
  });
</script>

<!-- ❌ Bad - Legacy reactive statements -->
<script lang="ts">
  let count = 0;
  $: doubled = count * 2;  // Use $derived instead
  $: console.log(count);    // Use $effect instead
</script>
```

**Component Props:**

```svelte
<script lang="ts">
	interface Props {
		title: string;
		count?: number;
	}

	let { title, count = 0 }: Props = $props();
</script>
```

**Rules:**

- ✅ ALWAYS use `$state()` for reactive values
- ✅ Use `$derived()` for computed values
- ✅ Use `$effect()` sparingly (side-effects only)
- ✅ Use `$props()` for component props
- ❌ NO legacy stores in components
- ❌ NO reactive statements (`$:`)

### Clean Code Principles

**KISS (Keep It Simple, Stupid):**

- Choose the simplest solution that works
- Avoid premature optimization
- Prefer clarity over cleverness

**DRY (Don't Repeat Yourself):**

- Extract repeated logic into functions
- Search codebase before creating new utilities
- Reuse existing patterns

**Single Responsibility:**

- One function = one purpose
- One file = one concern
- Split large components into smaller ones

**Self-documenting Code:**

```typescript
// ✅ Good - clear names
function validateCardId(cardId: string): boolean {
	return /^\d{10}$/.test(cardId);
}

// ❌ Bad - unclear names, needs comments
function check(id: string): boolean {
	// Check if ID is valid (10 digits)
	return /^\d{10}$/.test(id);
}
```

### UI/UX Standards

**DaisyUI First:**

```svelte
<!-- ✅ Good - DaisyUI components -->
<button class="btn btn-primary">Play</button>
<div class="card bg-base-100 shadow-xl">...</div>

<!-- ❌ Bad - custom CSS unless absolutely necessary -->
<button style="background: blue; padding: 10px;">Play</button>
```

**Rules:**

- ✅ Use DaisyUI components for all UI elements
- ✅ Use Tailwind utility classes for layout
- ✅ Consult DaisyUI docs before custom styling
- ❌ NO custom CSS unless component is missing from DaisyUI

### Testing

**Unit Tests (Vitest):**

```typescript
import { describe, it, expect } from 'vitest';
import { validateCardId } from './validation';

describe('validateCardId', () => {
	it('accepts valid 10-digit card IDs', () => {
		expect(validateCardId('1234567890')).toBe(true);
	});

	it('rejects invalid card IDs', () => {
		expect(validateCardId('123')).toBe(false);
	});
});
```

**E2E Tests (Playwright):**

```typescript
import { test, expect } from '@playwright/test';

test('admin can map RFID card', async ({ page }) => {
	await page.goto('/admin');
	await page.fill('[name="cardId"]', '1234567890');
	await page.selectOption('[name="folder"]', 'kids-songs');
	await page.click('button:has-text("Save")');

	await expect(page.locator('.success')).toBeVisible();
});
```

**Rules:**

- ✅ Write tests for business logic
- ✅ Test edge cases and error conditions
- ✅ Use descriptive test names
- ✅ E2E tests for critical user flows

## Development Workflow

### Installation

```bash
# Primary (Bun)
bun install

# Fallback (npm/pnpm)
npm install
# or
pnpm install
```

### Development

```bash
# Start dev server
bun run dev         # http://localhost:5173

# Type checking
bun run check       # TypeScript validation

# Linting & Formatting
bun run lint        # ESLint + Prettier check
bun run format      # Auto-format with Prettier
```

### Testing

```bash
# Unit tests
bun run test:unit   # Vitest

# E2E tests
bun run test:e2e    # Playwright

# All tests
bun run test
```

### Building

```bash
# Production build
bun run build

# Preview build
bun run preview     # Test production build locally
```

## Git Workflow

### Commit Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Features
git commit -m "feat: add RFID card mapping UI"

# Bug fixes
git commit -m "fix: correct audio pause/resume logic"

# Refactoring
git commit -m "refactor: extract audio controls to component"

# Documentation
git commit -m "docs: update hardware setup guide"

# Chores (build, dependencies, etc.)
git commit -m "chore: update dependencies"

# Breaking changes
git commit -m "feat!: redesign admin interface

BREAKING CHANGE: Old card format no longer supported"
```

**Commit Message Rules:**

- ✅ Use present tense ("add" not "added")
- ✅ Lowercase first letter
- ✅ No period at the end
- ✅ Keep subject line < 72 characters
- ✅ Add body for complex changes
- ❌ NO generic messages ("fix stuff", "updates")
- ❌ NO tool attribution in commits (e.g., "Generated with Claude Code")

### Branching Strategy

```bash
# Feature development
git checkout -b feat/rfid-manager

# Bug fixes
git checkout -b fix/audio-playback

# Documentation
git checkout -b docs/hardware-setup
```

**Merge to main:**

- Ensure all tests pass
- Run linter and fix issues
- Squash commits if needed

### Safety

```bash
# Checkpoint before risky changes
git commit -m "chore: checkpoint before refactoring"

# Never force push to main
git push origin main           # ✅ Good
git push origin main --force   # ❌ Bad
```

## Hardware Context

### Raspberry Pi Setup

**RFID Scanner:**

- Type: USB keyboard emulator
- Output: 10 digits + ENTER key
- Handled by: `RFIDManager.svelte.ts`

**USB Controller:**

- Type: CH57x USB keyboard
- Keys: W (Previous), E (Pause/Play), R (Next)
- Handled by: `KeyboardManager.svelte.ts`

**Browser:**

- Chromium in kiosk mode (fullscreen)
- Auto-start on boot
- No browser chrome visible

**Audio Output:**

- INNO-MAKER Amp Pro shield
- 2×80W amplifier
- Volume limited to 50% (child safety)
- See: `docs/hardware/amp-pro-shield.md`

### User Flow

```
1. Child scans RFID card
   ↓
2. Scanner sends 10 digits + ENTER
   ↓
3. RFIDManager captures input
   ↓
4. Database lookup: cardId → folderName
   ↓
5. AudioManager loads MP3s from /music/[folder]/
   ↓
6. Auto-play starts
   ↓
7. Child uses W/E/R controller for playback control
```

## Common Patterns & Best Practices

### Database Operations

```typescript
// ✅ Good - explicit error handling
async function getCardMapping(cardId: string): Promise<string | null> {
	try {
		const mapping = await db.read();
		return mapping.cards[cardId] ?? null;
	} catch (error) {
		console.error('Failed to read card mapping:', error);
		return null;
	}
}

// ❌ Bad - silent failures
async function getCardMapping(cardId: string) {
	const mapping = await db.read();
	return mapping.cards[cardId]; // Can throw, returns undefined
}
```

### Audio Playback

```typescript
// ✅ Good - using AudioManager
import { audioManager } from '$lib/managers/AudioManager.svelte';

function playCard(cardId: string) {
  const folder = await getCardMapping(cardId);
  if (!folder) return;

  audioManager.loadPlaylist(folder);
  audioManager.play();
}

// ❌ Bad - direct howler.js usage
import { Howl } from 'howler';

function playCard(cardId: string) {
  const sound = new Howl({ src: [...] });  // Bypass manager
  sound.play();
}
```

### Form Handling

```svelte
<!-- ✅ Good - SvelteKit form actions -->
<form method="POST" action="?/mapCard">
	<input name="cardId" required pattern="\d{10}" />
	<select name="folder" required>
		{#each folders as folder}
			<option value={folder}>{folder}</option>
		{/each}
	</select>
	<button type="submit">Save</button>
</form>

<!-- ❌ Bad - client-side only -->
<button on:click={saveMapping}>Save</button>
```

### Error Handling

```typescript
// ✅ Good - specific error types
class CardNotFoundError extends Error {
	constructor(cardId: string) {
		super(`Card ${cardId} not found`);
		this.name = 'CardNotFoundError';
	}
}

// ❌ Bad - generic errors
throw new Error('Something went wrong');
```

## Scope Control

**When implementing features:**

- ✅ **DO:** Make the smallest change that solves the problem
- ✅ **DO:** Follow the exact requirements
- ✅ **DO:** Ask for clarification if ambiguous
- ❌ **DON'T:** Add "nice to have" features unprompted
- ❌ **DON'T:** Refactor unrelated code
- ❌ **DON'T:** Touch files outside task scope

**Example:**

```
Task: "Fix pause button not working"

✅ Good: Fix AudioManager.pause() method
❌ Bad: Fix pause + redesign player UI + add new features
```

## File Organization

### When to Create New Files

**Create new file when:**

- Adding a new route (`src/routes/`)
- Creating a new manager class (`src/lib/managers/`)
- Adding shared types (`src/lib/types.ts`)
- Adding server utilities (`src/lib/server/`)

**Extend existing file when:**

- Adding a function to existing module
- Adding a type to existing type file
- Adding a method to existing manager

**Search before creating:**

```bash
# Find existing files
fd <filename>

# Search for existing patterns
rg "class.*Manager"
rg "export function.*validate"
```

### File Naming

```
✅ Good:
- AudioManager.svelte.ts    (Manager class)
- database.ts               (Server module)
- +page.svelte              (SvelteKit route)
- CardList.svelte           (Component)

❌ Bad:
- audio_manager.ts          (Use PascalCase for classes)
- Database.ts               (Use camelCase for modules)
- card-list.svelte          (Use PascalCase for components)
```

## Documentation Standards

### Code Comments

```typescript
// ✅ Good - explain WHY, not WHAT
// Pause briefly to prevent audio crackling when resuming
await sleep(100);

// ❌ Bad - redundant comment
// Pause for 100ms
await sleep(100);
```

### Function Documentation

```typescript
/**
 * Loads and plays audio tracks from a folder.
 *
 * @param folderName - Name of folder in /music/ directory
 * @returns Promise that resolves when playlist is loaded
 * @throws {FolderNotFoundError} If folder doesn't exist
 */
async function loadPlaylist(folderName: string): Promise<void> {
	// Implementation...
}
```

### README Files

- Use clear, concise language
- Include examples
- Keep up-to-date with code changes
- Use Markdown formatting

## Resources

### Official Documentation

- **SvelteKit:** https://kit.svelte.dev/docs
- **Svelte 5:** https://svelte-5-preview.vercel.app/docs
- **DaisyUI:** https://daisyui.com/components/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **howler.js:** https://howlerjs.com/
- **lowdb:** https://github.com/typicode/lowdb

### Project Documentation

- **Hardware Setup:** `docs/hardware/amp-pro-shield.md`
- **Architecture:** Check `src/lib/` for implementation examples
- **Type Definitions:** `src/lib/types.ts`

### Development Tools

- **TypeScript:** https://www.typescriptlang.org/docs/
- **Vitest:** https://vitest.dev/
- **Playwright:** https://playwright.dev/
- **Conventional Commits:** https://www.conventionalcommits.org/

## Troubleshooting

### Common Issues

**1. Build fails with server import error**

```
Error: Cannot import $lib/server/database in client code
```

**Solution:** Only import server modules in `.server.ts` files

**2. Svelte reactivity not working**

```svelte
<script>
	let count = 0; // Not reactive in Svelte 5!
</script>
```

**Solution:** Use `let count = $state(0);`

**3. Database not persisting**

```typescript
db.data.cards[cardId] = folder; // Doesn't save!
```

**Solution:** Call `await db.write()` after changes

**4. Audio won't play in browser**

- Check browser autoplay policy
- User interaction required before first play
- Use `audioManager.play()` in event handler

## Contribution Checklist

Before committing code, verify:

- [ ] Code follows TypeScript strict mode
- [ ] Svelte 5 runes used (`$state`, `$derived`, not stores)
- [ ] DaisyUI components used for UI
- [ ] Functions < 20 lines
- [ ] Tests written for new features
- [ ] Tests pass (`bun run test`)
- [ ] Linter passes (`bun run lint`)
- [ ] Type checking passes (`bun run check`)
- [ ] Conventional commit message
- [ ] Only files related to task modified

---

**Last Updated:** 2025-11-14
**Maintained By:** Project contributors
**For Questions:** See `docs/llm/README.md`

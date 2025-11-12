# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Author

**David Weigend**

- Email: david.weigend@gmail.com
- X: @weigend
- Web: weigend.studio
- GitHub: https://github.com/dweigend

---

## Project: kinder_audio_2

**Toniebox-Alternative** - Raspberry Pi Music Player für Kinder

**Goal:** RFID-Karten steuern Musikwiedergabe, USB-Controller (W/E/R) für Playback, Web-Admin für Card-Management.

### Tech Stack

- **SvelteKit** (Full-Stack: SSR + API Routes)
- **Svelte 5** (`$state` runes, NO stores in components)
- **Tailwind CSS + DaisyUI** (NO custom CSS)
- **howler.js** (Audio), **lowdb** (JSON DB)
- **Bun** (Package Manager - NEVER npm/pnpm)

---

## Architecture

```
src/
├── routes/
│   ├── +page.svelte              # Player UI (minimalistisch)
│   ├── +page.server.ts           # Data loader
│   └── admin/
│       ├── +page.svelte          # Admin Interface
│       └── +page.server.ts       # Form actions (Card-Mapping, Upload)
├── lib/
│   ├── managers/                 # Client Manager Classes (.svelte.ts)
│   │   ├── AudioManager.svelte.ts      # howler.js wrapper ($state)
│   │   ├── RFIDManager.svelte.ts       # Keyboard handler (10 digits + ENTER)
│   │   └── KeyboardManager.svelte.ts   # W/E/R key listener
│   ├── server/                   # Server-only
│   │   ├── database.ts           # lowdb CRUD (Card ↔ Folder)
│   │   └── fileManager.ts        # Folder/MP3 ops
│   └── types.ts                  # Shared types
music/                            # MP3 folders
data/db.json                      # lowdb: {cardId: folderName}
```

**Key Patterns:**

- ✅ Manager classes export instances from `.svelte.ts` with `$state` runes
- ✅ Server logic in `src/lib/server/` (import: `$lib/server/...`)
- ✅ Client logic in `src/lib/managers/` (import: `$lib/managers/...`)
- ❌ NO stores in components (use `$state` instead)

---

## Commands

```bash
bun install              # Install dependencies (NEVER npm/pnpm)
bun run dev              # Dev server (http://localhost:5173)

# Quality
bun run format           # Auto-format (Prettier)
bun run lint             # Prettier + ESLint
bun run check            # TypeScript check

# Testing
bun run test:unit        # Vitest
bun run test:e2e         # Playwright
bun run test             # All tests

# Build
bun run build            # Production build
bun run preview          # Preview build
```

---

## Workflow: ALWAYS use `/implement` Skill

For **every** code implementation, use the `implement` skill:

```
PREPARE → CODE → VALIDATE → REFINE → COMMIT
```

**Why:** Ensures consistency, quality, browser validation, and proper git workflow.

**Trigger:** Any feature implementation, bug fix, or code change.

---

## Coding Standards

### TypeScript

- ✅ Strict mode: no `any`, explicit return types
- ✅ Early returns for validation
- ✅ Functions < 20 lines

### Svelte 5

- ✅ **ALWAYS** `$state()` for reactivity (NOT stores in components)
- ✅ `$derived()` for computed values
- ✅ `$effect()` sparingly (side-effects only)
- ✅ Consult `mcp__svelte__` before implementing

### Clean Code

- ✅ **KISS** - simplest solution first
- ✅ **DRY** - search before creating
- ✅ **Single Responsibility** - one file/function = one purpose
- ✅ **Self-documenting** - clear names > comments

### UI

- ✅ **ALWAYS DaisyUI components** (NO custom CSS unless critical)

### Testing

- **Chrome DevTools MCP MANDATORY** for all UI features
- Navigate → Snapshot → Screenshot → Console → Network

---

## MCPs - Documentation Priority

### 1. Svelte 5 Questions

```
mcp__svelte__list-sections
mcp__svelte__get-documentation(section: ["$state", "$derived", ...])
mcp__svelte__svelte-autofixer(code: "...", desired_svelte_version: 5)
```

### 2. Library Docs

```
mcp__context7__resolve-library-id(libraryName: "howler.js")
mcp__context7__get-library-docs(context7CompatibleLibraryID: "/goldfire/howler.js")
```

### 3. Code Examples & Patterns

```
mcp__perplexity__code_search(query: "howler.js playlist", category: "typescript")
mcp__perplexity__research(query: "complex topics", recency_filter: "month")
```

### 4. Quick Facts

```
mcp__perplexity__quick_search(query: "lowdb API reference")
```

**Order:** Svelte → Context7 → Perplexity Code → Perplexity Quick

---

## Git

- **Conventional Commits:** `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`
- **Checkpoint before risky changes:** `git commit -m "chore: checkpoint"`
- **❌ NEVER mention "Claude Code" in commits**

---

## Hardware Context (Raspberry Pi)

- **RFID Scanner:** USB keyboard (sends 10 digits + ENTER)
- **CH57x Controller:** USB keyboard (W=Prev, E=Pause, R=Next)
- **Browser:** Chromium Kiosk-Mode at boot

**User Flow:**

1. RFID card → 10 digits + ENTER
2. `RFIDManager` captures input → DB lookup
3. `AudioManager` loads playlist from `/music/[folder]/`
4. Auto-play
5. Controller (W/E/R) controls playback

---

## Scope Control

- **DO:** Smallest possible change that solves problem
- **EXACT TASK ONLY:** Do precisely what's requested
- **NO EXTRAS:** No "nice to have" features without request
- **DON'T TOUCH:** Only edit files directly related to task

---

## Development Roadmap

**Central Planning Document:** `PLAN.md` (Living Document)

**Current Phase:** Phase 0 - Setup & Dependencies

### Phase Overview

| Phase | Name                                | Status         |
| ----- | ----------------------------------- | -------------- |
| 0     | Setup & Dependencies                | 🔄 IN PROGRESS |
| 1     | Foundation (Types, DB, FileManager) | ⏳ PENDING     |
| 2     | Managers (Audio, RFID, Keyboard)    | ⏳ PENDING     |
| 3     | UI (Player + Admin)                 | ⏳ PENDING     |
| 4     | Testing & Polish                    | ⏳ PENDING     |
| 5     | Deployment (Raspberry Pi)           | ⏳ PENDING     |

**See `PLAN.md` for:**

- Detailed task checklists for each phase
- Human-in-the-loop points (UI feedback, testing)
- Definition of Done for each phase
- Git checkpoint guidelines
- Deployment instructions (Phase 5)

**Important:** Update `PLAN.md` after completing tasks (check off items, update status)

**Also see:** `PROJECTPLAN.md` for detailed architecture and design decisions.

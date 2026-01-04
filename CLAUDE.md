# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: PiJukebox

**Toniebox-Alternative** - Raspberry Pi Music Player für Kinder (✅ Deployed & Running)

**Goal:** RFID-Karten steuern Musikwiedergabe, USB-Controller für Playback, Web-Admin für Card-Management.

### Tech Stack

- **SvelteKit** + **@sveltejs/adapter-node** (Production on Raspberry Pi)
- **Svelte 5** (`$state` runes, NO stores)
- **Tailwind CSS + DaisyUI** (NO custom CSS)
- **howler.js** (Audio), **lowdb** (JSON DB)
- **Bun** (Package Manager - NEVER npm/pnpm)

---

## Architecture

```
src/
├── routes/
│   ├── +page.svelte              # Player UI
│   ├── +page.server.ts           # Data loader
│   ├── admin/                    # Admin Interface (5 sections)
│   └── api/
│       ├── cards/[cardId]/       # GET: Playlist lookup
│       ├── volume/               # GET/POST: Volume settings
│       └── settings/             # GET: Read-only settings
├── lib/
│   ├── managers/                 # Client Managers (.svelte.ts, $state)
│   │   ├── AudioManager          # howler.js wrapper
│   │   ├── RFIDManager           # 10-digit card input
│   │   └── KeyboardManager       # Playback + Volume controls
│   ├── server/
│   │   ├── database.ts           # lowdb CRUD
│   │   └── fileManager.ts        # Folder/MP3 ops
│   ├── utils/formatters.ts       # Title formatting
│   ├── constants.ts              # Magic values
│   └── types.ts                  # Shared types
static/music/                     # MP3 folders (served directly)
data/db.json                      # Card mappings + settings
```

**Key Patterns:**

- ✅ Manager classes use `$state` runes (NOT stores)
- ✅ Server: `$lib/server/...` | Client: `$lib/managers/...`
- ✅ Upload limit: **500MB** (`BODY_SIZE_LIMIT`)

---

## Commands

```bash
bun install              # Install deps (runs setup.sh automatically)
bun run dev              # Dev server (localhost:5173)
bun run build            # Production build
bun run start            # Production server (PORT=3000, HOST=0.0.0.0)

bun run check            # TypeScript check
bun run lint             # Prettier + ESLint
bun run format           # Auto-format
```

---

## Hardware Controls

| Key | Action |
|-----|--------|
| **W** | Previous track |
| **E** | Play/Pause |
| **R** | Next track |
| **Arrow Up/Down** | Volume ±5% |
| **Space** | Mute/Unmute |
| **RFID Card** | 10 digits → Load playlist |

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

## Raspberry Pi Deployment

**Status:** ✅ Deployed & Running

- **Service:** `pijukebox.service` (systemd, auto-start)
- **Location:** `/opt/pijukebox`
- **Access:** `http://raspberrypi.local:3000`

**Deployment Guide:** See `docs/deployment/README.md`

**Update Pi:**
```bash
bun run build
rsync -avz --exclude node_modules --exclude .git ./ pi@raspberrypi.local:/opt/pijukebox/
ssh pi@raspberrypi.local "sudo systemctl restart pijukebox.service"
```

---

## Scope Control

- **DO:** Smallest possible change that solves problem
- **EXACT TASK ONLY:** Do precisely what's requested
- **NO EXTRAS:** No "nice to have" features without request
- **DON'T TOUCH:** Only edit files directly related to task

---

## Documentation

- **Deployment:** `docs/deployment/README.md`
- **Development History:** `dev/PLAN.md` (completed phases 0-5)
- **Hardware:** `docs/hardware/`

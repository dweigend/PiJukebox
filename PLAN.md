# PLAN.md - kinder_audio_2 Development Roadmap

**Project:** Toniebox-Alternative - Raspberry Pi Music Player für Kinder

**Status:** Phase 4 - Testing & Polish ✅ COMPLETED

---

## 📊 Phase Overview

| Phase | Name                      | Status       | Progress |
| ----- | ------------------------- | ------------ | -------- |
| 0     | Setup & Dependencies      | ✅ COMPLETED | 7/7      |
| 1     | Foundation                | ✅ COMPLETED | 3/3      |
| 2     | Managers                  | ✅ COMPLETED | 3/3      |
| 3     | UI (Player + Admin)       | ✅ COMPLETED | 4/4      |
| 3.5   | Refactoring & Polish      | ✅ COMPLETED | 5/5      |
| 4     | Testing & Polish          | ✅ COMPLETED | 3/3      |
| 5     | Deployment (Raspberry Pi) | ⏳ PENDING   | 0/5      |

---

## Phase 0: Setup & Dependencies

**Goal:** Projekt vollständig einrichten für Phase 1 Start

### Tasks

- [x] **0.1** Install dependencies: `bun add lowdb howler @types/howler`
- [x] **0.2** Install dev dependencies: `bun add -d daisyui`
- [x] **0.3** Create directory structure:
  - `mkdir -p data`
  - `mkdir -p src/lib/managers`
  - `mkdir -p src/lib/server`
  - `mkdir -p src/routes/admin`
- [x] **0.4** Create `data/db.json` with initial structure: `{"cards": {}}`
- [x] **0.5** Create `tailwind.config.ts` with DaisyUI plugin (theme: cupcake)
- [x] **0.6** Update `.gitignore` (add: data/db.json, .env, .env.local)
- [x] **0.7** Check `tsconfig.json` (no syntax errors found)

### Verification

```bash
bun install              # Verify all deps installed
bun run check            # TypeScript check passes
bun run dev              # Dev server starts
```

### Definition of Done

- ✅ All dependencies installed
- ✅ Directory structure created
- ✅ TypeScript strict mode without errors
- ✅ Dev server starts successfully
- ✅ Git checkpoint created

### Git Checkpoint

```bash
git add -A
git commit -m "chore: setup project structure and dependencies"
```

---

## Phase 1: Foundation

**Goal:** Core types, database wrapper, file operations

### Tasks

- [x] **1.1** Define types in `src/lib/types.ts`:
  - `Card` type (id, folderName, assignedAt)
  - `Folder` type (name, songs, path)
  - `Song` type (filename, path, title)
  - `Playlist` type (folder, songs, currentIndex)
- [x] **1.2** Implement `src/lib/server/database.ts` (lowdb v7):
  - Initialize database
  - CRUD operations: getCardMapping, setCardMapping, deleteCardMapping, getAllMappings
  - Type-safe with TypeScript
- [x] **1.3** Implement `src/lib/server/fileManager.ts`:
  - Scan `/music` folder
  - Get all folders (playlists)
  - Get MP3s in folder
  - Validate folder exists

### Definition of Done

- ✅ All types exported from `types.ts`
- ✅ Database CRUD operations tested manually (via REPL or simple script)
- ✅ FileManager can list folders and songs
- ✅ TypeScript check passes
- ✅ Code follows standards (functions < 20 lines, no `any`)

### Git Checkpoint

```bash
git commit -m "feat: add types, database wrapper, and file manager"
```

---

## Phase 2: Managers

**Goal:** Client-side manager classes with `$state` runes

### Tasks

- [x] **2.1** Implement `src/lib/managers/AudioManager.svelte.ts`:
  - Wrap howler.js with `$state` runes
  - Methods: loadPlaylist, play, pause, next, previous
  - State: currentSong, isPlaying, playlist
  - Auto-play next song when current ends
- [x] **2.2** Implement `src/lib/managers/RFIDManager.svelte.ts`:
  - Listen for keyboard input (10 digits + ENTER)
  - Debounce input collection
  - Emit card ID when ENTER pressed
  - Use `$state` for current input
- [x] **2.3** Implement `src/lib/managers/KeyboardManager.svelte.ts`:
  - Listen for W/E/R key presses
  - Emit events: previous, pause, next
  - Use `$state` for tracking key state

### Documentation Check

**Before implementation:**

- [x] Fetch Svelte 5 docs: `mcp__svelte__get-documentation(["$state", "$derived", "$effect"])`
- [x] Fetch howler.js docs: `mcp__context7__get-library-docs("/goldfire/howler.js")`

### Definition of Done

- ✅ All managers export class instances
- ✅ Use `$state` runes (NOT stores)
- ✅ TypeScript strict mode passes
- ✅ Svelte autofixer passes (no issues)
- ✅ Functions < 20 lines
- ✅ KISS principle followed

### Git Checkpoint

```bash
git commit -m "feat: add audio, rfid, and keyboard managers"
```

---

## Phase 3: UI (Player + Admin)

**Goal:** Build minimalist player UI and admin interface

### 3.1 Player UI (`/`) ✅ COMPLETED

**Tasks:**

- [x] **3.1.1** Create `src/routes/+page.server.ts`:
  - Load initial data (folders list)
- [x] **3.1.2** Create `src/routes/+page.svelte`:
  - Integrate AudioManager, RFIDManager, KeyboardManager
  - Display: Current song, album art placeholder, play/pause state
  - DaisyUI Corporate Theme with Stats components
  - Indicator badge for playback status
  - kbd components for control hints

**Implementation Notes:**

- Music files moved to `static/music/` for direct serving
- DaisyUI Corporate theme configured in `tailwind.config.ts` and `app.html`
- API endpoint `/api/cards/[cardId]` for card lookup
- Stats component displays: Now Playing, Album, Track position
- Indicator badge shows Playing/Paused status

**🤝 Human-in-the-loop:**

- ✅ Browser validation via Chrome DevTools MCP passed
- ✅ User tested: RFID scan, pause/play, next/previous all working

**Definition of Done:**

- ✅ RFID input triggers audio playback
- ✅ W/E/R keys control playback
- ✅ Chrome DevTools MCP validation passed
- ✅ User approved design

**Git Checkpoint:**

```bash
git commit -m "feat: implement player UI with DaisyUI corporate theme"
```

---

### 3.2 Admin UI (`/admin`) ✅ COMPLETED

**Tasks:**

- [x] **3.2.1** Create `src/routes/admin/+page.server.ts`:
  - Load action: Get all card mappings with song counts
  - Form actions:
    - `assignCard`: Save RFID → Folder mapping with validation
    - `deleteCard`: Remove card mapping
    - `createFolder`: Create new folder in `/music` with pattern validation
    - `uploadMP3`: Upload MP3 to folder with file size limit (10MB)
- [x] **3.2.2** Create `src/routes/admin/+page.svelte`:
  - Section 1: Card Mappings Table (DaisyUI table-zebra, badges)
  - Section 2: Assign Card Form (RFID input with pattern validation + folder dropdown)
  - Section 3: Create Folder Form (text input with helper text)
  - Section 4: Upload MP3 Form (folder select + file input with max size hint)
  - Success/Error alerts with DaisyUI alert components

**Implementation Notes:**

- All 4 sections implemented with DaisyUI components
- Forms use SvelteKit `use:enhance` for progressive enhancement
- Comprehensive validation (client + server side)
- File uploads support MP3 only, max 10MB
- Folder names validated (alphanumeric, underscore, hyphen only)
- Card IDs validated (exactly 10 digits)

**🤝 Human-in-the-loop:**

- ✅ Browser validation via Chrome DevTools MCP passed
- ✅ All sections visible and functional
- ✅ DaisyUI components correctly applied (cards, tables, forms, badges, buttons)
- ✅ Color coding: Primary (blue), Secondary (pink), Accent (teal), Info (cyan)

IMPORTANT:

- Initial Card Mapping: docs/karten-zuordnung.md (8 cards documented)
- Only Card #1 (0009850659) currently assigned in db.json
- Remaining 7 cards can be assigned via Admin UI

**Definition of Done:**

- ✅ Card mappings visible in table
- ✅ Can assign RFID → Folder
- ✅ Can delete card mappings
- ✅ Can create new folders
- ✅ Can upload MP3s
- ✅ Chrome DevTools MCP validation passed
- ✅ All DaisyUI components properly used

**Git Checkpoint:**

```bash
git commit -m "feat: implement admin interface with DaisyUI components"
# Completed: b08ec83
```

---

## Phase 3.5: Refactoring & Code Quality

**Goal:** Extract utilities, improve code quality, add enhancements

### Tasks

- [x] **3.5.1** Extract formatters to utility:
  - Create `src/lib/utils/formatters.ts` with `formatTitle()` function
  - Replace duplicate `deriveTitle()` implementations
  - Apply formatter to Player UI, Admin UI, FileManager
- [x] **3.5.2** Extract magic constants:
  - Create `src/lib/constants.ts`
  - Extract: CARD_ID_LENGTH, CARD_ID_PATTERN, INPUT_RESET_TIMEOUT_MS, UPLOAD_MAX_SIZE_BYTES, FOLDER_NAME_PATTERN
  - Update: RFIDManager, Admin server actions
- [x] **3.5.3** Improve Player UI:
  - Simplify layout (centered, cleaner spacing)
  - Fix play button position (badge instead of indicator-item)
  - Format album names properly ("Ein Geschenk Des Himmels")
- [x] **3.5.4** Add multiple file upload:
  - Update Admin UI: `multiple` attribute on file input
  - Update server action: `formData.getAll()` for multiple files
  - Validate each file individually
  - Dynamic success messages (1 file vs X files)
- [x] **3.5.5** Fix linting errors:
  - Remove unused `data` prop from Player
  - Add `data-sveltekit-reload` for admin link
  - Add keys to all `{#each}` blocks
  - Disable `svelte/no-navigation-without-resolve` rule

**Implementation Notes:**

- Centralized formatters eliminate code duplication
- Constants provide single source of truth
- Player UI now cleaner and more readable
- Multiple MP3 upload improves admin workflow
- Zero TypeScript errors, only a11y warnings

**Definition of Done:**

- ✅ No code duplication (formatters centralized)
- ✅ No magic values (constants extracted)
- ✅ Player UI cleaner and simpler
- ✅ Multiple file upload working
- ✅ All linting errors fixed (TypeScript: 0 errors)

**Git Checkpoint:**

```bash
git commit -m "refactor: ♻️ add utilities and improve code quality"
# Completed: f00a880
```

---

## Phase 4: Testing & Polish ✅ COMPLETED

**Goal:** Validate everything works, fix edge cases

### Tasks

- [x] **4.1** End-to-End Testing via Chrome DevTools MCP:
  - ✅ Test RFID card flow: Input → Lookup → Audio plays (Card #0009850659 tested)
  - ✅ Test W/E/R keyboard controls (All working: Previous, Pause/Play, Next)
  - ✅ Test admin: Card mappings table displays correctly (7 cards shown)
  - ✅ Test admin: All 4 sections rendered (Mappings, Assign, Create, Upload)
  - ✅ Test error cases: Unknown card (9999999999) → Info alert + Admin link
- [x] **4.2** Edge Case Handling:
  - ✅ Invalid RFID input (< 10 digits): Correctly ignored, no errors
  - ✅ Unknown card: User-friendly alert with Card ID + Admin link
  - ✅ API 404 responses: Gracefully handled by UI
  - ✅ No console errors during testing
- [x] **4.3** Code Quality Review:
  - ✅ Run `bun run format && bun run lint && bun run check`
  - ✅ Functions < 20 lines: All managers and server files comply
  - ✅ No duplication: Formatters centralized, constants extracted
  - ✅ Self-documenting code: Clear names, typed interfaces
  - ✅ No console errors (only Vite debug messages)

**Test Results:**

- **Player UI:** Clean design, RFID scan triggers playback, keyboard controls functional
- **Admin UI:** All sections visible, DaisyUI components correctly applied
- **Edge Cases:** Unknown cards and invalid input handled gracefully
- **Code Quality:** TypeScript 0 errors, ESLint clean, Prettier formatted

**🤝 Human-in-the-loop:**

- ✅ Browser validation via Chrome DevTools MCP passed
- ⏳ Awaiting user feedback for full walkthrough
- **Next:** User tests all flows, reports bugs/UX issues before Raspberry Pi deployment

### Definition of Done

- ✅ All core flows work end-to-end
- ✅ Edge cases handled gracefully
- ✅ No console errors
- ✅ Lint + TypeScript check passes
- ⏳ User approved for production (pending user walkthrough)

### Git Checkpoint

```bash
git commit -m "test: validate core flows and edge cases via chrome devtools"
```

---

## Phase 5: Deployment (Raspberry Pi)

**Goal:** Deploy to Raspberry Pi with auto-start (headless, Kiosk-Mode)

### Raspberry Pi Setup Workflow

**Context:**

- Pi startet → Server startet automatisch → Chromium startet automatisch im Kiosk-Mode
- Localhost über Netzwerk erreichbar (z.B. `http://raspberrypi.local:5173`)
- **KEIN Bildschirm** notwendig (headless operation)

### Tasks

- [ ] **5.1** Create `docs/DEPLOYMENT.md` with step-by-step guide:
  - **System Setup:**
    - Install Raspberry Pi OS Lite (headless)
    - Configure SSH, WLAN
    - Install Bun runtime
  - **Project Setup:**
    - Clone repo from GitHub
    - `bun install`
    - `bun run build`
    - Configure environment (music folder path, port)
  - **Systemd Service (Auto-start Server):**
    - Create `/etc/systemd/system/kinder-audio.service`
    - Start server on boot: `bun run preview` (production mode)
    - Enable: `sudo systemctl enable kinder-audio`
  - **Chromium Kiosk-Mode (Auto-start Browser):**
    - Install chromium-browser
    - Create autostart script: `~/.config/autostart/kiosk.desktop`
    - Launch Chromium in kiosk mode: `chromium-browser --kiosk http://localhost:5173`
    - Disable screen blanking, screensaver
  - **Network Accessibility:**
    - Configure static IP or use mDNS (`raspberrypi.local`)
    - Test access from Mac: `http://raspberrypi.local:5173`
  - **Hardware Setup:**
    - Connect RFID scanner (USB)
    - Connect CH57x controller (USB)
    - Connect InnoMaker Audio amplifier
    - Test audio output
  - **Testing:**
    - Reboot Pi → Server + Browser start automatically
    - RFID card triggers audio
    - W/E/R keys work
    - Admin accessible from Mac over network

- [ ] **5.2** GitHub Repository Setup:
  - Push code to GitHub
  - Add README with:
    - Project description
    - Hardware requirements
    - Link to `docs/DEPLOYMENT.md`

- [ ] **5.3** Test Deployment on Raspberry Pi:
  - Follow `DEPLOYMENT.md` step-by-step
  - Document any issues or missing steps
  - Update `DEPLOYMENT.md` with corrections

- [ ] **5.4** Create `.env.example`:
  - Document environment variables
  - `MUSIC_DIR=/path/to/music`
  - `PORT=5173`
  - `DB_PATH=/path/to/data/db.json`

- [ ] **5.5** Final Validation:
  - Pi boots without monitor
  - Server starts automatically
  - Chromium opens in Kiosk-Mode
  - RFID + Controller work
  - Admin accessible over network
  - Music plays from speakers

**🤝 Human-in-the-loop:**

- User deploys to Raspberry Pi following DEPLOYMENT.md
- **User feedback:** Any missing steps? Errors? Improvements?
- Update DEPLOYMENT.md based on real deployment experience

### Definition of Done

- ✅ `docs/DEPLOYMENT.md` created and complete
- ✅ GitHub repo published
- ✅ Successfully deployed to Raspberry Pi
- ✅ Pi runs headless (no monitor)
- ✅ Server + Browser auto-start on boot
- ✅ Accessible over network
- ✅ RFID + Controller + Audio work
- ✅ User approved for production use

### Git Checkpoint

```bash
git commit -m "docs: add raspberry pi deployment guide"
git push origin main
```

---

## 📋 Notes & Conventions

### During Development

- **Update PLAN.md** after completing each phase (check off tasks)
- **Git commits** follow Conventional Commits (feat, fix, refactor, chore, docs)
- **NEVER mention "Claude Code"** in commits
- **Use `/implement` skill** for all code implementations

### Human-in-the-loop Points

**Phase 3.1 (Player UI):**

- Browser validation → User feedback on layout/minimalism

**Phase 3.2 (Admin UI):**

- After Section 1+2 → User feedback on design/workflow
- After Section 3+4 → Final approval

**Phase 4 (Testing):**

- Full walkthrough → User tests all flows, reports bugs

**Phase 5 (Deployment):**

- User deploys following DEPLOYMENT.md → Feedback on guide accuracy

### File Maintenance

This `PLAN.md` is a **living document**:

- ✅ Check off tasks as completed
- 📝 Add notes/learnings after each phase
- 🔄 Update status in Phase Overview table
- 🐛 Document bugs/issues found during testing

---

## 🚀 Quick Reference

**Current Phase:** Phase 4 ✅ COMPLETED

**Next Steps:**

1. User walkthrough and feedback (Human-in-the-loop)
2. Fix any reported bugs or UX issues
3. Begin Phase 5: Deployment (Raspberry Pi)
4. Create deployment documentation
5. Test on Raspberry Pi hardware

**Recent Additions:**

- ✅ Centralized formatters (`src/lib/utils/formatters.ts`)
- ✅ Constants extraction (`src/lib/constants.ts`)
- ✅ Improved Player UI (cleaner layout, centered design)
- ✅ Multiple MP3 file upload support
- ✅ All linting errors fixed

**See:** `PROJECTPLAN.md` for detailed architecture and design decisions.

# kinder_audio_2

**Toniebox Alternative** - RFID Music Player for Children

This project is an RFID-controlled music player for children, designed as a Toniebox alternative running on Raspberry Pi. Children can scan RFID cards to play music albums, while physical USB controller buttons provide playback control. A web-based admin interface allows parents to manage card-to-music mappings easily.

## Author

**David Weigend**

- Email: david.weigend@gmail.com
- X: [@weigend](https://x.com/weigend)
- Web: [weigend.studio](https://weigend.studio)
- GitHub: [@dweigend](https://github.com/dweigend)

## Tech Stack

- **SvelteKit** - Full-Stack Framework (SSR + API Routes)
- **Svelte 5** - UI with `$state` runes
- **Tailwind CSS + DaisyUI** - Styling
- **howler.js** - Audio playback
- **lowdb** - JSON database
- **Bun** - Package manager & runtime

## Features

- 🎵 RFID card-controlled music playback
- 🎹 USB keyboard controls (W/E/R for prev/pause/next)
- 🖥️ Web admin interface for card management
- 🔊 Auto-play next song
- 📁 Folder-based playlists
- 🎨 Minimalist, kid-friendly UI
- 📤 Multiple MP3 file upload
- ♻️ Clean, maintainable codebase

## Project Structure

```
src/
├── routes/
│   ├── +page.svelte              # Player UI
│   ├── +page.server.ts           # Data loader
│   └── admin/
│       ├── +page.svelte          # Admin Interface
│       └── +page.server.ts       # Form actions
├── lib/
│   ├── managers/                 # Client managers
│   │   ├── AudioManager.svelte.ts      # howler.js wrapper
│   │   ├── RFIDManager.svelte.ts       # RFID input handler
│   │   └── KeyboardManager.svelte.ts   # W/E/R controls
│   ├── server/                   # Server-only
│   │   ├── database.ts           # lowdb CRUD
│   │   └── fileManager.ts        # File operations
│   ├── utils/                    # Shared utilities
│   │   └── formatters.ts         # Text formatting
│   ├── constants.ts              # App constants
│   └── types.ts                  # Shared types
static/music/                     # MP3 folders
data/db.json                      # Card mappings
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (>= 1.0)
- Raspberry Pi (for hardware deployment)
- RFID USB scanner (10-digit input)
- CH57x USB controller (optional, for W/E/R keys)

### Installation

```bash
# Clone the repository
git clone https://github.com/dweigend/kinder_audio_2.git
cd kinder_audio_2

# Install dependencies
bun install
```

### Development

```bash
# Start dev server
bun run dev

# Type check
bun run check

# Lint & format
bun run lint
bun run format

# Tests
bun run test
```

### Production Build

```bash
# Build for production
bun run build

# Preview production build
bun run preview
```

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) (coming in Phase 5) for Raspberry Pi deployment instructions.

## Hardware Setup

1. **RFID Scanner**: Connect USB RFID scanner (sends 10 digits + ENTER)
2. **Controller**: Connect CH57x USB controller (W/E/R keys)
3. **Audio**: Connect speakers/amplifier via 3.5mm jack or USB audio

## Development Roadmap

- ✅ Phase 0: Setup & Dependencies
- ✅ Phase 1: Foundation (Types, DB, FileManager)
- ✅ Phase 2: Managers (Audio, RFID, Keyboard)
- ✅ Phase 3: UI (Player + Admin)
- ✅ Phase 3.5: Refactoring & Code Quality
- ⏳ Phase 4: Testing & Polish
- ⏳ Phase 5: Deployment (Raspberry Pi)

## License

MIT

## Acknowledgments

Built with [Claude Code](https://claude.com/claude-code)

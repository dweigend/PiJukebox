# PiJukebox

**Toniebox Alternative** - RFID Music Player for Children

This project is an RFID-controlled music player for children, designed as a Toniebox alternative running on Raspberry Pi. Children can scan RFID cards to play music albums, while physical USB controller buttons provide playback control. A web-based admin interface allows parents to manage card-to-music mappings easily.

## Tech Stack

- **SvelteKit** - Full-Stack Framework (SSR + API Routes)
- **Svelte 5** - UI with `$state` runes
- **Tailwind CSS + DaisyUI** - Styling
- **howler.js** - Audio playback
- **lowdb** - JSON database
- **Bun** - Package manager & runtime

## Features

- RFID card-controlled music playback
- USB keyboard controls (W/E/R + Arrow Keys + Space)
- Volume control with max limit (child-safe)
- Web admin interface for card management
- Auto-play next song
- Folder-based playlists
- Minimalist, kid-friendly UI
- Multiple MP3 file upload (up to 500MB)
- Clean, maintainable codebase

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
git clone https://github.com/dweigend/PiJukebox.git
cd PiJukebox

# Install dependencies (automatically runs setup.sh)
bun install

# Manual setup (only if postinstall didn't run)
bash setup.sh
```

**Note:** The setup script creates required directories (`data/`, `static/music/`) and initializes the database.

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
# Build for production (uses @sveltejs/adapter-node)
bun run build

# Start production server (runs Node.js under the hood)
bun run start

# Optional: Start with custom host/port
PORT=3000 HOST=0.0.0.0 bun run start
```

### Remote Access

Access the server from another device on your local network:

**Via IP Address:**

```bash
# Find Pi's IP address (on the Pi):
hostname -I

# Access from Mac/PC:
http://192.168.1.173:3000  # Replace with your Pi's IP
```

**Via mDNS (Easier):**

```bash
# Access from Mac/PC:
http://raspberrypi.local:3000
```

**Note:** Server must be started with `HOST=0.0.0.0` for remote access (already configured in start script).

🚨 **Security:** CSRF origin checks are disabled for local network access—do NOT expose to the internet without reconfiguring (see [Security Guide](docs/deployment/README.md#security)).

## Hardware Setup

1. **RFID Scanner**: Connect USB RFID scanner (sends 10 digits + ENTER)
2. **Controller**: Connect CH57x USB controller (W/E/R keys)
3. **Audio**: Connect speakers/amplifier via 3.5mm jack or USB audio

### Keyboard Controls

| Key            | Action         |
| -------------- | -------------- |
| **W**          | Previous track |
| **E**          | Play/Pause     |
| **R**          | Next track     |
| **Arrow Up**   | Volume +5%     |
| **Arrow Down** | Volume -5%     |
| **Space**      | Mute/Unmute    |

## License

MIT

# Projektplan: kinder_audio_2

## 🎯 Projektziel

**Raspberry Pi Music Player für Kinder** - Eine Toniebox-Alternative

## Entwicklungsplan

Das Projekt wird hier auf dem Mac entwickelt und getestet. Wenn fertig als git-Repository veröffentlicht auf GitHub veröffentlicht.
Das GitHub-Repository wird dann auf einen pi 4 geklont und dort initialisiert.

### Funktionsweise auf Raspberry Pi

- RFID-Karte auflegen → Musik spielt automatisch ab
- Physischer Controller zur Steuerung (Prev/Pause/Next)
- Web-Admin-Interface über WLAN zum Verwalten von Karten & Musik
- Einfach, robust, kindgerecht
- Alles läuft über Browser
- Automatischer Start beim Booten des Raspberry Pi -> Chromium Browser im Kiosk-Modus

### Hardware Setup

- **Raspberry Pi**: Läuft im Heimnetzwerk, erreichbar über WLAN
- **RFID-Scanner**: USB, mapped als Tastatureingabe (10-stellige Nummer + ENTER)
- **CH57x Controller**: USB, mapped als Tastatur (W=Previous, E=Pause, R=Next)
- **Audio**: InnoMaker Audio-Verstärker

---

## 🏗️ Architektur

```
kinder_audio_2/
├── src/
│   ├── routes/
│   │   ├── +page.svelte              # Player UI (Frontend)
│   │   ├── +page.server.ts           # Player Data Loader
│   │   └── admin/
│   │       ├── +page.svelte          # Admin UI (Backend)
│   │       └── +page.server.ts       # Admin Form Actions
│   ├── lib/
│   │   ├── managers/
│   │   │   ├── AudioManager.svelte.ts      # howler.js wrapper
│   │   │   ├── RFIDManager.svelte.ts       # RFID input handler
│   │   │   └── KeyboardManager.svelte.ts   # W/E/R key listener
│   │   ├── server/
│   │   │   ├── database.ts           # lowdb wrapper (Card ↔ Folder)
│   │   │   └── fileManager.ts        # Folder/MP3 operations
│   │   └── types.ts                  # Shared TypeScript types
│   └── app.html
├── music/                            # MP3 Ordner (z.B. /elanor_und_der_graue_drache)
├── static/                           # SvelteKit static files
└── data/
    └── db.json                       # lowdb: {cardId: folderName}
```

### Tech Stack

- **SvelteKit**: Full-Stack Framework (Server + Client in einem)
- **Svelte 5**: UI mit `$state` Runes (keine Stores innerhalb Components)
- **Tailwind CSS + DaisyUI**: Styling (kein Custom CSS)
- **howler.js**: Audio Playback
- **lowdb**: JSON-basierte Datenbank für Card-Mappings
- **Bun**: Runtime für Backend-Server + Package Manager
- **Vite**: Frontend-Build + Dev-Server mit HMR

---

## 🎨 UI/UX Design

### Player Interface (`/`)

**Zweck**: Minimalistisch, fokussiert auf Audio-Feedback

**DaisyUI Components**:

**User Flow**:

- RFID-Scanner wird als Tastatur erkannt

1. RFID-Scanner sendet 10 Ziffern (z.B. 0009555230) + ENTER
2. Input-Event → `RFIDManager` → `database.ts` lookup
3. Wenn Mapping existiert → `AudioManager.loadPlaylist(folder)`
4. Audio startet automatisch

**Controller**

- Controller wird als Tastatur erkannt
- **w** -> einen Song zurück
- **e** -> Pause
- **r** -> Eins Weiter (im gleichen Ordner)

### Admin Interface (`/admin`)

**Zweck**: Karten zuordnen, Ordner verwalten, MP3s hochladen

**Sections**:

1. Card Mappings Table (ReadOnly)
2. Assign Card (RFID Input + Folder Dropdown + Submit)
3. Create Folder (Folder Name + Submit)
4. Upload MP3s (Folder Select + File Input + Submit)

---

## 🔄 Development Prozess

### Prozess-Übersicht

Allgemeiner Workflow:

1. Einen Plan für das Gesamtprojekt erstellen
2. Klarheit über die Architektur schaffen
3. Alle Entwiklungsphasen planen
4. PLAN.md schreiben (Ziel, Komponenten, Steps)
5. CLAUDE.md schreiben

### 1. Feature Planning

**Vor jeder Feature Implementierung**:

1. **Scope definieren**: Was soll implementiert werden? Was NICHT?
2. **Docs checken, MCPs nutzen**: Docs abrufen (insb. `mcp__context7__`, `mcp__svelte__`)
3. **Bestehenden Code prüfen**: `tree`, `rg`, `fd` - keine Duplikate!
4. **Plan mit allen Unterschritten genau definieren**

### 2. Entwicklungsprozess

1. **PREPARE**: Git-Checkpoint, Docs lesen, Step planen
2. **CODE**: Implementation des neuen Features
3. **VALIDATE**: Test (DevTools MCP) + Lint
4. **REFINE**: Refactor Check + wenn nötig refactor <-> test -> lint
5. **COMMIT**: Git-Commit (WICHTIG: NIE CLAUDE CODE NENNEN)
   å

### 3. Refactor Check\*\*

Am Ende jeder Entwicklung noch einmal checken ob alles so implementiert wurde wie geplant.
ZIEL: Überflüssigen Code entfernen. Code-Qualität sicherstellen:

- Architektur-Fit?
- DRY eingehalten?
- KISS eingehalten?
- Funktionen < 20 Zeilen?
- Self-documenting Code?
- Gut für Menschen lesbar

---

## 📏 Code-Qualitätsstandards

### TypeScript Rules

### 3. Testing Strategy

**Kein Test-Framework** - Manuelle Validation über Chrome DevTools MCP:

1. **Navigate**: `mcp__chrome-devtools__navigate_page` (URL öffnen)
2. **Snapshot**: `mcp__chrome-devtools__take_snapshot` (DOM-Struktur)
3. **Screenshot**: `mcp__chrome-devtools__take_screenshot` (Visuell)
4. **Interact**: `mcp__chrome-devtools__click`, `mcp__chrome-devtools__fill`
5. **Console**: `mcp__chrome-devtools__list_console_messages` (Errors?)
6. **Network**: `mcp__chrome-devtools__list_network_requests` (API Calls?)

**Flow**:

- Feature implementieren → Dev Server starten → Chrome DevTools MCP validieren → Iterieren

---

## 📏 Coding Standards

### TypeScript

- ✅ **Strict Mode**: `"strict": true` in tsconfig.json
- ✅ **Explicit Types**: Alle Funktionen mit Return-Type
- ✅ **No `any`**: Immer konkrete Types oder `unknown`
- ✅ **Early Returns**: Validierung am Anfang, dann Hauptlogik
- ✅ **Funktionen < 20 Zeilen**: Bei Überschreitung → refactoren

### Svelte 5

- ✅ **`$state` Runes**: Für reaktive Werte (NICHT Stores in Components)
- ✅ **`$derived`**: Für berechnete Werte
- ✅ **`$effect`**: Für Side-Effects (sparsam nutzen)
- ✅ **Manager Classes**: Exportiere Instanzen aus `.svelte.ts` Files
- ✅ **MCP nutzen**: `mcp__svelte__list-sections` → `mcp__svelte__get-documentation`

### Clean Code Prinzipien

1. **KISS**: Einfachste Lösung wählen - keine Überengineering
2. **Single Responsibility**: Eine Datei/Funktion = Eine Aufgabe
3. **DRY**: Keine Duplikate - erst suchen, dann schreiben
4. **Self-Documenting Code**: Namen > Comments
5. **Separation of Concerns**:
   - Server Logic → `src/lib/server/`
   - Client Logic → `src/lib/managers/`
   - UI → `src/routes/*.svelte`

### File Organization

```typescript
// ✅ Gute Struktur
src / lib / managers / AudioManager.svelte.ts; // Eine Klasse, ein File
src / lib / server / database.ts; // Eine Verantwortung: DB

// ❌ Schlechte Struktur
src / lib / utils.ts; // Zu generisch
src / lib / helpers / index.ts; // "Müllhalde"
```

### Git Workflow

1. **Conventional Commits**:

   ```
   feat: add RFID card scanning
   fix: resolve audio pause bug
   refactor: simplify AudioManager
   docs: update setup instructions
   chore: checkpoint before refactor
   ```

2. **Checkpoints vor Risiko**:

   ```bash
   git add -A
   git commit -m "chore: checkpoint before [risky change]"
   ```

3. **Atomic Commits**: Ein Feature = Ein Commit (außer bei großen Features)

### Linting & Formatting

```bash
# Vor jedem Commit
bun run lint     # Prettier + ESLint
bun run format   # Auto-Fix
```

### MCPs nutzen

**Vor Implementation**:

1. **Docs abrufen**: `mcp__context7__resolve-library-id` → `mcp__context7__get-library-docs`
2. **Svelte Fragen**: `mcp__svelte__list-sections` → `mcp__svelte__get-documentation`
3. **Code Suche**: `mcp__perplexity__code_search` (Implementation Patterns)
4. **Quick Facts**: `mcp__perplexity__quick_search` (API Referenzen)

**Reihenfolge**:

1. Offizielle Docs (context7, svelte MCP)
2. Bestehender Code im Projekt (rg, fd)
3. Perplexity für Patterns
4. Eigene Implementation (nur als letztes Mittel)

---

## 🚀 Implementation Reihenfolge

### Phase 1: Foundation

1. **Setup**: Dependencies installieren (`howler.js`, `lowdb`)
2. **Types**: `src/lib/types.ts` (Card, Folder, Playlist Types)
3. **Database**: `src/lib/server/database.ts` (lowdb CRUD)
4. **FileManager**: `src/lib/server/fileManager.ts` (Folder/MP3 Ops)

### Phase 2: Managers

5. **AudioManager**: `src/lib/managers/AudioManager.svelte.ts`
6. **RFIDManager**: `src/lib/managers/RFIDManager.svelte.ts`
7. **KeyboardManager**: `src/lib/managers/KeyboardManager.svelte.ts`

### Phase 3: UI

8. **Player**: `src/routes/+page.svelte` + `+page.server.ts`
9. **Admin**: `src/routes/admin/+page.svelte` + `+page.server.ts`

### Phase 4: Integration & Polish

10. **Testing**: Chrome DevTools MCP Validation
11. **Refinement**: Bugs fixen, Edge Cases
12. **Deployment**: Raspberry Pi Setup Docs

---

## 🎯 Qualitätskriterien

### Code Review Checklist

- [ ] TypeScript Strict Mode ohne Errors?
- [ ] Alle Funktionen < 20 Zeilen?
- [ ] Keine `any` Types?
- [ ] DaisyUI Components genutzt (kein Custom CSS)?
- [ ] Svelte 5 `$state` Runes verwendet?
- [ ] MCP Docs konsultiert?
- [ ] Keine Code-Duplikate?
- [ ] Git Checkpoint vor Änderung?
- [ ] Lint passed?
- [ ] Chrome DevTools Validation durchgeführt?

### Definition of Done

- ✅ Feature funktioniert im Browser (DevTools validiert)
- ✅ Code ist selbsterklärend (keine Magic Numbers/Strings)
- ✅ Keine Console Errors/Warnings
- ✅ Lint passed
- ✅ Conventional Commit gemacht
- ✅ Docs aktualisiert (falls nötig)

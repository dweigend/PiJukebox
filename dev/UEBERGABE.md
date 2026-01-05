# Uebergabe - Admin Panel Redesign

## Aktueller Stand
**Datum:** 2026-01-04
**Phase:** Session 2 abgeschlossen ✅
**Naechste Session:** Session 3 - Drag & Drop Track-Sortierung

---

## Was wurde gemacht (Session 2)

### Upload mit Progress Refactor ✅

1. **Neuer API Endpoint** (`src/routes/api/upload/+server.ts`):
   - POST: multipart/form-data mit `folderName` und `files`
   - Validiert Dateityp (.mp3) und Groesse (max 500MB)
   - Nutzt bestehende `saveMP3()` und `folderExists()`
   - JSON Response: `{ success, uploaded, message }` oder `{ error }`

2. **UploadZone Komponente** (`src/lib/components/admin/UploadZone.svelte`):
   - Props: `folderName`, `onupload` Callback
   - DaisyUI `file-input` + `progress` Bar
   - XMLHttpRequest fuer Progress-Events
   - Success/Error Alerts
   - Disabled state waehrend Upload

3. **Alte Form Action entfernt** (Refactor):
   - `uploadMP3` Action aus `+page.server.ts` geloescht
   - Upload-Formular in `+page.svelte` durch UploadZone ersetzt
   - Keine Duplikation mehr - ein Upload-Weg statt zwei

### Tests ✅
- Upload mit kleiner Datei funktioniert
- Progress-Anzeige funktioniert
- Success-Message erscheint
- `invalidateAll()` aktualisiert Song-Count
- File Input wird nach Upload zurueckgesetzt

---

## Session 1 (Abgeschlossen)

### Database & Track Order Backend ✅
- `CardData` Interface mit `folderName` und `trackOrder?`
- `getCardData()`, `setCardData()`, `setTrackOrder()` Funktionen
- `sortSongsByOrder()` Helper
- POST `/api/cards/[cardId]/order` Endpoint
- GET `/api/cards/[cardId]` wendet trackOrder an

---

## Naechste Session (Session 3)

### Ziel
Drag & Drop Track-Sortierung implementieren.

### Tasks
1. `bun add svelte-dnd-action` - Dependency installieren
2. `src/lib/components/admin/TrackList.svelte` - Komponente mit DnD
3. `src/lib/server/fileManager.ts` - `deleteSong()` implementieren
4. DELETE Endpoint fuer Songs
5. Chrome DevTools Tests

### Commit am Ende
```bash
git commit -m "feat: ✨ add drag-drop track reordering"
```

---

## Wichtige Dateien

### Session 2 (Neu)
- `src/routes/api/upload/+server.ts` - Upload API Endpoint
- `src/lib/components/admin/UploadZone.svelte` - Upload Komponente

### Session 2 (Geaendert)
- `src/routes/admin/+page.server.ts` - uploadMP3 Action entfernt
- `src/routes/admin/+page.svelte` - UploadZone integriert

### Session 1
- `src/lib/types.ts` - CardData Interface
- `src/lib/server/database.ts` - 3 neue Funktionen
- `src/lib/server/fileManager.ts` - sortSongsByOrder
- `src/routes/api/cards/[cardId]/+server.ts`
- `src/routes/api/cards/[cardId]/order/+server.ts`

---

## Komponenten Uebersicht

```
src/lib/components/admin/
└── UploadZone.svelte     # Session 2 ✅
```

Geplant fuer Session 3+:
```
src/lib/components/admin/
├── UploadZone.svelte     # ✅
├── TrackList.svelte      # Session 3
└── CardEditor.svelte     # Session 4
```

---

## Git Status
- Branch: main
- Letzter Commit: Session 1 Track Order (`7573d06`)

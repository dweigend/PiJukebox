# Uebergabe - Admin Panel Redesign

## Aktueller Stand
**Datum:** 2026-01-05
**Phase:** Session 4 abgeschlossen ✅
**Naechste Session:** Session 5 - Admin Page Redesign

---

## Was wurde gemacht (Session 4)

### CardEditor Komponente ✅

1. **Neuer API Endpoint** (`src/routes/api/folders/[folderName]/songs/+server.ts`):
   - GET: Laedt alle Songs eines Folders
   - Nutzt existierende `getFolderSongs()` Funktion
   - Ermoeglicht `refreshSongs()` im CardEditor

2. **CardEditor Komponente** (`src/lib/components/admin/CardEditor.svelte`):
   - **Props:**
     ```typescript
     interface Props {
       cardId?: string;           // undefined = neue Karte
       folderName?: string;       // Folder der Karte
       songs?: Song[];            // Songs (bereits sortiert)
       existingFolders: string[]; // Fuer Dropdown
       onSave: () => void;        // Nach Speichern
       onCancel: () => void;      // Bei Abbruch
     }
     ```
   - **Svelte 5 Patterns:** `$props()`, `$state()`, `$derived()`
   - **Features:**
     - Card ID Input mit 10-Ziffern Validierung
     - Folder Mode Toggle (Select Existing / Create New)
     - Folder Name Sanitization Preview
     - TrackList Integration (Drag & Drop + Delete)
     - UploadZone Integration (Progress Bar)
     - Optimistic Updates bei Reorder
     - Error/Success Alerts

3. **Event Handlers:**
   - `handleReorder(order)` - Optimistic update + POST `/api/cards/[id]/order`
   - `handleDelete(filename)` - Confirm + DELETE `/api/folders/.../songs/...`
   - `handleUploadComplete()` - Refresh Songs via neuen Endpoint
   - `handleSave()` - Create Folder (optional) + Assign Card + Save Order

### Tests ✅
- TypeScript check: 0 Errors
- API Endpoint `/api/folders/[folder]/songs` funktioniert
- Dev Server laeuft ohne Fehler
- Console: Keine Errors

---

## Session 3 (Abgeschlossen)

### TrackList Komponente mit Drag & Drop ✅
- `svelte-dnd-action` fuer Drag & Drop
- DELETE Endpoint fuer Songs
- Security: Path Traversal Protection

---

## Session 2 (Abgeschlossen)

### Upload mit Progress Refactor ✅
- Upload API Endpoint
- UploadZone mit Progress Bar

---

## Session 1 (Abgeschlossen)

### Database & Track Order Backend ✅
- CardData Interface
- Track Order API

---

## Naechste Session (Session 5)

### Ziel
Admin Page komplett umbauen mit CardEditor Integration.

### UI Layout
```
+--------------------------------------------------+
| Admin Interface                                   |
+--------------------------------------------------+
| Card Mappings                              [+]    |
|--------------------------------------------------+
| Card ID     | Folder       | Tracks | Actions    |
|-------------|--------------|--------|------------|
| 0123456789  | hoerbuch_1   | 12     | [Edit][Del]|
+--------------------------------------------------+
| Card Editor (erscheint bei Klick)                |
| <CardEditor ... />                               |
+--------------------------------------------------+
| > Settings (collapsible)                         |
+--------------------------------------------------+
```

### Tasks
- [ ] Admin Page Load Function erweitern (Track-Counts)
- [ ] Kartenliste als DaisyUI Table
- [ ] [+] Button fuer neue Karte
- [ ] Edit/Delete Buttons pro Zeile
- [ ] CardEditor Integration (conditional rendering)
- [ ] Settings in DaisyUI Collapse

### Commit am Ende
```bash
git commit -m "feat: redesign admin panel with card-centric workflow"
```

---

## Wichtige Dateien

### Session 4 (Neu)
- `src/routes/api/folders/[folderName]/songs/+server.ts` - GET Songs Endpoint
- `src/lib/components/admin/CardEditor.svelte` - Haupt-Editor Komponente

### Session 3
- `src/lib/components/admin/TrackList.svelte` - DnD Track-Liste
- `src/routes/api/folders/[folderName]/songs/[filename]/+server.ts` - DELETE Endpoint

### Session 2
- `src/routes/api/upload/+server.ts` - Upload API Endpoint
- `src/lib/components/admin/UploadZone.svelte` - Upload Komponente

### Session 1
- `src/lib/types.ts` - CardData Interface
- `src/lib/server/database.ts` - getCardData, setCardData, setTrackOrder
- `src/routes/api/cards/[cardId]/+server.ts`
- `src/routes/api/cards/[cardId]/order/+server.ts`

---

## Komponenten Uebersicht

```
src/lib/components/admin/
├── UploadZone.svelte     # Session 2 ✅
├── TrackList.svelte      # Session 3 ✅
└── CardEditor.svelte     # Session 4 ✅
```

---

## API Endpoints Uebersicht

| Endpoint | Method | Beschreibung |
|----------|--------|--------------|
| `/api/cards/[cardId]` | GET | Card Data + Songs laden |
| `/api/cards/[cardId]/order` | POST | Track Order speichern |
| `/api/folders/[folder]/songs` | GET | Songs eines Folders laden |
| `/api/folders/[folder]/songs/[file]` | DELETE | Song loeschen |
| `/api/upload` | POST | MP3 Upload mit Progress |

---

## Git Status
- Branch: main
- Letzter Commit: Session 3 TrackList (`33d93c3`)

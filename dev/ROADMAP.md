# Admin Panel Redesign - Roadmap

## Projektziel
Das Admin Panel wird von einem fragmentierten Workflow (Ordner erstellen -> Dateien hochladen -> Karte zuweisen) zu einem card-zentrierten Workflow umgebaut. Der neue Workflow orientiert sich am tatsaechlichen Nutzungsfall: Eine neue RFID-Karte soll mit Musik bespielt werden.

**Neuer Workflow:** Karte scannen/eingeben -> Folder-Name vergeben -> MP3s hochladen -> Reihenfolge festlegen -> Fertig

---

## Session 1: Database & Track Order Backend

### Ziel
Die Datenbank-Schicht wird erweitert, um Track-Reihenfolgen zu speichern. Aktuell werden Tracks in der Reihenfolge des Dateisystems abgespielt, was bei Hoerbuechern zu falscher Kapitelreihenfolge fuehren kann. Nach dieser Session kann die Reihenfolge der Tracks pro Karte in der Datenbank gespeichert und beim Abrufen angewendet werden.

### Hintergrund
Das aktuelle Datenmodell speichert Cards als einfaches Mapping: `cards: Record<string, string>` (cardId -> folderName). Dieses Modell wird erweitert zu `cards: Record<string, CardData>`, wobei CardData neben dem folderName auch ein optionales trackOrder-Array enthaelt. Die Rueckwaertskompatibilitaet bleibt erhalten - alte Eintraege werden automatisch normalisiert.

### Technische Umsetzung
1. **Types erweitern** (`src/lib/types.ts`):
   - Neues Interface `CardData` mit `folderName: string` und `trackOrder?: string[]`
   - Das trackOrder-Array enthaelt Dateinamen in der gewuenschten Reihenfolge

2. **Database-Funktionen** (`src/lib/server/database.ts`):
   - `getCardData(cardId)`: Laedt Card-Daten und normalisiert alte String-Eintraege zu CardData
   - `setCardData(cardId, data)`: Speichert CardData (ersetzt setCardMapping fuer neue Eintraege)
   - `setTrackOrder(cardId, order)`: Aktualisiert nur die Reihenfolge einer existierenden Karte

3. **Neuer API-Endpoint** (`src/routes/api/cards/[cardId]/order/+server.ts`):
   - POST: Nimmt ein Array von Dateinamen entgegen und speichert die Reihenfolge

4. **Bestehenden Endpoint anpassen** (`src/routes/api/cards/[cardId]/+server.ts`):
   - GET: Wendet trackOrder auf die Songs an, bevor sie zurueckgegeben werden
   - Fallback: Wenn kein trackOrder existiert, wird Filesystem-Reihenfolge verwendet

### Tasks
- [ ] `src/lib/types.ts` - `CardData` Interface hinzufuegen
- [ ] `src/lib/server/database.ts` - `getCardData()` implementieren
- [ ] `src/lib/server/database.ts` - `setCardData()` implementieren
- [ ] `src/lib/server/database.ts` - `setTrackOrder()` implementieren
- [ ] `src/routes/api/cards/[cardId]/order/+server.ts` - POST Endpoint erstellen
- [ ] `src/routes/api/cards/[cardId]/+server.ts` - Track Order anwenden
- [ ] `bun run check` - TypeScript pruefen
- [ ] Manuell testen: API-Calls mit curl oder Browser

### Commit
```bash
git commit -m "feat: add track order support to database"
```

---

## Session 2: Upload mit Progress

### Ziel
Der Datei-Upload wird um eine Fortschrittsanzeige erweitert. Aktuell gibt es beim Upload grosser Dateien (bis 500MB) keinerlei visuelles Feedback. Nach dieser Session sieht der User einen Fortschrittsbalken waehrend des Uploads.

### Hintergrund
SvelteKit Form Actions unterstuetzen keine Upload-Progress-Events. Daher wird ein separater API-Endpoint erstellt, der mit XMLHttpRequest angesprochen wird. XMLHttpRequest bietet `upload.onprogress` Events, die den Fortschritt in Prozent liefern.

### Technische Umsetzung
1. **Neuer Upload-Endpoint** (`src/routes/api/upload/+server.ts`):
   - POST: Akzeptiert multipart/form-data mit `folderName` und `files`
   - Validiert Dateityp (.mp3) und Groesse (max 500MB)
   - Speichert Dateien mit `saveMP3()` aus fileManager
   - Gibt JSON-Response mit Anzahl hochgeladener Dateien zurueck

2. **UploadZone Komponente** (`src/lib/components/admin/UploadZone.svelte`):
   - Props: `folderName: string`, `onupload: () => void`
   - State: `progress: number`, `isUploading: boolean`
   - DaisyUI `file-input` fuer Dateiauswahl (multiple, accept=".mp3")
   - DaisyUI `progress` Bar zeigt Upload-Fortschritt
   - XMLHttpRequest mit `upload.addEventListener('progress', ...)` fuer Progress-Tracking
   - Ruft `onupload` Callback nach erfolgreichem Upload auf

### Tasks
- [ ] `src/routes/api/upload/+server.ts` - Upload Endpoint erstellen
- [ ] `src/lib/components/admin/` Verzeichnis erstellen (falls nicht vorhanden)
- [ ] `src/lib/components/admin/UploadZone.svelte` - Komponente implementieren
- [ ] DaisyUI `file-input` mit `progress` Bar integrieren
- [ ] XMLHttpRequest mit Progress Events implementieren
- [ ] `bun run check` - TypeScript pruefen
- [ ] Chrome DevTools MCP: Upload mit kleiner Datei testen
- [ ] Chrome DevTools MCP: Upload mit grosser Datei (100MB+) testen

### Commit
```bash
git commit -m "feat: add upload progress indicator"
```

---

## Session 3: Drag & Drop Track-Sortierung

### Ziel
Tracks koennen per Drag & Drop sortiert werden. Ausserdem koennen einzelne Tracks aus einem Ordner geloescht werden. Nach dieser Session kann der User die Reihenfolge der Tracks visuell aendern und Tracks entfernen.

### Hintergrund
Fuer Drag & Drop wird die Library `svelte-dnd-action` verwendet. Diese bietet eine Svelte Action `use:dndzone`, die Listen sortierbar macht. Die Library ist Svelte 5 kompatibel und bietet Keyboard-Accessibility.

### Technische Umsetzung
1. **Dependency installieren**:
   ```bash
   bun add svelte-dnd-action
   ```

2. **TrackList Komponente** (`src/lib/components/admin/TrackList.svelte`):
   - Props: `songs: Song[]`, `onreorder: (order: string[]) => void`, `ondelete: (filename: string) => void`
   - Verwendet `svelte-dnd-action` mit `use:dndzone={{ items, flipDurationMs }}`
   - `animate:flip` fuer smooth Animations
   - Jeder Track hat einen Delete-Button (DaisyUI `btn btn-ghost btn-xs`)
   - Bei Drag-Ende wird `onreorder` mit neuer Reihenfolge aufgerufen
   - Bei Delete-Klick wird `ondelete` mit Filename aufgerufen

3. **FileManager erweitern** (`src/lib/server/fileManager.ts`):
   - Neue Funktion `deleteSong(folderName, filename)`: Loescht MP3 aus Ordner

4. **Delete-Endpoint** (`src/routes/api/folders/[folderName]/songs/[filename]/+server.ts`):
   - DELETE: Loescht Song aus Ordner und aktualisiert ggf. trackOrder

### Tasks
- [ ] `bun add svelte-dnd-action` - Dependency installieren
- [ ] `src/lib/components/admin/TrackList.svelte` - Komponente implementieren
- [ ] Drag & Drop mit `svelte-dnd-action` integrieren
- [ ] Delete-Buttons pro Track hinzufuegen
- [ ] `src/lib/server/fileManager.ts` - `deleteSong()` implementieren
- [ ] `src/routes/api/folders/[folderName]/songs/[filename]/+server.ts` - DELETE Endpoint
- [ ] `bun run check` - TypeScript pruefen
- [ ] Chrome DevTools MCP: Drag & Drop testen
- [ ] Chrome DevTools MCP: Song loeschen testen

### Commit
```bash
git commit -m "feat: add drag-drop track reordering"
```

---

## Session 4: Card Editor Komponente

### Ziel
Eine vollstaendige Card Editor Komponente wird erstellt, die alle bisherigen Komponenten (UploadZone, TrackList) orchestriert. Nach dieser Session kann eine Karte mit allen Optionen bearbeitet werden: Card ID eingeben, Folder-Name vergeben, Tracks sortieren, neue Tracks hochladen.

### Hintergrund
Der CardEditor ist die zentrale Komponente des neuen Admin Panels. Er verwaltet den State fuer eine einzelne Karte und koordiniert die Kommunikation mit der API. Die Komponente kann sowohl fuer neue Karten (leerer State) als auch fuer existierende Karten (vorausgefuellter State) verwendet werden.

### Technische Umsetzung
1. **CardEditor Komponente** (`src/lib/components/admin/CardEditor.svelte`):
   - Props: `cardId?: string`, `folderName?: string`, `songs?: Song[]`, `existingFolders: string[]`, `onSave: () => void`, `onCancel: () => void`
   - State (mit `$state`):
     - `editCardId: string` - Card ID (10-stellig)
     - `editFolderName: string` - Folder Name
     - `editSongs: Song[]` - Aktuelle Track-Liste
     - `isNewCard: boolean` - Neue oder existierende Karte
     - `isSaving: boolean` - Speicher-Indikator
   - Validierung:
     - Card ID muss 10 Ziffern haben
     - Folder Name darf nur alphanumerisch + Unterstrich/Bindestrich sein
   - Integration:
     - TrackList fuer Sortierung und Loeschen
     - UploadZone fuer neue Uploads
   - API-Calls:
     - POST `/api/cards/[cardId]/order` - Reihenfolge speichern
     - Form Action `?/assignCard` - Karte zuweisen (wiederverwendet)
   - Buttons:
     - Save: Speichert alle Aenderungen
     - Cancel: Verwirft Aenderungen, ruft `onCancel` auf

### Tasks
- [ ] `src/lib/components/admin/CardEditor.svelte` - Komponente implementieren
- [ ] Card ID Input mit 10-Ziffern Validierung
- [ ] Folder Name Input (bestehend auswaehlen oder neu eingeben)
- [ ] TrackList Integration fuer Sortierung
- [ ] UploadZone Integration fuer neue Uploads
- [ ] Save/Cancel Buttons mit API-Calls
- [ ] `bun run check` - TypeScript pruefen
- [ ] Chrome DevTools MCP: Neuen Card erstellen testen
- [ ] Chrome DevTools MCP: Existierende Card bearbeiten testen

### Commit
```bash
git commit -m "feat: add card editor component"
```

---

## Session 5: Admin Page Redesign

### Ziel
Die Admin Page wird komplett umgebaut. Die Kartenliste steht oben, darunter oeffnet sich bei Klick der Card Editor. Settings werden in einem Collapsible versteckt. Nach dieser Session ist das neue Admin Panel vollstaendig nutzbar.

### Hintergrund
Das aktuelle Admin Panel hat 5 separate Sektionen ohne klaren Workflow. Das neue Layout priorisiert die haeufigste Aufgabe: Karten verwalten. Die Kartenliste zeigt auf einen Blick alle zugewiesenen Karten mit Folder-Name und Track-Anzahl. Ein Klick auf eine Zeile oder den Edit-Button oeffnet den CardEditor darunter.

### UI Layout
```
+--------------------------------------------------+
| Admin Interface                                   |
+--------------------------------------------------+
| Card Mappings                              [+]    |
|--------------------------------------------------|
| Card ID     | Folder       | Tracks | Actions    |
|-------------|--------------|--------|------------|
| 0123456789  | hoerbuch_1   | 12     | [Edit][Del]|
| 9876543210  | kinderlieder | 8      | [Edit][Del]|
+--------------------------------------------------+
| Card Editor (erscheint bei Klick)                |
| ...                                              |
+--------------------------------------------------+
| > Settings (collapsible)                         |
|   Volume: [========] 50%                         |
+--------------------------------------------------+
```

### Technische Umsetzung
1. **Admin Page umbauen** (`src/routes/admin/+page.svelte`):
   - State:
     - `selectedCard: { cardId: string, folderName: string, songs: Song[] } | null`
     - `isCreatingNew: boolean`
   - Kartenliste als DaisyUI `table table-zebra`
   - [+] Button im Header oeffnet leeren CardEditor
   - Zeilen-Klick oder Edit-Button oeffnet CardEditor mit Daten
   - CardEditor erscheint unterhalb der Tabelle (conditional rendering)
   - Settings in DaisyUI `collapse collapse-arrow`

2. **Server anpassen** (`src/routes/admin/+page.server.ts`):
   - Load Function: Laedt alle Karten mit zugehoerigen Folder-Infos und Track-Counts
   - Bestehende Form Actions bleiben erhalten (assignCard, deleteCard, updateSettings)

### Tasks
- [ ] `src/routes/admin/+page.server.ts` - Load Function erweitern (Track-Counts)
- [ ] `src/routes/admin/+page.svelte` - Layout umbauen
- [ ] Kartenliste als Tabelle implementieren
- [ ] [+] Button fuer neue Karte
- [ ] Edit/Delete Buttons pro Zeile
- [ ] CardEditor Integration (conditional rendering)
- [ ] Settings in DaisyUI Collapse verschieben
- [ ] `bun run check` - TypeScript pruefen
- [ ] `bun run lint` - Code-Qualitaet pruefen
- [ ] Chrome DevTools MCP: Vollstaendiger Workflow-Test
- [ ] Test: Neue Karte anlegen, Songs hochladen, sortieren, speichern
- [ ] Test: Existierende Karte bearbeiten
- [ ] Test: Upload grosser Datei (500MB)

### Commit
```bash
git commit -m "feat: redesign admin panel with card-centric workflow"
```

---

## Session 6: Docs & Cleanup

### Ziel
Dokumentation wird aktualisiert und Code bereinigt. Nach dieser Session ist das Projekt vollstaendig dokumentiert und bereit fuer den produktiven Einsatz.

### Tasks
- [ ] `dev/UEBERGABE.md` - Aktuellen Stand dokumentieren
- [ ] `README.md` - Bei Bedarf Admin-Dokumentation ergaenzen
- [ ] `CLAUDE.md` - Bei Bedarf Patterns aktualisieren
- [ ] Code Review: Ungenutzte Imports entfernen
- [ ] Code Review: Console.logs entfernen
- [ ] Code Review: Funktionen < 20 Zeilen pruefen
- [ ] `bun run lint` - Finale Code-Qualitaet

### Commit
```bash
git commit -m "docs: update documentation for admin redesign"
```

---

## Dateien Uebersicht

### Zu modifizieren
| Datei | Session | Aenderung |
|-------|---------|-----------|
| `src/lib/types.ts` | 1 | CardData Interface |
| `src/lib/server/database.ts` | 1 | getCardData, setCardData, setTrackOrder |
| `src/lib/server/fileManager.ts` | 3 | deleteSong |
| `src/routes/api/cards/[cardId]/+server.ts` | 1 | Track Order anwenden |
| `src/routes/admin/+page.svelte` | 5 | Komplettes Redesign |
| `src/routes/admin/+page.server.ts` | 5 | Load mit Track-Counts |

### Neu zu erstellen
| Datei | Session | Beschreibung |
|-------|---------|--------------|
| `src/routes/api/cards/[cardId]/order/+server.ts` | 1 | POST Track Order |
| `src/routes/api/upload/+server.ts` | 2 | Upload mit Progress |
| `src/routes/api/folders/[folderName]/songs/[filename]/+server.ts` | 3 | DELETE Song |
| `src/lib/components/admin/UploadZone.svelte` | 2 | File Input + Progress |
| `src/lib/components/admin/TrackList.svelte` | 3 | DnD Sortierung |
| `src/lib/components/admin/CardEditor.svelte` | 4 | Haupt-Editor |

### Dependencies
```bash
bun add svelte-dnd-action  # Session 3
```

# Lautstärke-System Fix & Persistenz

**Datum:** 2025-11-21
**Status:** In Bearbeitung

---

## 🔍 Analyse: Identifizierte Probleme

### 1. KeyboardManager nutzt Media Keys NICHT für Lautstärke

**Problem:** `src/lib/managers/KeyboardManager.svelte.ts:77-85`

- Die Media Keys (`AudioVolumeUp`, `AudioVolumeDown`, `AudioVolumeMute`) werden registriert
- **ABER:** Es gibt **keine Verbindung** zum AudioManager im Hauptcode
- Die Callbacks `onVolumeUp`, `onVolumeDown`, `onMute` werden initialisiert, aber **nirgendwo im System genutzt**

**Ursache:** Die KeyboardManager-Initialisierung im Player verbindet nur W/E/R (Prev/Pause/Next), **nicht die Volume-Callbacks**.

---

### 2. Keine Persistenz für Lautstärke-Einstellungen

**Problem:** Lautstärke wird nur in `$state` gehalten

- `currentVolume` und `maxVolume` werden in `AudioManager.svelte.ts:17-18` als reaktive States gesetzt
- **Beim Neuladen der App gehen Einstellungen verloren** (keine DB-Persistenz)
- Keine Speicherung in `lowdb` oder `localStorage`

---

### 3. Inkonsistente Initialisierung

**Problem:** `AudioManager.svelte.ts:170`

- Bei `#initHowl()` wird die aktuelle `currentVolume` verwendet
- **ABER:** Wenn die App startet, ist `currentVolume = 0.8` (Hardcoded Default)
- Nutzer-Einstellungen werden **nicht aus DB geladen**

---

### 4. Fehlende Admin-UI für maxVolume

**Problem:** `AudioManager.svelte.ts:91-98`

- `setMaxVolume(percentage)` clampiert korrekt auf `MIN_VOLUME` (1%) und `MAX_VOLUME` (100%)
- **ABER:** Es gibt **keine UI** im Admin-Bereich, um `maxVolume` zu setzen
- Hardcoded Default `maxVolume = 0.8` (80%) wird nie geändert

---

## 📚 MCP-Recherche: Library Best Practices

### howler.js - Volume Control

**✅ Korrekt im aktuellen Code:**

- Volume Range: `0.0` bis `1.0` (nicht 0-100)
- `currentVolume` und `maxVolume` beide als `0-1` gespeichert

**Alternative für Mute (NICHT ändern - funktioniert aktuell):**

- howler.js bietet dedizierte `mute()` Methode
- Aktueller Code: `volume(0)` funktioniert, bleibt so
- Kommentar im Code: "Alternativ: howler.js hat mute() method"

**Verfügbare Features:**

- Fade-Funktionalität: `sound.fade(0, 1, 1000)` für sanfte Übergänge
- Global vs. Instance Volume

---

### lowdb - Data Persistence

**Schema Design für Settings:**

```json
{
	"cards": {
		"1234567890": "folder-name"
	},
	"settings": {
		"maxVolume": 0.8,
		"currentVolume": 0.5,
		"isMuted": false
	}
}
```

**Update-Pattern:**

```javascript
// Direct + Write (einfach)
db.data.settings.maxVolume = 0.8;
await db.write();

// Update (besser für mehrere Änderungen)
await db.update(({ settings }) => {
	settings.maxVolume = 0.8;
	settings.currentVolume = 0.5;
});
```

**Initialization Best Practice:**

```javascript
const defaultData = {
	cards: {},
	settings: {
		maxVolume: 0.8,
		currentVolume: 0.5,
		isMuted: false
	}
};

const db = await JSONFilePreset('data/db.json', defaultData);
```

---

### Svelte 5 $state - Reactive State Management

**✅ Korrekt im aktuellen Code:**

- `$state` in Classes für reaktive Properties
- Export von Klassen-Instanzen (nicht direkt $state)

**Best Practices für Persistence:**

- **NICHT** `$effect` für DB-Saves verwenden (Infinite Loop Gefahr)
- **Stattdessen:** Manual saves nach User-Actions

```typescript
// ❌ FALSCH - Infinite Loop Gefahr
$effect(() => {
  this.currentVolume; // read
  this.saveSettings(); // write → kann Loop auslösen
});

// ✅ RICHTIG - Explicit saves
setVolume(value: number) {
  this.currentVolume = value;
  this.saveSettings(); // Explicit nach User-Action
}
```

**$derived für Computed Values:**

```typescript
effectiveVolume = $derived(Math.min(this.currentVolume, this.maxVolume));
```

---

## ✅ Implementierungsplan

### Phase 1: Plan-Dokumentation ✅

- [x] Plan als `VOLUME_FIX_PLAN.md` speichern

---

### Phase 2: Database Schema & API

**1. database.ts erweitern:**

```typescript
// Schema mit Defaults
const defaultData = {
	cards: {},
	settings: {
		maxVolume: 0.8,
		currentVolume: 0.5,
		isMuted: false
	}
};

// CRUD Methods
export async function getVolumeSettings() {
	await db.read();
	return db.data.settings || defaultData.settings;
}

export async function saveVolumeSettings(current: number, max: number, muted: boolean) {
	await db.read();
	db.data.settings = {
		currentVolume: current,
		maxVolume: max,
		isMuted: muted
	};
	await db.write();
}
```

**2. SvelteKit API Routes erstellen:**

- `src/routes/api/volume/+server.ts`
  - GET: Settings laden aus DB
  - POST: Settings speichern in DB

---

### Phase 3: AudioManager erweitern

**1. Init-Methode hinzufügen:**

```typescript
async init() {
  try {
    const response = await fetch('/api/volume');
    const settings = await response.json();

    this.currentVolume = settings.currentVolume;
    this.maxVolume = settings.maxVolume;
    this.isMuted = settings.isMuted;
  } catch (error) {
    console.error('Failed to load volume settings:', error);
    // Keep defaults
  }
}
```

**2. saveSettings() hinzufügen:**

```typescript
async saveSettings() {
  try {
    await fetch('/api/volume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentVolume: this.currentVolume,
        maxVolume: this.maxVolume,
        isMuted: this.isMuted
      })
    });
  } catch (error) {
    console.error('Failed to save volume settings:', error);
  }
}
```

**3. Persistence nach User-Actions:**

- `setVolume()` → `this.saveSettings()`
- `setMaxVolume()` → `this.saveSettings()`
- `toggleMute()` → `this.saveSettings()`

**4. Kommentar bei Mute-Logik:**

```typescript
/**
 * Toggle mute on/off
 * Note: howler.js also has mute() method, but current implementation works
 */
toggleMute() {
  // ... existing code ...
}
```

---

### Phase 4: KeyboardManager Integration

**Player-Komponente finden:**

- Wahrscheinlich: `src/routes/+page.svelte`

**Volume-Callbacks verbinden:**

```typescript
// In onMount oder $effect
keyboardManager.init({
	onPrevious: () => audioManager.previous(),
	onPausePlay: () => (audioManager.isPlaying ? audioManager.pause() : audioManager.play()),
	onNext: () => audioManager.next(),

	// NEU: Volume-Callbacks verbinden
	onVolumeUp: () => audioManager.volumeUp(),
	onVolumeDown: () => audioManager.volumeDown(),
	onMute: () => audioManager.toggleMute()
});
```

---

### Phase 5: Admin UI

**admin/+page.svelte erweitern:**

```svelte
<div class="form-control">
	<label class="label">
		<span class="label-text">Maximale Lautstärke (Kinderschutz)</span>
	</label>

	<input
		type="range"
		min="1"
		max="100"
		bind:value={maxVolumePercentage}
		on:change={() => audioManager.setMaxVolume(maxVolumePercentage)}
		class="range range-primary"
	/>

	<div class="label">
		<span class="label-text-alt">Aktuell: {currentVolumePercentage}%</span>
		<span class="label-text-alt">Maximum: {maxVolumePercentage}%</span>
	</div>
</div>
```

**Reactive State:**

```typescript
let maxVolumePercentage = $derived(Math.round(audioManager.maxVolume * 100));

let currentVolumePercentage = $derived(Math.round(audioManager.currentVolume * 100));
```

---

### Phase 6: Testing (Chrome DevTools MCP)

**Test-Szenarien:**

1. **Volume Up/Down via Media Keys:**
   - Media Key drücken → Volume ändert sich
   - Console: Keine Errors
   - Network: POST /api/volume erfolgreich

2. **Persistence nach Reload:**
   - Volume ändern → Page reload → Volume bleibt erhalten
   - DB prüfen: `data/db.json` enthält korrekte Werte

3. **maxVolume-Limit in Admin:**
   - Admin UI: maxVolume auf 50% setzen
   - Player: volumeUp() stoppt bei 50%
   - Console: Keine Errors

4. **Mute-Funktion:**
   - Media Key Mute drücken → Ton aus
   - Media Key erneut → Ton zurück (vorheriger Volume)
   - UI zeigt korrekten Mute-Status

---

## 🎯 Kernprobleme behoben

| Problem                          | Lösung                                  | Status  |
| -------------------------------- | --------------------------------------- | ------- |
| Volume-Callbacks nicht verbunden | KeyboardManager → AudioManager wiring   | ⏳ TODO |
| Keine Persistenz                 | DB Schema + API Routes + saveSettings() | ⏳ TODO |
| Hardcoded Default-Volume         | init() lädt aus DB                      | ⏳ TODO |
| Keine Admin-UI für maxVolume     | Range-Slider in admin/+page.svelte      | ⏳ TODO |

---

## 📊 Systemfluss (Vorher/Nachher)

### Vorher (Aktuell):

```
User drückt Media Key → KeyboardManager feuert Callback → ❌ NICHTS PASSIERT
App startet → AudioManager.currentVolume = 0.8 (hardcoded) → ❌ Keine DB-Ladung
User ändert Volume → State aktualisiert → ❌ Nicht gespeichert → Bei Reload verloren
```

### Nachher (Mit Fixes):

```
App startet → audioManager.init() → GET /api/volume → DB lädt settings
User drückt Media Key → KeyboardManager → audioManager.volumeUp() → Howler.js + POST /api/volume
User ändert Volume in Admin → setMaxVolume() → POST /api/volume → Persist über Reloads
Reload → init() lädt gespeicherte Einstellungen → User-Präferenzen bleiben erhalten
```

---

## 🚀 Deployment Notes

**Nach Implementierung:**

1. `bun run check` - TypeScript-Fehler prüfen
2. `bun run lint` - Code-Qualität prüfen
3. `bun run test:unit` - Unit-Tests ausführen
4. Chrome DevTools MCP: E2E-Testing im Browser

**Raspberry Pi:**

- DB-Migration: Alte `data/db.json` wird automatisch um `settings` erweitert
- Kein manueller Eingriff nötig (defaultData handled das)

---

## ⚠️ Wichtige Hinweise

1. **Mute-Logik NICHT ändern:** Funktioniert aktuell, nur Kommentar hinzufügen
2. **Manual Saves:** NICHT `$effect` für Persistence verwenden (Loop-Gefahr)
3. **Volume Range:** Immer 0-1 intern, nur UI zeigt 1-100%
4. **DB Schema:** Defaults in `database.ts` für neue Installationen
5. **API Routes:** Error-Handling für fehlende DB-Datei

---

## 📝 Nächste Schritte

- [ ] Phase 2: Database Schema & API
- [ ] Phase 3: AudioManager erweitern
- [ ] Phase 4: KeyboardManager Integration
- [ ] Phase 5: Admin UI
- [ ] Phase 6: Testing mit Chrome DevTools MCP

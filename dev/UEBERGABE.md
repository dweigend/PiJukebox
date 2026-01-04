# Uebergabe - Admin Panel Redesign

## Aktueller Stand
**Datum:** 2026-01-04
**Phase:** Planung abgeschlossen
**Naechste Session:** Session 1 - Database & Track Order Backend

---

## Kontext

Das Admin Panel wird von einem fragmentierten Workflow zu einem card-zentrierten Workflow umgebaut. Der Plan ist in 6 Sessions aufgeteilt, die jeweils ein Feature vollstaendig implementieren.

### Problem
- Track-Reihenfolge ist zufaellig (Filesystem-Reihenfolge)
- Kein Upload-Fortschritt sichtbar
- Workflow ist umstaendlich: Ordner -> Upload -> Karte (3 separate Schritte)

### Loesung
- Track-Reihenfolge in Datenbank speichern
- Upload mit Progress Bar
- Neuer Workflow: Karte -> Folder -> Upload -> Sortieren

---

## Wichtige Dateien

### Planung
- `dev/ROADMAP.md` - Alle 6 Sessions mit Tasks
- `/Users/davidweigend/.claude/plans/warm-wishing-starlight.md` - Detaillierter Plan

### Bestehender Code (relevant fuer Session 1)
- `src/lib/types.ts` - Hier kommt `CardData` Interface
- `src/lib/server/database.ts` - Hier kommen neue Funktionen
- `src/routes/api/cards/[cardId]/+server.ts` - Hier wird Track Order angewendet

---

## Session 1 Aufgaben

### Ziel
Backend-Grundlage fuer Track-Reihenfolge schaffen.

### Was zu tun ist
1. **Types erweitern**: `CardData` Interface in `src/lib/types.ts`
2. **Database erweitern**: Drei neue Funktionen in `src/lib/server/database.ts`
3. **Neuer Endpoint**: `src/routes/api/cards/[cardId]/order/+server.ts`
4. **Bestehenden Endpoint anpassen**: Track Order in Response anwenden

### Technische Details
```typescript
// Neues Interface
interface CardData {
  folderName: string;
  trackOrder?: string[];  // Optional fuer Backwards Compat
}

// Neue Funktionen
getCardData(cardId: string): Promise<CardData | null>
setCardData(cardId: string, data: CardData): Promise<void>
setTrackOrder(cardId: string, order: string[]): Promise<void>
```

### Commit am Ende
```bash
git commit -m "feat: add track order support to database"
```

---

## Git Status
- Branch: main
- Letzter Commit: `b37a9f8 docs: update CLAUDE.md and README.md`
- Checkpoint erstellt: `checkpoint: vor admin-redesign`

---

## Notizen
- DaisyUI verwenden, kein Custom CSS
- Funktionen max 20 Zeilen
- svelte-dnd-action wird in Session 3 installiert
- Rueckwaertskompatibilitaet beachten (alte Card-Eintraege normalisieren)

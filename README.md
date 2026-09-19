# TurnierBaum

WebApp-Grundgerüst zur Verwaltung und Visualisierung von Turnierbäumen für **Liga**, **Gruppen K.-O.** und **Pokal**.

## Projektüberblick

Die Anwendung führt Nutzer in 5 Schritten durch ein Turnier:

1. **Willkommen** – Kurzintro und Start-CTA
2. **Modus-Auswahl** – Liga, Gruppen K.-O. oder Pokal
3. **Spieler-Eingabe** – Teilnehmer erfassen und validieren
4. **Turnierbaum & Ergebnisse** – Spielplan pflegen, Tabellen/Bracket sehen
5. **Ergebnis & Reset** – Siegeransicht und Neustart

## Tech-Stack

- **Frontend:** Vite + React + TypeScript
- **Styling:** Tailwind CSS v4
- **State Management:** Zustand
- **Icons:** Lucide React
- **Linting:** Oxlint

## Verzeichnisstruktur

```text
.
├── public/
├── src/
│   ├── components/
│   │   ├── match-card.tsx
│   │   ├── mode-card.tsx
│   │   ├── player-editor.tsx
│   │   └── standings-table.tsx
│   ├── store/
│   │   └── tournament-store.ts
│   ├── types/
│   │   └── tournament.ts
│   ├── utils/
│   │   └── tournament.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

## Setup-Befehle

### Projekt neu aufsetzen

```bash
npm create vite@latest turnierbaum -- --template react-ts
cd turnierbaum
npm install
npm install zustand lucide-react
npm install -D tailwindcss @tailwindcss/vite
```

### Tailwind in Vite registrieren

```ts
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

### Tailwind in das globale Stylesheet einbinden

```css
@import 'tailwindcss';
```

### Dev-Workflow

```bash
npm install
npm run dev
npm run lint
npm run build
```

## TypeScript-Typdefinitionen

Die zentralen Domain-Typen liegen in `/src/types/tournament.ts`.

```ts
export type TournamentType = 'league' | 'group-knockout' | 'cup'
export type TournamentStep = 1 | 2 | 3 | 4 | 5

export interface Player {
  id: string
  name: string
  seed: number
}

export interface Match {
  id: string
  stage: 'league' | 'group' | 'knockout'
  round: number
  order: number
  label: string
  groupId?: string
  homePlayerId: string | null
  awayPlayerId: string | null
  homeScore: number | null
  awayScore: number | null
  winnerId: string | null
}

export interface Tournament {
  id: string
  type: TournamentType | null
  step: TournamentStep
  players: Player[]
  groups: TournamentGroup[]
  matches: Match[]
  standings: StandingRow[]
  winnerId: string | null
  isReady: boolean
  isComplete: boolean
  createdAt: string
}
```

## State-Architektur

Der globale Zustand sitzt in `/src/store/tournament-store.ts` und steuert den kompletten 5-Seiten-Flow.

```ts
{
  tournament: {
    id: 'uuid',
    type: 'league',
    step: 4,
    players: [{ id: 'p1', name: 'Team A', seed: 1 }],
    groups: [],
    matches: [],
    standings: [],
    winnerId: null,
    isReady: true,
    isComplete: false,
    createdAt: '2026-09-19T15:10:08.711Z'
  },
  setStep,
  setType,
  addPlayer,
  removePlayer,
  renamePlayer,
  generateTournament,
  setMatchScore,
  resetTournament
}
```

### Zustandsfluss

- `setStep` steuert die Navigation durch die 5 Ansichten.
- `setType` initialisiert den gewählten Turniermodus.
- `generateTournament` erzeugt Spielplan, Gruppen und Bracket.
- `setMatchScore` aktualisiert Ergebnisse und recalculiert Tabellen/Sieger.
- `resetTournament` startet den kompletten Flow neu.

## Unterstützte Turnierlogik

### Liga
- Round-Robin-Spielplan
- Live-Tabelle mit Punkten, Siegen, Unentschieden und Tordifferenz
- Sieger nach vollständigem Abschluss aller Spiele

### Gruppen K.-O.
- Automatische Gruppeneinteilung
- Round-Robin je Gruppe
- Qualifikation der Top-Teams in die Finalrunde
- Dynamische K.-o.-Fortschreibung aus Gruppenergebnissen

### Pokal
- Direkter K.-o.-Baum
- Automatische Auffüllung auf Zweierpotenz mit Freilosen
- Siegerfortschreibung Runde für Runde

## Verfügbare Skripte

- `npm run dev` – lokaler Entwicklungsserver
- `npm run lint` – Oxlint ausführen
- `npm run build` – TypeScript-Check und Produktionsbuild
- `npm run preview` – Build lokal previewen

## Nächste sinnvolle Ausbaustufen

- Persistenz via Local Storage oder Backend API
- Benutzerkonten und Turnierfreigabe per Link
- Drag-and-drop-Seeding
- Export als PDF / PNG
- Echte Routing-Struktur mit React Router oder Next.js App Router

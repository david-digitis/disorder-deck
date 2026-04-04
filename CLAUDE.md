# DISORDER-DECK

Plugin Stream Deck pour controler Disorder Overlay a distance.

## Repo

- GitHub : `david-digitis/disorder-deck` (prive)
- Branche principale : `master`

## Stack

- TypeScript, SDK Elgato Stream Deck v2
- WebSocket client vers Disorder Overlay (`ws://127.0.0.1:39120`)
- Icones SVG generees dynamiquement (pas de fichiers PNG)

## Structure

- `src/` — sources TypeScript
  - `plugin.ts` — point d'entree, gestion state + boutons
  - `overlay-client.ts` — client WebSocket vers l'overlay
  - `icons.ts` — generation SVG des icones Stream Deck (144x144)
  - `actions/` — actions individuelles (trigger-help, trigger-dead=status cycle, toggles)
- `com.digitis.disorder-deck.sdPlugin/` — plugin package
  - `manifest.json` — declaration des actions Stream Deck
  - `bin/` — JS compile (gitignore)

## Build

```bash
npm run build      # compile TS → sdPlugin/bin/
npm run pack       # build + package .streamDeckPlugin
```

Apres build, redemarrer Stream Deck pour charger les changements.

## Communication avec l'overlay

Le plugin se connecte au WebSocket server de Disorder Overlay (main.js port 39120).
- Recoit : `{ type: 'state', data: OverlayState }` — etat courant (adminTab, fleetTab, tsLiveMode, selfStatus, etc.)
- Envoie : `{ type: 'command', action: 'toggle-admin-tab' | 'trigger-dead' | 'trigger-help' | ... }`

## Conventions

- Commits : `feat|fix|chore(disorder-deck): description`
- Pas de secrets dans les fichiers
- Les icones sont du SVG inline dans icons.ts, pas des assets fichiers

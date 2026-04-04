# Disorder Deck

Plugin [Elgato Stream Deck](https://www.elgato.com/stream-deck) pour [Disorder Overlay](https://github.com/david-digitis/disorder-overlay).

Controlez votre overlay directement depuis votre Stream Deck avec des boutons physiques et un retour visuel en temps reel.

## Boutons

| Bouton | Action | Retour visuel |
|--------|--------|---------------|
| **OP / ALL** | Bascule les onglets du panneau admin | Violet (OP) / Cyan (ALL) |
| **Fleet / TS Live** | Bascule les onglets Fleet | Vert (Fleet) / Cyan (Live) |
| **Normal / FDG** | Bascule le mode TS Live | Vert (Normal) / Rouge (FDG) |
| **Help** | Envoie un signal SOS jaune | Flash de confirmation |
| **Dead** | Marque comme mort / annule | Croix rouge quand actif |
| **Reset Dead** | Remet tous les morts a zero (leads) | - |
| **Show / Hide** | Affiche / masque l'overlay | Icone oeil |
| **Quit** | Ferme l'overlay | - |

## Prerequis

- **Disorder Overlay v2.7.0** minimum
- **Elgato Stream Deck** avec le logiciel **v6.9+**
- **Node.js 20+** (pour le build depuis les sources)

## Installation

### Option 1 — Depuis les releases (recommande)

1. Telecharger `com.digitis.disorder-deck.streamDeckPlugin` depuis la [page Releases](https://github.com/david-digitis/disorder-deck/releases)
2. Double-cliquer sur le fichier — il s'installe automatiquement dans Stream Deck
3. Redemarrer Stream Deck si necessaire

### Option 2 — Depuis les sources

```bash
git clone https://github.com/david-digitis/disorder-deck.git
cd disorder-deck
npm install
npm run build
```

Puis linker le plugin dans Stream Deck :

```bash
npx streamdeck link com.digitis.disorder-deck.sdPlugin
```

Redemarrer Stream Deck. Les boutons "Disorder" apparaissent dans la categorie du meme nom.

## Utilisation

1. Lancer **Disorder Overlay** (le serveur WebSocket demarre automatiquement sur le port 39120)
2. Le plugin se connecte automatiquement a l'overlay
3. Glisser les boutons depuis la categorie **Disorder** vers votre profil Stream Deck
4. Appuyer sur les boutons pour controler l'overlay

Si l'overlay n'est pas lance, le plugin retente la connexion toutes les 5 secondes.

## Fonctionnement

Le plugin communique avec Disorder Overlay via WebSocket (`ws://127.0.0.1:39120`). La connexion est locale uniquement — aucune donnee ne transite par Internet.

Le plugin recoit l'etat de l'overlay en temps reel et met a jour les icones des boutons en consequence.

## Build

```bash
npm run build          # Compile TypeScript
npm run pack           # Cree le fichier .streamDeckPlugin
```

## Licence

MIT — [Digitis](https://digitis.cloud)

# 🎮 Game Modes

Darhaal Games ships five real-time multiplayer games. Each has a route under
`src/app/game/`, a UI component in `src/components/`, and its logic in a hook
under `src/hooks/`.

| Game | Genre | Route | Component | Hook |
|------|-------|-------|-----------|------|
| Flager | Geography quiz | `game/flager` | `FlagerGame.tsx` | `useFlagerGame.ts` |
| Minesweeper | Co-op / versus puzzle | `game/minesweeper` | `MinesweeperGame.tsx` | `useMinesweeperGame.ts` |
| Battleship | Strategy | `game/battleship` | `BattleshipGame.tsx` | `useBattleshipGame.ts` |
| Coup | Social deduction | `game/coup` | `CoupGame.tsx`, `CoupComponents.tsx` | `useCoupGame.ts` |
| Spyfall | Social | `game/spyfall` | `SpyfallGame.tsx` | `useSpyfallGame.ts` |

## 🚩 Flager — Geography quiz
Guess the country while its flag is gradually revealed through digital noise, with
pixel-by-pixel comparison unlocking correct fragments. Uses HTML5 Canvas image
processing and round-based multiplayer sync. Country data: `src/data/flager/countries.ts`.

## 💣 Minesweeper — Co-op / Versus
A multiplayer take on the classic, with a pan/zoom viewport (transform/scale),
first-click safety, chording, and multiplayer conflict resolution.

## ⚓ Battleship — Strategy
Real-time naval combat with drag-and-drop ship placement and rotation, optimistic
UI for instant shot feedback, and fleet tracking. Turn deadlines are stored as
server timestamps so every client counts down to the same moment — the countdown
itself still runs, and is enforced, on the client.

## 🎭 Coup — Social deduction
A digital Coup with a state machine handling nested phases
(Action → Challenge → Block → Resolution), a full action log, client-side action
validation, and AFK protection. Constants: `src/constants/coup.ts`.

## 🕵️ Spyfall — Social
Hidden role distribution and location guessing under time pressure, with
synchronized timers, voting, and dynamic location/card packs. Content lives in
`src/data/spyfall/` (`locations.ts` and `packs/`).

## Adding a new game (high-level)

1. Add static data under `src/data/<game>/` and types under `src/types/<game>.ts`.
2. Create the logic hook `src/hooks/use<Game>Game.ts`, subscribing to a Supabase
   Realtime channel and building on the shared lobby.
3. Build the UI in `src/components/<Game>Game.tsx`, reusing shared components
   (`UniversalLobby`, `GameHeader`, `GameRulesModal`).
4. Add the route `src/app/game/<game>/page.tsx`.
5. Register rules in `src/constants/rules.ts` and bump `src/constants/version.ts`.

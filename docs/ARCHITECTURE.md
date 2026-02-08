# Vector Maniac - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      React Application                       │
├─────────────────────────────────────────────────────────────┤
│  Pages (Index, Shop, Arena, Bestiary, Info, Equipment)      │
├─────────────────────────────────────────────────────────────┤
│  Components                    │  Contexts                   │
│  ├── UI (shadcn/radix)        │  └── MusicContext           │
│  ├── Game (Canvas-based)      │                             │
│  └── Modals & Screens         │                             │
├─────────────────────────────────────────────────────────────┤
│  Hooks                         │  Services                   │
│  ├── useScrapCurrency         │  ├── RevenueCat (IAP)       │
│  ├── useShipUpgrades          │  ├── AdMob (Ads)            │
│  ├── useBestiary              │  └── Native Services        │
│  └── useArenaConsumables      │                             │
├─────────────────────────────────────────────────────────────┤
│  Game Engine (Canvas 2D)                                     │
│  ├── State Management (vectorManiac/state.ts)               │
│  ├── Game Logic (vectorManiac/gameLogic.ts)                 │
│  ├── Renderer (vectorManiac/renderer.ts)                    │
│  └── Entity Systems (enemies, projectiles, power-ups)       │
├─────────────────────────────────────────────────────────────┤
│  Capacitor (Native Bridge)                                   │
│  └── iOS / Android                                           │
└─────────────────────────────────────────────────────────────┘
```

## Key Components

### Game Loop

The game uses a custom `useGameLoop` hook that:
1. Manages requestAnimationFrame timing
2. Updates game state at 60fps target
3. Renders to HTML5 Canvas
4. Handles input from keyboard and touch

### State Management

- **Game State**: Managed in `vectorManiac/state.ts` using pure functions
- **Persistent State**: React hooks with localStorage persistence
- **UI State**: React Context for global UI state (music, theme)

### Entity System

Enemies, projectiles, and power-ups are managed as typed objects:
- Factory functions create new entities
- Update functions modify state immutably
- Renderer draws entities to canvas

### Mobile Integration

Capacitor bridges web code to native:
- RevenueCat plugin for in-app purchases
- AdMob plugin for rewarded/interstitial ads
- Native audio and haptics (planned)

## Data Flow

```
User Input → useInput/useTouchInput
    ↓
Game Loop (useGameLoop)
    ↓
State Update (gameLogic.ts)
    ↓
Render (renderer.ts)
    ↓
Canvas Display
```

## File Organization

| Directory | Purpose |
|-----------|---------|
| `src/components/` | React UI components |
| `src/game/` | Game engine and logic |
| `src/hooks/` | Custom React hooks |
| `src/services/` | External service integrations |
| `src/contexts/` | React context providers |
| `src/pages/` | Route-level components |
| `public/` | Static assets (audio, images) |

## Performance Considerations

- Canvas rendering is optimized for 60fps
- Entity pools prevent garbage collection spikes
- Audio is preloaded and managed centrally
- Images are lazy-loaded where appropriate

# Vector Maniac — Technical Architecture

## Overview

Vector Maniac is a mobile-first arcade shooter built with React and Canvas 2D. The game runs at 60fps using requestAnimationFrame with a pure functional state update pattern.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        React App                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Screens   │  │  Game Loop  │  │   Native Services   │  │
│  │  (React)    │  │  (Canvas)   │  │  (Capacitor)        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│         │                │                    │             │
│         ▼                ▼                    ▼             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │    Hooks    │  │   State     │  │  RevenueCat/AdMob   │  │
│  │ (Business)  │  │  (Game)     │  │  (Monetization)     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                     Local Storage                           │
│            (Progress, Settings, Purchases)                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Game Loop

The game uses `requestAnimationFrame` at 60fps with fixed timestep updates:

```typescript
function gameLoop(timestamp: number) {
  const deltaTime = timestamp - lastTime;
  gameState = updateGame(gameState, input, deltaTime);
  render(ctx, gameState);
  requestAnimationFrame(gameLoop);
}
```

### Key Files
- `src/game/useGameLoop.ts` — Loop orchestration
- `src/game/gameLogic.ts` — Update logic
- `src/game/renderer.ts` — Canvas rendering
- `src/game/vectorManiac/` — Main game mode

---

## State Management

| Type | Storage | Purpose |
|------|---------|---------|
| Game State | Mutable | Player, enemies, projectiles |
| React State | useState | UI, menus, modals |
| Persistence | localStorage | Progress, unlocks, purchases |

---

## Demo Mode

When API keys are not configured, the app runs in **demo mode**:

- All native features fail gracefully
- Game is fully playable
- Store shows "Demo Build" labels
- No crashes or errors

```typescript
if (isDemoMode()) {
  console.log('[NativeServices] Running in demo mode');
  return; // Skip initialization
}
```

---

## Environment Configuration

All secrets via `VITE_*` environment variables (see `.env.example`):

| Variable | Purpose |
|----------|---------|
| `VITE_REVENUECAT_IOS_KEY` | RevenueCat iOS API key |
| `VITE_ADMOB_IOS_REWARDED_ID` | AdMob rewarded ad unit |
| `VITE_ENABLE_ADS` | Enable/disable ads |

---

## Entity System
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

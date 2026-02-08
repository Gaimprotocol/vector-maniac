# Vector Maniac

A fast-paced arcade space shooter with procedurally generated enemies, neon vector aesthetics, and deep progression systems. Built as a mobile-first experience using modern web technologies.

## What It Is

Vector Maniac is an endless survival shooter where players pilot vector-styled spacecraft through waves of increasingly challenging enemies. The game features:

- **Endless Survival Mode** — Survive as long as possible with escalating difficulty
- **Arena Battles** — Compete in structured challenges with unique modifiers
- **44+ Unique Ships** — Each with distinct stats and visual designs
- **Bestiary System** — Discover, collect, and evolve enemy companions
- **Deep Upgrade System** — Permanent ship upgrades using in-game currency
- **Procedural Enemies** — 15+ enemy types that unlock progressively

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| UI Components | Radix UI / shadcn-ui |
| Mobile | Capacitor (iOS/Android) |
| State | React Query + Context |
| Monetization | RevenueCat (IAP), AdMob (Ads) |
| Rendering | Canvas 2D (60fps game loop) |

## Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app runs at `http://localhost:8080`. **No API keys required** — the app works in demo mode without monetization configuration.

## Building

```bash
# Production web build
npm run build

# Mobile (after Capacitor setup)
npx cap sync
npx cap run ios     # Requires Xcode
npx cap run android # Requires Android Studio
```

## Environment Variables

Copy `.env.example` to `.env` for production builds:

```bash
cp .env.example .env
```

See `.env.example` for available configuration. The app functions fully without these keys (demo mode).

## World Integration Roadmap

This project is being prepared for World ecosystem integration:

### Phase 1: World ID Authentication
- Replace anonymous sessions with World ID verification
- Human-proof leaderboards and competitive modes
- Sybil-resistant daily rewards

### Phase 2: WLD Payments
- Cosmetic purchases using WLD tokens
- Ship skins and visual upgrades
- Premium arena access

### Phase 3: World Mini App
- Deploy as World mini app
- Native World wallet integration
- Social features (challenges, gifting)

See `/docs/WORLD_INTEGRATION.md` for detailed implementation plans.

## Project Structure

```
src/
├── components/      # React UI components
├── game/            # Core game logic
│   ├── vectorManiac/  # Main game mode
│   └── arena/         # Arena battle mode
├── hooks/           # React hooks
├── services/        # External integrations
└── contexts/        # React contexts
```

## Documentation

- `/docs/ARCHITECTURE.md` — Technical architecture
- `/docs/ROADMAP_90_DAYS.md` — Development roadmap
- `/docs/WORLD_INTEGRATION.md` — World ecosystem plans
- `/docs/SCREENSHOTS.md` — Visual documentation guide

## License

All rights reserved. This project is proprietary software.

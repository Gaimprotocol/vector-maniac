# Vector Maniac

A fast-paced arcade space shooter built with modern web technologies. Features procedurally generated enemies, multiple ship types, arena battles, and an extensive upgrade system.

## Overview

Vector Maniac is a minimalist neon-vector aesthetic arcade game where players pilot ships through endless waves of enemies. The game features:

- **Endless Mode**: Survive as long as possible against increasingly difficult waves
- **Arena Mode**: Compete in structured battles with special rewards
- **Ship Collection**: Unlock and upgrade 44+ unique ships
- **Bestiary System**: Discover and evolve enemy companions
- **Power-ups**: Collect temporary boosts during gameplay

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI / shadcn-ui
- **Mobile**: Capacitor (iOS/Android)
- **State Management**: React Query + React Context
- **In-App Purchases**: RevenueCat
- **Ads**: Google AdMob

## Prerequisites

- Node.js 18+ or Bun
- npm, yarn, or bun package manager
- For mobile builds:
  - Xcode (iOS)
  - Android Studio (Android)

## Getting Started

### Install Dependencies

```bash
npm install
# or
bun install
```

### Development Server

```bash
npm run dev
# or
bun dev
```

The app will be available at `http://localhost:8080`

### Environment Variables

Copy the example environment file and configure as needed:

```bash
cp .env.example .env
```

See `.env.example` for available configuration options.

## Building for Production

### Web Build

```bash
npm run build
```

Output will be in the `dist/` directory.

### Mobile Build (Capacitor)

```bash
# Build web assets
npm run build

# Sync to native platforms
npx cap sync

# Run on iOS
npx cap run ios

# Run on Android
npx cap run android
```

## Deployment

### Web Deployment

The `dist/` folder can be deployed to any static hosting service:

- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages
- AWS S3 + CloudFront

### Mobile Deployment

1. Configure app signing in Xcode/Android Studio
2. Build release versions
3. Submit to App Store / Google Play

## Project Structure

```
src/
├── components/      # React components
│   ├── ui/          # Reusable UI components
│   ├── arena/       # Arena mode components
│   └── bestiary/    # Bestiary components
├── contexts/        # React contexts
├── game/            # Game logic
│   ├── vectorManiac/  # Main game mode
│   └── arena/         # Arena game mode
├── hooks/           # Custom React hooks
├── pages/           # Route pages
├── services/        # External services (RevenueCat, AdMob)
└── utils/           # Utility functions
```

## Documentation

See the `/docs` folder for:

- Architecture overview
- Game mechanics documentation
- Screenshot placeholders

## License

All rights reserved. This project is proprietary software.

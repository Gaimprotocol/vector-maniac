# World Ecosystem Integration Plan

## Overview

This document outlines how Vector Maniac will integrate with the World ecosystem, including World ID for authentication, WLD for payments, and deployment as a World mini app.

---

## Why World?

### Problem: Bots & Sybil Attacks
Mobile games face massive issues with:
- Fake accounts farming rewards
- Bot-driven leaderboard manipulation
- Multi-accounting to exploit daily bonuses

### Solution: World ID
World ID provides proof-of-personhood, enabling:
- **Human-verified leaderboards** — Every entry is a real person
- **Fair daily rewards** — One bonus per human per day
- **Legitimate competitions** — Arena battles between verified players

---

## Integration Components

### 1. World ID Authentication

**Implementation:**
```typescript
// Planned integration approach
import { IDKitWidget } from '@worldcoin/idkit';

// Verification levels
enum VerificationLevel {
  DEVICE = 'device',    // Basic access
  ORB = 'orb',          // Full access (Orb verified)
  PHONE = 'phone',      // Intermediate
}

// Features unlocked by verification level
const FEATURE_ACCESS = {
  [VerificationLevel.DEVICE]: ['play', 'upgrades'],
  [VerificationLevel.PHONE]: ['leaderboards', 'daily_bonus'],
  [VerificationLevel.ORB]: ['arena', 'tournaments', 'rewards'],
};
```

**User Flow:**
1. Player opens game → Anonymous session created
2. Player clicks "Verify with World ID"
3. World ID widget opens → Verification completes
4. Player profile linked to World ID
5. Enhanced features unlocked based on verification level

### 2. WLD Payments

**Use Cases:**
- Cosmetic purchases (ship skins, visual effects)
- Premium content (exclusive ships, arena passes)
- Optional progression boosts

**Implementation:**
```typescript
// Planned MiniKit integration
import { MiniKit } from '@worldcoin/minikit-js';

interface WLDProduct {
  id: string;
  name: string;
  priceWLD: number;
  type: 'cosmetic' | 'content' | 'boost';
}

// Price conversion (maintained server-side)
const usdToWLD = (usdPrice: number): number => {
  // Dynamic conversion based on current WLD/USD rate
  return usdPrice / currentWLDPrice;
};
```

**Pricing Philosophy:**
- Cosmetics only — No pay-to-win mechanics
- Fair pricing — Comparable to traditional IAP
- Transparent — Clear WLD costs shown upfront

### 3. World Mini App Deployment

**Benefits:**
- Native integration in World app
- Direct access to World wallet
- Social graph for challenges
- Distribution through World ecosystem

**Technical Requirements:**
- MiniKit SDK integration
- World app compatibility testing
- Responsive design for World app viewport
- Deep linking support

---

## Data Architecture

### Player Profile (World ID Linked)

```typescript
interface WorldPlayer {
  worldId: string;           // Anonymized World ID
  verificationLevel: VerificationLevel;
  createdAt: Date;
  
  // Game progress (linked to World ID)
  progress: {
    highScore: number;
    shipsUnlocked: string[];
    upgradelevels: Record<string, number>;
    scraps: number;
  };
  
  // Achievements (verified)
  achievements: {
    arenaWins: number;
    leaderboardRank?: number;
    tournamentParticipation: number;
  };
}
```

### Leaderboard Entry (Verified)

```typescript
interface VerifiedLeaderboardEntry {
  worldIdHash: string;       // Hashed for privacy
  displayName: string;       // User-chosen
  score: number;
  verificationLevel: VerificationLevel;
  timestamp: Date;
  
  // Anti-cheat metadata
  gameVersion: string;
  sessionDuration: number;
  inputMetrics: InputMetrics; // For anomaly detection
}
```

---

## Anti-Cheat Strategy

### Layer 1: World ID Verification
- One account per human
- Orb verification for competitive modes
- Automatic Sybil resistance

### Layer 2: Server Validation
- Score validation against gameplay metrics
- Session duration checks
- Input pattern analysis

### Layer 3: Community Reporting
- Report suspicious scores
- Review queue for outliers
- Reputation system

---

## Privacy Considerations

- **Anonymized IDs** — World ID hashes, not personal data
- **Minimal data** — Only game progress stored
- **User control** — Data deletion on request
- **Transparent policies** — Clear privacy documentation

---

## Rollout Plan

### Phase 1: Optional Integration
- World ID login available but optional
- Existing players can link accounts
- No features locked behind verification

### Phase 2: Verified Features
- Leaderboards require World ID
- Arena requires Orb verification
- Daily bonus enhanced for verified users

### Phase 3: Full Integration
- WLD payments enabled
- World mini app deployment
- Social features activated

---

## Success Metrics

| Metric | Target |
|--------|--------|
| World ID adoption | 50% of active players |
| Bot reduction | 90% decrease in fake accounts |
| WLD transaction volume | Growth month-over-month |
| User retention | Maintain or improve current rates |

---

## Resources

- [World ID Documentation](https://docs.world.org/world-id)
- [MiniKit Documentation](https://docs.world.org/minikit)
- [World Developer Portal](https://developer.world.org)

---

## Questions?

For technical questions about this integration plan, please open an issue in the project repository.

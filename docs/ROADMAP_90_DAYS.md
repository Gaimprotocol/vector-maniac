# Vector Maniac — 90-Day Roadmap

## Overview

This roadmap outlines the development plan for integrating Vector Maniac with the World ecosystem and preparing for broader release.

---

## Milestone 1: Foundation (Days 1-30)

### Goals
- Clean codebase ready for external review
- Stable demo build without API dependencies
- Documentation complete

### Deliverables

- [x] Remove hardcoded API keys, use environment variables
- [x] Add fail-safe initialization (demo mode)
- [x] Create comprehensive documentation
- [x] GitHub repo hygiene (no secrets, clean history)
- [ ] Record gameplay video (2-3 minutes)
- [ ] Capture 6+ high-quality screenshots
- [ ] Create promotional landing page

### Success Criteria
- App builds and runs without any API keys
- Clean `npm run build` with no warnings
- README covers all setup steps

---

## Milestone 2: World ID Integration (Days 31-60)

### Goals
- World ID authentication working
- Human-verified player profiles
- Sybil-resistant game mechanics

### Deliverables

- [ ] Integrate World ID SDK
- [ ] Create World ID login flow
- [ ] Link player progress to World ID
- [ ] Implement verified leaderboards
- [ ] Add anti-cheat verification layer
- [ ] Human-only daily bonus system

### Technical Requirements

```
World ID Verification Levels:
- Device: Basic access
- Orb: Full access + competitive modes
- Phone: Intermediate access
```

### Success Criteria
- Players can authenticate with World ID
- Leaderboard entries are World ID verified
- Daily rewards require human verification

---

## Milestone 3: WLD Payments & Mini App (Days 61-90)

### Goals
- WLD token integration for purchases
- Deploy as World mini app
- Social features enabled

### Deliverables

- [ ] Integrate MiniKit for payments
- [ ] Create WLD pricing for cosmetics
- [ ] Implement World wallet connection
- [ ] Add friend challenges
- [ ] Deploy to World mini app platform
- [ ] Social sharing features

### Pricing Structure (Draft)

| Item | WLD Price |
|------|-----------|
| Ship Skin | 0.5 WLD |
| Premium Ship | 2 WLD |
| Arena Pass | 1 WLD |
| Cosmetic Bundle | 5 WLD |

### Success Criteria
- Players can purchase items with WLD
- App runs natively in World app
- Social features functional

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| World SDK breaking changes | Pin SDK versions, maintain fallback |
| WLD price volatility | Use USD-pegged pricing with WLD conversion |
| User adoption | Maintain web version as fallback |
| Technical complexity | Phased rollout, feature flags |

---

## Resources Required

- World ID developer access
- MiniKit documentation
- Test WLD tokens
- World mini app deployment access

---

## Contact

For questions about this roadmap or partnership opportunities, reach out via the project's GitHub repository.

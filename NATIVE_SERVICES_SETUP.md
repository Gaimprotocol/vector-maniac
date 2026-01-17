# Native Services Setup Guide

This guide explains how to set up RevenueCat (in-app purchases) and Google AdMob (ads) for your Galactic Overdrive game.

## Prerequisites

1. **Apple Developer Account** ($99/year) - for iOS App Store
2. **Google Play Developer Account** ($25 one-time) - for Android
3. **RevenueCat Account** (free up to $2.5k/month revenue)
4. **Google AdMob Account** (free)

---

## Step 1: RevenueCat Setup (In-App Purchases)

### 1.1 Create RevenueCat Account
1. Go to [RevenueCat Dashboard](https://app.revenuecat.com/)
2. Sign up for a free account
3. Create a new project

### 1.2 Configure iOS (App Store Connect)
1. In App Store Connect, create a new app
2. Go to **App Store Connect > Users and Access > Keys**
3. Create an **App Store Connect API Key** with Admin access
4. Download the `.p8` file and note the Key ID and Issuer ID
5. In RevenueCat, go to **Settings > Apps > + New App > iOS**
6. Enter your bundle ID and add the API key credentials

### 1.3 Configure Android (Google Play Console)
1. In Google Play Console, create a new app
2. Go to **Setup > API Access**
3. Create a service account with proper permissions
4. Download the JSON key file
5. In RevenueCat, go to **Settings > Apps > + New App > Android**
6. Enter your package name and upload the JSON key

### 1.4 Create Products in App Stores

**In App Store Connect (iOS):**
1. Go to your app > **Features > In-App Purchases**
2. Create the following products:

| Product ID | Type | Price |
|------------|------|-------|
| `remove_ads` | Non-Consumable | $1.99 |
| `neon_ships` | Non-Consumable | $0.99 |
| `lunar_expansion` | Non-Consumable | $1.99 |
| `survival_mode` | Non-Consumable | $0.99 |
| `ultimate_edition` | Non-Consumable | $3.49 |

**In Google Play Console (Android):**
1. Go to your app > **Monetization > Products > In-app products**
2. Create the same products with matching IDs

### 1.5 Configure RevenueCat Products
1. In RevenueCat Dashboard, go to **Products**
2. Add each product with matching identifiers
3. Go to **Entitlements** and create:
   - `remove_ads` → linked to `remove_ads` product
   - `neon_ships` → linked to `neon_ships` product
   - `lunar_expansion` → linked to `lunar_expansion` product
   - `survival_mode` → linked to `survival_mode` product
   - `ultimate_edition` → linked to `ultimate_edition` product (also grants all other entitlements)

### 1.6 Get API Keys
1. Go to **Project Settings > API Keys**
2. Copy your **Public API Key** for iOS and Android
3. Update `src/services/nativeServices.ts`:

```typescript
const REVENUECAT_API_KEY = {
  ios: 'appl_YOUR_IOS_PUBLIC_KEY',
  android: 'goog_YOUR_ANDROID_PUBLIC_KEY',
};
```

---

## Step 2: Google AdMob Setup (Ads)

### 2.1 Create AdMob Account
1. Go to [AdMob](https://admob.google.com/)
2. Sign in with your Google account
3. Accept the terms and conditions

### 2.2 Create Apps
1. Click **Apps > Add App**
2. Add iOS app (need App Store URL later, can skip for now)
3. Add Android app (need Play Store URL later, can skip for now)
4. Note your **App IDs** for each platform

### 2.3 Create Ad Units

For each platform (iOS and Android), create:

**Rewarded Video Ad:**
- Click **Ad Units > Add Ad Unit > Rewarded**
- Name: "Rewarded Video"
- Note the Ad Unit ID

**Interstitial Ad:**
- Click **Ad Units > Add Ad Unit > Interstitial**
- Name: "Interstitial Between Levels"
- Note the Ad Unit ID

### 2.4 Configure Native Apps

**iOS (Info.plist):**
Add to your `ios/App/App/Info.plist`:
```xml
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX</string>
<key>SKAdNetworkItems</key>
<array>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>cstr6suwn9.skadnetwork</string>
  </dict>
</array>
```

**Android (AndroidManifest.xml):**
Add to your `android/app/src/main/AndroidManifest.xml`:
```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"/>
```

### 2.5 Update Code with Production IDs

Update `src/services/nativeServices.ts`:
```typescript
const IS_PRODUCTION = true; // Set to true!

const ADMOB_CONFIG = {
  useTestAds: false, // Set to false for production!
  iosRewardedAdUnitId: 'ca-app-pub-XXXX/YYYY',
  iosInterstitialAdUnitId: 'ca-app-pub-XXXX/ZZZZ',
  androidRewardedAdUnitId: 'ca-app-pub-XXXX/AAAA',
  androidInterstitialAdUnitId: 'ca-app-pub-XXXX/BBBB',
};
```

---

## Step 3: Build and Test

### 3.1 Testing Purchases
- RevenueCat has a **Sandbox** mode for testing
- On iOS, create Sandbox Tester accounts in App Store Connect
- On Android, add test users in Google Play Console

### 3.2 Testing Ads
- Keep `useTestAds: true` during development
- Test ads always show and don't count as real impressions
- Switch to production IDs only when publishing

### 3.3 Build Commands
```bash
# Sync Capacitor
npx cap sync

# Run on iOS simulator
npx cap run ios

# Run on Android emulator
npx cap run android
```

---

## Troubleshooting

### Purchases not working
1. Check RevenueCat dashboard for errors
2. Verify product IDs match exactly
3. Ensure entitlements are linked to products
4. On iOS, check App Store Connect for product approval status

### Ads not showing
1. Check AdMob dashboard for ad unit status
2. Verify App ID is in native config files
3. Check console for AdMob initialization errors
4. Some ads may not fill immediately - wait and retry

### Web Testing
- RevenueCat and AdMob only work on native platforms
- On web, the code simulates purchases and ads for testing
- This lets you develop the UI without a native build

---

## Quick Reference

| Service | Dashboard URL |
|---------|---------------|
| RevenueCat | https://app.revenuecat.com |
| AdMob | https://admob.google.com |
| App Store Connect | https://appstoreconnect.apple.com |
| Google Play Console | https://play.google.com/console |

| File | Purpose |
|------|---------|
| `src/services/revenueCat.ts` | RevenueCat SDK wrapper |
| `src/services/admob.ts` | AdMob SDK wrapper |
| `src/services/nativeServices.ts` | Configuration & initialization |
| `src/hooks/usePurchases.ts` | Purchase state management |
| `src/hooks/useRewardedAds.ts` | Rewarded ad management |
| `src/hooks/useInterstitialAds.ts` | Interstitial ad management |

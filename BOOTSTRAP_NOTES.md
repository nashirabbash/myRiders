# Project Bootstrap - Story 1.1 Implementation Summary

## Date
April 3, 2026 (Updated: April 3, 2026 with PR review fixes)

## What Was Done

### Phase 1: Dependency Audit ✓
- Verified project uses Expo + TypeScript
- Compared package.json against CLAUDE.md requirements
- All core MVP dependencies already present or added

### Phase 2: Dependencies Added ✓
Added the following missing dependencies:
- `@mapbox/polyline` - GPS polyline encoding/decoding
- `@react-navigation/native-stack` - Stack navigation
- `@tanstack/react-query` - Server state management
- `zustand` - Global state management
- `date-fns` - Date formatting utilities

**Deferred:**
- `@shopify/react-native-skia` - Canvas rendering (deferred due to peer dependency conflicts with react@19.1.0 and react-native@0.81.5; will be added when implementing share card feature in Story 1.3+)

All dependencies installed successfully via `bun install`.

### Phase 3: Folder Structure ✓
Created complete `src/` directory structure:
```
src/
├── components/     # UI components (common, recording, share, feed)
├── hooks/          # Custom React hooks (GPS, WebSocket, etc.)
├── services/       # API service layer
├── stores/         # Zustand state management
├── utils/          # Utility functions (polyline, metrics, format, gpsBuffer)
├── constants/      # Global configuration
├── types/          # TypeScript type definitions
├── screens/        # Screen components (organized by feature)
└── data/           # Pre-existing SQLite data layer
```

### Phase 4: Environment Variables ✓
Updated both `.env.local` and `.env.local.example`:
- Changed from hardcoded URLs to `EXPO_PUBLIC_*` prefix (required by Expo)
- `EXPO_PUBLIC_API_URL` - Backend API base URL
- `EXPO_PUBLIC_WS_URL` - WebSocket URL for live ride streaming
- `EXPO_PUBLIC_MAPS_API_KEY` - Google Maps API key (unified, replaces platform-specific vars)

Updated example file with better documentation for developer onboarding.

**Also fixed:**
- Updated `app.config.ts` to use `EXPO_PUBLIC_MAPS_API_KEY` for both iOS and Android (previously used platform-specific env vars)

### Phase 5: Global Constants ✓
Created two main files:

**`src/constants/api.ts`**
- Reads environment variables safely (checks raw env before fallback)
- Exports `API_CONFIG` with baseURL, wsURL, mapsKey, timeout
- Exports `API_ENDPOINTS` object with all API routes (auth, rides, users, leaderboard, social)
- Includes `validateEnvironment()` function that checks raw env values and warns about missing config

**`src/constants/config.ts`**
- `APP_CONFIG` - App metadata (name, version, OS requirements)
- `GPS_CONFIG` - GPS tracking settings
- `DEFAULTS` - Default values (e.g., weight for calorie calculations)

**`src/constants/index.ts`**
- Centralized export point for all constants

**Also fixed:**
- Updated validation logic to check raw env variables before fallback, so warnings are actually useful during development

### Phase 6: Validation ✓
- TypeScript compilation: ✓ (new constants compile without errors)
- Environment variables: ✓ (properly recognized by Expo lint)
- Folder structure: ✓ (all directories created with index/placeholder files)
- Dependencies: ✓ (all required packages installed)

## Files Modified
- `package.json` - Added 6 new dependencies
- `.env.local` - Updated to EXPO_PUBLIC_* format
- `.env.local.example` - Updated template with better documentation

## Files Created
- `src/constants/api.ts` - API configuration and endpoints
- `src/constants/config.ts` - App configuration
- `src/constants/index.ts` - Constants barrel export
- Index/placeholder files in: components, hooks, services, stores, utils, types, screens

## Next Steps (Story 1.2+)
The foundation is now ready for:
1. **Auth implementation** - Use `API_ENDPOINTS.auth` from constants
2. **Ride services** - Use `API_CONFIG.baseURL` and `API_ENDPOINTS.rides`
3. **WebSocket setup** - Use `API_CONFIG.wsURL`
4. **Zustand stores** - Use the `stores/` folder following Zustand patterns
5. **Custom hooks** - Implement in `hooks/` folder (useGPS, useWebSocket, etc.)

## PR Review Fixes Applied
Addressed feedback from PR review:

1. **Environment variable alignment**: Updated `app.config.ts` to use `EXPO_PUBLIC_MAPS_API_KEY` for both iOS and Android, aligning with the new env contract introduced in bootstrap
2. **Validation logic**: Fixed `validateEnvironment()` to check raw environment variables before fallbacks, ensuring warnings are actually useful during development
3. **Skia dependency**: Removed `@shopify/react-native-skia` from bootstrap due to peer dependency conflicts with `react@19.1.0` and `react-native@0.81.5`. Skia will be added when implementing the share card feature (Story 1.3+) with a compatible version

## Notes
- Pre-existing codebase had some TypeScript errors in components/ui/collapsible.tsx and hooks/use-theme.ts - these are unrelated to bootstrap and should be addressed separately
- tsconfig.json already had path alias `@/*` configured, which aligns well with Expo setup
- All environment variables now use `EXPO_PUBLIC_*` prefix as required by Expo for frontend access
- No breaking changes made to existing code - only additions and structure improvements

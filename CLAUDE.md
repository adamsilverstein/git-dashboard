# Claude Code Instructions — LandinGit

> Repository slug is still `git-dashboard` in some local clones; the canonical slug is now `landingit`. iOS bundle identifier and Electron `appId` remain `com.github.adamsilverstein.git-dashboard` to match the App Store Connect registration (Apple ID 6765520480) — only the display name was renamed to LandinGit.

## Project Overview

LandinGit (formerly "Git Dashboard") is a GitHub PR monitoring tool with three targets:
- **Web app** (`src/`) — React + TypeScript + Vite
- **Desktop app** (`electron/`) — Electron wrapper around the web app
- **iOS app** (`mobile/`) — React Native (Expo) for iPhone/iPad

All three share platform-agnostic business logic from the `shared/` directory.

## Architecture

```
landingit/
  shared/       ← Types, GitHub API, hooks, utils (used by web + mobile)
  src/          ← Web app (re-exports from shared/, adds web-specific UI)
  mobile/       ← Expo React Native iOS app (imports from shared/)
  electron/     ← Electron desktop wrapper
```

### Shared Code Contract

The `shared/` directory contains all platform-agnostic code: types, GitHub API client, data fetching hooks, filtering/sorting logic, and utilities. Both the web app (`src/`) and mobile app (`mobile/`) import from `shared/`.

**The `shared/` directory must never import from `src/` or `mobile/`.** It uses no DOM APIs and no React Native APIs — only pure TypeScript and React hooks (`useState`, `useEffect`, etc.).

Files in `src/` that share names with `shared/` (e.g., `src/types.ts`, `src/config.ts`, `src/github/client.ts`) are thin re-export wrappers that preserve backward compatibility for web app imports.

### Storage Abstraction

The `StorageAdapter` interface (`shared/storage.ts`) abstracts storage so the same hooks work on both platforms:
- Web: `src/storage/webStorage.ts` wraps `localStorage`
- Mobile: `mobile/src/storage/asyncStorageAdapter.ts` wraps AsyncStorage, `secureStorageAdapter.ts` wraps iOS Keychain

## Keeping the iOS App in Sync

**When changing web app features or shared logic, the iOS app must be updated to match.** This is the most important rule for this project.

Specifically:
- **Changes to `shared/`** affect both platforms automatically, but verify the mobile app still works.
- **New features in `src/`** that use shared hooks likely need a corresponding mobile UI in `mobile/src/`.
- **New shared hooks or hook parameters** need mobile wrappers or context updates.
- **New utility functions** should go in `shared/utils/` so both platforms can use them (e.g., `contrastColor.ts`).

### Checklist for any feature change

1. If the feature logic is platform-agnostic, put it in `shared/`.
2. Add web UI in `src/components/`.
3. Add mobile UI in `mobile/src/components/` or `mobile/src/screens/`.
4. Run `npm run build && npm test` to verify the web app.
5. Test the mobile app in the iOS Simulator.

## Commands

```bash
# Web app
npm run dev          # Dev server at localhost:5173
npm run build        # TypeScript check + production build
npm test             # Unit tests (vitest)
npm run test:e2e     # E2E tests (playwright)

# Mobile app
cd mobile
npx expo start --ios  # Run in iOS Simulator
npx expo start --web  # Run in browser (needs react-native-web)

# Desktop app
npm run electron:dev   # Dev build + launch Electron
npm run electron:build # Package macOS .dmg
```

## Key Patterns

- **Config is shared via React Context** on mobile (`ConfigContext`). Never call `useConfig()` directly in mobile screens — use `useConfigContext()`.
- **Web app hooks** in `src/hooks/` are thin wrappers that inject `webStorage` into the shared hooks. Mobile screens import shared hooks directly and pass `asyncStorageAdapter`.
- **GitHub API calls** all go through `@octokit/rest` in `shared/github/`. No direct fetch calls.
- **Tests mock at the shared level** — e.g., `vi.mock('../../shared/github/pulls.js')`, not `vi.mock('../github/pulls.js')`.

## Mobile-Specific Context

- `AppContext` — Token, Octokit client, username, rate limit
- `ConfigContext` — Shared config state (repos, defaults) across all tabs
- `BadgeContext` — Unseen count for tab bar badge
- `local.config.json` (gitignored) — Optional dev token to skip the token setup screen

## CI/CD

- `.github/workflows/build-desktop.yml` — Builds Electron apps on version tags (`v*`)
- `.github/workflows/build-ios.yml` — Builds iOS preview on push to main, submits to App Store on `v*-ios` tags
- See `mobile/APP_STORE.md` for the full App Store submission guide

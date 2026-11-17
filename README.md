# RecipeHub

A cross-platform recipe app: sign in, browse a **community feed**, add and edit your own recipes, save **favorites**, and keep up with **activity** on your posts. Built with **Ionic React**, **Vite**, **Firebase**, and **Capacitor** for web, iOS, and Android.

**Bundle ID / app id:** `com.chilupa.recipehub` (see `capacitor.config.ts`).

---

## Features

| Area | What it does |
|------|----------------|
| **Auth** | Sign in with **email/password**, **Google**, and **Apple** via **Firebase Auth**. Includes create account and password reset. Native Android/iOS use the device Google/Apple picker. |
| **Recipes** | Paginated **feed** (`IonInfiniteScroll`), recipe **detail**, **add** / **edit** with ingredients, steps, times, servings, tags, optional **cover photos** (Firebase Storage + `image_url`), and **share counts**. On detail, a **servings scaler** (up to 999) rescales leading quantities in ingredient lines (shopping list uses the same scaled lines). Add/Edit forms now include **debounced draft autosave** (localStorage) with restore after accidental close/navigation. |
| **Favorites** | Heart on list or detail; dedicated **Favorites** tab; like counts synced in Firestore. |
| **Activity** | In-app **notifications** for recipe updates (Firestore + live listeners). Favorites are the first type; more can land here later. |
| **Profile** | Compact identity card with **edit profile** (display name + photo). Photos are compressed (~100KB JPEG) before upload to Firebase Storage (`profile-avatars/`). Email, browse links, preferences, sign out / delete account. Native apps can toggle **haptic feedback** on favorite. |
| **Recently viewed** | Recipe ids stored per scope in **localStorage** (guest vs signed-in) when you open a recipe. Not shown in the UI for now. |
| **Intro** | First-launch onboarding (`Intro.tsx`); skipped after completion (local persistence). |
| **Reliability** | Top-level **error boundary** for render crashes (reload / back to feed). **Offline banner** when the browser reports no connection. If Firebase env vars are unset, a **setup screen** explains required config instead of silent failures. |
| **Toasts** | One global **AppToast** (3s): normal feedback uses the default style; failures use **danger**. Call `showToast` / `showErrorToast` from `ToastContext`. |
| **Design system** | Shared UI from `src/design-system` (tokens, AppHeader, AppTabBar, AppEmptyState, etc.). Branding and tabs live in `src/app.config.ts`. |
| **Release tooling** | `npm run version:print` / `version:patch` sync web + native store versions. [docs/release.md](docs/release.md) and [CHANGELOG.md](CHANGELOG.md) describe feature branch → PR → tag → stores. Pushing a **`v*`** tag runs CI and creates a GitHub Release. |

Data lives in **Firebase Firestore** (`profiles`, `recipes`, `favorites`, `recipe_shares`, `notifications`) plus **Firebase Storage** (`recipe-images/{userId}/…`, `profile-avatars/{userId}.jpg`). See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) and `firestore.rules` / `storage.rules`.

---

## Tech stack

- **React 19** + **TypeScript**
- **Ionic React 8** + **React Router 5** (`@ionic/react-router`)
- **Vite 5**
- **Firebase** (`firebase`) — Auth, Firestore, Storage
- **Capacitor 8** — App, Browser, Keyboard, Splash Screen, Status Bar, Haptics, Network, Preferences
- **Zustand** — theme + client preferences
- Feature folders under `src/features/` + shared design system under `src/design-system/`

---

## Prerequisites

- **Node.js** (LTS recommended)
- A **Firebase** project (Auth + Firestore + Storage)
- For native builds: **Xcode** (iOS) and/or **Android Studio** (Android)

---

## Quick start (web)

```bash
npm install
```

Create a `.env` in the project root (Vite reads `VITE_*` variables). Copy from `.env.example` and fill Firebase values from the console / `google-services.json`.

Enable Auth, Firestore, and Storage, then deploy [`firestore.rules`](./firestore.rules) and [`storage.rules`](./storage.rules).

Full setup: **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)**.

```bash
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

```bash
npm run build    # production build → dist/
npm run preview  # serve dist locally
```

---

## Native (Capacitor)

```bash
npm run build
npx cap sync ios    # or: npm run ios:sync
npx cap sync android
```

Open native projects:

- iOS: `ios/App/App.xcworkspace` (after `npx cap add ios` if the folder exists)
- Android: `android/` in Android Studio

Useful scripts from `package.json`:

| Script | Purpose |
|--------|---------|
| `build:sync` | Single web `build`, then `cap sync` for **iOS and Android** |
| `mobile:build` | Single web `build`, then `cap copy` for **iOS and Android** |
| `version:print` / `version:patch` | Show or bump marketing version + native build numbers |
| `ios:build` / `android:build` | `build` + `cap copy` for one platform |
| `ios:sync` / `android:sync` | `cap sync` |
| `android:apk` | Debug APK via Gradle |

Development and releases: [docs/release.md](docs/release.md) (feature branches → `main` → tag → stores) and [CHANGELOG.md](CHANGELOG.md). Pushing a `v*` tag runs the GitHub Release workflow.

**OAuth on device:** configure Google redirect URIs and app URL scheme as described in `SUPABASE_SETUP.md`.

---

## Optional dev flags

| Variable | Effect |
|----------|--------|
| `VITE_NATIVE_AUTH_REDIRECT_URL` | Custom native OAuth redirect (must match app URL scheme). |
| `VITE_GOOGLE_WEB_CLIENT_ID` | Web client ID from `google-services.json` for native Android Google sign-in. |
| `VITE_SHARE_WEB_BASE_URL` | Public base URL used in shares for recipe links (example: `https://recipehub.app`). |
| `VITE_APP_DOWNLOAD_URL` | App download/smart link appended in share text to help recipients install the app. |

---

## Deploy (web)

The repo includes **`netlify.toml`**: build `npm run build`, publish `dist`, SPA fallback to `index.html`.

---

## Project layout (high level)

```
src/
  app/App.tsx             # Thin shell: bootstrap, providers, intro/config gates
  app.config.ts           # Brand colors, app name, tab config
  design-system/          # Tokens, theme, icons, shared UI components
  features/               # auth, feed, search, my-recipes, favorites,
                          # activity, profile, shopping, recipes
  navigation/             # AppRouter + TabNavigation (config-driven tabs)
  store/                  # Zustand theme + preferences
  services/native/        # Keyboard, status bar, network wrappers
  components/             # Recipe-specific UI (cards, forms, …)
  contexts/               # Auth, recipes, notifications, shopping, toasts
  lib/                    # Firebase auth, Firestore recipes, Storage helpers
  theme/variables.css     # Extra Ionic / recipe card tokens
firestore.rules           # Firestore security rules
storage.rules             # Storage security rules
```

Cursor rules for this architecture live in `.cursor/rules/` (design system, project standards, mobile, testing, git workflow).

---

## Tests & quality

```bash
npm run lint
npm run test.unit      # Vitest (includes ErrorBoundary + recipe list helpers + haptics prefs)
npm run test.e2e       # Cypress — run `npm run dev` first; smoke loads `/`
```


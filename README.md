# RecipeHub

A cross-platform recipe app: sign in, browse a **community feed**, add and edit your own recipes, save **favorites**, and see **activity** when others favorite your posts. Built with **Ionic React**, **Vite**, **Supabase**, and **Capacitor** for web, iOS, and Android.

**Bundle ID / app id:** `com.chilupa.recipehub` (see `capacitor.config.ts`).

---

## Features

| Area | What it does |
|------|----------------|
| **Auth** | Sign in with **Google** via Supabase Auth; native apps use an in-app browser + deep link callback (`recipehub://…`). |
| **Recipes** | Paginated **feed** (`IonInfiniteScroll`), recipe **detail**, **add** / **edit** with ingredients, steps, times, servings, tags, optional **cover photos** (Supabase Storage + `image_url`), and **share counts** (`recipe_shares`). On detail, a **servings scaler** (up to 999) rescales leading quantities in ingredient lines (shopping list uses the same scaled lines). Add/Edit forms now include **debounced draft autosave** (localStorage) with restore after accidental close/navigation. |
| **Favorites** | Heart on list or detail; dedicated **Favorites** tab; like counts synced server-side. |
| **Activity** | In-app **notifications** when someone favorites your recipe (Supabase `notifications` + optional Realtime). |
| **Profile** | Display name (editable), email, links to feed / favorites / activity, sign out. On native apps, optional **haptic feedback** when you favorite a recipe (toggle under Preferences). |
| **Recently viewed** | Recipe ids stored per scope in **localStorage** (guest vs signed-in). Opening recipe detail records a visit; the **Search** tab shows a horizontal **Recently viewed** strip under the search bar (loads missing recipes via `ensureRecipeLoaded`). |
| **Intro** | First-launch onboarding (`Intro.tsx`); skipped after completion (local persistence). |
| **Reliability** | Top-level **error boundary** for render crashes (reload / back to feed). **Offline banner** when the browser reports no connection. If `VITE_SUPABASE_*` is unset, a **setup screen** explains required env vars instead of silent dummy-client failures. |
| **Toasts** | One global **IonToast** (3s): normal feedback uses the default style; failures use **danger**. Call `showToast` / `showErrorToast` from `ToastContext`. |
| **Release tooling** | `npm run version:print` / `version:patch` sync web + native store versions. [docs/release.md](docs/release.md) and [CHANGELOG.md](CHANGELOG.md) describe feature branch → PR → tag → stores. Pushing a **`v*`** tag runs CI and creates a GitHub Release. |

Data lives in **Supabase** (`profiles`, `recipes`, `favorites`, `recipe_shares`, `notifications`) plus a public **`recipe-images`** storage bucket, with **Row Level Security**. See `supabase/schema.sql` and `supabase/migrations/`.

---

## Tech stack

- **React 19** + **TypeScript**
- **Ionic React 8** + **React Router 5** (`@ionic/react-router`)
- **Vite 5**
- **Supabase** (`@supabase/supabase-js`) — Postgres, Auth, Realtime (optional)
- **Capacitor 8** — App, Browser (OAuth), Keyboard, Splash Screen, Status Bar, Haptics, etc.

---

## Prerequisites

- **Node.js** (LTS recommended)
- A **Supabase** project (for production-like runs)
- For native builds: **Xcode** (iOS) and/or **Android Studio** (Android)

---

## Quick start (web)

```bash
npm install
```

Create a `.env` in the project root (Vite reads `VITE_*` variables):

```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

Apply the database schema:

- Run `supabase/schema.sql` in the Supabase SQL Editor.

Full Auth + Google + native redirect notes: **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)**.

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
| `VITE_SHARE_WEB_BASE_URL` | Public base URL used in shares for recipe links (example: `https://recipehub.app`). |
| `VITE_APP_DOWNLOAD_URL` | App download/smart link appended in share text to help recipients install the app. |

---

## Deploy (web)

The repo includes **`netlify.toml`**: build `npm run build`, publish `dist`, SPA fallback to `index.html`.

---

## Project layout (high level)

```
src/
  App.tsx                 # Intro gate, auth, tabs, providers
  components/             # RecipeCard, AppHeader, Tabs, FavoriteHeartButton, …
  contexts/               # AuthContext, RecipeContext, NotificationContext
  lib/                    # supabase client, recipeSupabase, oauthRedirect
  pages/                  # RecipeList, RecipeDetail, AddRecipe, EditRecipe,
                          # Favorites, Activity, Profile, Login, Intro
  theme/variables.css     # Ionic color tokens
supabase/
  schema.sql              # Tables + RLS
```

---

## Tests & quality

```bash
npm run lint
npm run test.unit      # Vitest (includes ErrorBoundary + recipe list helpers + haptics prefs)
npm run test.e2e       # Cypress — run `npm run dev` first; smoke loads `/`
```


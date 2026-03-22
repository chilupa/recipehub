# RecipeHub

A cross-platform recipe app: sign in, browse a **community feed**, add and edit your own recipes, save **favorites**, and see **activity** when others favorite your posts. Built with **Ionic React**, **Vite**, **Supabase**, and **Capacitor** for web, iOS, and Android.

**Bundle ID / app id:** `com.chilupa.recipehub` (see `capacitor.config.ts`).

---

## Features

| Area | What it does |
|------|----------------|
| **Auth** | Sign in with **Google** via Supabase Auth; native apps use an in-app browser + deep link callback (`recipehub://…`). |
| **Recipes** | Paginated **feed** (`IonInfiniteScroll`), recipe **detail**, **add** / **edit** with ingredients, steps, times, servings, and tags. |
| **Favorites** | Heart on list or detail; dedicated **Favorites** tab; like counts synced server-side. |
| **Activity** | In-app **notifications** when someone favorites your recipe (Supabase `notifications` + optional Realtime). |
| **Profile** | Display name (editable), email, links to feed / favorites / activity, sign out. |
| **Intro** | First-launch onboarding (`Intro.tsx`); skipped after completion (local persistence). |

Data lives in **Supabase** (`profiles`, `recipes`, `favorites`, `notifications`) with **Row Level Security**. See `supabase/schema.sql`.

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
| `ios:build` / `android:build` | `build` + `cap copy` |
| `ios:sync` / `android:sync` | `cap sync` |
| `android:apk` | Debug APK via Gradle |

**OAuth on device:** configure Google redirect URIs and app URL scheme as described in `SUPABASE_SETUP.md`.

---

## Optional dev flags

| Variable | Effect |
|----------|--------|
| `VITE_USE_MOCK_DATA=true` | Recipes/favorites use **localStorage** mock data instead of Supabase. |
| `VITE_USE_MOCK_AUTH=true` | Skip real auth; mock user in localStorage. |
| `VITE_NATIVE_AUTH_REDIRECT_URL` | Custom native OAuth redirect (must match app URL scheme). |

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
npm run test.unit      # Vitest
npm run test.e2e       # Cypress
```


# Firebase setup

RecipeHub uses **Firebase only**: Authentication, Firestore (data), and Storage (recipe covers).

## 1. Firebase project

1. Open [Firebase Console](https://console.firebase.google.com) → project `recipehub-3bb67` (or create one).
2. Enable **Authentication** → Sign-in method → **Email/Password**, **Google** (and **Apple** if needed).
3. Create a **Firestore** database (production or test mode, then deploy rules below).
4. Enable **Storage**.
5. Register apps:
   - **Android**: package `com.chilupa.recipehub` + SHA-1 fingerprints → download `google-services.json` into `android/app/`
   - **Web**: add a Web app and copy config into `.env`
   - **iOS** (optional): bundle `com.chilupa.recipehub`

## 2. Security rules

Deploy the repo rules (Storage defaults to deny-all until you do this — cover/avatar uploads will fail with `storage/unauthorized`):

```bash
# With Firebase CLI logged in as a project owner/editor
firebase deploy --only firestore:rules,storage
```

Or paste [`storage.rules`](./storage.rules) in Firebase Console → **Storage** → **Rules** → Publish.

Files:

- [`firestore.rules`](./firestore.rules)
- [`storage.rules`](./storage.rules)

## 3. App env vars

Copy from Firebase project settings / `google-services.json`:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=recipehub-3bb67.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=recipehub-3bb67
VITE_FIREBASE_STORAGE_BUCKET=recipehub-3bb67.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=975738643330
VITE_FIREBASE_APP_ID=

VITE_GOOGLE_WEB_CLIENT_ID=     # oauth_client client_type 3
VITE_GOOGLE_IOS_CLIENT_ID=     # optional iOS client
```

Restart `npm run dev` after changing `.env`.

## 4. Data model (Firestore)

| Collection | Doc id | Purpose |
|------------|--------|---------|
| `profiles` | Firebase uid | `display_name`, `avatar_url`, `updated_at` |
| `recipes` | auto id | recipe fields + `user_id`, timestamps |
| `favorites` | `{userId}__{recipeId}` | `user_id`, `recipe_id`, `created_at` |
| `recipe_shares` | `{userId}__{recipeId}` | share records |
| `notifications` | auto id | activity for recipe owners (e.g. `type: favorite`) |

Storage paths:

- `recipe-images/{userId}/{recipeId}.jpg` (compressed JPEG, under ~250KB)
- `profile-avatars/{userId}.jpg` (compressed JPEG, under ~100KB)

## 5. Indexes

Composite indexes live in [`firestore.indexes.json`](./firestore.indexes.json). Deploy them with rules:

```bash
firebase use recipehub-3bb67
firebase deploy --only firestore:indexes,firestore:rules,storage
```

Or open the “create index” link from the browser console error (fastest for a single missing index). Indexes can take a few minutes to finish building.

## 6. Native Google sign-in

Android uses Capacitor Social Login → Firebase Auth credential. Rebuild after env changes:

```bash
npm run build && npx cap sync android
```

## 7. Account deletion

In-app delete removes the user’s Firestore data, then deletes the Firebase Auth user.

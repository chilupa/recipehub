# Supabase setup

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. **New project** → choose org, name (e.g. `recipehub`), database password, region.
3. Wait for the project to be ready.

## 2. Run the schema

1. In the dashboard, open **SQL Editor** → **New query**.
2. Copy the contents of `supabase/schema.sql` and run it.
3. This creates `profiles`, `recipes`, `favorites`, and `notifications` tables and RLS policies.

## 3. Enable Google sign-in

1. **Authentication** → **Providers** → **Google** → enable.
2. In [Google Cloud Console](https://console.cloud.google.com):
   - Create or select a project → **APIs & Services** → **Credentials** → **Create credentials** → **OAuth client ID**.
   - Application type: **Web application**.
   - Authorized redirect URIs: add your Supabase callback URL, e.g.  
     `https://<your-project-ref>.supabase.co/auth/v1/callback`
   - Copy **Client ID** and **Client secret**.
3. Back in Supabase → **Google** provider → paste Client ID and Client secret → Save.

## 4. Configure the app

1. In Supabase: **Project Settings** → **API**.
2. Copy **Project URL** and **anon public** key.
3. In the app root, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Edit `.env` and set:
   ```
   VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-key>
   ```

## 5. Run the app

```bash
npm run dev
```

Open the app → **Sign in with Google** → after redirect you can add recipes and favorite others’ recipes.

## Optional: Site URL for redirects

In Supabase **Authentication** → **URL configuration**, set **Site URL** to your app URL (e.g. `http://localhost:5173` for dev). Redirect URL after Google sign-in will use this.

## Google sign-in on Android (Capacitor / Play Store)

The Android WebView uses **`https://localhost`** as its origin. If OAuth is set to redirect there, Chrome Custom Tabs (used during Google sign-in) will open **`https://localhost/...#access_token=...`** in the **browser**, which is not your app—so sign-in appears broken.

The app instead redirects to a **custom URL** (`recipehub://login-callback` by default), opens Google in the **in-app browser**, then completes the session when Android reopens your app on that link.

1. **Supabase** → **Authentication** → **URL configuration** → **Redirect URLs**: add  
   `recipehub://login-callback`  
   (or match `VITE_NATIVE_AUTH_REDIRECT_URL` if you set a different value).

2. **Android** (`android/app/src/main/AndroidManifest.xml`): inside your main `<activity>` (usually `MainActivity`), add an intent filter so the system sends `recipehub://` links to the app:

   ```xml
   <intent-filter>
     <action android:name="android.intent.action.VIEW" />
     <category android:name="android.intent.category.DEFAULT" />
     <category android:name="android.intent.category.BROWSABLE" />
     <data android:scheme="recipehub" />
   </intent-filter>
   ```

3. Rebuild the app (`npm run build`, then `npx cap sync android`) and upload a new build to Play.

### iOS (TestFlight / App Store)

Google sign-in finishes by opening **`recipehub://login-callback?...`**. If iOS does not know that scheme belongs to your app, **Safari shows “cannot open the page” / invalid address** and sign-in never completes.

1. Use the same **Supabase** redirect allow-list entry as Android: `recipehub://login-callback`.
2. Register the URL scheme in **`ios/App/App/Info.plist`** under `CFBundleURLTypes` with scheme **`recipehub`** (this repo already includes it). If you use a custom `VITE_NATIVE_AUTH_REDIRECT_URL`, the scheme must match its URI (e.g. `myapp://...` → scheme `myapp`).
3. Rebuild: `npm run build` → `npx cap sync ios` → archive in Xcode.

## Activity tab (in-app notifications)

When someone favorites your recipe, the app inserts a row into `notifications` (validated by RLS). The **Activity** tab lists those items and shows an unread badge on the tab bar.

1. Ensure the `notifications` table from `supabase/schema.sql` is applied (see §2).
2. **Realtime (recommended):** Supabase Dashboard → **Database** → **Publications** → `supabase_realtime` → enable the **`notifications`** table so new favorites appear without refreshing the app. If you skip this, users can **pull to refresh** on the Activity screen or switch away and back to reload.
3. **Database** → **Replication** (or **Realtime** settings): confirm Realtime is enabled for the project if inserts don’t show up live.

# App releases

How we develop a feature, merge it, and roll it out on **Android** and **iOS**.

This app is one Ionic/React codebase. You build the web bundle **once**, copy it into both native projects, then upload **two separate store binaries** (Play Console and App Store Connect).

---

## At a glance

```
Feature branch  →  PR  →  main  →  version bump  →  git tag v1.0.1
                                              ↓
                                    npm run build:sync  (one web build)
                                              ↓
                         ┌────────────────────┴────────────────────┐
                         ↓                                         ↓
                  Android Studio                            Xcode archive
                  upload AAB                                upload to TestFlight
                         ↓                                         ↓
                  Google Play review                      Apple review
                         ↓                                         ↓
                  Roll out to users                       Release to App Store
```

Merging to `main` does **not** put the feature in users’ hands. Stores only update after you upload new binaries and they pass review.

---

## “Release notes” — three different things

People say “release notes” for different places. They are related but not the same file.

| What | Where | Who sees it | When you write it |
| ---- | ----- | ----------- | ----------------- |
| **Changelog** | `CHANGELOG.md` in the repo | Your team | While building the feature (`[Unreleased]`), then finalize when you cut a version |
| **GitHub Release** | GitHub → Releases (created when you push a `v*` tag) | Your team, audit trail | Edit after the tag is pushed; copy from the changelog |
| **Store listing text** | Play Console + App Store Connect (“What’s new”) | End users in the stores | When you submit each platform’s binary (can be the same short text for both) |

**Changelog** = source of truth while developing.

**GitHub Release** = record on GitHub that “we shipped v1.0.1” with build numbers and links.

**Store listing text** = the short “What’s new” blurb users read in Google Play / the App Store. Often 2–5 bullets copied from the changelog, trimmed for length.

You do **not** need three totally different writeups. Write once in `CHANGELOG.md`, then copy/adapt for GitHub and the stores.

---

## Step by step: ship a feature to Android and iOS

Example: you finished **recipe draft autosave** and want users on both platforms to get **version 1.12.1**.

### Phase 1 — Build the feature (nothing in the stores yet)

| Step | What to do |
| ---- | ---------- |
| 1 | `git checkout main && git pull` |
| 2 | `git checkout -b feature/recipe-draft-autosave` |
| 3 | Code, test locally (`npm run dev`, `npm run build`) |
| 4 | If native-related: `npm run build:sync` and test on emulator/device |
| 5 | Add bullets under **`[Unreleased]`** in [CHANGELOG.md](../CHANGELOG.md) (what users will notice) |
| 6 | Open a PR to `main`, get review, merge (squash merge is fine) |
| 7 | Delete the feature branch |

After merge, the feature is on `main` only. **Users still have the old app** until you complete the phases below.

Do **not** change `package.json` version or Android/iOS build numbers on the feature branch.

---

### Phase 2 — Decide you are ready to ship

Confirm on `main`:

- [ ] Feature PR(s) merged
- [ ] `npm run build` passes
- [ ] Changelog `[Unreleased]` is accurate
- [ ] `.env` has production Supabase values (not committed) for anything the feature needs

Pick the next version:

- **Patch** `1.12.0` → `1.12.1` — bug fixes, small improvements
- **Minor** `1.12.0` → `1.13.0` — bigger feature set
- **Major** `1.12.0` → `2.0.0` — breaking or major product change

---

### Phase 3 — Cut the release (version numbers + git)

All on `main`:

**1. Finalize the changelog**

Move everything under `[Unreleased]` into a new section:

```markdown
## [1.12.1] - 2026-06-15

### Added
- …

## [Unreleased]
(empty until next feature)
```

**2. Bump versions** (marketing version + both platform build numbers):

```bash
npm run version:patch    # or version:minor / version:major
npm run version:print    # sanity check
```

**3. Commit:**

```bash
git add package.json android/app/build.gradle ios/App/App.xcodeproj/project.pbxproj CHANGELOG.md
git commit -m "chore: release 1.12.1"
```

**4. Tag and push:**

```bash
git tag v1.12.1
git push origin main
git push origin v1.12.1
```

Pushing `v1.12.1` triggers GitHub Actions (`.github/workflows/release.yml`): it runs `npm run build` and creates a **GitHub Release** with a template body.

**5. Edit the GitHub Release** (on github.com):

- Paste the **“What’s new”** bullets from `CHANGELOG.md` for 1.12.1
- Fill in the build table (`npm run version:print` shows the numbers)
- Leave store checkboxes unchecked until each platform is live

---

### Phase 4 — Build one app bundle for both platforms

On the machine that will build store binaries (with production `.env` set):

```bash
git checkout main
git pull
git checkout v1.12.1    # exact code you tagged
npm ci
npm run build:sync
```

`build:sync` does two things:

1. **`npm run build`** — compiles the React app into `dist/`
2. **`cap sync`** — copies `dist/` into **both** `android/` and `ios/`

Same JavaScript ships on Android and iOS. Native projects only wrap that web bundle.

---

### Phase 5 — Submit Android

| Step | Action |
| ---- | ------ |
| 1 | Open `android/` in **Android Studio** |
| 2 | Build → **Generate Signed Bundle / APK** → **AAB** |
| 3 | [Google Play Console](https://play.google.com/console) → your app → **Production** (or internal testing first) |
| 4 | **Create new release** → upload the AAB |
| 5 | **Release notes** (store listing): paste short bullets from the changelog (user-facing only) |
| 6 | Submit for review → choose rollout % when approved |

Note the **version name** (e.g. `1.12.1`) and **version code** shown in Play Console. Update the GitHub Release table when submitted.

Package: `com.chilupa.recipehub`

---

### Phase 6 — Submit iOS

| Step | Action |
| ---- | ------ |
| 1 | Open `ios/App/App.xcodeproj` in **Xcode** (Mac only) |
| 2 | Select **Any iOS Device** → **Product → Archive** |
| 3 | **Distribute App** → App Store Connect → upload |
| 4 | [App Store Connect](https://appstoreconnect.apple.com) → your app → **TestFlight** (test) or **App Store** tab |
| 5 | Attach the new build to a version (e.g. `1.12.1`) |
| 6 | **What’s New**: same short bullets as Android (Apple has character limits) |
| 7 | Submit for review |

Configure signing in Xcode (team, certificates, bundle ID). Production bundle ID: `com.chilupa.recipehub` (verify after `cap sync`).

Note the **version** and **build** number in App Store Connect. Update the GitHub Release when submitted.

---

### Phase 7 — Roll out and close the loop

| When | Do this |
| ---- | ------- |
| Android approved | Start rollout in Play Console; check **Google Play** on GitHub Release |
| iOS approved | Release to App Store or TestFlight testers; check **App Store** on GitHub Release |
| Both live | GitHub Release is complete; `[1.12.1]` in changelog matches what users have |

Review times vary (hours to days). Android and iOS **do not have to go live the same day**. Same git tag `v1.12.1` still describes both; update the GitHub Release checklist as each platform ships.

---

## Version numbers (reference)

| Layer | File | Example | Meaning |
| ----- | ---- | ------- | ------- |
| Marketing version | `package.json` | `1.12.1` | User-facing version; Git tag `v1.12.1` |
| Android name | `build.gradle` `versionName` | `1.12.1` | Play Store “Version name” |
| Android build | `build.gradle` `versionCode` | `24` | Must increase every Play upload |
| iOS version | `MARKETING_VERSION` | `1.12.1` | App Store “Version” |
| iOS build | `CURRENT_PROJECT_VERSION` | `1` | Must increase every App Store upload |

Android `versionCode` and iOS build number **can differ**. Each only has to go up on its own platform.

---

## Version scripts (reference)

```bash
npm run version:print    # show web, Android, iOS numbers
npm run version:sync     # copy package.json version to native names only
npm run version:patch    # bump 1.12.0 → 1.12.1 + increment both build numbers
npm run version:minor
npm run version:major
```

Android-only rebuild (same marketing version, new `versionCode`):

```bash
node scripts/bump-app-version.mjs sync --android-build 25 --no-ios-build
```

---

## Branch naming (reference)

| Branch | Use |
| ------ | --- |
| `main` | Integration; all releases cut from here |
| `feature/*` | New work |
| `fix/*` | Bug fixes |
| `chore/*` | Tooling, version bumps, docs |

```bash
git checkout -b feature/my-feature
# … PR to main, merge, delete branch
```

Keep feature branches short-lived; merge `main` into your branch if the PR stays open several days.

---

## Hotfix (production broken)

1. `git checkout main && git pull`
2. `git checkout -b fix/crash-on-launch`
3. Fix, PR, merge to `main`
4. Run **Phase 3–7** with `npm run version:patch` (usually a patch bump)

---

## Who does what

| Task | Typical owner |
| ---- | ------------- |
| Feature branch + PR | Developer |
| Review + merge to `main` | Teammate / maintainer |
| Changelog + version bump + git tag | Release owner |
| `npm run build:sync` + archives | Whoever has Android Studio / Xcode |
| Play Console + App Store Connect | Whoever has store access |
| GitHub Release text | Release owner (from changelog) |

---

## Environment reminder

`.env` is not in git. Run `npm run build:sync` with production Supabase env vars on the build machine. See `.env.example` and [SUPABASE_SETUP.md](../SUPABASE_SETUP.md).

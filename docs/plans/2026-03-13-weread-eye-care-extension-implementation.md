# WeRead Eye Care Extension Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Chrome extension MVP for WeRead that calibrates a local blink baseline, detects low-blink reading sessions, reminds the user to blink, degrades to timer-based reminders without camera access, and stores/export local stats.

**Architecture:** Use a Manifest V3 extension with a WeRead-only content script, a lightweight popup/options UI, and shared TypeScript modules for policy, storage, stats, and CSV export. Keep face/eye detection behind a dedicated service so the site adapter and reminder logic stay testable without webcam access.

**Tech Stack:** TypeScript, esbuild, Vitest, Chrome Extensions Manifest V3, `@mediapipe/tasks-vision`

---

### Task 1: Scaffold the extension workspace

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `scripts/build.mjs`
- Create: `public/manifest.json`
- Create: `.gitignore`
- Create: `README.md`

**Step 1: Write the failing test**

Create a smoke test that imports the shared build-time constants from `src/shared/constants.ts` and fails because the module does not exist yet.

**Step 2: Run test to verify it fails**

Run: `npm test -- --run`
Expected: FAIL with module resolution error for `src/shared/constants.ts`

**Step 3: Write minimal implementation**

Add the package scripts, TypeScript config, Vitest config, manifest, build script, and the minimal constants module required for the smoke test and extension build to succeed.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run`
Expected: PASS for the smoke test

**Step 5: Commit**

```bash
git add .
git commit -m "chore: scaffold extension workspace"
```

### Task 2: Build the shared policy, storage, and export modules

**Files:**
- Create: `src/shared/constants.ts`
- Create: `src/shared/types.ts`
- Create: `src/shared/policy.ts`
- Create: `src/shared/storage.ts`
- Create: `src/shared/stats.ts`
- Create: `src/shared/csv.ts`
- Test: `src/shared/policy.test.ts`
- Test: `src/shared/stats.test.ts`
- Test: `src/shared/csv.test.ts`

**Step 1: Write the failing test**

Add tests that define:
- when a reminder should trigger from stare duration + blink-rate drop + cooldown
- how daily and per-book stats aggregate
- what CSV export columns must exist

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/shared/policy.test.ts src/shared/stats.test.ts src/shared/csv.test.ts`
Expected: FAIL because the modules or functions are missing

**Step 3: Write minimal implementation**

Implement the shared types, default thresholds, reminder policy, local storage wrapper, stats aggregator, and CSV export helpers.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/shared/policy.test.ts src/shared/stats.test.ts src/shared/csv.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add shared reminder policy and stats modules"
```

### Task 3: Build the WeRead runtime and reminder UI

**Files:**
- Create: `src/content/main.ts`
- Create: `src/content/weread/adapter.ts`
- Create: `src/content/activity/session.ts`
- Create: `src/content/reminder/overlay.ts`
- Create: `src/content/reminder/audio.ts`
- Test: `src/content/weread/adapter.test.ts`
- Test: `src/content/activity/session.test.ts`

**Step 1: Write the failing test**

Add tests that define:
- which URLs count as supported WeRead reading pages
- how the book title is derived
- when the page becomes active or inactive from visibility and user events

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/content/weread/adapter.test.ts src/content/activity/session.test.ts`
Expected: FAIL because the adapter/session implementations do not exist

**Step 3: Write minimal implementation**

Implement the WeRead adapter, reading-activity session tracker, reminder overlay, and reminder sound helper. Wire them together in the content entrypoint with placeholder signals so the extension can render on WeRead pages.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/content/weread/adapter.test.ts src/content/activity/session.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add weread runtime and reminder ui"
```

### Task 4: Add webcam calibration, blink detection, and degradation flow

**Files:**
- Create: `src/content/vision/service.ts`
- Create: `src/content/vision/calibration.ts`
- Create: `src/content/vision/ear.ts`
- Create: `src/content/runtime/controller.ts`
- Test: `src/content/vision/calibration.test.ts`
- Test: `src/content/vision/ear.test.ts`
- Modify: `src/content/main.ts`

**Step 1: Write the failing test**

Add tests that define:
- how baseline calibration computes the blink-rate baseline
- how blink detection transitions from open -> closed -> open
- how the controller falls back to timer mode when camera startup fails

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/content/vision/calibration.test.ts src/content/vision/ear.test.ts`
Expected: FAIL because the calibration, EAR, or controller modules do not exist

**Step 3: Write minimal implementation**

Implement webcam startup, MediaPipe-backed face landmark analysis, blink extraction from eye aspect ratio, calibration persistence, reminder triggering, and the degrade-to-timer flow.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/content/vision/calibration.test.ts src/content/vision/ear.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add blink detection and fallback runtime"
```

### Task 5: Add popup/options stats UI and verify the build

**Files:**
- Create: `src/popup/index.html`
- Create: `src/popup/main.ts`
- Create: `src/options/index.html`
- Create: `src/options/main.ts`
- Create: `src/background/main.ts`
- Modify: `public/manifest.json`

**Step 1: Write the failing test**

Add or extend tests for the exported stats view-model so popup/options rendering expectations are defined before the UI code is written.

**Step 2: Run test to verify it fails**

Run: `npm test -- --run`
Expected: FAIL on the new stats view-model assertions

**Step 3: Write minimal implementation**

Implement popup summary rendering, options export/reset controls, and any background glue needed for MV3 compatibility.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run`
Expected: PASS

Then run:

```bash
npm run build
```

Expected: exit code `0` and a packaged `dist/` directory containing manifest, scripts, and HTML assets.

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add extension ui and buildable mvp"
```

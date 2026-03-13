# No-Camera TTS Reminder Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the camera-based eye detection workflow with a no-camera active-reading reminder that triggers every 20 minutes and uses TTS as the default reminder channel.

**Architecture:** Keep the existing WeRead page detection, activity tracking, overlay, popup, and storage shell, but remove the camera / vision pipeline entirely. Replace the current runtime with a single active-reading time accumulator plus a TTS reminder path and a simplified popup data model.

**Tech Stack:** Chrome extension MV3, TypeScript, esbuild, Vitest, Web Speech API

---

### Task 1: Lock the new runtime model with failing tests

**Files:**
- Create: `/Users/liuwei/workspace/eye-care-extension/src/content/runtime/scheduler.test.ts`
- Create: `/Users/liuwei/workspace/eye-care-extension/src/content/runtime/scheduler.ts`
- Modify: `/Users/liuwei/workspace/eye-care-extension/src/content/activity/session.test.ts`

**Step 1: Write the failing test**

Cover:
- only active reading time counts
- inactive periods pause accumulation
- a reminder becomes due after `20 * 60 * 1000` ms of accumulated active reading
- after triggering, the next cycle restarts from zero

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/content/runtime/scheduler.test.ts`

Expected: FAIL because the scheduler does not exist yet.

**Step 3: Write minimal implementation**

Implement a small scheduler that:
- tracks accumulated active reading time
- exposes next reminder timing
- resets the cycle when a reminder is triggered

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/content/runtime/scheduler.test.ts`

Expected: PASS

### Task 2: Replace audio behavior with TTS-first reminder delivery

**Files:**
- Create: `/Users/liuwei/workspace/eye-care-extension/src/content/reminder/tts.test.ts`
- Create: `/Users/liuwei/workspace/eye-care-extension/src/content/reminder/tts.ts`
- Modify: `/Users/liuwei/workspace/eye-care-extension/src/content/preview.test.ts`
- Modify: `/Users/liuwei/workspace/eye-care-extension/src/content/preview.ts`

**Step 1: Write the failing test**

Cover:
- speaking the fixed default reminder copy
- handling missing `speechSynthesis` without throwing
- preview reminder uses TTS instead of the old tone-only path

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/content/reminder/tts.test.ts src/content/preview.test.ts`

Expected: FAIL because TTS helper and preview wiring do not exist yet.

**Step 3: Write minimal implementation**

Implement:
- a TTS helper around `speechSynthesis`
- safe no-op fallback when TTS is unavailable
- preview runner integration so preview reminder uses overlay + TTS

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/content/reminder/tts.test.ts src/content/preview.test.ts`

Expected: PASS

### Task 3: Rewrite content bootstrap around the no-camera scheduler

**Files:**
- Modify: `/Users/liuwei/workspace/eye-care-extension/src/content/main.ts`
- Modify: `/Users/liuwei/workspace/eye-care-extension/src/content/runtime/controller.test.ts`
- Modify or delete: `/Users/liuwei/workspace/eye-care-extension/src/content/runtime/controller.ts`

**Step 1: Write the failing test**

Add or update runtime tests to assert:
- no camera startup path is used
- reminder triggering comes from accumulated active reading time
- popup-facing next reminder timing can be derived from the scheduler

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/content/runtime/controller.test.ts`

Expected: FAIL because current controller still models camera / vision behavior.

**Step 3: Write minimal implementation**

Refactor content bootstrap to:
- remove camera startup
- remove calibration flow
- remove vision sampling intervals
- drive reminders from the new active-reading scheduler
- keep overlay, reading stats, and preview reminder behavior

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/content/runtime/controller.test.ts`

Expected: PASS

### Task 4: Simplify storage and popup state

**Files:**
- Modify: `/Users/liuwei/workspace/eye-care-extension/src/shared/types.ts`
- Modify: `/Users/liuwei/workspace/eye-care-extension/src/shared/storage.ts`
- Modify: `/Users/liuwei/workspace/eye-care-extension/src/ui/summary.ts`
- Modify: `/Users/liuwei/workspace/eye-care-extension/src/popup/main.ts`
- Modify: `/Users/liuwei/workspace/eye-care-extension/src/options/main.ts`
- Modify tests under:
  - `/Users/liuwei/workspace/eye-care-extension/src/shared/storage.test.ts`
  - `/Users/liuwei/workspace/eye-care-extension/src/options/view-model.test.ts`
  - `/Users/liuwei/workspace/eye-care-extension/src/popup/preview.test.ts`

**Step 1: Write the failing test**

Cover:
- persisted state no longer requires camera / calibration / strategy fields
- popup summary only shows today reading, today reminders, next reminder status
- inactive state renders `等待开始阅读`

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/shared/storage.test.ts src/options/view-model.test.ts`

Expected: FAIL because the old persisted model still includes camera-era fields.

**Step 3: Write minimal implementation**

Simplify state to the no-camera model:
- today reading
- today reminder count
- accumulated active reading time or next reminder timing

Remove camera-era popup/options fields from rendering.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/shared/storage.test.ts src/options/view-model.test.ts`

Expected: PASS

### Task 5: Remove camera and vision assets from build/runtime

**Files:**
- Delete: `/Users/liuwei/workspace/eye-care-extension/src/content/vision/bridge.ts`
- Delete: `/Users/liuwei/workspace/eye-care-extension/src/content/vision/bridge.test.ts`
- Delete: `/Users/liuwei/workspace/eye-care-extension/src/content/vision/loader.ts`
- Delete: `/Users/liuwei/workspace/eye-care-extension/src/content/vision/loader.test.ts`
- Delete: `/Users/liuwei/workspace/eye-care-extension/src/content/vision/service.ts`
- Delete: `/Users/liuwei/workspace/eye-care-extension/src/page/main.ts`
- Delete: `/Users/liuwei/workspace/eye-care-extension/src/page/runtime.ts`
- Delete: `/Users/liuwei/workspace/eye-care-extension/src/page/runtime.test.ts`
- Modify: `/Users/liuwei/workspace/eye-care-extension/scripts/build.mjs`
- Modify: `/Users/liuwei/workspace/eye-care-extension/public/manifest.json`
- Modify: `/Users/liuwei/workspace/eye-care-extension/src/manifest.test.ts`

**Step 1: Write the failing test**

Extend manifest/build coverage for:
- no page-world runner resource
- no MediaPipe wasm/model exposure
- no camera-era build entry

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/manifest.test.ts`

Expected: FAIL because manifest/build still expose camera-era assets.

**Step 3: Write minimal implementation**

Remove:
- page runner build entry
- MediaPipe asset copy
- web accessible resources for vision assets
- camera-era helper files

Keep only the assets needed for the no-camera reminder.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/manifest.test.ts`

Expected: PASS

### Task 6: Update docs and manual QA

**Files:**
- Modify: `/Users/liuwei/workspace/eye-care-extension/README.md`
- Modify: `/Users/liuwei/workspace/eye-care-extension/docs/principles-and-usage.md`
- Modify: `/Users/liuwei/workspace/eye-care-extension/docs/manual-qa-checklist.md`

**Step 1: Write the failing doc checklist**

List the old camera-era claims that must be removed:
- camera permission
- visual detection
- calibration
- blink metrics
- fallback mode / vision mode

**Step 2: Update docs**

Document the new product truth:
- no camera
- active reading accumulation
- reminder every 20 minutes
- default reminder via TTS
- popup is minimal

**Step 3: Review for stale wording**

Search:
```bash
rg -n "摄像头|视觉检测|校准|眨眼|MediaPipe|恢复成功率|当前模式|当前策略" /Users/liuwei/workspace/eye-care-extension
```

Expected:
- no stale user-facing camera-era claims remain in active docs/UI

### Task 7: Run full verification

**Files:**
- Verify the entire workspace state

**Step 1: Run the full test suite**

Run:
```bash
npm test -- --run
```

Expected: PASS

**Step 2: Run static typecheck**

Run:
```bash
npx tsc --noEmit
```

Expected: PASS

**Step 3: Build the extension**

Run:
```bash
npm run build
```

Expected: PASS

**Step 4: Manual Chrome validation**

Reload the unpacked extension and verify:
- no camera permission request appears
- WeRead reader page accumulates reading time only while active
- reminder fires after 20 minutes of accumulated active reading
- reminder overlay appears and TTS is spoken
- popup shows only the minimal state

**Step 5: Commit**

```bash
git add /Users/liuwei/workspace/eye-care-extension
git commit -m "refactor: replace camera workflow with tts reading reminders"
```

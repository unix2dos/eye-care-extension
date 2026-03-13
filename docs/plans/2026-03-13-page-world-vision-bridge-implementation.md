# Page-World Vision Bridge Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move MediaPipe and camera startup into an injected page-world runner while keeping the extension content script in the default isolated world.

**Architecture:** The content script remains the orchestrator for storage, UI, and reminder policy. A new page-world runner owns MediaPipe, camera startup, and sampling; the two sides communicate through DOM custom events with request/response IDs.

**Tech Stack:** Chrome extension MV3, TypeScript, esbuild, Vitest, MediaPipe Tasks Vision

---

### Task 1: Add bridge protocol and failing tests

**Files:**
- Create: `/Users/liuwei/workspace/eye-care-extension/src/content/vision/bridge.test.ts`
- Create: `/Users/liuwei/workspace/eye-care-extension/src/content/vision/bridge.ts`

**Step 1: Write the failing test**

Cover:
- the bridge injects the page runner script once
- requests resolve when the matching response event arrives
- page-side errors are surfaced as rejected promises

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/content/vision/bridge.test.ts`

**Step 3: Write minimal implementation**

Implement:
- script injection helper
- request/response event channel
- `PageVisionBridgeService` with `start`, `sample`, `setBlinkThreshold`, `stop`

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/content/vision/bridge.test.ts`

### Task 2: Add page-world runtime entrypoint

**Files:**
- Create: `/Users/liuwei/workspace/eye-care-extension/src/page/main.ts`
- Create: `/Users/liuwei/workspace/eye-care-extension/src/page/runtime.ts`
- Modify: `/Users/liuwei/workspace/eye-care-extension/src/content/vision/service.ts`

**Step 1: Write the failing test**

Add a runtime-level test that verifies asset URL config is accepted and command handlers produce serialized responses.

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/page/runtime.test.ts`

**Step 3: Write minimal implementation**

Implement:
- page runtime bootstrap from injected script dataset
- bridge event listeners
- page-side `MediaPipeVisionService` usage

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/page/runtime.test.ts`

### Task 3: Wire content bootstrap to the bridge

**Files:**
- Modify: `/Users/liuwei/workspace/eye-care-extension/src/content/main.ts`
- Modify: `/Users/liuwei/workspace/eye-care-extension/src/content/runtime/controller.ts`

**Step 1: Write the failing test**

Add or update a content bootstrap test around the vision service contract if needed.

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/content/runtime/controller.test.ts`

**Step 3: Write minimal implementation**

Swap the direct MediaPipe service construction for the bridge service while preserving:
- startup issue classification
- calibration flow
- reminder sampling loop

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/content/runtime/controller.test.ts`

### Task 4: Update build and manifest wiring

**Files:**
- Modify: `/Users/liuwei/workspace/eye-care-extension/scripts/build.mjs`
- Modify: `/Users/liuwei/workspace/eye-care-extension/public/manifest.json`
- Modify: `/Users/liuwei/workspace/eye-care-extension/src/manifest.test.ts`

**Step 1: Write the failing test**

Extend manifest/build coverage for:
- no `world: MAIN`
- `page/main.js` exposed through `web_accessible_resources`

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/manifest.test.ts`

**Step 3: Write minimal implementation**

Bundle `page/main.ts` and expose it for injection on WeRead pages.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/manifest.test.ts`

### Task 5: Verify end-to-end

**Files:**
- Modify if needed: `/Users/liuwei/workspace/eye-care-extension/docs/principles-and-usage.md`
- Modify if needed: `/Users/liuwei/workspace/eye-care-extension/docs/manual-qa-checklist.md`

**Step 1: Run full verification**

Run:
- `npm test -- --run`
- `npx tsc --noEmit`
- `npm run build`

**Step 2: Reload the unpacked extension in Chrome**

Use `chrome://extensions/?id=iamfdcalifgmaboicpnjndikdgjnecmd` and click Reload.

**Step 3: Validate real WeRead startup**

Expected:
- no immediate `unsafe-eval` startup failure in the isolated content script
- page shows camera startup / calibration flow or a real camera permission/device error

**Step 4: Update docs**

Document the page-world bridge architecture and any revised debugging notes only if they remain useful to end users.

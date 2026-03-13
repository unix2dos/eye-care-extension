# Popup Preview Reminder Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a popup action that previews the real in-page reminder on supported WeRead reading tabs without affecting reminder state.

**Architecture:** Split the feature into two small pieces: a popup-side availability and command helper, and a content-side preview handler that reuses the overlay and tone helpers. Keep preview execution isolated from the controller and stats flows so it cannot mutate reminder state.

**Tech Stack:** TypeScript, Vitest, Chrome Extensions Manifest V3 messaging, existing popup/content modules

---

### Task 1: Add popup preview eligibility and message helpers

**Files:**
- Create: `src/popup/preview.ts`
- Test: `src/popup/preview.test.ts`

**Step 1: Write the failing test**

Add tests that define:
- WeRead reader tabs are preview-capable
- non-WeRead tabs are not preview-capable
- missing tab URL produces the disabled hint

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/popup/preview.test.ts`
Expected: FAIL because the helper does not exist yet.

**Step 3: Write minimal implementation**

Implement a popup helper that derives preview availability and hint text from the active tab URL.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/popup/preview.test.ts`
Expected: PASS

### Task 2: Add a content-side preview command handler

**Files:**
- Create: `src/content/preview.ts`
- Test: `src/content/preview.test.ts`

**Step 1: Write the failing test**

Add tests that define:
- preview shows the real reminder copy
- preview calls the tone helper
- preview auto-hides after the timeout
- preview does not require controller or stats inputs

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/content/preview.test.ts`
Expected: FAIL because the preview handler does not exist yet.

**Step 3: Write minimal implementation**

Implement a small preview runner that takes the overlay, tone helper, and timer APIs as dependencies so it can be tested in isolation.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/content/preview.test.ts`
Expected: PASS

### Task 3: Wire popup and content messaging

**Files:**
- Modify: `src/popup/main.ts`
- Modify: `src/content/main.ts`

**Step 1: Write the failing test**

Extend popup-side tests or add light unit coverage that defines:
- the popup renders the button enabled or disabled from helper output
- the popup sends a `preview-reminder` message only when preview is available

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/popup/preview.test.ts src/content/preview.test.ts`
Expected: FAIL on the new wiring expectations.

**Step 3: Write minimal implementation**

Update the popup to query the active tab, render the preview button, and send a `preview-reminder` command. Update the content script to register a runtime message listener that runs the preview handler.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/popup/preview.test.ts src/content/preview.test.ts`
Expected: PASS

### Task 4: Verify the integrated feature and update docs

**Files:**
- Modify: `README.md`
- Modify: `docs/principles-and-usage.md`
- Modify: `docs/manual-qa-checklist.md`

**Step 1: Write the failing test**

Add manual verification items for:
- popup preview enabled on WeRead
- popup preview disabled on other pages
- preview has no stats side effects

**Step 2: Run verification to confirm the gap**

Run: `rg -n "预览提醒|仅在微信读书阅读页可预览" README.md docs/principles-and-usage.md docs/manual-qa-checklist.md`
Expected: missing or incomplete matches.

**Step 3: Write minimal implementation**

Update docs and the manual checklist to describe the preview action and its no-side-effect behavior.

**Step 4: Run verification to confirm it passes**

Run:

```bash
rg -n "预览提醒|仅在微信读书阅读页可预览" README.md docs/principles-and-usage.md docs/manual-qa-checklist.md
npm test -- --run
npx tsc --noEmit
npm run build
```

Expected: all commands succeed and docs mention the new preview behavior.

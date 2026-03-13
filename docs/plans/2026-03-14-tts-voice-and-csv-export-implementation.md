# TTS Voice And CSV Export Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make reminder speech prefer a Mandarin voice and restore a minimal CSV export in the options page.

**Architecture:** Keep the current no-camera reminder runtime unchanged. Improve only the TTS voice-selection helper, add a focused CSV export utility built from existing daily/per-book stats, and wire a download button into the options page.

**Tech Stack:** Chrome extension MV3, TypeScript, Vitest, Web Speech API, Blob/download URL browser APIs

---

### Task 1: Lock Mandarin voice selection with a failing test

**Files:**
- Modify: `/Users/liuwei/workspace/eye-care-extension/src/content/reminder/tts.test.ts`
- Modify: `/Users/liuwei/workspace/eye-care-extension/src/content/reminder/tts.ts`

**Step 1: Write the failing test**

Cover:
- when multiple voices exist, a `zh-CN / cmn-CN` Mandarin voice is preferred
- if voices are initially empty, the helper can wait briefly for `voiceschanged`

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/content/reminder/tts.test.ts`

**Step 3: Write minimal implementation**

Implement:
- Mandarin voice ranking
- brief voice-list resolution
- stable assignment to `utterance.voice`

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/content/reminder/tts.test.ts`

### Task 2: Restore minimal CSV export with a failing test

**Files:**
- Create: `/Users/liuwei/workspace/eye-care-extension/src/shared/csv.ts`
- Create: `/Users/liuwei/workspace/eye-care-extension/src/shared/csv.test.ts`

**Step 1: Write the failing test**

Cover:
- CSV header is exactly `date,bookTitle,readingMinutes,reminderCount`
- rows are generated from the existing per-day/per-book stats

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/shared/csv.test.ts`

**Step 3: Write minimal implementation**

Implement a CSV exporter that uses only:
- `day.date`
- `book.title`
- `book.readingTimeMs`
- `book.reminderCount`

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/shared/csv.test.ts`

### Task 3: Add the options-page export button

**Files:**
- Modify: `/Users/liuwei/workspace/eye-care-extension/src/options/main.ts`
- Optionally create: `/Users/liuwei/workspace/eye-care-extension/src/options/export.ts`

**Step 1: Write the failing test**

If a pure helper is introduced, test:
- filename generation
- CSV payload handoff

**Step 2: Run test to verify it fails**

Run the focused test command for the new helper.

**Step 3: Write minimal implementation**

Add an `导出 CSV` button in `options` that:
- reads the current stats
- builds the minimal CSV
- downloads it as a local file

**Step 4: Run targeted tests**

Run the relevant focused tests.

### Task 4: Update README and verify end-to-end

**Files:**
- Modify: `/Users/liuwei/workspace/eye-care-extension/README.md`

**Step 1: Update docs**

Document:
- Mandarin-voice preference behavior
- minimal CSV export availability
- current feature list

**Step 2: Run full verification**

Run:
- `npm test -- --run`
- `npx tsc --noEmit`
- `npm run build`

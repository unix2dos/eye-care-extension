# Reminder Status And Strategy Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add readable runtime issue reporting, next eligible reminder status, and reminder strategy presets to the WeRead eye-care extension.

**Architecture:** Extend the shared state model with runtime issue and preset data, derive policy values from a preset lookup, and surface the new status across the content runtime, popup, and options UI. Keep startup error handling centralized so the content runtime can classify failures once and the UI layers can render user-friendly summaries consistently.

**Tech Stack:** TypeScript, Vitest, Chrome Extensions Manifest V3, shared storage/state helpers, MediaPipe startup integration

---

### Task 1: Add shared strategy and runtime issue types

**Files:**
- Modify: `src/shared/types.ts`
- Modify: `src/shared/constants.ts`
- Create: `src/shared/strategy.ts`
- Test: `src/shared/constants.test.ts`
- Test: `src/shared/strategy.test.ts`

**Step 1: Write the failing test**

Add tests that define:
- the available strategy preset ids and labels
- the policy values produced for conservative, standard, and sensitive presets
- the runtime issue ids that UI layers can rely on

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/shared/constants.test.ts src/shared/strategy.test.ts`
Expected: FAIL because the preset definitions and runtime issue types do not exist yet.

**Step 3: Write minimal implementation**

Extend the shared types with `ReminderStrategyPreset` and `RuntimeIssueCode`, keep `DEFAULT_POLICY` aligned with the Standard preset, and implement a strategy helper that returns the effective policy and display copy for each preset.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/shared/constants.test.ts src/shared/strategy.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/shared/types.ts src/shared/constants.ts src/shared/strategy.ts src/shared/constants.test.ts src/shared/strategy.test.ts
git commit -m "feat: add reminder strategy preset model"
```

### Task 2: Persist strategy and runtime issue state

**Files:**
- Modify: `src/shared/types.ts`
- Modify: `src/shared/storage.ts`
- Test: `src/shared/storage.test.ts`

**Step 1: Write the failing test**

Add storage tests that define:
- new persisted state defaults for `strategyPreset` and `lastRuntimeIssue`
- reading existing stored values without breaking older records
- clearing calibration without removing the chosen strategy preset

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/shared/storage.test.ts`
Expected: FAIL on missing state fields or outdated defaults.

**Step 3: Write minimal implementation**

Update persisted state defaults and storage helpers so the extension stores the active strategy preset and the latest runtime issue while preserving backward compatibility with older stored records.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/shared/storage.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/shared/types.ts src/shared/storage.ts src/shared/storage.test.ts
git commit -m "feat: persist reminder strategy and runtime issue state"
```

### Task 3: Classify startup failures and expose next eligible reminder status

**Files:**
- Modify: `src/content/vision/service.ts`
- Modify: `src/content/runtime/controller.ts`
- Modify: `src/content/main.ts`
- Create: `src/content/runtime/issues.ts`
- Test: `src/content/runtime/controller.test.ts`
- Test: `src/content/runtime/issues.test.ts`

**Step 1: Write the failing test**

Add tests that define:
- classification of permission-denied, browser-unsupported, device-unavailable, vision-load-failed, and calibration-failed startup failures
- next eligible reminder timestamp derivation from reminder cooldown state
- a successful runtime startup clearing any prior runtime issue

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/content/runtime/controller.test.ts src/content/runtime/issues.test.ts`
Expected: FAIL because the runtime only returns `vision` or `fallback` without classified issue metadata.

**Step 3: Write minimal implementation**

Introduce a runtime issue classifier, return richer startup results from the runtime controller, compute the next eligible reminder timestamp from cooldown state, and update the content entrypoint to show specific user-readable overlay messages instead of a single generic fallback string.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/content/runtime/controller.test.ts src/content/runtime/issues.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/content/vision/service.ts src/content/runtime/controller.ts src/content/runtime/issues.ts src/content/runtime/controller.test.ts src/content/runtime/issues.test.ts src/content/main.ts
git commit -m "feat: classify runtime startup failures"
```

### Task 4: Show runtime status in popup

**Files:**
- Modify: `src/ui/summary.ts`
- Modify: `src/ui/summary.test.ts`
- Modify: `src/popup/main.ts`

**Step 1: Write the failing test**

Extend the summary/view-model tests to define:
- current strategy label and copy in popup data
- `Ready now` when no cooldown is active
- formatted next eligible reminder time when cooldown is active
- runtime issue summary text when the extension is degraded

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/ui/summary.test.ts`
Expected: FAIL because the popup summary model does not include the new status fields.

**Step 3: Write minimal implementation**

Update the shared summary builder and popup rendering so the popup shows mode, strategy, next eligible reminder status, and any active runtime issue summary.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/ui/summary.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/ui/summary.ts src/ui/summary.test.ts src/popup/main.ts
git commit -m "feat: show reminder status in popup"
```

### Task 5: Add strategy controls and issue guidance to options

**Files:**
- Modify: `src/options/view-model.ts`
- Modify: `src/options/view-model.test.ts`
- Modify: `src/options/main.ts`

**Step 1: Write the failing test**

Extend options view-model tests to define:
- the three strategy choices and their descriptive copy
- the selected strategy state
- detailed runtime issue guidance text for each issue category

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/options/view-model.test.ts`
Expected: FAIL because the options view-model does not expose strategy controls or runtime issue guidance.

**Step 3: Write minimal implementation**

Add options-page strategy controls, persist the selected preset, and render readable runtime issue guidance plus the existing calibration/export actions in a single coherent view.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/options/view-model.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/options/view-model.ts src/options/view-model.test.ts src/options/main.ts
git commit -m "feat: add strategy settings and issue guidance"
```

### Task 6: Verify the integrated feature and update docs

**Files:**
- Modify: `README.md`
- Modify: `docs/principles-and-usage.md`
- Modify: `docs/manual-qa-checklist.md`

**Step 1: Write the failing test**

Define a manual verification checklist for:
- each runtime issue message
- popup next reminder status
- switching between conservative, standard, and sensitive presets

**Step 2: Run verification to confirm the gap**

Run: `rg -n "Ready now|保守|标准|敏感|权限被拒绝|组件加载失败" README.md docs/principles-and-usage.md docs/manual-qa-checklist.md`
Expected: missing or incomplete matches for the new behavior.

**Step 3: Write minimal implementation**

Update the docs and checklist so they explain the new strategy presets, runtime issue messaging, and next eligible reminder status.

**Step 4: Run verification to confirm it passes**

Run: `rg -n "Ready now|保守|标准|敏感|权限被拒绝|组件加载失败" README.md docs/principles-and-usage.md docs/manual-qa-checklist.md`
Expected: matches in the updated docs.

Then run:

```bash
npm test -- --run
npx tsc --noEmit
npm run build
```

Expected: all commands succeed.

**Step 5: Commit**

```bash
git add README.md docs/principles-and-usage.md docs/manual-qa-checklist.md
git commit -m "docs: describe reminder status and strategy presets"
```

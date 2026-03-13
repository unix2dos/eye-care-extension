# Reminder Status And Strategy Design

**Date:** 2026-03-13

**Goal:** Improve reminder transparency and control by exposing the next eligible reminder time, surfacing readable runtime issues, and adding conservative/standard/sensitive reminder presets.

## Context

The current WeRead extension can trigger reminders, degrade to timer mode, and show aggregate stats. Two important gaps remain:

- runtime startup failures collapse into a generic "camera unavailable" message, which hides the real cause
- users cannot see when reminders can fire again or tune reminder aggressiveness

This design adds a lightweight status model and a preset-based strategy model without expanding the MVP into full custom policy editing.

## Product Outcomes

The updated experience should answer three user questions at a glance:

1. What mode is the extension running in right now?
2. When is the earliest moment another reminder can happen?
3. If vision startup failed, what happened and what should I do next?

It should also let users shift reminder aggressiveness using one setting that applies consistently to both vision mode and fallback timer mode.

## Scope

### In Scope

- show `next eligible reminder` status in the popup
- split runtime startup failures into user-readable issue categories
- expose reminder strategy presets in the options page
- show current strategy and runtime issue summary in the popup
- keep the reading-page overlay as the immediate feedback surface

### Out of Scope

- raw exception text or stack traces in the UI
- arbitrary parameter editing
- new supported reading sites
- predictive "next reminder" estimates based on future reading behavior

## Information Architecture

### Reading Page

The reading page remains the immediate feedback surface. It should show short, non-technical messages such as:

- camera permission denied, switched to timer reminders
- camera device unavailable, switched to timer reminders
- vision detection failed to load, switched to timer reminders
- calibration failed, switched to timer reminders

The overlay should stay brief and should not become a detailed debug panel.

### Popup

The popup becomes the quick status surface. It should show:

- current runtime mode
- current strategy preset and a one-line explanation
- next eligible reminder status
- current runtime issue summary, when present

For next eligible reminder:

- if the reminder cooldown is still active, show a formatted time such as `14:32`
- if cooldown has already expired, show `Ready now`

### Options

The options page becomes the control and explanation surface. It should show:

- the three strategy presets with short descriptions
- the current strategy selection
- the latest runtime issue with user guidance
- existing calibration and export controls

## Strategy Presets

The preset model intentionally changes only four policy knobs so the system stays understandable and testable:

- focus threshold
- low-blink sensitivity ratio
- reminder cooldown
- fallback reminder interval

All other policy values remain unchanged.

### Preset Values

| Preset | Focus Threshold | Low Blink Trigger | Reminder Cooldown | Fallback Interval |
| --- | --- | --- | --- | --- |
| Conservative | 30s | observed blink rate <= 50% of baseline | 5 min | 30 min |
| Standard | 20s | observed blink rate <= 60% of baseline | 3 min | 20 min |
| Sensitive | 15s | observed blink rate <= 75% of baseline | 2 min | 15 min |

Preset copy:

- Conservative: less interruption, later reminders
- Standard: balanced reminder timing and accuracy
- Sensitive: earlier reminders, easier to trigger

## Runtime Issue Model

The extension should classify runtime startup issues into a small, user-readable enum:

- `none`
- `permission-denied`
- `browser-unsupported`
- `device-unavailable`
- `vision-load-failed`
- `calibration-failed`

These are product-facing categories, not raw browser errors.

### Mapping Rules

- permission rejection from camera access -> `permission-denied`
- missing `mediaDevices.getUserMedia` support -> `browser-unsupported`
- no camera, camera busy, or hardware unavailable -> `device-unavailable`
- MediaPipe wasm/model initialization failure -> `vision-load-failed`
- calibration flow exits without a usable profile -> `calibration-failed`

Unknown startup failures should map to `vision-load-failed` unless there is a stronger category match.

## State Model

Persisted extension state should expand to support:

- `strategyPreset`
- `lastRuntimeIssue`
- existing `mode`, `calibration`, and `stats`

Transient runtime status should additionally derive:

- `nextEligibleReminderAt`

`nextEligibleReminderAt` is defined as:

- `lastReminderEndedAt + currentPolicy.reminderCooldownMs` while cooldown is active
- otherwise no future timestamp and the UI should render `Ready now`

This is explicitly not a prediction of future user behavior.

## Error Handling

- Reading-page messages should always be user-readable and action-oriented.
- Popup should show a concise issue summary only when an issue exists.
- Options should provide the fuller explanation and the recommended next action.
- A later successful vision startup should overwrite the last visible runtime issue with `none`.

## Testing Expectations

The implementation should add coverage for:

- strategy preset to policy conversion
- next eligible reminder derivation
- runtime issue classification for known startup error categories
- popup and options view-model rendering for strategy, next reminder, and issue states
- content runtime behavior when vision startup fails with different classified reasons

## Acceptance Summary

The feature is accepted when:

1. startup failures are no longer collapsed into one generic camera message
2. popup shows the earliest eligible reminder time or `Ready now`
3. options allows choosing Conservative, Standard, or Sensitive with explanatory copy
4. the chosen preset affects both vision-mode and fallback-mode reminder timing
5. runtime issue summaries stay consistent across reading page, popup, and options

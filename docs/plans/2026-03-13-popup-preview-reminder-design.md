# Popup Preview Reminder Design

**Date:** 2026-03-13

**Goal:** Let users preview the real in-page reminder from the extension popup without affecting reminder stats, cooldowns, or runtime mode.

## Context

The extension already renders a real reading-page overlay and plays a reminder tone when a reminder triggers. Users now need a fast way to preview that UI on demand so they can understand how the reminder looks and sounds, even when vision mode is unavailable.

The preview must run from the popup and target the current WeRead reading page directly.

## Scope

### In Scope

- add a `预览提醒` action to the popup
- enable the action only on supported WeRead reading pages
- send a preview command from the popup to the active WeRead tab
- show the existing overlay and play the existing tone in the page
- auto-hide the preview after a short delay

### Out of Scope

- triggering a real reminder lifecycle
- writing reminder stats
- changing cooldown state
- changing runtime mode or runtime issue state
- supporting preview on non-WeRead pages

## Product Behavior

### Popup

The popup should show a primary action button labeled `预览提醒`.

- if the active tab is a supported WeRead reader URL, the button is enabled
- if the active tab is not a supported WeRead reader URL, the button is disabled
- when disabled, the popup shows `仅在微信读书阅读页可预览`

### Reading Page

When the popup action is triggered on a supported tab:

- the existing top-right reminder overlay should appear
- the existing reminder tone should play
- the preview should auto-hide after a short timeout

The preview message should reuse the production reminder copy:

- `请连续眨眼 3 次，放松一下眼睛。`

## Architecture

Use the popup as the command sender and the existing content script as the command executor.

Flow:

1. popup checks the current active tab URL
2. popup derives whether preview is available
3. popup sends a `preview-reminder` message to the active WeRead tab
4. content script receives the message and runs a lightweight preview path
5. preview path uses existing overlay and tone helpers, but bypasses stats and controller logic

This keeps preview visually accurate while ensuring zero business-state side effects.

## Error Handling

- if the popup cannot find an active tab, preview stays disabled
- if the active tab is unsupported, preview stays disabled with the explanatory hint
- if message delivery fails because the content script is unavailable, the popup should fail quietly and remain usable
- audio playback failures should not block the overlay preview

## Acceptance Summary

The feature is accepted when:

1. popup shows an enabled `预览提醒` button on supported WeRead reader pages
2. popup shows a disabled button plus `仅在微信读书阅读页可预览` on unsupported pages
3. clicking the enabled button shows the real in-page overlay and plays the reminder tone
4. preview auto-hides after a short delay
5. preview does not increment reminder counts, change cooldowns, or mutate runtime state

# Icon And README Screenshots Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a recognizable eye-care Chrome extension icon and update the README with three real, sanitized screenshots that show the popup, options page, and in-reader reminder overlay.

**Architecture:** Create one SVG source icon, export the Chrome icon sizes from it, and wire the assets through the manifest and build output. For screenshots, render real extension UI states from the actual built pages with sanitized content and save the resulting images under a dedicated README assets directory.

**Tech Stack:** SVG, PNG icon assets, Chrome Extension Manifest V3, Playwright/browser screenshots, Markdown

---

### Task 1: Add icon assets

**Files:**
- Create: `assets/branding/icon-eye-care.svg`
- Create: `public/icons/icon-16.png`
- Create: `public/icons/icon-32.png`
- Create: `public/icons/icon-48.png`
- Create: `public/icons/icon-128.png`
- Modify: `public/manifest.json`

**Step 1: Write the failing test**

Verify the manifest is missing icon declarations so the current build does not expose extension icons.

**Step 2: Run test to verify it fails**

Run: `node -e "const m=require('./public/manifest.json'); process.exit(m.icons ? 0 : 1)"`
Expected: exit code `1`

**Step 3: Write minimal implementation**

Design the SVG icon, export the PNG sizes, and wire `icons` plus `action.default_icon` into the manifest.

**Step 4: Run test to verify it passes**

Run: `node -e "const m=require('./public/manifest.json'); process.exit(m.icons && m.action.default_icon ? 0 : 1)"`
Expected: exit code `0`

### Task 2: Generate sanitized README screenshots

**Files:**
- Create: `docs/assets/popup.png`
- Create: `docs/assets/options.png`
- Create: `docs/assets/reminder-overlay.png`
- Modify: `README.md`

**Step 1: Write the failing test**

Verify the README currently does not embed screenshot images.

**Step 2: Run test to verify it fails**

Run: `rg -n "docs/assets/(popup|options|reminder-overlay)\\.png" README.md`
Expected: no matches

**Step 3: Write minimal implementation**

Capture three real screenshots with sanitized content and insert them into a short README screenshots section.

**Step 4: Run test to verify it passes**

Run: `rg -n "docs/assets/(popup|options|reminder-overlay)\\.png" README.md`
Expected: three matches

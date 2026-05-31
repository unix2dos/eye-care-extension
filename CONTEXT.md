# Eye Care Reminder Context

This context defines product language for the browser extension so docs, store copy, and code comments describe the same user-facing boundaries.

## Language

**WeRead Reader Page**:
A WeRead page matching `https://weread.qq.com/web/reader/*`. Built-in default support applies to these reader pages, not every WeRead route.
_Avoid_: WeRead site, all WeRead pages, WeRead default support

**Enabled Site**:
A normal `http/https` origin that the user explicitly grants from the popup. Enabled sites can run the reminder flow until the user removes the permission.
_Avoid_: all websites, auto-enabled site

**Active Eye-Use Time**:
Reading time that counts only while an enabled page is visible, the tab is in front, and recent reading activity is still present.
_Avoid_: wall-clock time, browsing time

**Plan Preview**:
A local free/pro feature-state switch used to verify locked and unlocked behavior. It is not a live billing or subscription system.
_Avoid_: paid subscription, live Pro plan

## Example Dialogue

Dev: "Should the README say WeRead has default support?"

Domain expert: "Use WeRead Reader Page. The default path is reader pages only, while other `http/https` origins become Enabled Sites after explicit permission."

Dev: "Can we say Pro export is available?"

Domain expert: "Say Plan Preview unlocks PDF export locally. Do not imply live billing exists."

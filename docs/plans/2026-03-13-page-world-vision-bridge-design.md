# Page-World Vision Bridge Design

**Problem**

The current visual detection pipeline runs inside the extension content script. That breaks in two different ways:

- MediaPipe's wasm loader does not expose `ModuleFactory` consistently across execution worlds.
- A fallback `eval` / `new Function` workaround is blocked by the extension CSP in the isolated content-script world.

The result is that visual startup fails before `getUserMedia()` is called, so the user sees `视觉检测组件加载失败` instead of a real camera flow.

**Approaches Considered**

1. Keep MediaPipe in the content script and continue patching loader behavior.
   This has already failed twice. The isolated world and extension CSP are the underlying constraint, not a small bug.

2. Move the full visual runtime into a page-world bridge injected from the content script.
   This keeps extension APIs and storage in the isolated world, while running MediaPipe and camera access in the page's JS world where `eval/new Function` is allowed on WeRead. This is the recommended approach.

3. Move the visual runtime into an extension-owned iframe or offscreen document.
   This is more invasive, adds lifecycle and permission complexity, and is unnecessary for the current single-site MVP.

**Chosen Architecture**

Use a two-part visual pipeline:

- The existing content script remains in the default isolated world.
  It keeps:
  - storage access
  - popup messaging
  - reminder overlay and audio
  - reading session logic
  - calibration and reminder policy decisions

- A new injected page-world runner handles:
  - MediaPipe loader bootstrap
  - wasm/model URL usage
  - `getUserMedia()`
  - video playback
  - per-frame face / EAR / blink sampling

The two sides communicate through DOM `CustomEvent` messages with JSON-serializable payloads.

**Bridge Contract**

The content script will send request events with:

- `id`
- `type`
- optional payload

The page-world runner will answer with a matching response event containing:

- `id`
- `ok`
- optional `result`
- optional structured error

Initial commands:

- `start`
- `sample`
- `set-blink-threshold`
- `stop`

This keeps the existing content-side controller logic intact because the bridge service can implement the same `start/sample/stop/setBlinkThreshold` surface as the current `MediaPipeVisionService`.

**Resource Loading**

- Add a new build entry: `page/main.ts`
- Expose the built `page/main.js` through `web_accessible_resources`
- Inject it from the content script with a classic `<script>` tag
- Pass `wasmBaseUrl` and `modelAssetUrl` through `data-*` attributes on the script element so the page script does not depend on `chrome.runtime`

**Error Handling**

- Page-side runtime startup failures are returned as structured errors and reclassified in the content script through the existing runtime issue mapping.
- If page runner injection fails or the runner never acknowledges startup, the bridge returns `vision-load-failed`.
- Existing user-facing copy remains the same, but now the root cause path becomes recoverable.

**Testing**

- Unit-test the bridge request/response flow with a fake document event bus.
- Unit-test the page script config parsing / message dispatch logic where practical.
- Keep existing controller and runtime issue tests unchanged.
- Re-run a real Chrome manual check:
  - reload unpacked extension from `chrome://extensions`
  - open WeRead reader page
  - confirm startup reaches camera request or calibration instead of immediate `vision-load-failed`

**Success Criteria**

- The extension stays in the default isolated world.
- Visual startup no longer fails because of extension CSP `unsafe-eval`.
- WeRead page reaches actual camera startup when the page-world runner is injected successfully.
- Popup preview reminder and existing state/strategy behavior remain intact.

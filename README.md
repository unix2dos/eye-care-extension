# WeRead Eye Care Extension

Chrome extension MVP for blink reminders and local reading stats on WeRead.

Detailed documentation:

- [原理与使用说明](docs/principles-and-usage.md)
- [手工验收清单](docs/manual-qa-checklist.md)

## Current Scope

- Chrome Extension, MV3
- V1 only supports `https://weread.qq.com/web/reader/*`
- Camera frames are analyzed locally only
- Reading stats are stored in local extension storage and can be exported as CSV

## Local Development

```bash
npm install
npm test -- --run
npx tsc --noEmit
npm run build
```

Then load `dist/` via `chrome://extensions` -> `Load unpacked`.

## Notes

- MediaPipe wasm and the face-landmarker model are packaged into `dist/assets/mediapipe`
- The first launch on WeRead asks for camera access and performs local calibration
- If camera access is denied, the extension degrades to timer-based reminders

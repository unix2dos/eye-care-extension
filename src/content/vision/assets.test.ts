import { getVisionAssetUrls } from './assets';

describe('getVisionAssetUrls', () => {
  it('builds local extension URLs for wasm and model assets', () => {
    const urls = getVisionAssetUrls({
      getUrl: (path) => `chrome-extension://demo/${path}`
    });

    expect(urls.wasmBaseUrl).toBe('chrome-extension://demo/assets/mediapipe/wasm');
    expect(urls.modelAssetUrl).toBe('chrome-extension://demo/assets/mediapipe/models/face_landmarker.task');
  });
});

export interface AssetUrlResolver {
  getUrl(path: string): string;
}

export interface VisionAssetUrls {
  wasmBaseUrl: string;
  modelAssetUrl: string;
}

export function getVisionAssetUrls(
  resolver: AssetUrlResolver = {
    getUrl: (path) => chrome.runtime.getURL(path)
  }
): VisionAssetUrls {
  return {
    wasmBaseUrl: resolver.getUrl('assets/mediapipe/wasm'),
    modelAssetUrl: resolver.getUrl('assets/mediapipe/models/face_landmarker.task')
  };
}
